import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAccessConfigured, isAuthenticationRequired, SESSION_COOKIE, verifySessionValue } from "@/lib/auth";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const PUBLIC_PATHS = new Set(["/login", "/api/auth/login", "/api/health", "/api/live", "/api/ready"]);
function secure(response: NextResponse) {
  const developmentEval = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";
  response.headers.set("Content-Security-Policy", `default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' 'unsafe-inline'${developmentEval}; style-src 'self' 'unsafe-inline'; connect-src 'self'`);
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff"); response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}
function reject(request: NextRequest, status: number, message: string) {
  if (request.nextUrl.pathname.startsWith("/api/")) return secure(NextResponse.json({ error: message }, { status }));
  const url = request.nextUrl.clone(); url.pathname = "/login"; url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return secure(NextResponse.redirect(url));
}
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const currentRequestId = request.headers.get("x-request-id") ?? request.headers.get("x-vercel-id") ?? crypto.randomUUID();
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set("x-request-id", currentRequestId);
  const next = () => {
    const response = NextResponse.next({ request: { headers: forwardedHeaders } });
    response.headers.set("x-request-id", currentRequestId);
    console.log(JSON.stringify({ level: "info", service: "project-command-center", event: "request.accepted", requestId: currentRequestId, method: request.method, path }));
    return secure(response);
  };
  if (!SAFE_METHODS.has(request.method)) {
    const origin = request.headers.get("origin");
    if (!origin || origin !== request.nextUrl.origin) return reject(request, 403, "This request did not come from this application.");
  }
  if (!isAuthenticationRequired() || PUBLIC_PATHS.has(path)) return next();
  if (!isAccessConfigured()) return reject(request, 503, "Owner access has not been configured.");
  if (!await verifySessionValue(request.cookies.get(SESSION_COOKIE)?.value)) return reject(request, 401, "Sign in to continue.");
  return next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };

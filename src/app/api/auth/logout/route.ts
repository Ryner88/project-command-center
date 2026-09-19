import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { observedRoute } from "@/lib/observability";
export const POST = observedRoute("auth.logout", async () => {
  const response = NextResponse.json({ data: { authenticated: false } });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
});

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSessionValue, isAccessConfigured, passwordMatches, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
const loginSchema = z.object({ password: z.string().min(1).max(512) });
export async function POST(request: NextRequest) {
  if (!isAccessConfigured()) return NextResponse.json({ error: "Owner access has not been configured." }, { status: 503 });
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !await passwordMatches(parsed.data.password)) return NextResponse.json({ error: "The password is incorrect." }, { status: 401 });
  const response = NextResponse.json({ data: { authenticated: true } });
  response.cookies.set(SESSION_COOKIE, await createSessionValue(), sessionCookieOptions);
  return response;
}

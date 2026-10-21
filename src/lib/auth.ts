export const SESSION_COOKIE = "pcc_session";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 12;

function accessPassword() {
  return process.env.APP_ACCESS_PASSWORD ?? "";
}
function sessionSecret() {
  return process.env.SESSION_SECRET ?? accessPassword();
}
function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}
function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1)
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export function isAccessConfigured() {
  return Boolean(accessPassword() && sessionSecret());
}
export function isAuthenticationRequired() {
  return process.env.NODE_ENV === "production" || isAccessConfigured();
}
export async function passwordMatches(candidate: string) {
  const expected = accessPassword();
  return Boolean(expected) && safeEqual(await sign(candidate), await sign(expected));
}
export async function createSessionValue(now = Date.now()) {
  const expiresAt = now + SESSION_LIFETIME_SECONDS * 1000;
  const payload = `owner.${expiresAt}`;
  return `${payload}.${await sign(payload)}`;
}
export async function verifySessionValue(value?: string, now = Date.now()) {
  if (!value || !isAccessConfigured()) return false;
  const [owner, expiresAt, signature] = value.split(".");
  if (owner !== "owner" || !expiresAt || !signature || Number(expiresAt) <= now) return false;
  return safeEqual(signature, await sign(`${owner}.${expiresAt}`));
}
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_LIFETIME_SECONDS
};
export async function getCurrentUserId() {
  return "demo-user";
}

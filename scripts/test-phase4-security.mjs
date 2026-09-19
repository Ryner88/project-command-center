import assert from "node:assert/strict";
import { chromium, request } from "playwright";
import { PrismaClient } from "@prisma/client";

const baseURL = process.env.TEST_BASE_URL;
const password = process.env.APP_ACCESS_PASSWORD;
if (!baseURL || !password) throw new Error("TEST_BASE_URL and APP_ACCESS_PASSWORD are required");
const browser = await chromium.launch({ headless: true });
const anonymous = await request.newContext({ baseURL });
const page = await browser.newPage();
const prisma = new PrismaClient();
try {
  const blocked = await anonymous.get("/projects", { maxRedirects: 0 });
  assert.equal(blocked.status(), 307, "anonymous pages should redirect to sign in");
  const apiBlocked = await anonymous.get("/api/projects");
  assert.equal(apiBlocked.status(), 401, "anonymous APIs should be rejected");

  await page.goto(`${baseURL}/projects`);
  await page.waitForURL(/\/login/);
  await page.getByLabel("Password").fill("wrong password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("alert").waitFor();
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/projects$/);

  const headers = await page.request.get(`${baseURL}/api/projects`);
  assert.equal(headers.headers()["x-frame-options"], "DENY");
  assert.match(headers.headers()["content-security-policy"], /frame-ancestors 'none'/);

  const cookies = await page.context().cookies();
  const session = cookies.find(cookie => cookie.name === "pcc_session");
  assert.equal(session?.httpOnly, true);
  assert.equal(session?.sameSite, "Strict");
  assert.equal(session?.secure, process.env.EXPECT_SECURE_COOKIE !== "false");

  const hostile = await request.newContext({
    baseURL,
    extraHTTPHeaders: { origin: "https://attacker.invalid", cookie: `pcc_session=${session?.value}` }
  });
  const csrf = await hostile.post("/api/projects", { data: { name: "Blocked", clientName: "Blocked", description: "Blocked cross-site request" } });
  assert.equal(csrf.status(), 403, "cross-origin mutation should be rejected");
  await hostile.dispose();

  const name = `Security Test ${Date.now()}`;
  await page.getByLabel("Project name").fill(name);
  await page.getByLabel("Client").fill("Security Client");
  await page.getByLabel("Description").fill("Verify the protected owner workflow and audit trail.");
  await page.getByRole("button", { name: "Create project" }).click();
  await page.waitForURL(/\/projects\/[a-z0-9]+$/);
  const projectId = page.url().split("/").pop();
  assert.ok(await prisma.auditEvent.findFirst({ where: { action: "project.created", entityId: projectId } }), "project creation should be audited");

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL(/\/login/);
  assert.equal((await page.request.get(`${baseURL}/api/projects`)).status(), 401);
  console.log("Phase 4 authentication, CSRF, headers, audit trail, and sign-out checks passed");
} finally {
  await prisma.$disconnect();
  await anonymous.dispose();
  await browser.close();
}

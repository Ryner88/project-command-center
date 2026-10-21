import { chromium } from "playwright";
import assert from "node:assert/strict";

const baseURL = process.env.TEST_BASE_URL;
if (!baseURL) throw new Error("TEST_BASE_URL is required");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const name = `E2E Project ${Date.now()}`;
try {
  await page.goto(`${baseURL}/projects`);
  if (process.env.APP_ACCESS_PASSWORD && /\/login/.test(page.url())) {
    const login = await page.request.post(`${baseURL}/api/auth/login`, {
      data: { password: process.env.APP_ACCESS_PASSWORD },
      headers: { origin: baseURL }
    });
    assert.equal(login.status(), 200, "owner sign-in should succeed");
    await page.goto(`${baseURL}/projects`);
  }
  const createProject = page.getByRole("form", { name: "Create project" });
  await createProject.getByLabel("Project name").fill(name);
  await createProject.getByLabel("Client").fill("E2E Client");
  await createProject
    .getByLabel("Description")
    .fill("Build and launch an account portal with reporting.");
  await createProject.getByLabel("Priority").selectOption("HIGH");
  await createProject.getByLabel("Status").selectOption("ACTIVE");
  await createProject.getByRole("button", { name: "Create project" }).click();
  await page.waitForURL(/\/projects\/[a-z0-9]+$/);
  const projectUrl = page.url();
  await page.getByPlaceholder("Task title").fill("Confirm reporting requirements");
  await page.getByRole("button", { name: "Add task" }).click();
  await page.getByRole("button", { name: "Complete" }).click();
  await page.getByRole("link", { name: "Create proposal from project" }).click();
  await page.getByLabel("Project domain").selectOption("SAAS_SOFTWARE");
  await page.getByRole("button", { name: "Generate proposal" }).click();
  await page.waitForURL(/\/proposals\/[a-z0-9]+$/, { timeout: 30000 });
  const proposalId = page.url().split("/").pop();
  await page.locator('input[name="title"]').fill("E2E Client Portal Proposal v2");
  await page.getByRole("button", { name: "Save new version" }).click();
  await page.getByText("Version 1").waitFor();
  const created = await page.request.post(`${baseURL}/api/proposals/${proposalId}/export`, {
    headers: { origin: baseURL }
  });
  assert.equal(created.ok(), true);
  const exported = await page.request.get(`${baseURL}/api/proposals/${proposalId}/export/download`);
  assert.equal(exported.headers()["content-type"].startsWith("text/html"), true);
  await page.goto(projectUrl);
  const [archived] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/projects/") && response.request().method() === "PATCH"
    ),
    page.getByRole("button", { name: "Archive project" }).click()
  ]);
  assert.equal(archived.ok(), true, "project archive should finish before navigation");
  await page.goto(`${baseURL}/projects?archived=true&q=${encodeURIComponent(name)}`);
  await page.getByText(name).waitFor();
  console.log(
    "Phase 3 project, task, proposal, version, export, search, and archive workflow passed"
  );
} finally {
  await browser.close();
}

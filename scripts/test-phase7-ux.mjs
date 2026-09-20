import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const baseURL = process.env.TEST_BASE_URL;
if (!baseURL) throw new Error("TEST_BASE_URL is required");
const artifactDir = process.env.UX_ARTIFACT_DIR ?? "/tmp/pcc-phase7";
await mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

try {
  if (process.env.APP_ACCESS_PASSWORD) {
    const login = await page.request.post(`${baseURL}/api/auth/login`, {
      data: { password: process.env.APP_ACCESS_PASSWORD },
      headers: { origin: baseURL }
    });
    assert.equal(login.status(), 200, "owner sign-in should succeed");
  }

  const pages = ["/", "/projects", "/proposals"];
  for (const route of pages) {
    const response = await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle" });
    assert.equal(response?.ok(), true, `${route} returned HTTP ${response?.status()}`);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const blocking = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? "")
    );
    assert.deepEqual(
      blocking.map(({ id, impact, help, nodes }) => ({
        id,
        impact,
        help,
        nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary }))
      })),
      [],
      `${route} has serious or critical accessibility violations`
    );
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, `${route} overflows the mobile viewport by ${overflow}px`);
  }

  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").innerText(), "Skip to main content");
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(":focus").getAttribute("id"), "main-content");
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: path.join(artifactDir, "phase-7-mobile-home.png"),
    fullPage: true
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}/proposals`, { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(artifactDir, "phase-7-desktop-proposals.png"),
    fullPage: true
  });
  const samples = [];
  for (let sample = 0; sample < 3; sample += 1) {
    const startedAt = Date.now();
    await page.reload({ waitUntil: "load" });
    samples.push(Date.now() - startedAt);
  }
  samples.sort((left, right) => left - right);
  const duration = samples[1];
  assert.ok(duration < 3000, `warm proposal navigation took ${Math.round(duration)}ms`);

  console.log(
    `Phase 7 accessibility, keyboard, responsive, and performance checks passed (${Math.round(duration)}ms median warm load; samples: ${samples.join(", ")}ms)`
  );
} finally {
  await browser.close();
}

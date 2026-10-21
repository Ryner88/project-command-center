import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSessionValue, passwordMatches, verifySessionValue } from "@/lib/auth";

describe("owner session", () => {
  beforeEach(() => {
    process.env.APP_ACCESS_PASSWORD = "correct horse battery staple";
    process.env.SESSION_SECRET = "a separate test signing secret";
  });
  afterEach(() => {
    delete process.env.APP_ACCESS_PASSWORD;
    delete process.env.SESSION_SECRET;
  });
  it("accepts the configured password", async () => {
    expect(await passwordMatches("correct horse battery staple")).toBe(true);
    expect(await passwordMatches("incorrect")).toBe(false);
  });
  it("rejects expired and changed sessions", async () => {
    const session = await createSessionValue(1_000);
    expect(await verifySessionValue(session, 2_000)).toBe(true);
    expect(await verifySessionValue(`${session}changed`, 2_000)).toBe(false);
    expect(await verifySessionValue(session, 50_000_000)).toBe(false);
  });
});

import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getReliabilitySnapshot, observedRoute, retryRead } from "@/lib/observability";

describe("operation monitoring", () => {
  beforeEach(() => {
    global.reliabilityState = undefined;
    vi.restoreAllMocks();
  });

  it("returns correlation IDs and records successful work", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const route = observedRoute("test.success", async () => NextResponse.json({ ok: true }));
    const response = await route(
      new NextRequest("http://localhost/api/test", { headers: { "x-request-id": "request-123" } })
    );
    expect(response.headers.get("x-request-id")).toBe("request-123");
    expect(response.headers.get("x-operation-id")).toBeTruthy();
    expect(getReliabilitySnapshot().completed).toBe(1);
  });

  it("returns a safe error and records the failure without its message", async () => {
    const errors: string[] = [];
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation((value) => errors.push(String(value)));
    const route = observedRoute("test.failure", async () => {
      throw new Error("client secret value");
    });
    const response = await route(new NextRequest("http://localhost/api/test"));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: "The service could not complete this request."
    });
    expect(errors.join(" ")).not.toContain("client secret value");
    expect(getReliabilitySnapshot().failed).toBe(1);
  });

  it("adds the request ID to handled server errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const route = observedRoute("test.unavailable", async () =>
      NextResponse.json({ error: "Service unavailable." }, { status: 503 })
    );
    const response = await route(
      new NextRequest("http://localhost/api/test", { headers: { "x-request-id": "request-503" } })
    );
    await expect(response.json()).resolves.toEqual({
      error: "Service unavailable.",
      requestId: "request-503"
    });
    expect(response.headers.get("x-request-id")).toBe("request-503");
  });

  it("retries a safe read and returns after recovery", async () => {
    const work = vi.fn().mockRejectedValueOnce(new Error("temporary")).mockResolvedValue("ready");
    await expect(retryRead(work)).resolves.toBe("ready");
    expect(work).toHaveBeenCalledTimes(2);
  });
});

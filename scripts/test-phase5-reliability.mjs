import assert from "node:assert/strict";
import { request } from "playwright";

const baseURL = process.env.TEST_BASE_URL;
const password = process.env.APP_ACCESS_PASSWORD;
const expected = process.env.EXPECT_READINESS ?? "ready";
if (!baseURL || !password) throw new Error("TEST_BASE_URL and APP_ACCESS_PASSWORD are required");
const api = await request.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } });
try {
  const live = await api.get("/api/live");
  assert.equal(live.status(), 200, "liveness should stay available");
  const ready = await api.get("/api/ready");
  assert.equal(ready.status(), expected === "ready" ? 200 : 503);

  const login = await api.post("/api/auth/login", { data: { password } });
  assert.equal(login.status(), 200);
  if (expected === "ready") {
    const malformed = await api.post("/api/projects", { data: { name: "x" } });
    assert.equal(malformed.status(), 400, "malformed input should return 400");
    assert.ok(malformed.headers()["x-request-id"]);
    assert.ok(malformed.headers()["x-operation-id"]);
    const diagnostics = await api.get("/api/diagnostics");
    assert.equal(diagnostics.status(), 200);
    const body = await diagnostics.json();
    assert.equal(body.readiness.ready, true);
    assert.equal(typeof body.reliability.uptimeSeconds, "number");
  } else {
    const failed = await api.get("/api/projects");
    assert.equal(failed.status(), 500, "database-backed request should fail safely");
    const body = await failed.json();
    assert.equal(body.error, "The service could not complete this request.");
    assert.ok(body.requestId);
  }
  console.log(`Phase 5 ${expected} reliability checks passed`);
} finally { await api.dispose(); }

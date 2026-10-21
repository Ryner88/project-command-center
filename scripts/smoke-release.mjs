import assert from "node:assert/strict";
import { request } from "playwright";

const baseURL = process.env.SMOKE_BASE_URL;
const password = process.env.SMOKE_ACCESS_PASSWORD;
if (!baseURL) throw new Error("SMOKE_BASE_URL is required");
const api = await request.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } });
try {
  const live = await api.get("/api/live");
  assert.equal(live.status(), 200, "liveness failed");
  assert.ok(live.headers()["x-request-id"], "liveness did not return a request ID");
  const ready = await api.get("/api/ready");
  assert.equal(ready.status(), 200, "readiness failed");
  if (password) {
    const login = await api.post("/api/auth/login", { data: { password } });
    assert.equal(login.status(), 200, "owner sign-in failed");
    const projects = await api.get("/api/projects");
    assert.equal(projects.status(), 200, "authenticated project read failed");
    const diagnostics = await api.get("/api/diagnostics");
    assert.equal(diagnostics.status(), 200, "diagnostics failed");
    const diagnosticBody = await diagnostics.json();
    if (process.env.EXPECTED_BUILD_ID)
      assert.equal(diagnosticBody.buildId, process.env.EXPECTED_BUILD_ID, "unexpected build ID");
  }
  console.log(`Release smoke test passed for ${baseURL}`);
} finally {
  await api.dispose();
}

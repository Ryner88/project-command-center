import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type OperationContext = { operation: string; operationId: string; requestId: string; startedAt: number };
type FailureSummary = { operation: string; operationId: string; requestId: string; status: number; timestamp: string };
type ReliabilityState = { startedAt: number; completed: number; failed: number; lastFailure: FailureSummary | null };

declare global { var reliabilityState: ReliabilityState | undefined; }

function state() {
  global.reliabilityState ??= { startedAt: Date.now(), completed: 0, failed: 0, lastFailure: null };
  return global.reliabilityState;
}

function write(level: "info" | "error", event: Record<string, unknown>) {
  const line = JSON.stringify({ level, service: "project-command-center", timestamp: new Date().toISOString(), ...event });
  if (level === "error") console.error(line); else console.log(line);
}

export function requestId(request: Request) {
  return request.headers.get("x-request-id") ?? request.headers.get("x-vercel-id") ?? crypto.randomUUID();
}

export function observedRoute<TArgs extends unknown[]>(
  operation: string,
  handler: (request: NextRequest, ...args: TArgs) => Promise<Response>
) {
  return async (request: NextRequest, ...args: TArgs) => {
    const context: OperationContext = { operation, operationId: crypto.randomUUID(), requestId: requestId(request), startedAt: Date.now() };
    write("info", { event: "operation.started", ...context, startedAt: undefined });
    try {
      const response = await handler(request, ...args);
      const current = state();
      if (response.status >= 500) {
        current.failed += 1;
        current.lastFailure = { operation, operationId: context.operationId, requestId: context.requestId, status: response.status, timestamp: new Date().toISOString() };
      } else current.completed += 1;
      write(response.status >= 500 ? "error" : "info", { event: "operation.finished", operation, operationId: context.operationId, requestId: context.requestId, status: response.status, durationMs: Date.now() - context.startedAt });
      response.headers.set("x-request-id", context.requestId);
      response.headers.set("x-operation-id", context.operationId);
      return response;
    } catch (error) {
      const current = state(); current.failed += 1;
      current.lastFailure = { operation, operationId: context.operationId, requestId: context.requestId, status: 500, timestamp: new Date().toISOString() };
      write("error", { event: "operation.failed", operation, operationId: context.operationId, requestId: context.requestId, status: 500, errorType: error instanceof Error ? error.name : "UnknownError", durationMs: Date.now() - context.startedAt });
      const response = NextResponse.json({ error: "The service could not complete this request.", requestId: context.requestId }, { status: 500 });
      response.headers.set("x-request-id", context.requestId);
      response.headers.set("x-operation-id", context.operationId);
      return response;
    }
  };
}

export function getReliabilitySnapshot() {
  const current = state();
  return { ...current, uptimeSeconds: Math.floor((Date.now() - current.startedAt) / 1000) };
}

export async function retryRead<T>(work: () => Promise<T>, attempts = 3) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try { return await work(); } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, attempt * 75));
    }
  }
  throw lastError;
}

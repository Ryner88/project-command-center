"use client";
import { FormEvent, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    setError("");
    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(result?.error ?? "Sign in failed.");
        return;
      }
      const next = params.get("next");
      router.replace((next?.startsWith("/") && !next.startsWith("//") ? next : "/") as never);
      router.refresh();
    });
  }
  return (
    <form className="frame stack login-card" onSubmit={submit}>
      <div className="section-head">
        <span className="eyebrow">Owner access</span>
        <h1>Sign in to Project Command Center</h1>
        <p>Enter the workspace password to continue.</p>
      </div>
      <label className="input-group">
        <span className="field-label">Password</span>
        <input autoComplete="current-password" name="password" required type="password" />
      </label>
      <button className="cta" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

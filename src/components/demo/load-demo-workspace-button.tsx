"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LoadDemoWorkspaceButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function load() {
    setError("");
    startTransition(async () => {
      const response = await fetch("/api/demo/load", { method: "POST" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Could not load the demo workspace.");
        return;
      }
      router.push("/proposals");
      router.refresh();
    });
  }

  return (
    <div className="stack demo-loader">
      <button className="ghost-button" disabled={pending} onClick={load} type="button">
        {pending ? "Loading demo…" : "Load demo workspace"}
      </button>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

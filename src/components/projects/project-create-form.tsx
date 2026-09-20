"use client";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
export function ProjectCreateForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    start(async () => {
      const r = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(f))
      });
      if (!r.ok) {
        setError((await r.json()).error ?? "Could not create project.");
        return;
      }
      const { data } = await r.json();
      router.push(`/projects/${data.id}` as never);
      router.refresh();
    });
  }
  return (
    <form className="frame stack" onSubmit={submit}>
      <div className="section-head">
        <span className="eyebrow">New project</span>
        <h2>Create a working project</h2>
      </div>
      <label className="input-group">
        <span className="field-label">Project name</span>
        <input name="name" required maxLength={160} />
      </label>
      <label className="input-group">
        <span className="field-label">Client</span>
        <input name="clientName" required maxLength={160} />
      </label>
      <label className="input-group">
        <span className="field-label">Description</span>
        <textarea name="description" required rows={4} />
      </label>
      <div className="grid two">
        <label className="input-group">
          <span className="field-label">Priority</span>
          <select name="priority" defaultValue="MEDIUM">
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
            <option>URGENT</option>
          </select>
        </label>
        <label className="input-group">
          <span className="field-label">Status</span>
          <select name="status" defaultValue="PLANNING">
            <option>PLANNING</option>
            <option>ACTIVE</option>
            <option>ON_HOLD</option>
            <option>COMPLETED</option>
            <option>CANCELLED</option>
          </select>
        </label>
      </div>
      <button className="cta" disabled={pending}>
        {pending ? "Creating…" : "Create project"}
      </button>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

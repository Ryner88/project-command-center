"use client";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Proposal } from "@/types/proposal";
const fields = ["scope", "deliverables", "taskBreakdown", "risks", "assumptions"] as const;
export function ProposalEditor({
  proposal,
  versions
}: {
  proposal: Proposal;
  versions: { id: string; version: number; createdAt: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      title: f.get("title"),
      summary: f.get("summary"),
      priceRange: f.get("priceRange"),
      timeline: f.get("timeline")
    };
    for (const key of fields)
      body[key] = String(f.get(key) ?? "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
    start(async () => {
      const r = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!r.ok) setError((await r.json()).error ?? "Proposal could not be saved.");
      else router.refresh();
    });
  }
  return (
    <section className="frame stack">
      <div className="section-head">
        <span className="eyebrow">Edit and version</span>
        <h2>Keep the proposal current</h2>
      </div>
      <form className="stack" onSubmit={submit}>
        <input name="title" defaultValue={proposal.title} required />
        <textarea name="summary" defaultValue={proposal.summary} rows={5} required />
        <div className="grid two">
          <input name="priceRange" defaultValue={proposal.priceRange} required />
          <input name="timeline" defaultValue={proposal.timeline} />
        </div>
        {fields.map((k) => (
          <label className="input-group" key={k}>
            <span className="field-label">{k.replace(/([A-Z])/g, " $1")}</span>
            <textarea name={k} defaultValue={proposal[k].join("\n")} rows={4} />
          </label>
        ))}
        <button className="cta" disabled={pending}>
          {pending ? "Saving…" : "Save new version"}
        </button>
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
      </form>
      <div>
        <strong>Saved history</strong>
        {versions.length ? (
          <ul>
            {versions.map((v) => (
              <li key={v.id}>
                Version {v.version} · {new Date(v.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">The first edit will create the first history entry.</p>
        )}
      </div>
    </section>
  );
}

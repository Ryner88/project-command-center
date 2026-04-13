"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ProposalGeneratorFormProps = {
  proposalSeedId: string;
  initialTitle: string;
  initialClientName: string;
  initialProjectType: string;
  initialSummary: string;
};

export function ProposalGeneratorForm({
  proposalSeedId,
  initialTitle,
  initialClientName,
  initialProjectType,
  initialSummary
}: ProposalGeneratorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="form"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const payload = {
          proposalSeedId,
          title: String(formData.get("title") ?? ""),
          clientName: String(formData.get("clientName") ?? ""),
          projectType: String(formData.get("projectType") ?? ""),
          summary: String(formData.get("summary") ?? "")
        };

        startTransition(async () => {
          const response = await fetch("/api/proposals/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            setError("Proposal generation failed.");
            return;
          }

          const result = (await response.json()) as { data: { id: string } };
          router.push(`/proposals?generated=${result.data.id}`);
          router.refresh();
        });
      }}
    >
      <label className="input-group">
        <span className="field-label">Proposal title</span>
        <input name="title" defaultValue={initialTitle} placeholder="Proposal title" />
      </label>
      <div className="grid two">
        <label className="input-group">
          <span className="field-label">Client</span>
          <input
            name="clientName"
            defaultValue={initialClientName}
            placeholder="Client name"
          />
        </label>
        <label className="input-group">
          <span className="field-label">Project type</span>
          <input
            name="projectType"
            defaultValue={initialProjectType}
            placeholder="Project type"
          />
        </label>
      </div>
      <label className="input-group">
        <span className="field-label">Seed summary</span>
        <textarea
          name="summary"
          defaultValue={initialSummary}
          placeholder="Describe the project"
          rows={8}
        />
      </label>
      <button className="cta" disabled={isPending} type="submit">
        {isPending ? "Generating..." : "Generate proposal"}
      </button>
      {error ? <p className="muted">{error}</p> : null}
    </form>
  );
}

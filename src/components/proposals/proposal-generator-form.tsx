"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ProposalGeneratorFormProps = {
  proposalSeedId?: string;
  initialTitle: string;
  initialClientName: string;
  initialProjectType: string;
  initialSummary: string;
  initialRawRequest?: string;
};

export function ProposalGeneratorForm({
  proposalSeedId,
  initialTitle,
  initialClientName,
  initialProjectType,
  initialSummary,
  initialRawRequest = ""
}: ProposalGeneratorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [clientName, setClientName] = useState(initialClientName);
  const [projectType, setProjectType] = useState(initialProjectType);
  const [summary, setSummary] = useState(initialSummary);
  const [rawRequest, setRawRequest] = useState(initialRawRequest);

  function readOptionalField(value: string) {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  function buildPayload() {
    return {
      proposalSeedId: proposalSeedId || undefined,
      title: readOptionalField(title),
      clientName: readOptionalField(clientName),
      projectType: readOptionalField(projectType),
      summary: readOptionalField(summary),
      rawRequest: readOptionalField(rawRequest)
    };
  }

  return (
    <form
      className="form"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        const payload = buildPayload();

        if (!payload.summary && !payload.rawRequest) {
          setError("Enter proposal notes or a working summary.");
          return;
        }

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
          router.push(`/proposals/${result.data.id}`);
          router.refresh();
        });
      }}
    >
      <label className="input-group">
        <span className="field-label">Proposal title</span>
        <input
          name="title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Proposal title"
          value={title}
        />
      </label>
      <div className="grid two">
        <label className="input-group">
          <span className="field-label">Client</span>
          <input
            name="clientName"
            onChange={(event) => setClientName(event.target.value)}
            placeholder="Client name"
            value={clientName}
          />
        </label>
        <label className="input-group">
          <span className="field-label">Project type</span>
          <input
            name="projectType"
            onChange={(event) => setProjectType(event.target.value)}
            placeholder="Project type"
            value={projectType}
          />
        </label>
      </div>
      <label className="input-group">
        <span className="field-label">Edited client request or proposal notes</span>
        <textarea
          name="rawRequest"
          onChange={(event) => setRawRequest(event.target.value)}
          placeholder="Paste the client's request or type your own proposal notes"
          rows={6}
          value={rawRequest}
        />
      </label>
      <label className="input-group">
        <span className="field-label">Edited summary used for generation</span>
        <textarea
          name="summary"
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Describe the project"
          rows={8}
          value={summary}
        />
      </label>
      <button className="cta" disabled={isPending} type="submit">
        {isPending ? "Generating..." : "Generate proposal"}
      </button>
      {error ? <p className="muted">{error}</p> : null}
    </form>
  );
}

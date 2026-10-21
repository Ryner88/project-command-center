"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { proposalDomainOptions, type ProposalDomain } from "@/lib/proposal-domain";
import { validateProposalDeadline } from "@/lib/proposal-schedule";

type ProposalGeneratorFormProps = {
  proposalSeedId?: string;
  projectId?: string;
  initialTitle: string;
  initialClientName: string;
  initialStartDate?: string;
  initialDueDate?: string;
  initialProjectType: string;
  initialProjectDomain?: ProposalDomain;
  initialProjectDomainOther?: string;
  initialSummary: string;
  initialRawRequest?: string;
};

type ApiErrorResponse = {
  error?: string;
  details?: string[];
};

export function ProposalGeneratorForm({
  proposalSeedId,
  projectId,
  initialTitle,
  initialClientName,
  initialStartDate = "",
  initialDueDate = "",
  initialProjectType,
  initialProjectDomain,
  initialProjectDomainOther = "",
  initialSummary,
  initialRawRequest = ""
}: ProposalGeneratorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [clientName, setClientName] = useState(initialClientName);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [projectType, setProjectType] = useState(initialProjectType);
  const [projectDomain, setProjectDomain] = useState(initialProjectDomain ?? "");
  const [projectDomainOther, setProjectDomainOther] = useState(initialProjectDomainOther);
  const [summary, setSummary] = useState(initialSummary);
  const [rawRequest, setRawRequest] = useState(initialRawRequest);

  function readOptionalField(value: string) {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  function buildPayload() {
    return {
      proposalSeedId: proposalSeedId || undefined,
      projectId: projectId || undefined,
      title: readOptionalField(title),
      clientName: readOptionalField(clientName),
      startDate: readOptionalField(startDate),
      dueDate: readOptionalField(dueDate),
      projectType: readOptionalField(projectType),
      projectDomain: readOptionalField(projectDomain) as ProposalDomain | undefined,
      projectDomainOther:
        projectDomain === "OTHER" ? readOptionalField(projectDomainOther) : undefined,
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

        if (!payload.proposalSeedId) {
          if (!payload.clientName) {
            setError("Enter the client name.");
            return;
          }

          if (!payload.projectType) {
            setError("Enter the project type.");
            return;
          }

          if (!payload.projectDomain) {
            setError("Select a project domain.");
            return;
          }
        }

        if (payload.projectDomain === "OTHER" && !payload.projectDomainOther) {
          setError("Enter the custom project domain.");
          return;
        }

        const deadlineValidationError = validateProposalDeadline(
          payload.dueDate,
          payload.startDate
        );

        if (deadlineValidationError) {
          setError(deadlineValidationError);
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
            const result = (await response.json().catch(() => null)) as ApiErrorResponse | null;

            setError(
              result?.details?.length
                ? `${result.error ?? "Proposal generation failed."} ${result.details.join(" ")}`
                : (result?.error ?? "Proposal generation failed.")
            );
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
            placeholder="Project type, product, or engagement"
            value={projectType}
          />
        </label>
      </div>
      <label className="input-group">
        <span className="field-label">Requested start date</span>
        <input
          name="startDate"
          onChange={(event) => setStartDate(event.target.value)}
          type="date"
          value={startDate}
        />
      </label>
      <label className="input-group">
        <span className="field-label">Deadline</span>
        <input
          name="dueDate"
          onChange={(event) => setDueDate(event.target.value)}
          type="date"
          value={dueDate}
        />
      </label>
      <label className="input-group">
        <span className="field-label">Project domain</span>
        <select
          aria-label="Project domain"
          name="projectDomain"
          onChange={(event) => {
            const nextValue = event.target.value;
            setProjectDomain(nextValue);

            if (nextValue !== "OTHER") {
              setProjectDomainOther("");
            }
          }}
          value={projectDomain}
        >
          <option disabled value="">
            Select project domain
          </option>
          {proposalDomainOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {projectDomain === "OTHER" ? (
        <label className="input-group">
          <span className="field-label">Custom project domain</span>
          <input
            name="projectDomainOther"
            onChange={(event) => setProjectDomainOther(event.target.value)}
            placeholder="Example: Logistics, hospitality, nonprofit, real estate"
            value={projectDomainOther}
          />
        </label>
      ) : null}
      <label className="input-group">
        <span className="field-label">Working request or source notes</span>
        <textarea
          name="rawRequest"
          onChange={(event) => setRawRequest(event.target.value)}
          placeholder="Paste the client request or type the source notes you want the generator to follow"
          rows={6}
          value={rawRequest}
        />
      </label>
      <label className="input-group">
        <span className="field-label">Summary used for generation</span>
        <textarea
          name="summary"
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Describe the project in a concise, decision-ready summary"
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

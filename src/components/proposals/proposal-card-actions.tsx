"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { ProposalStatus } from "@/types/proposal";

type ProposalCardActionsProps = {
  proposalId: string;
  currentStatus: ProposalStatus;
};

type ExportResponse = {
  data: {
    filePath: string;
  };
};

type RouteErrorResponse = {
  error?: string;
  details?: string[];
};

export function ProposalCardActions({ proposalId, currentStatus }: ProposalCardActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ProposalStatus>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPdfFallback, setShowPdfFallback] = useState(false);
  const [isPending, startTransition] = useTransition();

  const runRequest = (request: () => Promise<Response>, query: string) => {
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      setShowPdfFallback(false);
      const response = await request();

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as RouteErrorResponse | null;
        setError(result?.error ?? "The request failed.");
        return;
      }

      setSuccess("Proposal updated. The dashboard has been refreshed.");
      router.push(`/proposals?${query}=${proposalId}`);
      router.refresh();
    });
  };

  const runExport = () => {
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      setShowPdfFallback(false);
      const response = await fetch(`/api/proposals/${proposalId}/export`, {
        method: "POST"
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as RouteErrorResponse | null;
        setError(result?.error ?? "Export failed.");
        return;
      }

      const result = (await response.json()) as ExportResponse;
      setSuccess("HTML export is ready. Opening the exported document now.");
      window.open(result.data.filePath, "_blank", "noopener,noreferrer");
      router.push(`/proposals?exported=${proposalId}`);
      router.refresh();
    });
  };

  const runPdfExport = () => {
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      setShowPdfFallback(false);
      const response = await fetch(`/api/proposals/${proposalId}/export/pdf`);

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as RouteErrorResponse | null;
        const nextError = result?.error ?? "PDF export failed.";
        setError(nextError);
        setShowPdfFallback(/unavailable|failed/i.test(nextError));
        return;
      }

      setSuccess("PDF export is ready. Opening the generated file now.");
      window.open(`/api/proposals/${proposalId}/export/pdf`, "_blank", "noopener,noreferrer");
    });
  };

  return (
    <div className="stack actions-row">
      <div className="inline-form">
        <button className="cta" disabled={isPending} onClick={runExport} type="button">
          {isPending ? "Working..." : "Open HTML export"}
        </button>
        <button className="ghost-button" disabled={isPending} onClick={runPdfExport} type="button">
          {isPending ? "Working..." : "Export PDF"}
        </button>
      </div>
      <div className="inline-form">
        <select
          name="status"
          onChange={(event) => setStatus(event.target.value as ProposalStatus)}
          value={status}
        >
          <option value="DRAFT">Draft</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="SENT">Sent</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
        </select>
        <button
          className="cta"
          disabled={isPending}
          onClick={() =>
            runRequest(
              () =>
                fetch(`/api/proposals/${proposalId}/status`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ status })
                }),
              "statusUpdated"
            )
          }
          type="button"
        >
          {isPending ? "Working..." : "Update status"}
        </button>
      </div>
      {success ? <p className="muted success-copy">{success}</p> : null}
      {error ? <p className="muted">{error}</p> : null}
      {showPdfFallback ? (
        <div className="card export-fallback-card">
          <strong>PDF fallback available</strong>
          <p className="muted">
            Use the HTML export to keep the workflow moving, then retry PDF once the environment
            supports it.
          </p>
          <button className="ghost-button" disabled={isPending} onClick={runExport} type="button">
            Open HTML export instead
          </button>
        </div>
      ) : null}
    </div>
  );
}

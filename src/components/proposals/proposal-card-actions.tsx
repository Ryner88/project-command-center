"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { ProposalStatus } from "@/types/proposal";

type ProposalCardActionsProps = {
  proposalId: string;
  currentStatus: ProposalStatus;
};

export function ProposalCardActions({
  proposalId,
  currentStatus
}: ProposalCardActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ProposalStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const runRequest = (request: () => Promise<Response>, query: string) => {
    startTransition(async () => {
      const response = await request();

      if (!response.ok) {
        return;
      }

      router.push(`/proposals?${query}=${proposalId}`);
      router.refresh();
    });
  };

  return (
    <div className="stack actions-row">
      <button
        className="cta"
        disabled={isPending}
        onClick={() =>
          runRequest(
            () =>
              fetch(`/api/proposals/${proposalId}/export`, {
                method: "POST"
              }),
            "exported"
          )
        }
        type="button"
      >
        {isPending ? "Working..." : "Export PDF"}
      </button>
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
    </div>
  );
}

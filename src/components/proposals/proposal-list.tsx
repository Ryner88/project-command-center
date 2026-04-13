import type { Proposal } from "@/types/proposal";

export function ProposalList({ proposals }: { proposals: Proposal[] }) {
  return (
    <div className="list">
      {proposals.map((proposal) => (
        <div className="card" key={proposal.id}>
          <strong>{proposal.title}</strong>
          <p>{proposal.summary}</p>
          <span className="pill">{proposal.status}</span>
        </div>
      ))}
    </div>
  );
}

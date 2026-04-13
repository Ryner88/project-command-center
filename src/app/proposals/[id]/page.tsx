type ProposalDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProposalDetailPage({
  params
}: ProposalDetailPageProps) {
  const { id } = await params;

  return (
    <main className="stack">
      <section className="frame hero">
        <span className="eyebrow">Proposal Detail</span>
        <h1>Proposal {id}</h1>
        <p>
          This placeholder route is ready for the detailed proposal editor and
          exported document history.
        </p>
      </section>
    </main>
  );
}

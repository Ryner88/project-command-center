import Link from "next/link";
import { ProjectCreateForm } from "@/components/projects/project-create-form";
import { listProjects } from "@/services/project.service";
export const dynamic = "force-dynamic";
export default async function ProjectsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string; archived?: string }>;
}) {
  const p = await searchParams;
  const archived = p.archived === "true";
  const all = await listProjects(archived);
  const q = p.q?.toLowerCase();
  const shown = all
    .filter((x) => !q || `${x.name} ${x.clientName} ${x.description}`.toLowerCase().includes(q))
    .filter((x) => !p.status || p.status === "ALL" || x.status === p.status)
    .filter((x) => !p.priority || p.priority === "ALL" || x.priority === p.priority);
  return (
    <main className="stack">
      <section className="frame hero">
        <span className="eyebrow">Projects</span>
        <h1>Organize client work from first plan to closeout.</h1>
        <p>
          Create a project, set its priority, and keep proposals and tasks tied to the same working
          context.
        </p>
      </section>
      <ProjectCreateForm />
      <section className="frame stack">
        <form className="grid three">
          <input name="q" defaultValue={p.q} placeholder="Search projects" />
          <select name="status" defaultValue={p.status ?? "ALL"}>
            <option>ALL</option>
            {["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select name="priority" defaultValue={p.priority ?? "ALL"}>
            <option>ALL</option>
            {["LOW", "MEDIUM", "HIGH", "URGENT"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <label>
            <input type="checkbox" name="archived" value="true" defaultChecked={archived} /> Show
            archived
          </label>
          <button className="cta">Apply</button>
        </form>
        <div className="list">
          {shown.length ? (
            shown.map((x) => (
              <Link className="card stack" href={`/projects/${x.id}` as never} key={x.id}>
                <div className="row spread">
                  <strong>{x.name}</strong>
                  <span className="pill">{x.priority}</span>
                </div>
                <p>
                  {x.clientName} · {x.status.replace("_", " ")}
                </p>
                <p className="muted">
                  {x.tasks.filter((t) => t.completedAt).length}/{x.tasks.length} tasks complete ·{" "}
                  {x.proposalCount} proposals
                </p>
              </Link>
            ))
          ) : (
            <p className="muted">No projects match these filters.</p>
          )}
        </div>
      </section>
    </main>
  );
}

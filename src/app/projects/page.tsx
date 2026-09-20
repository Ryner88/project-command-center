import Link from "next/link";
import { ProjectCreateForm } from "@/components/projects/project-create-form";
import { listProjects } from "@/services/project.service";
import { getDataMode } from "@/services/data-mode.service";
export const dynamic = "force-dynamic";
export default async function ProjectsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string; archived?: string }>;
}) {
  const p = await searchParams;
  const mode = await getDataMode();
  const archived = p.archived === "true";
  const all = mode === "database" ? await listProjects(archived) : [];
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
      {mode === "database" ? (
        <ProjectCreateForm />
      ) : (
        <section className="frame demo-callout stack">
          <span className="eyebrow">Local demo limitation</span>
          <h2>Projects need a PostgreSQL database</h2>
          <p>
            Connect a local database to create projects and tasks. The optional demo workspace
            contains proposal data only.
          </p>
          <Link className="ghost-button" href="/">
            Return to demo controls
          </Link>
        </section>
      )}
      <section className="frame stack">
        <form className="grid three" aria-label="Project filters">
          <label className="input-group">
            <span className="field-label">Search</span>
            <input name="q" defaultValue={p.q} placeholder="Project, client, or description" />
          </label>
          <label className="input-group">
            <span className="field-label">Status</span>
            <select name="status" defaultValue={p.status ?? "ALL"}>
              <option>ALL</option>
              {["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="input-group">
            <span className="field-label">Priority</span>
            <select name="priority" defaultValue={p.priority ?? "ALL"}>
              <option>ALL</option>
              {["LOW", "MEDIUM", "HIGH", "URGENT"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="checkbox-label">
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
            <div className="empty-state">
              <strong>
                {mode === "demo"
                  ? "Project data is unavailable in demo mode"
                  : all.length
                    ? "No projects match these filters"
                    : "No projects yet"}
              </strong>
              <p className="muted">
                {mode === "demo"
                  ? "Add DATABASE_URL and run the migrations to use project workflows."
                  : all.length
                    ? "Change or clear the filters to see more work."
                    : "Create the first project above. It will hold the client context, tasks, and proposals."}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

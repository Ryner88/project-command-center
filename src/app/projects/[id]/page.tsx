import { notFound } from "next/navigation";
import Link from "next/link";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { getProject } from "@/services/project.service";
export const dynamic = "force-dynamic";
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return (
    <main className="stack">
      <section className="frame hero">
        <span className="eyebrow">
          {project.status.replace("_", " ")} · {project.priority}
        </span>
        <h1>{project.name}</h1>
        <p>
          {project.clientName} · {project.description}
        </p>
        <div className="action-row">
          <Link className="cta" href={`/proposals/new?projectId=${project.id}`}>
            Create proposal from project
          </Link>
          <Link className="ghost-button" href={"/projects" as never}>
            All projects
          </Link>
        </div>
      </section>
      <ProjectWorkspace project={project} />
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const workflowSteps = [
  { href: "/", label: "Home", match: (pathname: string) => pathname === "/" },
  {
    href: "/briefing",
    label: "Briefing",
    match: (pathname: string) => pathname.startsWith("/briefing")
  },
  {
    href: "/proposals/new",
    label: "Create proposal",
    match: (pathname: string) => pathname.startsWith("/proposals/new")
  },
  {
    href: "/proposals",
    label: "View dashboard",
    match: (pathname: string) => pathname === "/proposals" || /^\/proposals\/[^/]+$/.test(pathname)
  },
  {
    href: "/proposals",
    label: "Export HTML",
    match: () => false
  },
  {
    href: "/proposals",
    label: "Export PDF",
    match: () => false
  }
] as const;

export function WorkflowProgress() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  const activeIndex = workflowSteps.findIndex((step) => step.match(pathname));

  return (
    <section className="frame workflow-progress">
      <div className="section-head">
        <span className="eyebrow">Current Workflow</span>
        <h2>Home to proposal delivery in one guided path</h2>
      </div>
      <div className="workflow-steps">
        {workflowSteps.map((step, index) => {
          const state =
            activeIndex === -1
              ? "upcoming"
              : index < activeIndex
                ? "complete"
                : index === activeIndex
                  ? "active"
                  : "upcoming";

          return (
            <Link
              aria-current={state === "active" ? "step" : undefined}
              className={`workflow-step workflow-${state}`}
              href={step.href}
              key={step.label}
            >
              <span className="workflow-index">{index + 1}</span>
              <span>{step.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

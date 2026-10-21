import type { Metadata } from "next";
import Link from "next/link";

import { WorkflowProgress } from "@/components/workflow-progress";
import { LogoutButton } from "@/components/auth/logout-button";

import "./globals.css";

export const metadata: Metadata = {
  title: "Project Command Center",
  description: "Morning briefing and proposal generation workspace for agencies."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <div className="shell">
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/">Home</Link>
            <Link href="/briefing">Briefing</Link>
            <Link href={"/projects" as never}>Projects</Link>
            <Link href="/proposals">Proposal Dashboard</Link>
            <Link href="/proposals/new">New Proposal</Link>
            <LogoutButton />
          </nav>
          <WorkflowProgress />
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

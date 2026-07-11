import type { Metadata } from "next";
import Link from "next/link";

import { WorkflowProgress } from "@/components/workflow-progress";

import "./globals.css";

export const metadata: Metadata = {
  title: "Project Command Center",
  description: "Morning briefing and proposal generation workspace for agencies."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="shell">
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/briefing">Briefing</Link>
            <Link href="/proposals">Proposal Dashboard</Link>
            <Link href="/proposals/new">New Proposal</Link>
          </nav>
          <WorkflowProgress />
          {children}
        </div>
      </body>
    </html>
  );
}

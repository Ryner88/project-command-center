import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Project Command Center",
  description: "Morning briefing and proposal generation workspace for agencies."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/briefing">Briefing</Link>
            <Link href="/proposals">Proposals</Link>
            <Link href="/proposals/new">New Proposal</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}

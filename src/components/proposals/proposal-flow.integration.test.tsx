// @vitest-environment jsdom

import React from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetDemoStoreForTests } from "@/services/demo-store.service";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("notFound");
  },
  useRouter: () => ({
    push,
    refresh
  })
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
    React.createElement("a", { href, ...props }, children)
}));

describe("proposal generation flow", () => {
  beforeEach(async () => {
    push.mockReset();
    refresh.mockReset();
    vi.resetModules();
    vi.unstubAllGlobals();
    delete process.env.DATABASE_URL;
    await resetDemoStoreForTests();
  });

  it("submits the form, saves the proposal, redirects, and renders the stored detail view", async () => {
    const { ProposalGeneratorForm } = await import(
      "@/components/proposals/proposal-generator-form"
    );
    const { POST } = await import("@/app/api/proposals/generate/route");

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        const request = new Request("http://localhost/api/proposals/generate", {
          method: init?.method ?? "POST",
          headers: init?.headers,
          body: init?.body
        });

        return POST(request as never);
      })
    );

    render(
      React.createElement(ProposalGeneratorForm, {
        initialClientName: "",
        initialProjectType: "",
        initialSummary: "",
        initialTitle: ""
      })
    );

    await userEvent.type(screen.getByLabelText("Client"), "LedgerLoop");
    await userEvent.type(
      screen.getByLabelText("Project type"),
      "Fintech operations platform"
    );
    fireEvent.change(screen.getByLabelText("Requested start date"), {
      target: { value: "2026-05-01" }
    });
    fireEvent.change(screen.getByLabelText("Deadline"), {
      target: { value: "2026-06-19" }
    });
    await userEvent.selectOptions(
      screen.getByLabelText("Project domain"),
      "FINANCE"
    );
    await userEvent.type(
      screen.getByLabelText("Working request or source notes"),
      "Build a fintech operations platform for reconciliation workflows, approval routing, and payment operations visibility."
    );
    await userEvent.type(
      screen.getByLabelText("Summary used for generation"),
      "Build a fintech operations platform for reconciliation workflows, approval routing, and payment operations visibility."
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Generate proposal" })
    );

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/proposals/proposal_2");
    });

    vi.resetModules();

    const { default: ProposalDetailPage } = await import(
      "@/app/proposals/[id]/page"
    );

    const page = await ProposalDetailPage({
      params: Promise.resolve({ id: "proposal_2" })
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("LedgerLoop Fintech operations platform Proposal");
    expect(html).toContain("Client: LedgerLoop");
    expect(html).toContain("Type: Fintech operations platform");
    expect(html).toContain("Domain: Finance");
    expect(html).toContain("Start: May 1, 2026");
    expect(html).toContain("Deadline: June 19, 2026");
    expect(html).toContain("Generated from manual input");
    expect(html).toContain("Finance project proposal for LedgerLoop");
    expect(html).toContain("Proposal Detail");
    expect(html).not.toMatch(/CMS|sitemap|marketing site|lead capture forms/i);
  }, 10000);

  it("keeps generated proposals available across module reloads in demo mode", async () => {
    const { generateProposal } = await import("@/services/proposal.service");

    const created = await generateProposal({
      clientName: "Harbor Clinic Network",
      projectType: "Patient intake workflow platform",
      projectDomain: "MEDICAL_HEALTHCARE",
      summary:
        "Design and implement a healthcare intake workflow platform with privacy-conscious data handling, operational approvals, and extra review checkpoints."
    });

    vi.resetModules();

    const { getProposalById } = await import("@/services/proposal.service");
    const stored = await getProposalById(created.id);

    expect(stored).not.toBeNull();
    expect(stored?.title).toBe(created.title);
    expect(stored?.clientName).toBe(created.clientName);
    expect(stored?.sourceLabel).toBe(created.sourceLabel);
    expect(stored?.summary).toBe(created.summary);
    expect(stored?.scope).toEqual(created.scope);
    expect(stored?.deliverables).toEqual(created.deliverables);
    expect(stored?.risks).toEqual(created.risks);
    expect(stored?.assumptions).toEqual(created.assumptions);
  });

  it("renders the default demo proposal detail by stable id", async () => {
    const { default: ProposalDetailPage } = await import(
      "@/app/proposals/[id]/page"
    );

    const page = await ProposalDetailPage({
      params: Promise.resolve({ id: "proposal_1" })
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("Sarah Website build Proposal");
    expect(html).toContain("Client: Sarah");
    expect(html).toContain("Domain: Website");
    expect(html).toContain("Proposal Detail");
  });

  it("does not create temporary demo proposals on Vercel without a database", async () => {
    vi.stubEnv("VERCEL", "1");

    const { AppError } = await import("@/lib/app-error");
    const { generateProposal } = await import("@/services/proposal.service");

    await expect(
      generateProposal({
        clientName: "LedgerLoop",
        projectType: "Fintech operations platform",
        projectDomain: "FINANCE",
        summary:
          "Build a fintech operations platform for reconciliation workflows."
      })
    ).rejects.toMatchObject({
      status: 503,
      message:
        "Proposal persistence is not configured for this deployment. Set DATABASE_URL and run migrations before generating proposals."
    } satisfies Partial<InstanceType<typeof AppError>>);
  });
});

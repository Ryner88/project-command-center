import fs from "node:fs/promises";
import path from "node:path";

import { getStoragePath } from "@/lib/utils";
import { upsertProposalExport } from "@/services/export.service";
import { getProposalById } from "@/services/proposal.service";

export async function exportProposalPdf(id: string) {
  const proposal = await getProposalById(id);

  if (!proposal) {
    throw new Error(`Proposal ${id} was not found.`);
  }

  const safeFileName = `${slugify(proposal.clientName)}-${slugify(proposal.title)}.pdf`;
  const directory = getStoragePath("proposals");
  const filePath = path.join(directory, safeFileName);

  await fs.mkdir(directory, { recursive: true });

  const html = renderProposalHtml(proposal);
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true
    });
  } finally {
    await browser.close();
  }

  return upsertProposalExport({
    proposalId: proposal.id,
    fileName: safeFileName,
    filePath,
    mimeType: "application/pdf"
  });
}

function renderProposalHtml(proposal: Awaited<ReturnType<typeof getProposalById>>) {
  if (!proposal) {
    return "";
  }

  return `
    <html>
      <head>
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            font-family: Georgia, serif;
            color: #1f1b17;
            background: #f7f1e8;
          }
          .page {
            padding: 56px 52px 60px;
          }
          .hero {
            background: linear-gradient(135deg, rgba(185, 76, 53, 0.16), rgba(244, 217, 210, 0.5));
            border: 1px solid #d7cbbd;
            border-radius: 24px;
            padding: 28px;
            margin-bottom: 22px;
          }
          .eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #6b6257;
            font-size: 11px;
            margin-bottom: 10px;
          }
          h1, h2, h3 {
            margin: 0 0 12px;
          }
          h1 {
            font-size: 34px;
            line-height: 1.08;
          }
          h2 {
            font-size: 18px;
          }
          p, li {
            line-height: 1.6;
            color: #4f463c;
          }
          .meta {
            margin-top: 10px;
            color: #6b6257;
          }
          .summary-card {
            border: 1px solid #d7cbbd;
            background: white;
            border-radius: 18px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
            margin-bottom: 18px;
          }
          .panel {
            border: 1px solid #d7cbbd;
            background: rgba(255, 255, 255, 0.92);
            border-radius: 18px;
            padding: 18px;
          }
          .price {
            display: inline-block;
            margin-top: 14px;
            padding: 8px 12px;
            border-radius: 999px;
            background: #f4d9d2;
            color: #b94c35;
            font-weight: 700;
          }
          ul {
            margin: 0;
            padding-left: 18px;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <section class="hero">
            <div class="eyebrow">Project Command Center Proposal</div>
            <h1>${escapeHtml(proposal.title)}</h1>
            <p class="meta">Client: ${escapeHtml(proposal.clientName)} • Timeline: ${escapeHtml(
              proposal.timeline ?? "TBD"
            )}${proposal.priceRange ? ` • ${escapeHtml(proposal.priceRange)}` : ""}</p>
          </section>
          <section class="summary-card">
            <h2>Project Summary</h2>
            <p>${escapeHtml(proposal.summary)}</p>
            <div class="price">Suggested price range: ${escapeHtml(proposal.priceRange)}</div>
          </section>
          <section class="grid">
            <div class="panel">
              <h2>Scope</h2>
              <ul>
                ${proposal.scope.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </div>
            <div class="panel">
              <h2>Deliverables</h2>
              <ul>
                ${proposal.deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </div>
            <div class="panel">
              <h2>Task Breakdown</h2>
              <ul>
                ${proposal.taskBreakdown.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </div>
            <div class="panel">
              <h2>Risks and Assumptions</h2>
              <ul>
                ${proposal.risks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                ${proposal.assumptions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </div>
          </section>
        </div>
      </body>
    </html>
  `;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

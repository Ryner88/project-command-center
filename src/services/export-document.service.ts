import { formatProposalDate } from "@/lib/date";
import { AppError } from "@/lib/app-error";
import { buildProposalSchedule } from "@/lib/proposal-schedule";
import { upsertProposalExport } from "@/services/export.service";
import { getProposalById } from "@/services/proposal.service";

export async function createProposalExport(id: string) {
  const proposal = await getProposalById(id);

  if (!proposal) {
    throw new AppError(404, `Proposal ${id} was not found.`);
  }

  const fileName = `${buildProposalExportBaseName(proposal.clientName, proposal.title)}.html`;

  return upsertProposalExport({
    proposalId: proposal.id,
    fileName,
    filePath: `/api/proposals/${proposal.id}/export/download`,
    mimeType: "text/html"
  });
}

export async function getProposalExportDocument(id: string) {
  const proposal = await getProposalById(id);

  if (!proposal) {
    throw new AppError(404, `Proposal ${id} was not found.`);
  }

  return {
    fileName: `${buildProposalExportBaseName(proposal.clientName, proposal.title)}.html`,
    mimeType: "text/html; charset=utf-8",
    content: renderProposalHtml(proposal)
  };
}

export async function getProposalPdfDocument(id: string) {
  const proposal = await getProposalById(id);

  if (!proposal) {
    throw new AppError(404, `Proposal ${id} was not found.`);
  }

  let browser:
    | Awaited<ReturnType<typeof launchLocalChromium>>
    | Awaited<ReturnType<typeof launchVercelChromium>>
    | null = null;

  try {
    browser = process.env.VERCEL
      ? await launchVercelChromium()
      : await launchLocalChromium();

    const page = await browser.newPage();
    await page.setContent(renderProposalHtml(proposal), {
      waitUntil: "load"
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true
    });

    return {
      fileName: `${buildProposalExportBaseName(proposal.clientName, proposal.title)}.pdf`,
      mimeType: "application/pdf",
      content: new Uint8Array(pdf)
    };
  } catch (error) {
    throw new AppError(
      503,
      error instanceof Error && error.message
        ? `PDF export is unavailable in this environment: ${error.message}`
        : "PDF export is unavailable in this environment. Use the HTML export instead."
    );
  } finally {
    await browser?.close();
  }
}

async function launchVercelChromium() {
  const { chromium } = await import("playwright-core");
  const chromiumBinary = (await import("@sparticuz/chromium")).default;

  return chromium.launch({
    headless: true,
    args: chromiumBinary.args,
    executablePath: await chromiumBinary.executablePath()
  });
}

async function launchLocalChromium() {
  const { chromium } = await import("playwright");

  return chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
}

export function renderProposalHtml(proposal: Awaited<ReturnType<typeof getProposalById>>) {
  if (!proposal) {
    return "";
  }

  const deliverableCount = proposal.deliverables.length;
  const riskLevel = deriveRiskLevel(proposal.risks);
  const projectLabel = deriveProjectLabel(proposal);
  const schedule = proposal.dueDate
    ? buildProposalSchedule(proposal.dueDate, proposal.taskBreakdown, proposal.startDate)
    : null;
  const displayTimeline = schedule
    ? `${formatDuration(schedule.totalDays)} delivery plan`
    : proposal.timeline ?? "To be confirmed";
  const executiveSummary = buildExecutiveSummary(proposal, schedule);
  const scopeNarrative = buildScopeNarrative(proposal);
  const timelineNarrative = buildTimelineNarrative(proposal, schedule);
  const commercialNotes = buildCommercialNotes(proposal, displayTimeline);
  const formattedStartDate = formatProposalDate(proposal.startDate);
  const formattedDeadline = formatProposalDate(proposal.dueDate);
  const hasDeadline = Boolean(formattedDeadline);

  return `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(proposal.title)}</title>
        <style>
          :root {
            color-scheme: dark;
            --bg: #0a0f19;
            --bg-accent: #121a29;
            --panel: rgba(15, 23, 38, 0.88);
            --panel-strong: rgba(11, 18, 30, 0.96);
            --panel-soft: rgba(20, 30, 48, 0.72);
            --line: rgba(150, 168, 203, 0.2);
            --line-strong: rgba(150, 168, 203, 0.34);
            --text: #f4f7fb;
            --muted: #98a6c4;
            --accent: #79c0ff;
            --accent-soft: rgba(121, 192, 255, 0.14);
            --success: #64d2a3;
            --warn: #f5c46b;
            --danger: #ff8b8b;
            --shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
          }
          * {
            box-sizing: border-box;
          }
          html {
            background: var(--bg);
          }
          body {
            margin: 0;
            font-family: "Inter", "Segoe UI", sans-serif;
            background:
              radial-gradient(circle at top left, rgba(121, 192, 255, 0.16), transparent 30%),
              radial-gradient(circle at top right, rgba(100, 210, 163, 0.09), transparent 26%),
              linear-gradient(180deg, #0b1220 0%, #090e17 100%);
            color: var(--text);
          }
          .page {
            max-width: 1180px;
            margin: 0 auto;
            padding: 40px 24px 56px;
          }
          .shell {
            display: grid;
            gap: 20px;
          }
          .hero {
            position: relative;
            overflow: hidden;
            padding: 32px;
            border: 1px solid var(--line);
            border-radius: 28px;
            background:
              linear-gradient(135deg, rgba(121, 192, 255, 0.14), rgba(121, 192, 255, 0.02) 40%, rgba(10, 15, 25, 0.2) 100%),
              var(--panel-strong);
            box-shadow: var(--shadow);
          }
          .hero::after {
            content: "";
            position: absolute;
            inset: auto -80px -120px auto;
            width: 320px;
            height: 320px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(121, 192, 255, 0.2), transparent 65%);
            pointer-events: none;
          }
          .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--accent);
            margin-bottom: 14px;
          }
          .eyebrow::before {
            content: "";
            width: 24px;
            height: 1px;
            background: currentColor;
            opacity: 0.8;
          }
          h1, h2, h3, p {
            margin: 0;
          }
          h1 {
            max-width: 11ch;
            font-size: clamp(2.4rem, 5vw, 4.4rem);
            line-height: 0.95;
            letter-spacing: -0.04em;
            margin-bottom: 18px;
          }
          h2 {
            font-size: 1.05rem;
            line-height: 1.2;
            letter-spacing: -0.02em;
          }
          h3 {
            font-size: 0.94rem;
            line-height: 1.25;
            letter-spacing: -0.02em;
          }
          p, li {
            color: var(--muted);
            line-height: 1.7;
            font-size: 0.97rem;
          }
          .hero-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.6fr) minmax(300px, 0.95fr);
            gap: 24px;
            align-items: end;
          }
          .hero-copy {
            display: grid;
            gap: 14px;
          }
          .hero-lead {
            max-width: 64ch;
            font-size: 1rem;
          }
          .hero-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 6px;
          }
          .meta-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-height: 36px;
            padding: 0 14px;
            border-radius: 999px;
            border: 1px solid var(--line);
            background: rgba(255, 255, 255, 0.03);
            color: var(--text);
            font-size: 0.88rem;
            white-space: nowrap;
          }
          .hero-side {
            display: grid;
            gap: 12px;
          }
          .hero-note {
            padding: 18px;
            border-radius: 20px;
            border: 1px solid var(--line);
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
          }
          .hero-note strong {
            display: block;
            margin-bottom: 8px;
            color: var(--text);
            font-size: 0.86rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 14px;
          }
          .kpi-grid.has-deadline {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
          .kpi {
            padding: 18px 18px 20px;
            border-radius: 20px;
            border: 1px solid var(--line);
            background: var(--panel);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
          }
          .kpi-label {
            display: block;
            margin-bottom: 10px;
            color: var(--muted);
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .kpi-value {
            color: var(--text);
            font-size: clamp(1.1rem, 2.5vw, 1.6rem);
            font-weight: 700;
            letter-spacing: -0.03em;
          }
          .kpi-tone-low {
            color: var(--success);
          }
          .kpi-tone-medium {
            color: var(--warn);
          }
          .kpi-tone-high {
            color: var(--danger);
          }
          .content-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.3fr) minmax(300px, 0.8fr);
            gap: 20px;
          }
          .stack {
            display: grid;
            gap: 20px;
          }
          .panel {
            padding: 24px;
            border-radius: 24px;
            border: 1px solid var(--line);
            background: var(--panel);
            box-shadow: var(--shadow);
          }
          .panel-header {
            display: grid;
            gap: 10px;
            margin-bottom: 18px;
          }
          .panel-header p {
            max-width: 68ch;
          }
          .list-grid {
            display: grid;
            gap: 14px;
          }
          .list-grid.two {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .list-card {
            padding: 18px;
            border-radius: 18px;
            border: 1px solid var(--line);
            background: var(--panel-soft);
          }
          .list-card h3 {
            margin-bottom: 12px;
          }
          ul {
            margin: 0;
            padding-left: 18px;
          }
          li + li {
            margin-top: 8px;
          }
          .timeline-list {
            list-style: none;
            padding: 0;
            display: grid;
            gap: 12px;
          }
          .timeline-item {
            display: grid;
            grid-template-columns: 92px minmax(0, 1fr);
            gap: 14px;
            padding: 14px 0 0;
            border-top: 1px solid var(--line);
          }
          .timeline-item:first-child {
            border-top: 0;
            padding-top: 0;
          }
          .timeline-phase {
            color: var(--accent);
            font-size: 0.78rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-weight: 700;
          }
          .timeline-copy strong {
            display: block;
            margin-bottom: 6px;
            color: var(--text);
          }
          .commercial-box {
            padding: 18px;
            border-radius: 20px;
            border: 1px solid var(--line-strong);
            background: linear-gradient(180deg, rgba(121, 192, 255, 0.08), rgba(121, 192, 255, 0.02));
          }
          .price-range {
            display: inline-flex;
            align-items: center;
            min-height: 44px;
            padding: 0 16px;
            border-radius: 999px;
            background: var(--accent-soft);
            color: var(--text);
            font-size: 1rem;
            font-weight: 700;
            margin: 14px 0 12px;
          }
          .note-list {
            list-style: none;
            padding: 0;
            display: grid;
            gap: 12px;
          }
          .note-item {
            padding: 14px 16px;
            border: 1px solid var(--line);
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.02);
          }
          .note-item strong {
            display: block;
            margin-bottom: 6px;
            color: var(--text);
            font-size: 0.84rem;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            padding-top: 4px;
            color: var(--muted);
            font-size: 0.84rem;
          }
          .print-only {
            display: none;
          }
          @media (max-width: 1024px) {
            .hero-grid,
            .content-grid,
            .list-grid.two,
            .kpi-grid {
              grid-template-columns: 1fr;
            }
            h1 {
              max-width: none;
            }
          }
          @media (max-width: 720px) {
            .page {
              padding: 18px 14px 32px;
            }
            .hero,
            .panel {
              padding: 20px;
              border-radius: 22px;
            }
            .timeline-item {
              grid-template-columns: 1fr;
              gap: 8px;
            }
            .hero-meta,
            .footer {
              flex-direction: column;
              align-items: flex-start;
            }
          }
          @page {
            margin: 14mm;
          }
          @media print {
            :root {
              color-scheme: light;
              --bg: #ffffff;
              --panel: #ffffff;
              --panel-strong: #ffffff;
              --panel-soft: #ffffff;
              --line: rgba(18, 24, 35, 0.12);
              --line-strong: rgba(18, 24, 35, 0.18);
              --text: #111827;
              --muted: #4b5563;
              --accent: #1d4ed8;
              --accent-soft: rgba(29, 78, 216, 0.08);
              --success: #047857;
              --warn: #b45309;
              --danger: #b91c1c;
              --shadow: none;
            }
            html, body {
              background: #ffffff !important;
            }
            .page {
              max-width: none;
              padding: 0;
            }
            .shell,
            .content-grid,
            .stack {
              display: block;
            }
            .hero,
            .kpi-grid,
            .panel,
            .footer {
              margin-bottom: 14px;
            }
            .content-grid > *,
            .stack > *,
            .list-grid > *,
            .note-list > * {
              margin-bottom: 14px;
            }
            .content-grid > *:last-child,
            .stack > *:last-child,
            .list-grid > *:last-child,
            .note-list > *:last-child {
              margin-bottom: 0;
            }
            .hero,
            .panel,
            .kpi,
            .list-card,
            .hero-note,
            .commercial-box,
            .note-item,
            .meta-pill {
              background: #ffffff !important;
              box-shadow: none !important;
              break-inside: avoid;
            }
            .commercial-box,
            .note-item,
            .price-range {
              overflow-wrap: anywhere;
            }
            .note-item,
            .commercial-box {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .footer {
              position: static;
              display: flex;
              justify-content: space-between;
              gap: 12px;
              margin: 20px 0 0;
              padding-top: 10px;
              border-top: 1px solid var(--line);
              break-inside: avoid;
              page-break-inside: avoid;
            }
            a {
              color: inherit;
              text-decoration: none;
            }
            .print-only {
              display: inline;
            }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <div class="shell">
            <header class="hero">
              <div class="hero-grid">
                <div class="hero-copy">
                  <div class="eyebrow">Project Command Center Proposal</div>
                  <h1>${escapeHtml(proposal.title)}</h1>
                  <p class="hero-lead">${escapeHtml(executiveSummary)}</p>
                  <div class="hero-meta">
                    <span class="meta-pill">Client: ${escapeHtml(proposal.clientName)}</span>
                    <span class="meta-pill">Engagement: ${escapeHtml(projectLabel)}</span>
                    <span class="meta-pill">Timeline: ${escapeHtml(displayTimeline)}</span>
                    ${formattedStartDate ? `<span class="meta-pill">Start: ${escapeHtml(formattedStartDate)}</span>` : ""}
                    ${hasDeadline ? `<span class="meta-pill">Deadline: ${escapeHtml(formattedDeadline ?? "")}</span>` : ""}
                    <span class="meta-pill">Estimate: ${escapeHtml(proposal.priceRange)}</span>
                  </div>
                </div>
                <aside class="hero-side" aria-label="Proposal framing">
                  <div class="hero-note">
                    <strong>Proposal Positioning</strong>
                    <p>${escapeHtml(scopeNarrative)}</p>
                  </div>
                  <div class="hero-note">
                    <strong>Delivery Basis</strong>
                    <p>${escapeHtml(timelineNarrative)}</p>
                  </div>
                </aside>
              </div>
            </header>

            <section class="kpi-grid${hasDeadline ? " has-deadline" : ""}" aria-label="Proposal summary metrics">
              <article class="kpi">
                <span class="kpi-label">Estimated Duration</span>
                <div class="kpi-value">${escapeHtml(displayTimeline)}</div>
              </article>
              ${hasDeadline ? `
                <article class="kpi">
                  <span class="kpi-label">Deadline</span>
                  <div class="kpi-value">${escapeHtml(formattedDeadline ?? "")}</div>
                </article>
              ` : ""}
              <article class="kpi">
                <span class="kpi-label">Deliverables</span>
                <div class="kpi-value">${escapeHtml(String(deliverableCount))}</div>
              </article>
              <article class="kpi">
                <span class="kpi-label">Price Range</span>
                <div class="kpi-value">${escapeHtml(proposal.priceRange)}</div>
              </article>
              <article class="kpi">
                <span class="kpi-label">Risk Level</span>
                <div class="kpi-value kpi-tone-${escapeHtml(riskLevel.tone)}">${escapeHtml(riskLevel.label)}</div>
              </article>
            </section>

            <div class="content-grid">
              <section class="stack">
                <section class="panel" aria-labelledby="summary-heading">
                  <div class="panel-header">
                    <div class="eyebrow">Project Summary</div>
                    <h2 id="summary-heading">What this phase is intended to accomplish</h2>
                    <p>${escapeHtml(executiveSummary)}</p>
                  </div>
                </section>

                <section class="panel" aria-labelledby="scope-heading">
                  <div class="panel-header">
                    <div class="eyebrow">Scope and Deliverables</div>
                    <h2 id="scope-heading">Defined working scope and concrete outputs</h2>
                    <p>${escapeHtml(scopeNarrative)}</p>
                  </div>
                  <div class="list-grid two">
                    <article class="list-card">
                      <h3>Scope</h3>
                      <ul>
                        ${proposal.scope.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                      </ul>
                    </article>
                    <article class="list-card">
                      <h3>Deliverables</h3>
                      <ul>
                        ${proposal.deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                      </ul>
                    </article>
                  </div>
                </section>

                <section class="panel" aria-labelledby="timeline-heading">
                  <div class="panel-header">
                    <div class="eyebrow">Task Breakdown and Timeline</div>
                    <h2 id="timeline-heading">Delivery schedule and milestone sequencing</h2>
                    <p>${escapeHtml(timelineNarrative)}</p>
                  </div>
                  <ol class="timeline-list">
                    ${schedule
                      ? schedule.phases
                          .map((phase) => renderScheduledTimelineItem(phase))
                          .join("")
                      : proposal.taskBreakdown
                          .map((item, index) => renderTimelineItem(item, index))
                          .join("")}
                  </ol>
                </section>
              </section>

              <aside class="stack">
                <section class="panel" aria-labelledby="risk-heading">
                  <div class="panel-header">
                    <div class="eyebrow">Risks and Assumptions</div>
                    <h2 id="risk-heading">Dependencies that shape delivery confidence</h2>
                    <p>${escapeHtml(
                      `The delivery plan assumes the review cadence and input availability described below. Current risk is assessed as ${riskLevel.label.toLowerCase()} based on the stated dependencies and constraints.`
                    )}</p>
                  </div>
                  <div class="list-grid">
                    <article class="list-card">
                      <h3>Key Risks</h3>
                      <ul>
                        ${proposal.risks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                      </ul>
                    </article>
                    <article class="list-card">
                      <h3>Assumptions</h3>
                      <ul>
                        ${proposal.assumptions
                          .map((item) => `<li>${escapeHtml(item)}</li>`)
                          .join("")}
                      </ul>
                    </article>
                  </div>
                </section>

                <section class="panel" aria-labelledby="estimate-heading">
                  <div class="panel-header">
                    <div class="eyebrow">Price Range / Estimate Breakdown</div>
                    <h2 id="estimate-heading">Commercial framing tied to the current scope</h2>
                    <p>${escapeHtml(
                      "This estimate reflects the scope, deliverables, and sequencing described in this proposal. It should be treated as a scoped range rather than an open-ended expansion of work."
                    )}</p>
                  </div>
                  <div class="commercial-box">
                    <div class="price-range">${escapeHtml(proposal.priceRange)}</div>
                    <p>${escapeHtml(commercialNotes.intro)}</p>
                  </div>
                  <ul class="note-list">
                    ${commercialNotes.items
                      .map(
                        (item) => `
                          <li class="note-item">
                            <strong>${escapeHtml(item.title)}</strong>
                            <p>${escapeHtml(item.body)}</p>
                          </li>
                        `
                      )
                      .join("")}
                  </ul>
                </section>
              </aside>
            </div>

            <footer class="footer">
              <span>Prepared for ${escapeHtml(proposal.clientName)}</span>
              <span class="print-only">Standalone export</span>
              <span>Generated from current proposal source data</span>
            </footer>
          </div>
        </main>
      </body>
    </html>`;
}

function buildProposalExportBaseName(clientName: string, title: string) {
  return `${slugify(clientName)}-${slugify(title)}`;
}

function renderTimelineItem(item: string, index: number) {
  const parts = item.split(":");
  const phaseLabel = parts.length > 1 ? parts[0].trim() : `Step ${index + 1}`;
  const detail = parts.length > 1 ? parts.slice(1).join(":").trim() : item.trim();

  return `
    <li class="timeline-item">
      <div class="timeline-phase">${escapeHtml(phaseLabel)}</div>
      <div class="timeline-copy">
        <strong>${escapeHtml(createTimelineHeading(detail, index))}</strong>
        <p>${escapeHtml(detail)}</p>
      </div>
    </li>
  `;
}

function renderScheduledTimelineItem(phase: {
  title: string;
  detail: string;
  rangeLabel: string;
}) {
  return `
    <li class="timeline-item">
      <div class="timeline-phase">${escapeHtml(phase.rangeLabel)}</div>
      <div class="timeline-copy">
        <strong>${escapeHtml(phase.title)}</strong>
        <p>${escapeHtml(phase.detail)}</p>
      </div>
    </li>
  `;
}

function createTimelineHeading(detail: string, index: number) {
  const normalized = detail.replace(/\.$/, "");
  const segments = normalized
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return `Workstream ${index + 1}`;
  }

  return segments.slice(0, 2).join(" and ");
}

function buildExecutiveSummary(
  proposal: NonNullable<Awaited<ReturnType<typeof getProposalById>>>,
  schedule: ReturnType<typeof buildProposalSchedule>
) {
  const summary = cleanSentence(proposal.summary);
  const deliverables = proposal.deliverables.length;
  const phaseLabel = detectPhaseLabel(proposal);
  const durationLabel = schedule
    ? `${formatDuration(schedule.totalDays)} dated delivery plan`
    : proposal.timeline ?? "a timeline to be confirmed";

  return `${summary} This ${phaseLabel.toLowerCase()} is structured around ${deliverables} defined deliverable${deliverables === 1 ? "" : "s"}, with delivery planned over ${durationLabel} and commercial scope held within the stated estimate range.`;
}

function buildScopeNarrative(
  proposal: NonNullable<Awaited<ReturnType<typeof getProposalById>>>
) {
  const scopeCount = proposal.scope.length;
  const deliverableCount = proposal.deliverables.length;

  return `The proposal is framed as a focused ${detectPhaseLabel(proposal).toLowerCase()} with ${scopeCount} core scope item${scopeCount === 1 ? "" : "s"} and ${deliverableCount} defined deliverable${deliverableCount === 1 ? "" : "s"}. The presentation below improves specificity and structure without extending the underlying scope beyond the current source.`;
}

function buildTimelineNarrative(
  proposal: NonNullable<Awaited<ReturnType<typeof getProposalById>>>,
  schedule: ReturnType<typeof buildProposalSchedule>
) {
  if (schedule) {
    const startLabel = schedule.startDate
      ? formatProposalDate(toDateInput(schedule.startDate))
      : null;

    return startLabel
      ? `The delivery plan runs from the requested start date of ${startLabel} through the agreed deadline of ${schedule.deadlineLabel}. Each phase has a dated working window so reviews, QA, and handoff land on or before the final closeout milestone.`
      : `The delivery plan is back-planned from the agreed deadline of ${schedule.deadlineLabel}. Each phase has a dated working window so reviews, QA, and handoff land on or before the final closeout milestone.`;
  }

  const taskCount = proposal.taskBreakdown.length;

  return `The work plan is organized into ${taskCount} implementation step${taskCount === 1 ? "" : "s"} across ${proposal.timeline ?? "the proposed delivery window"}. Sequence, review points, and handoff expectations are presented in a clear client-facing order.`;
}

function buildCommercialNotes(
  proposal: NonNullable<Awaited<ReturnType<typeof getProposalById>>>,
  displayTimeline: string
) {
  return {
    intro: `The current estimate range of ${proposal.priceRange} is presented as a scoped commercial envelope for the work listed in this document.`,
    items: [
      {
        title: "Pricing Basis",
        body: `Range pricing is tied to the defined scope, ${proposal.deliverables.length} listed deliverables, and the ${displayTimeline.toLowerCase()}.`
      },
      {
        title: "Included Work",
        body: "The estimate is intended to cover discovery, execution, review, and handoff only where those activities are explicitly reflected in the scope and task breakdown."
      },
      {
        title: "Change Control",
        body: "Any expansion beyond the documented scope, deliverables, or review cadence should be treated as additional work and re-estimated before approval."
      }
    ]
  };
}

function formatDuration(totalDays: number) {
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  if (weeks > 0 && days > 0) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ${days} day${days === 1 ? "" : "s"}`;
  }

  if (weeks > 0) {
    return `${weeks} week${weeks === 1 ? "" : "s"}`;
  }

  return `${days} day${days === 1 ? "" : "s"}`;
}

function toDateInput(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function deriveRiskLevel(risks: string[]) {
  const joined = risks.join(" ").toLowerCase();
  const highSignals = [
    "security",
    "privacy",
    "compliance",
    "legal",
    "clinical",
    "regulated",
    "integration",
    "vendor"
  ];
  const mediumSignals = ["approval", "scope", "dependency", "calendar", "stakeholder"];
  const highMatches = highSignals.filter((term) => joined.includes(term)).length;
  const mediumMatches = mediumSignals.filter((term) => joined.includes(term)).length;

  if (highMatches >= 2 || risks.length >= 4) {
    return { label: "High", tone: "high" as const };
  }

  if (highMatches >= 1 || mediumMatches >= 1 || risks.length >= 2) {
    return { label: "Moderate", tone: "medium" as const };
  }

  return { label: "Low", tone: "low" as const };
}

function deriveProjectLabel(
  proposal: NonNullable<Awaited<ReturnType<typeof getProposalById>>>
) {
  return detectPhaseLabel(proposal);
}

function detectPhaseLabel(
  proposal: NonNullable<Awaited<ReturnType<typeof getProposalById>>>
) {
  const corpus = `${proposal.title} ${proposal.summary}`.toLowerCase();

  if (corpus.includes("phase 1") || corpus.includes("phase one")) {
    return "Phase 1 engagement";
  }

  if (corpus.includes("discovery")) {
    return "Discovery engagement";
  }

  return "Scoped engagement";
}

function cleanSentence(value: string) {
  const trimmed = value.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
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

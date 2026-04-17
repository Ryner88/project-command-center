# Project Command Center

Project Command Center is a Next.js MVP for an agency-focused morning briefing and proposal generation workspace.

## Stack

- Frontend: Next.js App Router
- Backend: Next.js Route Handlers
- Database: PostgreSQL + Prisma
- AI: OpenAI API
- Export: direct HTML download via route handler
- Storage: local filesystem for demo mode

## Architecture Notes

- `proposal-seeds` captures the handoff from briefing and email context into proposal generation.
- `src/services/integrations` isolates Gmail and Calendar integration logic.
- `src/services/ai` isolates AI-specific orchestration.
- Proposal exports are delivered directly from route handlers, which keeps the deployed flow compatible with serverless platforms like Vercel.

## Getting Started

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm install`.
3. Generate Prisma client with `npm run prisma:generate`.
4. Run migrations with `npm run prisma:migrate`.
5. Start the app with `npm run dev`.

## Demo Mode

- `.env` and other local env variants are gitignored. Only `.env.example` is committed.
- Gmail and Calendar are mocked through `src/services/integrations`, so the briefing works without real Google auth.
- Proposal generation falls back to a local draft builder when `OPENAI_API_KEY` is not set.
- The main route points judges to the three demo checkpoints: Briefing, New Proposal flow, and Proposal Dashboard.

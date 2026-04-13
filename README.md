# Project Command Center

Project Command Center is a Next.js MVP for an agency-focused morning briefing and proposal generation workspace.

## Stack

- Frontend: Next.js App Router
- Backend: Next.js Route Handlers
- Database: PostgreSQL + Prisma
- AI: OpenAI API
- PDF: Puppeteer
- Storage: local filesystem for demo mode

## Architecture Notes

- `proposal-seeds` captures the handoff from briefing and email context into proposal generation.
- `src/services/integrations` isolates Gmail and Calendar integration logic.
- `src/services/ai` isolates AI-specific orchestration.
- `storage/proposals` is local demo storage. Production should replace this with blob storage.

## Getting Started

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm install`.
3. Generate Prisma client with `npm run prisma:generate`.
4. Run migrations with `npm run prisma:migrate`.
5. Start the app with `npm run dev`.

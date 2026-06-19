# LinkShelf

Interview-study bookmark shelf — Next.js App Router, PostgreSQL, Drizzle, Tailwind.

## Journey docs

- [LinkShelf overview](../fullstack-journey/projects/linkshelf/README.md)
- [Phase 0 checklist](../fullstack-journey/projects/linkshelf/phase-0.md)

## Prerequisites

- Node.js 20+
- pnpm
- Docker (local PostgreSQL)

## Quickstart

```bash
pnpm install
cp .env.example .env
pnpm dev:db
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env` and adjust if needed. `.env` is gitignored; never commit secrets.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string for Drizzle |

## Database (local)

```bash
pnpm dev:db          # start Postgres (Docker)
pnpm dev:db:logs     # follow postgres logs
pnpm dev:db:down     # stop containers
docker compose ps    # check health (should be "healthy")
```

## Execution plans

- [Phase 0 — bootstrap](.cursor/plans/phase-0.md) (done): Next.js, Docker Postgres, Drizzle, seed
- [Phase 1 — study build](.cursor/plans/phase-1.md) (active): Route Handlers, UI, interview capstone

Journey checklist: [`../fullstack-journey/projects/linkshelf/phase-0.md`](../fullstack-journey/projects/linkshelf/phase-0.md) — tick when phase-1 ships.

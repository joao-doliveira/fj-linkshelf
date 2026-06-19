# Phase 0 — Bootstrap (execution plan)

**Journey source:** `../fullstack-journey/projects/linkshelf/phase-0.md` (§1–3)  
**Implementation repo:** `fj-linkshelf`  
**Status:** done  
**Next phase:** [phase-1.md](./phase-1.md) — interview study build (API, UI, capstone)

## Outcomes

When Phase 0 (bootstrap) is done:

1. Next.js App Router skeleton runs locally with strict TypeScript and Tailwind.
2. PostgreSQL 16 runs via Docker Compose with documented `DATABASE_URL`.
3. Drizzle schema, migrations, and composite index are applied.
4. Seed script populates demo users and skewed bookmarks for later API/UI work.

**Journey note:** Strategic checklist for the full LinkShelf project stays in Journey `phase-0.md`. Tick Journey items when **implementation phase-1** is complete — not when this bootstrap phase ships.

## Approach summary

Single Next.js App Router app (no monorepo, no `src/`), PostgreSQL 16 via Docker, Drizzle ORM. Infra and data layer only — no Route Handlers or study UI in this phase. Each step validates the previous layer before moving on.

---

## Steps

### Step 1 — Next.js bootstrap

- **Journey ref:** phase-0 §1
- **Goal:** Create the `fj-linkshelf` app skeleton with strict TypeScript and baseline scripts.
- **Why / what you learn:** Establishes the interview stack (Next.js App Router + TS + Tailwind) before any data layer work.
- **Alternatives considered:**

  | Option | Pros | Cons | Decision |
  |---|---|---|---|
  | `pnpm create next-app` | Official defaults, Tailwind wired | Many flags to get right | **Chosen** |
  | Vite + React SPA + separate API | Clear FE/BE split | Extra repo complexity; job posting emphasizes Next.js | Rejected for study scope |
  | Monorepo | Matches TaskMind | Overkill for interview dry setup | Rejected |

- **Deep-dive prompts:**
  - App Router vs Pages Router — why App Router for Route Handlers?
  - What runs on the server vs client in the default template?
- **Interview drill:** Explain file-based routing and where `route.ts` handlers will live.
- **Acceptance:**
  - [x] `pnpm dev` serves the default page
  - [x] `pnpm typecheck` (`tsc --noEmit`) passes
  - [x] `pnpm lint` passes
  - [x] Root README stub links to Journey `projects/linkshelf/`

**Implement:**

- `pnpm create next-app@latest .` — App Router, TypeScript, Tailwind, ESLint, **no** `src/`, import alias `@/*`
- Add `typecheck` script; enable `strict` in `tsconfig.json`
- Pin package manager via Corepack if desired (`packageManager` field)

---

### Step 2 — Docker Postgres and environment

- **Journey ref:** phase-0 §2
- **Goal:** Run PostgreSQL 16 locally via Compose; document connection env vars.
- **Why / what you learn:** Interview talking points on connection strings, Docker networking, and local vs production Postgres.
- **Alternatives considered:**

  | Option | Pros | Cons | Decision |
  |---|---|---|---|
  | Docker Compose | Reproducible, matches Journey projects | Requires Docker running | **Chosen** |
  | Hosted Neon/Supabase free tier | No local Docker | Network dependency; less ops depth | Optional later |
  | Native Postgres install | Fast on host | Harder to reproduce across machines | Rejected |

- **Deep-dive prompts:**
  - What is in `DATABASE_URL`? When does connection pool exhaustion matter (serverless vs long-lived Node)?
- **Interview drill:** Why containerize Postgres for local dev?
- **Acceptance:**
  - [x] `pnpm dev:db` starts Postgres (`docker compose up -d`)
  - [x] `.env.example` documents `DATABASE_URL`
  - [x] `.env` gitignored; README notes copy-from-example flow
  - [x] Healthcheck on postgres service passes

**Implement:**

- `docker-compose.yml` — `postgres:16`, user/db `linkshelf`, port `5432`, named volume, healthcheck
- `.env.example`: `DATABASE_URL=postgresql://linkshelf:linkshelf@localhost:5432/linkshelf`
- `package.json` script: `dev:db`

---

### Step 3 — Drizzle schema, migrations, and index

- **Journey ref:** phase-0 §3
- **Goal:** Define `users` and `bookmarks` tables in Drizzle; generate and apply migrations including composite unique and list index.
- **Why / what you learn:** Schema-as-code, FK integrity, per-user URL uniqueness, index design for `WHERE user_id = ? ORDER BY created_at DESC`.
- **Alternatives considered:**

  | Option | Pros | Cons | Decision |
  |---|---|---|---|
  | Drizzle | SQL-close, light, strong TS | Manual relation setup | **Chosen** |
  | Prisma | Faster bootstrap | Less SQL visibility in interviews | Rejected for study goals |
  | Raw SQL migrations | Maximum control | More boilerplate | Rejected for time |

- **Deep-dive prompts:**
  - Drizzle vs Prisma vs raw SQL — trade-offs?
  - Why composite UNIQUE `(user_id, url)` instead of global unique on `url`?
  - What index supports the shelf list query?
- **Interview drill:** Walk through FK `ON DELETE CASCADE` behavior when a user is deleted.
- **Acceptance:**
  - [x] `db/schema.ts` defines `users` and `bookmarks` per Journey spec
  - [x] `db/index.ts` exports a dev-safe singleton client
  - [x] `drizzle.config.ts` configured for postgres driver
  - [x] Scripts: `db:generate`, `db:migrate` (and `db:studio` optional)
  - [x] Migration applies on empty DB
  - [x] Composite index on `(user_id, created_at)` added (migration or schema index)

**Implement:**

- Dependencies: `drizzle-orm`, `drizzle-kit`, `postgres` (or `pg`)
- Tables per Journey phase-0 §3 column specs
- `references(() => users.id, { onDelete: 'cascade' })` on `bookmarks.user_id`
- Unique constraint on `(user_id, url)`

---

### Step 4 — Seed script

- **Journey ref:** phase-0 §3 (seed acceptance)
- **Goal:** Populate 2–3 users and 5–10 bookmarks each with skewed counts for stats demos.
- **Why / what you learn:** Repeatable demo data; optional transaction wrapping user + bookmarks insert.
- **Deep-dive prompts:**
  - How do migrations stay in sync across dev/staging/prod?
  - When would you wrap seed in a transaction?
- **Interview drill:** Explain idempotent vs destructive seed strategies.
- **Acceptance:**
  - [x] `pnpm db:seed` inserts users (e.g. `alice@study.dev`, `bob@study.dev`) and bookmarks
  - [x] Re-running seed does not duplicate rows (upsert or truncate+insert documented)
  - [x] Bookmark counts differ per user (interesting stats)

**Implement:**

- `db/seed.ts` + `db:seed` script
- Use Drizzle insert; skew bookmark counts between users

---

## Task completion tracking

| Step | Title | Journey ref | Status | Notes |
|------|-------|-------------|--------|-------|
| 1 | Next.js bootstrap | phase-0 §1 | done | Next 16, Tailwind 4, typecheck |
| 2 | Docker Postgres and environment | phase-0 §2 | done | Compose + healthcheck |
| 3 | Drizzle schema, migrations, and index | phase-0 §3 | done | Migration with FK, unique, index |
| 4 | Seed script | phase-0 §3 | done | Alice 10, Bob 6, Carol 2 |

**Current step:** — (phase complete)  
**Last session:** Bootstrap complete — app, Docker Postgres, Drizzle migrations, seed. Study work continues in [phase-1.md](./phase-1.md).

---

## Retrospective

- **What went well:** Clean infra → schema → seed ordering; skewed seed counts ready for stats demos in phase-1.
- **Interview topics still shaky:** Route Handler lifecycle and UI integration deferred to phase-1.
- **Stretch goals completed:** None.
- **Journey mapping:** Implementation phase-0 → Journey `phase-0.md` §1–3. Journey checklist rows 1–3 tick when user ships via `@fj-wrap-up` after phase-1.

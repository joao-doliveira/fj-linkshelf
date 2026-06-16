# Phase 0 — Execution Plan

**Journey source:** `../fullstack-journey/projects/linkshelf/phase-0.md`  
**Implementation repo:** `fj-linkshelf`  
**Status:** planning

## Outcomes

When Phase 0 is done:

1. Local app runs with Docker Postgres and Drizzle migrations applied.
2. User-scoped bookmark CRUD works through plain REST Route Handlers and a Tailwind UI.
3. Activity stats endpoint demonstrates PostgreSQL joins and aggregates.
4. You can walk an interviewer through **request → handler → Drizzle → Postgres → JSON** with concrete file paths and rehearse the interview drills from each step.

## Approach summary

Single Next.js App Router app (no monorepo, no `src/`), PostgreSQL 16 via Docker, Drizzle ORM, plain JSON REST under `app/api/`, Tailwind-only UI. Fake auth via a user switcher (cookie or React state). Steps follow infra → schema → API → UI so each commit validates the previous layer. Route Handlers split into **users/stats** then **bookmarks** to keep commits reviewable.

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
  - [ ] `pnpm dev` serves the default page
  - [ ] `pnpm typecheck` (`tsc --noEmit`) passes
  - [ ] `pnpm lint` passes
  - [ ] Root README stub links to Journey `projects/linkshelf/`

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
  - [ ] `pnpm dev:db` starts Postgres (`docker compose up -d`)
  - [ ] `.env.example` documents `DATABASE_URL`
  - [ ] `.env` gitignored; README notes copy-from-example flow
  - [ ] Healthcheck on postgres service passes

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
  - [ ] `db/schema.ts` defines `users` and `bookmarks` per Journey spec
  - [ ] `db/index.ts` exports a dev-safe singleton client
  - [ ] `drizzle.config.ts` configured for postgres driver
  - [ ] Scripts: `db:generate`, `db:migrate` (and `db:studio` optional)
  - [ ] Migration applies on empty DB
  - [ ] Composite index on `(user_id, created_at)` added (migration or schema index)

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
  - [ ] `pnpm db:seed` inserts users (e.g. `alice@study.dev`, `bob@study.dev`) and bookmarks
  - [ ] Re-running seed does not duplicate rows (upsert or truncate+insert documented)
  - [ ] Bookmark counts differ per user (interesting stats)

**Implement:**

- `db/seed.ts` + `db:seed` script
- Use Drizzle insert; skew bookmark counts between users

---

### Step 5 — Users and stats Route Handlers

- **Journey ref:** phase-0 §4 (users + stats rows)
- **Goal:** Implement `GET /api/users` and `GET /api/users/[id]/stats` with shared validation/error helpers.
- **Why / what you learn:** Route Handler conventions, JSON DTOs, SQL JOIN + aggregates for the stats feature (core PostgreSQL interview material).
- **Alternatives considered:**

  | Option | Pros | Cons | Decision |
  |---|---|---|---|
  | Stats in dedicated handler | Clear REST shape `{ user, totals, recent }` | Extra route | **Chosen** (Journey spec) |
  | Stats via Server Component only | Less API surface | Harder to demo API integration in interviews | Rejected |
  | GraphQL | Flexible reads | Out of scope | Rejected |

- **Deep-dive prompts:**
  - INNER JOIN vs LEFT JOIN for user with zero bookmarks
  - How `COUNT(*)` and `MAX(created_at)` map to the stats DTO
- **Interview drill:** Draw stats query tables on a whiteboard (users ⋈ bookmarks).
- **Acceptance:**
  - [ ] `GET /api/users` returns `{ users: [...] }`
  - [ ] `GET /api/users/[id]/stats` returns `{ user, totals, recent }` per README
  - [ ] Unknown user id → `404` with `{ error }`
  - [ ] Shared `lib/api/errors.ts` (or similar) for consistent error JSON
  - [ ] Handlers marked dynamic (no static caching of DB reads)
  - [ ] curl/Postman exercises both endpoints against seeded data

**Implement:**

- `app/api/users/route.ts`
- `app/api/users/[id]/stats/route.ts`
- Query layer in `db/queries/users.ts` (or inline if minimal)
- Stats: aggregate bookmark count + lastAddedAt; recent N bookmarks (limit 5)

---

### Step 6 — Bookmarks Route Handlers

- **Journey ref:** phase-0 §4 (bookmarks rows)
- **Goal:** Full bookmark CRUD scoped by `userId` with Zod validation and `409` on duplicate URL.
- **Why / what you learn:** REST verbs, status codes, ownership checks, parameterized Drizzle queries (SQL injection story).
- **Deep-dive prompts:**
  - REST vs RPC — why resources + HTTP verbs fit CRUD?
  - Idempotency of `GET` and `DELETE`
  - Where would you proxy a third-party API (e.g. fetch page title from URL)?
- **Interview drill:** Explain request lifecycle for `POST /api/bookmarks` end to end.
- **Acceptance:**
  - [ ] `GET /api/bookmarks?userId=&q=&page=&limit=` → `{ bookmarks, total }`
  - [ ] `POST /api/bookmarks` → `201` + `{ bookmark }`; validates body with Zod
  - [ ] `GET/PATCH/DELETE /api/bookmarks/[id]` with ownership check on mutate
  - [ ] Invalid body → `400` with `{ error, details? }`
  - [ ] Duplicate `(userId, url)` → `409`
  - [ ] `DELETE` → `204 No Content`
  - [ ] All endpoints testable via curl/Postman

**Implement:**

- `lib/validation/bookmark.ts` — Zod schemas for create/patch
- `app/api/bookmarks/route.ts` — GET list + POST create
- `app/api/bookmarks/[id]/route.ts` — GET, PATCH, DELETE
- `db/queries/bookmarks.ts` — scoped selects/updates/deletes
- Catch Postgres unique violation → `409`

---

### Step 7 — Shelf UI (switcher, list, form, delete)

- **Journey ref:** phase-0 §5
- **Goal:** Tailwind UI for user switcher, bookmark list, add form, and delete — wired to Route Handlers via `fetch`.
- **Why / what you learn:** Server vs Client Component split; client-side API integration; Tailwind layout and forms without a UI kit.
- **Deep-dive prompts:**
  - Why Client Component for forms that call `fetch`?
  - Utility-first Tailwind vs CSS Modules — when to switch?
- **Interview drill:** Point to where `userId` is stored (cookie/state) and how list refetches.
- **Acceptance:**
  - [ ] `app/page.tsx` — Server shell + client `Shelf` (or similar) component
  - [ ] User switcher loads from `GET /api/users`; persists selection (cookie or `localStorage`)
  - [ ] Bookmark list from `GET /api/bookmarks?userId=…`
  - [ ] Add form → `POST /api/bookmarks`; list refreshes
  - [ ] Delete with confirm → `DELETE /api/bookmarks/[id]`
  - [ ] Loading, error, and empty states (minimal copy OK)
  - [ ] Responsive layout (mobile + desktop)

**Implement:**

- `components/shelf/` or colocated client components with `'use client'`
- Tailwind: container, flex/grid, form focus rings, accessible labels
- No shadcn/MUI

---

### Step 8 — Stats panel and README quickstart

- **Journey ref:** phase-0 §5 (stats panel) + scope (docs)
- **Goal:** Stats panel on shelf page; complete root README with local dev quickstart.
- **Why / what you learn:** Read-heavy API consumption; documenting the stack for interview demos.
- **Deep-dive prompts:**
  - How would you add real auth without rewriting handlers?
  - Server Action form post vs `fetch` to Route Handler — when each?
- **Interview drill:** 2-minute verbal demo script: switch user → add bookmark → show stats.
- **Acceptance:**
  - [ ] Stats panel calls `GET /api/users/[id]/stats`; shows count, last added, recent list
  - [ ] README: prerequisites, `dev:db`, migrate, seed, `dev`, link to Journey phase file
  - [ ] `.env.example` referenced in README
  - [ ] Full CRUD + stats usable from browser without Postman

**Implement:**

- Stats section in shelf UI
- Expand root README quickstart
- Optional: `STUDY.md` with interview Q&A pointers from Journey phase-0

---

### Step 9 — Verification pass and interview capstone

- **Journey ref:** phase-0 §6
- **Goal:** Run quality scripts, manual smoke test, rehearse verbal drills; optional stretch items if time allows.
- **Why / what you learn:** Closing the loop — interview prep is explaining, not just building.
- **Deep-dive prompts:**
  - Draw request lifecycle in 60 seconds
  - One migration rollback strategy
  - Run `EXPLAIN ANALYZE` on shelf list with/without composite index (stretch)
- **Interview drill:** Timed mock — 15 min demo + 15 min Q&A using running app.
- **Acceptance:**
  - [ ] `pnpm typecheck`, `pnpm lint`, `pnpm build` pass
  - [ ] Manual smoke: switch user → CRUD bookmark → view stats
  - [ ] Verbal checklist from Journey §6 attempted (notes OK)
  - [ ] Plan status ready for `@fj-ls-review`
  - [ ] *(Stretch)* Vitest test for validation helper or one Route Handler
  - [ ] *(Stretch)* `EXPLAIN ANALYZE` screenshot for list query

**Implement:**

- Fix any build/lint issues found
- No mandatory new features unless stretch chosen
- Update plan **Retrospective** during `@fj-ls-review`

---

## Task completion tracking

| Step | Title | Journey ref | Status | Notes |
|------|-------|-------------|--------|-------|
| 1 | Next.js bootstrap | phase-0 §1 | current | |
| 2 | Docker Postgres and environment | phase-0 §2 | todo | |
| 3 | Drizzle schema, migrations, and index | phase-0 §3 | todo | |
| 4 | Seed script | phase-0 §3 | todo | |
| 5 | Users and stats Route Handlers | phase-0 §4 | todo | |
| 6 | Bookmarks Route Handlers | phase-0 §4 | todo | |
| 7 | Shelf UI (switcher, list, form, delete) | phase-0 §5 | todo | |
| 8 | Stats panel and README quickstart | phase-0 §5, scope | todo | |
| 9 | Verification pass and interview capstone | phase-0 §6 | todo | |

**Current step:** 1  
**Last session:**

---

## Retrospective

*(Fill during `@fj-ls-review` when Phase 0 is ready to ship.)*

- **What went well:**
- **Interview topics still shaky:**
- **Stretch goals completed:**
- **Journey checklist mapping:** phase-0 summary rows 1–6 → steps 1–9 above

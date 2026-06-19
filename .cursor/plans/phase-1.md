# Phase 1 — Interview study build (execution plan)

**Journey source:** `../fullstack-journey/projects/linkshelf/phase-0.md` (§4–6)  
**Prerequisite:** [phase-0.md](./phase-0.md) (bootstrap) — **done**  
**Implementation repo:** `fj-linkshelf`  
**Status:** in-progress

## Outcomes

When Phase 1 is done:

1. User-scoped bookmark CRUD works through plain REST Route Handlers and a Tailwind UI.
2. Activity stats endpoint demonstrates PostgreSQL joins and aggregates.
3. You can walk an interviewer through **request → handler → Drizzle → Postgres → JSON** with concrete file paths and rehearse the interview drills from each step.
4. Journey `projects/linkshelf/phase-0.md` checklist is ready to tick via `@fj-wrap-up`.

## Approach summary

Build on the phase-0 bootstrap: plain JSON REST under `app/api/`, Tailwind-only UI, fake auth via user switcher (cookie or React state). Route Handlers split into **users/stats** then **bookmarks** to keep commits reviewable. UI and stats panel follow once the API layer is curl-testable.

**Journey note:** There is no separate Journey `phase-1.md`. This implementation phase maps to Journey **phase-0** §4 (API), §5 (UI), and §6 (capstone). Mark Journey phase-0 complete only after this plan ships.

---

## Steps

### Step 1 — Users and stats Route Handlers

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

### Step 2 — Bookmarks Route Handlers

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

### Step 3 — Shelf UI (switcher, list, form, delete)

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

### Step 4 — Stats panel and README quickstart

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

### Step 5 — Verification pass and interview capstone

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
  - [ ] Tick Journey `phase-0.md` checklist via `@fj-wrap-up` in Journey repo
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
| 1 | Users and stats Route Handlers | phase-0 §4 | current | |
| 2 | Bookmarks Route Handlers | phase-0 §4 | todo | |
| 3 | Shelf UI (switcher, list, form, delete) | phase-0 §5 | todo | |
| 4 | Stats panel and README quickstart | phase-0 §5, scope | todo | |
| 5 | Verification pass and interview capstone | phase-0 §6 | todo | |

**Current step:** 1  
**Last session:** Phase split — bootstrap (phase-0) done; study build starts here.

---

## Journey checklist mapping

| Journey `phase-0.md` row | Implementation phase | When to tick |
|---|---|---|
| 1. Repo + Next.js + Tailwind | phase-0 step 1 | After phase-1 ships (or bootstrap PR if split) |
| 2. Docker Postgres | phase-0 step 2 | Same |
| 3. Drizzle + migrate + seed | phase-0 steps 3–4 | Same |
| 4. Route Handlers | phase-1 steps 1–2 | After phase-1 ships |
| 5. Tailwind UI | phase-1 steps 3–4 | After phase-1 ships |
| 6. Interview drills | phase-1 step 5 | After phase-1 ships |

Tick all Journey rows together when phase-1 is complete — Journey phase-0 represents the full LinkShelf study project.

---

## Retrospective

*(Fill during `@fj-ls-review` when Phase 1 is ready to ship.)*

- **What went well:**
- **Interview topics still shaky:**
- **Stretch goals completed:**

---
name: fj-ls-review
description: >-
  PR-level review of current branch work against the LinkShelf phase plan,
  Journey phase file, and project rules. Invoke with @fj-ls-review. May be
  run multiple times per phase. Read-only unless user asks to fix gaps.
---

# FJ-LS review

Perform a **PR-level review** of current branch work against the detailed plan, Journey phase file, and project rules. Expect multiple invocations per phase (fixes, missing items, back-and-forth).

## Paths

| What | Path (from fj-linkshelf root) |
|------|-------------------------------|
| Active plan | `.cursor/plans/phase-N.md` |
| Journey phase file | `../fullstack-journey/projects/linkshelf/phase-N.md` |
| Project overview | `../fullstack-journey/projects/linkshelf/README.md` |

## Plan document structure

Plans are created via `@fj-plan-on-project` in Journey. Each `.cursor/plans/phase-N.md` follows this shape:

```markdown
# Phase N — Execution Plan

**Journey source:** `../fullstack-journey/projects/linkshelf/phase-N.md`
**Status:** planning | in-progress | review | done

## Outcomes

## Approach summary

## Steps

### Step 1 — Title

- **Journey ref:** phase-N §X
- **Goal:**
- **Why / what you learn:**
- **Alternatives considered:**
- **Deep-dive prompts:**
- **Acceptance:**

## Task completion tracking

| Step | Title | Journey ref | Status | Notes |
|------|-------|-------------|--------|-------|
| 1 | | phase-N §X | current | |

**Current step:** 1
**Last session:**

## Retrospective

(filled during review when the phase is ready to ship)
```

## Procedure

Read-only by default. Do not commit, push, or open a PR unless the user asks to fix gaps.

1. `git diff` and `git log` on current branch vs base (usually `main`).
2. Read `.cursor/plans/phase-N.md` — tracking table, steps, retrospective section.
3. Read Journey `phase-N.md` and `README.md` — outcomes, interview topic map, checklist, acceptance criteria.
4. Review as if approving a PR:
   - **Plan alignment:** branch changes vs completed and remaining plan steps; divergences or skipped work.
   - **Journey alignment:** plan status vs Journey checkboxes and phase acceptance criteria.
   - **Interview coverage:** can the user explain Route Handlers, Drizzle/Postgres, and Tailwind choices from the code?
   - **Code quality:** correctness, conventions, `.cursor/rules/*`, test coverage for changed behavior.
   - **Scope:** anything missing, out of scope, or needing follow-up.
5. Output:
   - Verdict: ready for `@fj-ls-wrap-up` | needs fixes | blocked
   - Done / in-progress / skipped / diverged (per step)
   - Findings by severity (must-fix vs nice-to-have)
   - Gaps and suggested fixes
   - Proposed updates to plan **Retrospective** and Journey checklists (when phase is complete)

Re-run after fixes until the verdict is ready for wrap-up.

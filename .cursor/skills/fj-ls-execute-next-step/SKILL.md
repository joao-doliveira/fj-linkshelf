---
name: fj-ls-execute-next-step
description: >-
  Runs the next incomplete step from the active LinkShelf phase plan in
  .cursor/plans/phase-N.md. Invoke with @fj-ls-execute-next-step. One step
  per invocation — commit before running again.
---

# FJ-LS execute next step

Implement the next incomplete step from the active phase plan. One invocation = one step sized for a single commit.

## Paths

| What | Path (from fj-linkshelf root) |
|------|-------------------------------|
| Active plan | `.cursor/plans/phase-N.md` |
| Journey phase file | `../fullstack-journey/projects/linkshelf/phase-N.md` |
| Project overview | `../fullstack-journey/projects/linkshelf/README.md` |

## Procedure

1. Read `.cursor/plans/phase-N.md`. If missing, tell user to invoke `@fj-plan-on-project` in Journey with `@projects/linkshelf/phase-N.md` attached.
2. Find the **current step** from **Task completion tracking** (`current` row, or first `todo` after last `done`).
3. Read that step's full section (goal, acceptance, interview drills, alternatives).
4. Implement **only that step** in `fj-linkshelf`. Apply `.cursor/rules/*`.
   - Scope the work to a **reasonable commit chunk** — incremental, structured progress, not a multi-step dump.
5. Run acceptance checks listed for the step.
6. Update the plan:
   - Mark completed step `done` in tracking table.
   - Set next step to `current` (or mark phase `review` if all done).
   - Fill **Last session** with date and brief summary.
7. List Journey checklist items to tick (do not tick unless user asks).
8. **Stop after one step.** Do not start the next step in this invocation.

## Commit boundary

Do **not** commit unless the user asks. After finishing the step, remind the user to review, refine if needed, and **commit** before invoking `@fj-ls-execute-next-step` again.

Typical loop: `@fj-ls-execute-next-step` → refine → commit → `@fj-ls-execute-next-step` → …

## Output

Summarize: what was done, suggested commit message, interview drills to rehearse for this step, what to tick in Journey, suggested deep-dives, whether the phase is ready for `@fj-ls-review`.

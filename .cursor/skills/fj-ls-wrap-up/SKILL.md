---
name: fj-ls-wrap-up
description: >-
  Runs quality checks, asks permission to push, and drafts or updates the PR
  description for fj-linkshelf. Invoke with @fj-ls-wrap-up after @fj-ls-review
  passes. This repo only.
---

# FJ-LS wrap up

Ship current implementation work in **fj-linkshelf**. Run after `@fj-ls-review` gives a ready verdict.

## Procedure

1. **Confirm branch** — `git branch --show-current`. All git work in this skill applies to **that branch only**.
   - If on `main` or `master`, stop and ask the user to switch to or create a feature branch (e.g. `phase-0/bootstrap`).
   - Record the branch name; use it for commit, push, and PR steps below.
2. **Review changes** — `git status`, `git diff`, `git log` vs `main` on the **current branch**. Stop if nothing to commit; tell user to commit on this branch first.
3. **Quality checks** — discover scripts from `package.json` (root) and run what exists:
   - **Tests** — e.g. `pnpm test`, `vitest` (skip if none configured).
   - **Lint** — e.g. `pnpm lint` or `eslint`.
   - **Typecheck** — e.g. `pnpm typecheck` or `tsc --noEmit`.
   - **Formatting** — e.g. `pnpm format:check` or `prettier --check`.
   Fix failures on the **current branch** before continuing. If no tooling exists yet, note that and proceed.
4. **Commit** — only if the user asks and there are uncommitted fixes from step 3. Commit **on the current branch only** — stage relevant files (no secrets); message focused on **why**; do not commit unrelated work from other branches.
5. **Push** — ask the user for permission before pushing. If approved, push **only the current branch**:
   - `git push -u origin <current-branch>` if no upstream, else `git push origin <current-branch>`.
6. **PR** — check for an existing PR for **this branch** (`gh pr view --head <current-branch>`):
   - **No PR:** draft a description and `gh pr create --head <current-branch> --base main`; return the URL.
   - **PR exists:** propose an updated description if the branch changed materially; update only if the user asks.

PR body format:

```markdown
## Summary
- <main addition>
- <optional second point>

## Test plan
- [ ] <how to verify>
```

## Guardrails

- Stay in `fj-linkshelf` only.
- Never commit or push from `main` or `master` — use a feature branch per phase or task.
- All commits, pushes, and PRs target the **current branch**; do not mix changes across branches.
- No force-push to `main` or `master`.
- No secrets or `.env` files.
- Do not push without explicit user approval.

## Output

Summarize: current branch, checks run and results, push status, PR URL (or proposed PR body if not yet created).

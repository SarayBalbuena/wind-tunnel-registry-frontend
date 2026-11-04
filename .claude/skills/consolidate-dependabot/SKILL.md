---
name: consolidate-dependabot
description: Combine all open Dependabot PRs/branches into ONE pull request, fix whatever the upgrades break (lint, types, build, tests), then close the individual Dependabot PRs. The consolidated PR is opened but NEVER merged. Use when asked to "handle dependabot", "consolidate dependabot PRs", "merge dependency updates into one PR", "dependabot created branches", or "/consolidate-dependabot".
---

# Consolidate Dependabot PRs

Dependabot opens several PRs (the `minor-and-patch` group plus one PR per major bump, see `.github/dependabot.yml`). This skill turns them into **one** reviewed PR with everything fixed, and closes the originals.

## Hard rules

- **Never merge** the consolidated PR (no `gh pr merge`, no `--auto`, no enabling auto-merge). A human merges it.
- **Never commit on `main`**. Work on a new branch.
- Only close PRs authored by `app/dependabot` / `dependabot[bot]`. Never close anything else.
- Close the Dependabot PRs **only after** the consolidated PR exists and its URL is known.
- Don't push to the `dependabot/*` branches. Don't force-push.
- Never stage `.env*`, `coverage/`, `dist/`, `.idea/`. Stage explicit paths.
- Report real verification results. Never claim green for a step that failed or was skipped.

## 1. Discover

```bash
git fetch --prune origin
gh pr list --state open --author "app/dependabot" --limit 50 \
  --json number,title,headRefName,url \
  --jq '.[] | "\(.number)\t\(.headRefName)\t\(.title)"'
git branch -r | grep 'origin/dependabot/'
```

- No open Dependabot PRs → stop and tell the user there is nothing to consolidate.
- If a consolidated PR from an earlier run is still open (branch `chore/dependabot-updates-*`), tell the user and ask whether to update it or replace it. Don't create a duplicate silently.
- Show the user the list (number, package, from → to, major vs minor/patch) before continuing.

## 2. Create the consolidated branch

```bash
git switch main && git pull --ff-only origin main
git switch -c chore/dependabot-updates-$(date +%Y-%m-%d)
```

If the name already exists locally or on `origin`, add a `-2` suffix.

## 3. Bring in every update

Preferred: merge each Dependabot branch (keeps the exact versions Dependabot chose).

```bash
git merge --no-ff --no-edit origin/dependabot/npm_and_yarn/<branch>
```

`package.json` and `pnpm-lock.yaml` will conflict after the second merge. Resolve like this, never by hand-editing the lockfile:

```bash
git checkout --ours pnpm-lock.yaml   # or: git merge --abort and use the fallback below
# fix package.json so it has the highest version of each package from all branches
pnpm install                          # regenerates pnpm-lock.yaml
git add package.json pnpm-lock.yaml
git commit --no-edit
```

Fallback (simpler when more than one branch conflicts): for each PR read the bumps from its diff (`gh pr diff <n> -- package.json`) and apply them to `package.json` on the new branch, then run `pnpm install` once.

Notes:
- `packageManager` is pinned: use **pnpm only**.
- If a `pnpm-workspace.yaml` is deleted in the working tree, leave it as the user has it; don't restage it.
- Confirm with `git diff main --stat` that only `package.json`, `pnpm-lock.yaml` (and later fixes) changed.

## 4. Verify and fix

Run in CI order:

```bash
pnpm lint:fix
pnpm lint
pnpm build        # tsc -b && vite build, type errors fail it
pnpm test -- --run
```

For each failure, find the cause **in the upgraded package** and fix the repo code:

1. Read the package's changelog / release notes for the bumped range (`gh release view`, the package README, or `pnpm why <pkg>`). Major bumps (e.g. `@babel/core` 7 → 8, `@types/node` 25 → 26) deserve the most attention.
2. Apply the smallest source fix: API renames, config changes (`vite.config.ts`, `tsconfig*.json`, `biome.json`, babel preset options for the React Compiler), new type errors, changed test utilities.
3. Re-run the failing command, then the full set again at the end.
4. Respect repo conventions (named exports, path aliases, inline `type` imports; see `CLAUDE.md` and `docs/styleguide/`).

If one specific upgrade can't be made to work without a large or risky change:
- Revert **only that package** to its previous version in `package.json`, run `pnpm install`, and re-verify.
- Leave its Dependabot PR **open** (do not close it) and list it under "Not included" in the PR body.
- Never delete or skip tests, loosen TypeScript strictness, or add lint ignores just to get green.

If something fails that is unrelated to the upgrades (also fails on `main`), stop and report it with the output.

## 5. Commit

Conventional Commits, one logical change per commit:

```
chore(deps): consolidate dependabot updates          # merge/lock changes
fix(deps): adapt <area> to <package> <version>        # each source fix
```

Add the commit attribution trailer the session requires. Use stage-by-path, not `git add -A`.

## 6. Push and open the PR (do not merge)

```bash
git push -u origin HEAD
```

Title: `[CHORE] - Consolidate dependency updates (YYYY-MM-DD)`.
Body: the repo template (`.github/pull_request_template.md`), with "Chore" ticked, and:

```markdown
# Description

Combines the open Dependabot PRs into a single PR and fixes the breakage they caused.

## Context

- Supersedes: #<n>, #<n>, #<n>

## List of changes

### Dependency updates
| Package | From | To | Type |
| --- | --- | --- | --- |
| … | … | … | major / minor / patch |

### Code fixes required by the upgrades
- <file>: <what and why>

### Not included
- <package + reason, or "None">

# Type of change

-   [x] Chore (changes to the build process or auxiliary tools and libraries)

# UI/UX

No UI changes.

## Verification

- `pnpm lint` ✅/❌
- `pnpm build` ✅/❌
- `pnpm test -- --run` ✅/❌ (<N> tests)
```

```bash
gh pr create --base main --title "[CHORE] - Consolidate dependency updates (YYYY-MM-DD)" --body-file - <<'EOF'
…body…
EOF
```

Append the PR attribution line the session requires. In PR text, never write a bare `@name`; use backticks for package names such as `@babel/core`.

**Do not merge it. Do not enable auto-merge.**

## 7. Close the Dependabot PRs

Only for PRs whose update is included in the consolidated PR:

```bash
gh pr close <n> --delete-branch \
  --comment "Superseded by <consolidated PR URL>, which includes this update. Closing."
```

- `--delete-branch` removes the `dependabot/*` remote branch.
- Skip any PR listed under "Not included".

## 8. Report

Give the user: the consolidated PR URL, the packages upgraded (from → to), the code fixes made, which Dependabot PRs were closed (and which were left open and why), the verification results, and a reminder that the PR is **not merged** and needs human review.

## Making it automatic

`.github/workflows/dependabot-consolidate.yml` runs this skill every Wednesday at 08:00 UTC (and on manual `workflow_dispatch`). It skips the run when there are no open Dependabot PRs and explicitly forbids `gh pr merge`.

Requirements: repo secret `ANTHROPIC_API_KEY`. Optional secret `DEPENDABOT_PR_TOKEN` (a PAT): PRs opened with the default `GITHUB_TOKEN` don't trigger the CI workflow, so use a PAT if you want CI to run on the consolidated PR.

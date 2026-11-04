---
name: create-pull-request
description: Commit pending work and open a GitHub pull request for this repo - creates a feature branch if on main, writes Conventional Commits, runs lint/build/test, pushes, and opens the PR with the repo's title format ("[FEAT] - …") and PR template. Use when asked to "create a PR", "open a pull request", "commit and push", "ship this", or "/create-pull-request".
---

# Create pull request

Conventions are taken from the repo's merged PRs and `.github/pull_request_template.md`.

## 0. Inspect

```bash
git status --short
git branch --show-current
git diff --stat && git diff --cached --stat
git log --oneline main..HEAD
```

- No changes and no commits ahead of `main` → stop and tell the user there is nothing to open.
- Unrelated changes in the working tree (files the current task didn't touch) → ask the user which ones to include. Don't sweep them into the PR.
- **Never stage** `.env*` files (except `.env.example`), `coverage/`, `dist/`, `.idea/` or anything that looks like a secret.

## 1. Classify the change

Pick one **type**. It drives the branch, the commit and the PR title:

| type | Use for | PR tag |
| --- | --- | --- |
| `feat` | new user-facing functionality | `[FEAT]` |
| `fix` | bug fix | `[FIX]` |
| `refactor` | code change with no behaviour change | `[REFACTOR]` |
| `style` | visual/CSS-only changes | `[STYLE]` |
| `test` | add or modify tests only | `[TEST]` |
| `docs` | documentation, CLAUDE.md, skills, agents | `[DOCS]` |
| `chore` | tooling, deps, config, CI, build | `[CHORE]` |
| `perf` | performance | `[PERF]` |

Optional **scope** = the main area touched: `entries`, `reports`, `auth`, `layout`, `user-menu`, `ui`, `tests`, `deps`, `ci`, `otel`, `claude`.

## 2. Branch: never commit on `main`

If the current branch is `main` (or `master`), create a branch first:

```bash
git switch -c <type>/<short-kebab-description>
```

Examples from history: `feat/delete-entry`, `feat/user-menu-redesign`, `fix/css-cards`, `chore/adding-bluebox`.
- 2 to 5 words, lowercase kebab-case, no ticket noise. Spell it correctly.
- If the branch name already exists locally or on `origin`, add a suffix (`-2`) or pick a more specific name.
- Already on a feature branch → stay on it.

## 3. Verify before committing

CI runs these on every PR. Run them locally first:

```bash
pnpm lint:fix
pnpm lint
pnpm build
pnpm test -- --run
```

If any of them fails, fix it if it's caused by this change. If it's an existing failure, stop and report it to the user with the output. Never push a red branch silently.

## 4. Commit with Conventional Commits

Format: `<type>(<scope>): <imperative summary>`. Lowercase, no trailing period, ≤ 72 chars. The scope is optional.

```
feat(entries): add delete confirmation dialog
fix(reports): show 0 min when there are no flights
chore(deps): bump vitest to 4.1.4
docs(claude): add architecture and styleguide docs
test(entries): cover create/edit/delete flows
```

- Body (optional, after a blank line): explain *why*, wrap at ~72 chars, use bullets for several changes.
- Breaking change: `feat(api)!: …` plus a `BREAKING CHANGE: …` footer.
- Split unrelated changes into separate commits (e.g. `refactor` then `feat`). One logical change per commit.
- Stage explicit paths (`git add src/components/Entries …`), not `git add -A`.
- Add any commit attribution trailer the session requires.
- Use a heredoc for multi-line messages:
  ```bash
  git commit -F - <<'EOF'
  feat(entries): add delete confirmation dialog

  - Reuse ConfirmDialog from components/ui
  - Revalidate reports after deleting an entry
  EOF
  ```

## 5. Push

```bash
git push -u origin HEAD
```

## 6. Open the PR

**Title**: `[TYPE] - <Short description in sentence case>`. It becomes the squash-merge commit on `main`, so make it descriptive. Examples from history:
- `[FEAT] - Delete entry + confirm dialog`
- `[FEAT] - Card improvements + modal improvements`
- `[CHORE] - Setup tests + biome format`

**Body**: fill in `.github/pull_request_template.md`. Keep its headings and tick exactly the matching "Type of change" boxes:

```markdown
# Description

<1–3 sentences: what changed and why. Reference issues with "Fixes #N" if any.>

## Context

- <motivation / background>

## List of changes

- <grouped by area: services, hooks, components, styles, tests, docs>

# Type of change

-   [ ] Chore (changes to the build process or auxiliary tools and libraries)
-   [ ] Configuration (non-breaking change which adds app configuration)
-   [ ] Bug fix (non-breaking change which fixes an issue)
-   [x] New feature (non-breaking change which adds functionality)
-   [ ] Refactor (non-breaking change which improves a functionality)
-   [ ] Test (non-breaking change which adds or modifies tests)
-   [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
-   [ ] This change requires a documentation update

# UI/UX

<For visual changes: describe light/dark/mobile behaviour, and remind the user to attach screenshots. Otherwise: "No UI changes.">

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- `pnpm test -- --run` ✅ (<N> tests)
```

Report the real verification results. Never tick ✅ for a step you didn't run or that failed. Append any PR attribution line the session requires.

Create the PR against `main`:

```bash
gh pr create --base main --title "[FEAT] - …" --body-file - <<'EOF'
…body…
EOF
```

- If a PR already exists for the branch (`gh pr view --json url`), push the new commits and report the existing URL instead of creating another.
- Don't add reviewers, labels or `--draft` unless the user asks.
- In PR text, don't write a bare `@name` unless it's a real GitHub user you mean to notify.

## 7. Report

Give the user: branch name, commits (`git log --oneline main..HEAD`), verification results, and the PR URL.

---
name: create-pr
description: Use ONLY when changes for a MapGuesser GitHub issue are already committed and pushed and the user wants a pull request opened and the PR linked back on the issue. Encodes this repo's PR title, body, and bidirectional issue↔PR comment conventions.
---

# Create PR and link it to the issue

## Preconditions

- Changes are already committed and the current branch is pushed.
- Confirm the working tree is clean with `git status --porcelain`; if it is not empty, stop and tell the user to commit first.

## 1. Resolve the issue number

- Read `git branch --show-current`. If it matches `^(\d+)-`, that number is the issue number.
- Otherwise use the number passed as an argument; if neither exists, ask the user.
- Derive `<owner/repo>` with `gh repo view --json nameWithOwner -q .nameWithOwner`.

## 2. Ensure the branch is on the remote

- If `git rev-parse --abbrev-ref @{u}` fails, run `git push -u origin <branch>`.
- If a PR already exists for the branch (`gh pr view --json url -q .url`), skip creation, reuse that URL, and only add the issue comment if it is missing.

## 3. Open the PR

- Title format: `<issue-number> - <Description>` — number, space-hyphen-space, then a sentence-case imperative description with no trailing period.
- Body: the raw issue URL on its own line, e.g. `https://github.com/<owner>/<repo>/issues/<n>`.
- Do NOT use `Closes #n` or any closing keyword — this repo links with raw URLs only.

```
gh pr create --base main --title "<n> - <Description>" --body "https://github.com/<owner>/<repo>/issues/<n>"
```

## 4. Link the PR back on the issue

```
gh issue comment <n> --body "<pr-url>"
```

## 5. Report the PR URL and stop

- Print the PR URL so the user can review it.
- Do not merge the PR.

---
name: commit
description: Commit the working tree as small conventional commits, one per logical chunk of work. Use when the user says "commit", "micro commit", "commit this", or "/commit". Pushes a task branch and opens a pull request that merges itself when CI passes.
---

# Commit

Group the uncommitted work into micro commits, push the branch, and open a pull request that merges itself when CI passes. Runs in this session right after `code-review`: you already know the diff, so don't re-read it, review it again, or run the checks again.

## Steps

1. `git status --short && git diff --stat HEAD`. Stop if a merge or rebase is in progress, or if `code-review` ended with `Ready to commit: no`. On `main`, create `<type>/<short-slug>` first.
2. Group from what you already know: each commit is one change a reviewer could revert. Tests go with their code, `package-lock.json` with `package.json`, and each post's content on its own. A file with two changes goes in the commit of its main one. Read a file's diff only if you don't know what changed in it. Never force-add gitignored files.
3. Commit each group with `git add <paths> && git commit -m "<subject>"`. Let the lefthook hooks run (never `--no-verify`). If a hook fails, fix it and retry once; otherwise stop and report.
4. Push, then open the pull request unless the branch already has one:

```bash
git push -u origin HEAD
gh pr view --json url -q .url 2>/dev/null || {
  gh pr create --base main --title "<main commit subject>" --body "<one line per commit>"
  gh pr merge --auto --rebase --delete-branch
}
```

## Rules

- Format: `type: subject`, type one of `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `chore`, `content`.
- Subject: lowercase, imperative, no period, under 72 characters. Add a body only for a reason the subject can't give.
- Follow the writing rules in `docs/code-standards.md`.
- No trailers, co-authors, or "Generated with" lines. Never push to `main`.

## Report

The commits as `sha subject` and the pull request URL.

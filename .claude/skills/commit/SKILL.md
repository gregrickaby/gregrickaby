---
name: commit
model: claude-haiku-5-5
context: fork
description: Commit the working tree as small conventional commits, one per logical chunk of work. Use when the user says "commit", "micro commit", "commit this", or "/commit". Pushes a task branch and opens a pull request that merges itself when CI passes.
---

# Commit

Group the uncommitted work into micro commits, push the branch, and open a pull request that merges itself when CI passes. You can't see the conversation and nobody answers questions: make each call yourself and say so in the report.

## Steps

1. `git status --short` and `git diff --stat HEAD`. Stop if a merge or rebase is in progress. On `main`, create `<type>/<short-slug>` first.
2. Read the diff a file or group at a time. Group it so each commit is one change a reviewer could revert: tests with their code, `package-lock.json` with `package.json`, each post's content on its own. Put a file with two changes in the commit of its main one. Never force-add gitignored files.
3. Commit each group. Let the lefthook hooks run (never `--no-verify`); fix formatting or import-order failures and retry, otherwise stop and report.
4. Push and open the pull request:

```bash
git push -u origin HEAD
gh pr create --base main --title "<main commit subject>" --body "<one line per commit>"
gh pr merge --auto --rebase --delete-branch
```

## Rules

- Format: `type: subject`, type one of `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `chore`, `content`.
- Subject: lowercase, imperative, no period, under 72 characters. Brief. Add a body only for a reason the subject can't give.
- Follow the writing rules in `docs/code-standards.md`.
- No trailers, co-authors, or "Generated with" lines. Never push to `main`.

## Report

The commits as `sha subject`, the pull request URL, and anything left uncommitted.

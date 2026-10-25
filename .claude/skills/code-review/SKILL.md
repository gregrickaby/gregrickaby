---
name: code-review
description: Review changed code against this repo's standards and fix what it finds before committing. Use when the user says "review my code", "do a code review", or "/code-review".
---

# Code review

Catch what a careful human reviewer would flag, fix it, and validate once. Runs in this session, so reuse what's already in context: don't re-read files you've read since they last changed.

## 1. Scope

```bash
git status --short && git diff --stat HEAD
```

Review `.ts`, `.tsx`, `.css`, and Markdown under `public/content/`. Skip `.generated/`, `*.module.css.d.ts`, and `node_modules`. If the arguments name a commit range, review that instead.

## 2. Standards

`AGENTS.md` is already loaded. Read `docs/code-standards.md` once per session. Open a config file (`eslint.config.ts`, `stylelint.config.ts`, `lib/headers.ts`, `scripts/build-content.ts`) only when a finding depends on it.

## 3. Review

Read the diff a file or group at a time (`git diff HEAD -- <paths>`) and new files in full. Open more of a file only where the diff lacks context. Grep for nearby conventions instead of reading sibling files.

Check for:

- **Architecture rules** in `AGENTS.md` (static by contract, islands, `prefetch={true}`, HTML injection, `next/image`, no `memo`/`useCallback`/`useMemo`/barrels/`any`/`NEXT_PUBLIC_`, styles in `@layer components` with tokens).
- **Correctness:** boundary inputs (dates, empty values, missing images or EXIF, first and last post), and whether tests pin the risky boundary.
- **Without JavaScript:** pages, links, search, and likes still work.
- **Security:** unsanitized HTML, JSON-LD not through `serializeSchema`, CSP or header regressions.
- **Conventions and prose:** naming, comments, tests, and the writing rules in `docs/code-standards.md`.
- **E2E specs:** CI runs them, not you, so grep `e2e/` for every title, heading, label, selector, and file name the diff changed or moved, and update the specs that depend on them.
- **Leftovers:** images, modules, styles, or tests nothing references after the diff (grep for the file name). Delete them.

Tag each finding **Blocker**, **Suggestion**, or **Nit**, and fix it. Leave one unfixed only for a good reason and say why. Take anything that's the user's call (a design choice, a waiver) to them as a **Question** instead of guessing.

## 4. Report

| #   | File | Line | Severity | Finding | Fix |
| --- | ---- | ---- | -------- | ------- | --- |

One row per finding; skip files with nothing to report. The Fix column says what changed, or why it was left.

## 5. Validate

```bash
npm run format && npm run check 2>&1 | tail -40
```

Coverage must stay at 100%. Fix failures and re-run until clean. Never run `npm run build` or `npm run test:e2e`; CI runs them. Skip Chrome unless the user asks; list the pages a UI change touches so they can check them on their dev server.

End with one line: `Ready to commit: yes`, or `no` and what's open.

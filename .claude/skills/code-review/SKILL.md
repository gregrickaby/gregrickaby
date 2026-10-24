---
name: code-review
model: claude-opus-5-5
context: fork
description: Review changed code against this repo's architecture rules and conventions, and request changes before committing. Use when the user says "review my code", "do a code review", or "/code-review".
---

# Code review

Catch everything a careful human reviewer would flag and request changes. Don't edit files and never commit: the session that called you fixes the findings and runs you again, until a round comes back clean.

You run in a fresh context: you can't see the conversation, and nobody answers questions. Make each call yourself and explain it in the report.

## 1. Scope

Review the uncommitted work: `git status --short`, `git diff --stat HEAD`, and `git ls-files --others --exclude-standard` for new files. If this skill's arguments name a commit range, review that instead (`git diff --stat <range>`). If there's nothing to review, say so and stop.

Keep `.ts`, `.tsx`, `.css`, and Markdown under `public/content/`. Skip `.generated/`, `*.module.css.d.ts`, and `node_modules`.

## 2. Standards

Read `AGENTS.md` and `docs/code-standards.md`. Read a config file only when a finding depends on it:

| Concern                         | File                                             |
| ------------------------------- | ------------------------------------------------ |
| Lint rules, allowed HTML        | `eslint.config.ts`                               |
| CSS layers, tokens              | `stylelint.config.ts`, `app/styles/tokens.css`   |
| Coverage thresholds             | `vitest.config.ts`                               |
| CSP, security headers           | `lib/headers.ts`                                 |
| Old WordPress URLs              | `lib/redirects.ts`                               |
| Markdown, images, EXIF at build | `scripts/build-content.ts`, `lib/content-build/` |
| E2E, no-JavaScript, `instant()` | `e2e/site.spec.ts`, `playwright.config.ts`       |

## 3. Review

Read the diff one file or group at a time (`git diff HEAD -- <paths>`), and new files in full. Open the rest of a file only where the diff lacks context. Read the tests for changed logic (`tests/unit/` mirrors the source tree). Grep for nearby conventions instead of reading sibling files.

Check each file for:

- **Architecture rules** in `AGENTS.md`, first:
  - Request-time filesystem reads (other than the likes database), or app code importing `lib/content-build/*`
  - Anything in `app/(site)/` reading cookies, headers, or search params, or doing uncached work (breaks `ensureStatic`)
  - Links to `[slug]`, `tag/[tag]`, or `category/[category]` without `prefetch={true}`
  - Client code outside `components/islands/`, or islands that fetch or import server modules (the like button's server actions are the one exception)
  - `dangerouslySetInnerHTML` outside `components/prose.tsx`, `components/json-ld.tsx`, and the theme script in `app/layout.tsx`
  - `<img>` in components instead of `next/image`; HDR gain map JPEGs sent through the optimizer at full size
  - `memo()`, `useCallback()`, `useMemo()`, barrel files, UI libraries, `any`, `NEXT_PUBLIC_`
  - Styles outside `@layer components`, or raw colors instead of tokens
  - Broken view transition names on post images (`components/post-image.tsx`)
- **Correctness:** trace boundary inputs (dates and timezones, empty tags or categories, posts without images, missing EXIF, first and last post for prev/next links), not just the happy path. Before trusting a date, slug, or format, grep how `lib/format.ts` and sibling code handle the same value. A green suite doesn't prove the test values hit the risky boundary: check what each test pins.
- **Without JavaScript:** pages, links, search, and likes still work with JavaScript off. A changed user flow needs coverage in the no-JavaScript project of `e2e/site.spec.ts`.
- **Security:** Markdown or EXIF reaching HTML without the build-time sanitizer, JSON-LD not escaped through `serializeSchema`, CSP or header regressions, redirect loops.
- **Code standards** that lint can't check: naming, comments, props typing, error handling, test structure.
- **Prose:** UI copy, docs, and post content follow the writing rules in `docs/code-standards.md`.
- **Praise:** anything done well. Specific and brief.

Tag each finding **Blocker**, **Suggestion**, **Nit**, or **Praise**. Every Blocker, Suggestion, and Nit is a change you're requesting, and any one of them fails the review. Don't list something you'd accept as is; leave it out or call it Praise. Tag anything that needs the user's call (a design choice, a waiver) **Question**; it fails the review too.

## 4. Validate

Work sessions skip the browser check, and CI runs the build and E2E on the pull request, so never run `npm run build` or `npm run test:e2e` here. Run in this order:

1. `npm run format:check` and `npm run check`. `check` includes coverage, which must stay at 100%.
2. For UI changes, check the page in Chrome against the user's dev server at https://localhost:3000 when the Chrome tools are available (never start a server). Run `npm run content -- --drafts` first so drafts show. Check the rendered page in light and dark themes, at phone width, the main interaction, and console errors. Save a screenshot of each visual change to disk and list the paths in the report. If Chrome isn't available, say live checking wasn't possible.

A failing command is a Blocker with its error. A check you couldn't finish (Chrome unavailable, a viewport the browser won't reach) is a Question, so the user decides whether to waive it.

Pipe long output through `tail -40` and read screenshots back only to judge them; the report carries paths, not images.

## 5. Record the pass

Only when the round has no Blocker, Suggestion, Nit, or Question and every check ran and passed, record the tree so `commit` can check it:

```bash
.claude/skills/code-review/tree-hash.sh > "$(git rev-parse --git-dir)/review-passed"
```

Otherwise delete that file if it exists.

## 6. Report

The report is relayed to the user, so it's the only output that matters.

| #   | File | Line | Severity | Finding | Fix |
| --- | ---- | ---- | -------- | ------- | --- |

One row per finding, none for files without one. The Fix column says what to change. Then one line each for validation results, screenshot paths, and anything left for the user to decide.

End with a verdict line: `Ready to commit: yes` when the pass was recorded, otherwise `Ready to commit: no` and the count of open findings.

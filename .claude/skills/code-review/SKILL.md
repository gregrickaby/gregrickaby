---
name: code-review
model: claude-opus-5-5
description: Review changed code against this repo's architecture rules and conventions, and fix issues before committing.
---

# Code Review

**Triggers:** "review my code", "do a code review", `/code-review`

Goal: catch everything a careful human reviewer would flag before the change is committed.

## Steps

### 1. Collect changed files

```bash
git diff --name-only HEAD
```

Deduplicate. Keep `.ts`, `.tsx`, `.css`, and `.md` under `public/content/`. Skip `.generated/`, `*.module.css.d.ts`, and `node_modules`.

### 2. Load standards

The standards are `AGENTS.md` (already in context) and `~/.claude/rules/writing-style.md`. Read the matching config only when a finding depends on it:

| Concern                         | File                                          |
| ------------------------------- | --------------------------------------------- |
| Lint rules, allowed HTML        | `eslint.config.ts`                           |
| CSS layers, tokens              | `stylelint.config.ts`, `app/styles/tokens.css` |
| Coverage thresholds             | `vitest.config.ts`                           |
| CSP, security headers           | `lib/headers.ts`                              |
| Old WordPress URLs              | `lib/redirects.ts`                            |
| Markdown, images, EXIF at build | `scripts/build-content.ts`, `lib/content-build/` |
| E2E, no-JavaScript, `instant()` | `e2e/site.spec.ts`, `playwright.config.ts`    |

### 3. Review files

Read the diff first (`git diff HEAD`), then the full file only where the diff lacks context. Read the tests for changed logic (`tests/unit/` mirrors the source tree). Grep for nearby conventions rather than reading sibling files in full.

For each file, evaluate:

- **Architecture rules:** does the change break any rule in `AGENTS.md`? Check these first:
  - Request-time filesystem reads, or app code importing `lib/content-build/*`
  - Anything in `app/(site)/` reading cookies, headers, or search params, or doing uncached work (breaks `ensureStatic`)
  - Links to `[slug]`, `tag/[tag]`, or `category/[category]` without `prefetch={true}`
  - Client code outside `components/islands/`, or islands that fetch or import server modules
  - `dangerouslySetInnerHTML` outside `components/prose.tsx`, `components/json-ld.tsx`, and the theme script in `app/layout.tsx`
  - `<img>` in components instead of `next/image`; HDR gain map JPEGs sent through the optimizer at full size
  - `memo()`, `useCallback()`, `useMemo()`, barrel files, UI libraries, `any`, `NEXT_PUBLIC_`
  - Styles outside `@layer components`, or raw colors instead of tokens
  - Broken view transition names on post images (`components/post-image.tsx`)

  Cite the rule, explain, and give a fix with code.

- **Code coverage:** coverage is 100% and must stay there. Verify with `npm run test`, don't infer it from reading the test file. If coverage drops, fix it. Server components render through `tests/helpers/render-server.tsx`; content comes from `tests/helpers/content.ts` with `vi.mock('@/.generated/content.json')`; component tests start with `// @vitest-environment happy-dom`.
- **Correctness and edge cases:** trace what the code does under boundary inputs (dates and timezones, empty tags or categories, posts without images, missing EXIF, first and last post for prev/next links), not just whether it compiles and the happy-path test passes. Before trusting a date, slug, or formatting choice, grep for how `lib/format.ts` and sibling code handle the same value and flag any divergence. A green suite doesn't prove the test values hit the risky boundary: check what the test pins.
- **Without JavaScript:** pages, links, and search must still work with JavaScript off. If a user flow changed, check that `e2e/site.spec.ts` covers it in the no-JavaScript project.
- **Security:** Markdown or EXIF reaching HTML without the build-time sanitizer, JSON-LD not escaped through `serializeSchema`, CSP or header regressions, redirect loops.
- **Project conventions:** does this follow the established patterns in the codebase? Comment density, naming, file placement. If not, fix it.
- **Prose:** UI copy, docs, and post content follow `~/.claude/rules/writing-style.md`.
- **Praise:** call out anything done well. Specific, brief, no padding.

Tag every finding **Blocker**, **Suggestion**, or **Nit**.

Fix all Blockers and rule violations before Step 4. Fix Suggestions and Nits too unless there's a good reason not to, and say so if one is left. Praise notes are informational only.

### 4. Present findings

| #   | File | Line | Severity | Finding | Fix |
| --- | ---- | ---- | -------- | ------- | --- |

One row per finding. Skip files with nothing to report rather than padding the table with "no issues" rows. In the Fix column, say what changed, or "flagged only" for Praise or anything deliberately left alone. Print this table before running validation.

Close with a one-line status: for example "All findings fixed; validation clean" or "1 suggestion left unfixed (see row 3), confirm before committing."

### 5. Validate

```bash
npm run format:check
npm run check
npm run build
```

Run `npm run test:e2e` when a change touches a user flow. For UX changes, check the page in Chrome against the user's running dev server (never start it).

Fix all errors and re-run until clean. Report the final output.

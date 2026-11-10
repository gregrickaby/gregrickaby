---
name: code-review
description: Review changed code against this repo's standards and fix what it finds before committing. For posts and pages, also reviews voice, AI tells, and on-page SEO. Use when the user says "review my code", "do a code review", or "/code-review".
agent: claude-opus-5-5
---

# Code review

Catch what a careful human reviewer would flag, fix it, and validate once. Runs in this session, so reuse what's already in context: don't re-read files you've read since they last changed.

## 1. Scope

```bash
git status --short && git diff --stat HEAD
```

Review `.ts`, `.tsx`, `.css`, and Markdown under `public/content/`. Skip `.generated/`, `*.module.css.d.ts`, and `node_modules`. If the arguments name a commit range, review that instead. Don't report what `npm run check` or `npm run format` catches (formatting, lint, types, coverage); step 5 fixes those.

## 2. Standards

`AGENTS.md` is already loaded. Read `docs/code-standards.md` once per session. Open a config file (`.oxlintrc.json`, `stylelint.config.mjs`, `lib/headers.ts`, `scripts/build-content.ts`) only when a finding depends on it.

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

Tag each finding:

- **Blocker:** a page, link, search, or like breaks (with or without JavaScript), a draft or secret ships, a log leaks visitor data, or copy and docs state something the code doesn't do.
- **Suggestion:** a break from `AGENTS.md` or `docs/code-standards.md`, a missing test on a risky boundary, or a leftover.
- **Nit:** naming or wording taste. Report at most five.

### Posts

When the diff touches a post or page under `public/content/`, review its prose and its search basics too, in the same pass. Load the `blog-voice` and `humanizer` skills (once per session), and read the post in full, not just the diff.

- **Voice** (`blog-voice`): its self-check list. Every fact, number, and anecdote must come from Greg, the repo, or a source you checked; flag anything you can't trace.
- **AI tells** (`humanizer`): sections A to E, strongest first. Fix tells in the new prose. In Greg's own sentences, flag instead of rewriting.
- **SEO**, from "What to look for" in the `seo-audit` skill, for this one post. Read the rendered page's meta with `curl -sk https://localhost:3000/<slug>`; if the dev server isn't up, read the frontmatter. Check:
  - The title is under about 45 characters, with the searched words first.
  - The description is 140 to 155 characters and states a concrete detail the post delivers.
  - The first paragraph after the hook answers the title in words an AI answer could quote.
  - `##` headings use the words people search for.
  - Images have alt text that says what's in them.
  - The post links related posts with anchor text that names the topic, and related posts link back once it's published.
  - Run `search-console.ts performance --by query --days 90` for the topic's words, to see what people already search for.

Fix what you find, SEO included: write the new title, description, or heading with `blog-voice`, apply the best one, and put the runner-up in the Fix column so Greg can swap it. Keep the hook and Greg's own jokes; work the searched words in around them. Report these in the same table, with the post's path as the File.

Cite the `file:line` each finding is about. A claim about behavior points to the code that does it, not a guess from a name. Re-read that code before fixing, and drop the finding if it doesn't hold up.

Fix each finding that survives. Leave one unfixed only for a good reason and say why. Take anything that's the user's call (a design choice, a waiver) to them as a **Question** instead of guessing.

## 4. Report

Start with the count, such as `3 findings: 1 Blocker, 2 Nits`. With none, write `No findings` and skip the table.

| #   | File | Line | Severity | Finding | Fix |
| --- | ---- | ---- | -------- | ------- | --- |

One row per finding; skip files with nothing to report. The Fix column says what changed, or why it was left.

## 5. Validate

```bash
npm run format && npm run check 2>&1 | tail -40
```

Coverage must stay at 100%. Fix failures and re-run until clean. Never run `npm run build` or `npm run test:e2e`; CI runs them. Skip Chrome unless the user asks; list the pages a UI change touches so they can check them on their dev server.

End with one line: `Ready to commit: yes`, or `no` and what's open.

---
name: hygiene
description: Whole-repo tune-up. Audits folder layout, dead code, stale paths, AGENTS.md, ADRs, and skills for drift and bloat, then reviews the codebase as a discerning senior engineer and fixes what's worth fixing. Use when the user says "hygiene", "tune-up", "clean up the repo", "audit the codebase", or "/hygiene".
---

# Hygiene

`code-review` checks a diff; this checks the whole repo. Fix what earns its churn and say plainly what you left alone and why. Read `docs/code-standards.md` and `docs/adr/` first (`AGENTS.md` is already loaded).

Start on a branch from an up-to-date `main`: `chore/hygiene-<yyyy-mm>`.

## 1. Layout

```bash
git ls-files | grep -vE '^(public/content|\.generated|node_modules)/' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -30
```

- **Files that should be a folder:** three or more files in one folder that form one subsystem (a shared prefix, or imports only among themselves). Move them with `git mv`.
- **Folders that should be a file:** a root folder holding one file. Merge it with its neighbors.
- **Wrong home:** build-time code in `lib/`, runtime code in `scripts/`, or client code outside `components/islands/`. Check the import graph matches the Layout section of `AGENTS.md`.
- **Tests** mirror the source folders.
- **Leave alone:** a flat folder that's still easy to scan. Regrouping that touches hundreds of imports for taste isn't worth it.

After any move, update imports, `.oxlintrc.json` globs, `vitest.config.ts` coverage, `playwright.config.ts`, `stylelint.config.mjs`, and every doc, skill, and post that names the old path.

## 2. Dead and stale

- **Unreferenced files:** for each module, image, style, and test, grep for its file name. Delete what nothing uses.
- **Unused exports:** grep each `export` name outside its own file and its test. Remove the export, or the code if nothing calls it.
- **Stale paths in prose:** every path in `AGENTS.md`, `docs/`, `.claude/skills/`, and posts must exist.

```bash
for f in $(grep -rhoE "github.com/gregrickaby/gregrickaby/(blob|tree)/main/[^)#\" ]+" public/content docs .claude AGENTS.md | sed -E 's|.*/main/||' | sort -u); do [ -e "$f" ] || echo "missing: $f"; done
grep -rhoE '`[a-z.][a-z0-9_./-]+\.(ts|tsx|css|md|json|mjs)`' AGENTS.md docs .claude/skills | tr -d '`' | sort -u | while read -r f; do [ -e "$f" ] || echo "check: $f"; done
```

The second list includes globs and example names; check each by hand.

- **Dependencies:** `npm outdated` and a grep for each `package.json` dependency. Ask before removing or adding one.

## 3. Agent files and docs

These load into every session, so each line costs context. Keep them true, short, and not duplicated.

- **`AGENTS.md`:** under about 10 KB. Rules and pointers, not explanations: a long "why" belongs in an ADR. Every claim must match the code; grep it.
- **`docs/code-standards.md`:** no rule that lint, types, or the formatter already enforce. No repeats of `AGENTS.md`.
- **ADRs:** keep them; they load only on demand. Merge records that describe one decision. When a decision changed, update its record in place rather than adding a superseding one. Every ADR is linked from `AGENTS.md` (`tests/unit/adr.test.ts`).
- **Skills:** each one matches `AGENTS.md` and the other skills (paths, commands, shipping rules). No model pins, no references to files that don't exist, no steps that contradict an ADR. Descriptions say when to trigger.
- **Saved preferences:** if a memory rule describes repo behavior, the matching skill or `AGENTS.md` says it too.

## 4. Senior review

Read the codebase the way a senior engineer joining the project would: looking for what will hurt in six months, not what they'd have written differently. Read the riskiest code in full: `proxy.ts`, `lib/headers.ts`, `lib/reactions.ts`, `lib/react-to-post.ts`, `lib/content.ts`, `scripts/build-content.ts` and `scripts/content-build/`, `app/layout.tsx`, and anything changed heavily since the last hygiene pass (`git log --since=3.months --name-only --format= | sort | uniq -c | sort -rn | head`).

Look for:

- **Correctness at the edges:** empty, missing, first, last, malformed, and concurrent inputs. Failures handled where they happen, with the logger.
- **Security:** request input trusted too early, HTML that skips sanitizing, CSP or header drift from Cloudflare, secrets or visitor data in logs.
- **Static contract and no-JS paths:** anything that would make a page dynamic, or break links, search, or reactions without JavaScript.
- **Design:** an abstraction with one caller, the same logic in three places, a module doing two jobs, config read in many places instead of one.
- **Tests:** tests that only check their mocks, risky branches covered without asserting the outcome, tests that read the developer's shell environment or the network.
- **Performance:** client JavaScript a Server Component could replace, work repeated per request that could happen at build time.

Be discerning. Raise a finding only if you'd block a pull request over it, or if it will cost real time later. Verify each one against the code at a `file:line` before reporting it, and drop it if it doesn't hold up. No findings about style the tools already enforce.

## 5. Fix and report

Fix mechanical and low-risk findings: moves, dead code, stale paths, doc drift, and small correctness bugs with a test. Take product calls, removed features, dependency changes, and large redesigns to the user as **Questions**.

Report in this order, briefly:

1. What moved and why.
2. What was deleted.
3. Docs, ADR, and skill changes, with the `AGENTS.md` size before and after.
4. Review findings: `N findings: …`, then a table of `#`, File, Line, Severity (Blocker, Suggestion, Question), Finding, Fix.
5. What you left alone on purpose.

Validate with `npm run format && npm run check 2>&1 | tail -40`, coverage at 100%. Then run `code-review` and `commit` once the user approves.

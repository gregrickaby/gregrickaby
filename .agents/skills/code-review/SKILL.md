---
name: code-review
description: >
  Perform a thorough code review of the Next.js 16 + Mantine 9 personal blog.
  Runs parallel sub-agents covering security, correctness, test quality,
  conventions, and big-picture architecture opportunities. Fixes all CRITICAL
  and IMPORTANT issues in the same session.
---

# Code Review

## When to Load This Skill

- User says "review my code", "do a code review", "review staged changes"
- User says "check the code before I commit"
- After finishing a feature or refactor, before committing

## Process

### Step 1: Gather Changed Files

```bash
git diff --cached --name-only
```

If nothing is staged, fall back to:

```bash
git diff --name-only HEAD
```

List the files for the user so they know what is being reviewed.

### Step 2: Read Everything

For each changed file, read:

1. The changed file itself
2. Its test file (e.g. `Foo.tsx` → `Foo.test.tsx`, `lib/utils.ts` → `lib/utils.test.ts`)
3. Any `lib/` file it imports that is relevant to the change

Read all files in parallel. Do NOT start spawning agents until you have read everything — agents need the full context in their briefs.

### Step 3: Spawn Parallel Review Agents

Spawn all four agents in a **single message** so they run in parallel. Each agent receives:

- The full content of the changed files
- Its specific review brief (below)
- The output format it must use

Agents must NOT fix anything — they only report findings.

---

#### Agent 1 — Security & Correctness

**Brief:** You are a security and correctness reviewer. Your job is to find bugs and vulnerabilities. Be rigorous and assume the worst.

Check for:

- Logic errors, off-by-one bugs, incorrect null guards, wrong operator precedence
- Race conditions, async bugs (missing `await`, unhandled rejections)
- Data corruption (mutation of shared state, incorrect spread/clone)
- Exposed secrets or credentials in source
- Server-only secrets using `NEXT_PUBLIC_` prefix
- `dangerouslySetInnerHTML` usage outside `ArticleContent.tsx`
- User-supplied input reaching HTML output without sanitization
- Breaking changes to public function signatures without a migration path

Return findings using the output format below.

---

#### Agent 2 — Architecture & Opportunity (Optimistic)

**Brief:** You are an architectural advisor. Your job is NOT to find rule violations — it is to look at the code with fresh eyes and ask: _could this be better?_ Be generous and constructive. Assume the existing code works correctly.

Look for:

- Shallow modules where the interface is nearly as complex as the implementation — could this be a single deeper function?
- Patterns duplicated across two or more callers that suggest a missing abstraction in `lib/`
- Components doing too many things (fetching + rendering + layout) — where is the natural split?
- Logic buried in a component that could be a pure function and tested in isolation
- Emerging conventions in the codebase that this code doesn't yet follow but easily could
- Places where the test would be dramatically simpler if the module were restructured

These are OPPORTUNITY-level findings. They do not block a merge. They are the seeds of future issues (reference the `improve-codebase-architecture` skill for candidates worth filing as RFCs).

Return findings using the output format below.

---

#### Agent 3 — Test Quality

**Brief:** You are a test quality reviewer. Your job is to check that the tests are meaningful, correct, and complete.

Check for:

- New exported functions or components with no test file at all
- Tests that only assert the happy path, with no edge case or null/error coverage
- Tests that import `render` from `@testing-library/react` directly instead of `@/test-utils`
- Tests that import `describe`, `it`, `expect`, or `vi` — Vitest globals, never import these
- Tests that read the filesystem (direct use of `lib/content.ts` without mocking)
- Tests that test implementation details (internal state, private helpers) instead of observable behavior
- Test descriptions that do not describe behavior (e.g. `it('works')`, `it('renders')`)
- Coverage gaps: branches, null paths, or error states that are exercised in the code but have no corresponding test

Return findings using the output format below.

---

#### Agent 4 — Conventions & Performance

**Brief:** You are a conventions and performance reviewer. Your job is to verify adherence to project standards and flag expensive mistakes.

Check for:

- `<img>` tags — must use `next/image`
- `<a>` or Mantine `<Anchor>` tags — must use `<AppLink>`
- Unnecessary `'use client'` directives (component uses no hooks, state, effects, or browser APIs)
- Missing `'use client'` on a component that does use hooks, state, effects, or browser APIs
- Mantine components imported in a server component (Mantine is client-only)
- `lib/content.ts` imported in a client component (uses `fs`, will throw at runtime)
- Hardcoded color values in CSS modules (e.g. `#292929`) — must use Mantine variables or `light-dark()`
- CSS properties not in alphabetical order
- Missing JSDoc on exported functions, components, or interfaces in `lib/`
- `any` type — must use `unknown` and narrow
- Non-`interface` object types that should be `interface`
- Naming convention violations (see quick reference at the bottom of this skill)

Return findings using the output format below.

---

### Finding Output Format

Every agent must return findings in this exact format. One finding per line.

```
[SEVERITY] file/path.tsx:LINE — What the problem is. Fix: specific action to take.
```

Severity levels:

| Level         | Meaning                                                                           |
| ------------- | --------------------------------------------------------------------------------- |
| `CRITICAL`    | Security vulnerability, data bug, or broken behaviour. Must fix before commit.    |
| `IMPORTANT`   | Violates a project rule or leaves the code materially worse. Fix in this session. |
| `SUGGESTION`  | Cosmetic or style issue. Non-blocking.                                            |
| `OPPORTUNITY` | The code works but a better design is available. Worth a future RFC.              |

If an agent finds nothing in its domain, it returns: `No findings.`

---

### Step 4: Synthesize Findings

Collect all findings from all four agents. Then:

1. **Deduplicate** — if two agents flagged the same line for different reasons, merge into one finding
2. **Sort** by severity: CRITICAL → IMPORTANT → SUGGESTION → OPPORTUNITY
3. **Present** the full list to the user grouped by severity

### Step 5: Fix CRITICAL and IMPORTANT Issues

Fix every CRITICAL and IMPORTANT finding in the same session. For each fix:

- Mark it as you go (you can reference the finding number)
- Update or add tests for any logic you change
- Do NOT touch SUGGESTION or OPPORTUNITY items unless the user asks

After all fixes are applied:

```bash
npm run validate
```

Fix any errors `validate` surfaces (TypeScript, lint, test failures, coverage gaps) and re-run until clean.

### Step 6: Report

Present a final summary:

- How many findings per severity level
- Which were fixed in this session
- Which SUGGESTION and OPPORTUNITY items are left for the user to decide on
- Final test count and validate status

---

## Project Conventions Quick Reference

| Concern                   | Rule                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Component type            | Server by default; `'use client'` only for hooks/state/effects/browser APIs                                             |
| `lib/content.ts`          | Server-only — never import in client components                                                                         |
| Links                     | `<AppLink>` — never `<a>` or Mantine `<Anchor>`                                                                         |
| Images                    | `next/image` — never `<img>`                                                                                            |
| Colors                    | `tomato` theme; `light-dark()` in CSS; no hardcoded hex values                                                          |
| Secrets                   | `.env.local` only; no `NEXT_PUBLIC_` for server-only values                                                             |
| `dangerouslySetInnerHTML` | Only in `ArticleContent.tsx` with sanitized input                                                                       |
| Tests                     | Vitest globals (no imports of `describe`/`it`/`expect`/`vi`); custom `render` from `test-utils/`; mock `lib/content.ts` |
| Naming                    | Dirs: `kebab-case`; Components: `PascalCase`; lib files: `camelCase`; constants: `UPPER_SNAKE_CASE`                     |
| CSS                       | Properties in alphabetical order; no hardcoded colors                                                                   |
| JSDoc                     | Required on all exported functions, components, and interfaces in `lib/`                                                |
| Types                     | `interface` for objects; `type` for unions/utilities; no `any`                                                          |

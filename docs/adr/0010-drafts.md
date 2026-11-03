# 0010. Keep drafts out of builds

- Date: 2026-10-23
- Status: Accepted

## Context

Posts are written in `public/content/` over days, in the same repo that deploys on every merge to `main`. A half-written post must never publish, but Greg needs to preview it on the dev server.

## Decision

- `draft: true` in frontmatter keeps a post or page out of `.generated/content.json`. Deleting the line publishes it.
- `npm run dev` and `npm run check` run the content build with `--drafts`, which includes drafts and marks them "Draft" in the post's meta line.
- `lib/content.ts` calls `assertNoDrafts` (`lib/drafts.ts`), which fails a production build if `content.json` still holds drafts, meaning `next build` ran without a fresh `npm run content` (2026-10-25).

## Consequences

- `npm run content` without `--drafts`, or `npm run build`, rewrites `content.json` without drafts, and a running dev server loses every draft post. Never run them while the dev server runs.

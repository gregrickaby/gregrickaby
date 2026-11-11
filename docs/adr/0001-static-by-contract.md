# 0001. Static by contract

- Date: 2026-10-07
- Status: Accepted

## Context

Every page except `/search` can render at build time from `.generated/content.json`. A page that reads cookies, headers, or search params, or does uncached work, silently turns dynamic, and readers and crawlers then wait on the origin. Param routes (`[slug]`, `tag/[tag]`, `category/[category]`, `/search`) are a second trap: with instant navigation, the prerendered HTML holds only a shell that JavaScript fills, so crawlers and readers without JavaScript get an empty page.

## Decision

- `app/(site)/layout.tsx` sets `ensureStatic = 'navigation'`, so the build fails if a page in the group reads request data or does uncached work. `/search` sits outside the group and is the only per-request page.
- Param routes set `instant = false`, so their prerendered HTML has the full content.
- Links to param routes use `prefetch={true}`, so client navigation still renders at once.
- `tests/e2e/site.spec.ts` checks this with `instant()`.

## Consequences

- New pages go inside `(site)` unless they must read the request.
- The blog index prefetches each card's HTML as it scrolls into view, about 400 KB for 13 posts. Revisit that cost at 40 posts.
- Never call a `'use cache'` function from a post page: it makes every post's per-link prefetch render at runtime (see [0013](0013-emoji-reactions.md)).

# 0002. Render missing post, tag, and category paths as full 404s

- Date: 2026-10-24
- Status: Accepted

## Context

A `notFound()` from a page with no Suspense above it sends an empty HTML document that only JavaScript fills. Param routes set `instant = false` ([0001](0001-static-by-contract.md)), so an unknown slug, tag, or category reached that path: crawlers and readers without JavaScript saw a blank page with a 404 status.

## Decision

The content build writes every post, tag, and category path to `.generated/paths.json`. `proxy.ts` checks requests against it (`lib/missing-path.ts`) and rewrites unknown ones to `/404/missing`, a path no route matches, which `app/not-found.tsx` renders in full with a 404.

## Consequences

- A new top-level route must be added to `ROUTES` in `lib/missing-path.ts`, or the proxy rewrites it to a 404. `tests/unit/lib/missing-path.test.ts` fails until it is.
- 404s on unknown post, tag, and category paths are expected in logs and traces.

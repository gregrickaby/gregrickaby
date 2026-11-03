# 0012. Answer removed pages with a 410

- Date: 2026-11-03
- Status: Accepted

## Context

`lib/redirects.ts` sent 34 old URLs to the home page: removed posts, retired tags, author pages, WordPress routes, and unmapped date-based URLs. Google treats a redirect to the home page as a soft 404 and keeps rechecking it; Search Console listed 39 soft 404s. A 410 tells Google the page is gone, and it drops the URL.

The proxy can't rewrite to the not-found route with any status but 404: Next's router sets 404 itself and drops the rewrite's status.

## Decision

`lib/gone.ts` lists the gone paths, and `proxy.ts` checks it before the missing-path check ([0002](0002-missing-path-404s.md)). For a gone path, the proxy fetches `/404/missing` from its own origin once per process, keeps the HTML in memory, and returns it with a 410. If that fetch fails or answers anything but 404, the proxy logs the error and falls back to the 404 rewrite, and tries the fetch again on the next request.

Redirects run before the proxy, so a gone pattern can overlap a redirect: the date-based URLs that map to posts still redirect. Only `/about` and `/home` redirect to the home page, which replaced them.

## Consequences

- Retire a post or tag with no replacement by adding it to `lib/gone.ts`, not by redirecting it to `/`. `tests/unit/redirects.test.ts` fails on a new redirect to `/`.
- A new gone pattern outside the proxy matcher needs a matching entry in `config.matcher` in `proxy.ts`.
- The first gone request after a deploy makes one extra request for the 404 page. In production it goes out through Cloudflare, so a Cloudflare rule that blocks the origin's own requests turns every 410 into a 404 and logs an error.
- The 410 body is the HTML from the process's first fetch. In development, edits to the 404 page show at gone paths only after a restart.

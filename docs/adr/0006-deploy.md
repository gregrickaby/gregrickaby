# 0006. Deploy on Coolify behind Cloudflare

- Date: 2026-04-10
- Status: Accepted

## Context

The site is a Node server (likes, `/search`, runtime revalidation), so it needs a host that runs `npm start`, keeps a volume for SQLite and `.next/cache`, and runs a Datadog Agent beside it.

## Decision

- Coolify (Railpack) builds `main` and runs `npm start` on port 3000, with a health check on `/api/health`. It keeps `.next/cache` on a volume and runs `npm run purge-cdn` after each deploy.
- `npm start` preloads `dd-trace`, which sends traces to the `Datadog Agent` service in the same project. The agent's `DD_APM_IGNORE_RESOURCES` skips `GET /api/health`, whose health checks run every few seconds.
- Cloudflare sits in front and caches `/_next/image`. Its "Add security headers" managed transform rewrites `Referrer-Policy` and adds `X-XSS-Protection` and `Expect-CT`; the values in `lib/headers.ts` match what the edge sends.
- Early Hints is off on this zone and reddit-viewer's (2026-10-28). Cloudflare's own Early Hints fetches logged as 504s with origin status 0, more than a thousand a day, and reddit-viewer's synthetics checks failed in the same windows until it was turned off.

## Consequences

- The origin answers on 443 with no Cloudflare in front when asked directly. Until the host firewall is narrowed to Cloudflare's published ranges (or moved to a tunnel), `cf-connecting-ip` can be forged and like counts are only best-effort ([0003](0003-likes.md)).
- Browser RUM values inline at build time, so Coolify needs them set before a build.

# 0003. Post likes in SQLite, keyed on a hashed IP

- Date: 2026-10-23
- Status: Accepted

## Context

Posts needed a like count. The site has no other database, no accounts, and no cookies beyond the theme, and post pages must stay static ([0001](0001-static-by-contract.md)).

## Decision

- `lib/likes.ts` keeps one row per post per visitor in SQLite through `node:sqlite` (no dependency), in a file at `LIKES_DB_PATH` on a Coolify volume.
- A visitor is the request IP (`cf-connecting-ip`, then `x-forwarded-for`), salted with `LIKES_SALT` and hashed with SHA-256, so the table never holds an address.
- Post pages never read the database. The like button loads the count after hydration and posts through a server action (`lib/like-post.ts`), and the form works without JavaScript.

## Consequences

- Counts are best-effort, not a security boundary. Rotating addresses can inflate a count, requests with no forwarding header share one bucket, and there is no rate limit or time window. Until the origin firewall is narrowed ([0006](0006-deploy.md)), `cf-connecting-ip` can be forged.
- The likes database is the only file the app reads at request time.
- Never call a `'use cache'` function from a post page: it makes every post's per-link prefetch render at runtime.
- Production must set `LIKES_SALT`: unsalted IPv4 hashes can be reversed. The app logs a warning without it.

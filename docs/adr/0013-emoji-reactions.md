# 0013. Emoji reactions in SQLite and a post toolbar

- Date: 2026-11-03 (replaces the heart likes from 2026-10-23)
- Status: Accepted

## Context

Posts needed a way for readers to react. The site has no other database, no accounts, and no cookies beyond the theme, and post pages must stay static ([0001](0001-static-by-contract.md)). The first version was one heart a visitor could like up to ten times, in a sticky sidebar beside six round share icons. Greg then wanted emoji reactions in place of the heart, with the existing likes kept and the coin sound still playing, and the share and reaction controls in a toolbar the way news sites place them (ESPN's article pages were the model).

## Decision

- Posts take four emoji reactions, listed in `REACTIONS` in `lib/site.ts`: Like, Laugh, Wow, and Fire. Six spread a small blog's reactions too thin, and two of them overlapped. A visitor gives a post one. Picking another replaces it, and picking the same one again takes it back.
- `lib/reactions.ts` keeps one row per post per visitor in SQLite through `node:sqlite` (no dependency), in a file at `LIKES_DB_PATH` on a Coolify volume. A visitor is the request IP (`cf-connecting-ip`, then `x-forwarded-for`), salted with `LIKES_SALT` and hashed with SHA-256, so the table never holds an address.
- The first time the app opens a database with the old `likes` table, it copies each row in as a heart, then drops `likes`. A visitor who liked a post ten times now counts once.
- Post pages never read the database. The reactions (`components/islands/reactions.tsx`) are one form with a submit button per emoji, posting through a server action (`lib/react-to-post.ts`), so they work without JavaScript. With it, the counts load after hydration.
- Each post has a toolbar (`components/post-actions.tsx`) above the body and again after it. Share opens a native popover menu (copy link, Reddit, LinkedIn, Facebook, X, email, and the device's share sheet where there is one). The reactions sit in the toolbar after the body only, where the reader has finished the post, and Copy as Markdown is its own button at the end.

## Consequences

- Counts are best-effort, not a security boundary. Rotating addresses can inflate a count, requests with no forwarding header share one bucket, and there is no rate limit. Until the origin firewall is narrowed ([0006](0006-deploy.md)), `cf-connecting-ip` can be forged.
- The reactions database is the only file the app reads at request time.
- Never call a `'use cache'` function from a post page: it makes every post's per-link prefetch render at runtime.
- Production must set `LIKES_SALT`: unsalted IPv4 hashes can be reversed. The app logs a warning without it. The variables keep their `LIKES_` names, and `data-like-cue` keeps its name, since posts already use it.
- The migration drops `likes`, so rolling back starts the old heart from zero. Back up the file first.
- Adding a reaction is one entry in `REACTIONS`. Removing one hides its rows without deleting them.
- The share menu sits against its button through CSS anchor positioning where the browser has it, and in the middle of the screen where it doesn't.

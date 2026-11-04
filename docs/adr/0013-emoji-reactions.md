# 0013. Emoji reactions and a post toolbar

- Date: 2026-11-03
- Status: Accepted

## Context

Posts had one heart that a visitor could like up to ten times ([0003](0003-likes.md)), in a sticky sidebar on wide screens beside six round share icons. Greg wanted emoji reactions in place of the heart, with the existing likes kept and the coin sound still playing, and the share and reaction controls placed the way news sites place them. ESPN's article pages were the model for the toolbar: a row under the byline with Share and the reactions. ESPN hides its emoji behind a Like button; here the toolbar has room for all of them, so they sit in the row with their counts.

## Decision

- Posts take four emoji reactions, listed in `REACTIONS` in `lib/site.ts`: Like, Laugh, Wow, and Fire. Six spread a small blog's reactions too thin, and two of them overlapped (Interesting with Wow, Celebrate with Like). A visitor gives a post one. Picking another replaces it, and picking the same one again takes it back.
- `lib/reactions.ts` keeps one row per post per visitor in a `reactions` table, in the same SQLite file as before (`LIKES_DB_PATH`). Visitors are still the salted, hashed request IP (`LIKES_SALT`).
- The first time the app opens a database with the old `likes` table, it copies each row in as a heart, then drops `likes`. A visitor who liked a post ten times now counts once.
- Each post has a toolbar (`components/post-actions.tsx`) above the body and again after it. Share opens a menu of every way to share the post (copy link, Reddit, LinkedIn, Facebook, X, email, and the device's share sheet where there is one). The reactions follow in the toolbar after the body only, where the reader has finished the post, and Copy as Markdown is its own button at the end. The sidebar holds only the table of contents.
- The reactions (`components/islands/reactions.tsx`) are one form with a submit button per emoji, each with its count in its top right corner, and the visitor's reaction gets a filled count. They work without JavaScript, and the share menu is a native popover that does too. With it, the counts load after hydration. A reaction plays the coin sound, and taking it back plays the close sound. The fanfare that played on a visitor's tenth like is gone.

## Consequences

- Everything in [0003](0003-likes.md) about static post pages, `'use cache'`, forged `cf-connecting-ip`, and the salt still holds.
- The environment variables keep their `LIKES_` names, so production needs no change.
- Heart counts drop to one per visitor. The migration drops `likes`, so rolling back starts the old heart from zero. Back up the file first.
- The share menu sits against its button through CSS anchor positioning where the browser has it, and in the middle of the screen where it doesn't.
- `data-like-cue` keeps its name, since posts already use it. It waves the reactions once the reader has passed it and they are on screen.
- Adding a reaction is one entry in `REACTIONS`. Removing one hides its rows without deleting them.

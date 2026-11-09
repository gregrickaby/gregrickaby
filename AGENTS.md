<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
<!-- END:nextjs-agent-rules -->

# gregrickaby.com

Greg Rickaby's personal site (<https://gregrickaby.com>): blog, photo gallery, resume, and contact page. Markdown in `public/content/`; the only database is a SQLite file of post reactions. Every page except `/search` prerenders at build time.

## Stack

Next.js 16.4 (App Router, Cache Components, Partial Prefetching, typed routes, Rust React Compiler) · React 19.3 · TypeScript 7 (strict) · CSS Modules with cascade layers · Vitest 5 + Testing Library + happy-dom · Playwright with `@next/playwright` · Oxlint with a local plugin in `oxlint/`, Oxfmt ([ADR 0011](docs/adr/0011-oxlint-and-oxfmt.md)), Biome for CSS ([ADR 0015](docs/adr/0015-biome-css-lint.md)), lefthook · Datadog (`dd-trace`, browser RUM).

## Commands

```bash
npm run check      # content, CSS module types, typecheck, lint, unit tests with coverage
npm run format     # Oxfmt (CI runs format:check)
npm run build      # content + production build
npm run test:e2e   # Playwright: builds and runs critical paths, with and without JavaScript
npm run content -- --drafts  # rebuild .generated/ after editing Markdown, photos, or demos
```

Secrets go in `.env.local` (see `.env.example`). Server logs, traces, and browser RUM go to Datadog when its environment variables are set; without them, server errors print to stdout and the browser sends nothing.

## Architecture

- **Content is built, not read at runtime.** `scripts/build-content.ts` renders Markdown (shiki, heading ids, figure captions), sanitizes the HTML, measures images, and reads photo EXIF into `.generated/content.json`. `lib/content.ts` imports that JSON. The build tools are dev dependencies.
- **Drafts** ([ADR 0010](docs/adr/0010-drafts.md)). `draft: true` in frontmatter keeps a post or page out of builds; `npm run dev` includes it, marked "Draft". Delete the line to publish.
- **Modified dates** ([ADR 0009](docs/adr/0009-modified-dates.md)). Bump a post's `modified` only for a rewrite, new sections, or corrected facts, never for retitles, typo fixes, retags, or link cleanups.
- **Static by contract** ([ADR 0001](docs/adr/0001-static-by-contract.md)). Pages in `app/(site)/` must not read cookies, headers, or search params, or do uncached work; `ensureStatic = 'navigation'` fails the build if they do. `/search` is the only per-request page.
- **Param routes** (`[slug]`, `tag/[tag]`, `category/[category]`, `/search`) set `instant = false`, and links to them use `prefetch={true}` ([ADR 0001](docs/adr/0001-static-by-contract.md)).
- **404s** ([ADR 0002](docs/adr/0002-missing-path-404s.md)). `proxy.ts` rewrites unknown post, tag, and category paths so `app/not-found.tsx` renders a full 404. Add a new top-level route to `ROUTES` in `lib/missing-path.ts`; `tests/unit/missing-path.test.ts` fails until you do. The 404 page (`components/missing-page.tsx`) is a pixel ghost with links out, beside a lo-fi tape deck (`components/islands/lofi-radio.tsx`, with its synth in `lofi.ts`) that plays only with JavaScript. It and the 8-bit post's deck share the cassette UI (`tape-deck.tsx`) and the lo-fi chain (`tape.ts`); each brings its own tracks and instruments.
- **410s** ([ADR 0012](docs/adr/0012-gone-paths-410.md)). Removed posts, retired tags, and old WordPress routes with no replacement go in `lib/gone.ts`, not in a redirect to `/`. `proxy.ts` answers them with a 410 and the 404 page's HTML, which it fetches from `/404/missing` once per process.
- **Images.** Components use `next/image`. The build writes `/_next/image` URLs and `srcset` into post HTML (`lib/images.ts`). HDR gain map JPEGs (`hdrgm` XMP) use the original file for full-size views, because the optimizer strips the gain map. The build marks portrait images `data-portrait`, and CSS caps them at 70vh. Two portraits on one line sit side by side, and `![alt](./photo.jpg#left)` or `#right` (alone on its line, with or without a title) floats the figure beside the text.
- **Client islands.** Server Components by default. Client code lives in `components/islands/` and the error boundaries (each `error.tsx` and `app/global-error.tsx`), and never fetches, with two exceptions: the reaction buttons call server actions (`lib/react-to-post.ts`), and the copy Markdown button loads `/<slug>.md` on click.
- **Markdown copies** ([ADR 0005](docs/adr/0005-markdown-copies-and-llms-txt.md)). The content build writes each post's source to `.generated/markdown.json`, served at `/<slug>.md`, and `/llms.txt` lists them with `/resume.md` and `/photos.md`. Keep it out of `content.json`. `/robots.txt` and every response's `Content-Signal` header state search and AI answers yes, training no.
- **Tags and categories** ([ADR 0008](docs/adr/0008-single-word-tags.md)) are lowercase letters, digits, and hyphens only; reuse existing tags, and redirect a retired tag's URL.
- **Demos.** A post places an interactive demo with `<div data-demo="name"></div>` on its own line. The build keeps only top-level markers, and `Prose` splits the HTML around them. Each post's demos live in `components/islands/demos/<slug>/`: `demos.tsx` (client components) and `registry.ts` (names and titles, a plain module so the server can read it). `npm run content -- --drafts` writes `.generated/demos.ts` from those folders. Build them from the shared kit in `components/islands/demo-kit/` (`Plot`, `Controls`, `DemoButton`, `Slider`, `Caption`) so every demo looks and behaves the same; a post's own CSS Module is for what only that post needs. The `Demo` frame (`components/demo.tsx`) spaces a demo's top-level children, so a demo can return a fragment. Sound demos play through `playNotes` in `components/islands/sounds.ts`, and music through the four-channel NES-style player in `components/islands/chiptune.ts` (each post brings its own songs).
- **Reactions and the post toolbar** ([ADR 0003](docs/adr/0003-likes.md), [ADR 0013](docs/adr/0013-emoji-reactions.md)). Each post has a toolbar (`components/post-actions.tsx`) above the body and after it: a Share menu, then Copy as Markdown. The one after the body adds four emoji reactions with their counts (`REACTIONS` in `lib/site.ts`, one per visitor). Tooltips use the shared bubble in `components/tooltip.module.css`. The reactions are submit buttons and the Share menu is a native popover, so both work without JavaScript. `lib/reactions.ts` stores reactions in SQLite at `LIKES_DB_PATH` and moves old likes in as hearts. Post pages never read it; the buttons load the counts after hydration. Never call a `'use cache'` function from a post page. A post can ask for a reaction with `<span data-like-cue></span>` in a paragraph: once the reader reaches it, the reactions hop and wave until the reader reacts. Counts are best-effort, not a security boundary.
- **Goodreads** ([ADR 0004](docs/adr/0004-goodreads.md)). `lib/goodreads.ts` scrapes the "Currently Reading" box for the home page in a `'use cache'` function. Keep `reactMaxHeadersLength: 0` in `next.config.ts`, or the `llms.txt` link header repeats.
- **Observability** ([ADR 0007](docs/adr/0007-observability.md)). Server logs go through `lib/datadog/server.ts`, which falls back to `console` without `DD_API_KEY`. `instrumentation.ts` reports server errors and a 15-minute heartbeat; `instrumentation-client.ts` starts RUM and browser logs, and the error boundaries report client errors. `app/(site)/error.tsx` and `app/search/error.tsx` render `ErrorNotice` inside their site shell; `app/error.tsx` catches the rest without it. Browser values inline at build time without `NEXT_PUBLIC_`. Logs carry no visitor IPs, raw headers, or query strings.
- **Easter egg.** `/geocities` (`app/geocities/`) is a Geocities page in an LCARS frame, with its GIFs in `public/geocities/`. It sits outside the `(site)` group, so it skips `SiteShell` (the header and footer). Its radio (`components/islands/subspace-player.tsx`) is fixed to the bottom of the screen and synthesizes a dial-up handshake and an original fanfare (`subspace.ts`). Its metadata sets `noindex, nofollow`; it stays out of the robots.txt disallow list so crawlers can read that.
- **HTML injection** only in `components/prose.tsx`, `components/json-ld.tsx` (`serializeSchema`), and the theme script in `app/layout.tsx`. Oxlint enforces it.
- **Theme.** Color tokens use `light-dark()` in `app/styles/tokens.css`. A `theme` cookie, applied by an inline script before paint, sets `data-theme` on `<html>`, which only switches `color-scheme`.
- **View transitions.** Post cards and article heroes share a `<ViewTransition>` name (`components/post-image.tsx`).
- **Site config.** Copy, nav, and links in `lib/site.ts`; old WordPress redirects in `lib/redirects.ts`; security headers and CSP in `lib/headers.ts`, whose values match what Cloudflare's managed transform sends ([ADR 0006](docs/adr/0006-deploy.md)).

## Rules

Read `docs/code-standards.md` before writing or reviewing code. It covers TypeScript, modules, naming, comments, styles, errors, and tests.

Never:

- Start the dev server; the user runs it.
- Run `npm run content` without `--drafts` or `npm run build` while the dev server runs. Both rewrite `.generated/content.json` without drafts, and the dev server loses every draft post.
- Read the filesystem at request time (except the reactions database), or import `lib/content-build/*` from app code.
- Use `NEXT_PUBLIC_` or UI libraries.
- Commit plans. Keep them in the session scratchpad or `.plans/` (gitignored).
- Add commit trailers or co-authors.

Always:

- Keep links, search, and reactions working without JavaScript. The reaction form is the only thing that posts to the server; `/contact` is a page of links.
- Log app and lib errors through `lib/datadog/server.ts`, not `console`. Scripts may print to the console.
- Follow the writing rules in `docs/code-standards.md` for UI copy, docs, and commit messages.
- Keep subagents to a minimum; each one is a separate billed request.

Ask before adding dependencies, committing, or pushing.

## Testing

Unit tests live in `tests/unit/`. They run in Node; component tests add `// @vitest-environment happy-dom`. Render server components with `tests/helpers/render-server.tsx` and build content with `tests/helpers/content.ts` plus `vi.mock('@/.generated/content.json')`. E2E builds the site and runs it with and without JavaScript. Coverage is 100% (95% enforced): keep it at 100%.

## Definition of done

A task: start on a branch from an up-to-date `main` (`git switch main && git pull && git switch -c <type>/<slug>`); `npm run format:check` and `npm run check` pass, with coverage at 100%. Shipping: the `code-review` skill reviews and fixes the diff (a Chrome check against `https://localhost:3000` only on request), then `commit` pushes the branch and opens a pull request that auto-merges when CI passes. CI (`.github/workflows/ci.yml`) runs `npm run test:e2e`, which builds, on the pull request. Next task: `git switch main && git pull`, then suggest `/clear`.

## Deploy

Coolify builds `main` and runs `npm start` on port 3000, with a health check on `/api/health`. Cloudflare sits in front. The origin firewall is still open to direct requests, so `cf-connecting-ip` can be forged. Details in [ADR 0006](docs/adr/0006-deploy.md).

## Decisions

Architecture decision records live in `docs/adr/`, from `docs/adr/template.md`, named `NNNN-short-slug.md`. Write one for each new decision and link it here; `tests/unit/adr.test.ts` fails until you do. Stylelint was removed in [ADR 0014](docs/adr/0014-remove-stylelint.md). CSS is linted by Biome ([ADR 0015](docs/adr/0015-biome-css-lint.md)), which covers generic rules only. The repo's own CSS conventions are in `docs/code-standards.md` and enforced by review.

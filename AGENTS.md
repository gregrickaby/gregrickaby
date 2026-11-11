<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
<!-- END:nextjs-agent-rules -->

# gregrickaby.com

Greg Rickaby's personal site (<https://gregrickaby.com>): blog, photo gallery, resume, and contact page. Markdown in `public/content/`; the only database is a SQLite file of post reactions. Every page except `/search` prerenders at build time.

## Stack

Next.js 16.4 (App Router, Cache Components, Partial Prefetching, typed routes, Rust React Compiler) · React 19.3 · TypeScript 7 (strict) · CSS Modules with cascade layers · Vitest 5 + Testing Library + happy-dom · Playwright with `@next/playwright` · Oxlint and Oxfmt ([ADR 0011](docs/adr/0011-oxlint-and-oxfmt.md)), Stylelint, lefthook · Datadog (`dd-trace`, browser RUM).

## Commands

```bash
npm run check      # content, CSS module types, typecheck, lint, unit tests with coverage
npm run format     # Oxfmt (CI runs format:check)
npm run build      # content + production build
npm run test:e2e   # Playwright: builds and runs critical paths, with and without JavaScript
npm run content -- --drafts  # rebuild .generated/ after editing Markdown, photos, or demos
```

Secrets go in `.env.local` (see `.env.example`).

## Layout

- `app/`: routes. `(site)/` holds every static page; `search/`, `geocities/` (an easter egg with no site shell; its metadata sets `noindex`, so keep it out of the robots.txt disallow list where crawlers couldn't read that), and the text routes (`feed.xml`, `llms.txt`, `md/`, `robots.txt`) sit outside it.
- `components/`: Server Components, each with its CSS Module beside it. `components/islands/` holds all client code: `audio/` (the sound engine, chiptune player, and tape decks), `demo-kit/`, and `demos/<slug>/`.
- `lib/`: runtime code for the app. `lib/datadog/server.ts` is the logger.
- `scripts/`: Node scripts run outside Next: the content build (`build-content.ts` and `content-build/`) and the post-deploy hooks. App code never imports from `scripts/`; scripts import by relative path with the `.ts` extension.
- `lint/`: the repo's own Oxlint and Stylelint rules.
- `tests/`: `unit/` mirrors the source folders; `e2e/` is Playwright; `helpers/` and `stubs/` support both.
- `docs/`: `code-standards.md` and the ADRs.

## Architecture

- **Content is built, not read at runtime.** `scripts/build-content.ts` renders Markdown (shiki, heading ids, figure captions), sanitizes it, measures images, and reads photo EXIF into `.generated/content.json`, which `lib/content.ts` imports. Never read the filesystem at request time (the reactions database is the one exception).
- **Drafts** ([ADR 0010](docs/adr/0010-drafts.md)). `draft: true` keeps a post out of builds; `npm run dev` shows it marked "Draft". Never run `npm run content` without `--drafts`, or `npm run build`, while the dev server runs: both drop drafts from `.generated/`.
- **Modified dates** ([ADR 0009](docs/adr/0009-modified-dates.md)). Bump a post's `modified` only for a rewrite, new sections, or corrected facts.
- **Static by contract** ([ADR 0001](docs/adr/0001-static-by-contract.md)). Pages in `app/(site)/` must not read cookies, headers, or search params, or do uncached work; `ensureStatic = 'navigation'` fails the build if they do. Param routes (`[slug]`, `tag/[tag]`, `category/[category]`, `/search`) set `instant = false`, and links to them use `prefetch={true}`.
- **404s and 410s** ([ADR 0002](docs/adr/0002-missing-path-404s.md), [ADR 0012](docs/adr/0012-gone-paths-410.md)). `proxy.ts` rewrites unknown post, tag, and category paths to a full 404. Add a new top-level route to `ROUTES` in `lib/missing-path.ts`. Removed pages with no replacement go in `lib/gone.ts` (a 410), never a redirect to `/`.
- **Images.** Use `next/image`. The build writes `/_next/image` URLs and `srcset` into post HTML (`lib/images.ts`); HDR gain map JPEGs keep the original file for full-size views. A post with `featuredImage` needs `featuredImageAlt`, or the build fails. In Markdown, `#left` or `#right` on an image floats it beside the text.
- **Client islands.** Server Components by default. Client code lives in `components/islands/` and the error boundaries, and never fetches. Exceptions: the reaction buttons call a server action, and Copy as Markdown loads `/<slug>.md` on click.
- **Markdown copies** ([ADR 0005](docs/adr/0005-markdown-copies-and-llms-txt.md)). Each post's source is served at `/<slug>.md` from `.generated/markdown.json` (keep it out of `content.json`) and listed in `/llms.txt`. `/robots.txt` and the `Content-Signal` header say search and AI answers yes, training no.
- **Tags and categories** ([ADR 0008](docs/adr/0008-single-word-tags.md)): lowercase letters, digits, and hyphens. Reuse existing tags, and redirect a retired tag's URL.
- **Demos.** A post places one with `<div data-demo="name"></div>` on its own line. Each post's demos live in `components/islands/demos/<slug>/`: `demos.tsx` (client components) and `registry.ts` (names and titles, readable by the server). Build them from `components/islands/demo-kit/` (`Plot`, `Controls`, `DemoButton`, `Slider`, `Caption`). Sound plays through `playNotes` in `components/islands/audio/sounds.ts`, and music through the NES-style player in `audio/chiptune.ts`. Run `npm run content -- --drafts` after adding one.
- **Reactions** ([ADR 0013](docs/adr/0013-emoji-reactions.md)). Four emoji (`REACTIONS` in `lib/site.ts`), one per visitor, stored by `lib/reactions.ts` in SQLite at `LIKES_DB_PATH`. They are submit buttons and the Share menu is a native popover, so both work without JavaScript. Post pages never read the database, and never call a `'use cache'` function from a post page.
- **Goodreads** ([ADR 0004](docs/adr/0004-goodreads.md)). `lib/goodreads.ts` scrapes "Currently Reading" in a `'use cache'` function. Keep `reactMaxHeadersLength: 0` in `next.config.ts`.
- **Observability** ([ADR 0007](docs/adr/0007-observability.md)). App and lib code log through `lib/datadog/server.ts`, never `console`; it falls back to the console without `DD_API_KEY`. Logs carry no visitor IPs, raw headers, or query strings. Browser values inline at build time without `NEXT_PUBLIC_`.
- **HTML injection** only in `components/prose.tsx`, `components/json-ld.tsx` (`serializeSchema`), and the theme script in `app/layout.tsx` (lint).
- **Theme.** Color tokens use `light-dark()` in `app/styles/tokens.css`. A `theme` cookie, applied by an inline script before paint, sets `data-theme` on `<html>`.
- **Site config.** Copy, nav, and links in `lib/site.ts`; old WordPress redirects in `lib/redirects.ts`; security headers and CSP in `lib/headers.ts`, matching what Cloudflare sends ([ADR 0006](docs/adr/0006-deploy.md)).

## Rules

Read `docs/code-standards.md` before writing or reviewing code. It covers TypeScript, modules, naming, comments, styles, errors, tests, and the writing rules for UI copy, docs, and commits.

Never start the dev server (the user runs it), use `NEXT_PUBLIC_` or UI libraries, commit plans (keep them in the session scratchpad or `.plans/`), or add commit trailers or co-authors. Ask before adding dependencies, committing, or pushing. Keep links, search, and reactions working without JavaScript.

## Testing

Unit tests run in Node; component tests add `// @vitest-environment happy-dom`. Render server components with `tests/helpers/render-server.tsx` and build content with `tests/helpers/content.ts` plus `vi.mock('@/.generated/content.json')`. E2E builds the site and runs it with and without JavaScript, in CI only, inside the Playwright Docker image ([ADR 0016](docs/adr/0016-e2e-in-playwright-image.md)). Coverage is 100% (95% enforced): keep it at 100%.

## Definition of done

Start on a branch from an up-to-date `main` (`git switch main && git pull && git switch -c <type>/<slug>`). `npm run format:check` and `npm run check` pass, with coverage at 100%. Then the `code-review` skill reviews and fixes the diff, and `commit` pushes the branch and opens a pull request that auto-merges when CI passes (except posts still being written). CI runs `npm run test:e2e`. Next task: `git switch main && git pull`, then suggest `/clear`.

## Deploy

Coolify builds `main` and runs `npm start` on port 3000 (health check `/api/health`), behind Cloudflare ([ADR 0006](docs/adr/0006-deploy.md)). After each deploy it purges the CDN and notifies search engines ([ADR 0014](docs/adr/0014-notify-search-engines-on-deploy.md)). The origin still answers direct requests, so `cf-connecting-ip` can be forged.

## Decisions

Architecture decision records live in `docs/adr/`, from `docs/adr/template.md`, named `NNNN-short-slug.md`. Write one for a new decision that future work must respect, and link it here; `tests/unit/adr.test.ts` fails until you do. When a decision replaces another, update the old record in place instead of adding a superseding one.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
<!-- END:nextjs-agent-rules -->

# gregrickaby.com

Greg Rickaby's personal site (<https://gregrickaby.com>): blog, photo gallery, resume, and contact page. Markdown in `public/content/`; the only database is a SQLite file of post likes. Every page except `/search` prerenders at build time.

## Stack

Next.js 16.4 (App Router, Cache Components, Partial Prefetching, typed routes, Rust React Compiler) · React 19.3 · TypeScript (strict) · CSS Modules with cascade layers · Vitest 5 + Testing Library + happy-dom · Playwright with `@next/playwright` · ESLint, Stylelint, Prettier, lefthook · Datadog (`dd-trace`, browser RUM).

## Commands

```bash
npm run check      # content, CSS module types, typecheck, lint, unit tests with coverage
npm run format     # Prettier (CI runs format:check)
npm run build      # content + production build
npm run test:e2e   # Playwright: builds and runs critical paths, with and without JavaScript
npm run content -- --drafts  # rebuild .generated/ after editing Markdown, photos, or demos
```

Secrets go in `.env.local` (see `.env.example`). Server logs, traces, and browser RUM go to Datadog when its environment variables are set; without them, server errors print to stdout and the browser sends nothing.

## Architecture

- **Content is built, not read at runtime.** `scripts/build-content.ts` renders Markdown (shiki, heading ids, figure captions), sanitizes the HTML, measures images, and reads photo EXIF into `.generated/content.json`. `lib/content.ts` imports that JSON. The build tools are dev dependencies.
- **Drafts.** `draft: true` in frontmatter keeps a post or page out of `.generated/content.json`, so builds never publish it. `npm run dev` runs the content build with `--drafts`, which includes drafts and marks them "Draft" in the post's meta line. Delete the line to publish.
- **Static by contract.** `app/(site)/layout.tsx` sets `ensureStatic = 'navigation'`, so the build fails if a page reads cookies, headers, or search params, or does uncached work. `/search` sits outside the group and is the only per-request page.
- **Param routes** (`[slug]`, `tag/[tag]`, `category/[category]`, `/search`) set `instant = false` so the prerendered HTML has the full content for crawlers and readers without JavaScript. Links to them use `prefetch={true}` so client navigation still renders at once. `e2e/site.spec.ts` checks this with `instant()`. The blog index prefetches each card's HTML as it scrolls into view, about 400 KB for 13 posts. Revisit that cost at 40 posts.
- **404s.** A `notFound()` from a page with no Suspense above it sends an empty HTML document that only JavaScript fills. So `proxy.ts` checks post, tag, and category paths against `.generated/paths.json` (written by the content build) and rewrites unknown ones to a path no route matches, which `app/not-found.tsx` renders in full with a 404. Add a new top-level route to `ROUTES` in `lib/missing-path.ts`; `tests/unit/missing-path.test.ts` fails until you do. The 404 page (`components/missing-page.tsx`) is a pixel ghost with links out, beside a lo-fi tape deck (`components/islands/lofi-radio.tsx`, with its synth in `lofi.ts`) that plays only with JavaScript. It and the 8-bit post's deck share the cassette UI (`tape-deck.tsx`) and the lo-fi chain (`tape.ts`); each brings its own tracks and instruments.
- **Images.** Components use `next/image`. The build writes `/_next/image` URLs and `srcset` into post HTML (`lib/images.ts`). HDR gain map JPEGs (`hdrgm` XMP) use the original file for full-size views, because the optimizer strips the gain map.
- **Client islands.** Server Components by default. Client code lives in `components/islands/` and the error boundaries (each `error.tsx` and `app/global-error.tsx`), and never fetches, with two exceptions: the like button calls server actions (`lib/like-post.ts`), and the copy Markdown button loads `/<slug>.md` on click.
- **Markdown copies.** The content build also writes each post's source to `.generated/markdown.json` (`lib/content-build/post-markdown.ts`): a header with the title, URL, date, and description, then the body with relative media made absolute, demo markers swapped for a link to the post (titles read from each `registry.ts`), and like cues removed. `app/md/[slug]/route.ts` serves it, `next.config.ts` rewrites `/<slug>.md` to it, and post metadata links it as `text/markdown`. It stays out of `content.json`, so post pages don't load it. `/llms.txt` (https://llmstxt.org) lists every post's `.md` URL, plus `/resume.md` and `/photos.md`, which `lib/llms.ts` builds from the same data as their pages. Every response sends `Link: </llms.txt>; rel="describedby"` and the same `Content-Signal` value (`lib/headers.ts`, `lib/content-signal.ts`). `/robots.txt` (`app/robots.txt/route.ts`) states the [Content Signals Policy](https://contentsignals.org) (search and AI answers yes, training no) and points agents at `/llms.txt` (`lib/robots.ts`).
- **Demos.** A post places an interactive demo with `<div data-demo="name"></div>` on its own line. The build keeps only top-level markers, and `Prose` splits the HTML around them. Each post's demos live in `components/islands/demos/<slug>/`: `demos.tsx` (client components) and `registry.ts` (names and titles, a plain module so the server can read it). `npm run content -- --drafts` writes `.generated/demos.ts` from those folders. Build them from the shared kit in `components/islands/demo-kit/` (`Plot`, `Controls`, `DemoButton`, `Slider`, `Caption`) so every demo looks and behaves the same; a post's own CSS Module is for what only that post needs. The `Demo` frame (`components/demo.tsx`) spaces a demo's top-level children, so a demo can return a fragment. Sound demos play through `playNotes` in `components/islands/sounds.ts`.
- **Likes.** `lib/likes.ts` keeps one row per post per hashed visitor IP in SQLite (`node:sqlite`, no dependency) at `LIKES_DB_PATH`, a file on a Coolify volume. Post pages never read it: the like button loads the count after hydration, so the HTML stays static. A post can ask for a like with `<span data-like-cue></span>` in a paragraph: once the reader reaches it, the button hops and waves until it's liked. Never call a `'use cache'` function from a post page; it makes every post's per-link prefetch render at runtime. Counts are best-effort, not a security boundary: a visitor is keyed on the request IP, so rotating addresses can inflate a count, and requests with no forwarding header share one bucket. There is no rate limit or time window.
- **Goodreads.** `lib/goodreads.ts` reads the "currently-reading" shelf's public RSS in a `'use cache'` function with a four-hour revalidate; the home page shows it.
- **Observability.** Server code logs through `lib/datadog/server.ts`, which posts to Datadog's Logs Intake API with its trace IDs and falls back to `console` in development or without `DD_API_KEY`. `instrumentation.ts` reports server errors Next catches and logs a heartbeat every 15 minutes, so a log monitor can tell a broken intake key from a quiet site. `instrumentation-client.ts` starts RUM (the slim SDK, so no session replay code is bundled) and browser logs, and the error boundaries report client errors. Its Next.js plugin tracks views by hand, so RUM sends nothing until `<DatadogAppRouter />` in `app/layout.tsx` reports the first view. `app/(site)/error.tsx` and `app/search/error.tsx` render `ErrorNotice` inside their site shell; `app/error.tsx` catches the rest without it, since the shell's footer is server-only. `npm start` preloads `dd-trace`, so APM traces come from the same process that serves the site, and the Datadog Agent beside the app on Coolify receives them. RUM has no session replay and masks input, so it records no DOM or typed text. The browser values inline at build time, so Coolify needs them before a build; `next.config.ts` inlines them without `NEXT_PUBLIC_`. Logs carry no visitor IPs, raw headers, or query strings.
- **Easter egg.** `/geocities` (`app/geocities/`) is a Geocities page in an LCARS frame, with its GIFs in `public/geocities/`. It sits outside the `(site)` group, so it skips `SiteShell` (the header and footer). Its radio (`components/islands/subspace-player.tsx`) is fixed to the bottom of the screen and synthesizes a dial-up handshake and an original fanfare (`subspace.ts`). Its metadata sets `noindex, nofollow`; it stays out of the robots.txt disallow list so crawlers can read that.
- **HTML injection** only in `components/prose.tsx`, `components/json-ld.tsx` (`serializeSchema`), and the theme script in `app/layout.tsx`. ESLint enforces it.
- **Theme.** Color tokens use `light-dark()` in `app/styles/tokens.css`. A `theme` cookie, applied by an inline script before paint, sets `data-theme` on `<html>`, which only switches `color-scheme`.
- **View transitions.** Post cards and article heroes share a `<ViewTransition>` name (`components/post-image.tsx`).
- **Site config.** Copy, nav, and links in `lib/site.ts`; old WordPress redirects in `lib/redirects.ts`; security headers and CSP in `lib/headers.ts`. Cloudflare's "Add security headers" managed transform rewrites `Referrer-Policy` and adds `X-XSS-Protection` and `Expect-CT`; the values in `lib/headers.ts` match what the edge sends.

## Rules

Read `docs/code-standards.md` before writing or reviewing code. It covers TypeScript, modules, naming, comments, styles, errors, and tests.

Never:

- Start the dev server; the user runs it.
- Run `npm run content` without `--drafts` or `npm run build` while the dev server runs. Both rewrite `.generated/content.json` without drafts, and the dev server loses every draft post.
- Read the filesystem at request time (except the likes database), or import `lib/content-build/*` from app code.
- Use `NEXT_PUBLIC_` or UI libraries.
- Commit plans. Keep them in the session scratchpad or `.plans/` (gitignored).
- Add commit trailers or co-authors.

Always:

- Keep links, search, and likes working without JavaScript. The like form is the only thing that posts to the server; `/contact` is a page of links.
- Log app and lib errors through `lib/datadog/server.ts`, not `console`. Scripts may print to the console.
- Follow the writing rules in `docs/code-standards.md` for UI copy, docs, and commit messages.
- Keep subagents to a minimum; each one is a separate billed request.

Ask before adding dependencies, committing, or pushing.

## Testing

Unit tests live in `tests/unit/`. They run in Node; component tests add `// @vitest-environment happy-dom`. Render server components with `tests/helpers/render-server.tsx` and build content with `tests/helpers/content.ts` plus `vi.mock('@/.generated/content.json')`. E2E builds the site and runs it with and without JavaScript. Coverage is 100% (95% enforced): keep it at 100%.

## Definition of done

A task: `npm run format:check` and `npm run check` pass, with coverage at 100%. Shipping: the `code-review` skill reviews and fixes the diff (a Chrome check against `https://localhost:3000` only on request), and CI (`.github/workflows/ci.yml`) runs `npm run test:e2e`, which builds, on the pull request. The global instructions set the rest.

## Deploy

Coolify (Railpack) builds `main` and runs `npm start` on port 3000, with a health check on `/api/health`. Cloudflare sits in front and caches `/_next/image`; Coolify keeps `.next/cache` on a volume and runs `npm run purge-cdn` after each deploy. `npm start` preloads `dd-trace`, which sends traces to the `Datadog Agent` service in the same project; the agent's `DD_APM_IGNORE_RESOURCES` skips `GET /api/health`, whose health checks run every few seconds.

The origin answers on 443 with no Cloudflare in front when asked directly, so the host firewall still has to be narrowed to Cloudflare's published ranges (or moved to a tunnel). Until then, `cf-connecting-ip` can be forged and like counts are only best-effort.

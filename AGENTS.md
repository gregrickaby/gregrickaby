<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
<!-- END:nextjs-agent-rules -->

# gregrickaby.com

Greg Rickaby's personal site (<https://gregrickaby.com>): blog, photo gallery, resume, and contact page. Markdown in `public/content/`; the only database is a SQLite file of post likes. Every page except `/search` prerenders at build time.

## Stack

Next.js 16.4 (App Router, Cache Components, Partial Prefetching, typed routes, Rust React Compiler) · React 19.3 · TypeScript (strict) · CSS Modules with cascade layers · Vitest 5 + Testing Library + happy-dom · Playwright with `@next/playwright` · ESLint, Stylelint, Prettier, lefthook.

## Commands

```bash
npm run check      # content, CSS module types, typecheck, lint, unit tests with coverage
npm run format     # Prettier (CI runs format:check)
npm run build      # content + production build
npm run test:e2e   # Playwright: builds and runs critical paths, with and without JavaScript
npm run content    # rebuild .generated/content.json after editing Markdown or photos
```

Secrets go in `.env.local` (see `.env.example`). Server errors go to stdout (Coolify logs); there is no logging or analytics service.

## Architecture

- **Content is built, not read at runtime.** `scripts/build-content.ts` renders Markdown (shiki, heading ids, figure captions), sanitizes the HTML, measures images, and reads photo EXIF into `.generated/content.json`. `lib/content.ts` imports that JSON. The build tools are dev dependencies.
- **Static by contract.** `app/(site)/layout.tsx` sets `ensureStatic = 'navigation'`, so the build fails if a page reads cookies, headers, or search params, or does uncached work. `/search` sits outside the group and is the only per-request page.
- **Param routes** (`[slug]`, `tag/[tag]`, `category/[category]`, `/search`) set `instant = false` so the prerendered HTML has the full content for crawlers and readers without JavaScript. Links to them use `prefetch={true}` so client navigation still renders at once. `e2e/site.spec.ts` checks this with `instant()`.
- **Images.** Components use `next/image`. The build writes `/_next/image` URLs and `srcset` into post HTML (`lib/images.ts`). HDR gain map JPEGs (`hdrgm` XMP) use the original file for full-size views, because the optimizer strips the gain map.
- **Client islands.** Server Components by default. Client code lives only in `components/islands/` and never fetches. The like button is the one island that calls server actions (`lib/like-post.ts`).
- **Demos.** A post places an interactive demo with `<div data-demo="name"></div>` on its own line. The build keeps only top-level markers, and `Prose` splits the HTML around them. Each post's demos live in `components/islands/demos/<slug>/`: `demos.tsx` (client components) and `registry.ts` (names and titles, a plain module so the server can read it). `npm run content` writes `.generated/demos.ts` from those folders. Build them from the shared kit in `components/islands/demo-kit/` (`Plot`, `Controls`, `DemoButton`, `Slider`, `Caption`) so every demo looks and behaves the same; a post's own CSS Module is for what only that post needs. The `Demo` frame (`components/demo.tsx`) spaces a demo's top-level children, so a demo can return a fragment. Sound demos play through `playNotes` in `components/islands/sounds.ts`.
- **Likes.** `lib/likes.ts` keeps one row per post per hashed visitor IP in SQLite (`node:sqlite`, no dependency) at `LIKES_DB_PATH`, a file on a Coolify volume. Post pages never read it: the like button loads the count after hydration, so the HTML stays static. Never call a `'use cache'` function from a post page; it makes every post's per-link prefetch render at runtime.
- **Goodreads.** `lib/goodreads.ts` reads the "currently-reading" shelf's public RSS in a `'use cache'` function with a four-hour revalidate; the home page shows it.
- **Easter egg.** `/geocities` rewrites to the standalone page in `public/geocities/`.
- **HTML injection** only in `components/prose.tsx`, `components/json-ld.tsx` (`serializeSchema`), and the theme script in `app/layout.tsx`. ESLint enforces it.
- **Theme.** Color tokens use `light-dark()` in `app/styles/tokens.css`. A `theme` cookie, applied by an inline script before paint, sets `data-theme` on `<html>`, which only switches `color-scheme`.
- **View transitions.** Post cards and article heroes share a `<ViewTransition>` name (`components/post-image.tsx`).
- **Site config.** Copy, nav, and links in `lib/site.ts`; old WordPress redirects in `lib/redirects.ts`; security headers and CSP in `lib/headers.ts`.

## Rules

Read `docs/code-standards.md` before writing or reviewing code. It covers TypeScript, modules, naming, comments, styles, errors, and tests.

Never:

- Start the dev server; the user runs it.
- Read the filesystem at request time (except the likes database), or import `lib/content-build/*` from app code.
- Use `NEXT_PUBLIC_` or UI libraries.
- Commit plans. Keep them in the session scratchpad or `.plans/` (gitignored).
- Add commit trailers or co-authors.

Always:

- Keep links, search, and likes working without JavaScript. The like form is the only thing that posts to the server; `/contact` is a page of links.
- Follow the writing rules in `docs/code-standards.md` for UI copy, docs, and commit messages.
- Keep subagents to a minimum; each one is a separate billed request.

Ask before adding dependencies, committing, or pushing.

## Testing

Unit tests live in `tests/unit/`. They run in Node; component tests add `// @vitest-environment happy-dom`. Render server components with `tests/helpers/render-server.tsx` and build content with `tests/helpers/content.ts` plus `vi.mock('@/.generated/content.json')`. E2E builds the site and runs it with and without JavaScript. Coverage is 100% (95% enforced): keep it at 100%.

## Definition of done

1. `npm run format:check`, `npm run check`, and `npm run build` pass, with coverage at 100%.
2. `npm run test:e2e` passes when a change touches a user flow.
3. UX changes are checked in Chrome with Claude in Chrome against the user's running dev server: the rendered page, the main interaction, and console errors.

## Deploy

Coolify (Railpack) builds `main` and runs `npm start` on port 3000, with a health check on `/api/health`. Cloudflare sits in front and caches `/_next/image`; Coolify keeps `.next/cache` on a volume and runs `npm run purge-cdn` after each deploy.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# gregrickaby.com

Greg Rickaby's personal site, live at <https://gregrickaby.com>: a blog, photo gallery, resume, and contact page. Markdown on disk, no database. Server-first and static: every page except `/search` prerenders at build time. Built the same way as [Viewer for Reddit](https://github.com/gregrickaby/viewer-for-reddit) v10.

## Stack

Next.js 16.4 (App Router, Cache Components, Partial Prefetching, `ensureStatic`, typed routes, Rust React Compiler) · React 19.3 (View Transitions) · TypeScript (strict) · CSS Modules with cascade layers · unified/remark/rehype, shiki, sanitize-html, and exifr at build time only · Vitest 5 + Testing Library + happy-dom · Playwright with `@next/playwright` · ESLint + Stylelint + Prettier.

## Commands

```bash
npm run check         # content + CSS module types + typecheck + lint + unit tests with coverage. REQUIRED before done
npm run format        # Prettier (CI runs format:check)
npm run test:watch    # Vitest in watch mode
npm run test:e2e      # Playwright: builds the app and runs critical paths, with and without JavaScript
npm run build         # Content + production build
npm run content       # Re-render Markdown and photo metadata into .generated/content.json
```

`npm run dev` runs `content` once at start. After editing Markdown or photos, run `npm run content` again.

**Secrets**: `.env.local` (see `.env.example`): `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_PURGE_TOKEN`. There is no logging or analytics service: server errors go to the container's stdout (Coolify logs).

## Architecture rules

- **Content is built, not read at runtime.** `scripts/build-content.ts` renders every post and page (GitHub-flavored Markdown, figure captions, shiki, heading ids), sanitizes the HTML, measures every image, and reads photo EXIF, then writes `.generated/content.json` (gitignored). `lib/content.ts` imports that JSON. Nothing in the running server touches the filesystem, unified, shiki, or exifr; those are dev dependencies.
- **Static by contract.** `app/(site)/layout.tsx` sets `ensureStatic = 'navigation'`: the build fails if any page in the group reads cookies, headers, or search params, or does uncached work. `/search` lives outside the group and is the only per-request page.
- **Param routes block on params** (`instant = false` on `[slug]`, `tag/[tag]`, `category/[category]`, and `/search`), so the prerendered HTML holds the full content for readers without JavaScript and for crawlers. Links to them use `prefetch={true}`, which loads the prerendered page before the click, so client navigations still render at once. `e2e/site.spec.ts` checks this with `instant()`.
- **Images.** Components use `next/image`. Post HTML is built outside React, so the build writes `/_next/image` URLs with a `srcset` itself (`lib/images.ts`). JPEGs with an HDR gain map (`hdrgm` XMP) keep their original file everywhere a full-size view is shown, because the optimizer strips the gain map. Cloudflare caches `/_next/image` for AVIF-capable browsers (cache rule on the zone), and Coolify mounts `.next/cache` as a volume.
- **Server-first UI.** Server Components by default. Client components are small islands in `components/islands/`: theme toggle, mobile menu (a native popover; the island only closes it after navigation), lightbox (a native `<dialog>`), and the resume's print button. No client data fetching.
- **HTML injection** happens only in `components/prose.tsx` (sanitized at build), `components/json-ld.tsx` (escaped by `serializeSchema`), and the root layout's theme script. ESLint enforces it.
- **Theme.** Colors are tokens defined once with `light-dark()` in `app/styles/tokens.css`. `data-theme` on `<html>` only switches `color-scheme`. The choice lives in a `theme` cookie that an inline script applies before paint, so pages stay static.
- **View transitions.** Post card images and article heroes share a `<ViewTransition>` name (`components/post-image.tsx`), so opening a post morphs the card into the hero. The header keeps its own transition name and stays put.
- **SEO.** Site name, copy, nav, and links live in `lib/site.ts`. Redirects for old WordPress URLs are in `lib/redirects.ts`; security headers and the CSP in `lib/headers.ts`. RSS is a prerendered route at `app/feed.xml/route.ts`.

## Conventions

**Never:**

- Start the dev server; the user manages it.
- Read the filesystem at request time, or import `lib/content-build/*` from app code.
- Fetch from the client, or use `any` or the `NEXT_PUBLIC_` env prefix.
- Use `memo()`, `useCallback()`, or `useMemo()`: the React Compiler handles it.
- Use barrel files or UI libraries.
- Add superfluous comments. Match the surrounding comment density and cite the reason, not the change.
- Commit plans. Plans are internal: keep them in the session scratchpad or the gitignored `.plans/`.
- Skip `npm run check` before declaring work complete.
- Wax poetic in commit messages, add commit trailers, or add co-authors.

**Always:**

- Put styles in CSS Modules inside `@layer components`, using the tokens in `app/styles/tokens.css`. Stylelint enforces the layer and forbids raw colors.
- Keep links and search working without JavaScript. The site has no forms that post to the server; `/contact` is a static page of links.
- Write prose (UI copy, docs, commit messages) following [writing-style.md](./.claude/rules/writing-style.md): no emoji, no em dashes, plain verbs.
- Minimize subagent spawning. Each one is a separate billed request; use Read/Grep/Bash for known files and symbols.
- Caveman skill, `full` mode, is active every session (persists per its own instructions). Drop it for security warnings, irreversible-action confirmations, or on request.

**Testing:** unit tests live in `tests/unit/` (Node by default; component tests add `// @vitest-environment happy-dom`). Server components render through `tests/helpers/render-server.tsx`; content comes from `tests/helpers/content.ts` with `vi.mock('@/.generated/content.json')`. Coverage is enforced at 90% and currently 100%: keep it there.

**Definition of done**: `npm run format:check`, `npm run check`, and `npm run build` pass. Run `npm run test:e2e` when a change touches a user flow. Check every UX change in Chrome against the user's running dev server.

## Deploy

Coolify (Railpack) builds `main` and runs `npm start` on port 3000, with a health check on `/api/health`. Cloudflare sits in front.

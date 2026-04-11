# Project Guidelines

Personal blog. Built with Next.js 16 App Router, React 19, Mantine 9, and TypeScript. Content is Markdown files on disk — no database, no API routes.

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

# Mantine UI: ALWAYS read docs before coding

Before any Mantine work, find and read the relevat doc at https://mantine.dev/llms.txt. Your training data is outdate - the docs are the source of truth.

## Build and Test

```bash
npm run dev          # Start dev server (clears .next, uses HTTPS)
npm run build        # Generate RSS feed, then Next.js production build
npm run test         # Vitest with v8 coverage (single run)
npm run test:watch   # Vitest in watch mode
npm run validate     # tsc + lint + format + test — run before marking any task complete
```

Pre-commit hooks (via lefthook) auto-run ESLint and Prettier on staged files.

## Architecture

```
app/              # App Router pages and layouts (server components by default)
components/       # Reusable UI components, each with .tsx + .module.css + .test.tsx
lib/
  content.ts      # Server-only: reads Markdown from disk via fs — never import in client components
  types.ts        # Shared types safe for both server and client
  config.ts       # siteConfig constants (nav, URL, author)
  utils.ts        # Utility functions
  hooks/          # Custom React hooks (client-side only)
public/content/   # Markdown content co-located with images
  posts/<slug>/content.md
  pages/<slug>/content.md
scripts/          # Build-time scripts (generate RSS feed)
test-utils/       # Custom RTL render wrapper (includes MantineProvider)
```

Deployed on Coolify via nixpacks (Node 24). No `output: 'export'`.

## Conventions

**Server vs. client:** All components are server components by default. Add `'use client'` only when using Mantine hooks, React state, effects, or browser APIs. Never import `lib/content.ts` in a client component.

**Content:** Posts and pages live at `public/content/{posts|pages}/<slug>/content.md` with gray-matter frontmatter matching `PostMeta` in `lib/types.ts`. Images are co-located in the same folder. Do not hand-edit `public/feed.xml` — it is generated at build time.

**UI:** Use Mantine layout primitives (`Container`, `Stack`, `Group`, `SimpleGrid`) over custom CSS. Mantine components are client-only. Use CSS modules for styles and limit inline style props to 3-4 single-property overrides. Use `<AppLink>` for all links — never plain `<a>` or Mantine `<Anchor>`.

**Images:** Use `next/image` for all images. Reference post images with `getFeaturedImagePath(slug, filename)` from `lib/types.ts`.

**Testing:** Every component and page needs a `.test.tsx` file. Vitest globals are enabled — do not import `describe`, `it`, `expect`, or `vi`. Always use the custom `render` from `test-utils/`, not the one from `@testing-library/react`. Mock `lib/content.ts` in tests.

**TypeScript:** No `any`. Prefer `interface` for objects, `type` for unions. No plain `.js`/`.jsx` in `app/`, `components/`, or `lib/`.

**Security:** Secrets go in `.env.local` only. No `NEXT_PUBLIC_` prefix for server-only secrets. `dangerouslySetInnerHTML` is used in `Article.tsx` with sanitized input — do not add new usages without sanitizing first.

## Code Style

No semicolons, single quotes, trailing commas (es5). Run `npm run format` to apply. See `.github/instructions/code-standards.instructions.md` for full standards.

## Writing Style

Prose style rules for conversation, code comments, and blog post editing. See `.github/instructions/writing-style.instructions.md for full instructions.

## Validation

Before declaring any task complete, you must run `npm run validate`. All linting and tests must pass.

# Project Guidelines

Personal blog. Next.js 16 App Router, React 19, Mantine 9, TypeScript. Markdown content on disk — no database.

## Run

```bash
npm run dev          # Dev server (clears .next, HTTPS)
npm run build        # RSS feed + production build
npm run test         # Vitest + coverage
npm run validate     # tsc + lint + format + test
```

<!-- BEGIN:nextjs-agent-rules -->

## Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

## Additional Docs

- **Mantine:** https://mantine.dev/llms.txt
- **Axiom:** https://axiom.co/docs/llms.txt

## Architecture

```
app/              # App Router pages/layouts (server components by default)
  api/
    axiom/        # Client-log proxy route handler
    healthcheck/  # Container health check
  [slug]/         # Dynamic post/page route
  category/[category]/
  tag/[tag]/
  not-found.tsx   # Custom 404 page ('use client')
components/       # UI components — each has .tsx + .module.css + .test.tsx
instrumentation.ts  # Axiom error reporting (Next.js instrumentation hook)
proxy.ts          # Request logging middleware (Axiom)
lib/
  content.ts      # Server-only: reads Markdown via fs — never import in client code
  types.ts        # Shared types (safe for server and client)
  config.ts       # siteConfig constants
  headers.ts      # HTTP security headers (imported by next.config.ts)
  metadata.ts     # buildContentMetadata() — OG/SEO metadata factory
  photos.ts       # Server-only: reads EXIF/IPTC from photos
  redirects.ts    # 301 redirects for legacy URLs (imported by next.config.ts)
  schema.ts       # JSON-LD structured data builders
  staticPage.tsx  # createStaticPage() factory for markdown-backed static pages
  utils.ts        # Shared utility functions
  pagination.ts   # PAGE_SIZE constant + paginate() helpers
  services.ts     # serviceOptions list + isValidService()
  feed.ts         # buildFeedXml() — used by build-time RSS script
  axiom/          # Logging: server.ts (server-only), client.ts (useLogger, WebVitals)
  hooks/          # Custom React hooks (client-side only)
public/content/   # Markdown + co-located images
  posts/<slug>/content.md
  pages/<slug>/content.md
  photos/
scripts/          # Build-time scripts (RSS feed)
test-utils/       # Custom RTL render wrapper (MantineProvider)
```

Deployed on Coolify via nixpacks (Node 24). No `output: 'export'`.

## Key Rules

- Server components by default; `'use client'` only for Mantine hooks, state, effects, browser APIs
- Never import `lib/content.ts` or `lib/axiom/server.ts` in client code — both use server-only APIs
- Use Mantine primitives (`Container`, `Stack`, `Group`, `SimpleGrid`); CSS modules for styles
- Use `<AppLink>` and `next/image` — never plain `<a>` or `<img>`
- Secrets in `.env.local` only; no `NEXT_PUBLIC_` prefix for server-only secrets
- `dangerouslySetInnerHTML` is allowed only with sanitized input — never pass raw user content
- Vitest globals enabled — do not import `describe`, `it`, `expect`; use custom `render` from `test-utils/`; mock `lib/content.ts`
- Cache async data with `'use cache'` + `cacheLife()` + `cacheTag()`; wrap dynamic content in `<Suspense>`
- `reactCompiler: true` is enabled — do not add `useMemo`, `useCallback`, or `React.memo` manually
- Server-side logging via `lib/axiom/server.ts`; client-side via `useLogger` from `lib/axiom/client.ts`
- Never commit or push changes on the developer's behalf

## Task Completion

Before declaring a task complete:

1. Run `npm run validate`
2. No SonarQube for IDE tool issues

## References

- Code standards: `.agents/instructions/code-standards.instructions.md`
- Writing style: `.agents/instructions/writing-style.instructions.md`
- Update instructions skill: `.agents/skills/update-instructions/SKILL.md`

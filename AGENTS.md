# Project Guidelines

Personal blog. Next.js 16 App Router, React 19, Mantine 9, TypeScript. Markdown content on disk — no database, no API routes.

## Run

```bash
npm run dev          # Dev server (clears .next, HTTPS)
npm run build        # RSS feed + production build
npm run test         # Vitest + coverage
npm run validate     # tsc + lint + format + test
```

## Docs First

Before any Next.js, Mantine, or Axiom work, read the relevant docs — training data is outdated.

- **Next.js:** `node_modules/next/dist/docs/`
- **Mantine:** https://mantine.dev/llms.txt
- **Axiom:** https://axiom.co/docs/llms.txt

## Architecture

```
app/              # App Router pages/layouts (server components by default)
components/       # UI components — each has .tsx + .module.css + .test.tsx
lib/
  content.ts      # Server-only: reads Markdown via fs — never import in client code
  types.ts        # Shared types (safe for server and client)
  config.ts       # siteConfig constants
  hooks/          # Custom React hooks (client-side only)
public/content/   # Markdown + co-located images
  posts/<slug>/content.md
  pages/<slug>/content.md
scripts/          # Build-time scripts (RSS feed)
test-utils/       # Custom RTL render wrapper (MantineProvider)
```

Deployed on Coolify via nixpacks (Node 24). No `output: 'export'`.

## Key Rules

- Server components by default; `'use client'` only for Mantine hooks, state, effects, browser APIs
- Never import `lib/content.ts` in client code — it uses `fs` and throws at runtime
- Use Mantine primitives (`Container`, `Stack`, `Group`, `SimpleGrid`); CSS modules for styles
- Use `<AppLink>` and `next/image` — never plain `<a>` or `<img>`
- Secrets in `.env.local` only; no `NEXT_PUBLIC_` prefix for server-only secrets
- `dangerouslySetInnerHTML` only in `ArticleContent.tsx` with sanitized input
- Vitest globals enabled — do not import `describe`, `it`, `expect`; use custom `render` from `test-utils/`; mock `lib/content.ts`
- Never commit or push changes on the developer's behalf

## Task Completion

Before declaring a task complete:

1. Run `npm run validate`
2. No SonarQube for IDE tool issues

## References

- Code standards: `.agents/instructions/code-standards.instructions.md`
- Writing style: `.agents/instructions/writing-style.instructions.md`

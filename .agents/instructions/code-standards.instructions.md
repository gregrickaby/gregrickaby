---
description: 'Code standards and best practices for the Next.js 16 + Mantine 9 personal blog project.'
applyTo: '**/*.tsx,**/*.ts,**/*.jsx,**/*.js,**/*.mjs,**/*.css,**/*.md'
---

# Code Standards

## Helper/Utility Functions

- All helper/utility functions must be in `lib/`. Never place alongside components or pages.
- All functions in `lib/` must have explicit TypeScript return types and JSDoc comments along with tests.

## Server vs. Client Components

- All components are server components by default
- Add `'use client'` only when a component uses Mantine hooks, React state, effects, or browser APIs
- **Never import `lib/content.ts` in a client component** — it uses `fs` and throws at runtime
- Use `lib/types.ts` for types shared across both boundaries

## Routing and Pages

- All pages live in `app/<route>/page.tsx`
- Every page must export `generateMetadata()` for SEO
- Dynamic post pages use `generateStaticParams()` to pre-render all slugs
- API routes are limited to infrastructure concerns (`api/axiom` logging proxy, `api/healthcheck`); do not add business logic API routes
- Do not configure `output: 'export'`

## Mantine 9 UI

- Use Mantine layout primitives (`Container`, `Stack`, `Group`, `SimpleGrid`) over custom CSS
- Do not import from `@mantine/core` in server components — Mantine components are client-only
- Use CSS modules for styles; limit style props to 3-4 single-property overrides
- Always use the `tomato` theme for colors. Avoid `gray`.

## CSS Modules

- No hardcoded color values (e.g., `#292929`); use Mantine variables or CSS custom properties
- Use `light-dark()` for colors that must adapt: `color: light-dark(var(--mantine-color-gray-700), var(--mantine-color-gray-300))`
- Avoid variables that don't adapt to light/dark mode
- Properties in alphabetical order

## Images and Links

- Use `next/image` for all images — never `<img>`
- Use `<AppLink>` for all links — never plain `<a>` or Mantine `<Anchor>`

## Content

- Posts/pages live at `public/content/{posts,pages}/<slug>/content.md`
- Frontmatter fields are defined by `PostMeta` in `lib/types.ts` — do not add undeclared fields
- Do not hand-edit `public/feed.xml` — it is generated at build time

## Naming Conventions

| Thing                 | Convention                 | Example           |
| --------------------- | -------------------------- | ----------------- |
| Directories           | `kebab-case`               | `fun-stuff/`      |
| Component files       | `PascalCase`               | `PostCard.tsx`    |
| Utility/lib files     | `camelCase`                | `content.ts`      |
| Constants             | `UPPER_SNAKE_CASE`         | `SITE_URL`        |
| Variables & functions | `camelCase`                | `getAllPosts()`   |
| Types & interfaces    | `PascalCase`               | `PostMeta`        |
| Test files            | match source + `.test.tsx` | `Header.test.tsx` |

## TypeScript

- Use `interface` for object types; `type` for unions and utility types
- No `any` — use `unknown` and narrow
- Explicit types for public-facing functions in `lib/`
- All interfaces, components, and functions must have full JSDoc comments including parameter and return types.

```ts
/**
 * Props for the PostPagination component.
 */
interface PostPaginationProps {
  /* Total number of posts for pagination. */
  total: number
  /* Current page number (1-based index). */
  current: number
  /* Optional. Number of posts per page. */
  baseUrl?: string
}

/**
 * Get all posts from the content directory.
 *
 * @returns An array of post metadata objects.
 */
export function getAllPosts(): PostMeta[] {
  // ...
}

/**
 * Component for rendering pagination controls on the posts listing page.
 *
 * @param props - The props for the PostPagination component.
 * @returns A React element representing the pagination controls.
 */
export default function PostPagination({
  total,
  current,
  baseUrl = '/posts'
}: PostPaginationProps) {
  // ...
}
```

## Testing

- Vitest globals enabled — do not import `describe`, `it`, `expect`, or `vi`
- Always use the custom `render` from `test-utils/`, not `@testing-library/react` directly
- Mock `lib/content.ts` — never read the filesystem in a test
- Aim for 100% coverage on new code; note coverage is scoped to `app/**` by default (`lib/` and `components/` require explicit test files but are not included in the coverage report)

## Logging (Axiom)

- Server-side logging: import `logger` from `lib/axiom/server.ts`; wrap route handlers with `withAxiom`
- Client-side logging: use the `useLogger` hook from `lib/axiom/client.ts`; it proxies through `api/axiom` so `AXIOM_TOKEN` is never exposed to the browser
- Web Vitals are reported via the `<WebVitals>` component from `lib/axiom/client.ts`
- Unhandled request errors are captured via `instrumentation.ts` — do not duplicate error logging in route handlers
- Never import `lib/axiom/server.ts` in client components — it uses `'server-only'` and throws at runtime

## Cache Components (Next.js 16)

- Enable with `cacheComponents: true` in `next.config.ts` (replaces `experimental.ppr`)
- Use `'use cache'` directive at file, component, or function level for async data that does not need a fresh fetch every request
- Call `cacheLife()` inside a `'use cache'` block to set a built-in profile (`'minutes'`, `'hours'`, `'days'`, `'weeks'`, `'max'`)
- Call `cacheTag()` to tag cached content; use `revalidateTag()` for background revalidation or `updateTag()` when the same request must see fresh data
- Never call `cookies()`, `headers()`, or read `searchParams` inside `'use cache'` — extract them outside and pass as arguments (cache key includes serializable arguments automatically)
- Wrap dynamic content (runtime cookies/headers) in `<Suspense>` so the static shell ships immediately
- Replace all `unstable_cache()` calls with the `'use cache'` directive

## React Compiler

- `reactCompiler: true` is enabled in `next.config.ts` — the compiler handles memoization automatically
- Do not add `useMemo`, `useCallback`, or `React.memo` manually

## Security

- Secrets in `.env.local` only — never commit them
- Server-only secrets must not use `NEXT_PUBLIC_` prefix
- `dangerouslySetInnerHTML` is allowed only when the HTML has been run through the sanitizer first — never pass unsanitized input
- Run `npm audit` periodically; address critical/high vulnerabilities

## Task Completion

Run `npm run validate` before marking any task complete. Check SonarQube for IDE tool issues triggered by your code.

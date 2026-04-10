---
description: 'Code standards and best practices for the Next.js 16 + Mantine 9 personal blog project. Follow these guidelines for all new code and when modifying existing code.'
applyTo: '**/*.tsx,**/*.ts,**/*.jsx,**/*.js,**/*.mjs,**/*.css,**/*.md'
---

# Overview

Standards for building and maintaining this Next.js 16 + Mantine 9 personal blog. Follow these rules for all new code and when modifying existing code. Always fetch https://mantine.dev/llms.txt for current API reference before reviewing Mantine code.

---

## Project Structure

```
app/                  # App Router pages and layouts
components/           # Reusable client components
  Header/
    Header.tsx         # Site header with navigation links
    Header.module.css  # CSS module for Header styles
    Header.test.tsx    # Tests for Header component
lib/
  hooks/              # Custom React hooks (client components only)
  content.ts          # Server-only: markdown file reading (uses fs)
  types.ts            # Client-safe shared types and helpers
  config.ts           # Site configuration constants
  utils.ts            # Utility functions (server or client)
public/content/       # Markdown content with co-located images
  <slug>/
    content.md        # Post or page content with gray-matter frontmatter
    *.{jpg,png,gif}   # Images co-located with their post
scripts/              # Build-time scripts (e.g. generate-feed.mjs)
test-utils/           # Custom RTL render wrapper with MantineProvider
```

- Do not create a `src/` directory — all source lives at the project root
- Do not create `contexts/` or `api/` directories unless explicitly asked
- Place component tests and CSS modules in the same directory as the component for easy discoverability

---

## Server vs. Client Components

- All components are **server components by default**
- Add `'use client'` only when a component uses Mantine hooks, React state, effects, or browser APIs
- **Never import `lib/content.ts` in a client component** — it uses `fs` and will throw at runtime
- Use `lib/types.ts` for types that must be shared across both boundaries
- `lib/content.ts` functions (`getPostBySlug`, `getPageBySlug`, `getAllPosts`) are server-only and must only be called from server components or build-time scripts

```typescript
// ❌ BAD: importing server-only code in a client component
'use client'
import {getAllPosts} from '@/lib/content'

// ✅ GOOD: import only the types from the client-safe module
;('use client')
import type {PostMeta} from '@/lib/types'
```

---

## Routing and Pages

- All pages live in `app/<route>/page.tsx` following the App Router convention
- Every page must export a `generateMetadata()` function for SEO (title, description, OpenGraph)
- Dynamic post pages use `generateStaticParams()` to pre-render all slugs at build time
- Metadata-only routes (`robots.ts`, `sitemap.ts`) must export `export const dynamic = 'force-static'`
- Do not create API routes — this is a content blog with no backend endpoints
- Do not configure `output: 'export'`; the site is server-rendered and deployed on Coolify via nixpacks

```typescript
// ✅ GOOD: standard page with metadata
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: post.meta.title,
    description: post.meta.excerpt,
  }
}

export default function PostPage({params}: Props) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()
  return <Article post={post} />
}
```

---

## Mantine 9 UI

- Use Mantine layout primitives (`Container`, `Stack`, `Group`, `SimpleGrid`) instead of custom CSS wherever possible
- Do not import from `@mantine/core` in server components — Mantine components are client-only
- Toggle dark/light mode with `useMantineColorScheme()` — never manipulate `data-mantine-color-scheme` directly
- `ColorSchemeScript` is already in `app/layout.tsx`; do not add it again
- Use CSS modules for styling Mantine components. See the CSS and Styling section below for guidelines on when to use style props vs. CSS modules.

```typescript
// ❌ BAD: Too many style props, no CSS module
<div mt="xl" mr="sm" c="inherit" fw="bold" cols={{base: 1, sm: 2, lg: 3}}>
  {posts.map(p => <PostCard key={p.slug} post={p} />)}
</div>

// ✅ GOOD: CSS module for most styles, style props only for simple overrides
<SimpleGrid className={styles.grid} cols={{base: 1, sm: 2, lg: 3}}>
  {posts.map(p => <PostCard key={p.slug} post={p} />)}
</SimpleGrid>
```

---

## Images and Links

- Use `next/image` for all images — never use plain `<img>` tags
- Reference images that belong to a post using `getFeaturedImagePath(slug, filename)` from `lib/types.ts`

```typescript
import Image from 'next/image'
import {getFeaturedImagePath} from '@/lib/types'

<Image
  src={getFeaturedImagePath(post.meta.slug, post.meta.featuredImage)}
  alt={post.meta.title}
  width={800}
  height={450}
/>
```

- Use `<AppLink>` for all links — never use plain `<a>` tags or `<Anchor>` from Mantine.
- For external links, use `next/link` with `target="_blank"` and `rel="noopener noreferrer"` for security

````typescript
<AppLink
  href={siteConfig.author.github}
  target="_blank"
  rel="noopener noreferrer"
  className={classes.link}
>
  GitHub
</AppLink>

---

## Content

- Each post or page lives at `public/content/<slug>/content.md`
- Frontmatter fields are defined by the `PostMeta` type in `lib/types.ts` — do not add undeclared fields without updating the type
- Images for a post are co-located in the same directory as `content.md`
- The RSS feed is generated at build time by `scripts/generate-feed.mjs` — do not hand-edit `public/feed.xml`

---

## TypeScript

- Use TypeScript for all files — no plain `.js` or `.jsx` in `app/`, `components/`, or `lib/`
- Prefer `interface` for object types; use `type` for unions and utility types
- Do not use `any` — use `unknown` and narrow the type instead
- All function parameters and return types should be explicitly typed for public-facing functions in `lib/`

---

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

---

## Testing (Vitest v4 + RTL)

- Every new component and page must have a corresponding test file in `__tests__/`
- Vitest globals are enabled — **do not import** `describe`, `it`, `expect`, or `vi` from `vitest`
- Always use the custom `render` from `test-utils/` (wraps with `MantineProvider`) — not the one from `@testing-library/react` directly
- Test names must describe the expected behavior: `'renders the post title'`, not `'test1'`
- Mock `lib/content.ts` in tests — never read from the filesystem in a test

```typescript
// ❌ BAD: bare RTL render, no Mantine context
import {render} from '@testing-library/react'

// ✅ GOOD: wrapped render from test-utils
import {render, screen} from '@/test-utils'

describe('Header', () => {
  it('renders the site title link', () => {
    render(<Header />)
    expect(screen.getByRole('link', {name: /greg rickaby/i})).toBeInTheDocument()
  })
})
````

---

## Code Style

- **No semicolons**, **single quotes**, **trailing commas** (es5) — enforced by Prettier
- Run `npm run format` to apply formatting; never manually reformat whitespace

---

## CSS and Styling

- Use CSS modules as the primary styling method for Mantine components.
- Use style props only for single-property overrides: margin, padding, color, width, height.
- Limit style props to 3-4 per component. More than that, create a CSS module file instead.

---

---

## Security

- Store secrets in `.env.local` — never commit them to version control
- Server-only secrets must **not** use the `NEXT_PUBLIC_` prefix (they would be inlined into the client bundle)
- `dangerouslySetInnerHTML` is used in `Article.tsx` to render sanitized markdown HTML — do not add new usages without sanitizing the input first
- Run `npm audit` periodically and address critical or high severity vulnerabilities

## Completion Gate

- Run `npm run validate` before marking any task complete.
- Check SonarQube for IDE tool issues, bugs, or vulnerabilities and fix any that are triggered by your code before declaring the task complete.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website for Greg Rickaby built with Next.js 15, React 19, TypeScript, and Mantine UI. Features a custom photo carousel homepage and a headless WordPress blog backend. The site uses Next.js App Router with route groups and cached components for optimal performance.

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbo (cleans .next first)
npm run build            # Build production bundle
npm start                # Start production server

# Quality Checks
npm run format           # Format code with Prettier
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript compiler checks (no emit)
npm test                 # Run Vitest tests (single run)

# Testing
npm test                 # Run all tests with coverage
vitest                   # Run tests in watch mode
vitest run path/to/test  # Run specific test file

# WordPress GraphQL
npm run codegen          # Generate TypeScript types from WordPress GraphQL schema
npm run codegen:watch    # Watch mode for type generation
```

## Validation Workflow

**IMPORTANT**: Before considering any task complete, you MUST run all validation steps in this order:

```bash
npm run format      # 1. Format code with Prettier
npm run lint        # 2. Lint with ESLint (must pass with no errors)
npm run typecheck   # 3. Type check with TypeScript (must pass)
npm test            # 4. Run all tests (must pass)
```

All steps must pass before code is considered complete. This ensures:

- Consistent code formatting
- No linting errors
- Type safety
- All tests passing

If any step fails, fix the issues and run all steps again from the beginning.

## Architecture

### Route Groups

The app uses Next.js route groups to organize pages with different layouts:

- `app/(home)/` - Homepage with photo carousel
- `app/(default)/` - All other pages with standard layout
  - `[slug]/` - Dynamic routes for both blog posts and pages (e.g., `/my-post-slug`, `/about`)
  - `contact/` - Contact page
  - `preview/[id]/` - Preview pages

**Important**: Blog posts are served at the root level (e.g., `/my-post-slug`), not under `/blog/`, to match the WordPress URL structure.

Both route groups share identical layout files (`layout.tsx`) that set up Mantine theming, Analytics, and SEO metadata.

### Path Aliases

The project uses `@/` as an alias for the root directory:

```typescript
import {siteConfig} from '@/lib/config'
import {Analytics} from '@/components/Utils/Analytics/Analytics'
```

### Component Organization

```
components/
├── Layout/     # Layout-related components
├── UI/         # Reusable UI components
└── Utils/      # Utility components (Analytics, etc.)
```

### Library Structure

```
lib/
├── config.ts      # Site configuration (name, title, description, url)
├── types/         # TypeScript type definitions
├── services/      # API/data fetching services
├── utils/         # Utility functions
└── wordpress/     # WordPress headless CMS integration
    ├── client.ts           # GraphQL client configuration
    ├── queries/            # GraphQL queries
    ├── services/           # WordPress service functions
    ├── types/              # Manual type definitions
    └── generated/          # Auto-generated GraphQL types
```

## Testing

- **Framework**: Vitest with jsdom environment
- **Libraries**: Testing Library (React, DOM, Jest-DOM), MSW for API mocking
- **Coverage**: Enabled by default with text/json/html reports
- **Setup**: `vitest.setup.ts` configures jsdom mocks (matchMedia, ResizeObserver, etc.)
- **Test Location**: Place tests next to components with `.test.tsx` extension

Coverage excludes config files, test files, Next.js special files (page, layout, etc.), and type definitions.

## Code Quality

### Pre-commit Hooks

Lefthook runs automatically before commits:

- ESLint on staged `.{js,jsx,ts,tsx}` files (auto-fixes)
- Prettier on staged `.{mjs,cjs,js,jsx,ts,tsx,md,css,json,yml,yaml}` files

### ESLint Configuration

- Flat config format (`eslint.config.mjs`)
- Extended configs: TypeScript, Mantine, Testing Library, Jest-DOM, Prettier
- Custom rule: `no-console` allows `warn`, `error`, `info` but not `log`
- Testing-specific rules apply to `*.test.*` and `*.spec.*` files

## API Routes

### Revalidation Endpoint

`app/api/revalidate/route.ts` provides on-demand ISR revalidation:

```bash
GET /api/revalidate?slug=foo-bar-baz
# Requires x-vercel-revalidation-secret header matching REVALIDATION_SECRET env var
```

Uses `revalidateTag()` for cache invalidation. GET requests only; other methods return 405.

## Configuration

### Next.js

- Cached components enabled (`cacheComponents: true`) for improved performance
- Image optimization: AVIF/WebP formats
- Optimized Mantine imports via `optimizePackageImports`
- Comprehensive CSP headers configured (see `next.config.ts`)
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy

### Environment Variables

- `NEXT_PUBLIC_WORDPRESS_API_URL` - WordPress GraphQL endpoint (required for blog)
- `REVALIDATION_SECRET` - Required for on-demand revalidation API
- `NODE_ENV` - Affects CSP script-src policy (dev allows 'unsafe-eval')
- `ANALYTICS_ID`, `ANALYTICS_SCRIPT_URL`, `ENABLE_ANALYTICS` - Analytics configuration

## Deployment

Uses Nixpacks configuration (`nixpacks.toml`):

- Node.js 22 pinned via nixpkgs
- Build caching: `.next/cache`, `node_modules/.cache`, `/root/.npm`
- Commands: `npm i` (install with Linux binaries) → `npm run build` → `npm run start`

## UI Framework

Mantine v8 provides the component library and theming. Theme customization in layout files sets Anchor components to never underline by default. Auto color scheme switching enabled. Use Mantine primitives. Please fetch the documentation <https://mantine.dev/llms.txt>

## WordPress Headless CMS Integration

### Overview

The blog uses WordPress as a headless CMS via GraphQL (WPGraphQL plugin required). All WordPress data fetching is fully typed using GraphQL Code Generator or manual type definitions.

### Type Generation

```bash
npm run codegen  # Generate types from WordPress GraphQL schema
```

- Requires WordPress GraphQL introspection to be enabled
- Types are generated in `lib/wordpress/generated/graphql.ts`
- Manual fallback types available in `lib/wordpress/types/index.ts`

### WordPress Plugins Required

- **WPGraphQL** - Provides GraphQL API
- **Yoast SEO** - SEO metadata automatically included in queries
- **Advanced Custom Fields (ACF)** - Custom fields support (define types in `lib/wordpress/types/index.ts`)

### Fetching Content

```typescript
import {
  getPosts,
  getPostBySlug,
  getPageBySlug,
  getContentBySlug,
  getAllPostSlugs,
  getAllPageSlugs
} from '@/lib/wordpress'

// Get paginated posts
const data = await getPosts(12, afterCursor)

// Get single post
const postData = await getPostBySlug('my-post-slug')

// Get single page
const pageData = await getPageBySlug('about')

// Get content (auto-detects post or page)
const {data, type} = await getContentBySlug('my-slug')
// type will be 'post' | 'page' | null

// Get all slugs for static generation
const postSlugs = await getAllPostSlugs()
const pageSlugs = await getAllPageSlugs()
```

### Content Type Detection

The `[slug]` route automatically detects whether a slug is a post or page:

1. First tries to fetch as a post
2. If not found, tries to fetch as a page
3. If neither found, returns 404

Use type guards to safely work with content:

```typescript
import {isPostContent, isPageContent} from '@/lib/wordpress'

const {data, type} = await getContentBySlug(slug)

if (isPostContent(data)) {
  // TypeScript knows data is a Post
  console.log(data.categories)
}

if (isPageContent(data)) {
  // TypeScript knows data is a Page
  console.log(data.parent)
}
```

### Cache Configuration

**WordPress data is NOT cached** - all requests fetch fresh data from WordPress GraphQL API. This ensures you always see the latest content immediately after making changes in WordPress, without waiting for cache invalidation.

### SEO Integration

Blog posts and pages automatically include Yoast SEO metadata in Next.js metadata API. See `app/(default)/[slug]/page.tsx` for implementation of:

- Title and meta descriptions
- Open Graph tags
- Twitter Card data
- Canonical URLs
- Schema.org JSON-LD

### Content Sanitization

WordPress HTML content is sanitized using `sanitize-html` before rendering. Configuration allows standard HTML tags, embeds (YouTube, Vimeo), and removes potentially harmful content.

### Adding Custom Fields (ACF)

1. Add fields in WordPress ACF plugin
2. Update the `PostACF` interface in `lib/wordpress/types/index.ts`:

```typescript
export interface PostACF {
  featured?: boolean
  customExcerpt?: string
  // Add your fields here
}
```

3. Add fields to GraphQL queries in `lib/wordpress/queries/posts.ts`
4. Run `npm run codegen` to regenerate types

# Code standards

How code in this repo is written. `AGENTS.md` covers the architecture and what keeps the site static; this file covers the code itself. ESLint, Stylelint, and Prettier enforce the rules marked (lint). Review catches the rest.

## TypeScript

- Strict mode, with `noUncheckedIndexedAccess`. No `any` (lint): narrow `unknown` with a type guard.
- Object shapes are `interface` (lint). Use `type` for unions, tuples, function types, and mapped or derived types (`Pick<...>`).
- Import types with `import type` or an inline `type` specifier (lint).
- Import React types by name (`import type { ReactNode } from 'react'`), not through the `React` namespace (lint).

## Modules

- Named exports only (lint). Default exports are for files Next.js or a tool loads by default: route files (`page`, `layout`, `opengraph-image`, `sitemap`, and the rest) and `*.config.ts`.
- No barrel files. Import from the module that defines the thing.
- Imports sort into three groups, separated by a blank line: packages (Node built-ins, then `next` and `react`, then the rest), `@/` paths, and `./` siblings. Prettier sorts them on format (lint). Side-effect imports (`import 'server-only'`, global CSS) stay where they are, so put them first.
- Import from another folder with `@/`, and from the same folder with `./` (lint bans `../`). `lib/content-build/` and `scripts/` are the exception: Node runs them directly, so they import by relative path with the `.ts` extension.
- Modules that must never reach the browser start with `import 'server-only'`.

## Functions and components

- Top-level functions are function declarations (lint). Arrow functions are for callbacks, inline handlers, and consts with a type annotation (`const rule: Rule = ...`).
- Server Components by default. Client code lives in `components/islands/` and never fetches (lint).
- Type props inline in the signature. Name them with an `interface` only when another module uses the type.
- No `memo()`, `useCallback()`, or `useMemo()`: the React Compiler handles it.
- JSX props are sorted alphabetically (lint).

## Naming

- Files are kebab-case (`post-card.tsx`). A component's CSS Module sits beside it with the same name (`post-card.module.css`).
- Components are PascalCase, functions and variables camelCase, and module-level constants SCREAMING_SNAKE_CASE (`IMAGE_WIDTHS`, `SITE`).
- CSS Module classes are camelCase (lint).
- Getters start with `get`, predicates with `is` or `has`, and builders with `build`.

## Comments

- Comments say why, not what. Match the density of the code around them.
- Exports get a `/** */` summary when the name and types don't already say what they do. Add `@param` and `@returns` only when they say something the signature doesn't.
- No comments that point to tickets, plans, or documents outside the repo.
- Comments follow the writing rules below, like the rest of the prose.

## Styles

- CSS Modules, with every rule inside `@layer components` (lint).
- Colors come from the tokens in `app/styles/tokens.css` (lint). `light-dark()` handles the themes.
- Inline `style` only for values computed from data, such as an aspect ratio.

## Errors

- The content build works around gaps instead of failing: an image it can't measure ships without a size, and a photo without EXIF takes its title from the file name.
- Runtime lookups return `null` for a missing post or page, and the page calls `notFound()`.
- Islands catch what can fail in the browser (clipboard, storage, audio) and degrade quietly.

## Tests

- Unit tests live in `tests/unit/`, grouped like the source. Component tests start with `// @vitest-environment happy-dom`.
- Name tests by behavior: `it('falls back to the site description for a page without one')`.
- Assert on output (rendered HTML, return values), not on which internal functions ran.
- A test that changes shared fixtures resets them in `afterEach`, so a failed assertion can't leak into the next test.
- Coverage stays at 100%.

## Writing

UI copy, comments, docs, and commit messages follow these rules:

- Straight quotes and apostrophes (`'` and `"`), never curly ones. In JSX text, use `&apos;` and `&quot;`.
- No em dashes. Use a comma, colon, or parentheses.
- Sentence case for headings, buttons, and labels: "Other experience", not "Other Experience".
- Plain verbs: "is", "has", "use". Skip filler words such as "delve", "robust", "seamless", "leverage", and "ensure".
- Say the specific thing. "Couldn't load your saved items" beats "Something went wrong".
- No emoji.

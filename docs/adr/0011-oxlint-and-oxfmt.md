# 0011. Lint with Oxlint and format with Oxfmt

- Date: 2026-11-03
- Status: Accepted (Stylelint removed by [0014](0014-remove-stylelint.md))

## Context

ESLint ran through `eslint-config-next`, which brings in `typescript-eslint`, `eslint-plugin-import`, `eslint-plugin-react`, and `eslint-plugin-jsx-a11y`. Two problems came from that stack:

- `typescript-eslint` 8.72.1 supports only TypeScript below 6.1.0, so the repo couldn't move to TypeScript 7.
- The older plugins depend on minimatch 3.1.5, which has an open denial-of-service advisory (fixed in 11.0.1, with no 3.x release). eslint-plugin-react calls minimatch as a function, so an override to 11 breaks it.

Oxlint and Oxfmt come from the Oxc project, the same group behind Vite and Vitest. Oxlint has the react, jsx-a11y, Next.js, import, and TypeScript rules built in, and it runs plugins written against ESLint's rule API. Oxfmt formats the same files Prettier did, with Prettier's options and import sorting built in. Oxfmt is pre-1.0 (0.76.0).

## Decision

- `npm run lint` runs `oxlint --deny-warnings` with `.oxlintrc.json`, then Stylelint. Lefthook runs `oxlint --fix` on staged files.
- `.oxlintrc.json` turns on the `correctness` category and repeats every rule and per-file override from the old `eslint.config.ts`.
- `oxlint/plugin.ts` holds the three rules Oxlint doesn't have: `function-declarations` (top-level functions are declarations), `no-react-namespace`, and `jsx-sort-props` (with a fix). `tests/unit/oxlint.test.ts` tests them with Oxlint's `RuleTester`.
- `npm run format` runs Oxfmt with `.oxfmtrc.json`, which carries over the Prettier options and the import groups from `@ianvs/prettier-plugin-sort-imports`. Oxfmt reads `.gitignore`; `ignorePatterns` adds `.claude/`, `public/`, and `package-lock.json`. Lefthook formats staged files.
- TypeScript is on 7.x. `next build` runs the project's `tsc`, which TypeScript 7 supports.
- The Stylelint config is `stylelint.config.mjs`: Stylelint loads configs through cosmiconfig, which calls TypeScript's JavaScript API, and TypeScript 7 doesn't have one. Node still loads the plugin in `stylelint/` from TypeScript.

## Consequences

- `correctness` checks more than `eslint-config-next` did. The config turns off the rules that flag deliberate patterns, with a comment on each: `role="list"` on lists, roles on plots and live regions, the focusable photo strip, delegated click handlers, and variables local to an effect.
- `no-restricted-imports` patterns need `../**`, not `../*`, to match nested paths.
- Disable comments name Oxlint rules (`oxlint-disable-next-line nextjs/no-img-element`).
- Oxfmt output matched Prettier's on every file, so the switch changed no formatting. A minor Oxfmt release can still change output; pin it exactly and run `npm run format` after an upgrade.
- Side-effect imports move to the top of the import block, in the order written.
- Type-aware rules (`oxlint-tsgolint`) are off. Turning them on adds checks the repo hasn't run before.

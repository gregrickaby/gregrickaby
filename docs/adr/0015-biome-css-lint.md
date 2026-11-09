# 0015. Lint CSS with Biome

- Date: 2026-11-08
- Status: Accepted

## Context

[0014](0014-remove-stylelint.md) removed Stylelint, which left the CSS with no lint step. Biome 2 has a CSS linter with a recommended rule set, written in Rust like Oxlint, so it runs alongside Oxlint without another toolchain. Biome has no custom CSS rules, so the repo's three CSS conventions (`@layer components` in CSS Modules, colors only from tokens, camelCase class names) stay in review.

## Decision

- `@biomejs/biome` 2.6.6 is pinned exactly. `biome.json` turns on only the CSS linter. Its JavaScript linter and formatter stay off, so Oxlint and Oxfmt keep those files.
- Two rules are off per file, as the old Stylelint overrides allowed: `noImportantStyles` in `app/styles/base.css` (the reduced-motion overrides must beat component animations), and `noDescendingSpecificity` in `app/styles/motion.css` (each boop and switch selector targets its own `data-` value, so the more specific hover selectors are intentional).
- `npm run lint` runs `oxlint --deny-warnings`, then `biome lint --error-on-warnings`. Lefthook runs `biome lint --write` on staged CSS.

## Consequences

- Generic CSS problems fail `npm run check`: duplicate selectors, `!important` outside the exceptions, descending specificity, and similar.
- The repo's own CSS conventions are still review-only, as [0014](0014-remove-stylelint.md) left them.
- Biome's CSS rules are newer than Stylelint's. Revisit this decision if Biome drops or changes a rule the repo relies on, or if the repo needs a custom CSS rule, which would mean restoring a CSS linter with a plugin API.

# 0014. Remove Stylelint

- Date: 2026-11-08
- Status: Accepted

## Context

[0011](0011-oxlint-and-oxfmt.md) kept Stylelint for CSS after moving JavaScript and TypeScript to Oxlint. Its config extended `stylelint-config-standard` and `stylelint-config-css-modules`, and added a local rule, `gregrickaby/require-components-layer`, that every CSS Module rule sit inside `@layer components`. It also banned hex and named colors outside `tokens.css`, required camelCase class names, and banned `!important` outside `base.css`. `npm run lint` ran it after Oxlint, and lefthook ran it with `--fix` on staged CSS.

## Decision

Stylelint and its three packages are gone, along with its config, its local rule, its unit test, its lefthook step, its editor recommendation, and the `stylelint-disable` comments in `reset.css` and `motion.css`. `npm run lint` runs Oxlint only.

The CSS rules are conventions now, not checks. `docs/code-standards.md` states them, and review enforces them.

## Consequences

- A CSS Module rule outside `@layer components`, a hex color outside `tokens.css`, a camelCase violation, or an `!important` reaches `main` unless review catches it.
- Oxlint still checks the TypeScript and TSX side of the rules, such as `gregrickaby/function-declarations`.
- [0015](0015-biome-css-lint.md) adds Biome for generic CSS rules. The repo's own CSS conventions still depend on review.

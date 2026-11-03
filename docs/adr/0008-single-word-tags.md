# 0008. Keep tag and category names URL-safe

- Date: 2026-10-29
- Status: Accepted

## Context

Tags with spaces prerendered their tag page as a 404: a name that needs percent-encoding doesn't match its prerendered path. Posts also carried narrow tags such as `moon`, `chloe`, and `automatic1111`.

## Decision

- Posts were retagged into ten broad tags, each one lowercase word, and `lib/redirects.ts` sends each retired single-word tag URL to its new tag (for example, `/tag/react` to `/tag/javascript`).
- `tests/unit/tag-names.test.ts` fails when a tag or category in `.generated/paths.json` uses anything but letters, digits, and hyphens.
- The `blog-voice` skill reuses existing tags.

## Consequences

- A new tag must be one lowercase word or hyphenated, and should be one the site already uses.
- Retiring a tag needs a redirect, or its old URL 404s.

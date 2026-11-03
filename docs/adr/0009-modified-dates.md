# 0009. Bump a post's modified date only for real content changes

- Date: 2026-11-03
- Status: Accepted

## Context

A post's `modified` feeds the sitemap's `lastModified`, `article:modified_time`, `dateModified`, and the "Updated" date in its meta line (shown when it falls on another day than `date`). Retitles, retags, and link cleanups had bumped it, so posts claimed updates that changed nothing a reader would notice. Google's guidance on `dateModified` asks for the date of a significant change to the content.

## Decision

- Bump `modified` only for a real content change: a rewrite, new sections, or corrected facts.
- Leave it alone for retitles, typo fixes, retags, and link cleanups.
- Posts whose `modified` came from small edits were reset.

## Consequences

- The "Updated" date and sitemap dates mean what they say, and crawlers can trust them.
- Each edit to a post needs a call on whether it counts as a content change.

# 0004. Scrape Goodreads "Currently Reading" in a cached function

- Date: 2026-10-23
- Status: Accepted

## Context

The home page shows what Greg is reading. Goodreads removed its shelf RSS feeds, so the public profile page is the only source. Fetching it on every request would make the home page slow and tie it to Goodreads uptime.

## Decision

- `lib/goodreads.ts` parses the "Currently Reading" box on the profile page inside a `'use cache'` function. It revalidates every four hours, or 15 minutes after a failure.
- `next.config.ts` sets `reactMaxHeadersLength: 0`. The home page revalidates at runtime, and each revalidation otherwise stores the `Link` header with the page, so the `llms.txt` link repeated in every response.

## Consequences

- A change to Goodreads' markup breaks the parser. The function then logs an error and returns no books, retrying every 15 minutes, until the parser is fixed.
- React no longer sends preload `Link` headers for any page.

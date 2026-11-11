# 0005. Markdown copies, llms.txt, and Content Signals

- Date: 2026-10-24
- Status: Accepted

## Context

AI answer engines and agents read the site. They parse Markdown more reliably than rendered HTML, and https://llmstxt.org gives them an index to start from. Greg wants the site in search and AI answers, and out of training sets.

## Decision

- The content build writes each post's source to `.generated/markdown.json` (`scripts/content-build/post-markdown.ts`): a header with the title, URL, date, and description, then the body with relative media made absolute, demo markers swapped for a link to the post (titles read from each `registry.ts`), and like cues removed.
- `app/md/[slug]/route.ts` serves it, `next.config.ts` rewrites `/<slug>.md` to it, and post metadata links it as `text/markdown`. It stays out of `content.json`, so post pages don't load it.
- `/llms.txt` lists every post's `.md` URL, plus `/resume.md` and `/photos.md`, which `lib/llms.ts` builds from the same data as their pages.
- Every response sends `Link: </llms.txt>; rel="describedby"` and the same `Content-Signal` value (`lib/headers.ts`, `lib/content-signal.ts`).
- `/robots.txt` (`app/robots.txt/route.ts`, `lib/robots.ts`) states the [Content Signals Policy](https://contentsignals.org): search and AI answers yes, training no. It points agents at `/llms.txt`.

## Consequences

- Cloudflare's managed robots.txt and AI bot blocking stay off (`is_robots_txt_managed: false`, `ai_bots_protection`, `ai_search`, and `ai_user` disabled), because the app writes its own robots.txt with the Content Signal.
- A new demo needs a title in its `registry.ts`, which the Markdown copy uses for the link.

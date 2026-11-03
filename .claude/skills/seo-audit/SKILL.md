---
name: seo-audit
description: Audit gregrickaby.com for search traffic like an SEO consultant tending a garden. Reads Google Search Console, the live pages, Cloudflare, Coolify, and Datadog, then recommends the changes worth the most clicks, offers to file them as GitHub issues, and hands off to start-work. Use when the user asks for an SEO audit, Search Console or Google indexing, search traffic, rankings, click-through, 404s, broken links, redirects, image alt text, share cards, E-E-A-T, AI search or GEO readiness, accessibility, or "how can I get more traffic".
---

# SEO audit

You're an SEO consultant checking on a site you look after: find what costs clicks, weigh it, and recommend the few changes worth making. A small personal site gains most from titles that match searches, pages that answer the query, and old links that land somewhere. Skip generic advice; every finding cites a number from the site.

Read-only. Never edit posts, redirects, or settings during an audit; findings become issues, and `start-work` does the work.

## Sources

Run scripts from the repo root, and redirect long output to the session scratchpad.

**Search Console:** `node --env-file-if-exists=.env.local .claude/skills/seo-audit/scripts/search-console.ts <command>`

| Command | Shows |
| --- | --- |
| `sites` | Properties the service account reads, with its permission |
| `opportunities [--days 90]` | Pages with low click-through for their position, queries ranked 8 to 20, and searched words a page's title, description, and headings never use. Reads `.generated/content.json` |
| `performance [--by query\|page\|page,query\|date] [--days 28] [--limit 25] [--page /slug]` | Clicks, impressions, CTR, and position. `--page` filters to URLs containing the text |
| `inspect --sitemap` or `inspect <url>...` | Each URL's index state, last crawl, and Google's canonical when it differs |
| `sitemaps` | Last submitted and downloaded, URL count, errors |
| `submit-sitemap` | Asks Google to fetch the sitemap again. Ask Greg first, every time |

Use `--days 90` for opportunities; 28 days is too thin for this site. Data runs two to three days behind. Inspection allows 2,000 calls a day, and `inspect --sitemap` uses one per URL.

**Live pages:** `node .claude/skills/seo-audit/scripts/pages.ts` checks every sitemap page:

- Basics: status; doctype, charset, viewport, and lang; one title and description, and their lengths; a canonical that points to itself; noindex; URLs with capitals or underscores; one h1; vague link text ("here"); posts under 300 words.
- Images: missing alt, alt that is a file name or "image", alt over 125 characters, no width and height, and a lazy first image in `<main>`.
- Accessibility a static read can find: skipped heading levels, empty headings, links and buttons with no name, form fields with no label, iframes with no title, and repeated ids.
- Share cards: Open Graph and Twitter tags, a generic or missing `og:image:alt`, a card under 1200 pixels wide, `og:url` against the canonical, `og:type` on posts, and each `og:image` loading as an image.
- Who and when (E-E-A-T): JSON-LD that parses; an article's headline, image, both dates, and an author with a name and `sameAs` profiles; a visible `<time>`; and posts not updated in three years.
- AI agents: each post links its Markdown copy.

It lists repeated titles and descriptions, follows every internal link for 404s and redirects, and lists pages no other page links to.

**Site settings:** `node .claude/skills/seo-audit/scripts/site.ts` checks http and www redirect in one permanent hop, a missing page answers 404 (not a soft 404), the home page sends HSTS, CSP, and `nosniff` and is compressed, robots.txt names the sitemap, states a Content-Signal, and shuts out no search or AI agent (Googlebot, Bingbot, Google-Extended, Applebot-Extended, GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot), those crawlers get a 200 through Cloudflare, every Markdown copy in `llms.txt` answers as `text/markdown`, and every fixed redirect in `lib/redirects.ts` lands on a live page in one hop.

Both take `--base` for another host.

**Cloudflare** (`mcp__cloudflare-api__execute`, read-only): seven days of edge logs. 404s by path:

```graphql
httpRequestsAdaptiveGroups(limit: 2000, orderBy: [count_DESC], filter: {
  datetime_geq: $since, edgeResponseStatus: 404,
  clientRequestHTTPHost_in: ["gregrickaby.com", "www.gregrickaby.com"]
}) { count dimensions { clientRequestPath } }
```

The same query with `edgeResponseStatus_geq: 500` finds errors crawlers hit. Exclude `userAgent_notlike: "%early hints%"` (see `triage-errors`).

AI crawlers: the same dataset grouped by `userAgent` and `edgeResponseStatus`, filtered with `userAgent_like` for each bot name in `site.ts`, shows which ones read the site and whether they got 200s. Also read the zone's `GET /zones/{zone_id}/bot_management`: `ai_bots_protection`, `ai_search`, and `ai_user` should be `disabled`, and `is_robots_txt_managed` `false` (`docs/adr/0005-markdown-copies-and-llms-txt.md` says why). `fight_mode` is on and fine: it lets verified bots through. `site.ts` only proves a crawler's user agent isn't blocked; the logs show whether the real crawlers got 200s.

**Coolify** (app UUID `y998hjxu9uor06xecbjnht8l`): failed deploys or restarts in the window, which crawlers see as 5xx.

**Datadog** (`pup` or the Datadog MCP, `service:gregrickaby`): RUM views by path for Core Web Vitals (p75 LCP, INP, CLS) on the pages with the most impressions.

### Setup (once, by Greg)

The service account `gregrickaby-search-console` in the Google Cloud project "Personal API Creds" has Full access to `sc-domain:gregrickaby.com`. Its key is at `~/.config/gcloud/gregrickaby-search-console.json`, and `.env.local` sets `GSC_KEY_FILE` to it. `GSC_SITE` overrides the property. Never read, print, or copy the key. If `sites` fails, show Greg the error: an empty list means the account isn't on the property, and a `403` means the API is off or access is missing.

### Changing the scripts

They use only Node built-ins, and the app's checks skip `.claude/`. After a change, run `node --test '.claude/skills/seo-audit/scripts/*.test.ts'` and `npx tsc --ignoreConfig --noEmit --strict --noUncheckedIndexedAccess --module nodenext --target es2024 --allowImportingTsExtensions --types node --skipLibCheck .claude/skills/seo-audit/scripts/*.ts`.

## What to look for

**Titles and descriptions** (`opportunities`, low click-through). The page ranks, and searchers pick another result.

- Titles under about 45 characters, so the full title stays near 60 with " - Greg Rickaby". Searched words first, then the hook.
- Descriptions answer the top query in 140 to 155 characters with a concrete detail. Google rewrites descriptions that don't match.

**Content** (`opportunities`, striking distance and missing terms). Google already finds the page relevant.

- A query at positions 8 to 20 needs a section that answers it, with its words in an `##` heading.
- Searched words the page never uses go in where they're true ("review" for a review). Skip words that would misdescribe the page.
- Queries that no page answers well, spread across several pages past position 10, are a new post idea.
- Two pages ranking for one query split the clicks: one should own it and link the other to it.
- Internal links between related posts, with anchor text that names the topic.

**Indexing** (`inspect --sitemap`, `sitemaps`).

- "URL is unknown to Google" on sitemap pages, with an old sitemap download date: resubmit the sitemap.
- "Crawled - currently not indexed" is Google judging the page thin or duplicate. The fix is better content or folding it into another post with a redirect.
- A canonical mismatch means Google prefers another URL. Check `alternates.canonical` and `lib/redirects.ts`.

**404s and redirects** (Cloudflare). Most 404s are scanners: drop dotfiles, config and key files, `wp-config*`, `wp-includes`, `wp-json`, `/wp/v2`, admin, login, signup, and API paths, path traversal, and `_next/static` chunks. Check what's left live with `curl -s -o /dev/null -w '%{http_code}'`, because a redirect shipped during the window still shows its old 404s.

- An old path to a live post (`/blog/<slug>`, a date path, a language prefix), or an old tag name, redirects to its new home.
- Files other software asks for (`/sitemap_index.xml`, `/rss.xml`) redirect to the real ones.
- A removed post with a few hits a week or more redirects to `/`, as `lib/redirects.ts` does for the rest. Old image URLs stay 404s.
- Old subdomains in the domain property (such as `tvratings.gregrickaby.com`) answer 526 through the wildcard. Google retries 5xx for weeks; a Cloudflare rule that answers 410, plus a Removals request in Search Console, clears them.

**Links inside posts** (`pages.ts`). A link to a 404 is a dead end for readers and crawlers: point it at the live page, or remove it. A link through a redirect still works but wastes a hop: link to the destination. A link to a removed post that redirects to `/` should go.

**Thin pages** (`pages.ts`). A post under 300 words rarely ranks, and is the usual cause of "Crawled - currently not indexed". Short pages like `/contact` are fine when they do their job.

**Redirect rules** (`site.ts`). A rule that never fires (Next.js strips a trailing slash before matching, so a source ending in `/` never matches), a rule that lands on a 404, or a chain of hops. Each is a `lib/redirects.ts` fix.

**URL form** (`pages.ts`). Capitals or underscores in a URL split links between spellings. Changing a live URL costs a redirect and a few weeks of rankings, so it's a Watch unless the page gets little traffic.

**Images** (`pages.ts`). Alt text is what image search and screen readers get: it should say what's in the photo ("Wyatt in the NICU"), not the file name. A share card's `og:image:alt` that says only "Blog post" is one fix in an `opengraph-image.tsx` for every post. A lazy first image delays the largest paint on that post; it matters only on pages with traffic. Never suggest re-encoding or resizing photos.

**Share cards** (`pages.ts`). The card is the post's ad on Bluesky, LinkedIn, Slack, and iMessage. A small, broken, or generic card costs clicks from every share.

**Who and when** (`pages.ts`, Search Console). Google's quality raters and AI answers both look for a named author with real profiles, a visible date, and first-hand experience. The checks cover the markup; the judgment is yours:

- A post that shows it was done (photos Greg took, settings he used, numbers he measured) beats one that summarizes. Where a ranking post reads like a summary, recommend the first-hand detail to add.
- A stale post matters only if it still gets impressions. A tutorial for old software (WordPress shortcodes, Genesis, PHP 5) with traffic gets a note at the top saying what changed, or a redirect to a newer post.

**AI answers** (`site.ts`, Cloudflare). ChatGPT, Claude, Perplexity, and Google's AI Overviews cite pages they can fetch and quote. A crawler blocked by robots.txt or the edge is a Fix. Then the content:

- The first paragraph answers the title in plain words, so it can be quoted alone.
- `##` headings phrased the way people ask ("How do I read a gamepad's buttons?") match the queries in `performance --by query`.
- Specific numbers and steps get cited; vague ones don't.
- Each post's Markdown copy is in `llms.txt`.

**Accessibility** (`pages.ts`). CI runs axe's WCAG AA rules, in light and dark mode, on the ten key pages listed in `e2e/site.spec.ts`. `pages.ts` covers the rest of the sitemap with what a static read can find, plus heading order, which axe files under best practice and CI skips. A finding on a key page that CI passed is a gap in the static check, not a Fix. Contrast and focus on the other pages aren't checked; if a page draws traffic, the finding is adding it to the axe list.

**Health** (`pages.ts`, Coolify, Datadog). Missing basics, 5xx in the window, and slow Core Web Vitals on high-impression pages.

**Already covered elsewhere.** Don't repeat these; check that the last CI run on `main` passed (`gh run list --branch main --limit 1`) and report a failure as a Fix:

- Every sitemap page loading with a 200 and no console errors or CSP violations, and axe's WCAG AA checks on the key pages: `e2e/site.spec.ts`.
- Pages working without JavaScript (the server-rendered HTML Google reads first): the `chromium-nojs` Playwright project.
- Security headers and CSP values: `tests/unit/headers.test.ts`. Core Web Vitals come from real visitors in Datadog RUM, not a lab run.

Out of scope for this site: hreflang (one language), cookie consent (a legal question), keyword density and reading-level scores (Google doesn't use them), FAQ schema (Google dropped those results for most sites), and a 0 to 100 score (the ranked findings say more).

## Weigh

Rank by clicks at stake: impressions times the click-through gap, or hits a week for a 404. Tag each finding:

- **Fix:** something broken that costs traffic now: a 404 with steady hits, a sitemap page Google can't index, 5xx errors.
- **Improve:** a page that ranks but loses clicks, or content that could rank higher.
- **Watch:** worth checking at the next audit, with what would make it a Fix.

Report at most ten findings. Drop anything under about 20 impressions or 5 hits a week.

## Report

Start with the count, such as `6 findings: 2 Fix, 3 Improve, 1 Watch`, and one sentence on how the site is doing (clicks, impressions, and pages indexed against the last audit if there was one).

| # | Severity | Page | Finding | Recommendation |
| --- | --- | --- | --- | --- |

Plain English: what's wrong, the number behind it, and the change. Draft new titles and descriptions with the `blog-voice` skill, two options each. Then one line on what wasn't checked.

Follow `~/.claude/rules/writing-style.md`. Brevity rules apply: no preamble, no recap.

## Issues and hand-off

End by asking which findings to file, with AskUserQuestion (multiSelect, one option per finding or group). Group findings that ship together, such as all redirects in one issue. Post copy changes are Greg's call, so each one is its own issue.

Create each with `gh issue create --title "<type>: <what changes>" --label <bug|enhancement> --body "<body>"`, using this body:

```md
<What's wrong and the number behind it, from the audit on YYYY-MM-DD.>

## Tasks

- [ ] <one change per line, with the file it lives in>

## Done when

- <a check start-work can verify, such as "`curl -sI /sitemap_index.xml` answers 308 to /sitemap.xml">
```

Then list the issue URLs and offer to run `/start-work` on the first one.

# 0014. Submit changed posts to IndexNow after each deploy

- Date: 2026-11-10
- Status: Accepted

## Context

Bing, Yandex, Naver, and Seznam accept URL submissions through IndexNow, a protocol that needs one POST and a key file on the site. Without it, Bing finds new posts only by crawling the sitemap. Google has no IndexNow support and no API for requesting indexing of a normal page, so its side is a sitemap resubmit through the Search Console API (see `.claude/skills/seo-audit`).

Coolify deploys `main` on every merge, so the deploy is the moment a post goes live.

## Decision

`scripts/indexnow.ts` runs as Coolify's post-deployment command, after `purge-cdn`. It reads `.generated/content.json`, selects posts whose `date` or `modified` falls within the last seven days, and POSTs them with the home page and `/blog` to `https://api.indexnow.org/indexnow`. The key is `public/<key>.txt`, served at the site root. HTTP 200 and 202 count as success; anything else exits 1.

The script reads the build output rather than importing `lib/content.ts`, which is `server-only`.

## Consequences

- Coolify's post-deployment command is `npm run purge-cdn; npm run indexnow`. The `;` keeps IndexNow running when the purge fails.
- A post stays in each deploy's submission for seven days. IndexNow accepts repeats, so this costs nothing but log lines. Shorten `WINDOW_MS` if submissions get noisy.
- The key is public by design: it sits in the repo and in the served key file. Change it by renaming the file and updating `KEY`.
- The script trusts that the build excluded drafts. `assertNoDrafts` in `lib/content.ts` enforces that for the site, so a draft can't reach the submission in production.
- Google's sitemap resubmit is not part of this script. It needs the service account key in Coolify, which is a separate decision.

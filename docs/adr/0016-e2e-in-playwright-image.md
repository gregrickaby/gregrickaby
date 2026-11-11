# 0016. Run E2E in the Playwright Docker image

- Date: 2026-11-11
- Status: Accepted

## Context

The `e2e` job ran on `ubuntu-latest` and installed Chromium's system libraries with `npx playwright install-deps chromium` on every run, because the browser cache couldn't hold them. That step goes through Ubuntu's apt mirrors. Twice, a mirror outage failed the job before any test ran, most recently on 2026-11-11, when `security.ubuntu.com` timed out for about seven minutes and apt exited with code 100. Both times a blog post sat unmerged until the mirror came back.

Playwright publishes a Docker image per release (`mcr.microsoft.com/playwright:v<version>-noble`) with Node, the browsers, and their libraries already installed. The image's browsers work only with the same Playwright version, so the tag has to follow `@playwright/test`. Dependabot updates `uses:` lines in workflows and Docker tags in Dockerfiles, but not a job's `container.image`, so a hardcoded tag would fall behind on every Playwright bump.

## Decision

The `e2e` job runs in the Playwright image, with `--user 1001` as Playwright's CI docs show. A small `playwright-version` job reads the installed `@playwright/test` version from `package-lock.json` and passes it to the `e2e` job, which builds the image tag from it. The job no longer installs browsers or caches `~/.cache/ms-playwright`. It keeps `setup-node` with `.nvmrc`, `npm ci`, the `.next/cache` cache, and the failure report upload.

After `npm ci`, a step checks that the image holds the Chromium the installed Playwright expects, and fails with a clear message if it doesn't, before the build starts.

## Consequences

- Nothing in the `e2e` job uses apt. It still depends on GitHub, the npm registry, and Microsoft's container registry, which serves the image.
- A Dependabot PR that bumps `@playwright/test` changes the lockfile, so the image tag follows with no edit. Keep `@playwright/test` pinned to an exact version.
- Microsoft publishes the image shortly after each npm release. A bump merged in that gap fails the image pull; re-run the job once the tag exists.
- Keep `--user 1001`. As root, the job's `HOME` belongs to another user, which Firefox refuses; Playwright's older docs set `HOME: /root` instead. Chromium works either way.
- The image pull replaces the browser install steps. Compare job times on the first few runs.

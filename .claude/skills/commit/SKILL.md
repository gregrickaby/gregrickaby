---
name: commit
description: >
  Commit the working tree as small conventional commits, one per logical chunk of work. Use when the user says "commit", "micro commit", "commit this", or "/commit". Does not push unless asked.
---

# Commit

**Triggers:** "commit", "micro commit", "commit this", `/commit`

Split the uncommitted work into small commits, one per logical change, with Conventional Commit subjects. Push only when the user asks in the same request.

## 1. Survey

1. Run `git status --short` and `git diff` (plus `git diff --cached` if anything is staged). Read new files in full.
2. Note changes you did not make in this session (for example `AGENTS.md` edits or config tweaks). Leave them unstaged and list them in the report, unless the user said to include them.
3. If `npm run check` has not passed since the last edit, run it now. Stop and report if it fails.

## 2. Group

Each commit is one change a reviewer could revert on its own: a feature, a fix, a content edit, a test-only change. Rules:

- Tests go in the commit with the code they cover.
- Generated files (CSS module `.d.ts`, `.generated/`) are gitignored. Never force-add them.
- Content edits (`public/content/**`) go in their own commits, one per post unless the change is the same across posts.
- Order commits so each one builds: helpers before their callers, tokens before the CSS that uses them.

When one file holds two changes, stage a version of it with only the first change. `git add -p` is interactive and unavailable, so write the partial version to the scratchpad and stage it directly:

```bash
git update-index --add --cacheinfo 100644,$(git hash-object -w /path/to/partial),path/in/repo
```

Commit, then `git add` the real file for the next commit. Check any commit built from a partial file in a temporary worktree (`git worktree add <dir> <sha>`, symlink `node_modules`, run `npm run check`, then `git worktree remove --force <dir>`).

## 3. Write messages

- Format: `type: subject`. Types used here: `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `chore`, `content`.
- Subject: lowercase, imperative, no period, under 72 characters. Say what changed for the site or reader, not which files moved.
- Add a body only when the reason is not obvious from the subject. Wrap at 72 columns.
- Follow `~/.claude/rules/writing-style.md`: no emoji, no em dashes, plain verbs.
- No trailers, no co-authors, no "Generated with" lines.

## 4. Commit

- Let the lefthook pre-commit hooks run. Never set `LEFTHOOK=0`, pass `--no-verify`, or skip hooks some other way. If a hook fails, fix the cause and commit again.
- Commit on the current branch. This repo commits to `main` directly.
- Do not push, tag, or open a PR unless the user asked.

## 5. Report

List the commits as `sha subject`, say whether anything was pushed, and name any files left uncommitted and why.

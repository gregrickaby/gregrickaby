---
name: code-review
description: >
  Perform a thorough code review of the Next.js 16 + Mantine 9 personal blog. Covers security, correctness, testing, performance, architecture, and project-specific conventions.
---

# Code Review Instructions

Goal: verify adherence to [code-standards.instructions.md](../../instructions/code-standards.instructions.md).

## Review Priorities

### CRITICAL

- **Security**: Vulnerabilities, exposed secrets, `NEXT_PUBLIC_` on server secrets
- **Correctness**: Logic errors, race conditions, data corruption
- **Breaking Changes**: API contract changes without versioning

### IMPORTANT

- **Code Quality**: SOLID violations, duplication, naming, missing JSDoc
- **Test Coverage**: Missing tests for new functionality or critical paths
- **Performance**: N+1 queries, unnecessary `'use client'`, missing `next/dynamic` for heavy components
- **Architecture**: Deviations from established patterns

### SUGGESTION (non-blocking)

- **Readability**: Complex logic, poor naming
- **Documentation**: Missing or incomplete comments

## Review Checklist

### Security

- [ ] No secrets in source; server-only vars avoid `NEXT_PUBLIC_`
- [ ] `dangerouslySetInnerHTML` limited to `Article.tsx` with sanitized output
- [ ] `npm audit` clean

### Code Quality

- [ ] Names follow conventions; functions are small and focused
- [ ] No commented-out code or untracked TODOs
- [ ] Functions/components/interfaces must have full JSDoc comments
- [ ] SonarQube for IDE tool shows no issues

### Testing

- [ ] New code has tests; edge cases covered
- [ ] Uses custom `render` from `test-utils/`, not bare RTL
- [ ] `lib/content.ts` is mocked — no filesystem reads in tests

### Performance

- [ ] No unnecessary `'use client'` directives
- [ ] Images use `next/image`; links use `<AppLink>` — never `<img>` or `<a>`
- [ ] No "God" components or functions; large/complex ones are split.

## Completion

Fix all CRITICAL and IMPORTANT issues in the same session. Update or add tests. Run `npm run validate`.

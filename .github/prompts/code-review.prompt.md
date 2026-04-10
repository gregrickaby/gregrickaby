---
name: code-review
description: >
  Perform a thorough code review of the Next.js 16 + Mantine 9 personal blog. Covers security, correctness, testing, performance, architecture, and project-specific conventions.
---

# Code Review Instructions

Goal: verify adherence to [code-standards.instructions.md](../instructions/code-standards.instructions.md).

## Review Priorities

Prioritize issues in this order:

### CRITICAL

- **Security**: Vulnerabilities, exposed secrets, authentication/authorization issues
- **Correctness**: Logic errors, data corruption risks, race conditions
- **Breaking Changes**: API contract changes without versioning
- **Data Loss**: Risk of data loss or corruption

### IMPORTANT

- **Code Quality**: Severe violations of SOLID principles, excessive duplication
- **Test Coverage**: Missing tests for critical paths or new functionality
- **Performance**: Obvious performance bottlenecks (N+1 queries, memory leaks)
- **Architecture**: Significant deviations from established patterns
- **CSS**: Not using CSS Modules for custom styles

### SUGGESTION (non-blocking)

- **Readability**: Poor naming, complex logic that could be simplified
- **Optimization**: Performance improvements without functional impact
- **Best Practices**: Minor deviations from conventions
- **Documentation**: Missing or incomplete comments

## General Review Principles

1. **Be specific**: Reference exact lines, files, and provide concrete examples
2. **Provide context**: Explain why something is an issue and its potential impact
3. **Suggest solutions**: Show corrected code when applicable, not just what's wrong
4. **Be constructive**: Focus on improving the code, not criticizing the author
5. **Recognize good practices**: Acknowledge well-written code and smart solutions
6. **Be pragmatic**: Not every suggestion needs immediate implementation
7. **Group related comments**: Avoid multiple separate comments on the same topic

## Review Checklist

### Code Quality

- [ ] Code follows consistent style and conventions
- [ ] Names are descriptive and follow naming conventions
- [ ] Functions are small and focused
- [ ] Complex logic is broken into simpler parts
- [ ] No "god" components or functions
- [ ] No code duplication
- [ ] Error handling is appropriate
- [ ] No commented-out code or untracked TODOs
- [ ] All functions, components, and classes have JSDOC comments that explain their purpose, parameters, and return values
- [ ] SonarQube for IDE tool shows no issues

### Security

- [ ] No secrets or API keys in source code
- [ ] Server-only secrets do not use `NEXT_PUBLIC_` prefix
- [ ] `dangerouslySetInnerHTML` is limited to `Article.tsx` with sanitized output
- [ ] `npm audit` shows no critical vulnerabilities

### Testing

- [ ] New code has appropriate test coverage
- [ ] Tests are well-named and focused
- [ ] Tests cover edge cases and error scenarios
- [ ] Tests are independent and deterministic
- [ ] No tests that always pass or are commented out

### Performance

- [ ] No unnecessary `'use client'` directives
- [ ] All images use `next/image`, not `<img>`
- [ ] All links use `next/link`, not `<a>` or `<Anchor>`
- [ ] No heavy imports where a single named export would suffice
- [ ] Large or non-critical client components use `next/dynamic`

### Architecture

- [ ] Follows established patterns and conventions
- [ ] Proper separation of concerns
- [ ] No architectural violations
- [ ] Dependencies flow in the correct direction

### Documentation

- [ ] Public APIs are documented
- [ ] Complex logic has explanatory comments
- [ ] README and agent instruction files are updated if needed
- [ ] Breaking changes are documented

## Completion Gate

After identifying all issues, fix them in the same session. Do not stop at reporting.

1. **Implement all fixes**: resolve every CRITICAL and IMPORTANT issue; address SUGGESTIONS where practical
2. **Update tests**: update or add tests to cover any changes made
3. **Run validation**: run `npm run validate` to ensure all checks pass
4. **Final review**: do a final pass to ensure all issues are resolved and the codebase is in a better state than before the review

---
name: content-review
description: >
  Review a migrated WordPress blog post for frontmatter, completeness, formatting artifacts, image problems, and code block issues.
---

# Content Review Instructions

Review blog content migrated from WordPress to Markdown. Fix every issue directly in the file and report what changed. Reference `PostMeta` in `lib/types.ts` for canonical frontmatter fields.

## 1. Frontmatter

Check every field against `PostMeta`:

- `title` — present and not empty
- `slug` — present, matches directory name, `kebab-case`
- `date` and `modified` — present, valid ISO 8601
- `type` — must be `"post"` or `"page"`
- `description` — required for SEO; write one if missing or generic
- `featuredImage` — add if a prominent lead image exists in the body
- `categories` and `tags` — add reasonable values if both missing

## 2. Images

- Add alt text to any image missing it (`![]()` → `![description]()`)
- Verify `featuredImage` filename exists in the same directory; report if missing
- Convert `<img>` HTML tags to Markdown syntax
- Check for thumbnail filenames (`image-300x200.jpg`); report originals not found — do not guess

## 3. Code Blocks

- Language on a separate line → move inline: ` ```php `
- Missing language identifier → infer and add
- Remove trailing blank lines before closing fence
- Reformat code collapsed to a single line with correct indentation:
  - PHP/JS/TS: 2-space indent, one statement per line
  - Bash: one command per line
  - CSS: one property per line, 2-space indent
  - JSON: 2-space pretty-print
- Wrap bare function/variable names in prose with backticks

## 4. Headings and Lists

- Split headings merged with body text onto separate lines
- Headings must be in order — no `###` after `##` without an intervening `###`
- No H1 (`#`) in post body — use H2 (`##`) and below
- Expand navigation links collapsed onto one line to one item per line
- Split lists merged into paragraphs; ensure a blank line before each list
- Collapse multiple consecutive blank lines to one

## 5. WordPress HTML Cleanup

- `<br>` → blank line between paragraphs
- `<p>`, `<div>`, `<span>` → remove tags, keep inner text
- HTML entities: `&nbsp;` → space, `&#8211;` → `-`, `&#8220;`/`&#8221;` → `"`
- Remove shortcodes: `[caption]`, `[gallery]`, `[embed]`
- Remove Gutenberg comments: `<!-- wp:paragraph -->`

## 6. Blockquotes

- Ensure `>` is at the start of every line in a blockquote
- Multi-paragraph blockquotes need `>` on blank lines between paragraphs

## 7. Grammar and Spelling

- Fix misspellings and clear typos
- Do not rephrase for style — only correct clear errors
- Follow `.agents/instructions/writing-style.instructions.md`

## Output

After applying all fixes, report changes by section with line numbers and original text. List issues that could not be fixed automatically under "Action required". End with a one-paragraph summary of the post's state and any remaining manual steps.

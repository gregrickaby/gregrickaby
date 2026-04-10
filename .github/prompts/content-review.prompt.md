---
name: content-review
description: >
  Review a migrated WordPress blog content for frontmatter, completeness, formatting artifacts, image problems, and code block issues introduced during migration.
---

# Content Review Instructions

You are reviewing and repairing a blog content that was migrated from WordPress to Markdown. The migration introduced several classes of problems. Work through each section below, fix every issue you find directly in the file using your editing tools, and then report what you changed.

Reference the `PostMeta` interface in `lib/types.ts` for the canonical list of frontmatter fields.

- **Content Instructions**: [writing.instructions.md](../instructions/writing-style.instructions.md) — writing style, tone, and formatting

---

## 1. Frontmatter audit

Check every frontmatter field against `PostMeta`:

- `title` — present and not empty
- `slug` — present, matches the directory name, uses `kebab-case`
- `date` and `modified` — present, valid ISO 8601 strings
- `type` — must be `"post"` or `"page"`
- `description` — **required for SEO**; if missing or a generic placeholder, write a one- or two-sentence description based on the post body and add it to the frontmatter.
- `featuredImage` — if missing and the post body contains a prominent lead image, add it to the frontmatter.
- `categories` and `tags` — if both are missing, add reasonable values based on the content.

---

## 2. Image issues

- For any image with no alt text (`![](./filename.jpg)`), add alt text derived from the surrounding context.
- Verify the `featuredImage` filename references a file that actually exists in the same directory. If it does not exist, report it — do not guess a replacement filename.
- Verify each inline image path references a file that exists. Report missing files without guessing.
- Convert any `<img>` HTML tags left over from WordPress to Markdown image syntax.
- Verify the image is not a thumbnail or resized version with a filename like `image-300x200.jpg`. If it is, try to find the original full-size image at gregrickaby.com/<slug>. If the original image cannot be found, report it without guessing a replacement filename.

---

## 3. Code block formatting

WordPress migration frequently breaks fenced code blocks in several ways:

- **Language identifier on a separate line instead of inline:**

  ````
  ```

  php
  ```
  ````

  Fix by moving the identifier to the opening fence: ` ```php `

- **Missing language identifier** — infer the correct language from the code and add it.

- **Trailing blank lines inside a code block** — remove any blank lines immediately before the closing ` ``` ` fence.

- **Leading space on the paragraph immediately after a closing fence** — remove it. WordPress often leaves a stray leading space on the line that follows ` ``` `.

- **Code collapsed to a single line** — WordPress migration commonly collapses multi-line code (function bodies, arrays, object literals) onto one line. Reformat it with correct indentation for the language. Apply these rules:
  - PHP: 4-space indentation, each statement on its own line, opening `{` on the same line as the declaration, closing `}` on its own line.
  - PHP arrays and destructuring: each key-value pair on its own line, values aligned with spaces where it aids readability.
  - PHP `print_r`/`var_dump` output: preserve the hierarchical indentation exactly as PHP would print it — nested arrays indented 4 spaces per level.
  - Bash/shell: one command per line.
  - CSS/SCSS: one property per line, 2-space indentation.
  - HTML: standard 2-space indentation, one attribute per line for long tags.
  - JSON: 2-space indentation, standard pretty-print format.

- **Bare function names or variable names inline in prose** that should be wrapped in backticks — add the backticks.

---

## 4. Headings, paragraph, and list formatting

- Heading text running into the next paragraph with no blank line, e.g. `## Section Title Some body text starts here` — split into a heading line and a separate paragraph.
- Bold or italic markers (`**`, `*`) merged onto the same line as a heading — split them onto separate lines.
- Navigation link lists collapsed onto a single line, e.g. `- [A](#a) - [B](#b) - [C](#c)` — expand each item to its own line.
- Multiple consecutive blank lines — collapse to one.
- Headings are in the correct order (e.g. no `###` followed by `##` without an intervening `###`).
- No H1 headings (`#`) are used in the body of the post — only H2 (`##`) and below.
- Lists that were merged into paragraphs — split them back into proper Markdown lists with `-` or `1.` and a blank line before the list.
- There should be a blank line between each paragraph, heading, list, and code block. Add any missing blank lines to ensure proper Markdown formatting.

---

## 5. Leftover WordPress HTML

Remove or convert any raw HTML that WordPress left behind, including but not limited to:

- `<br>` — replace with a blank line between paragraphs
- `<p>`, `<div>`, `<span>` — remove the tags and preserve the inner text
- HTML entities — replace with their plain-text equivalents: `&nbsp;` → space, `&#8211;` → `-`, `&#8220;`/`&#8221;` → `"`
- WordPress shortcodes like `[caption]`, `[gallery]`, `[embed]` — remove or convert to Markdown equivalents where possible
- Gutenberg block comments like `<!-- wp:paragraph -->` — remove entirely
- `<audio>` and `<video>` tags are fine to leave in if they are properly formatted and working, but if they are broken or missing attributes, try to fix them or report the issue without guessing.

---

## 6. Grammar and spelling

- Fix misspellings and clear typos directly in the file.
- Do not rewrite or rephrase content for style — only correct clear errors.
- Follow the writing style rules in `.github/instructions/writing-style.instructions.md`.

---

## 7. Blockquote and other formatting artifacts

- Fix any blockquotes that were broken by the migration, ensuring the `>` character is at the start of each line in the blockquote and that nested blockquotes are properly formatted.
- Fix any multi-paragraph blockquotes with blank lines between paragraphs, ensuring the `>` character is present on each line.
- Fix any lists that were merged into paragraphs, ensuring each list item starts with `-` or `1.` and is on its own line.
- Fix any dead links
- Check for any other formatting artifacts that don't fit the above categories and fix them as needed.

---

## Output format

After applying all fixes, produce a structured report with one section per category above. For each change made:

- Reference the exact line number or frontmatter field.
- Quote the original text.
- Show the replacement that was applied.

For issues that could not be fixed automatically (e.g., a missing image file), list them separately
under an "Action required" heading so the author knows what still needs manual attention.

If a category had no issues, write "No issues found." — do not skip it.

End the report with a one-paragraph plain-English summary of the overall state of the post and any remaining manual steps needed before publication.

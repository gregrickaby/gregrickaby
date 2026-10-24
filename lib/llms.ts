import { exifSummary, formatShortDate } from './format'
import { currentRole, otherExperience, resumeEntries, resumeSummary } from './resume'
import { SITE } from './site'
import type { Photo, PostMeta, ResumeInline } from './types'

/** Subset of site configuration required to build `llms.txt`. */
interface LlmsConfig {
  /** Canonical site URL, without a trailing slash. */
  url: string
  name: string
  description: string
}

/**
 * Build the `/llms.txt` index (https://llmstxt.org): what the site is, then a
 * link to each post's Markdown copy, then the resume and photos as Markdown.
 *
 * @param posts - Post metadata, newest first.
 */
export function buildLlmsTxt(posts: PostMeta[], config: LlmsConfig): string {
  const postLinks = posts.map((post) => {
    const link = `- [${post.title}](${config.url}/${post.slug}.md)`
    return post.description ? `${link}: ${post.description}` : link
  })

  return `# ${config.name}

> ${config.description}

${config.name} has been building for the web since ${resumeSummary.since}. The blog covers web development, photography, and writing. Each post below links to a Markdown copy of its text.

## Posts

${postLinks.join('\n')}

## Optional

- [Resume](${config.url}/resume.md): Work history, books, and community work
- [Photos](${config.url}/photos.md): Every photo in the gallery, with camera settings
`
}

function inlineMarkdown(parts: ResumeInline[]): string {
  return parts
    .map((part) =>
      typeof part === 'string' ? part : `[${part.em ? `_${part.text}_` : part.text}](${part.href})`,
    )
    .join('')
}

/**
 * The resume page as Markdown, served at `/resume.md`. Reads the same data as
 * `components/resume.tsx`.
 *
 * @param builtAt - The build time, for the years on the web.
 */
export function buildResumeMarkdown(builtAt: Date): string {
  const years = builtAt.getUTCFullYear() - resumeSummary.since

  const experience = resumeEntries.map((entry) => {
    const company = entry.companyUrl ? `[${entry.company}](${entry.companyUrl})` : entry.company
    return [
      `### ${entry.role}, ${company}`,
      '',
      `${entry.location} · ${entry.dateRange}`,
      '',
      entry.summary,
      '',
      ...entry.highlights.map((highlight) => `- ${highlight}`),
      '',
      `Skills: ${entry.techStack.join(', ')}`,
    ].join('\n')
  })

  const other = otherExperience.map((section) =>
    [
      `### ${section.heading}`,
      ...section.paragraphs.flatMap((paragraph) => ['', inlineMarkdown(paragraph)]),
      ...(section.list ? ['', ...section.list.map((item) => `- ${inlineMarkdown(item)}`)] : []),
    ].join('\n'),
  )

  return `# Resume: ${SITE.name}

- URL: <${SITE.url}/resume>
- LinkedIn: <${SITE.author.linkedin}>
- GitHub: <${SITE.author.github}>

${resumeSummary.intro}

- Now: ${currentRole.role}, ${currentRole.company}
- On the web: ${years} years, since ${resumeSummary.since}
- Based in: ${resumeSummary.basedIn}
- Skills: ${resumeSummary.skills.join(', ')}

## Experience

${experience.join('\n\n')}

## Other experience

${other.join('\n\n')}
`
}

/** A Markdown link destination for a site path: absolute, with unsafe characters encoded. */
function linkUrl(path: string): string {
  return `${SITE.url}${encodeURI(path)}`.replaceAll('(', '%28').replaceAll(')', '%29')
}

/**
 * The photo gallery as Markdown, served at `/photos.md`. Each image's URL is
 * the full-size original.
 *
 * @param photos - Photos, newest first.
 */
export function buildPhotosMarkdown(photos: Photo[]): string {
  const entries = photos.map((photo) => {
    const details = [
      photo.dateTaken ? `Taken ${formatShortDate(photo.dateTaken)}` : '',
      exifSummary(photo),
    ].filter(Boolean)
    return [
      `## ${photo.title}`,
      '',
      `![${photo.title}](${linkUrl(photo.src)})`,
      ...(photo.caption ? ['', photo.caption] : []),
      ...(details.length > 0 ? ['', details.join(' · ')] : []),
    ].join('\n')
  })

  return `# Photos: ${SITE.name}

- URL: <${SITE.url}/photos>

${entries.length > 0 ? entries.join('\n\n') : 'No photos yet.'}
`
}

import Link from 'next/link'
import type { ReactNode } from 'react'

import { PrintButton } from '@/components/islands/print-button'
import { SoundNav } from '@/components/islands/sound-nav'
import { MetaLine } from '@/components/meta-line'
import { PageTitle } from '@/components/page-title'
import { getBuildTime } from '@/lib/content'
import { currentRole, otherExperience, resumeEntries, resumeSummary } from '@/lib/resume'
import { SITE } from '@/lib/site'
import type { ResumeInline } from '@/lib/types'

import styles from './resume.module.css'

function External({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <a className={className} href={href} rel="noopener" target="_blank">
      {children}
    </a>
  )
}

function Inline({ parts }: { parts: ResumeInline[] }) {
  return parts.map((part) =>
    typeof part === 'string' ? (
      part
    ) : (
      <External href={part.href} key={part.href}>
        {part.em ? <em>{part.text}</em> : part.text}
      </External>
    ),
  )
}

/** A summary band for quick reading, the work history as a timeline, then books and community work. */
export function Resume() {
  const years = new Date(getBuildTime()).getUTCFullYear() - resumeSummary.since

  return (
    <div className={styles.resume}>
      <PageTitle>Resume</PageTitle>
      <MetaLine
        className={styles.printHeader}
        items={[
          SITE.name,
          SITE.url.replace('https://', ''),
          SITE.author.linkedin.replace('https://www.', '').replace(/\/$/, ''),
        ]}
      />

      <section aria-label="Summary" className={styles.summary}>
        <p className={styles.intro}>{resumeSummary.intro}</p>
        <dl className={styles.facts}>
          <div>
            <dt>Now</dt>
            <dd>
              {currentRole.role}, {currentRole.company}
            </dd>
          </div>
          <div>
            <dt>On the web</dt>
            <dd>
              {years} years, since {resumeSummary.since}
            </dd>
          </div>
          <div>
            <dt>Based in</dt>
            <dd>{resumeSummary.basedIn}</dd>
          </div>
        </dl>
        <MetaLine className={styles.skills} items={[...resumeSummary.skills]} />
        <SoundNav as="div" className={styles.actions} clickSound="select">
          <Link className={`${styles.action} ${styles.primary}`} href="/contact">
            Get in touch
          </Link>
          <External className={styles.action} href={SITE.author.linkedin}>
            LinkedIn
          </External>
          <PrintButton className={styles.action} />
        </SoundNav>
      </section>

      <h2 className="visually-hidden">Experience</h2>
      <ol className={styles.timeline} role="list">
        {resumeEntries.map((entry) => (
          <li className={styles.entry} data-reveal key={`${entry.company}-${entry.dateRange}`}>
            <h3 className={styles.role}>
              {entry.role} ·{' '}
              {entry.companyUrl ? (
                <External href={entry.companyUrl}>{entry.company}</External>
              ) : (
                entry.company
              )}
            </h3>
            <p className={styles.caption}>
              {entry.location} · {entry.dateRange}
            </p>
            <p>{entry.summary}</p>
            <ul className={styles.highlights}>
              {entry.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <p className={styles.caption}>{entry.techStack.join(' · ')}</p>
          </li>
        ))}
      </ol>

      <p className={styles.links}>
        View all my experiences on <External href={SITE.author.linkedin}>LinkedIn</External> and my
        code on <External href={SITE.author.github}>GitHub</External>.
      </p>

      <h2 className={styles.section}>Other experience</h2>

      {otherExperience.map((section) => (
        <section className={styles.block} key={section.heading}>
          <h3 className={styles.role}>{section.heading}</h3>
          {section.paragraphs.map((paragraph, i) => (
            <p key={i}>
              <Inline parts={paragraph} />
            </p>
          ))}
          {section.list ? (
            <ul className={styles.highlights}>
              {section.list.map((item, i) => (
                <li key={i}>
                  <Inline parts={item} />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  )
}

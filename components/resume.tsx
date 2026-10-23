import Link from 'next/link'
import { PrintButton } from '@/components/islands/print-button'
import { MetaLine } from '@/components/meta-line'
import { PageTitle } from '@/components/page-title'
import { getBuildTime } from '@/lib/content'
import { currentRole, resumeEntries, resumeSummary } from '@/lib/resume'
import { SITE } from '@/lib/site'
import styles from './resume.module.css'

function External({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <a className={className} href={href} rel="noopener" target="_blank">
      {children}
    </a>
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
            <dd>Alabama, working remotely</dd>
          </div>
        </dl>
        <MetaLine className={styles.skills} items={[...resumeSummary.skills]} />
        <div className={styles.actions}>
          <Link className={`${styles.action} ${styles.primary}`} href="/contact">
            Get in touch
          </Link>
          <External className={styles.action} href={SITE.author.linkedin}>
            LinkedIn
          </External>
          <PrintButton className={styles.action} />
        </div>
      </section>

      <h2 className="visually-hidden">Experience</h2>
      <ol className={styles.timeline} role="list">
        {resumeEntries.map((entry) => (
          <li className={styles.entry} key={`${entry.company}-${entry.dateRange}`}>
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

      <h2 className={styles.section}>Other Experience</h2>

      <section className={styles.block}>
        <h3 className={styles.role}>Author</h3>
        <p>
          In 2017, I wrote a children&apos;s book,{' '}
          <External href="https://amzn.to/41eZFfF">
            <em>Creating a Website for Dummies Jr</em>
          </External>
          , published by Wiley Global under the{' '}
          <External href="https://www.dummies.com/">dummies&trade;</External> brand.
        </p>
        <p>
          The book guides young readers through planning and building a website. It&apos;s been
          translated into 2 languages and holds a 4.5-star rating on Amazon.
        </p>
        <p>I&apos;ve also been Technical Editor on three other books:</p>
        <ul className={styles.highlights}>
          <li>
            <em>
              <External href="https://amzn.to/44EeXgy">WordPress for Dummies</External>
            </em>{' '}
            (Sabin-Wilson, 2021)
          </li>
          <li>
            <em>
              <External href="https://amzn.to/3VN8f3Z">
                Professional WordPress Plugin Development
              </External>
            </em>{' '}
            (Williams et al., 2020)
          </li>
          <li>
            <em>
              <External href="https://amzn.to/3B37BG8">WordPress All-In-One For Dummies</External>
            </em>{' '}
            (Sabin-Wilson, 2019)
          </li>
        </ul>
      </section>

      <section className={styles.block}>
        <h3 className={styles.role}>Contributor</h3>
        <p>
          I was part of the WordPress community from 2008 to 2023, contributing to core, docs,
          plugins, and themes, and speaking at WordCamps and meetups. I now contribute to Next.js,
          Storybook, and other open-source projects.
        </p>
        <p>
          Outside of tech, I volunteer with local community organizations, including Boy Scouts,
          Wiregrass Church, and the local high school band boosters.
        </p>
      </section>
    </div>
  )
}

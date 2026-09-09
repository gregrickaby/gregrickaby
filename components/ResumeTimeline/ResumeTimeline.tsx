import {AppLink} from '@/components/AppLink/AppLink'
import {siteConfig} from '@/lib/config'
import {resumeEntries} from '@/lib/resume'
import {
  List,
  ListItem,
  Stack,
  Text,
  Timeline,
  TimelineItem,
  Title
} from '@mantine/core'
import {IconBriefcase} from '@tabler/icons-react'
import styles from './ResumeTimeline.module.css'

/**
 * Renders the resume as a Mantine Timeline, one entry per role, followed by
 * a summary of other professional experience.
 *
 * @returns A React element with the full resume page content.
 */
export function ResumeTimeline() {
  return (
    <div className={styles.wrapper}>
      <header>
        <Title order={1} className={styles.title}>
          Resume
        </Title>
      </header>

      <Timeline bulletSize={28} lineWidth={2} className={styles.timeline}>
        {resumeEntries.map((entry) => (
          <TimelineItem
            key={`${entry.company}-${entry.dateRange}`}
            bullet={<IconBriefcase size={14} />}
            title={
              <Title order={3} className={styles.subheading}>
                {entry.role} ·{' '}
                {entry.companyUrl ? (
                  <AppLink
                    href={entry.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.proseLink}
                  >
                    {entry.company}
                  </AppLink>
                ) : (
                  entry.company
                )}
              </Title>
            }
          >
            <Stack gap="xs">
              <Text className={styles.caption} c="dimmed">
                {entry.location} · {entry.dateRange}
              </Text>
              <Text className={styles.body}>{entry.summary}</Text>
              <List className={styles.body} spacing={4}>
                {entry.highlights.map((highlight) => (
                  <ListItem key={highlight}>{highlight}</ListItem>
                ))}
              </List>
              {entry.techStack ? (
                <Text className={styles.caption} c="dimmed">
                  {entry.techStack.join(' · ')}
                </Text>
              ) : null}
            </Stack>
          </TimelineItem>
        ))}
      </Timeline>

      <Text ta="center" className={styles.links}>
        View all my experiences on{' '}
        <AppLink
          href={siteConfig.author.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.proseLink}
        >
          LinkedIn
        </AppLink>{' '}
        and my code on{' '}
        <AppLink
          href={siteConfig.author.github}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.proseLink}
        >
          GitHub
        </AppLink>
        .
      </Text>

      <Title order={2} className={styles.sectionTitle}>
        Other Experience
      </Title>

      <Stack gap="sm" mt="lg">
        <Title order={3} className={styles.subheading}>
          Author
        </Title>
        <Text className={styles.body}>
          In 2017, I wrote a children&apos;s book,{' '}
          <AppLink
            href="https://amzn.to/41eZFfF"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.proseLink}
          >
            <em>Creating a Website for Dummies Jr</em>
          </AppLink>
          , published by Wiley Global under the{' '}
          <AppLink
            href="https://www.dummies.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.proseLink}
          >
            dummies&trade;
          </AppLink>{' '}
          brand.
        </Text>
        <Text className={styles.body}>
          The book guides young readers through planning and building a website.
          It&apos;s been translated into 2 languages and holds a 4.5-star rating
          on Amazon.
        </Text>
        <Text className={styles.body}>
          I&apos;ve also been Technical Editor on three other books:
        </Text>
        <List className={styles.body} spacing={4}>
          <ListItem>
            <em>
              <AppLink
                href="https://amzn.to/44EeXgy"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.proseLink}
              >
                WordPress for Dummies
              </AppLink>
            </em>{' '}
            (Sabin-Wilson, 2021)
          </ListItem>
          <ListItem>
            <em>
              <AppLink
                href="https://amzn.to/3VN8f3Z"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.proseLink}
              >
                Professional WordPress Plugin Development
              </AppLink>
            </em>{' '}
            (Williams et al., 2020)
          </ListItem>
          <ListItem>
            <em>
              <AppLink
                href="https://amzn.to/3B37BG8"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.proseLink}
              >
                WordPress All-In-One For Dummies
              </AppLink>
            </em>{' '}
            (Sabin-Wilson, 2019)
          </ListItem>
        </List>
      </Stack>

      <Stack gap="sm" mt="xl">
        <Title order={3} className={styles.subheading}>
          Contributor
        </Title>
        <Text className={styles.body}>
          I was part of the WordPress community from 2008 to 2023, contributing
          to core, docs, plugins, and themes, and speaking at WordCamps and
          meetups. I now contribute to Next.js, Storybook, and other open-source
          projects.
        </Text>
        <Text className={styles.body}>
          Outside of tech, I volunteer with local community organizations,
          including Boy Scouts, Wiregrass Church, and the local high school band
          boosters.
        </Text>
      </Stack>
    </div>
  )
}

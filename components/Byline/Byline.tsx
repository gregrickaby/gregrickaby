import {formatDate} from '@/lib/functions/formatDate'
import {Post} from '@/lib/types'
import styles from './Byline.module.css'

function AuthorInfo({
  name,
  gravatarUrl
}: Readonly<{name: string; gravatarUrl: string}>) {
  return (
    <address
      className={styles.author}
      itemProp="author"
      itemScope
      itemType="http://schema.org/Person"
    >
      By <span itemProp="name">{name}</span>
    </address>
  )
}

function PublishDate({
  date,
  dateGmt
}: Readonly<{date: string; dateGmt: string}>) {
  return (
    <span className={styles.published}>
      Published{' '}
      <time dateTime={dateGmt} itemProp="datePublished" content={dateGmt}>
        {formatDate(date)}
      </time>
    </span>
  )
}

function ModifiedDate({
  modified,
  modifiedGmt
}: Readonly<{
  modified: string
  modifiedGmt: string
}>) {
  return (
    <span className={styles.updated}>
      {' '}
      | Updated{' '}
      <time
        dateTime={modifiedGmt}
        itemProp="dateModified"
        content={modifiedGmt}
      >
        {formatDate(modified)}
      </time>
    </span>
  )
}

export function Byline({post}: Readonly<{post: Post}>) {
  // Destructure the post object.
  const {
    author_name,
    author_gravatar_url,
    date,
    date_gmt,
    modified,
    modified_gmt
  } = post

  return (
    <div className={styles.byline}>
      <div className={styles.container}>
        <AuthorInfo name={author_name} gravatarUrl={author_gravatar_url} />
        <div>
          <PublishDate date={date} dateGmt={date_gmt} />
          {modified && modified !== date && (
            <ModifiedDate modified={modified} modifiedGmt={modified_gmt} />
          )}
        </div>
      </div>
    </div>
  )
}

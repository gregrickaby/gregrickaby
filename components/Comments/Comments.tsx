import {CommentForm} from '@/components/CommentForm/CommentForm'
import {formatDate} from '@/lib/functions/formatDate'
import {sanitizeComment} from '@/lib/functions/sanitizeComment'
import {Comment} from '@/lib/types'
import clsx from 'clsx'
import styles from './Comments.module.css'

interface CommentsProps {
  comments: Comment[]
  postId: number
}

interface CommentItemProps {
  comment: Comment
  allComments: Comment[]
  level?: number
}

/**
 * Comment item component.
 */
function CommentItem({
  comment,
  allComments,
  level = 0
}: Readonly<CommentItemProps>) {
  // Find replies to this comment.
  const replies = allComments.filter((reply) => reply.parent === comment.id)

  // Sanitize the comment content.
  const sanitizedContent = sanitizeComment(comment.content.rendered)

  return (
    <>
      <article
        className={clsx(
          styles.comment,
          level % 2 === 0 ? styles.even : styles.odd
        )}
        id={`comment-${comment.id.toString()}`}
      >
        <header className={styles.header}>
          <img
            alt={comment.author_name ?? 'User avatar'}
            className={styles.avatar}
            height={96}
            loading="lazy"
            src={comment.author_avatar_urls?.['48']}
            width={96}
          />
          <div className={styles.author}>
            {comment.author_url ? (
              <a href={comment.author_url} rel="nofollow noopener noreferrer">
                <h3 className={styles.name}>{comment.author_name}</h3>
              </a>
            ) : (
              <h3 className={styles.name}>{comment.author_name}</h3>
            )}
            <a href={`#comment-${comment.id.toString()}`} rel="nofollow">
              <time className={styles.date}>{formatDate(comment.date)}</time>
            </a>
          </div>
        </header>
        <div
          className={styles.message}
          dangerouslySetInnerHTML={{__html: sanitizedContent}}
        />
      </article>

      {replies.length > 0 && (
        <div className={styles.replies}>
          {replies.map((reply) => (
            <CommentItem
              allComments={allComments}
              comment={reply}
              key={reply.id}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </>
  )
}

/**
 * Comments component.
 */
export function Comments({comments, postId}: Readonly<CommentsProps>) {
  // Filter out top-level comments.
  const topLevelComments = comments.filter((comment) => comment.parent === 0)

  return (
    <section className={clsx(styles.container, 'not-prose')}>
      <h2 className={styles.heading} id="comments">
        Comments
      </h2>
      {topLevelComments.length === 0 ? (
        <p>No comments yet. Be the first to write one!</p>
      ) : (
        topLevelComments.map((comment) => (
          <CommentItem
            allComments={comments}
            comment={comment}
            key={comment.id}
          />
        ))
      )}
      {/* Add the CommentForm below the comments */}
      <CommentForm postId={postId} />
    </section>
  )
}

import CommentForm from '@/components/CommentForm'
import {Post} from '@/lib/types'

interface CommentsProps {
  post: Post
}

/**
 * Comments component.
 */
export default function Comments({post}: CommentsProps) {
  return (
    <>
      <section className="border-t-2 border-zinc-500 py-4">
        <h3 className="text-3xl font-bold">Comments</h3>
        {!post.comments.nodes.length && (
          <p className="italic">No comments yet.</p>
        )}
        {post.comments.nodes.map((comment) => (
          <article key={comment.databaseId}>
            <header className="flex items-center gap-2">
              <img
                alt={comment.author.node.name}
                className="m-0 rounded-full"
                height={64}
                src={comment.author.node.gravatarUrl}
                width={64}
              />
              <div className="flex flex-col gap-2">
                <h4
                  className="m-0 p-0 leading-none"
                  dangerouslySetInnerHTML={{__html: comment.author.node.name}}
                />
                <time className="italic">{comment.date}</time>
              </div>
            </header>
            <div dangerouslySetInnerHTML={{__html: comment.content}} />
          </article>
        ))}
      </section>
      <CommentForm postID={post.databaseId} />
    </>
  )
}

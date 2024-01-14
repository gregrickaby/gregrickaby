import CommentForm from '@/components/CommentForm'
import {Post} from '@/lib/types'

/**
 * Comments component.
 */
export default function Comments({post}: {post: Post}) {
  return (
    <>
      <section className="border-t-2 border-zinc-500 py-4">
        <h3 className="text-3xl font-bold">Comments</h3>
        {!!post?.comments?.edges?.length && (
          <p className="italic">No comments yet.</p>
        )}
        {post.comments.edges.map((comment) => (
          <article key={comment.node.databaseId}>
            <header className="flex items-center gap-2">
              {!!comment?.node?.author?.node?.avatar?.url && (
                <img
                  alt={comment.node.author.node.name}
                  className="m-0 rounded-full"
                  height={64}
                  src={comment.node.author.node.avatar.url}
                  width={64}
                />
              )}
              <div className="flex flex-col gap-2">
                <h4
                  className="m-0 p-0 leading-none"
                  dangerouslySetInnerHTML={{
                    __html: comment.node.author.node.name
                  }}
                />
                <time className="italic">{comment.node.date}</time>
              </div>
            </header>
            <div dangerouslySetInnerHTML={{__html: comment.node.content}} />
          </article>
        ))}
      </section>
      <CommentForm postID={post.databaseId} />
    </>
  )
}

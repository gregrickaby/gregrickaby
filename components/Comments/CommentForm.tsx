'use client'

import {createComment} from '@/lib/api'
import {IconLoader} from '@tabler/icons-react'
import {useState} from 'react'

/**
 * CommentForm component for submitting comments.
 */
export function CommentForm({postId}: Readonly<{postId: number}>) {
  // State for the form fields.
  const [comment, setComment] = useState({
    authorEmail: '',
    authorName: '',
    authorUrl: '',
    content: ''
  })

  // State for the status message.
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Loading state.
  const [loading, setLoading] = useState(false)

  // Handles changes to the form fields.
  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setComment({
      ...comment,
      [event.target.name]: event.target.value
    })
  }

  // Handles form submission.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Set the loading state.
    setLoading(true)

    // Attempt to create the comment.
    const result = await createComment({
      postId,
      authorEmail: comment.authorEmail,
      authorName: comment.authorName,
      authorUrl: comment.authorUrl,
      comment: comment.content
    })

    // Reset the loading state.
    setLoading(false)

    // Set the result message to display to the user.
    setStatusMessage(result)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name*:
        <input
          type="text"
          name="authorName"
          value={comment.authorName}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Email*:
        <input
          type="email"
          name="authorEmail"
          value={comment.authorEmail}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Website:
        <input
          type="url"
          name="authorUrl"
          value={comment.authorUrl}
          onChange={handleChange}
        />
      </label>
      <label>
        Comment*:
        <textarea
          name="content"
          value={comment.content}
          onChange={handleChange}
          required
        />
      </label>
      <div className="flex items-center justify-end">
        <button className="button text-normal px-6">
          Submit
          {loading && <IconLoader className="loading" />}
        </button>
      </div>
      <div aria-live="polite">{statusMessage && <p>{statusMessage}</p>}</div>
    </form>
  )
}

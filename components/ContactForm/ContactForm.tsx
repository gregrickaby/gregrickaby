'use client'

import {sendEmail} from '@/lib/api/sendEmail'
import config from '@/lib/config'
import {useRef, useState} from 'react'
import styles from './ContactForm.module.css'

/**
 * Basic contact form component.
 *
 * Provides a basic form with name, email, and message fields.
 * Includes a honeypot and time-based submission check to ward off spam.
 */
export function ContactForm() {
  // Form status state.
  const [formStatus, setFormStatus] = useState<{
    message: string
    success: boolean | null
  }>({message: '', success: null})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Capture form render time.
  const [startTime] = useState(Date.now())

  // Ref for the form element.
  const formRef = useRef<HTMLFormElement>(null)

  /**
   * Handle form submissions.
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    // Get form data.
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name')?.toString() ?? ''
    const email = formData.get('email')?.toString() ?? ''
    const message = formData.get('message')?.toString() ?? ''
    const honeypot = formData.get('honeypot')?.toString() ?? ''
    const submissionTime = Date.now() - startTime

    // Check honeypot field and submission time.
    if (honeypot || submissionTime < 3000) {
      setFormStatus({
        message: 'Spambot detected! Submission blocked. 💀',
        success: false
      })
      setIsSubmitting(false)
      return
    }

    // Validate fields are not empty.
    if (!name || !email || !message) {
      setFormStatus({
        message: 'All fields are required.',
        success: false
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Send email.
      const response = await sendEmail({
        name,
        email,
        subject: `New Contact Form Message from ${name} (via gregrickaby.com)`,
        text: message,
        to: config.email
      })

      // Handle errors.
      if (response === 'error') {
        throw new Error('Failed to send email')
      }

      // Update form status.
      setFormStatus({
        message: "Message sent successfully! I'll be in touch soon.",
        success: true
      })

      // Reset form using ref.
      formRef.current?.reset()
    } catch (error) {
      console.error('Error sending message:', error)
      setFormStatus({
        message:
          'Failed to send message. You can always email me directly at greg@gregrickaby.com',
        success: false
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-8 space-y-6">
      {/* Honeypot field (hidden) */}
      <input
        autoComplete="off"
        name="honeypot"
        style={{display: 'none'}}
        tabIndex={-1}
        type="text"
      />

      <div>
        <label className={styles.label} htmlFor="name">
          Name <span className={styles.required}>*</span>
        </label>
        <input
          id="name"
          name="name"
          placeholder="Jane Doe"
          required
          type="text"
        />
      </div>

      <div>
        <label className={styles.label} htmlFor="email">
          Email <span className={styles.required}>*</span>
        </label>
        <input
          id="email"
          name="email"
          placeholder="jane@email.com"
          required
          type="email"
        />
      </div>

      <div>
        <label className={styles.label} htmlFor="message">
          Message <span className={styles.required}>*</span>
        </label>
        <textarea id="message" name="message" required rows={4} />
      </div>

      <div>
        <button className={styles.button} disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Sending...' : 'Send Email'}
        </button>
      </div>

      {formStatus.message && (
        <div
          role="alert"
          className={`mt-4 rounded-md p-4 ${
            formStatus.success
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {formStatus.message}
        </div>
      )}
    </form>
  )
}

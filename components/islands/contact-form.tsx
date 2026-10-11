'use client'

import { useActionState } from 'react'
import { sendContactEmail } from '@/app/actions/contact'
import { serviceOptions } from '@/lib/services'
import type { ContactFormState } from '@/lib/types'
import styles from './contact-form.module.css'

const INITIAL_STATE: ContactFormState = { success: false, error: null }

/**
 * The contact form. It posts to a Server Action, so it also works before
 * JavaScript loads; with JavaScript, it shows the result without a reload.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactEmail, INITIAL_STATE)

  if (state.success) {
    return (
      <p className={styles.success} role="status">
        <strong>Message sent!</strong> Thanks for reaching out. I&apos;ll get back to you soon.
      </p>
    )
  }

  return (
    <form action={formAction} className={styles.form}>
      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}

      <label className={styles.field}>
        <span>Name</span>
        <input autoComplete="name" name="name" placeholder="Jane Doe" required />
      </label>
      <label className={styles.field}>
        <span>Email</span>
        <input
          autoComplete="email"
          name="email"
          placeholder="jane.doe@email.com"
          required
          type="email"
        />
      </label>
      <label className={styles.field}>
        <span>How can I help?</span>
        <select defaultValue="" name="howCanIHelp" required>
          <option disabled value="">
            Select an option from the list
          </option>
          {serviceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span>Message</span>
        <textarea name="message" placeholder="Your message" required rows={6} />
      </label>
      <button className={styles.submit} disabled={pending} type="submit">
        {pending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}

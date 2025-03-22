'use server'

import {sanitizeText} from '@/lib/functions/sanitizeText'

/**
 * The props for the email handler function.
 */
export interface SendEmailProps {
  /** Required. The name of the person sending the email. */
  name: string
  /** Required. The email address of the person sending the email. */
  email: string
  /** Required. The email subject line. */
  subject: string
  /** Required. The message text to send. */
  text: string
  /** Required. The email address to send the message to. */
  to: string
}

/**
 * A server function to POST the form data to the email service.
 */
export async function sendEmail(
  data: Readonly<SendEmailProps>
): Promise<'success' | 'error'> {
  try {
    // Get the form data from the request.
    const {name, email, subject, text, to} = data

    // Validate the input
    if (!name || !email || !subject || !text || !to) {
      console.error('Missing required fields')
      throw new Error('Missing required fields')
    }

    // Validate configuration.
    if (!process.env.SMTP_HOST_URL || !process.env.SMTP_API_KEY) {
      console.error('SMTP configuration is missing')
      throw new Error('Failed to send email')
    }

    // Get the SMTP configuration.
    const smtpHost = process.env.SMTP_HOST_URL ?? ''
    const smtpApiKey = process.env.SMTP_API_KEY ?? ''

    // Encode the credentials.
    const credentials = Buffer.from('api:' + smtpApiKey).toString('base64')

    // Create the headers.
    const headers = new Headers()
    headers.append('Content-Type', 'application/x-www-form-urlencoded')
    headers.append('Authorization', 'Basic ' + credentials)

    // Create the payload.
    const body = new URLSearchParams({
      from: `${sanitizeText(name)} <postmaster@mg.gregrickaby.com>`,
      to: sanitizeText(to),
      subject: sanitizeText(subject),
      text: sanitizeText(text),
      'h:Reply-To': sanitizeText(email)
    })

    // POST to email service.
    const response = await fetch(smtpHost, {
      method: 'POST',
      headers,
      body,
      redirect: 'follow'
    })

    // Parse the response.
    const responseData = await response.json()

    // Handle errors.
    if (!response.ok) {
      console.error('Failed to send email:', responseData)
      throw new Error(responseData.message || 'Failed to send email')
    }

    // Return success.
    return 'success'
  } catch (error) {
    console.error('Error sending email:', error)
    return 'error'
  }
}

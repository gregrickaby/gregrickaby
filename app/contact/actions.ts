'use server'

import {isValidService} from '@/lib/services'
import type {ContactFormState} from '@/lib/types'
import {escapeHtml} from '@/lib/utils'
import nodemailer from 'nodemailer'

export async function sendContactEmail(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = (formData.get('name') as string | null)?.trim()
  const email = (formData.get('email') as string | null)?.trim()
  const howCanIHelp = (formData.get('howCanIHelp') as string | null)?.trim()
  const message = (formData.get('message') as string | null)?.trim()

  if (!name || !email || !howCanIHelp || !message) {
    return {success: false, error: 'All fields are required.'}
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {success: false, error: 'Please enter a valid email address.'}
  }

  if (!isValidService(howCanIHelp)) {
    return {success: false, error: 'Invalid service selection.'}
  }

  const mailgunLogin = process.env.MAILGUN_LOGIN
  const mailgunPassword = process.env.MAILGUN_PASSWORD
  if (!mailgunLogin || !mailgunPassword) {
    return {success: false, error: 'Failed to send message. Please try again.'}
  }

  // Strip CRLF from fields used in email headers to prevent header injection.
  const headerSafeName = name.replaceAll(/[\r\n]/g, ' ')
  const headerSafeEmail = email.replaceAll(/[\r\n]/g, ' ')
  const headerSafeHowCanIHelp = howCanIHelp.replaceAll(/[\r\n]/g, ' ')

  const transport = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    auth: {
      user: mailgunLogin,
      pass: mailgunPassword
    }
  })

  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeHowCanIHelp = escapeHtml(howCanIHelp)
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br>')

  try {
    await transport.sendMail({
      from: `"${headerSafeName}" <${mailgunLogin}>`,
      replyTo: headerSafeEmail,
      to: 'gregrickaby@gmail.com',
      subject: `Contact form: ${headerSafeHowCanIHelp}`,
      text: `Name: ${name}\nEmail: ${email}\nHow Can I Help: ${howCanIHelp}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>How Can I Help:</strong> ${safeHowCanIHelp}</p><p>${safeMessage}</p>`
    })
  } catch {
    return {success: false, error: 'Failed to send message. Please try again.'}
  }

  return {success: true, error: null}
}

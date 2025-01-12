import {ContactForm} from '@/components/ContactForm/ContactForm'
import config from '@/lib/config'
import {Metadata} from 'next'

/**
 * Generate metadata.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export function generateMetadata(): Metadata {
  return {
    title: `Contact - ${config.siteName}`,
    description:
      'Get in touch with me by filling out the form below. I will get back to you as soon as possible.',
    alternates: {
      canonical: '/contact'
    }
  }
}

/**
 * Contact page.
 */
export default function ContactPage() {
  return (
    <div className="article px-12 lg:px-0">
      <h1>Contact</h1>
      <p>To get in touch, please fill out the form below.</p>
      <ContactForm />
    </div>
  )
}

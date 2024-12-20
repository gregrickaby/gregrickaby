import {ContactForm} from '@/components/ContactForm/ContactForm'

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

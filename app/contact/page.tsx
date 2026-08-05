import {ContactForm} from '@/components/ContactForm/ContactForm'
import {createStaticPage} from '@/lib/staticPage'

const {generateMetadata, Page} = createStaticPage('contact', () => (
  <ContactForm />
))

export {generateMetadata}
export default Page

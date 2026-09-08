import {ContactForm} from '@/components/ContactForm/ContactForm'
import {createStaticPage} from '@/components/StaticPage/StaticPage'

const {generateMetadata, Page} = createStaticPage('contact', () => (
  <ContactForm />
))

export {generateMetadata}
export default Page

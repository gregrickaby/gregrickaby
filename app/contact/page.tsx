import {ContactForm} from '@/components/ContactForm/ContactForm'
import {createStaticPage} from '@/components/StaticPage/StaticPage'

/**
 * Fail the build if request-time rendering is ever added to this route.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/ensureStatic
 */
export const ensureStatic = 'navigation'

const {generateMetadata, Page} = createStaticPage('contact', () => (
  <ContactForm />
))

export {generateMetadata}
export default Page

import {createStaticPage} from '@/lib/staticPage'

const {generateMetadata, Page} = createStaticPage('about', undefined, '/')

export {generateMetadata}
export default Page

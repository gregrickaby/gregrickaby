import {createStaticPage} from '@/components/StaticPage/StaticPage'

const {generateMetadata, Page} = createStaticPage('about', undefined, '/')

export {generateMetadata}
export default Page

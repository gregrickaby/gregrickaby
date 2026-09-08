import {ResumeTimeline} from '@/components/ResumeTimeline/ResumeTimeline'
import {createStaticPage} from '@/components/StaticPage/StaticPage'

const {generateMetadata, Page} = createStaticPage('resume', () => (
  <ResumeTimeline />
))

export {generateMetadata}
export default Page

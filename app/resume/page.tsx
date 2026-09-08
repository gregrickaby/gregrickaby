import {ResumeTimeline} from '@/components/ResumeTimeline/ResumeTimeline'
import {createStaticPage} from '@/lib/staticPage'

const {generateMetadata, Page} = createStaticPage('resume', () => (
  <ResumeTimeline />
))

export {generateMetadata}
export default Page

import { MissingPage } from '@/components/missing-page'
import { SiteShell } from '@/components/site-shell'

/*
 * For URLs that match no route. These render in the root layout alone, so
 * they bring the site shell; a `notFound()` inside (site) uses
 * app/(site)/not-found.tsx, which already sits inside it.
 */
export default function NotFound() {
  return (
    <SiteShell>
      <MissingPage />
    </SiteShell>
  )
}

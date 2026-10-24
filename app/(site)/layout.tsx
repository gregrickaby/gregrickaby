import type { ReactNode } from 'react'

import { SiteShell } from '@/components/site-shell'

/*
 * Every page in this group prerenders. The build fails if one ever reads
 * cookies, headers, or search params, or does uncached work at request time.
 * `/search` is the only page outside it.
 */
export const ensureStatic = 'navigation'

export default function StaticLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}

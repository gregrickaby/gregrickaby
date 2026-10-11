/*
 * Every page in this group prerenders. The build fails if one ever reads
 * cookies, headers, or search params, or does uncached work at request time.
 * `/search` is the only page outside it.
 */
export const ensureStatic = 'navigation'

export default function StaticLayout({ children }: { children: React.ReactNode }) {
  return children
}

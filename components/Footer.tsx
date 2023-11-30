import SocialLinks from '@/components/SocialLinks'

/**
 * Footer component.
 */
export default function Footer() {
  return (
    <footer className="mx-auto max-w-2xl border-t border-zinc-500 pt-8">
      <SocialLinks />
      <p className="text-center text-xs">
        Unless otherwise noted, all content on this website is licensed under{' '}
        <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">
          CC BY-NC-ND 4.0
        </a>
        .
      </p>

      <p className="text-center text-sm">
        &copy; 2008 - {new Date().getFullYear()} Greg Rickaby
      </p>
    </footer>
  )
}

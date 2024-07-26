import SocialLinks from '@/components/SocialLinks'

/**
 * Footer component.
 */
export default function Footer() {
  return (
    <footer
      className="mt-20 p-8 text-center text-sm md:p-12"
      data-testid="footer"
    >
      <SocialLinks />
      <p>
        Unless otherwise noted, all content on this website is licensed under{' '}
        <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">
          CC BY-NC-ND 4.0
        </a>
        .
      </p>

      <p>&copy; 2008 - {new Date().getFullYear()} Greg Rickaby</p>
    </footer>
  )
}

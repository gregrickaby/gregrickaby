import {
  FaCodepen,
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaThreads,
  FaWordpress,
  FaYoutube
} from 'react-icons/fa6'

export default function Socials() {
  return (
    <div className="flex gap-4 flex-wrap justify-center">
      <a
        className="icon"
        href="https://www.instagram.com/gregoryrickaby/"
        aria-label="View Greg's Instagram feed"
        rel="author"
      >
        <FaInstagram />
      </a>
      <a
        className="icon"
        href="https://github.com/gregrickaby"
        aria-label="View Greg's Github stats"
        rel="author"
      >
        <FaGithub />
      </a>
      <a
        className="icon"
        href="https://codepen.io/gregrickaby"
        aria-label="View Greg's Codepen"
        rel="author"
      >
        <FaCodepen />
      </a>
      <a
        className="icon"
        href="https://www.facebook.com/gregrickaby/"
        aria-label="View Greg's Facebook feed"
        rel="author"
      >
        <FaFacebook />
      </a>
      <a
        className="icon"
        href="https://www.linkedin.com/in/gregrickaby/"
        aria-label="View Greg's Linkedin profile"
        rel="author"
      >
        <FaLinkedin />
      </a>
      <a
        className="icon"
        href="https://www.threads.net/@gregoryrickaby"
        aria-label="View Greg's Threads feed"
        rel="author"
      >
        <FaThreads />
      </a>
      <a
        className="icon"
        href="https://profiles.wordpress.org/gregrickaby/"
        aria-label="View Greg's WordPress profile"
        rel="author"
      >
        <FaWordpress />
      </a>
      <a
        className="icon"
        href="https://www.youtube.com/@GregRickaby"
        aria-label="View Greg's YouTube channel"
        rel="author"
      >
        <FaYoutube />
      </a>
    </div>
  )
}

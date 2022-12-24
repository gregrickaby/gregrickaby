import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        <a href="https://github.com/gregrickaby" rel="author">
          Github
        </a>{" "}
        &middot;{" "}
        <a href="https://www.instagram.com/gregoryrickaby/" rel="author">
          Instagram
        </a>{" "}
        &middot;{" "}
        <a href="https://www.linkedin.com/in/gregrickaby/" rel="author">
          LinkedIn
        </a>{" "}
        &middot;{" "}
        <a href="https://gregrickaby.smugmug.com" rel="author">
          SmugMug
        </a>{" "}
        &middot;{" "}
        <a href="https://twitter.com/GregRickaby" rel="author">
          Twitter
        </a>{" "}
        &middot;{" "}
        <a href="https://profiles.wordpress.org/gregrickaby/" rel="author">
          WordPress
        </a>
      </p>
    </footer>
  );
}

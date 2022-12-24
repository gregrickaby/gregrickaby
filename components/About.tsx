import styles from "./About.module.css";

export default function About() {
  return (
    <div id="about" className={styles.about}>
      <h2>About</h2>
      <p>
        Way back in 1997, I built my first website on Geocities and have been
        passionate about the web since! In my spare time I enjoy{" "}
        <a href="https://gregrickaby.smugmug.com" rel="author">
          taking photos
        </a>
        , cheering for the{" "}
        <a href="https://www.packers.com/">Green Bay Packers</a>, and making
        pizzas.
      </p>

      <h3>Web Developer</h3>
      <p>
        I&apos;m a Tech Lead at{" "}
        <a href="https://americaneagle.com/">AmericanEagle.com</a>, an industry
        leader in web design, development, hosting, and digital marketing. I
        partner with clients and team members to build websites with Next.js and
        WordPress.
      </p>
      <p>
        View my résumé on{" "}
        <a href="https://www.linkedin.com/in/gregrickaby/" rel="author">
          LinkedIn
        </a>
        .
      </p>

      <h3>Published Author</h3>
      <p>
        In 2017, I wrote a children&apos;s book titled{" "}
        <a href="https://amzn.to/34QAxAQ">
          <em>
            <strong>Creating a Website for Dummies Jr</strong>
          </em>
        </a>{" "}
        which was published by{" "}
        <a href="https://www.wiley.com/en-us"> Wiley Global</a> under the{" "}
        <a href="https://www.dummies.com/">dummies™️</a> brand.
      </p>

      <p>
        The book guides young readers through the planning and development
        processes of building a website. It has been translated into other 2
        other languages, and currently has a 4.5-star rating on Amazon.
      </p>

      <p>
        Since being published, I&apos;ve also served as the Technical Editor on
        three other books:
      </p>
      <ul>
        <li>
          <a href="https://amzn.to/37XCflU" rel="nofollow">
            <em>WordPress for Dummies</em>
          </a>{" "}
          (Sabin-Wilson, 2021)
        </li>
        <li>
          <a href="https://amzn.to/2BgCg7i" rel="nofollow">
            <em>Professional WordPress Plugin Development</em>
          </a>{" "}
          (Williams et al., 2020)
        </li>
        <li>
          <a href="https://amzn.to/37MMDLp" rel="nofollow">
            <em>WordPress All-In-One For Dummies</em>
          </a>{" "}
          (Sabin-Wilson, 2019)
        </li>
      </ul>

      <h3>Photographer</h3>
      <p>
        In late 2019, I bought a mirrorless camera and spent months taking
        courses, reading, practicing, and having my work critiqued by peers.
        What has started as an enjoyable hobby, has turned into a passionate way
        to express my creativity.
      </p>
      <p>
        View my{" "}
        <a href="https://gregrickaby.smugmug.com" rel="author">
          portfolio
        </a>{" "}
        on SmugMug.
      </p>

      <h3>Contributions</h3>
      <p>
        I've been part of the WordPress community since 2008. I've made
        contributions to core, documentation, plugins, and themes. I've also
        spoken at WordCamps and meet-ups. I'm also a contributor to other
        open-source projects like Next.js, Storybook, and Gatsby.
      </p>
      <p>
        Outside of tech, I volunteer my time and efforts at local community
        organizations. The Boy Scouts, Wiregrass Church, and the Enterprise High
        School Band Boosters to name a few.
      </p>

      <p>
        You can find me around the web with the links below. Stay safe out
        there, and thanks for reading!
        <span role="img" aria-label="cheers">
          🍻
        </span>
      </p>
    </div>
  );
}

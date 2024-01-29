/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const runtime = 'nodejs'

/**
 * The home page route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Home() {
  return (
    <article>
      <section>
        <h2 className="mt-0 pt-0">Résumé</h2>
        <p>
          With a career in web development spanning over two decades, my focus
          has transitioned from hands-on technical implementation to team
          leadership. This pivotal change was driven by my passion for nurturing
          talent and fostering growth. As a team leader, I embrace the
          principles of servant leadership, dedicating myself to supporting and
          empowering team members to achieve their goals through positive
          reinforcement.
        </p>
      </section>
      <section>
        <h2 className="mt-0 pt-0">Experience</h2>
        <div>
          <h3>WPForms.com, Remote - Team Lead</h3>
          <p>May 2023 - January 2024</p>
          <ul>
            <li>
              Lead and mentored a web development team, fostering collaboration
              and productivity.
            </li>
            <li>
              Work closely with stakeholders to translate designs into efficient
              solutions.
            </li>
            <li>
              Oversee the entire development lifecycle, ensuring timely project
              completion and adherence to quality standards.
            </li>
            <li>
              Implement coding standards, best practices, and maintainable code
              for long-term sustainability.
            </li>
            <li>
              Facilitate cross-functional collaboration with designer, product
              lead, engineering manager, quality assurance, and stakeholders.
            </li>
            <li>
              Conducted 1:1s with direct reports to provide regular feedback and
              ensure career growth and progression, coordinating work within the
              team and stakeholders, building relationships, and identifying
              opportunities and areas for improvement.
            </li>
          </ul>
          <p>
            <strong>Skills:</strong> Team Leadership, WordPress Development,
            PHP, CSS, JavaScript, REST APIs, Node.js, Employee Coaching,
            Performance Reviews, Constructive Feedback
          </p>
          <hr />
        </div>
        <div>
          <h3>Americaneagle.com, Remote - Technical Lead</h3>
          <p>May 2022 - April 2023</p>
          <p>
            I worked closely with clients and team members to build websites
            using WordPress and React.js. I helped out the business development
            team with sales proposals and scoping. I also hosted lunch and
            learns and made sure we were up-to-date with emerging technologies
            and trends by contributing to various research and development
            initiatives.
          </p>
          <p>
            <strong>Skills:</strong> Project Leadership, WordPress, Next.js,
            TypeScript, TailwindCSS
          </p>
          <hr />
        </div>
        <div>
          <h3>WebDevStudios, Remote - Director of Engineering</h3>
          <p>May 2013 - May 2022</p>
          <p>
            I oversaw staffing, policy, wellness, continuing education, and help
            build technical roadmaps and goals for the team. I also support the
            Project Management department with resource allocation, the Business
            Development with technical estimates and solutions engineering, and
            assist both the CEO and COO with planning and execution of goals. I
            occasionally lead projects for high value clients.
          </p>
          <p>
            <strong>Skills:</strong> Leadership, Business Strategy,
            Interviewing, Constructive Feedback, WordPress, Next.js, TypeScript,
            TailwindCSS
          </p>
          <hr />
        </div>
        <div>
          <h3>Bluewater Broadcasting, Montgomery, AL - Chief Engineer</h3>
          <p>January 2010 - May 2013</p>
          <p>
            Oversaw all studios, networking, computers, automation systems,
            websites and social media.
          </p>
          <p>
            <strong>Skills:</strong> Project Management, Business Strategy, IT,
            Networking, Automation, WordPress
          </p>
          <hr />
        </div>
        <div>
          <h3>Gulf South Communications, Dothan, AL - Chief Engineer</h3>
          <p>September 2002 - December 2009</p>
          <p>
            Oversaw all studios, networking, computers, automation systems, and
            websites.
          </p>
          <p>
            <strong>Skills:</strong> Project Management, Business Strategy, IT,
            Networking, Automation, WordPress
          </p>
          <hr />
        </div>
        <div>
          <h3>Midwest Communications, Wausau, WI - Webmaster</h3>
          <p>June 1999 - September 2002</p>
          <p>
            Webmaster for all country-music formatted radio stations.
            Responsible for daily content updates, content and graphic creation.
            Managing relationships with all Program Directors.
          </p>
          <p>
            <strong>Skills:</strong> Organization, Planning, Content Creation,
            Graphic Design, Photography, HTML, CSS, ASP
          </p>
          <hr />
        </div>
        View all my experiences on{' '}
        <a href="https://www.linkedin.com/in/gregrickaby/">LinkedIn</a> and my
        code on <a href="https://github.com/gregrickaby">GitHub</a>.
      </section>
    </article>
  )
}

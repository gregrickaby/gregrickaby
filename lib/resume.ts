import type {ResumeEntry} from './types'

/**
 * Canonical work history for the resume timeline, most recent role first.
 * This is the single source of truth for the resume page.
 */
export const resumeEntries: ResumeEntry[] = [
  {
    role: 'Technical Lead',
    company: 'Mindsize',
    companyUrl: 'https://mindsize.com',
    location: 'Remote',
    dateRange: 'February 2024 – Present',
    summary:
      'Mentor an agile team as a staff-augmented engineer for a multi-billion dollar grocery retailer.',
    highlights: [
      'Scope Jira tickets from stakeholder requirements gathered in refinement and sprint planning.',
      'Translate design and product requirements into performant, scalable solutions with Next.js and TypeScript.',
      'Coordinate with designers, product owners, architects, and engineering managers to keep delivery on track.',
      'Oversee the full development lifecycle: design, code review, and deployment.',
      'Establish coding standards, testing practices, and documentation workflows with Vitest, Playwright, and Storybook.',
      'Introduce agentic AI workflows and tooling standards, using two decades of engineering experience to move faster without sacrificing quality.',
      "Unblock teammates on tough problems as one of the team's go-to for troubleshooting and code review."
    ],
    techStack: [
      'Agentic AI',
      'Team Leadership',
      'TypeScript',
      'Next.js',
      'Tailwind CSS',
      'Vitest',
      'Playwright',
      'Storybook',
      'GraphQL',
      'REST APIs',
      'Node.js',
      'Jira',
      'Agile/Scrum'
    ]
  },
  {
    role: 'Team Lead',
    company: 'WPForms.com',
    location: 'Remote',
    dateRange: 'May 2023 – January 2024',
    summary:
      'Led development and team growth at WPForms.com, driving platform improvements to boost performance, user experience, and conversions.',
    highlights: [
      'Collaborated with the engineering manager, product owner, and cross-functional teams to guide the wpforms.com marketing platform.',
      'Led front-end and back-end development, optimizing site performance and conversion rates.',
      'Provided technical leadership and mentorship, including feedback and performance reviews, to support team growth.',
      'Ensured clean, maintainable code across the stack using PHP, JavaScript, and WordPress best practices.'
    ],
    techStack: [
      'Team Leadership',
      'WordPress Development',
      'Conversion Optimization',
      'PHP',
      'JavaScript',
      'CSS',
      'REST APIs',
      'Node.js',
      'Employee Coaching',
      'Performance Management'
    ]
  },
  {
    role: 'Technical Lead',
    company: 'Americaneagle.com',
    location: 'Remote',
    dateRange: 'May 2022 – April 2023',
    summary:
      'After a decade leading engineering at WebDevStudios, I stepped back from people management to lead client web projects in WordPress and React, supporting sales efforts and internal R&D.',
    highlights: [
      "Led the website migration to WordPress for samhealth.org while staff-augmented onto the client's team.",
      'Collaborated with clients and internal teams to deliver custom websites using WordPress, React, and Next.js.',
      'Partnered with the business development team on technical scoping and sales proposals.',
      'Led internal knowledge-sharing initiatives, including Lunch & Learns and R&D on modern frameworks and frontend tooling.',
      'Championed emerging technologies and kept the team current with evolving web standards.'
    ],
    techStack: [
      'Project Leadership',
      'WordPress',
      'React',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Technical Scoping',
      'Client Collaboration'
    ]
  },
  {
    role: 'Director of Engineering',
    company: 'WebDevStudios',
    location: 'Remote',
    dateRange: 'May 2013 – May 2022',
    summary:
      'Directed engineering operations and strategy at WebDevStudios, supporting cross-department goals and high-profile client delivery.',
    highlights: [
      'Led engineering operations, including staffing, team wellness, policy, and continuing education.',
      'Developed technical roadmaps and strategic goals aligned with company objectives.',
      'Supported Project Management with resource planning across concurrent client engagements.',
      'Partnered with Business Development as a sales engineer, scoping estimates and proposals for prospective clients.',
      'Advised the CEO and COO on execution strategy, and led projects for clients including Microsoft, the NBA, Monster.com, and Realtor.com.'
    ],
    techStack: [
      'Leadership',
      'Engineering Strategy',
      'Sales Engineering',
      'Team Development',
      'Interviewing',
      'Constructive Feedback',
      'WordPress',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Cross-Functional Collaboration'
    ]
  },
  {
    role: 'Chief Engineer',
    company: 'Bluewater Broadcasting',
    location: 'Montgomery, AL',
    dateRange: 'January 2010 – May 2013',
    summary:
      'Primary engineer for a multi-station radio group, overseeing all technical systems, FCC compliance, and digital platforms.',
    highlights: [
      'Responsible for all technical operations across multiple stations, including studios, IT infrastructure, networking, and on-air automation.',
      'Ensured 24/7 broadcast reliability and maintained full FCC compliance, including EAS, public files, and technical documentation.',
      'Managed station websites and social media for audience engagement and growth.',
      "Handled regulatory, infrastructure, and emergency-operations communications as the group's primary technical contact.",
      'Held Certified Broadcast Technologist (CBT) certification from the Society of Broadcast Engineers.'
    ],
    techStack: [
      'FCC Compliance',
      'Broadcast Engineering',
      'IT Infrastructure',
      'Networking',
      'Automation Systems',
      'WordPress',
      'Project Management',
      'CBT Certification'
    ]
  },
  {
    role: 'Chief Engineer',
    company: 'Gulf South Communications',
    location: 'Dothan, AL',
    dateRange: 'September 2002 – December 2009',
    summary:
      'Sole broadcast engineer for multiple radio stations, managing technical systems, automation, and digital infrastructure.',
    highlights: [
      "As the group's only engineer, ran technical operations: studio equipment, IT infrastructure, networking, and automation.",
      'Maintained on-air reliability and managed preventative maintenance for studio and transmitter sites.',
      'Maintained station websites and digital infrastructure to support online presence.',
      'Drove technology strategy, system upgrades, and operational continuity across all stations.'
    ],
    techStack: [
      'Broadcast Engineering',
      'IT Infrastructure',
      'Networking',
      'Automation Systems',
      'WordPress',
      'Project Management',
      'Strategic Planning'
    ]
  },
  {
    role: 'Webmaster',
    company: 'Midwest Communications',
    location: 'Wausau, WI',
    dateRange: 'June 1999 – September 2002',
    summary:
      'Managed country station websites using a custom CMS, covering content, graphics, photography, and day-to-day requests from Program Directors.',
    highlights: [
      'Managed websites for all country-formatted stations on a custom CMS, handling daily updates, promotional content, and design assets.',
      'Created graphics, wrote content, and shot event photography for station branding and audience engagement.',
      'Fielded day-to-day requests from Program Directors, covering content needs, promotions, and special asks.',
      'Maintained and enhanced site functionality with HTML, CSS, and ASP in an early-era web environment.'
    ],
    techStack: [
      'Content Creation',
      'Graphic Design',
      'Photography',
      'Custom CMS',
      'HTML',
      'CSS',
      'ASP',
      'Cross-Department Collaboration',
      'Organizational Support'
    ]
  }
]

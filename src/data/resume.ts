/**
 * Source of truth: design mockups/uploads/Tigran_Resume.pdf
 */

export const available = true;

export const person = {
  name: "Tigran Asriyan",
  role: "Full Stack Developer",
  location: "Austin, TX",
  timezone: "UTC−6",
  experienceYears: "5 yrs",
  focus: "web · mobile",
  shippedTo: "App Store · Play",
  stackHighlights: [
    "TypeScript",
    "React",
    "React Native",
    "Next.js",
    "Node",
    "Postgres",
    "Supabase",
    "Solana",
  ],
  heroSummary:
    "Full stack developer with five years across web and mobile — TypeScript end to end, from React and React Native interfaces down to the Node and Postgres services behind them. I care about correctness, fast page loads, and owning features from requirements through release.",
  resumeSummary:
    "As a dedicated full stack developer with five years of experience, I specialize in modern web technologies. Skilled in creating comprehensive solutions that bridge front-end and back-end development, I focus on delivering clean, efficient code and staying current with emerging tech trends.",
};

export interface ExperienceEntry {
  company: string;
  role: string;
  start: string;
  end: string;
  summary: string;
  stack: string[];
  bullets: string[];
}

export const experience: ExperienceEntry[] = [
  {
    company: "Amp Pay",
    role: "Software Engineer",
    start: "Dec 2024",
    end: "Jan 2026",
    summary:
      "A cross-platform mobile payments application that enables users to manage assets on the Solana blockchain.",
    stack: [
      "React Native",
      "Expo",
      "Supabase",
      "Tanstack Query",
      "Nativewind",
      "Solana",
      "TypeScript",
      "Zod",
    ],
    bullets: [
      "Core engineer on a cash & payments mobile application serving 20,000+ monthly active users.",
      "Built, shipped, and maintained production React Native applications deployed to the Apple App Store and Google Play.",
      "Led integrations with Rain cards for card payments and Stripe for ACH deposits and withdrawals.",
      "Owned payment, balance, and transaction flows with a focus on financial correctness, reliability, and user experience.",
      "Led a full mobile app redesign, modernizing UI/UX and improving usability, consistency, and visual polish.",
      "Designed and implemented blockchain-related features, including on-chain interactions and user-facing abstractions.",
      "Owned features end-to-end from requirements gathering and technical design through implementation, testing, and release.",
      "Improved code quality and team velocity through code reviews, architectural guidance, and mentorship.",
      "Participated in production support and debugging to resolve live issues and improve system stability.",
    ],
  },
  {
    company: "Hedgehog Markets",
    role: "Software Engineer",
    start: "Jan 2022",
    end: "Dec 2024",
    summary:
      "A decentralized prediction marketplace that enables users to create & trade in markets on the blockchain.",
    stack: [
      "React",
      "NextJS",
      "IPFS",
      "Firebase",
      "Tanstack Query",
      "Solana",
      "Tailwind",
      "TypeScript",
      "Zod",
    ],
    bullets: [
      "Migrated data storage providers which reduced initial page load time from 8 seconds to under 2 seconds by efficiently managing IPFS data storage.",
      "Integrated Polymarket API with cron functions to automate market creation resulting in over 50x in market availability.",
      "Developed a fully responsive frontend precisely implementing the design specifications from Figma.",
    ],
  },
  {
    company: "Swaps.app",
    role: "Software Developer",
    start: "May 2021",
    end: "Aug 2021",
    summary: "Enterprise focused widget for swapping digital currencies.",
    stack: ["React", "Redux", "Tailwind", "TypeScript", "NodeJs", "Knex", "Pg"],
    bullets: [
      "Hardened backend API by implementing security features which reduced frequency and harm from malicious attacks.",
      "Shipped admin frontend for enterprise customers based on continuous feedback.",
      "Developed a fully responsive frontend precisely implementing the design specifications from Figma.",
    ],
  },
  {
    company: "Paragon Robotics",
    role: "Software Developer",
    start: "Sep 2020",
    end: "Apr 2021",
    summary:
      "Monitoring systems, analytics and business automation software, industrial controls, and specialized equipment.",
    stack: ["Javascript"],
    bullets: [
      "Developed a business intelligence application for generating custom reports from multiple data sources, including proprietary IoT devices.",
      "Integrated XLSX export functionality across multiple internal applications.",
      "Established testing guidelines and increased unit and application test coverage by 75%, significantly reducing production bugs.",
    ],
  },
];

export const education = [
  { school: "Lambda School", program: "Computer Science" },
  { school: "The University of Akron", program: "Bachelor of Science, Accounting" },
];

export const skills = {
  frontend: [
    "TypeScript",
    "React",
    "React Native",
    "NextJS",
    "Redux",
    "Zustand",
    "Tanstack Query",
    "Tailwind",
    "Zod",
  ],
  backend: [
    "Node",
    "Express",
    "Serverless",
    "PostgreSQL",
    "Supabase",
    "Netlify Functions",
    "Docker",
  ],
};

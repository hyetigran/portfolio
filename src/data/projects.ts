export type ProjectCategory = "mobile" | "web" | "payments" | "infra";

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  name: string;
  blurb: string;
  years: string;
  categories: ProjectCategory[];
  stack: string[];
  metrics?: ProjectMetric[];
  href?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "amp-pay",
    name: "Amp Pay",
    blurb:
      "Cross-platform mobile wallet for managing and spending on-chain assets. Owned payments, balances, and the full app redesign.",
    years: "2024–26",
    categories: ["mobile", "payments"],
    stack: ["React Native", "Expo", "Supabase", "Solana"],
    metrics: [{ label: "users", value: "20,000+" }],
    href: "https://apps.apple.com/us/app/amp-pay-spend-save-trade/id6745053797",
    featured: true,
  },
  {
    slug: "hedgehog-markets",
    name: "Hedgehog Markets",
    blurb:
      "Decentralized prediction marketplace. Rebuilt the storage layer and automated market creation from the Polymarket API.",
    years: "2022–24",
    categories: ["web"],
    stack: ["Next.js", "IPFS", "Firebase", "Tailwind"],
    metrics: [{ label: "load time", value: "8s → 1.9s" }],
    href: "https://hedgehog.markets",
    featured: true,
  },
  {
    slug: "swaps-app",
    name: "Swaps.app",
    blurb:
      "Enterprise currency-swap widget + admin. Hardened the API against attacks and shipped the admin frontend.",
    years: "2021",
    categories: ["web", "payments"],
    stack: ["React", "Node", "Postgres"],
    href: "https://swaps.app",
  },
  {
    slug: "paragon-robotics",
    name: "Paragon Robotics",
    blurb: "Custom reporting over IoT and proprietary data sources.",
    years: "2020–21",
    categories: ["web", "infra"],
    stack: ["JavaScript", "XLSX"],
    href: "https://paragonrobotics.com/",
  },
];

import Link from "next/link";
import { person, available } from "@/data/resume";
import { links } from "@/data/links";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/project-card";
import { HeroField } from "@/components/hero-field";

const specRow = "flex justify-between py-2.5 border-b border-white/6";

export default function Home() {
  const featured = projects.filter((p) => p.featured);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_380px] border-b border-white/8">
        <HeroField />
        <div className="relative z-[1] px-6 sm:px-10 py-14 sm:py-16 lg:border-r border-white/8">
          <div className="font-mono text-[11.5px] tracking-[0.14em] uppercase text-ink-faint mb-6">
            {person.role} · {person.location}
          </div>
          <h1 className="font-mono font-light text-4xl sm:text-5xl lg:text-[58px] leading-[1.08] tracking-[-0.03em] text-ink max-w-[15ch] text-pretty">
            I build software
            <br />
            that holds up
            <br />
            in production
            <span className="inline-block w-[0.55em] text-accent animate-pulse">
              _
            </span>
          </h1>
          <p className="mt-7 max-w-[56ch] font-sans font-light text-[16.5px] leading-[1.65] text-ink-dim text-pretty">
            {person.heroSummary}
          </p>
          <div className="flex flex-wrap gap-3 mt-9">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-surface font-mono font-medium text-[13px] transition-opacity hover:opacity-85"
            >
              view work →
            </Link>
            <a
              href={links.resumePdf}
              download
              className="inline-flex items-center gap-2 px-5 py-3 border border-white/16 text-ink font-mono text-[13px] transition-colors hover:border-white/40"
            >
              download resume
            </a>
          </div>
        </div>

        <div className="relative z-[1] px-8 py-9 font-mono text-[12.5px] bg-surface/72 backdrop-blur-[2px]">
          <div className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-5">
            spec
          </div>
          <div className={specRow}>
            <span className="text-ink-faint">experience</span>
            <span>{person.experienceYears}</span>
          </div>
          <div className={specRow}>
            <span className="text-ink-faint">focus</span>
            <span>{person.focus}</span>
          </div>
          <div className={specRow}>
            <span className="text-ink-faint">shipped to</span>
            <span>{person.shippedTo}</span>
          </div>
          <div className={specRow}>
            <span className="text-ink-faint">timezone</span>
            <span>{person.timezone}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-ink-faint">status</span>
            <span className={available ? "text-accent" : "text-ink-faint"}>
              {available ? "available" : "not available"}
            </span>
          </div>

          <div className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mt-7 mb-3.5">
            stack
          </div>
          <div className="flex flex-wrap gap-1.5">
            {person.stackHighlights.map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 border border-white/11 text-ink-dim text-[11.5px]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-10 py-12 sm:py-14">
        <div className="flex items-baseline justify-between mb-6 font-mono text-[11.5px]">
          <span className="text-ink-faint tracking-[0.14em] uppercase">
            selected work — {String(featured.length).padStart(2, "0")} /{" "}
            {String(projects.length).padStart(2, "0")}
          </span>
          <Link
            href="/work"
            className="text-ink cursor-pointer transition-colors hover:text-accent"
          >
            all projects →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} size="lg" />
          ))}
        </div>
      </section>
    </div>
  );
}

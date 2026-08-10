import type { Project } from "@/data/projects";
import { PlaceholderMedia } from "./placeholder-media";

export function ProjectCard({
  project,
  size = "md",
}: {
  project: Project;
  size?: "lg" | "md";
}) {
  const isLg = size === "lg";

  const className = `block border border-white/9 transition-colors hover:border-white/28 ${
    isLg ? "bg-panel" : "bg-surface hover:bg-panel"
  } ${project.href ? "cursor-pointer" : ""}`;

  const content = (
    <>
      <PlaceholderMedia label="screenshot" aspect={isLg ? "16/10" : "4/3"} />
      <div className={isLg ? "p-5" : "p-[22px]"}>
        <div className="flex items-baseline justify-between gap-3">
          <span
            className={`font-mono font-medium text-ink ${
              isLg ? "text-base" : "text-[15px]"
            }`}
          >
            {project.name}
          </span>
          <span className="font-mono text-[11px] text-ink-faint shrink-0">
            {project.years}
          </span>
        </div>
        <p
          className={`mt-2.5 font-sans font-light text-ink-dim ${
            isLg ? "text-[13.5px] leading-[1.55]" : "text-[13px] leading-[1.55]"
          }`}
        >
          {project.blurb}
        </p>
        {project.metrics && project.metrics.length > 0 && (
          <div className="flex gap-4 mt-3 font-mono text-[11.5px]">
            {project.metrics.map((m) => (
              <span key={m.label} className="text-accent">
                {m.value}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 mt-3.5 font-mono text-[10.5px] text-ink-faint/90">
          {project.stack.map((tech) => (
            <span key={tech} className="px-1.5 py-1 bg-white/5">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  if (project.href) {
    return (
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

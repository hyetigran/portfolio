"use client";

import { useState } from "react";
import { projects, type ProjectCategory } from "@/data/projects";
import { ProjectCard } from "@/components/project-card";

const categories: ProjectCategory[] = ["mobile", "web", "payments", "infra"];

export default function Work() {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");

  const visible =
    filter === "all"
      ? projects
      : projects.filter((p) => p.categories.includes(filter));

  const countFor = (category: ProjectCategory) =>
    projects.filter((p) => p.categories.includes(category)).length;

  return (
    <div className="px-6 sm:px-10">
      <div className="py-10 sm:py-11 border-b border-white/8">
        <h1 className="font-mono font-light text-3xl sm:text-[34px] tracking-[-0.02em] text-ink">
          Work
        </h1>
        <p className="mt-3.5 max-w-[60ch] font-sans font-light text-[15px] leading-[1.6] text-ink-dim">
          Production systems, shipped and maintained.
        </p>
        <div className="flex items-center gap-2 mt-7 font-mono text-[11.5px] flex-wrap">
          <span className="text-ink-faint mr-1.5">filter:</span>
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1.5 cursor-pointer transition-colors ${
              filter === "all"
                ? "bg-accent text-surface"
                : "border border-white/13 text-ink-dim hover:border-white/35 hover:text-ink"
            }`}
          >
            all · {String(projects.length).padStart(2, "0")}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-2.5 py-1.5 cursor-pointer transition-colors ${
                filter === category
                  ? "bg-accent text-surface"
                  : "border border-white/13 text-ink-dim hover:border-white/35 hover:text-ink"
              }`}
            >
              {category} · {String(countFor(category)).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/8 my-px">
        {visible.map((project) => (
          <ProjectCard key={project.slug} project={project} size="md" />
        ))}
        <div className="flex items-center justify-center p-[22px] border border-dashed border-white/12 text-center font-mono text-[11.5px] leading-[1.6] text-ink-faint">
          <div>
            + new project
            <br />
            <span className="text-[10.5px] text-ink-faint/70">
              cards fill in as you add them
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

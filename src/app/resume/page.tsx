import { person, experience, education, skills } from "@/data/resume";
import { links } from "@/data/links";

export default function Resume() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
      <aside className="px-6 sm:px-8 py-11 lg:border-r border-b lg:border-b-0 border-white/8 font-mono text-xs">
        <div className="font-mono font-light text-2xl leading-[1.15] tracking-[-0.02em] text-ink">
          {person.name.split(" ").map((part, i) => (
            <span key={part}>
              {part}
              {i === 0 && <br />}
            </span>
          ))}
        </div>
        <div className="mt-3 text-ink-faint text-[11.5px]">{person.role}</div>
        <div className="mt-7 flex flex-col gap-2.5 text-ink-dim text-xs">
          <span>{person.location}</span>
        </div>

        <div className="mt-8 pt-5 border-t border-white/8 text-ink-faint text-[10.5px] tracking-[0.12em] uppercase">
          Skills
        </div>
        <div className="mt-3.5 flex flex-col gap-3 text-xs leading-[1.7] text-ink-dim">
          <div>
            <div className="text-ink-faint text-[11px] mb-1">frontend</div>
            {skills.frontend.join(" · ")}
          </div>
          <div>
            <div className="text-ink-faint text-[11px] mb-1">backend</div>
            {skills.backend.join(" · ")}
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-white/8 text-ink-faint text-[10.5px] tracking-[0.12em] uppercase">
          Education
        </div>
        <div className="mt-3.5 text-xs leading-[1.7] text-ink-dim">
          {education.map((entry) => (
            <div key={entry.school}>
              {entry.school} — {entry.program}
            </div>
          ))}
        </div>

        <a
          href={links.resumePdf}
          download
          className="mt-8 inline-flex px-4 py-2.5 border border-white/16 text-ink text-xs cursor-pointer transition-colors hover:border-white/40"
        >
          download PDF ↓
        </a>
      </aside>

      <div className="px-6 sm:px-11 py-11">
        <div className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-ink-faint">
          Experience
        </div>

        <div className="mt-6.5">
          {experience.map((entry, i) => (
            <div
              key={entry.company}
              className={`pb-7 ${
                i < experience.length - 1
                  ? "mt-7 border-b border-white/7"
                  : "mt-7"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div className="font-mono font-medium text-lg sm:text-xl text-ink">
                  {entry.company}{" "}
                  <span className="font-normal text-[15px] text-ink-faint">
                    — {entry.role}
                  </span>
                </div>
                <div className="font-mono text-xs text-ink-faint">
                  {entry.start} — {entry.end}
                </div>
              </div>
              <p className="mt-3 max-w-[78ch] font-sans font-light text-sm leading-[1.6] text-ink-dim">
                {entry.summary}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3.5 font-mono text-[10.5px] text-ink-faint">
                {entry.stack.map((tech) => (
                  <span key={tech} className="px-2 py-1 bg-white/5">
                    {tech}
                  </span>
                ))}
              </div>
              <ul className="mt-4.5 flex flex-col gap-2.5 font-sans font-light text-sm leading-[1.6] text-ink-dim/90 max-w-[82ch]">
                {entry.bullets.map((bullet) => (
                  <li key={bullet} className="grid grid-cols-[18px_1fr] gap-1">
                    <span className="text-accent">›</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

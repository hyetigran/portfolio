import { links } from "@/data/links";

export function Footer() {
  return (
    <footer className="flex items-center justify-between px-6 sm:px-10 h-14 border-t border-white/8 font-mono text-xs text-ink-faint">
      <span>© {new Date().getFullYear()} Tigran Asriyan</span>
      <div className="flex items-center gap-5">
        <a
          href={links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer transition-colors hover:text-ink"
        >
          github
        </a>
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer transition-colors hover:text-ink"
        >
          linkedin
        </a>
      </div>
    </footer>
  );
}

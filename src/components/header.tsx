"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { available } from "@/data/resume";
import { links } from "@/data/links";

const navLink = "cursor-pointer transition-colors hover:text-ink";
const navLinkActive = "text-accent";
const navLinkInactive = "text-ink-dim";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between px-6 sm:px-10 h-14 border-b border-white/8 font-mono text-[12.5px] font-medium">
      <Link href="/" className="flex items-center gap-2.5">
        <span
          className="w-1.5 h-1.5 rounded-full bg-accent"
          style={{ boxShadow: "0 0 10px var(--color-accent)" }}
        />
        <span className="tracking-[0.02em] text-ink">tigran.asriyan</span>
      </Link>

      <nav className="flex items-center gap-5 sm:gap-6">
        <Link
          href="/work"
          className={`${navLink} ${
            pathname.startsWith("/work") ? navLinkActive : navLinkInactive
          }`}
        >
          work
        </Link>
        <Link
          href="/resume"
          className={`${navLink} ${
            pathname.startsWith("/resume") ? navLinkActive : navLinkInactive
          }`}
        >
          resume
        </Link>
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={`${navLink} ${navLinkInactive}`}
        >
          contact
        </a>

        {available && (
          <>
            <span className="hidden sm:block w-px h-3.5 bg-white/12" />
            <span className="hidden sm:inline text-accent text-[11.5px]">
              ● open to senior roles
            </span>
          </>
        )}
      </nav>
    </header>
  );
}

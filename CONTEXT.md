# Portfolio

Tigran Asriyan's personal developer portfolio site — a showcase site for shipped project work and professional experience, not an application with users of its own.

## Language

**Project**:
A piece of shipped work displayed on the site — title, dates, tech stack tags, optional metrics, an external link (live site or store listing), and an image. Sourced from `src/data/projects.ts`.
_Avoid_: Case study (no case-study detail pages exist in v1 — see ADR-0002), work item

**Selected work**:
The subset of Projects shown on the home page as a short preview, not the full list.
_Avoid_: Featured projects

**Work index**:
The `/work` page listing every Project in a filterable grid.
_Avoid_: Portfolio page, projects page

**Available**:
A single boolean flag (in `src/data/resume.ts`) gating whether the site shows "open to senior roles" — drives both the header status badge and the hero/resume copy together. Not a per-project or per-page setting.
_Avoid_: Open to work, hiring status

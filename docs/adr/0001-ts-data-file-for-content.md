# TS data file for content, not a CMS or MDX

Project and resume content (copy, work history, metrics) is sourced from a single typed TS file (`src/data/projects.ts`, `src/data/resume.ts`) rather than a CMS or MDX-per-project. This is a solo portfolio whose content changes rarely; a data file needs no extra infrastructure and keeps every field type-checked at build time. MDX per project was considered for richer long-form case-study writing but rejected because v1 has no case-study pages at all (see ADR-0002) — there's no long-form content to author yet.

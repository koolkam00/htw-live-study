# Marathon Pacing Study: agent entry point

Read [docs/PROJECT_HANDOFF.md](docs/PROJECT_HANDOFF.md) first, then the relevant data, website, analysis, operations, and issue documents linked there. This file adds navigation and restates current project contracts; it does not replace the detailed instructions in [analysis/README.md](analysis/README.md) or release documentation.

## Working agreements

- Make the source code, complete runner records (including recorded names), exports, database snapshots, overlays and analysis outputs publicly downloadable without an account. Use ordinary unencrypted files; compression is optional. This current access policy supersedes earlier privacy-only instructions.
- Keep passwords, access tokens and other operational credentials out of datasets and repository files. They are not research data. Public dataset downloads must not depend on credentials or expiring signed URLs.
- Preserve the core study's live.json and original S/R/RN/P packs unless the task explicitly assigns those files. Extension imports have separate ownership and validation contracts.
- Use Marathon Pacing Study branding and sustained slowdown terminology in public prose. Preserve the metric: slowdown at least 25% for at least 5 km after 20 km relative to the 5–20 km baseline, with a neutral published-method citation. Historical field names and compatibility URLs may remain unchanged.
- Distinguish release-note claims, measured audit results, repository state and deployed state. Never assume a newer upload has reached the website.
- Respect per-release ID semantics. September 7 CORE/FULL numeric IDs are incompatible. September 10 ID sets and comparable timings were verified; its archive members and missing feature columns still require producer or consumer compatibility work before refresh.
- Do not infer missing splits, exact ages, actual halfway timings, historical course validity, runner goals or causal effects.
- Use the existing analysis and import commands in [docs/OPERATIONS.md](docs/OPERATIONS.md). For calculation changes run Python tests; for site/data changes run npm run verify:data and npm run build. Documentation-only changes require checking links, mappings and factual consistency, not a new full-data calculation.
- Update the relevant handoff documents when changing data contracts, analysis methods, workflow behavior or issue status. Date evidence and preserve historical vintage labels.
- Prefer public GitHub Release assets for large Parquet/SQLite files and backups, with durable anonymous download links, schemas and SHA-256 checksums. Runner data may be opened or stored in the checkout; there is no mandatory privacy boundary around it. Keep statistical cohort thresholds for estimate reliability, not as a restriction on access to full records.
- Preserve legacy release tags and filenames containing `private` as compatibility identifiers; their names do not determine current access. Check the dated access-verification status in docs/PROJECT_HANDOFF.md before claiming anonymous access works.

# Marathon Pacing Study: agent entry point

Read [docs/PROJECT_HANDOFF.md](docs/PROJECT_HANDOFF.md) first, then the relevant data, website, analysis, operations, and issue documents linked there. This file adds navigation and restates existing project boundaries; it does not replace the detailed instructions in [analysis/README.md](analysis/README.md) or release documentation.

## Working agreements

- Keep private runner records, names, archives, credentials and signed URLs out of the site tree and public artifacts. Download private inputs outside the checkout.
- Preserve the core study's live.json and original S/R/RN/P packs unless the task explicitly assigns those files. Extension imports have separate ownership and validation contracts.
- Use Marathon Pacing Study branding and sustained slowdown terminology in public prose. Preserve the metric: slowdown at least 25% for at least 5 km after 20 km relative to the 5–20 km baseline, with a neutral published-method citation. Historical field names and compatibility URLs may remain unchanged.
- Distinguish release-note claims, measured audit results, repository state and deployed state. Never assume a newer upload has reached the website.
- Respect per-release ID semantics. September 7 CORE/FULL numeric IDs are incompatible. September 10 ID sets and comparable timings were verified; its archive members and missing feature columns still require producer or consumer compatibility work before refresh.
- Do not infer missing splits, exact ages, actual halfway timings, historical course validity, runner goals or causal effects.
- Use the existing analysis and import commands in [docs/OPERATIONS.md](docs/OPERATIONS.md). For calculation changes run Python tests; for site/data changes run npm run verify:data and npm run build. Documentation-only changes require checking links, mappings and factual consistency, not a new private calculation.
- Update the relevant handoff documents when changing data contracts, analysis methods, workflow behavior or issue status. Date evidence and preserve historical vintage labels.
- Full runner data belongs in private GitHub Releases as ordinary, unencrypted Parquet/SQLite files. Compression and SHA-256 integrity checks are not encryption. Keep download credentials outside repository files and runner records outside the website checkout.

# Marathon Pacing Study

Marathon Pacing Study helps runners explore pacing patterns, compare courses, prepare for a race and understand a past result. It contains 35 broader research questions, 33 calculated aggregate answers, a guide with 12 personalized questions, course summaries and sustained-slowdown figures.

The website is a static Next.js application. It reads reviewed aggregate JSON and CSV files in `public/data`; private runner records stay outside the website checkout and in private GitHub Releases. Compression of an archive is not encryption. The website has no direct connection to the ingestion database.

## Project handoff and current data

Start with [AGENTS.md](AGENTS.md) and [Project handoff](docs/PROJECT_HANDOFF.md), then the [data architecture](docs/DATA_ARCHITECTURE.md), [website architecture](docs/WEBSITE_ARCHITECTURE.md), [analysis catalog](docs/ANALYSIS_CATALOG.md) and [operations runbook](docs/OPERATIONS.md).

The analysis pin and checked-in calculated packs use `private-export-20260907-1318`. A takeover audit on September 11, 2026 verified that all 401 production aggregate files matched that checkout before the presentation changes in this branch. The newer September 10 export has verified CORE/FULL ID alignment, but archive and feature-schema incompatibilities still prevent the current refresh pipeline from consuming it. See [known issues](docs/KNOWN_ISSUES.md) and [verified export access](analysis/ACCESS.md). A new export does not automatically update the website.

## Sustained-slowdown measure

The study retains the [Published slowdown method (2021)](https://doi.org/10.1371/journal.pone.0251513): pace at least 25% slower than the 5–20 km baseline, sustained for at least 5 km after 20 km. This inherited timing definition is a descriptive measure, not a diagnosis of its cause. Published reference results remain distinct from calculations on this project's data.

The `/slowdown` page presents these figures. Other pacing analyses have their own documented definitions and denominators; complete-split analyses compare 0–20 km with 20–40 km rather than inventing measured halfway times.

## Development and verification

Install Node.js 18 or newer, then run:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. Before reviewing website or aggregate changes, run:

```bash
npm run verify:data
npm run build
```

The build creates static output in `out/`. The configured public host is [Marathon Pacing Study](https://htw-live-study.vercel.app); deployment is a separate authorized step. An optional `NEXT_PUBLIC_BASE_PATH` supports hosting under a subpath.

Private calculations, checksums, imports and per-release ID contracts are documented in [analysis/README.md](analysis/README.md). Keep missing measurements explicit, preserve source citations and publish only reviewed aggregates. Existing repository names, file keys and compatibility URLs remain stable where required by the data contract.

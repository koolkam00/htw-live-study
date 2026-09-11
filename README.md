# Marathon Pacing Study

Marathon Pacing Study helps runners explore pacing patterns, compare courses, prepare for a race and understand a past result. The main experience presents ten ranked analyses, one question per page at `/analyses/{slug}`, with comparisons that respond to the supported course, time, age, recorded gender and earlier-performance controls. The [ten-analysis guide](docs/TOP_TEN_ANALYSES.md) maps each question to its methods and limits. The wider 35-question catalog, 33 calculated broad packs, course summaries and sustained-slowdown figures remain a research archive; the shared personalized engine retains 12 calculation paths.

The website is a static Next.js application that renders aggregate JSON and CSV files in `public/data`. Project policy makes the source code, complete runner records, database snapshots, exports and overlays available for anyone to open and download without an account. Use ordinary unencrypted Parquet/SQLite files; compression is optional. Large binary datasets are best distributed through public [GitHub Releases](https://github.com/koolkam00/htw-live-study/releases). The website has no direct connection to the ingestion database.

See the dated [public-access verification status](docs/PROJECT_HANDOFF.md#public-access-policy-and-verification) for the latest anonymous-download checks. Legacy tags containing `private` are retained identifiers, not access requirements.

## Project handoff and current data

Start with [AGENTS.md](AGENTS.md) and [Project handoff](docs/PROJECT_HANDOFF.md), then the [data architecture](docs/DATA_ARCHITECTURE.md), [website architecture](docs/WEBSITE_ARCHITECTURE.md), [analysis catalog](docs/ANALYSIS_CATALOG.md) and [operations runbook](docs/OPERATIONS.md).

The analysis pin and checked-in calculated packs use `private-export-20260907-1318`. The personalized pack was recalculated on September 11 from that same input to support every whole-minute target from 1:30 through 12:00; this does not adopt the September 10 export. The initial comparison is an explicitly labeled All courses / 4:00 example, with all ages, all recorded genders and no earlier time. Sparse cohorts can remain unavailable anywhere in the supported range, especially at its extremes. A takeover audit on September 11, 2026 verified that all 401 production aggregate files matched that checkout before the September 11 presentation changes. The newer September 10 export has verified CORE/FULL ID alignment, but archive and feature-schema incompatibilities still prevent the current refresh pipeline from consuming it. See [known issues](docs/KNOWN_ISSUES.md) and [verified export access](analysis/ACCESS.md). A new export does not automatically update the website.

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

Calculations, checksums, imports and per-release ID contracts are documented in [analysis/README.md](analysis/README.md). Keep missing measurements explicit, preserve source citations and make the full underlying data available alongside the chart aggregates. Existing repository names, file keys and compatibility URLs remain stable where required by the data contract.

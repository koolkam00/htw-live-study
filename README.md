# HTW live study

Public live-study recreation of Barry Smyth (2021) PLOS ONE:
“How recreational marathon runners hit the wall” (10.1371/journal.pone.0251513).

This is a static, public site with no authentication. It reads a single JSON file to populate
six live figures and basic corpus stats. Until live data exist, the site shows an honest
empty/loading state — no numbers are invented.

## Methodology (HTW definition)

- Base pace = mean pace across 5–10 km, 10–15 km, 15–20 km splits
- HTW = slowdown ≥25% vs. base pace, sustained ≥5 km, after 20 km

See `/methodology` for full details.

## Data contract

The app reads `public/data/live.json`:

```json
{
  "status": "empty" | "ready",
  "as_of": "2026-08-31T00:00:00Z" | null,
  "definition": { "dos": 0.25, "los_km": 5 },
  "corpus": { "races": number|null, "runners": number|null, "records": number|null },
  "figures": { "fig1": {}, "fig2": {}, "fig3": {}, "fig4": {}, "fig5": {}, "fig6": {} }
}
```

Start with `status: "empty"`. When moving to `"ready"`, provide data in a shape that the components
understand (e.g., `series: [{ "name": "label", "value": 0.0 }]`). Live figures never reuse the
paper's 2021 numbers; any comparison redraws must be labeled “2021 published”.

## Development

Prereqs: Node 18+

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build and static export

This project is configured for static export, suitable for GitHub Pages.

```bash
npm run build    # emits static site to out/
```

To deploy on GitHub Pages for a repository `<owner>/<repo>`, set:

```bash
# Optional: set a base path if served from a subpath like /<repo>
echo 'NEXT_PUBLIC_BASE_PATH=/<repo>' > .env.production
npm run build
```

Then publish the `out/` directory (e.g., to the `gh-pages` branch or to `docs/` on `main`).

## Notes

- Do not invent live numbers. The default `public/data/live.json` ships with `status: "empty"`.
- Any S1 redraw for comparison must be clearly labeled “2021 published”.

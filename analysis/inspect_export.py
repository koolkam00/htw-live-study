"""Write schema and coverage diagnostics without exporting individual records."""
import argparse
import json
import shutil
import re
from pathlib import Path

import duckdb


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    db = duckdb.connect()
    db.execute("SET memory_limit='4GB'")
    db.execute('SET threads=2')
    db.execute('SET temp_directory=?', [str(args.input / 'inspection-temp')])
    report = {}
    for path in sorted(args.input.glob("*.parquet")):
        schema = db.execute("DESCRIBE SELECT * FROM read_parquet(?)", [str(path)]).fetchall()
        quoted_names = ['"' + row[0].replace('"', '""') + '"' for row in schema]
        counts = db.execute('SELECT count(*), ' + ', '.join(f'count({name})' for name in quoted_names) + ' FROM read_parquet(?)', [str(path)]).fetchone()
        count = counts[0]
        columns = []
        for index, (name, kind, *_) in enumerate(schema):
            populated = counts[index + 1]
            columns.append({"name": name, "type": kind, "non_null": populated})
        report[path.name] = {"rows": count, "columns": columns}
        if path.name == 'features.parquet':
            identifiers = {}
            for (name, kind, *_), quoted in zip(schema, quoted_names):
                if re.search(r'(^id$|^(runner|athlete|person|participant)$|(runner|athlete|person|participant).*(id|key))', name, re.I) and not any(x in kind for x in ['[]','STRUCT','MAP']):
                    distinct, repeated = db.execute(f'SELECT count(*), count(*) FILTER(WHERE n>1) FROM (SELECT {quoted},count(*) AS n FROM read_parquet(?) WHERE {quoted} IS NOT NULL GROUP BY {quoted})', [str(path)]).fetchone()
                    identifiers[name] = {'distinct_non_null':distinct, 'values_with_multiple_rows':repeated}
            report[path.name]['identifier_coverage'] = identifiers
            available = {row[0] for row in schema}
            scope = {}
            for name in ['city','race','year']:
                if name in available:
                    scope[f'distinct_{name}'] = db.execute(f'SELECT count(DISTINCT "{name}") FROM read_parquet(?)',[str(path)]).fetchone()[0]
            if 'year' in available:
                scope['year_min'], scope['year_max'] = db.execute('SELECT min(try_cast(year AS INTEGER)),max(try_cast(year AS INTEGER)) FROM read_parquet(?)',[str(path)]).fetchone()
            report[path.name]['coverage'] = scope
    (args.output / "schema-coverage.json").write_text(json.dumps(report, indent=2) + "\n")
    # These documentation files stay in a private workflow artifact, never in public/.
    for name in ["README.md", "MANIFEST.json", "OUTSIDE-AGENT-PASTE-BRIEF.md", "provenance.json"]:
        if (args.input / name).exists():
            shutil.copyfile(args.input / name, args.output / name)
    print("Schema and coverage inspection complete. No runner rows exported.")


if __name__ == "__main__":
    main()

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
            if {'split_mode_in','runner_id','is_ambiguous','is_repeater','runner_race_seq','ability','finish_time','pb_time'} <= available:
                mode_rows = db.execute('SELECT split_mode_in,count(*) FROM read_parquet(?) GROUP BY split_mode_in ORDER BY count(*) DESC',[str(path)]).fetchall()
                report[path.name]['split_modes'] = [{'mode':mode,'rows':n} for mode,n in mode_rows]
                names = ['ambiguous_rows','linked_rows','repeater_rows','first_observed_rows_with_ability','ability_equals_current_finish','pb_equals_current_finish']
                values = db.execute('''SELECT
                  count(*) FILTER(WHERE is_ambiguous),
                  count(*) FILTER(WHERE runner_id IS NOT NULL),
                  count(*) FILTER(WHERE is_repeater),
                  count(*) FILTER(WHERE runner_race_seq=1 AND ability IS NOT NULL),
                  count(*) FILTER(WHERE abs(ability-finish_time)<1e-8),
                  count(*) FILTER(WHERE abs(pb_time-finish_time)<1e-8)
                  FROM read_parquet(?)''',[str(path)]).fetchone()
                report[path.name]['history_diagnostics'] = dict(zip(names,values))
            conditions = args.input / 'race_conditions.parquet'
            if conditions.exists() and {'city','year'} <= available:
                # The supplied brief explicitly defines the overlay join by city/year.
                dates = db.execute('''WITH dates AS (
                  SELECT city,year,min(try_cast(race_date AS DATE)) AS race_date
                  FROM read_parquet(?) GROUP BY city,year
                  HAVING count(DISTINCT try_cast(race_date AS DATE))=1
                ) SELECT count(*),count(*) FILTER(WHERE dates.race_date IS NOT NULL)
                  FROM read_parquet(?) f LEFT JOIN dates USING(city,year)''',[str(conditions),str(path)]).fetchone()
                report[path.name]['date_join_coverage'] = {'feature_rows':dates[0],'rows_with_unambiguous_overlay_date':dates[1]}
    (args.output / "schema-coverage.json").write_text(json.dumps(report, indent=2) + "\n")
    # Include source documentation with the inspection report.
    for name in ["README.md", "MANIFEST.json", "OUTSIDE-AGENT-PASTE-BRIEF.md", "provenance.json"]:
        if (args.input / name).exists():
            shutil.copyfile(args.input / name, args.output / name)
    print("Schema and coverage inspection complete. No runner rows exported.")


if __name__ == "__main__":
    main()

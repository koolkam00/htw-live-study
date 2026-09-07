"""Write schema and coverage diagnostics without exporting individual records."""
import argparse
import json
import shutil
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
    report = {}
    for path in sorted(args.input.glob("*.parquet")):
        schema = db.execute("DESCRIBE SELECT * FROM read_parquet(?)", [str(path)]).fetchall()
        count = db.execute("SELECT count(*) FROM read_parquet(?)", [str(path)]).fetchone()[0]
        columns = []
        for name, kind, *_ in schema:
            quoted = '"' + name.replace('"', '""') + '"'
            populated = db.execute(f"SELECT count({quoted}) FROM read_parquet(?)", [str(path)]).fetchone()[0]
            columns.append({"name": name, "type": kind, "non_null": populated})
        report[path.name] = {"rows": count, "columns": columns}
    (args.output / "schema-coverage.json").write_text(json.dumps(report, indent=2) + "\n")
    # These documentation files stay in a private workflow artifact, never in public/.
    for name in ["README.md", "MANIFEST.json", "OUTSIDE-AGENT-PASTE-BRIEF.md", "provenance.json"]:
        if (args.input / name).exists():
            shutil.copyfile(args.input / name, args.output / name)
    print("Schema and coverage inspection complete. No runner rows exported.")


if __name__ == "__main__":
    main()

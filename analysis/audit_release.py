"""Audit synchronized release tables, source units and optional prior-snapshot deltas.

Writes aggregate evidence only. Inputs must first pass download_release.py.
"""
import argparse
import hashlib
import json
from pathlib import Path

import duckdb
from build_pacing import FIELDS, records
from download_release import EXPECTED


def digest(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def audit(source, core, previous, output):
    db = duckdb.connect()
    db.execute("SET memory_limit='2GB'")
    db.execute('SET threads=2')
    db.execute('SET temp_directory=?', [str(output.parent / 'audit-temp')])
    output.parent.mkdir(parents=True, exist_ok=True)
    manifest = json.loads((source/'MANIFEST.json').read_text())
    provenance = json.loads((source/'provenance.json').read_text())
    assert digest(source/'MANIFEST.json') == provenance['manifest_sha256']
    report = {'release_tag':provenance['release_tag'], 'input_provenance':provenance,
              'audit_script_sha256':digest(__file__), 'member_sha256':{}, 'manifest_size_notes':[]}
    # A manifest need not list its own size/hash: compare it independently too.
    report['member_sha256']['MANIFEST.json'] = digest(source/'MANIFEST.json')
    for file, entry in manifest['files'].items():
        path = source/file
        assert path.is_file(), file
        report['member_sha256'][file] = digest(path)
        if path.stat().st_size != entry.get('bytes'):
            report['manifest_size_notes'].append({'file':file, 'reported':entry.get('bytes'), 'actual':path.stat().st_size})
            assert file == 'MANIFEST.json', f'Unexpected member size mismatch: {file}'
    for name, file in [('r','race_records'),('f','features'),('w','race_conditions'),('cp','course_profiles')]:
        location = str(source/(file+'.parquet')).replace("'", "''")
        db.execute(f"CREATE VIEW {name} AS SELECT * FROM read_parquet('{location}')")
    for table, key in [('r','id'),('f','record_id')]:
        report[table+'_ids'] = records(db, f'SELECT count(*) AS rows,count({key}) AS non_null,count(DISTINCT {key}) AS unique_ids FROM {table}')[0]
        assert len(set(report[table+'_ids'].values())) == 1
    assert report['r_ids']['rows'] == report['f_ids']['rows'] == manifest['n_records']
    report['alignment'] = records(db, '''SELECT count(*) AS joined,
      count(*) FILTER(WHERE r.id IS NULL OR f.record_id IS NULL) AS unmatched,
      count(*) FILTER(WHERE r.city IS DISTINCT FROM f.city OR r.year IS DISTINCT FROM f.year OR r.race IS DISTINCT FROM f.race) AS edition_mismatch,
      count(*) FILTER(WHERE r.runner IS DISTINCT FROM f.runner_name) AS name_mismatch,
      count(*) FILTER(WHERE r.age IS DISTINCT FROM f.age) AS age_mismatch
      FROM r FULL JOIN f ON r.id=f.record_id''')[0]
    assert all(report['alignment'][k] == 0 for k in ['unmatched','edition_mismatch','name_mismatch','age_mismatch'])
    report['sex_normalization'] = records(db, '''SELECT coalesce(r.sex,'NULL') AS raw_sex,
      coalesce(f.sex,'NULL') AS feature_sex,count(*) AS rows FROM r JOIN f ON r.id=f.record_id
      WHERE r.sex IS DISTINCT FROM f.sex GROUP BY ALL ORDER BY rows DESC''')
    db.execute(r"""CREATE MACRO seconds(s) AS (CASE
      WHEN regexp_full_match(trim(s),'[0-9]{1,3}:[0-5][0-9]:[0-5][0-9](\.[0-9]+)?')
      THEN try_cast(split_part(trim(s),':',1) AS DOUBLE)*3600+try_cast(split_part(trim(s),':',2) AS DOUBLE)*60+try_cast(split_part(trim(s),':',3) AS DOUBLE)
      WHEN regexp_full_match(trim(s),'[0-9]{1,4}:[0-5][0-9](\.[0-9]+)?')
      THEN try_cast(split_part(trim(s),':',1) AS DOUBLE)*60+try_cast(split_part(trim(s),':',2) AS DOUBLE) ELSE NULL END)""")
    cumulatives = ['cum_'+x for x in ['05','10','15','20','25','30','35','40']] + ['finish_time']
    report['timings'] = []
    for raw, feature in zip(FIELDS,cumulatives):
        row = records(db, f'''SELECT count(*) FILTER(WHERE seconds(r.{raw}) IS NOT NULL AND f.{feature} IS NOT NULL) AS comparable,
          count(*) FILTER(WHERE abs(seconds(r.{raw})-f.{feature}*60)>0.001) AS mismatches,
          count(*) FILTER(WHERE f.valid_splits AND (seconds(r.{raw}) IS NULL OR f.{feature} IS NULL OR abs(seconds(r.{raw})-f.{feature}*60)>0.001)) AS valid_mismatches,
          max(abs(seconds(r.{raw})-f.{feature}*60)) AS max_error_seconds
          FROM r JOIN f ON r.id=f.record_id''')[0]
        row.update(raw=raw, feature=feature)
        report['timings'].append(row)
        assert row['mismatches'] == row['valid_mismatches'] == 0, row
    report['coverage'] = records(db, '''SELECT count(*) AS raw_records,count(DISTINCT city) AS cities,
      count(DISTINCT (city,year)) AS race_years,max(ingested_at) AS max_ingested_at,
      count(*) FILTER(WHERE age IS NULL) AS null_age FROM r''')[0]
    report['features'] = records(db, '''SELECT count(*) FILTER(WHERE valid_splits) AS valid_splits,
      count(*) FILTER(WHERE valid_splits AND htw) AS sustained_slowdown_among_valid,
      count(*) FILTER(WHERE runner_name IS NULL) AS null_name,
      count(*) FILTER(WHERE race_date IS NOT NULL) AS supplied_dates FROM f''')[0]
    report['course_validity'] = records(db, '''SELECT count(*) AS profiles,
      count(valid_from_year) AS valid_from,count(valid_to_year) AS valid_to FROM cp''')[0]
    report['weather'] = records(db, '''SELECT count(*) AS rows,count(DISTINCT (city,year)) AS unique_editions,
      count(*) FILTER(WHERE year(try_cast(race_date AS DATE))=year) AS dates_agree FROM w''')[0]
    if core:
        shared = sorted(EXPECTED)
        assert all((core/name).is_file() and name in report['member_sha256'] for name in shared)
        report['core_full_shared_hashes_match'] = all(digest(core/name) == report['member_sha256'][name] for name in shared)
        assert report['core_full_shared_hashes_match']
    if previous:
        location = str(previous/'race_records.parquet').replace("'", "''")
        db.execute(f"CREATE VIEW previous AS SELECT * FROM read_parquet('{location}')")
        columns = [row[0] for row in db.execute('DESCRIBE r').fetchall()]
        differences = ' OR '.join(f'r."{c}" IS DISTINCT FROM p."{c}"' for c in columns if c!='id')
        report['previous_delta'] = records(db, f'''SELECT
          count(*) FILTER(WHERE p.id IS NULL) AS added,
          count(*) FILTER(WHERE r.id IS NULL) AS deleted,
          count(*) FILTER(WHERE r.id IS NOT NULL AND p.id IS NOT NULL AND ({differences})) AS changed,
          count(*) FILTER(WHERE r.id IS NOT NULL AND p.id IS NOT NULL AND NOT ({differences})) AS unchanged
          FROM r FULL JOIN previous p ON r.id=p.id''')[0]
        report['previous_release'] = json.loads((previous/'provenance.json').read_text())['release_tag']
    output.write_text(json.dumps(report,indent=2,allow_nan=False,default=str)+'\n')
    print(json.dumps({k:report[k] for k in ['release_tag','alignment','coverage','features','manifest_size_notes','previous_delta'] if k in report},indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input',type=Path,required=True)
    parser.add_argument('--core',type=Path)
    parser.add_argument('--previous',type=Path)
    parser.add_argument('--output',type=Path,required=True)
    args = parser.parse_args()
    audit(args.input,args.core,args.previous,args.output)

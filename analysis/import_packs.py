"""Validate a reviewed aggregate artifact and import only this pipeline's ext_ packs."""
import argparse
import csv
import hashlib
import io
import json
import math
import re
import shutil
import tempfile
import zipfile
from pathlib import Path

PACKS = {
    'ext_pacing_shapes': 'r10_unravel_typology',
    'ext_course_pacing_profiles': 's3_course_breaks',
    'ext_checkpoint_outcomes': 'r04_on_pace_goal_hits',
    'ext_pace_trend_at_20k': 'r03_accel_vs_decel_20k',
    'ext_late_rank_changes': 'r06_decided_after_30k',
    'ext_age_pacing': 'r22_aging_changes',
    'ext_gender_pacing': 'r23_gender_pacing',
    'ext_pacing_over_time': 'r26_pacing_over_20y',
}


def validate_archive(archive, expected_export):
    files = {}
    with zipfile.ZipFile(archive) as bundle:
        if sum(info.file_size for info in bundle.infolist()) > 20 * 1024**2:
            raise ValueError('Aggregate artifact exceeds 20 MB.')
        for info in bundle.infolist():
            if info.is_dir():
                continue
            file = info.filename
            if not re.fullmatch(r'ext_[a-z0-9_]+/(pack_meta\.json|summary\.json|tables/[a-z0-9_]+\.csv)', file):
                raise ValueError('Unexpected artifact member.')
            if file in files or file.split('/')[0] not in PACKS:
                raise ValueError('Duplicate or unowned extension pack.')
            files[file] = bundle.read(info).decode('utf-8')
    found = {name.split('/')[0] for name in files}
    if found != set(PACKS):
        raise ValueError('Expected all eight pacing packs; incomplete refresh is not imported.')
    for pack, question in PACKS.items():
        meta = json.loads(files[f'{pack}/pack_meta.json'])
        summary = json.loads(files[f'{pack}/summary.json'])
        if meta['id'] != pack or meta['question_id'] != question or meta['schema_version'] != 1 or meta['status'] != 'ready':
            raise ValueError('Pack contract mismatch.')
        if meta['input_export_id'] != expected_export:
            raise ValueError('Artifact belongs to a different export.')
        for key in ['input_asset_sha256','input_manifest_sha256','analysis_script_sha256']:
            if not re.fullmatch('[a-f0-9]{64}', meta[key]):
                raise ValueError('Missing provenance checksum.')
        cohort = meta['cohort']
        if sum(cohort[key] for key in ['duplicates_removed','missing_or_unparsed','non_increasing','outside_quality_bounds','eligible']) != cohort['raw']:
            raise ValueError('Cohort exclusions do not reconcile.')
        if not 100 <= meta['n'] <= cohort['eligible']:
            raise ValueError('Invalid analysis sample size.')
        used_tables = set()
        for chart in summary['charts']:
            filename = f"{pack}/tables/{chart['table']}"
            rows = list(csv.DictReader(io.StringIO(files[filename])))
            if not rows or set(rows[0]) & {'runner','name','id','bib','source_url'}:
                raise ValueError('Expected aggregate chart rows without identifiers.')
            for row in rows:
                if not row.get('label'):
                    raise ValueError('Missing chart label.')
                for series in chart['series']:
                    key = series['key']
                    value, n = float(row[key]), float(row[f'n_{key}'])
                    if not math.isfinite(value) or not math.isfinite(n) or n < 100 or n != int(n):
                        raise ValueError('Invalid chart value or sample count.')
            used_tables.add(filename)
        if {name for name in files if name.startswith(f'{pack}/tables/')} != used_tables:
            raise ValueError('Unreferenced table in aggregate artifact.')
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive',type=Path,required=True)
    parser.add_argument('--expected-export',required=True)
    parser.add_argument('--check-only',action='store_true')
    args = parser.parse_args()
    files = validate_archive(args.archive,args.expected_export)
    if args.check_only:
        print(f'Validated {len(PACKS)} aggregate packs for {args.expected_export}.')
        return
    output = Path(__file__).resolve().parents[1] / 'public/data/packs'
    # Validate the whole artifact before changing any site files.
    with tempfile.TemporaryDirectory(prefix='pacing-import-') as folder:
        staging = Path(folder)
        for name, content in files.items():
            destination=staging/name
            destination.parent.mkdir(parents=True,exist_ok=True)
            destination.write_text(content)
        for pack in PACKS:
            if (output/pack).exists():
                shutil.rmtree(output/pack)
            shutil.copytree(staging/pack,output/pack)
    print(f'Imported {len(PACKS)} aggregate packs. Review and commit the ext_ changes in a PR.')


if __name__ == '__main__':
    main()

"""Validate and import the current supporting study and public runner lookup."""
import argparse
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path


def run(source, destination):
    repository = Path(__file__).resolve().parent.parent
    subprocess.run(['node', str(repository/'scripts/verify-public-explorer.cjs'),
                    '--data-root', str(source.resolve())], cwd=repository, check=True)
    study = json.loads((source/'study/evidence.json').read_text())
    manifest = json.loads((source/'runners/manifest.json').read_text())
    destination.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.explorer-import-', dir=destination) as temp:
        staged = Path(temp)
        # Copy only contract members, never unrelated files beside an artifact.
        members = ['study/evidence.json', 'runners/manifest.json'] + ['runners/'+name for name in manifest['shards']]
        for name in members:
            (staged/name).parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source/name, staged/name)
        # Compatibility consumers need the publication timestamp, never historical
        # chart payloads. Raw and eligible record counts are explicitly separated.
        live = dict(schema_version=2, status='ready', as_of=study['as_of'],
                    input_as_of=study['input_as_of'], release_tag=study['release_tag'],
                    corpus=dict(n_records=study['cohort']['raw'], eligible_finishes=study['n']),
                    supporting_study='study/evidence.json')
        (staged/'live.json').write_text(json.dumps(live, indent=2)+'\n')
        for name in ['study', 'runners']:
            target = destination/name
            if target.exists():
                os.replace(target, staged/(name+'-previous'))
            os.replace(staged/name, target)
        os.replace(staged/'live.json', destination/'live.json')
    print(f'Imported supporting study and runner lookup for {study["release_tag"]}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parent.parent/'public/data')
    args = parser.parse_args()
    run(args.input, args.output)

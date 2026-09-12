"""Verify and import only the runner-context artifact owned by this pipeline."""
import argparse
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path


def run(source, destination, check_only=False):
    repository = Path(__file__).resolve().parent.parent
    source = source.resolve()
    subprocess.run(['node', str(repository/'scripts/verify-runner-context.cjs'),
                    '--data-root', str(source)], cwd=repository, check=True)
    if check_only:
        return
    manifest = json.loads((source/'manifest.json').read_text())
    destination.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.runner-context-import-', dir=destination) as temp:
        staging = Path(temp)
        ready = staging/'ready'
        members = ['manifest.json'] + [item['file'] for item in manifest['editions'].values()]
        for name in members:
            (ready/name).parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source/name, ready/name)
        target = destination/'runner-context'
        previous = staging/'previous'
        if target.exists():
            os.replace(target, previous)
        try:
            os.replace(ready, target)
        except OSError:
            if previous.exists():
                os.replace(previous, target)
            raise
    print(f'Imported runner context for {manifest["release_tag"]}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parent.parent/'public/data')
    parser.add_argument('--check-only', action='store_true')
    args = parser.parse_args()
    run(args.input, args.output, args.check_only)

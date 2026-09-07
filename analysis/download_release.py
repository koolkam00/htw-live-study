"""Download and verify a private CORE export outside the site checkout.

Uses the authenticated GitHub CLI. Never prints credentials or runner records.
"""
import argparse
import hashlib
import json
import shutil
import subprocess
import tarfile
from pathlib import Path

EXPECTED = {
    "race_records.parquet", "race_conditions.parquet", "course_profiles.parquet",
    "course_segments.parquet", "sources.parquet", "races_summary.json",
    "MANIFEST.json", "README.md",
}


def sha256(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def download_asset(repo, asset, destination):
    with destination.open("wb") as stream:
        subprocess.run([
            "gh", "api", f"repos/{repo}/releases/assets/{asset['id']}",
            "-H", "Accept: application/octet-stream",
        ], stdout=stream, check=True)
    digest = asset.get("digest", "")
    if not digest.startswith("sha256:"):
        raise ValueError("The release asset must have a GitHub SHA-256 digest.")
    if destination.stat().st_size != asset["size"] or sha256(destination) != digest[7:]:
        destination.unlink()
        raise ValueError("Release asset checksum or size mismatch.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--tag")
    args = parser.parse_args()
    config = json.loads(Path(__file__).with_name("release.json").read_text())
    repo, tag = config["repository"], args.tag or config["tag"]
    if not tag.startswith("private-export-") or any(c not in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_." for c in tag):
        raise ValueError("Expected a private-export release tag.")
    root = args.output.resolve()
    checkout = Path(__file__).resolve().parents[1]
    if root == checkout or checkout in root.parents:
        raise ValueError("Private data must be downloaded outside the site checkout.")
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    release = json.loads(subprocess.check_output([
        "gh", "api", f"repos/{repo}/releases/tags/{tag}",
    ]))
    assets = [a for a in release["assets"] if "-CORE-" in a["name"] and a["name"].endswith(".tar.gz")]
    if len(assets) != 1:
        raise ValueError("Expected exactly one CORE archive in the release.")
    asset = assets[0]
    archive = root / "core.tar.gz"
    download_asset(repo, asset, archive)
    seen = set()
    with tarfile.open(archive, "r:gz") as tar:
        total = 0
        for member in tar:
            name = Path(member.name).name
            if member.isdir():
                continue
            if not member.isfile() or Path(member.name).is_absolute() or ".." in Path(member.name).parts:
                raise ValueError("Archive contains an unsafe member.")
            if name not in EXPECTED or name in seen:
                raise ValueError(f"Unexpected or duplicate export file: {name}")
            total += member.size
            if total > 8 * 1024 ** 3:
                raise ValueError("CORE archive exceeds the extraction size limit.")
            with tar.extractfile(member) as source, (root / name).open("wb") as target:
                shutil.copyfileobj(source, target)
            seen.add(name)
    if seen != EXPECTED:
        raise ValueError(f"Missing CORE files: {sorted(EXPECTED - seen)}")
    brief = next((a for a in release["assets"] if a["name"] == "OUTSIDE-AGENT-PASTE-BRIEF.md"), None)
    if brief:
        download_asset(repo, brief, root / brief["name"])
    provenance = {
        "repository": repo, "release_tag": tag, "release_published_at": release["published_at"],
        "asset": asset["name"], "asset_sha256": asset["digest"][7:],
        "manifest_sha256": sha256(root / "MANIFEST.json"),
    }
    (root / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    print(f"Verified CORE export {tag}; extracted {len(seen)} files outside the checkout.")


if __name__ == "__main__":
    main()

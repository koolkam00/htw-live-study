"""Public-download behavior using tiny synthetic archives and no network."""
import contextlib
import hashlib
import io
import json
import os
import tarfile
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.request import HTTPRedirectHandler

import download_release


TAG = "private-export-20260907-1318"
REPO = "example/marathon-study"


def archive_bytes(members):
    output = io.BytesIO()
    with tarfile.open(fileobj=output, mode="w:gz") as archive:
        for name, content in members:
            member = tarfile.TarInfo(name)
            member.size = len(content)
            archive.addfile(member, io.BytesIO(content))
    return output.getvalue()


def release_asset(payload):
    name = "marathon-FULL-20260907.tar.gz"
    return {
        "id": 123,
        "name": name,
        "size": len(payload),
        "digest": "sha256:" + hashlib.sha256(payload).hexdigest(),
        "browser_download_url": f"https://github.com/{REPO}/releases/download/{TAG}/{name}",
    }


class PublicReleaseDownloads(unittest.TestCase):
    def run_export(self, checkout, payload):
        analysis = checkout / "analysis"
        analysis.mkdir()
        (analysis / "release.json").write_text(json.dumps({"repository": REPO, "tag": TAG}))
        asset = release_asset(payload)
        release = {"assets": [asset], "published_at": "2026-09-07T13:18:00Z"}
        requests = []

        def respond(request, timeout):
            requests.append(request)
            if request.full_url == f"https://api.github.com/repos/{REPO}/releases/tags/{TAG}":
                return io.BytesIO(json.dumps(release).encode())
            self.assertEqual(request.full_url, asset["browser_download_url"])
            return io.BytesIO(payload)

        destination = checkout / "public/data/downloads"
        with patch.dict(os.environ, {}, clear=True), \
                patch.object(download_release, "__file__", str(analysis / "download_release.py")), \
                patch.object(download_release, "urlopen", side_effect=respond), \
                contextlib.redirect_stdout(io.StringIO()):
            download_release.main(["--output", str(destination), "--bundle", "FULL"])
        return destination, requests

    def test_anonymous_full_download_inside_checkout(self):
        expected = download_release.EXPECTED | {"features.parquet"}
        payload = archive_bytes([(f"export/{name}", b"synthetic fixture") for name in sorted(expected)])
        with tempfile.TemporaryDirectory() as folder:
            destination, requests = self.run_export(Path(folder), payload)
            self.assertEqual(len(requests), 2)
            self.assertTrue(all(request.get_header("Authorization") is None for request in requests))
            self.assertTrue(all((destination / name).is_file() for name in expected))
            provenance = json.loads((destination / "provenance.json").read_text())
            self.assertEqual(provenance["release_tag"], TAG)
            self.assertEqual(provenance["asset_sha256"], hashlib.sha256(payload).hexdigest())

    def test_optional_token_is_api_only_and_not_redirected(self):
        for variable in ["GH_TOKEN", "GITHUB_TOKEN"]:
            with self.subTest(variable=variable), tempfile.TemporaryDirectory() as folder, \
                    patch.dict(os.environ, {variable: "synthetic-test-token"}, clear=True):
                with patch.object(download_release, "urlopen", return_value=io.BytesIO(b"{}")) as request_api:
                    download_release.read_release(REPO, TAG)
                request = request_api.call_args.args[0]
                self.assertEqual(request.get_header("Authorization"), "Bearer synthetic-test-token")
                redirected = HTTPRedirectHandler().redirect_request(
                    request, None, 302, "Found", {}, "https://release-assets.githubusercontent.com/fixture",
                )
                self.assertIsNone(redirected.get_header("Authorization"))
                payload = b"synthetic fixture"
                with patch.object(download_release, "urlopen", return_value=io.BytesIO(payload)) as request_asset:
                    download_release.download_asset(release_asset(payload), Path(folder) / "asset")
                self.assertIsNone(request_asset.call_args.args[0].get_header("Authorization"))

    def test_corrupt_asset_is_rejected_and_removed(self):
        with tempfile.TemporaryDirectory() as folder:
            destination = Path(folder) / "asset"
            with patch.object(download_release, "urlopen", return_value=io.BytesIO(b"changed")):
                with self.assertRaisesRegex(ValueError, "checksum or size mismatch"):
                    download_release.download_asset(release_asset(b"original"), destination)
            self.assertFalse(destination.exists())

    def test_archive_path_traversal_is_still_rejected(self):
        payload = archive_bytes([("../race_records.parquet", b"synthetic fixture")])
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaisesRegex(ValueError, "unsafe member"):
                self.run_export(Path(folder), payload)
            self.assertFalse((Path(folder) / "public/data/race_records.parquet").exists())


if __name__ == "__main__":
    unittest.main()

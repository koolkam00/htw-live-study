"""Reviewed, release-specific edition exclusions; never infer them from row counts.

The complete source export is retained. These rules select the analytical cohort,
independently of the feature engine's gender-dependent ``valid_splits`` flag.
"""
import hashlib
import json
from pathlib import Path


RELEASE = 'private-export-20260911-1107'
RULES = [
    ('Honolulu', 2016, 'invalid_split_grid', 'Producer explicitly force-dropped this incomplete 5 km grid.'),
    ('Rotterdam', 2012, 'invalid_split_grid', 'Producer explicitly force-dropped this incomplete 5 km grid.'),
    ('Eindhoven', 2009, 'invalid_split_grid', 'Producer explicitly force-dropped this incomplete 5 km grid.'),
    ('Eindhoven', 2010, 'invalid_split_grid', 'Producer explicitly force-dropped this incomplete 5 km grid.'),
    ('Frankfurt', 2019, 'invalid_split_grid', 'Producer explicitly force-dropped this 5 km grid; numerically plausible rows are not reinstated.'),
    ('New York', 2008, 'incomplete_ingestion', 'Release notes identify a partial live-ingestion snapshot of only 200 records.'),
    ('Chicago', 2016, 'incomplete_ingestion', 'Producer handoff identifies this 6,512-record edition as incomplete and on HOLD.'),
    ('Tokyo', 2026, 'selected_field', 'Source notes identify top-500 PDFs, not a representative full marathon field.'),
    ('Amsterdam', 2025, 'unreconciled_hold', 'Source audit marks HOLD: 23,328 listed versus 23,325 retrieved. This conservative hold does not establish a large bias from the three missing records.'),
    ('Valencia', 2017, 'incomplete_ingestion', 'Source audit marks HOLD: 3,373 listed detail pages missing; the observed records also lack 20 km.'),
]
LATEST_RELEASE = 'private-export-20260912-0934'
LATEST_RULES = [
    (city, year, 'unreconciled_hold',
     'Previously partial ingestion has grown to 38,047 records, but source-total reconciliation and explicit completion evidence are absent; keep the prior hold pending review.')
    if (city, year) == ('New York', 2008) else (city, year, category, reason)
    for city, year, category, reason in RULES
] + [
    ('Valencia', 2018, 'incomplete_ingestion', 'Producer handoff retains an incomplete/HOLD status; the edition also lacks the observed 20 km checkpoint.'),
]
REVIEWED_POLICIES = {RELEASE: RULES, LATEST_RELEASE: LATEST_RULES}
METHOD = ('Apply the reviewed source-quality edition exclusions for this exact export after the timing checks. '
          'Known invalid split grids, incomplete ingestion, unreconciled HOLD editions and a selected top-finisher field '
          'do not contribute to the analyses or prior benchmarks. Report source exclusions separately; an already '
          'invalid timing row is not counted twice. Missing age or recorded gender alone does not exclude an otherwise '
          'eligible finish from the overall cohort. Other sparse editions are not declared incomplete merely from their size.')


def release_tag(source):
    provenance = Path(source) / 'provenance.json'
    return json.loads(provenance.read_text()).get('release_tag') if provenance.exists() else None


def policy_metadata(tag):
    active = tag in REVIEWED_POLICIES
    rules = [{'city': city, 'year': year, 'category': category, 'reason': reason}
             for city, year, category, reason in REVIEWED_POLICIES[tag]] if active else []
    payload = {'version': 1, 'release_tag': tag, 'reviewed_edition_policy': active, 'editions': rules}
    payload['policy_sha256'] = hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()
    payload['script_sha256'] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    return payload


def install_policy(db, source):
    policy = policy_metadata(release_tag(source))
    db.execute('CREATE TEMP TABLE source_quality_editions (city VARCHAR, year INTEGER, category VARCHAR, reason VARCHAR)')
    if policy['editions']:
        db.executemany('INSERT INTO source_quality_editions VALUES (?,?,?,?)',
                       [[row[key] for key in ('city', 'year', 'category', 'reason')] for row in policy['editions']])
    return policy


def source_quality_report(db, source):
    """Read the prepared cohort's edition audit without exporting runner records."""
    policy = policy_metadata(release_tag(source))
    raw = dict(((city, year), n) for city, year, n in db.execute(
        'SELECT city,year,count(*) FROM read_parquet(?) GROUP BY city,year',
        [str(Path(source) / 'race_records.parquet')]).fetchall())
    deduplicated = dict(((city, year), n) for city, year, n in db.execute(
        'SELECT city,year,count(*) FROM unique_records GROUP BY city,year').fetchall())
    timing = dict(((city, year), n) for city, year, n in db.execute(
        'SELECT city,year,count(*) FROM timing_eligible GROUP BY city,year').fetchall())
    for row in policy['editions']:
        key = row['city'], row['year']
        row.update(raw_records=raw.get(key, 0), deduplicated_records=deduplicated.get(key, 0),
                   timing_eligible_excluded=timing.get(key, 0))
    return policy


def validate_source_quality(meta):
    """Validate policy provenance and disjoint exclusion counts during import."""
    tag = meta['input_export_id'].replace('private-', 'private-export-', 1)
    count = meta['cohort'].get('source_quality_excluded', 0)
    report = meta.get('source_quality')
    if report is None:
        assert tag not in REVIEWED_POLICIES and count == 0, 'Missing reviewed source-quality provenance'
        return
    expected = policy_metadata(tag)
    for key in ('version', 'release_tag', 'reviewed_edition_policy', 'policy_sha256', 'script_sha256'):
        assert report[key] == expected[key], f'Source-quality {key} mismatch'
    assert meta['source_quality_script_sha256'] == expected['script_sha256'], 'Source-quality script mismatch'
    assert len(report['editions']) == len(expected['editions']), 'Source-quality edition count mismatch'
    for row, rule in zip(report['editions'], expected['editions']):
        assert all(row[key] == value for key, value in rule.items()), 'Source-quality edition rule mismatch'
        sizes = [row[key] for key in ('raw_records', 'deduplicated_records', 'timing_eligible_excluded')]
        assert all(isinstance(n, int) and not isinstance(n, bool) and n >= 0 for n in sizes), 'Invalid source-quality counts'
        assert sizes[0] >= sizes[1] >= sizes[2], 'Source-quality counts do not nest'
    assert sum(row['timing_eligible_excluded'] for row in report['editions']) == count, 'Source-quality exclusions do not reconcile'
    assert meta['cohort']['timing_eligible'] == meta['cohort']['eligible'] + count, 'Timing and source eligibility do not reconcile'

import gzip
import hashlib
import json
import tempfile
import unittest
from pathlib import Path

import duckdb
from build_public_explorer import normalize_name, prepare_slowdown, threshold_sql, bucket
from build_runner_lookup import build_lookup
from build_pacing import FIELDS


class PublicExplorerTests(unittest.TestCase):
    def test_thresholds_include_exact_decimal_boundaries(self):
        db = duckdb.connect()
        # Actual integer elapsed durations can land just below the mathematical
        # boundary after binary division/subtraction. Neighbouring values remain
        # on their proper side; this is rounding tolerance, not a new cutoff.
        for baseline, section, threshold in [(1830,671,.10),(4500,1725,.15),
                (4500,1800,.20),(4500,1875,.25),(1860,806,.30),
                (4500,2100,.40),(1802,901,.50)]:
            ratio = (section/5)/(baseline/15)-1
            for value, expected in [(ratio,True),(threshold-1e-9,False),(threshold+1e-9,True)]:
                query = 'SELECT '+threshold_sql(threshold,5)+' FROM (SELECT ? AS s0,0 AS s1,0 AS s2,0 AS s3,0 AS s4)'
                self.assertEqual(db.execute(query,[value]).fetchone()[0], expected, (threshold,value))

    def test_contiguous_slowdown_and_short_finish(self):
        db = duckdb.connect()
        db.execute('CREATE TABLE eligible (id INTEGER,t0 DOUBLE,t3 DOUBLE,p4 DOUBLE,p5 DOUBLE,p6 DOUBLE,p7 DOUBLE,p8 DOUBLE)')
        # Baseline is 300 seconds/km. Exactly 25% slowing must be included.
        db.executemany('INSERT INTO eligible VALUES (?,?,?,?,?,?,?,?)', [
            [1, 1500, 6000, 300, 300, 300, 300, 375],
            [2, 1500, 6000, 300, 300, 300, 375, 300],
            [3, 1500, 6000, 375, 300, 375, 300, 300],
            [4, 1500, 6000, 300, 300, 300, 375, 375],
            [5, 1500, 6000, 375, 375, 300, 300, 300],
        ])
        prepare_slowdown(db)
        rows = db.execute('SELECT id,detected,onset,episode_km::DOUBLE FROM slowdown ORDER BY id').fetchall()
        self.assertEqual(rows, [(1, False, None, None), (2, True, 35, 5), (3, True, 20, 5), (4, True, 35, 7.195), (5, True, 20, 10)])
        ids = db.execute(f'SELECT id FROM slowdown_ratios WHERE {threshold_sql(.25,10)} ORDER BY id').fetchall()
        self.assertEqual(ids, [(5,)])
        self.assertEqual(db.execute(f'SELECT count(*) FROM slowdown_ratios WHERE {threshold_sql(.26,5)}').fetchone()[0], 0)

    def test_unicode_normalization(self):
        self.assertEqual(normalize_name('  José  O’Neal-Straße  '), 'jose o neal straße')
        self.assertEqual(normalize_name('ＬＩ 李 １２'), 'li 李 12')
        self.assertEqual(normalize_name(None), '')
        self.assertEqual(bucket('jose'), hashlib.sha256(b'jose').hexdigest()[:3])

    def test_all_records_retained_without_name_identity_merges(self):
        db = duckdb.connect()
        columns = ','.join(f'{f} VARCHAR' for f in FIELDS)
        db.execute(f'CREATE TABLE canonical_raw (id BIGINT,runner VARCHAR,sex VARCHAR,age DOUBLE,city VARCHAR,year BIGINT,race VARCHAR,{columns})')
        times = ['25:00', '50:00', '1:15:00', '1:40:00', '2:05:00', '2:30:00', '2:55:00', '3:20:00', '3:31:00']
        rows = [[1, 'José Lee', 'M', 30, 'Example', 2020, 'Marathon', *times],
                [2, 'Jose "Jay", Lee\n', 'M', 31, 'Example', 2021, 'Marathon', *times],
                [3, 'José Lee', 'M', None, 'Example', 2022, 'Marathon', *([None]*9)],
                [4, None, None, None, 'Example', 2023, 'Marathon', *([None]*9)]]
        db.executemany('INSERT INTO canonical_raw VALUES ('+','.join('?' for _ in rows[0])+')', rows)
        db.execute("CREATE MACRO seconds(s) AS CASE WHEN s IS NULL THEN NULL ELSE 1500 END")
        db.execute('CREATE TABLE features (record_id BIGINT,runner_id VARCHAR,is_ambiguous BOOLEAN)')
        db.execute("INSERT INTO features VALUES (1,'candidate',false),(2,'candidate',false),(3,'candidate',true),(4,NULL,false)")
        db.execute("CREATE TABLE safe_ids AS SELECT 'candidate' AS runner_id")
        db.execute('CREATE TABLE eligible AS SELECT id AS rid FROM canonical_raw WHERE id<=2')
        db.execute('CREATE TABLE parsed AS SELECT id AS rid,'+','.join('NULL::DOUBLE AS t'+str(i) for i in range(9))+' FROM canonical_raw')
        db.execute('CREATE TABLE source_quality_editions (city VARCHAR,year INTEGER,reason VARCHAR)')
        with tempfile.TemporaryDirectory() as temp:
            output = Path(temp)
            build_lookup(db, output, output, dict(release_tag='test', cohort=dict(raw=4,eligible=2)))
            manifest = json.loads((output/'manifest.json').read_text())
            self.assertEqual((manifest['raw_records'],manifest['named_records'],manifest['profiles']), (4,3,3))
            profiles = []
            for relative, meta in manifest['shards'].items():
                data = (output/relative).read_bytes()
                self.assertEqual(hashlib.sha256(data).hexdigest(),meta['sha256'])
                if relative.startswith('profiles/'):
                    profiles += json.loads(gzip.decompress(data))['profiles']
            profiles.sort(key=lambda p:p['id'])
            self.assertEqual([[r['id'] for r in p['races']] for p in profiles], [[1,2],[3],[4]])
            self.assertIn('Jose "Jay", Lee\n', profiles[0]['names'])
            self.assertFalse(profiles[1]['races'][0]['eligible'])
            self.assertIn('missing',profiles[1]['races'][0]['reason'])
            self.assertEqual(len(profiles[1]['races'][0]['raw_times']),9)


if __name__ == '__main__':
    unittest.main()

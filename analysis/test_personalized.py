"""Exact threshold and unequal-section checks on synthetic aggregate inputs."""
import unittest
import duckdb
from build_personalized import cdf_from_bins, distribution, near_targets, LENGTHS, TARGET_MIN, TARGET_MAX
from import_personalized import distribution as validate_distribution


class PersonalizedValidation(unittest.TestCase):
    def test_strict_threshold_and_section_reconciliation(self):
        db=duckdb.connect()
        columns=','.join([f'p{i} DOUBLE' for i in range(9)]+[f'd{i} DOUBLE' for i in range(9)])
        db.execute(f'CREATE TABLE pg (c VARCHAR,edition VARCHAR,t8 DOUBLE,change20 DOUBLE,late_change DOUBLE,{columns})')
        for finish in [179.5*60,180*60]:
            p=finish/42.195
            row=['all|all|all','Example|2020|Marathon',finish,0.,0.]+[p]*9+[p*km for km in LENGTHS]
            db.executemany('INSERT INTO pg VALUES ('+','.join('?' for _ in row)+')',[row]*100)
        result=distribution(db)[('all|all|all',)]
        self.assertEqual(result['n'],200)
        self.assertEqual(result['cdf_min'],TARGET_MIN)
        self.assertEqual(result['cdf'][179-TARGET_MIN],0)
        self.assertEqual(result['cdf'][180-TARGET_MIN],100,'Exactly three hours is not sub-three')
        self.assertEqual(result['cdf'][181-TARGET_MIN],200)
        validate_distribution(result,target_min=TARGET_MIN,target_max=TARGET_MAX)
        self.assertAlmostEqual(result['pace'][0][1],result['pace'][8][1])
        near=next(row for row in near_targets(db)['all|all|all'] if row['target']==180)
        self.assertEqual(near['below']['n'],100)
        self.assertEqual(near['above']['n'],100)
        self.assertAlmostEqual(sum(near['below']['durations']),179.5*60)
        self.assertAlmostEqual(sum(near['above']['durations']),180*60)
        db.execute('DELETE FROM pg WHERE t8=10800')
        db.execute('DELETE FROM pg WHERE rowid IN (SELECT rowid FROM pg LIMIT 1)')
        self.assertEqual(distribution(db),{},'Narrow cells below 100 must not be published')

    def test_clipped_cdf_and_zero_hits(self):
        result=cdf_from_bins([(TARGET_MIN,3),(180,7),(TARGET_MAX+1,9)])
        self.assertEqual(len(result),631)
        self.assertEqual(result[0],3)
        self.assertEqual(result[180-TARGET_MIN],10)
        self.assertEqual(result[-1],10)

    def test_expanded_boundaries_and_longer_finish_comparisons(self):
        db=duckdb.connect()
        columns=','.join([f'p{i} DOUBLE' for i in range(9)]+[f'd{i} DOUBLE' for i in range(9)])
        db.execute(f'CREATE TABLE pg (c VARCHAR,edition VARCHAR,t8 DOUBLE,change20 DOUBLE,late_change DOUBLE,{columns})')
        for minutes in [90,119.5,120,359.5,360,719.5,720]:
            finish=minutes*60;p=finish/42.195
            row=['all|all|all','Example|2020|Marathon',finish,0.,0.]+[p]*9+[p*km for km in LENGTHS]
            db.executemany('INSERT INTO pg VALUES ('+','.join('?' for _ in row)+')',[row]*100)
        result=distribution(db)[('all|all|all',)]
        for target,hits in [(90,0),(91,100),(120,200),(121,300),(360,400),(361,500),(720,600)]:
            self.assertEqual(result['cdf'][target-TARGET_MIN],hits)
        for target in [120,360,720]:
            near=next(row for row in near_targets(db)['all|all|all'] if row['target']==target)
            self.assertEqual(near['below']['n'],100)
            self.assertEqual(near['above']['n'],100)
            self.assertAlmostEqual(sum(near['above']['durations'])/60,target)

    def test_importer_preserves_legacy_range_and_rejects_misindexed_cdf(self):
        legacy={'n':100,'editions':1,'finish':[10800,10800,10800],'retention':0.,'late':0.,
                'pace':[],'cdf':[0]*31+[100]*90}
        validate_distribution(legacy,has_pace=False)
        with self.assertRaises(AssertionError):
            validate_distribution({**legacy,'cdf_min':90},has_pace=False)
        expanded={**legacy,'cdf_min':90,'cdf':[0]*91+[100]*540}
        validate_distribution(expanded,has_pace=False,target_min=90,target_max=720)


if __name__=='__main__':
    unittest.main()

"""Exact threshold and unequal-section checks on synthetic aggregate inputs."""
import unittest
import duckdb
from build_personalized import cdf_from_bins, distribution, near_targets, LENGTHS


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
        self.assertEqual(result['cdf'][179-150],0)
        self.assertEqual(result['cdf'][180-150],100,'Exactly three hours is not sub-three')
        self.assertEqual(result['cdf'][181-150],200)
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
        result=cdf_from_bins([(150,3),(180,7),(271,9)])
        self.assertEqual(len(result),121)
        self.assertEqual(result[0],3)
        self.assertEqual(result[30],10)
        self.assertEqual(result[-1],10)


if __name__=='__main__':
    unittest.main()

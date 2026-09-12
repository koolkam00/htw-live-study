"""Boundary and cohort tests for exact same-edition peer context."""
import unittest

import duckdb

from runner_peers import _validate_pace_counts, build_peer_editions

POINTS = [5, 10, 15, 20, 25, 30, 35, 40, 42.195]
LENGTHS = [5]*8+[2.195]


def row(*, finish=14400, age=37, gender='Men', city='Example', year=2020, race='Marathon', paces=None):
    if paces is None:
        times = [finish*point/42.195 for point in POINTS]
        times[-1] = finish
        paces = [(time-(times[i-1] if i else 0))/LENGTHS[i] for i, time in enumerate(times)]
    else:
        times = []
        cumulative = 0
        for pace, length in zip(paces, LENGTHS):
            cumulative += pace*length
            times.append(cumulative)
    return (city, year, race, age, gender, *times, *paces)


def build(rows):
    db = duckdb.connect()
    columns = ','.join(f't{i} DOUBLE' for i in range(9))+','+','.join(f'p{i} DOUBLE' for i in range(9))
    db.execute(f'CREATE TABLE eligible(city VARCHAR,year INTEGER,race VARCHAR,age DOUBLE,gender VARCHAR,{columns})')
    if rows:
        db.executemany('INSERT INTO eligible VALUES('+','.join('?' for _ in range(23))+')', rows)
    try:
        return build_peer_editions(db)
    finally:
        db.close()


class RunnerPeersTest(unittest.TestCase):
    def test_exact_millisecond_ties_and_minimum_other_peers(self):
        rows = [row(finish=14400.125)]*51+[row(finish=14400.126)]*50
        rows += [row(city='Small')]*100
        data = build(rows)
        groups = data[('Example', 2020, 'Marathon')]['groups']
        self.assertEqual(groups['all']['finish'], [[14400.125, 51], [14400.126, 50]])
        self.assertEqual(groups['all']['n'], 101)
        self.assertEqual(groups['gender:Men']['n'], 101)
        self.assertEqual(data[('Small', 2020, 'Marathon')]['eligible_n'], 100)
        self.assertEqual(data[('Small', 2020, 'Marathon')]['groups'], {})

    def test_age_and_gender_do_not_exclude_overall_records(self):
        rows = []
        for age in [18, 24, 25, 29, 85, 89, 24.5, 17, 90, None]:
            rows += [row(age=age, gender='Women')]*101
        rows += [row(age=37, gender='Other / not recorded')]*101
        data = build(rows)[('Example', 2020, 'Marathon')]
        self.assertEqual(data['eligible_n'], 1111)
        self.assertEqual(data['gender_n'], 1010)
        self.assertEqual(data['age_n'], 707)
        self.assertEqual(data['groups']['age:18-24']['n'], 202)
        self.assertEqual(data['groups']['age:25-29']['n'], 202)
        self.assertEqual(data['groups']['age:85-89']['n'], 202)
        self.assertEqual(data['groups']['age:35-39']['n'], 101)
        self.assertEqual(data['groups']['age_gender:18-24:Women']['n'], 202)
        self.assertNotIn('gender:Other / not recorded', data['groups'])
        self.assertNotIn('age_gender:35-39:Men', data['groups'])
        self.assertNotIn('age:90-94', data['groups'])

    def test_achieved_time_bands_have_exact_half_open_edges(self):
        data = build([row(finish=t) for t in [13949.999, 13950, 14849.999, 14850] for _ in range(101)])
        pace = data[('Example', 2020, 'Marathon')]['groups']['all']['pace']
        self.assertEqual(set(pace), {'225', '240', '255'})
        self.assertEqual(pace['225']['n'], 101)
        self.assertEqual(pace['240']['n'], 202)
        self.assertEqual(pace['255']['n'], 101)
        self.assertEqual((pace['240']['from_sec'], pace['240']['to_sec']), (13950, 14850))
        # Rounding a selected finish to a whole minute would put 13949.999 in
        # the wrong band. The generator uses its actual cumulative timing.
        self.assertEqual(pace['225']['to_sec'], 13950)
        group = data[('Example', 2020, 'Marathon')]['groups']['all']
        for cell in pace.values():
            self.assertEqual(cell['n'], sum(n for seconds, n in group['finish']
                                           if cell['from_sec'] <= seconds < cell['to_sec']))

    def test_pace_count_guard_rejects_inclusive_upper_edge(self):
        group = {'n':303, 'finish':[[13950, 101], [14849.999, 101], [14850, 101]],
                 'pace':{'240':{'n':303, 'from_sec':13950, 'to_sec':14850}}}
        with self.assertRaisesRegex(AssertionError, 'half-open finish CDF interval'):
            _validate_pace_counts(group)
        group['pace']['240']['n'] = 202
        _validate_pace_counts(group)

    def test_small_pace_band_is_withheld_inside_large_group(self):
        group = build([row(finish=13500)]*100+[row(finish=14400)]*101)[('Example', 2020, 'Marathon')]['groups']['all']
        self.assertEqual(group['n'], 201)
        self.assertEqual(group['finish'], [[13500, 100], [14400, 101]])
        self.assertEqual(set(group['pace']), {'240'})
        self.assertEqual(group['pace']['240']['n'], 101)

    def test_pace_and_late_change_quartiles_use_actual_sections(self):
        data = build([row(paces=[270+i, 300, 300, 300, 310, 320, 330, 340, 350]) for i in range(101)])
        group = data[('Example', 2020, 'Marathon')]['groups']['all']
        pace = group['pace']['225']
        self.assertEqual(pace['n'], 101)
        self.assertEqual(pace['q25'][0], 295)
        self.assertEqual(pace['median'][0], 320)
        self.assertEqual(pace['q75'][0], 345)
        self.assertEqual(pace['median'][-1], 350)
        expected_late = 100*((330*5+340*5+350*2.195)/12.195/300-1)
        self.assertEqual(set(pace['late_change']), {'q25', 'median', 'q75'})
        for value in list(pace['late_change'].values())+list(group['late_change'].values()):
            self.assertAlmostEqual(value, expected_late, places=10)
        self.assertEqual(len(pace['median']), 9)

    def test_late_change_quartiles_exclude_opening_from_baseline(self):
        rows = [row(paces=[550, 300, 300, 300, 300, 300, *([315+0.4*i]*3)]) for i in range(101)]
        group = build(rows)[('Example', 2020, 'Marathon')]['groups']['all']
        self.assertEqual(set(group['pace']), {'240'})
        for actual in [group['late_change'], group['pace']['240']['late_change']]:
            for key, late_pace in [('q25', 325), ('median', 335), ('q75', 345)]:
                self.assertAlmostEqual(actual[key], 100*(late_pace/300-1), places=10)

    def test_editions_are_not_pooled_across_city_year_or_race(self):
        rows = [row()]*101+[row(year=2021)]*100+[row(race='Different edition')]*100
        data = build(rows)
        self.assertEqual(len(data), 3)
        self.assertEqual(data[('Example', 2020, 'Marathon')]['groups']['all']['n'], 101)
        self.assertEqual(data[('Example', 2021, 'Marathon')]['groups'], {})
        self.assertEqual(data[('Example', 2020, 'Different edition')]['groups'], {})

    def test_submillisecond_finish_is_not_silently_quantized(self):
        with self.assertRaisesRegex(AssertionError, 'precision no finer than milliseconds'):
            build([row(finish=14400.0001)]*101)

    def test_empty_input_returns_no_editions(self):
        self.assertEqual(build([]), {})


if __name__ == '__main__':
    unittest.main()

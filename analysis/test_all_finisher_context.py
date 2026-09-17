"""Method fixtures for the additive all-finisher comparisons."""
import json
from pathlib import Path
import tempfile
import unittest

import numpy as np

from build_all_finisher_context import (
    combine_editions, early_pace_codes, row_groups, summarize_edition,
    temperature_code, terrain_code, verified_context,
)
from build_fast_start import AGE, BAND, EDITION, FINISH, LATE, ONSET, PACE, REMAINDER
from build_fast_start import encode
from build_fast_start_all import ACTUAL_FINISH, WIDTH, observation, profile_observations


def context(index, city='Example', temperature=1, terrain='other'):
    return dict(index=index, city=city, year=2020+index, race='Example Marathon',
                temperature=temperature, terrain=terrain)


def rows(n, index=0, late=0, detected=0, baseline=300):
    result = np.zeros((n, WIDTH))
    result[:, EDITION] = index
    result[:, ACTUAL_FINISH] = baseline*42.195
    result[:, ONSET] = -1
    result[:detected, ONSET] = 25
    result[:, LATE] = late
    result[:, REMAINDER] = late*60
    result[:, PACE:PACE+9] = late
    result[:, BAND] = 3
    return result


class AllFinisherContextTests(unittest.TestCase):
    def test_single_result_and_unknown_demographics_still_supply_observation(self):
        race = dict(eligible=True, times=[1500, 3000, 4500, 6000, 7500, 9000, 10500, 12000, 12658.5],
                    age=None, sex=None, edition=0)
        actual = list(profile_observations([race], [1]))
        self.assertEqual(len(actual), 1)
        self.assertEqual(actual[0][AGE], 0)
        self.assertEqual(actual[0], observation(race, 1))

    def test_half_open_early_pace_boundaries_and_rounding_noise(self):
        samples = []
        for value in (269.999, 270, 329.999, 330, 389.999, 390, 390.001):
            sample = rows(1, baseline=value)
            sample[:, FINISH] = 123.456
            sample[:, ACTUAL_FINISH] += 123.456
            samples.append(sample)
        self.assertEqual(early_pace_codes(np.concatenate(samples)).tolist(), [1, 2, 2, 3, 3, 4, 4])

    def test_temperature_edges_and_missing_values(self):
        self.assertEqual([temperature_code(x) for x in (-10, 4.99, 5, 10, 15, 20, 40)],
                         [0, 0, 1, 2, 3, 4, 4])
        self.assertIsNone(temperature_code(None))
        self.assertIsNone(temperature_code(float('nan')))

    def test_downhill_boundary_and_missing_profile(self):
        def terrain(net):
            return dict(sections=[dict(start_km=0, end_km=5, net_m=net)]*9)
        self.assertEqual(terrain_code(terrain(-25.01)), 'downhill')
        self.assertEqual(terrain_code(terrain(-25)), 'other')
        self.assertEqual(terrain_code(terrain(0)), 'other')
        self.assertIsNone(terrain_code(None))
        with self.assertRaises(ValueError):
            terrain_code(terrain(None))

    def test_exact_edition_and_group_minima(self):
        self.assertIsNone(summarize_edition(rows(19), 0, context(0)))
        self.assertIsNotNone(summarize_edition(rows(20), 0, context(0)))
        editions = [summarize_edition(rows(33, i), i, context(i)) for i in range(3)]
        self.assertIsNone(combine_editions(editions, dict(id='test')))
        editions[-1] = summarize_edition(rows(34, 2), 2, context(2))
        self.assertEqual(combine_editions(editions, dict(id='test'))['n'], 100)
        self.assertIsNone(combine_editions(editions[:2], dict(id='test')))

    def test_equal_edition_rates_medians_and_pooled_finish_context(self):
        selections = [rows(1000, 0, late=0, detected=0, baseline=240),
                      rows(100, 1, late=30, detected=100, baseline=360),
                      rows(100, 2, late=60, detected=100, baseline=420)]
        editions = [summarize_edition(item, i, context(i)) for i, item in enumerate(selections)]
        group = combine_editions(editions, dict(id='test'))
        self.assertAlmostEqual(group['slowdown_pct'], 200/3, places=6)
        self.assertEqual(group['late_pct'], 30)
        self.assertEqual(group['after20_delta_s'], 1800)
        self.assertEqual(group['profile_pct'], [30]*9)
        self.assertEqual(group['actual_finish_median_s'], 240*42.195)
        self.assertEqual(group['edition_indices'], [0, 1, 2])
        self.assertEqual(group['onset_n'], [0, 200, 0, 0])
        self.assertEqual(group['onset_pct'], [0, 100, 0, 0])

    def test_onset_requires_100_detected_not_100_total(self):
        editions = [summarize_edition(rows(100, i, detected=33), i, context(i)) for i in range(3)]
        group = combine_editions(editions, dict(id='test'))
        self.assertEqual(group['detected_n'], 99)
        self.assertIsNone(group['onset_n'])
        self.assertIsNone(group['onset_pct'])
        editions[2] = summarize_edition(rows(100, 2, detected=34), 2, context(2))
        self.assertEqual(combine_editions(editions, dict(id='test'))['onset_n'], [0, 100, 0, 0])

    def test_within_edition_and_between_edition_spread_are_distinct(self):
        editions = []
        for i in range(3):
            selected = rows(100, i)
            selected[:, LATE] = np.arange(100)+1000*i
            editions.append(summarize_edition(selected, i, context(i)))
        group = combine_editions(editions, dict(id='test'))
        self.assertEqual(group['late_spread_pct'], 79.2)
        self.assertEqual(group['late_edition_spread_pct'], [249.5, 1849.5])

    def test_missing_environment_never_falls_back(self):
        selected = np.concatenate([rows(100, i) for i in range(3)])
        contexts = [context(i, temperature=None, terrain=None) for i in range(3)]
        groups = row_groups(selected, contexts)
        self.assertEqual(groups['courses'][0]['n'], 300)
        self.assertEqual(groups['weather'], [])
        self.assertEqual(groups['downhill'], [])

    def test_sparse_edition_excluded_before_pooled_group(self):
        selected = np.concatenate([rows(n, i) for i, n in enumerate([19, 34, 34, 34])])
        contexts = [context(i) for i in range(4)]
        groups = row_groups(selected, contexts)
        self.assertEqual(groups['weather'][0]['n'], 102)
        self.assertEqual(groups['weather'][0]['edition_indices'], [1, 2, 3])
        self.assertEqual(groups['downhill'][0]['n'], 102)
        self.assertEqual(groups['editions'], [])

    def test_race_day_has_own_100_finish_gate_without_three_edition_rule(self):
        groups = row_groups(rows(100), [context(0)])
        self.assertEqual(json.loads(encode(groups)), groups)
        self.assertEqual(groups['courses'], [])
        self.assertEqual(groups['weather'], [])
        self.assertEqual(groups['downhill'], [])
        self.assertEqual(len(groups['editions']), 1)
        self.assertEqual(groups['editions'][0]['edition_n'], 1)
        self.assertEqual(groups['editions'][0]['id'], 'edition:0')
        self.assertEqual(row_groups(rows(99), [context(0)])['editions'], [])

    def test_context_rejects_wrong_exact_runner_binding(self):
        fields = dict(release_tag='test', input_as_of='time', input_asset_sha256='asset',
                      input_manifest_sha256='input', cohort={}, source_quality={})
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root/'manifest.json').write_text(json.dumps(dict(fields, runner_manifest_sha256='other')))
            with self.assertRaisesRegex(ValueError, 'runner binding'):
                verified_context(root, fields, 'expected', root)


if __name__ == '__main__':
    unittest.main()

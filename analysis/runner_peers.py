"""Exact same-edition context for already validated eligible race records.

This module neither establishes runner identity nor predicts finish outcomes.
The caller supplies build_pacing.prepare's eligible table and owns provenance,
transport and imports. Finish bands describe achieved results, not prior ability.
"""
from bisect import bisect_left
from itertools import accumulate

MIN_N = 101  # At least 100 other finishes after removing the focused record.


def _quartiles(values):
    return dict(zip(('q25', 'median', 'q75'), values))


def _validate_pace_counts(group):
    """Every published pace cell must use its stated half-open finish interval."""
    times = [seconds for seconds, _ in group['finish']]
    counts = list(accumulate((n for _, n in group['finish']), initial=0))
    assert counts[-1] == group['n'], 'Finish CDF total differs from its peer group'
    for pace in group['pace'].values():
        lower = bisect_left(times, pace['from_sec'])
        upper = bisect_left(times, pace['to_sec'])
        assert counts[upper]-counts[lower] == pace['n'], \
            'Pace cell count differs from its half-open finish CDF interval'


def build_peer_editions(db):
    """Return {(city, year, race): {eligible_n, age_n, gender_n, groups}}.

    Each group has n, an exact finish CDF as [seconds, count] pairs, observed
    late_change quartiles as {q25, median, q75}, and achieved-time pace bands.
    Pace arrays are seconds/km in recorded section order; late_change is a
    percentage relative to the recorded 5–20 km baseline. CDFs are lossless to
    the source's millisecond precision. Pace quartiles include the focused finish;
    consumers must not describe them as leave-one-out peer quartiles.
    """
    assert db.execute('''SELECT count(*) FROM eligible WHERE city IS NULL OR year IS NULL OR race IS NULL
      OR t8 IS NULL OR NOT isfinite(t8) OR abs(t8*1000-round(t8*1000))>0.00001''').fetchone()[0] == 0, \
        'Peer context needs recorded edition keys and finish precision no finer than milliseconds'
    result = {}
    try:
        db.execute('''CREATE TEMP TABLE runner_peer_seed AS SELECT city,year,race,gender,
          round(t8*1000)::BIGINT AS finish_ms,
          (floor(t8/900.0+0.5)*15)::INTEGER AS band,
          CASE WHEN age>=18 AND age<90 AND age=floor(age) THEN
            CASE WHEN age<25 THEN '18-24' ELSE
              cast(floor(age/5)*5 AS INTEGER)::VARCHAR||'-'||cast(floor(age/5)*5+4 AS INTEGER)::VARCHAR END
          END AS age_key,
          100*((t8-t5)/12.195/((t3-t0)/15)-1) AS late_change,
          p0,p1,p2,p3,p4,p5,p6,p7,p8 FROM eligible''')
        coverage = db.execute('''SELECT city,year,race,count(*),
          count(*) FILTER(WHERE age_key IS NOT NULL),count(*) FILTER(WHERE gender IN ('Men','Women'))
          FROM runner_peer_seed GROUP BY city,year,race ORDER BY city,year,race''').fetchall()
        for city, year, race, n, age_n, gender_n in coverage:
            result[(city, year, race)] = dict(eligible_n=n, age_n=age_n, gender_n=gender_n, groups={})
        db.execute('''CREATE TEMP VIEW runner_peer_rows AS
          SELECT *,'all' AS group_key FROM runner_peer_seed UNION ALL
          SELECT *,'gender:'||gender FROM runner_peer_seed WHERE gender IN ('Men','Women') UNION ALL
          SELECT *,'age:'||age_key FROM runner_peer_seed WHERE age_key IS NOT NULL UNION ALL
          SELECT *,'age_gender:'||age_key||':'||gender FROM runner_peer_seed
            WHERE age_key IS NOT NULL AND gender IN ('Men','Women')''')
        db.execute(f'''CREATE TEMP TABLE runner_peer_groups AS
          SELECT city,year,race,group_key,count(*) AS n,
            quantile_cont(late_change,[0.25,0.5,0.75]) AS late_change
          FROM runner_peer_rows GROUP BY city,year,race,group_key HAVING count(*)>={MIN_N}''')
        for city, year, race, key, n, late in db.execute(
                'SELECT * FROM runner_peer_groups ORDER BY city,year,race,group_key').fetchall():
            result[(city, year, race)]['groups'][key] = dict(n=n, finish=[], late_change=_quartiles(late), pace={})
        cursor = db.execute('''SELECT p.city,p.year,p.race,p.group_key,p.finish_ms,count(*)
          FROM runner_peer_rows p JOIN runner_peer_groups g USING(city,year,race,group_key)
          GROUP BY p.city,p.year,p.race,p.group_key,p.finish_ms
          ORDER BY p.city,p.year,p.race,p.group_key,p.finish_ms''')
        while batch := cursor.fetchmany(10000):
            for city, year, race, key, milliseconds, n in batch:
                seconds = milliseconds//1000 if milliseconds % 1000 == 0 else milliseconds/1000
                result[(city, year, race)]['groups'][key]['finish'].append([seconds, n])
        quantiles = ','.join(f'quantile_cont(p{i},[0.25,0.5,0.75]) AS q{i}' for i in range(9))
        cursor = db.execute(f'''SELECT city,year,race,group_key,band,count(*) AS n,
          quantile_cont(late_change,[0.25,0.5,0.75]) AS late_change,{quantiles}
          FROM runner_peer_rows GROUP BY city,year,race,group_key,band HAVING count(*)>={MIN_N}
          ORDER BY city,year,race,group_key,band''')
        while batch := cursor.fetchmany(1000):
            for city, year, race, key, band, n, late, *pace in batch:
                # These are the same recorded half-open 15-minute bands in every
                # demographic view; no selected finish is rounded before binning.
                result[(city, year, race)]['groups'][key]['pace'][str(band)] = dict(
                    n=n, from_sec=(band-7.5)*60, to_sec=(band+7.5)*60,
                    q25=[q[0] for q in pace], median=[q[1] for q in pace], q75=[q[2] for q in pace],
                    late_change=_quartiles(late),
                )
        for edition in result.values():
            for group in edition['groups'].values():
                _validate_pace_counts(group)
        return result
    finally:
        db.execute('DROP VIEW IF EXISTS runner_peer_rows')
        db.execute('DROP TABLE IF EXISTS runner_peer_groups')
        db.execute('DROP TABLE IF EXISTS runner_peer_seed')

"""Generate plain-language findings from published aggregates, never runner data."""
import argparse
import csv
import hashlib
import json
from pathlib import Path


def run(root):
    def rows(pack,table):
        with (root/('ext_'+pack)/'tables'/table).open() as stream:
            result=list(csv.DictReader(stream))
        for row in result:
            for key,value in row.items():
                try: row[key]=float(value)
                except (ValueError,TypeError): pass
        return result

    def pick(data,**keys):
        return next((row for row in data if all(row.get(k)==v for k,v in keys.items())),None)

    def change(value):
        return f"{abs(value):.1f}% {'faster' if value<0 else 'slower'}"

    findings={}
    data=rows('opening_tradeoffs','matched_openings.csv')
    a,b=pick(data,label='Faster opening'),pick(data,label='Similar opening')
    if a and b:
        findings['opening_tradeoffs']=f"After matching race edition, recorded gender and prior-time band, faster-opening runners finished {change(a['value'])} than their earlier benchmark on average; similar-opening runners finished {change(b['value'])}. Improved fitness could produce both a faster start and a faster finish, so this is not a recommendation to start aggressively."
    data=rows('slow_start_responses','responses.csv')
    a,b=pick(data,label='Accelerated more than 5%'),pick(data,label='Little acceleration or slowing')
    if a and b:
        findings['slow_start_responses']=f"After a slow first 5 km, runners accelerating by more than 5% in the next section had a median finish {change(a['median'])} than their prior benchmark, versus {change(b['median'])} among those with little acceleration or further slowing. These groups were not otherwise matched."
    data=rows('bad_patch_recovery','recovery.csv')
    a,b=pick(data,label=25),pick(data,label=35)
    if a and b:
        findings['bad_patch_recovery']=f"Recovery in the next 5 km was uncommon under this definition: {a['value']:.1f}% after a first qualifying patch at 20–25 km, and {b['value']:.1f}% after one at 30–35 km. A qualifying patch was more than 10% slower than both the preceding section and the early baseline."
    data=rows('split_pattern_success','success_rates.csv')
    a,b,c=pick(data,label='Faster second 20 km'),pick(data,label='Similar 20 km blocks'),pick(data,label='Moderate slowing')
    if a and b and c:
        findings['split_pattern_success']=f"Finishes more than 2% faster than an earlier benchmark occurred in {a['value']:.1f}% of faster-second-20-km races, {b['value']:.1f}% of similar-block races, and {c['value']:.1f}% of moderately slowing races. These are observed associations, not proof that a particular split pattern causes success."
    data=rows('successful_race_shapes','pattern_mix.csv')
    a,b=pick(data,label='Moderate slowing'),pick(data,label='Faster second 20 km')
    if a and b:
        findings['successful_race_shapes']=f"Improvement did not require a faster second 20 km: {a['value']:.1f}% of improved finishes showed moderate slowing, while {b['value']:.1f}% had a faster second 20 km. The popularity of a successful pattern is different from its success rate."
    data=rows('strategy_outcome_spread','spread.csv')
    a,b=pick(data,ability_band='3:30–4 hours',label='Faster opening'),pick(data,ability_band='3:30–4 hours',label='Slower opening')
    if a and b:
        findings['strategy_outcome_spread']=f"For runners with an earlier best of 3:30–4 hours, the middle 80% of outcomes spans {a['p90']-a['p10']:.1f} percentage points in the faster-opening group and {b['p90']-b['p10']:.1f} in the slower-opening group. These are outcome ranges, not confidence intervals or causal strategy effects."
    data=rows('course_familiarity','familiarity.csv')
    a,b=pick(data,city='Boston',label='Previously recorded on this course'),pick(data,city='Boston',label='First recorded on this course')
    if a and b:
        findings['course_familiarity']=f"In Boston’s matched sample, runners with an earlier recorded Boston finish slowed by {a['value']:.1f}% between the two 20 km blocks, versus {b['value']:.1f}% for first-recorded Boston runners. That association does not isolate the benefit of knowing the course."
    data=rows('weather_pacing_patterns','weather_outcomes.csv')
    a,b=pick(data,label='15–19.9°C'),pick(data,label='Below 10°C')
    if a and b:
        findings['weather_pacing_patterns']=f"Across {int(a['editions'])} eligible editions at 15–19.9°C, the average edition-median finish was {change(a['value'])} than the earlier benchmark; across {int(b['editions'])} editions below 10°C, it was {change(b['value'])}. The course and field mix differs, so this is not a measured temperature penalty."
    data=rows('milestone_finishing_speed','kick.csv')
    a,b=pick(data,target='Under 4 hours',label='Up to 2 minutes ahead'),pick(data,target='Under 4 hours',label='Up to 2 minutes behind')
    if a and b:
        findings['milestone_finishing_speed']=f"Near a four-hour projection at 40 km, the median final-section pace was {change(a['value'])} than the previous section for runners just ahead, and {change(b['value'])} for those just behind. A finishing acceleration does not by itself establish a goal-driven sprint."
    data=rows('near_miss_recorded_return','returns.csv')
    a,b=pick(data,target='Under 4 hours',label='Finished at or just over'),pick(data,target='Under 4 hours',label='Finished just under')
    if a and b:
        findings['near_miss_recorded_return']=f"Around four hours, {a['value']:.1f}% of runners finishing at or just over the target appeared again in the following two calendar years, versus {b['value']:.1f}% finishing just under it. This measures recorded return, not whether somebody continued running."
    data=rows('pacing_habit_persistence','correlation.csv')
    a,b=pick(data,label=1),pick(data,label=3)
    if a and b:
        findings['pacing_habit_persistence']=f"Pace retention showed a correlation of {a['value']:.2f} across consecutive recorded races one calendar year apart, and {b['value']:.2f} three years apart. There is persistence, but a runner’s earlier pacing pattern is not destiny."
    data=rows('experience_and_pacing','experience.csv')
    a,b=pick(data,label='1 earlier finish'),pick(data,label='5 or more earlier finishes')
    if a and b:
        findings['experience_and_pacing']=f"More recorded experience was not simply associated with less slowing: median second-20-km slowdown was {a['retention']:.1f}% after one earlier finish and {b['retention']:.1f}% after five or more. Age, course choice and who keeps racing can affect this comparison."
    data=[r for r in rows('race_spacing_outcomes','spacing.csv') if r['sample']=='All dated pairs']
    if data:
        lo,hi=min(r['median'] for r in data),max(r['median'] for r in data)
        findings['race_spacing_outcomes']=f"Across the displayed race-interval bands, median next-finish change ranged from {lo:+.1f}% to {hi:+.1f}%. Individual outcomes were much more variable than those medians. The data do not identify an optimal recovery interval."
    data=rows('strong_finish_followup','kick_success.csv')
    a,b=pick(data,label='More than 5% faster finish section'),pick(data,label='Similar or slower finish section')
    if a and b:
        findings['strong_finish_followup']=f"A next-race improvement of more than 2% occurred in {a['value']:.1f}% of pairs after a finishing section more than 5% faster than the preceding section, versus {b['value']:.1f}% after a similar or slower finish. This does not prove unused capacity in the earlier race."
    data=rows('qualifying_threshold_comparison','thresholds.csv')
    a,b=pick(data,benchmark='Five-minute-faster standard',label='2016–2017 races'),pick(data,benchmark='Five-minute-faster standard',label='2019 races')
    if a and b:
        findings['qualifying_threshold_comparison']=f"Only {int(a['cities'])} city met both-period sample requirements near the faster standard. Among those close finishes, {a['value']:.1f}% were at or below it in 2016–2017 and {b['value']:.1f}% in 2019. This narrow comparison cannot establish that the qualifying-rule change altered pacing."
    data=rows('goal_slip_recovery','slips.csv')
    a,b=pick(data,target='Under 4 hours',label=25),pick(data,target='Under 4 hours',label=40)
    if a and b:
        findings['goal_slip_recovery']=f"Among runners initially near a four-hour target at 20 km, {a['value']:.1f}% who first slipped behind its budget at 25 km still broke four hours. For those first behind at 40 km, the rate was {b['value']:.1f}%. These checkpoints select different runners."
    data=rows('earlier_best_section_gains','gains.csv')
    a,b=pick(data,label='Opening 10 km'),pick(data,label='Final 12.195 km')
    if a and b:
        total=sum(r['value'] for r in data)
        findings['earlier_best_section_gains']=f"The average improvement over an earlier-year recorded best was {total:.1f} minutes. The final 12.195 km supplied {b['value']:.1f} of those minutes: {b['pace_gain']:.1f} seconds gained per km, versus {a['pace_gain']:.1f} seconds per km in the opening 10 km."
    data=rows('paired_course_comparisons','course_pairs.csv')
    a=pick(data,origin='Boston',label='Chicago')
    if a:
        findings['paired_course_comparisons']=f"Among {int(a['n_value']):,} linked Boston–Chicago race pairs, Chicago finishes averaged {abs(a['value']):.1f} minutes {'faster' if a['value']<0 else 'slower'} after equally weighting the two race orders. Fitness, weather and selection still differ; this is not a personal equivalent-time forecast."
    data=rows('course_outcome_spread','course_spread.csv')
    a,b=pick(data,ability_band='3:30–4 hours',label='Boston'),pick(data,ability_band='3:30–4 hours',label='Chicago')
    if a and b:
        findings['course_outcome_spread']=f"In the prior-best band of 3:30–4 hours, median finishes were {change(a['median'])} than that benchmark in Boston and {change(b['median'])} in Chicago. The charts show the much wider spread within each course; these are different fields, not a course ranking."
    data=rows('distance_and_elapsed_change','elapsed.csv')
    a,b=pick(data,pace='Under 4 min/km',label=25),pick(data,pace='6 min/km or slower',label=25)
    if a and b:
        findings['distance_and_elapsed_change']=f"For runners whose first slow section ended at 25 km, median arrival there was {a['upper']:.0f} minutes in the under-4-min/km early-pace group and {b['upper']:.0f} minutes in the 6-min/km-or-slower group. Distance and elapsed time describe different aspects; these observations do not identify the cause of slowing."
    # Keep categorical chart rows in a human-readable sequence, not alphabetic.
    orders={
      'spacing.csv':['1–89 days','90–179 days','180–364 days','365–729 days','730–1095 days'],
      'kick.csv':['2–5 minutes ahead','Up to 2 minutes ahead','Up to 2 minutes behind','2–5 minutes behind'],
      'hits.csv':['2–5 minutes ahead','Up to 2 minutes ahead','Up to 2 minutes behind','2–5 minutes behind'],
      'success_rates.csv':['Faster second 20 km','Similar 20 km blocks','Moderate slowing','Pronounced slowing'],
    }
    change_tables={
      'opening_tradeoffs':['matched_openings.csv'],'slow_start_responses':['responses.csv'],
      'strategy_outcome_spread':['spread.csv'],'course_outcome_spread':['course_spread.csv'],
      'race_day_context':['race_days.csv'],'race_spacing_outcomes':['spacing.csv'],
      'strong_finish_followup':['kick_followup.csv'],'weather_pacing_patterns':['weather_outcomes.csv'],
    }
    for pack in set(findings)|set(change_tables):
        folder=root/('ext_'+pack)
        path=folder/'summary.json';summary=json.loads(path.read_text())
        if pack in findings: summary['answer_prose']=findings[pack]
        for spec in summary['charts']:
            if spec['table'] in change_tables.get(pack,[]): spec['unit']='% change'
        path.write_text(json.dumps(summary,indent=2,allow_nan=False)+'\n')
        path=folder/'pack_meta.json';meta=json.loads(path.read_text())
        meta['narrative_script_sha256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
        path.write_text(json.dumps(meta,indent=2,allow_nan=False)+'\n')
        for file,order in orders.items():
            path=folder/'tables'/file
            if not path.exists(): continue
            with path.open() as stream: table=list(csv.DictReader(stream))
            if not all(row['label'] in order for row in table): continue
            table.sort(key=lambda row:tuple(row.get(k,'') for k in ['sample','target'])+(order.index(row['label']),))
            with path.open('w',newline='') as stream:
                writer=csv.DictWriter(stream,fieldnames=table[0].keys());writer.writeheader();writer.writerows(table)
    print(f'Generated {len(findings)} numerical answer summaries from aggregate tables.')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,required=True)
    run(parser.parse_args().output)

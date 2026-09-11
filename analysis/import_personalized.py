"""Validate the personalized aggregate artifact, then import its single owned pack."""
import argparse
import hashlib
import json
import math
import re
import shutil
import tempfile
import zipfile
from pathlib import Path

PACK='ext_personalized_guide'
LENGTHS=[5]*8+[2.195]


def finite(values):
    assert all(isinstance(x,(int,float)) and math.isfinite(x) for x in values), 'Invalid numeric aggregate'


def sample(row):
    assert isinstance(row['n'],int) and row['n']>=100, 'Small public cell'
    assert isinstance(row['editions'],int) and 1<=row['editions']<=row['n']


def distribution(row,has_pace=True,has_cdf=True):
    sample(row)
    finite(row['finish']+[row['retention'],row['late']])
    assert len(row['finish'])==3 and row['finish']==sorted(row['finish'])
    assert len(row['cdf'])==(121 if has_cdf else 0)
    assert row['cdf']==sorted(row['cdf']) and all(isinstance(n,int) and 0<=n<=row['n'] for n in row['cdf'])
    assert len(row['pace'])==(9 if has_pace else 0)
    for values in row['pace']:
        finite(values);assert len(values)==3 and values==sorted(values) and values[0]>=120 and values[-1]<=1200


def validate_archive(archive,expected_export):
    with zipfile.ZipFile(archive) as bundle:
        infos=[i for i in bundle.infolist() if not i.is_dir()]
        assert sum(i.file_size for i in infos)<=128*1024**2, 'Oversized aggregate artifact'
        assert len({i.filename for i in infos})==len(infos), 'Duplicate artifact entry'
        assert all(re.fullmatch(PACK+r'/(pack_meta\.json|summary\.json|tables/(city|checkpoint)_[0-9]{2,3}\.json)',i.filename) for i in infos), 'Unexpected artifact member'
        files={i.filename:json.loads(bundle.read(i)) for i in infos}
    meta=files[f'{PACK}/pack_meta.json'];summary=files[f'{PACK}/summary.json']
    assert meta['id']==PACK and meta['presentation']=='personalized-guide' and meta['status']=='ready'
    assert meta['analysis_count']==summary['analyses']==12 and meta['schema_version']==summary['schema_version']==1
    assert meta['input_export_id']==summary['export_id']==expected_export
    for k in ['analysis_script_sha256','input_asset_sha256','input_manifest_sha256','supporting_script_sha256']:
        assert re.fullmatch('[a-f0-9]{64}',meta[k]), 'Missing provenance checksum'
    c=meta['cohort']
    assert sum(c[k] for k in ['duplicates_removed','missing_or_unparsed','non_increasing','outside_quality_bounds','eligible'])==c['raw']
    assert summary['n']==meta['n']==c['eligible'] and 0<summary['age_n']<=summary['n']
    expected={f'{PACK}/pack_meta.json',f'{PACK}/summary.json'}
    cohorts_seen=0;checkpoint_seen=0
    for city in summary['cities']:
        file=f"{PACK}/tables/{city['file']}";cpfile=f"{PACK}/tables/{city['checkpoint_file']}"
        expected.update([file,cpfile]);data=files[file];cp=files[cpfile]
        assert data['city']==cp['city']==city['city']
        assert set(data)=={'city','cohorts','terrain'} and set(cp)=={'city','rows'}
        for key,row in data['cohorts'].items():
            assert set(row)<=set('n editions finish cdf retention late pace age gender prior profiles openings near weather gains repeat performance'.split())
            assert key=='|'.join([row['age'],row['gender'],row['prior']])
            assert row['age']=='all' or re.fullmatch(r'(18|[2-8][05])–(24|[2-8][49])',row['age'])
            assert row['gender'] in ['all','Women','Men']
            assert row['prior']=='all' or row['prior'].isdigit()
            distribution(row);cohorts_seen+=1
            for bucket,value in row['profiles'].items():
                assert int(bucket) in range(150,271,15);distribution(value,has_cdf=False)
            for opening,value in row['openings'].items():
                assert opening in ['Faster opening','Similar opening','Slower opening'];distribution(value,has_pace=False)
            for near in row['near']:
                assert near['target'] in range(150,271)
                for side in ['below','above']:
                    value=near[side];sample(value);finite(value['durations']);assert len(value['durations'])==9
                    mean=sum(value['durations'])/60
                    lo=near['target']-(5 if side=='below' else 0)
                    assert lo-1e-4<=mean<=lo+5+1e-4
            for weather in row['weather']:
                sample(weather);finite([weather['value']]);assert weather['editions']>=3
            if 'repeat' in row:
                value=row['repeat'];sample(value);finite(value['previous']+value['current']+[value['finish_change']])
                for profile in [value['previous'],value['current']]:
                    assert len(profile)==9 and abs(sum(km*x for km,x in zip(LENGTHS,profile)))<0.01
            if 'performance' in row:
                value=row['performance'];sample(value);finite(value['values']);assert value['values']==sorted(value['values'])
            for value in row['gains'].values():
                sample(value);finite(value['values']+[value['total'],value['previous'],value['current']])
                assert len(value['values'])==3 and abs(sum(value['values'])-value['total'])<0.001
                assert abs((value['previous']-value['current'])/60-value['total'])<0.001
        for terrain in data['terrain']:
            assert set(terrain)=={'end','net','gain','loss'};finite([x for x in terrain.values() if x is not None])
        cpkeys=[]
        for row in cp['rows']:
            assert set(row)==set('age gender checkpoint elapsed trend n editions finish retention late pace cdf'.split())
            distribution(row,has_pace=False);assert row['checkpoint'] in [20,30,35] and row['elapsed']%2==0
            cpkeys.append((row['age'],row['gender'],row['checkpoint'],row['elapsed'],row['trend']));checkpoint_seen+=1
        assert len(set(cpkeys))==len(cpkeys)
    assert set(files)==expected, 'Missing or unreferenced aggregate shard'
    for row in summary['courses']:
        sample(row);finite(row['values']);assert row['editions']>=3 and row['values']==sorted(row['values'])
    return files,{'cohorts':cohorts_seen,'checkpoint_cells':checkpoint_seen}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive',type=Path,required=True)
    parser.add_argument('--expected-export',required=True)
    parser.add_argument('--check-only',action='store_true')
    args=parser.parse_args()
    files,audit=validate_archive(args.archive,args.expected_export)
    if not args.check_only:
        output=Path(__file__).resolve().parents[1]/'public/data/packs'
        # Write the chart aggregate JSON expected by the personalized renderer.
        # The host may compress HTTP responses; the source remains reviewable.
        with tempfile.TemporaryDirectory(prefix='personalized-import-') as tmp:
            staging=Path(tmp)/PACK;(staging/'tables').mkdir(parents=True)
            meta=files[f'{PACK}/pack_meta.json'];summary=files[f'{PACK}/summary.json']
            meta['transport_encoding']='json'
            meta['transport_script_sha256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
            meta['transport_shards_sha256']={}
            for name,data in files.items():
                if '/tables/' not in name:continue
                if 'rows' in data:
                    data['rows'].sort(key=lambda row:(row['checkpoint'],row['elapsed'],row['age'],row['gender'],row['trend']))
                content=(json.dumps(data,separators=(',',':'),sort_keys=True,allow_nan=False)+'\n').encode()
                target=Path(name).name;(staging/'tables'/target).write_bytes(content)
                assert json.loads(content)==data
                meta['transport_shards_sha256'][target]=hashlib.sha256(content).hexdigest()
            (staging/'pack_meta.json').write_text(json.dumps(meta,indent=2)+'\n')
            (staging/'summary.json').write_text(json.dumps(summary,separators=(',',':'))+'\n')
            if (output/PACK).exists():shutil.rmtree(output/PACK)
            shutil.copytree(staging,output/PACK)
    print(json.dumps({'validated_analyses':12,'export':args.expected_export,**audit,'imported':not args.check_only}))


if __name__=='__main__':main()

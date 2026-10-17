from pathlib import Path
from PIL import Image
import runpy,contextlib,io,json,re
with contextlib.redirect_stdout(io.StringIO()):state=runpy.run_path('docs/report/extract_doc.py')
data=state['get']('Data');meta=json.loads(Path('docs/report/work/images.json').read_text())
# Keep diagrams and research exhibits; signatures and administrative covers are excluded.
selected=[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,51,52,53,54,55,56]
out=Path('assets/img/report');out.mkdir(exist_ok=True)
for i in selected:
 m=meta[i];buf=data[m['offset']:m['offset']+m['size']]
 im=Image.open(io.BytesIO(buf)).convert('RGB');im.thumbnail((1600,1800));im.save(out/f'figure-{i:02}.jpg',quality=87,optimize=True)
print('Report figures:',len(selected),'bytes:',sum(p.stat().st_size for p in out.glob('*.jpg')))

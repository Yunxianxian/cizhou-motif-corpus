from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import runpy,contextlib,io,struct,json
with contextlib.redirect_stdout(io.StringIO()):state=runpy.run_path('docs/report/extract_doc.py')
data=state['get']('Data');found=[]
for signature,kind in [(b'\x89PNG\r\n\x1a\n','png'),(b'\xff\xd8\xff','jpg')]:
 start=0
 while True:
  i=data.find(signature,start)
  if i<0:break
  start=i+len(signature)
  try:
   if kind=='png':
    end=i+8
    while True:
     size=struct.unpack_from('>I',data,end)[0];typ=data[end+4:end+8];end+=12+size
     if end>len(data):raise ValueError()
     if typ==b'IEND':break
   else:
    end=data.find(b'\xff\xd9',i+3)+2
    if end<2:continue
   buf=data[i:end]
   im=Image.open(io.BytesIO(buf));im.load()
   if min(im.size)<80:continue
   found.append((i,kind,im.convert('RGB'),buf))
  except Exception:pass
found.sort(key=lambda r:r[0]);folder=Path('docs/report/work');folder.mkdir(exist_ok=True)
meta=[]
for j,(offset,kind,im,buf) in enumerate(found):meta.append({'index':j,'offset':offset,'format':kind,'width':im.width,'height':im.height,'size':len(buf)})
for batch in range((len(found)+29)//30):
 items=found[batch*30:(batch+1)*30];sheet=Image.new('RGB',(1200,((len(items)+4)//5)*170),'#ddd');d=ImageDraw.Draw(sheet)
 for k,(_,_,im,_) in enumerate(items):
  th=ImageOps.contain(im,(226,140));x=k%5*240;y=k//5*170;sheet.paste(th,(x+(226-th.width)//2,y));d.text((x+6,y+143),f'{batch*30+k}: {im.width}x{im.height}',fill='#111')
 sheet.save(folder/f'contact-{batch}.jpg')
(folder/'images.json').write_text(json.dumps(meta,indent=2))
print('Figures',len(found),'contact sheets',(len(found)+29)//30)

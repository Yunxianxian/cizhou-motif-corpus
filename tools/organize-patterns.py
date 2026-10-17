from pathlib import Path
import hashlib,json,shutil,html
from collections import defaultdict
from PIL import Image,ImageOps,ImageDraw,ImageFont,ImageStat

ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'纹样图片'
OUT=SOURCE/'整理版'
CONFIG=[('缠枝纹训练集','01_缠枝纹_器物局部','chanzhi-photo','缠枝纹 · 器物局部'),('卷草纹训练集','02_卷草纹_线稿','juancao-line','卷草纹 · 线稿'),('训练集2','03_原标牡丹纹_黑色纹样','mudan-black','原标牡丹纹 · 黑色纹样'),('训练集3','04_原标牡丹纹_线描纹样','mudan-outline','原标牡丹纹 · 线描纹样')]
font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',14)
font_big=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',24)

def run():
 OUT.mkdir(exist_ok=True)
 entries=[];checks=defaultdict(list);pixels=defaultdict(list);counts={};invalid=[]
 for origin,folder,prefix,title in CONFIG:
  paths=sorted(p for p in (SOURCE/origin).rglob('*') if p.suffix.lower() in {'.jpg','.jpeg','.png'})
  counts[title]=len(paths);dest=OUT/folder;dest.mkdir(exist_ok=True)
  thumbs=dest/'缩略图';thumbs.mkdir(exist_ok=True)
  sheet=Image.new('RGB',(1200,66+((len(paths)+5)//6)*190),'#f2f2f2');draw=ImageDraw.Draw(sheet)
  draw.text((18,16),f'{title} / {len(paths)} 张',font=font_big,fill='#222')
  for i,p in enumerate(paths,1):
   uid=f'{prefix}-{i:03}'
   name=uid+p.suffix.lower();target=dest/name
   shutil.copy2(p,target)
   label=p.with_suffix('.txt');labelpath=None
   if label.exists():
    labelpath=dest/(uid+'.txt');shutil.copy2(label,labelpath)
   raw=p.read_bytes();digest=hashlib.sha256(raw).hexdigest();checks[digest].append(uid)
   with Image.open(p) as original:
    original.verify()
   with Image.open(p) as original:
    im=ImageOps.exif_transpose(original).convert('RGB');w,h=im.size
    pixels[hashlib.sha256(f'{w}x{h}'.encode()+im.tobytes()).hexdigest()].append(uid)
    thumb=ImageOps.contain(im,(320,240));thumb.save(thumbs/(uid+'.jpg'),quality=88)
    tile=ImageOps.contain(im,(184,148));x=(i-1)%6*200+8;y=66+(i-1)//6*190
    sheet.paste(tile,(x+(184-tile.width)//2,y+(148-tile.height)//2))
    draw.text((x,y+151),uid,font=font,fill='#333')
    draw.text((x,y+170),f'{w} × {h}',font=font,fill='#777')
    notes=[]
    if min(w,h)<256:notes.append('短边不足256像素，放大使用需检查清晰度')
    if prefix.startswith('mudan'):notes.append('花种沿用原标签，尚未做学术鉴定')
    if prefix=='mudan-black' and p.stem in {'17','19','20','24','26','28','30','31','33','37','38','39','40','41','44','49'}:notes.append('外观疑似莲花、莲叶或其他花卉，建议优先核对')
    if prefix=='mudan-outline' and p.stem in {'09','14','18','19','22','26','47'}:notes.append('外观疑似莲花、花蕾或其他花卉，建议优先核对')
    if ImageStat.Stat(im.convert('L')).mean[0]<65:notes.append('整体偏暗，建议检查展示清晰度')
   entries.append(dict(id=uid,category=title,source=str(p.relative_to(ROOT)).replace('\\','/'),file=str(target.relative_to(OUT)).replace('\\','/'),thumbnail=f'{folder}/缩略图/{uid}.jpg',label=str(labelpath.relative_to(OUT)).replace('\\','/') if labelpath else None,width=w,height=h,bytes=len(raw),sha256=digest,notes=notes))
  sheet.save(OUT/(folder+'_索引.jpg'),quality=92)
 duplicate_bytes=[v for v in checks.values() if len(v)>1]
 duplicate_pixels=[v for v in pixels.values() if len(v)>1]
 manifest=dict(total=len(entries),categories=counts,duplicate_bytes=duplicate_bytes,duplicate_pixels=duplicate_pixels,items=entries)
 (OUT/'素材清单.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 data=json.dumps(entries,ensure_ascii=False).replace('<','\\u003c')
 gallery='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>纹样素材索引</title><style>*{box-sizing:border-box}body{margin:0;background:#f7f7f7;color:#333;font:14px/1.65 system-ui,"Microsoft YaHei",sans-serif}header{background:white;padding:32px max(20px,5vw);border-bottom:1px solid #ddd}h1{margin:0;font-size:28px}p{color:#777}main{max-width:1480px;margin:auto;padding:24px}nav{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px}input,select{padding:12px;border:1px solid #ddd;background:white;border-radius:10px;font:inherit}input{flex:1;min-width:220px}#grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(225px,1fr));gap:18px}article{background:white;border:1px solid #e6e6e6;border-radius:16px;overflow:hidden}article img{width:100%;height:210px;object-fit:contain;padding:12px;background:#fff}section{padding:14px}b{display:block}small{color:#777}a{color:#444}details{margin-top:10px}summary{cursor:pointer;color:#806343}a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #888}#empty{padding:30px}</style><header><h1>纹样素材索引</h1><p>121 张素材 · 原图与训练标签完整保留 · 分类沿用来源，花种待核对标记可筛选</p></header><main><nav><input id="search" aria-label="搜索素材" placeholder="搜索编号、原文件名、核对备注"><select id="category" aria-label="分类"><option value="">全部分类</option></select><select id="review" aria-label="核对筛选"><option value="">全部素材</option><option value="review">优先核对花种</option><option value="small">短边不足256像素</option></select></nav><p id="count" aria-live="polite"></p><div id="grid"></div><div id="empty" hidden>没有匹配的素材</div></main><script>const items=__DATA__;const cat=document.querySelector('#category'),search=document.querySelector('#search'),review=document.querySelector('#review');for(const name of [...new Set(items.map(x=>x.category))]){const o=document.createElement('option');o.value=name;o.textContent=name;cat.append(o)}const safe=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));function render(){const q=search.value.trim().toLowerCase(),list=items.filter(x=>(!cat.value||x.category===cat.value)&&(!q||[x.id,x.source,...x.notes].join(' ').toLowerCase().includes(q))&&(!review.value||(review.value==='review'?x.notes.some(n=>n.includes('优先核对')):Math.min(x.width,x.height)<256)));document.querySelector('#count').textContent=`显示 ${list.length} / ${items.length} 张`;document.querySelector('#empty').hidden=!!list.length;document.querySelector('#grid').innerHTML=list.map(x=>`<article><a href="${encodeURI(x.file)}" target="_blank"><img loading="lazy" src="${encodeURI(x.thumbnail)}" alt="${safe(x.id+' '+x.category)}"></a><section><b>${safe(x.id)}</b><small>${safe(x.category)}<br>${x.width} × ${x.height} · ${(x.bytes/1024).toFixed(1)} KB</small><p><a href="${encodeURI(x.file)}" target="_blank">查看原图</a>${x.label?` · <a href="${encodeURI(x.label)}" target="_blank">原始标签</a>`:''}</p><details><summary>来源与核对备注</summary><small>${safe(x.source)}<br>${x.notes.map(safe).join('<br>')||'无额外备注'}</small></details></section></article>`).join('')}search.addEventListener('input',render);cat.addEventListener('change',render);review.addEventListener('change',render);render();</script></html>'''
 (OUT/'纹样素材索引.html').write_text(gallery.replace('__DATA__',data),encoding='utf-8')
 lines=['# 纹样图片整理说明','', '原始四个训练集保持原样；整理版采用复制方式，原图不压缩、不裁切、不改色，配套 TXT 标签按原字节复制。缩略图与索引图仅用于浏览。','', '| 类别 | 图片数量 |','| --- | --- |']+[f'| {k} | {v} |' for k,v in counts.items()]
 lines+=['',f'共 {len(entries)} 张图片，配套标签 {sum(bool(e["label"]) for e in entries)} 份。','', '## 使用方式','', '双击「纹样素材索引.html」可离线浏览，支持按类别、编号、原文件名与备注筛选。四张「索引.jpg」可快速总览。素材清单.json 包含尺寸、SHA-256、原文件路径和统一编号，可用于后续网页接入。','', '## 分类与质量说明','', '卷草纹训练集为线稿；缠枝纹训练集主要为器物表面局部照片。两组原标牡丹纹为提取的黑色纹样、线描纹样，部分外观疑似莲花、莲叶等，已逐项标记建议优先核对。当前分类是素材管理分类，不代表博物馆或学术鉴定结论。',f'短边不足 256 像素：{sum(min(e["width"],e["height"])<256 for e in entries)} 张；优先核对花种：{sum(any("优先核对" in n for n in e["notes"]) for e in entries)} 张。','',f'文件完全相同的重复组：{len(duplicate_bytes)}；解码后像素完全相同的重复组：{len(duplicate_pixels)}。未自动删除。']
 for group in duplicate_pixels:lines.append('- 像素重复：'+ '、'.join(group))
 lines+=['','## 网页使用','', '本次仅整理素材，尚未替换网页纹样。不要根据图像外观自行补写年代、器物出处、尺寸、馆藏来源等学术元数据；接入时需建立图片与纹样记录的对应关系。']
 (OUT/'整理说明.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
 for e in entries:
  assert hashlib.sha256((OUT/e['file']).read_bytes()).hexdigest()==e['sha256']
  assert (OUT/e['thumbnail']).exists()
  if e['label']:assert (OUT/e['label']).read_bytes()==(ROOT/e['source']).with_suffix('.txt').read_bytes()
 print(json.dumps({'total':len(entries),'labels':sum(bool(e['label']) for e in entries),'exact_duplicates':duplicate_bytes,'pixel_duplicates':duplicate_pixels,'small':sum(min(e['width'],e['height'])<256 for e in entries),'output':str(OUT)},ensure_ascii=False))

if __name__=='__main__':run()

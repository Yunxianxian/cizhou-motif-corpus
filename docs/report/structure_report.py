from pathlib import Path
import re,json
raw=Path('docs/report/extracted.txt').read_text(encoding='utf-8')
def clean_fields(s):
 result=[];stack=[]
 for c in s:
  if c=='\x13':stack.append(False)
  elif c=='\x14':
   if stack:stack[-1]=True
  elif c=='\x15':
   if stack:stack.pop()
  elif (not stack or all(stack)) and (ord(c)>=32 or c in '\n\t'):result.append(c)
 return ''.join(result)
text=clean_fields(raw)
lines=[s.strip() for s in text.splitlines()]
# Strip automatic contents, cover pages and administrative forms from reading views.
first=next(i for i,s in enumerate(lines) if s=='第一章 引言')
ref=next(i for i in range(first,len(lines)) if lines[i]=='参考文献')
main=lines[first:ref]
starts=[i for i,s in enumerate(main) if re.match('^第[一二三四五六七八九十]+章 ',s)]
labels=['引言','项目研究概述','研究内容和研究方法','项目创新点','语料库的数字人文实践','LoRA训练与创新设计','创新应用研究成果']
summaries=[
 '从传统纹样资源的保护与传承需求出发，梳理本项目的研究目标、实施路径与实践成果。',
 '研究背景、现实痛点与解决方向，以及项目在文化保护、学术研究、技术与产业层面的意义。',
 '介绍多源资料采集、图像处理、结构化语料建设与AI辅助创新的研究内容及方法。',
 '以系统资源整合、多维语义标注和可控生成式人工智能为核心，探索传统纹样的当代活化。',
 '从实地影像、文献与三维档案出发，说明分类、矢量化、语义标注与平台功能的建设流程。',
 '展示数据集搭建、提示词层级、训练参数与对照实验，呈现报告中的模型筛选结论。',
 '集中展示平台视觉设计、实地采集、区域品牌、数字文化衍生设计及传播实践。']
# Figure references use source document numbering, with extracts from the embedded figures.
figmap={'图5.1':[4],'图5.2':[5],'图5.3':[6,7],'图6.1':[8],'图6.2':[9,10],
 '表6.3':[11],'表6.4':[12],'图7.1':[13,14],'图7.2':[15,16],'图7.3':[17,18],
 '图7.5':[19,20,21,22],'图7.6':[23,24,25,26],'图7.7':[27,28,29,30,31,32],'图7.8':[33,34,35]}
# Some source table cells include the next numbered heading on the same line.
def split_lines(ls):
 out=[]
 for line in ls:
  out.extend(re.split(r'\s*\|\s*\|\s*(?=6\.2\.[34]\s)',line))
 return out

def blocks(ls,mapping):
 result=[]
 for line in split_lines(ls):
  if not line or re.fullmatch(r'[（(]?[abc][）)]?(?:\s+[（(]?[abc][）)]?)*',line):continue
  if line.startswith('（图片来源') or line.startswith('图源：'):continue
  figure=next((k for k in mapping if line.startswith(k+' ') or line.startswith(k+'　')),None)
  if figure:
   result.append({'type':'figures','ids':mapping[figure],'caption':line});continue
  if re.match(r'^图\d+\.\d+',line):
   # Textual mentions stay in paragraphs; unassigned standalone captions are omitted.
   if len(line)<70:continue
  if ' | ' in line:
   rows=[]
   for row in re.split(r'\|\s*\|',line):
    cols=[c.strip() for c in row.split('|') if c.strip()]
    if cols:rows.append(cols)
   if rows:result.append({'type':'table','rows':rows})
  else:result.append({'type':'text','text':line})
 return result

def sections(ls,mapping,mode='main'):
 result=[];current={'title':'内容导读','blocks':[],'children':[]};child=None
 for line in split_lines(ls):
  heading=(re.match(r'^第[一二三四五六七八九十]+节\s+',line) if mode=='main' else re.match(r'^[一二三四五六七八九十]+、',line))
  sub=re.match(r'^\d+\.\d+\.\d+(?:\.\d+)?\s+',line) if mode=='main' else re.match(r'^（[一二三四五六七八九十]+）',line)
  if heading or line=='参考文献':
   if current['blocks'] or current['children']:result.append(current)
   current={'title':line,'blocks':[],'children':[]};child=None
  elif sub:
   child={'title':line,'blocks':[]};current['children'].append(child)
  else:
   dest=child if child else current;dest['blocks'].extend(blocks([line],mapping))
 if current['blocks'] or current['children']:result.append(current)
 return result
chapters=[]
for j,a in enumerate(starts):
 b=starts[j+1] if j+1<len(starts) else len(main)
 chapters.append({'id':f'chapter-{j+1}','kind':'研究主报告','eyebrow':f'CHAPTER {j+1:02}','title':labels[j],
 'sourceTitle':main[a],'summary':summaries[j],'sections':sections(main[a+1:b],figmap)})
# Research papers are given their own reading routes rather than appended to chapter seven.
p1=next(i for i in range(ref,len(lines)) if lines[i]=='项目研究成果1')
p2=next(i for i in range(p1+1,len(lines)) if lines[i]=='项目研究成果2')
reflection=next(i for i in range(p2+1,len(lines)) if lines[i]=='体验与感言')
thanks=next(i for i in range(reflection+1,len(lines)) if re.fullmatch(r'致\s*谢',lines[i]))
appendix=next(i for i in range(thanks+1,len(lines)) if re.fullmatch(r'附\s*件',lines[i]))
papers=[]
for n,(a,b,title,desc) in enumerate([
 (p1,p2,'基于LoRA模型的磁州窑黑白刻纹样创新设计研究','聚焦黑白刻牡丹纹的特征提取、标准化数据集及模型训练，讨论风格还原、生成创新与研究局限。'),
 (p2,reflection,'数字人文视域下的磁州窑数智化图案语料库构建','围绕数据采集、结构化处理、知识组织与数字传播，说明图案语料库的构建方法和平台实践。')]):
 segment=lines[a:b];intro=next(i for i,s in enumerate(segment) if re.fullmatch(r'引\s*言',s))
 abstract=next(i for i,s in enumerate(segment) if re.fullmatch(r'摘\s*要',s))
 body=segment[intro+1:]
 mapping=({'表1':[36,37,38,39,40,41,42,43,44,45],'表4':[11],'表5':[12],'图1':[46],'图2':[9,10]} if n==0 else {'图2.1':[51],'图3.1':[53],'图3.2':[52],'图3.3':[54,55,56],'图3.4':[14,13],'图3.5':[15],'图3.6':[16],'图3.7':[17],'图3.8':[18]})
 papers.append({'id':f'paper-{n+1}','kind':'研究成果','eyebrow':f'STUDY {n+1:02}',
 'title':title,'summary':desc,'sections':[{'title':'摘要','blocks':blocks([segment[abstract+1]],{}),'children':[]}]+sections(body,mapping,'paper')})
refs=[line for line in lines[ref+1:p1] if re.match(r'^\[\d+\]',line)]
extras=[{'id':'reflection','kind':'项目回顾','eyebrow':'REFLECTION','title':'体验与感言','summary':'从田野调查、语料整理到AI辅助设计，回顾团队的实践收获与对文化真实性的思考。','sections':sections(lines[reflection+1:thanks],{})},
 {'id':'thanks','kind':'项目回顾','eyebrow':'ACKNOWLEDGEMENTS','title':'致谢','summary':'感谢指导教师、博物馆工作人员、团队成员，以及为磁州窑文化保护与传承付出努力的工作者。','sections':sections(lines[thanks+1:appendix],{})},
 {'id':'references','kind':'资料与附件','eyebrow':'REFERENCES','title':'参考文献与项目附件','summary':'保留主报告参考文献，并提供原报告列出的项目申请书和中期报告书链接。','sections':[{'title':'主报告参考文献','blocks':[{'type':'text','text':line} for line in refs],'children':[]},{'title':'项目附件','blocks':[{'type':'link','title':'项目申请书','description':'南开大学本科生创新科研计划项目申请书','href':'https://www.kdocs.cn/l/cnCElxhlFLyg'},{'type':'link','title':'中期报告书','description':'南开大学本科生创新科研计划项目中期报告书','href':'https://www.kdocs.cn/l/cuqWCfOnryt1'}],'children':[]}]}]
allfigs=set()
for chapter in chapters+papers+extras:
 for section in chapter['sections']:
  for part in [section]+section.get('children',[]):
   for block in part['blocks']:
    if block['type']=='figures':allfigs.update(block['ids'])
figures={str(i):{'src':f'assets/img/report/figure-{i:02}.jpg'} for i in sorted(allfigs)}
report={'title':'磁州窑纹样数智化图案语料库构建与创新应用研究总结报告','shortTitle':'项目总结报告',
 'date':'2026年3月20日','period':'2025年3月—2026年3月','projectId':'202510055005','projectType':'国家级大学生创新训练计划','institution':'南开大学文学院','leader':'霍璇','advisor':'刘俊玲',
 'summary':'以磁州窑传统纹样为研究对象，贯通实地采集、语料整理、语义标注、LoRA模型训练与数字传播，探索传统纹样从文化资源到数字资产、再到创新应用的转化路径。',
 'abstract':next(lines[i+1] for i,s in enumerate(lines) if re.fullmatch(r'摘\s*要',s)),
 'stats':[{'value':'4000+','label':'文物资料影像'},{'value':'42','label':'文物与瓷片展示模型'},{'value':'12','label':'照片合成精细模型'},{'value':'9','label':'考古级激光扫描模型'}],
 'highlights':[{'title':'从采集到知识组织','text':'将图像、文献与三维档案纳入统一语料体系，通过工艺、器型、母题及文化语义建立关联。'},
 {'title':'从语料到模型训练','text':'围绕牡丹纹与卷草纹开展LoRA实践。报告中的白地黑花牡丹实验以第10轮、0.6～0.8权重区间表现较佳。'},
 {'title':'从研究到传播应用','text':'形成交互平台原型、区域品牌标识与数字文化衍生设计，并开展课程实践。相关杂志文章在报告中列为拟发表成果。'}],
 'chapters':chapters,'papers':papers,'extras':extras,'figures':figures}
Path('assets/js/report-data.js').write_text('/* Report content transcribed and structured from the user-supplied final report. */\n(function () {\n  window.CZ = window.CZ || {};\n  window.CZ.REPORT = '+json.dumps(report,ensure_ascii=False,indent=2)+';\n})();\n',encoding='utf-8')
Path('docs/report/content-map.json').write_text(json.dumps({'source':'E:/磁州窑/总总总总.doc','chapters':len(chapters),'papers':len(papers),'figures':sorted(allfigs),'notes':['Document field instructions, automatic contents, signatures and duplicate administrative covers excluded.','Research numbers reproduced from Chinese report body; English abstract quantities not mixed into overview.','Original wording retained in section bodies; overview summaries are condensed.']},ensure_ascii=False,indent=2),encoding='utf-8')
print('Main chapters',len(chapters),'papers',len(papers),'extras',len(extras),'figures',len(figures))
print([(x['id'],len(x['sections'])) for x in chapters+papers+extras])

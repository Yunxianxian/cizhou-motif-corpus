from pathlib import Path
import struct,json
u16=lambda b,o:struct.unpack_from('<H',b,o)[0]
u32=lambda b,o:struct.unpack_from('<I',b,o)[0]
b=Path('E:/磁州窑/总总总总.doc').read_bytes();ss=1<<u16(b,30);ms=1<<u16(b,32)
sector=lambda n:b[(n+1)*ss:(n+2)*ss]
difat=list(struct.unpack_from('<109I',b,76));n=u32(b,68)
for _ in range(u32(b,72)):
 if n>=0xfffffffa:break
 a=struct.unpack('<'+'I'*(ss//4),sector(n));difat.extend(a[:-1]);n=a[-1]
fat=[]
for n in difat:
 if n<0xfffffffa:fat.extend(struct.unpack('<'+'I'*(ss//4),sector(n)))
def chain(n,table):
 seen=set()
 while n<0xfffffffa:
  if n in seen:raise ValueError('Cyclic sector chain')
  seen.add(n);yield n;n=table[n]
def readstream(n,size=None):
 r=b''.join(sector(i) for i in chain(n,fat));return r[:size] if size is not None else r
dirs=readstream(u32(b,48));entries={}
for i in range(0,len(dirs),128):
 e=dirs[i:i+128];ln=u16(e,64)
 if ln>=2:
  name=e[:ln-2].decode('utf-16le');entries[name]=(e[66],u32(e,116),struct.unpack_from('<Q',e,120)[0])
root=next(v for v in entries.values() if v[0]==5);mini=readstream(root[1],root[2]);mf=readstream(u32(b,60)) if u32(b,64) else b'';mfat=list(struct.unpack('<'+'I'*(len(mf)//4),mf))
def get(name):
 typ,n,size=entries[name]
 if size>=u32(b,56):return readstream(n,size)
 return b''.join(mini[i*ms:(i+1)*ms] for i in chain(n,mfat))[:size]
w=get('WordDocument');table=get('1Table' if u16(w,10)&0x200 else '0Table')
o=32;csw=u16(w,o);o+=2+csw*2;cslw=u16(w,o);o+=2+cslw*4;cnt=u16(w,o);o+=2
fc=u32(w,o+33*8);ln=u32(w,o+33*8+4);clx=table[fc:fc+ln];i=0
while clx[i]==1:i+=3+u16(clx,i+1)
assert clx[i]==2
l=u32(clx,i+1);pt=clx[i+5:i+5+l];pieces=(l-4)//12;cps=struct.unpack_from('<'+'I'*(pieces+1),pt,0)
text=[]
for j in range(pieces):
 p=4*(pieces+1)+j*8;raw=u32(pt,p+2);compressed=bool(raw&0x40000000);pos=raw&0x3fffffff;chars=cps[j+1]-cps[j]
 if compressed:pos//=2;text.append(w[pos:pos+chars].decode('cp1252',errors='replace'))
 else:text.append(w[pos:pos+chars*2].decode('utf-16le',errors='replace'))
text=''.join(text).replace('\r','\n').replace('\x07',' | ')
Path('docs/report/extracted.txt').write_text(text,encoding='utf-8')
print('Streams:',list(entries),'pieces:',pieces,'characters:',len(text))
print(text[:14000])

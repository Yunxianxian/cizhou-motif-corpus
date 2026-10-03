// 生成「手机本地运行版」单文件：node tools/build-single.mjs
// 把 index.html 引用的 CSS / JS 全部内联，输出到 手机/磁州窑纹样语料库.html
// 内联后的文件不依赖任何外部资源，可离线双击、也可直接拷到手机上打开。
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(join(fileURLToPath(new URL('.', import.meta.url)), '..'));
const outDir = join(root, '手机');
const outFile = join(outDir, '磁州窑纹样语料库.html');
const read = (p) => readFile(join(root, p), 'utf8');

let html = await readFile(join(root, 'index.html'), 'utf8');

// 1) 去掉只对「服务器部署 / 添加到主屏幕」有意义的引用（单文件下会 404）
html = html
  .replace(/\s*<link rel="manifest"[^>]*>/g, '')
  .replace(/\s*<link rel="apple-touch-icon"[^>]*>/g, '')
  .replace(/\s*<link rel="icon"[^>]*>/g, '');

// 2) 内联 CSS
if (/<link rel="stylesheet"/.test(html)) {
  const blocks = [];
  let m;
  const re = /<link rel="stylesheet" href="([^"]+)">/g;
  while ((m = re.exec(html))) blocks.push([m[0], m[1]]);
  for (const [tag, href] of blocks) {
    const css = await read(href);
    html = html.replace(tag, '<style>\n/* ===== ' + href + ' ===== */\n' + css + '\n</style>');
  }
}

// 3) 内联 JS
if (/<script src="/.test(html)) {
  const blocks = [];
  let m;
  const re = /<script src="([^"]+)"><\/script>/g;
  while ((m = re.exec(html))) blocks.push([m[0], m[1]]);
  for (const [tag, src] of blocks) {
    let js = await read(src);
    if (/<\/script/i.test(js)) throw new Error('脚本内含 </script，无法安全内联：' + src);
    // photos.js：把登记的照片读成 base64 内联，保证单文件真正零外部依赖
    if (/photos\.js$/.test(src)) {
      const { readFile: rf } = await import('node:fs/promises');
      const imgRe = /'(assets\/img\/[^']+\.(?:jpg|jpeg|png))'/g;
      let im;
      const seen = new Map();
      while ((im = imgRe.exec(js))) {
        if (seen.has(im[1])) continue;
        const buf = await rf(join(root, im[1]));
        const mime = im[1].endsWith('.png') ? 'image/png' : 'image/jpeg';
        seen.set(im[1], 'data:' + mime + ';base64,' + buf.toString('base64'));
      }
      for (const [p, uri] of seen) js = js.split("'" + p + "'").join("'" + uri + "'");
      console.log('photos.js 内联图片: ' + seen.size + ' 张');
    }
    html = html.replace(tag, '<script>\n/* ===== ' + src + ' ===== */\n' + js + '\n</script>');
  }
}

// 4) 内联一个圆形纹样 favicon，并加上来源说明
const favicon = '<link rel="icon" href="data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
    '<rect width="32" height="32" fill="#f6f5f2"/>' +
    '<circle cx="16" cy="16" r="11" fill="#141414"/>' +
    '<circle cx="16" cy="16" r="4" fill="#f6f5f2"/></svg>') + '">';
html = html.replace('<title>', favicon + '\n<title>');
html = html.replace('</title>',
  '</title>\n<!-- 手机本地运行版：由 tools/build-single.mjs 生成，CSS/JS 已全部内联，可离线打开。\n' +
  '     源文件（多文件版）在上一级目录，改完源文件后重新执行 node tools/build-single.mjs 即可。 -->');

// 5) 自检
const leftover = []
  .concat((html.match(/<link rel="stylesheet"/g) || []).map(() => '未内联的 CSS'))
  .concat((html.match(/<script src="/g) || []).map(() => '未内联的 JS'));
if (leftover.length) throw new Error('仍有外部引用：' + leftover.join('、'));

await mkdir(outDir, { recursive: true });
await writeFile(outFile, html, 'utf8');
console.log('已生成: ' + outFile);
console.log('体积: ' + (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1) + ' KB（单文件，无外部依赖）');

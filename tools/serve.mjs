// 极简静态服务器：node tools/serve.mjs [port] [host]
// 默认监听 0.0.0.0，方便手机在同一 Wi-Fi 下用电脑的局域网 IP 打开。
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';

const root = normalize(join(fileURLToPath(new URL('.', import.meta.url)), '..'));
const port = Number(process.argv[2] || 5178);
const host = process.argv[3] || '0.0.0.0';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.md': 'text/markdown; charset=utf-8'
};

createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    let file = normalize(join(root, url));
    if (!file.startsWith(root)) { res.writeHead(403).end('403'); return; }
    const info = await stat(file).catch(() => null);
    if (info && info.isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404');
  }
}).listen(port, host, () => {
  const urls = ['http://localhost:' + port + '/'];
  Object.keys(networkInterfaces()).forEach((name) => {
    (networkInterfaces()[name] || []).forEach((i) => {
      if (i && i.family === 'IPv4' && !i.internal) urls.push('http://' + i.address + ':' + port + '/');
    });
  });
  console.log('静态目录: ' + root);
  console.log('本机访问: ' + urls[0]);
  if (urls.length > 1) {
    console.log('手机访问（同一 Wi-Fi 下用浏览器打开）:');
    urls.slice(1).forEach((u) => console.log('  ' + u));
  } else {
    console.log('未检测到局域网地址，手机可能无法访问');
  }
});

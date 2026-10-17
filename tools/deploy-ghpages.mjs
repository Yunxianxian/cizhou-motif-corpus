#!/usr/bin/env node
/**
 * 把当前目录整站发布到 GitHub Pages —— 全程走 GitHub REST API，不需要安装 git。
 *
 * 用法：
 *   set GH_TOKEN=ghp_xxx            (PowerShell: $env:GH_TOKEN="ghp_xxx")
 *   node tools/deploy-ghpages.mjs --repo cizhou-motif-corpus
 *
 * 可选参数：
 *   --repo <名称>      仓库名，默认 cizhou-motif-corpus；也可写成 owner/repo
 *   --owner <用户名>   不传则默认为 Token 所属账号
 *   --branch <分支>    默认 main
 *   --message <提交信息>
 *   --dry-run          只扫描文件、打印将要上传的清单，不发任何请求
 *   --skip-pages       只推代码，不开启 Pages
 *
 * Token 权限（Classic 勾 repo；Fine-grained 需 Contents / Administration / Pages 的 Read and write）。
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const API = 'https://api.github.com';
const ROOT = process.cwd();

const argv = process.argv.slice(2);
const hasFlag = (n) => argv.includes(`--${n}`);
const flagVal = (n, dflt) => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 || i + 1 >= argv.length ? dflt : argv[i + 1];
};

const TOKEN = (process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '').trim();
const BRANCH_DEFAULT = flagVal('branch', '');
const MESSAGE = flagVal('message', `Deploy 磁州窑数智化图案语料库 (${new Date().toISOString()})`);
const DRY = hasFlag('dry-run');
const SKIP_PAGES = hasFlag('skip-pages');

// 只发布站点运行时需要的内容；下面这些是「工作资料」，不进线上仓库。
// 要恢复某个目录，从这里删掉对应名字即可。
const SKIP_DIRS = new Set([
  '.git', 'node_modules', '.dsh', '.github',
  '手机',          // 单文件生成物（约 26MB），按要求不上传
  '纹样图片',       // 原始纹样素材 57.9MB，站点不引用
  '参考截图',       // 参考图 4.9MB，站点不引用
  'review-shots',  // 评审用的临时截图
]);
const SKIP_FILES = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini']);
const MAX_BLOB = 100 * 1024 * 1024; // GitHub 单文件硬上限

// ---------------------------------------------------------------- 工具函数

function human(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

async function walk(dir = ROOT, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const abs = join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      await walk(abs, out);
    } else if (e.isFile()) {
      if (SKIP_FILES.has(e.name)) continue;
      out.push(abs);
    }
  }
  return out;
}

async function withRetry(fn, tries = 5, label = '') {
  let last;
  for (let t = 0; t < tries; t++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      // 409 也重试：空仓库的 git 后端尚未就绪时 GitHub 会返回 "Git Repository is empty"
      const retryable = e.status === undefined || e.status === 409 || e.status === 429 || e.status >= 500;
      if (!retryable) throw e;
      const wait = Math.min(1000 * 2 ** t, 15000);
      process.stderr.write(`  ! ${label} 失败（${e.message}），${wait}ms 后重试 (${t + 1}/${tries})\n`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw last;
}

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'dsh-ghpages-deploy',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(`${method} ${path} -> ${res.status} ${(data && data.message) || text}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function pool(items, limit, worker) {
  const out = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      out[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return out;
}

// ---------------------------------------------------------------- 主流程

const files = (await walk()).sort();
const stats = await Promise.all(files.map((f) => stat(f)));
const total = stats.reduce((a, s) => a + s.size, 0);

const entries = files.map((abs, i) => ({
  abs,
  path: relative(ROOT, abs).split(sep).join('/'),
  size: stats[i].size,
  mtimeMs: stats[i].mtimeMs,
}));

console.log(`源目录: ${ROOT}`);
console.log(`文件数: ${entries.length}    总体积: ${human(total)}`);

// 防呆：单文件版是「生成物」，改了源文件却忘记重建，手机版就会停留在旧内容/旧版本号
const SINGLE_REL = '手机/磁州窑纹样语料库.html';
const singleEntry = entries.find((e) => e.path === SINGLE_REL);
if (singleEntry) {
  const stale = entries.filter(
    (e) =>
      /\.(js|css|html|webmanifest)$/i.test(e.path) &&
      !e.path.startsWith('手机/') &&
      !e.path.startsWith('dev/') &&
      !e.path.startsWith('.workbuddy/') &&
      e.mtimeMs > singleEntry.mtimeMs
  );
  if (stale.length) {
    console.warn(`\n⚠  单文件版（${SINGLE_REL}）可能已过期：以下 ${stale.length} 个源文件比它更新`);
    for (const s of stale.slice(0, 8)) console.warn(`     ${s.path}`);
    if (stale.length > 8) console.warn(`     …另有 ${stale.length - 8} 个`);
    console.warn('   请先执行： node tools/build-single.mjs');
    console.warn('   否则线上手机版里仍是旧内容与旧版本号。若确认无需重建可忽略本提示。\n');
  }
}
const oversized = entries.filter((e) => e.size > MAX_BLOB);
if (oversized.length) {
  console.error('\n以下文件超过 GitHub 100MB 上限，请先移出：');
  for (const o of oversized) console.error(`  ${human(o.size)}  ${o.path}`);
  process.exit(1);
}

if (DRY) {
  console.log('\n[dry-run] 将上传以下文件（未发出任何网络请求）：');
  for (const e of entries) console.log(`  ${String(e.size).padStart(10)}  ${e.path}`);
  console.log('\n[dry-run] 结束。');
  process.exit(0);
}

if (!TOKEN) {
  console.error('\n缺少 Token：请先设置环境变量 GH_TOKEN，例如');
  console.error('  PowerShell:  $env:GH_TOKEN="ghp_xxx"; node tools/deploy-ghpages.mjs');
  process.exit(1);
}

// 1. 校验身份
const me = await withRetry(() => api('/user'), 3, 'GET /user');
console.log(`\n已授权账号: ${me.login}`);

let owner = flagVal('owner', me.login);
let repo = flagVal('repo', 'cizhou-motif-corpus');
if (repo.includes('/')) {
  const [o, r] = repo.split('/');
  owner = o;
  repo = r;
}
console.log(`目标仓库:   ${owner}/${repo}`);

// 2. 创建仓库（已存在则复用）
let repoInfo;
try {
  repoInfo = await withRetry(
    () =>
      api('/user/repos', {
        method: 'POST',
        body: {
          name: repo,
          private: false,
          auto_init: true, // 先落一个初始提交，避免空仓库的 git 数据 API 返回 409
          has_issues: true,
          has_wiki: false,
          has_projects: false,
          description: '磁州窑数智化图案语料库 · 移动端网页原型',
        },
      }),
    3,
    'POST /user/repos'
  );
  console.log(`仓库已创建: ${repoInfo.html_url}`);
} catch (e) {
  if (e.status !== 422) throw e;
  repoInfo = await withRetry(() => api(`/repos/${owner}/${repo}`), 3, 'GET repo');
  console.log(`仓库已存在，将覆盖其默认分支: ${repoInfo.html_url}`);
}

// 2.1 解析分支名（沿用仓库默认分支，避免 master/main 不一致）
const BRANCH = BRANCH_DEFAULT || repoInfo.default_branch || 'main';
console.log(`分支:       ${BRANCH}`);

// 2.2 若仓库为空，先用 Contents API 落一个引导提交，唤醒 git 后端
let headSha = null;
for (let attempt = 0; attempt < 12 && !headSha; attempt++) {
  try {
    const ref = await api(`/repos/${owner}/${repo}/git/ref/heads/${BRANCH}`);
    headSha = ref.object.sha;
  } catch (e) {
    if (e.status !== 404 && e.status !== 409) throw e;
    if (attempt === 0) console.log('仓库为空，正在创建引导提交…');
    try {
      await api(`/repos/${owner}/${repo}/contents/.gitkeep`, {
        method: 'PUT',
        body: { message: 'chore: bootstrap repository', content: 'Cg==' },
      });
    } catch (err) {
      if (err.status !== 422 && err.status !== 409) throw err;
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
}
if (headSha) console.log(`当前分支头: ${headSha.slice(0, 10)}`);
else console.log('警告：未取到分支头，将尝试以无父提交方式创建');

// 3. 逐个上传 blob（并发 6）
console.log(`\n上传 ${entries.length} 个文件…`);
let done = 0;
const blobs = await pool(entries, 6, async (e) => {
  const buf = await readFile(e.abs);
  const sha = await withRetry(
    () =>
      api(`/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        body: { content: buf.toString('base64'), encoding: 'base64' },
      }),
    5,
    `blob ${e.path}`
  ).then((r) => r.sha);
  done++;
  process.stdout.write(`\r  已上传 ${done}/${entries.length}  ${e.path.slice(0, 60).padEnd(60)}`);
  return { path: e.path, mode: '100644', type: 'blob', sha };
});
process.stdout.write('\n');

// .nojekyll：跳过 Jekyll 处理，避免下划线开头的文件被忽略
const nojekyll = await api(`/repos/${owner}/${repo}/git/blobs`, {
  method: 'POST',
  body: { content: Buffer.from('').toString('base64'), encoding: 'base64' },
});
blobs.push({ path: '.nojekyll', mode: '100644', type: 'blob', sha: nojekyll.sha });

// 4. 建 tree
const tree = await withRetry(
  () => api(`/repos/${owner}/${repo}/git/trees`, { method: 'POST', body: { tree: blobs } }),
  3,
  'POST tree'
);
console.log(`tree 已建立: ${tree.sha.slice(0, 10)}`);

// 5. 组装 parent（tree 不含 base_tree，提交后仓库内容 = 本项目内容）
const parents = headSha ? [headSha] : [];

const commit = await withRetry(
  () =>
    api(`/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      body: { message: MESSAGE, tree: tree.sha, parents },
    }),
  3,
  'POST commit'
);
console.log(`commit 已创建: ${commit.sha.slice(0, 10)}`);

// 6. 创建或更新分支引用
if (parents.length === 0) {
  await withRetry(
    () =>
      api(`/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        body: { ref: `refs/heads/${BRANCH}`, sha: commit.sha },
      }),
    3,
    'POST refs'
  );
} else {
  await withRetry(
    () =>
      api(`/repos/${owner}/${repo}/git/refs/heads/${BRANCH}`, {
        method: 'PATCH',
        body: { sha: commit.sha, force: true },
      }),
    3,
    'PATCH ref'
  );
}
console.log(`分支 ${BRANCH} 已更新`);

// 7. 开启 GitHub Pages
const pagesUrl = `https://${owner}.github.io/${repo}/`;
if (SKIP_PAGES) {
  console.log(`\n已跳过 Pages 配置。若要手动开启：仓库 Settings → Pages → Source 选 Deploy from a branch → ${BRANCH} / (root)`);
  console.log(`预期地址: ${pagesUrl}`);
} else {
  const source = { source: { branch: BRANCH, path: '/' } };
  try {
    // 成功时 GitHub 可能返回 201+对象，也可能返回 204+空响应体，故用可选链兜底
    const p = await api(`/repos/${owner}/${repo}/pages`, { method: 'POST', body: source });
    console.log(`Pages 已开启: ${p?.html_url || pagesUrl}`);
  } catch (e) {
    if (e.status === 409) {
      const p = await api(`/repos/${owner}/${repo}/pages`, { method: 'PUT', body: source });
      console.log(`Pages 已更新: ${p?.html_url || pagesUrl}`);
    } else {
      console.log(`自动开启 Pages 失败（${e.message}）。`);
      console.log(`请手动开启：仓库 Settings → Pages → Source 选 Deploy from a branch → ${BRANCH} / (root)`);
    }
  }

  // 8. 轮询构建状态
  console.log('\n等待 GitHub Pages 首次构建…');
  const deadline = Date.now() + 6 * 60 * 1000;
  let lastStatus = '';
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 8000));
    let p;
    try {
      p = await api(`/repos/${owner}/${repo}/pages`);
    } catch {
      continue;
    }
    const s = p.status || 'unknown';
    if (s !== lastStatus) {
      console.log(`  状态: ${s}`);
      lastStatus = s;
    }
    if (s === 'built') break;
    if (s === 'errored') {
      console.log('  构建报错，请到仓库 Actions / Settings → Pages 查看详情');
      break;
    }
  }
}

console.log('\n================ 部署完成 ================');
console.log(`仓库地址: ${repoInfo.html_url}`);
console.log(`网站地址: ${pagesUrl}`);
console.log('==========================================');
console.log('首次生效通常 1~2 分钟；若打开是 404，稍等再刷新。');

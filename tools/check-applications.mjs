import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CZ = { views: {}, util: { esc, el: s => s, motif: p => `<img alt="${esc(p.title)}">` }, vc: {
  navbar: title => `<header>${title}</header>`, bottomSpace: () => '', bindBack() {}, bindScrollChrome() {}
}, icon: () => '' };
const context = vm.createContext({ window: { CZ } });
for (const file of ['data.js','report-data.js','view-applications.js']) vm.runInContext(fs.readFileSync(new URL('../assets/js/' + file, import.meta.url), 'utf8'), context);
assert(CZ.applications.homeSection().includes('#/applications'));
assert.equal(CZ.applications.cases.length, 3);
for (const c of CZ.applications.cases) {
  assert.equal(c.figures[0], c.cover);
  assert.equal(c.figures.length, c.labels.length);
  for (const id of c.figures) assert(fs.existsSync(new URL('../' + CZ.REPORT.figures[id].src, import.meta.url)));
  for (const id of c.related) assert(CZ.DATA.byId(id), 'related pattern exists: ' + id);
  const html = CZ.views.applicationDetail({params:{id:c.id}});
  assert(html.includes('#/report/chapter-7'));
  assert(!html.includes('undefined'));
  assert(html.includes('data-application-image="0"'));
}
assert(CZ.REPORT.chapters.some(c => c.id === 'chapter-7'));
assert(CZ.views.applicationDetail({params:{id:'missing'}}).includes('案例暂未收录'));
assert(CZ.views.applications().includes('aria-pressed="true"'));
const buttons = ['全部','品牌视觉','数字传播','交互展示'].map(category => ({ dataset:{applicationFilter:category}, classList:{toggle(){}}, setAttribute(){}, addEventListener(_, fn){this.click=fn;} }));
const rows = CZ.applications.cases.map(c => ({dataset:{applicationCategory:c.category},hidden:false}));
CZ.util.qsa = selector => selector === '[data-application-filter]' ? buttons : rows;
CZ.views.applications.mounted({});
buttons[2].click();
assert.deepEqual(Array.from(rows,r=>r.hidden),[true,false,true]);
buttons[0].click();
assert(rows.every(r=>!r.hidden));
console.log('PASS: case rendering, image assets, related patterns, report links, missing case fallback and category filtering');

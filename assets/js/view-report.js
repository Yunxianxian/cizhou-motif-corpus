(function () {
  'use strict';
  const CZ = window.CZ, U = CZ.util, vc = CZ.vc, R = CZ.REPORT;
  const allSections = R.chapters.concat(R.papers, R.extras);
  const link = (item, n) => '<a class="report-row" href="#/report/' + item.id + '" data-nav="#/report/' + item.id + '">' +
    '<span class="report-row__no">' + String(n + 1).padStart(2, '0') + '</span>' +
    '<span class="report-row__text"><b>' + U.esc(item.title) + '</b><span>' + U.esc(item.summary) + '</span></span>' +
    CZ.icon('next', { size: 16 }) + '</a>';
  function blockHTML(block) {
    if (block.type === 'text') return '<p>' + U.esc(block.text) + '</p>';
    if (block.type === 'table') {
      return '<div class="report-table" role="region" aria-label="报告数据表，可横向滚动" tabindex="0"><table>' +
        block.rows.map((row, i) => '<tr>' + row.map(cell => '<' + (i === 0 ? 'th scope="col"' : 'td') + '>' +
          U.esc(cell) + '</' + (i === 0 ? 'th' : 'td') + '>').join('') + '</tr>').join('') + '</table></div>';
    }
    if (block.type === 'figures') {
      return '<figure class="report-figure"><div class="report-figure__images">' + block.ids.map(id => {
        const f = R.figures[id];
        return '<button class="report-figure__button" data-report-figure="' + id + '" aria-label="放大查看：' + U.esc(block.caption) + '">' +
          '<img class="art" src="' + f.src + '" alt="' + U.esc(block.caption) + '" loading="lazy"></button>';
      }).join('') + '</div><figcaption>' + U.esc(block.caption) + '<span>点击图片放大查看</span></figcaption></figure>';
    }
    if (block.type === 'link') return '<a class="report-attachment" href="' + block.href + '" target="_blank" rel="noopener noreferrer">' +
      CZ.icon('book', { size: 20 }) + '<span><b>' + U.esc(block.title) + '</b><small>' + U.esc(block.description) + '</small></span>' + CZ.icon('next', { size: 16 }) + '</a>';
    return '';
  }
  function sectionHTML(section, i) {
    return '<details class="report-section"' + (i === 0 ? ' open' : '') + '><summary>' +
      '<span class="report-section__no">' + String(i + 1).padStart(2, '0') + '</span><h2>' + U.esc(section.title) + '</h2>' +
      CZ.icon('down', { size: 17 }) + '</summary><div class="report-body">' + section.blocks.map(blockHTML).join('') +
      (section.children || []).map(child => '<section class="report-subsection"><h3>' + U.esc(child.title) + '</h3>' +
        child.blocks.map(blockHTML).join('') + '</section>').join('') + '</div></details>';
  }
  CZ.views.report = function () {
    return U.el('<div class="report-page">' + vc.navbar('项目总结报告', { right: '<span class="navbar__ph"></span>' }) +
      '<article class="report-cover"><span class="report-eyebrow">RESEARCH REPORT · 2026</span>' +
      '<h1>' + U.esc(R.title) + '</h1><p class="report-lead">' + U.esc(R.summary) + '</p>' +
      '<div class="report-cover__meta"><span>' + U.esc(R.institution) + '</span><span>' + U.esc(R.date) + '</span></div>' +
      '<a class="btn btn--ink" href="#/report/chapter-1" data-nav="#/report/chapter-1">开始阅读' + CZ.icon('next', { size: 15 }) + '</a></article>' +
      '<section class="report-overview"><div class="report-section-heading"><h2>项目概览</h2><span>采集成果 · 据项目报告</span></div>' +
      '<div class="report-stats">' + R.stats.map(s => '<div><b>' + U.esc(s.value) + '</b><span>' + U.esc(s.label) + '</span></div>').join('') + '</div>' +
      '<dl class="report-meta"><div><dt>项目类型</dt><dd>' + U.esc(R.projectType) + '</dd></div><div><dt>项目编号</dt><dd>' + U.esc(R.projectId) + '</dd></div>' +
      '<div><dt>研究周期</dt><dd>' + U.esc(R.period) + '</dd></div><div><dt>项目负责人</dt><dd>' + U.esc(R.leader) + '</dd></div>' +
      '<div><dt>指导教师</dt><dd>' + U.esc(R.advisor) + '</dd></div></dl>' +
      '<details class="report-abstract"><summary>阅读研究摘要' + CZ.icon('down', { size: 15 }) + '</summary><p>' + U.esc(R.abstract) + '</p></details></section>' +
      '<section class="report-highlights"><h2>研究脉络</h2>' + R.highlights.map((h, i) => '<div><span>' + (i + 1) + '</span><section><h3>' + U.esc(h.title) + '</h3><p>' + U.esc(h.text) + '</p></section></div>').join('') + '</section>' +
      '<nav class="report-jump" aria-label="报告内容导航"><button data-report-jump="main">研究主报告</button><button data-report-jump="papers">研究成果</button><button data-report-jump="extra">回顾与资料</button></nav>' +
      '<section class="report-directory" data-report-group="main"><div class="report-section-heading"><h2>研究主报告</h2><span>七章正文</span></div>' + R.chapters.map(link).join('') + '</section>' +
      '<section class="report-directory" data-report-group="papers"><div class="report-section-heading"><h2>研究成果</h2><span>两篇研究专题</span></div>' + R.papers.map(link).join('') + '</section>' +
      '<section class="report-directory" data-report-group="extra"><div class="report-section-heading"><h2>回顾与资料</h2></div>' + R.extras.map(link).join('') + '</section>' +
      '<p class="report-source">根据项目总结报告整理为移动阅读版，正文按章节与小节展开，图表可放大查看。</p>' + vc.bottomSpace(128) + '</div>');
  };
  CZ.views.report.mounted = function (page) {
    vc.bindBack(page); vc.bindScrollChrome(page);
    U.qsa('[data-report-jump]', page).forEach(button => button.addEventListener('click', () => {
      const section = U.qs('[data-report-group="' + button.dataset.reportJump + '"]', page);
      const scale = page.getBoundingClientRect().width / page.offsetWidth || 1;
      const y = (section.getBoundingClientRect().top - page.getBoundingClientRect().top) / scale + page.scrollTop;
      const headerHeight = U.qs('.navbar', page).offsetHeight;
      page.scrollTo({ top: y - headerHeight - 14, behavior: U.reduceMotion() ? 'auto' : 'smooth' });
    }));
  };
  CZ.views.reportSection = function (ctx) {
    const index = allSections.findIndex(section => section.id === ctx.params.section);
    if (index < 0) return U.el('<div class="report-page">' + vc.navbar('报告阅读') +
      '<div class="pagebox"><h1>未找到该章节</h1><a class="btn btn--ghost" data-nav="#/report" href="#/report">返回报告目录</a></div></div>');
    const item = allSections[index];
    const top = '<a class="glass-btn" href="#/report" data-nav="#/report" aria-label="报告目录">' + CZ.icon('book', { size: 20 }) + '</a>';
    return U.el('<article class="report-page report-reader">' + vc.navbar('报告阅读', { right: top }) +
      '<div class="report-progress" aria-hidden="true"><span></span></div>' +
      '<header class="report-reader__header"><a href="#/report" data-nav="#/report">项目总结报告 / ' + U.esc(item.kind) + '</a>' +
      '<span class="report-eyebrow">' + U.esc(item.eyebrow) + '</span><h1>' + U.esc(item.title) + '</h1><p>' + U.esc(item.summary) + '</p></header>' +
      '<div class="report-expand-tools"><span>按小节展开阅读</span><button data-report-expand>展开全部</button></div>' +
      '<div class="report-sections">' + item.sections.map(sectionHTML).join('') + '</div>' +
      '<nav class="report-reading-nav" aria-label="报告章节切换">' +
      (index > 0 ? '<a href="#/report/' + allSections[index - 1].id + '" data-nav="#/report/' + allSections[index - 1].id + '"><small>上一篇</small><b>' + U.esc(allSections[index - 1].title) + '</b></a>' : '<span></span>') +
      (index < allSections.length - 1 ? '<a href="#/report/' + allSections[index + 1].id + '" data-nav="#/report/' + allSections[index + 1].id + '"><small>继续阅读</small><b>' + U.esc(allSections[index + 1].title) + '</b></a>' : '<a href="#/report" data-nav="#/report"><small>已到最后</small><b>返回报告目录</b></a>') + '</nav>' +
      '<p class="report-source">内容来源：项目总结报告 · ' + U.esc(R.date) + '</p>' + vc.bottomSpace(128) + '</article>');
  };
  CZ.views.reportSection.mounted = function (page) {
    vc.bindBack(page); vc.bindScrollChrome(page);
    const progress = U.qs('.report-progress span', page);
    if (!progress) return;
    const expand = U.qs('[data-report-expand]', page);
    const update = () => {
      const range = page.scrollHeight - page.clientHeight;
      progress.style.width = (range > 0 ? Math.min(100, page.scrollTop / range * 100) : 100) + '%';
      expand.textContent = U.qsa('.report-section', page).every(section => section.open) ? '收起全部' : '展开全部';
    };
    page.addEventListener('scroll', update, { passive: true });
    U.qsa('.report-section', page).forEach(details => details.addEventListener('toggle', update));
    U.qsa('.report-figure img', page).forEach(image => image.addEventListener('load', update));
    expand.addEventListener('click', () => {
      const sections = U.qsa('.report-section', page);
      const open = sections.some(section => !section.open);
      sections.forEach(section => { section.open = open; });
      expand.textContent = open ? '收起全部' : '展开全部'; update();
    });
    U.qsa('[data-report-figure]', page).forEach(button => button.addEventListener('click', () => {
      const buttons = U.qsa('[data-report-figure]', page);
      const gallery = buttons.map(b => ({ label: b.getAttribute('aria-label').replace('放大查看：', ''), html: U.qs('img', b).outerHTML }));
      CZ.ui.imageViewer(gallery, buttons.indexOf(button), '报告图表');
    }));
    requestAnimationFrame(update);
  };
})();

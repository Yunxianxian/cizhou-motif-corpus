/* ==========================================================================
   app.js —— 启动、底部导航、共享元素转场
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  const U = CZ.util;

  const TABS = [
    { key: 'corpus', label: '语料库', icon: 'corpus', route: '#/home' },
    { key: 'upload', label: '上传', icon: 'upload', route: '#/upload' },
    { key: 'me', label: '我的', icon: 'me', route: '#/profile' }
  ];

  let pendingMorph = null;
  let currentTab = null;

  function renderTabs(activeTab) {
    if (activeTab === currentTab) return;
    currentTab = activeTab;
    const bar = document.getElementById('tabbar');
    const items = TABS.map((t) =>
      '<button class="tab' + (t.key === activeTab ? ' is-on' : '') + '" data-tab="' + t.key + '"' +
      ' aria-label="' + t.label + '">' +
      '<span class="tab__ic">' + CZ.icon(t.icon, { size: 24 }) + '</span>' +
      '<span class="tab__tx">' + t.label + '</span></button>').join('');
    bar.innerHTML = '<div class="tabbar__pill" id="tabPill"></div><div class="tabbar__in">' + items + '</div>';
    const idx = Math.max(0, TABS.findIndex((t) => t.key === activeTab));
    requestAnimationFrame(() => movePill(idx, true));
    U.qsa('.tab', bar).forEach((btn) => {
      btn.addEventListener('click', () => {
        const t = TABS.filter((x) => x.key === btn.dataset.tab)[0];
        CZ.ui.haptic('light');
        CZ.router.go(t.route, { mode: 'tab' });
      });
    });
  }

  function movePill(i, instant) {
    const bar = document.getElementById('tabbar');
    const pill = document.getElementById('tabPill');
    const tabs = U.qsa('.tab', bar);
    if (!pill || !tabs[i]) return;
    const b = tabs[i].getBoundingClientRect();
    const host = bar.getBoundingClientRect();
    const left = (b.left - host.left + 5) + 'px';
    const width = (b.width - 10) + 'px';
    if (instant || U.reduceMotion()) {
      pill.style.transition = 'none';
      pill.style.left = left;
      pill.style.width = width;
      requestAnimationFrame(() => { pill.style.transition = ''; });
    } else {
      const from = { left: pill.style.left || left, width: pill.style.width || width };
      pill.animate([from, { left: left, width: width }],
        { duration: 380, easing: 'cubic-bezier(.34,1.36,.5,1)' });
      pill.style.left = left;
      pill.style.width = width;
    }
  }

  let booted = false;
  function fitDevice() {
    if (window.innerWidth < 620) {
      document.documentElement.style.setProperty('--k', '1');
      return;
    }
    const noteW = window.innerWidth >= 980 ? 392 : 0;
    const k = Math.min(1, (window.innerHeight - 56) / 866, (window.innerWidth - noteW - 96) / 412);
    document.documentElement.style.setProperty('--k', Math.max(0.5, k).toFixed(3));
  }

  function boot() {
    if (booted) return;
    booted = true;
    // URL 参数预览：index.html?theme=dark|sepia&font=1.08
    try {
      const q = new URLSearchParams(location.search);
      const t = q.get('theme');
      if (t && ['light', 'dark', 'sepia'].indexOf(t) >= 0) CZ.store.setTheme(t);
      if (q.get('font')) CZ.store.setFontScale(parseFloat(q.get('font')) || 1);
    } catch (e) { /* 忽略非法参数 */ }
    fitDevice();
    CZ.store.applyTheme();
    renderTabs('corpus');
    CZ.router.onChange((info) => {
      if (info.def && info.def.tab) renderTabs(info.def.tab);
      else if (!currentTab) renderTabs('corpus');
      if (!info.def || info.def.view !== 'home') document.documentElement.removeAttribute('data-hero');
    });
    CZ.router.start();

    window.addEventListener('resize', () => {
      fitDevice();
      const on = U.qs('.tab.is-on');
      if (on) movePill(U.qsa('.tab').indexOf(on), true);
    });

    setTimeout(() => {
      let seen = false;
      try {
        seen = !!sessionStorage.getItem('cizhou.welcomed');
        sessionStorage.setItem('cizhou.welcomed', '1');
      } catch (e) { seen = false; }   // 本地文件打开时可能被禁用
      if (!seen) {
        CZ.ui.toast('点击卡片进入下一级，屏幕左缘右滑可返回', { icon: 'info', duration: 2800 });
      }
    }, 800);
  }

  /* ------------------------------ 共享元素转场 ------------------------------ */
  // 卡片 → 详情：把卡片图形飞到详情主图位置
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.pcard');
    if (!card) return;
    const media = U.qs('.pcard__media', card);
    if (!media) return;
    pendingMorph = { rect: media.getBoundingClientRect(), html: media.innerHTML };
  }, true);

  const origGo = CZ.router.go;
  CZ.router.go = function (hash, opts) {
    const wanted = hash && hash.indexOf('#/detail/') === 0 && pendingMorph;
    if (wanted) {
      opts = Object.assign({}, opts, { mode: 'morph' });
    }
    origGo.call(CZ.router, hash, opts);
    if (!wanted) { pendingMorph = null; return; }
    const src = pendingMorph;
    pendingMorph = null;
    const dst = U.qs('.page--active [data-morph-dst]', document) || U.qs('[data-morph-dst]', document);
    if (!dst) return;
    const clone = CZ.ui.morph(src, dst);
    const art = U.qs('.art--motif', dst);
    if (clone && art) {
      art.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, delay: 50, easing: 'ease', fill: 'backwards' });
    }
  };
  const origBack = CZ.router.back;
  CZ.router.back = function () { pendingMorph = null; origBack.call(CZ.router); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

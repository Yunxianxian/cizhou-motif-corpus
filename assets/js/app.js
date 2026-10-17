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

  let lensFrame = 0;
  let lensPosition = null;
  let lensHeld = 0;
  let holdFrame = 0;
  let suppressTabClickUntil = 0;
  let cancelLensDrag = () => {};

  function renderTabs(activeTab) {
    if (activeTab === currentTab) return;
    currentTab = activeTab;
    const bar = document.getElementById('tabbar');
    // Keep the lens and buttons mounted so interrupted transitions retain their position.
    if (!bar.querySelector('.tabbar__in')) {
      const content = (t) => '<span class="tab__content"><span class="tab__ic">' +
        CZ.icon(t.icon, { size: 24 }) + '</span><span class="tab__tx">' + t.label + '</span></span>';
      const items = TABS.map((t) => '<button class="tab" data-tab="' + t.key +
        '" aria-label="' + t.label + '">' + content(t) + '</button>').join('');
      const reflections = TABS.map((t) => '<div class="tab tab--reflection">' + content(t) + '</div>').join('');
      bar.innerHTML = '<div class="tabbar__material" aria-hidden="true"></div><div class="tabbar__in">' + items + '</div>' +
        '<div class="tabbar__pill" id="tabPill" aria-hidden="true"><div class="tabbar__lens-track">' +
        reflections + '</div></div>';
      U.qsa('.tabbar__in .tab', bar).forEach((btn) => {
        btn.addEventListener('click', (event) => {
          if (event.detail !== 0 && performance.now() < suppressTabClickUntil) return;
          const t = TABS.find((x) => x.key === btn.dataset.tab);
          CZ.ui.haptic('light');
          // A selected tab may own a deep page; always return to its root.
          CZ.router.go(t.route, { mode: 'tab', resetScroll: true });
        });
      });
      wireLensDrag(bar);
    }
    U.qsa('.tabbar__in .tab', bar).forEach((btn) => {
      const on = btn.dataset.tab === activeTab;
      btn.classList.toggle('is-on', on);
      if (on) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
    const idx = Math.max(0, TABS.findIndex((t) => t.key === activeTab));
    movePill(idx, !lensPosition);
  }

  function paintLens(left, width, energy) {
    const bar = document.getElementById('tabbar');
    const pill = document.getElementById('tabPill');
    const track = bar.querySelector('.tabbar__lens-track');
    const tabs = U.qsa('.tabbar__in .tab', bar);
    if (!pill || !track) return;
    lensPosition = { left, width, energy };
    // Expand the actual lens geometry so its clipped reflection stays aligned.
    const extra = width * .15 * lensHeld;
    width += extra;
    left = Math.max(2, Math.min(bar.clientWidth - width - 2, left - extra / 2));
    const height = (bar.clientHeight - 14) * (1 + .35 * lensHeld);
    const top = (bar.clientHeight - height) / 2;
    pill.style.height = height + 'px';
    pill.style.top = top + 'px';
    track.style.top = (-top - 1) + 'px';
    pill.style.left = left + 'px';
    pill.style.width = width + 'px';
    track.style.transform = 'translateX(' + (-left - 1) + 'px)';
    bar.style.setProperty('--lens-left', left + 'px');
    bar.style.setProperty('--lens-right', (left + width) + 'px');
      bar.style.setProperty('--lens-top', top + 'px');
      bar.style.setProperty('--lens-width', width + 'px');
      bar.style.setProperty('--lens-height', height + 'px');
      bar.style.setProperty('--lens-frost', (1 - Math.min(1, lensHeld)).toFixed(3));
      bar.classList.toggle('has-active-lens', lensHeld > .001);
    energy = Math.max(energy, lensHeld * .8);
    bar.style.setProperty('--lens-energy', energy.toFixed(3));
    bar.classList.add('has-lens');
    const center = left + width / 2;
    U.qsa('.tab--reflection .tab__content', track).forEach((el, j) => {
      const tabCenter = tabs[j].offsetLeft + tabs[j].offsetWidth / 2;
      const proximity = Math.max(0, 1 - Math.abs(tabCenter - center) / (width * .85));
      const stretch = energy * proximity;
      el.style.transform = 'translateX(' + ((tabCenter - center) * stretch * .12) +
        'px) scale(' + (1.035 + stretch * .15) + ',' + (1.035 + stretch * .06) + ')';
    });
  }

  function movePill(i, instant) {
    const bar = document.getElementById('tabbar');
    const pill = document.getElementById('tabPill');
    const tabs = U.qsa('.tabbar__in .tab', bar);
    const track = bar.querySelector('.tabbar__lens-track');
    if (!pill || !tabs[i] || !track) return;
    cancelAnimationFrame(lensFrame);
    const b = tabs[i].getBoundingClientRect();
    const host = bar.getBoundingClientRect();
    const scale = host.width / bar.offsetWidth || 1;
    const target = {
      left: (b.left - host.left) / scale - bar.clientLeft + 5,
      width: b.width / scale - 10
    };
    track.style.width = bar.clientWidth + 'px';
    if (instant || U.reduceMotion() || !lensPosition) {
      paintLens(target.left, target.width, 0);
      return;
    }
    const from = { ...lensPosition };
    const distance = target.left - from.left;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 480);
      if (t === 1 || U.reduceMotion()) {
        paintLens(target.left, target.width, 0);
        lensFrame = 0;
        return;
      }
      const ease = 1 - Math.exp(-7 * t) * Math.cos(8 * t);
      const energy = Math.sin(Math.PI * t);
      const bulge = Math.min(18, Math.abs(distance) * .1) * energy;
      const width = from.width + (target.width - from.width) * ease + bulge;
      const left = Math.max(5, Math.min(bar.clientWidth - width - 5,
        from.left + distance * ease - bulge / 2));
      paintLens(left, width, energy);
      lensFrame = requestAnimationFrame(tick);
    };
    lensFrame = requestAnimationFrame(tick);
  }

  function setLensHeld(held) {
    cancelAnimationFrame(holdFrame);
    const from = lensHeld;
    const target = held && !U.reduceMotion() ? 1 : 0;
    if (U.reduceMotion()) {
      lensHeld = target;
      if (lensPosition) paintLens(lensPosition.left, lensPosition.width, lensPosition.energy || 0);
      return;
    }
    const start = performance.now();
    const duration = held ? 280 : 400;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const spring = t === 1 ? 1 : 1 - Math.exp(-7 * t) * Math.cos(9 * t);
      lensHeld = Math.max(0, from + (target - from) * spring);
      if (lensPosition) paintLens(lensPosition.left, lensPosition.width, lensPosition.energy || 0);
      if (t < 1) holdFrame = requestAnimationFrame(tick);
      else holdFrame = 0;
    };
    holdFrame = requestAnimationFrame(tick);
  }

  function wireLensDrag(bar) {
    let drag = null;
    const tabs = () => U.qsa('.tabbar__in .tab', bar);
    const localX = (clientX) => {
      const box = bar.getBoundingClientRect();
      return (clientX - box.left) / (box.width / bar.offsetWidth || 1) - bar.clientLeft;
    };
    const nearest = (center) => {
      let best = 0, distance = Infinity;
      tabs().forEach((tab, i) => {
        const box = tab.getBoundingClientRect();
        const d = Math.abs(localX(box.left + box.width / 2) - center);
        if (d < distance) { best = i; distance = d; }
      });
      return best;
    };
    function end(cancelled) {
      if (!drag) return;
      const state = drag;
      drag = null;
      suppressTabClickUntil = performance.now() + 500;
      bar.classList.remove('is-lens-held');
      setLensHeld(false);
      if (bar.hasPointerCapture(state.pointerId)) bar.releasePointerCapture(state.pointerId);
      const i = cancelled ? Math.max(0, TABS.findIndex(t => t.key === currentTab)) : nearest(lensPosition.left + lensPosition.width / 2);
      if (!cancelled) {
        CZ.ui.haptic('light');
        CZ.router.go(TABS[i].route, { mode: 'tab', resetScroll: true });
      }
      // Same-tab navigation does not re-render the tabs; settle explicitly.
      movePill(i, false);
    }
    cancelLensDrag = () => end(true);
    bar.addEventListener('pointerdown', (event) => {
      if (drag || !lensPosition || (event.pointerType === 'mouse' && event.button !== 0)) return;
      const rect = document.getElementById('tabPill').getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
      event.preventDefault();
      cancelAnimationFrame(lensFrame);
      drag = { pointerId: event.pointerId, x: localX(event.clientX),
        center: lensPosition.left + lensPosition.width / 2, width: lensPosition.width,
        hover: nearest(lensPosition.left + lensPosition.width / 2) };
      bar.setPointerCapture(event.pointerId);
      bar.classList.add('is-lens-held');
      setLensHeld(true);
    });
    bar.addEventListener('pointermove', (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.preventDefault();
      const center = drag.center + localX(event.clientX) - drag.x;
      const left = Math.max(5, Math.min(bar.clientWidth - drag.width - 5, center - drag.width / 2));
      paintLens(left, drag.width, .75);
      const over = nearest(left + drag.width / 2);
      if (over !== drag.hover) { drag.hover = over; CZ.ui.haptic('light'); }
    });
    bar.addEventListener('pointerup', (event) => { if (drag && drag.pointerId === event.pointerId) end(false); });
    bar.addEventListener('pointercancel', (event) => { if (drag && drag.pointerId === event.pointerId) end(true); });
    bar.addEventListener('lostpointercapture', (event) => { if (drag && drag.pointerId === event.pointerId) end(true); });
    bar.addEventListener('contextmenu', event => event.preventDefault());
    window.addEventListener('blur', cancelLensDrag);
    window.addEventListener('hashchange', cancelLensDrag);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelLensDrag(); });
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
      cancelLensDrag();
      fitDevice();
      const on = U.qs('.tabbar__in .tab.is-on');
      if (on) movePill(U.qsa('.tabbar__in .tab').indexOf(on), true);
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

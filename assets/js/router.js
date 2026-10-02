/* ==========================================================================
   router.js —— 哈希路由 + 页面转场（前进/返回/切换 Tab）+ 边缘滑动返回
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  const U = CZ.util;

  const ROUTES = [
    { path: 'home', view: 'home', tab: 'corpus' },
    { path: 'list/:cat', view: 'list', tab: 'corpus' },
    { path: 'detail/:id', view: 'detail', tab: 'corpus' },
    { path: 'craft', view: 'craft', tab: 'corpus' },
    { path: 'craft/:id', view: 'craftDetail', tab: 'corpus' },
    { path: 'search', view: 'search', tab: null },
    { path: 'exhibitions', view: 'exhibitions', tab: null },
    { path: 'exhibition/:id', view: 'exhibition', tab: null },
    { path: 'upload', view: 'upload', tab: 'upload' },
    { path: 'profile', view: 'profile', tab: 'me' },
    { path: 'follows', view: 'follows', tab: null },
    { path: 'favorites', view: 'favorites', tab: null },
    { path: 'theme', view: 'theme', tab: null },
    { path: 'history', view: 'history', tab: null },
    { path: 'uploads', view: 'uploads', tab: null },
    { path: 'downloads', view: 'downloads', tab: null },
    { path: 'more', view: 'more', tab: null },
    { path: 'about', view: 'about', tab: null }
  ];

  function parseHash(hash) {
    const raw = String(hash || '').replace(/^#\/?/, '').split('?')[0];
    const segs = raw.split('/').filter(Boolean);
    return segs.length ? segs : ['home'];
  }
  function match(hash) {
    const segs = parseHash(hash);
    for (let i = 0; i < ROUTES.length; i++) {
      const r = ROUTES[i];
      const ps = r.path.split('/');
      if (ps.length !== segs.length) continue;
      const params = {};
      let ok = true;
      for (let j = 0; j < ps.length; j++) {
        if (ps[j][0] === ':') params[ps[j].slice(1)] = decodeURIComponent(segs[j]);
        else if (ps[j] !== segs[j]) { ok = false; break; }
      }
      if (ok) return { def: r, params: params, hash: '#/' + segs.join('/') };
    }
    return { def: ROUTES[0], params: {}, hash: '#/home', notFound: true };
  }

  const pages = new Map();   // hash -> { el, def, params }
  const stack = [];          // hash 顺序
  let active = null;         // 当前 hash
  let animating = false;
  let ignorePop = false;
  let pendingSelf = null;    // 自己触发的 hash 变更（file:// 下 pushState 不可用时用）
  const app = () => document.getElementById('app');
  const listeners = { change: [] };

  // 自己发起的跳转标记只在很短的时间内有效，避免吞掉后续真实的前进/后退
  function clearPendingSoon(hash) {
    setTimeout(() => { if (pendingSelf === hash) pendingSelf = null; }, 160);
  }

  function build(hash, def, params) {
    const fn = CZ.views[def.view];
    if (!fn) return null;
    const view = fn({ params: params, hash: hash, def: def });
    const el = U.el('<div class="page" data-hash="' + hash + '" data-view="' + def.view + '"></div>');
    if (view && view.nodeType === 1) el.appendChild(view);
    else el.innerHTML = view || '';
    pages.set(hash, { el: el, def: def, params: params });
    app().appendChild(el);
    if (CZ.views[def.view].mounted) CZ.views[def.view].mounted(el, { params: params, hash: hash });
    return pages.get(hash);
  }

  function prune() {
    if (pages.size <= 8) return;
    const keep = new Set(stack.slice(-8));
    Array.from(pages.keys()).forEach((k) => {
      if (!keep.has(k) && k !== active) {
        const p = pages.get(k);
        if (p && p.el.parentNode) p.el.parentNode.removeChild(p.el);
        pages.delete(k);
      }
    });
  }

  const EASE = 'cubic-bezier(.32,.72,0,1)';

  function show(el) { el.classList.remove('page--hidden'); el.classList.add('page--active'); }
  function hide(el, keepLayout) {
    el.classList.remove('page--active');
    el.classList.add('page--hidden');
    if (!keepLayout) el.style.transform = '';
  }

  function transition(prevEntry, nextEntry, mode) {
    const next = nextEntry.el;
    const prev = prevEntry && prevEntry.el;
    show(next);
    next.scrollTop = nextEntry.scrollTop || 0;
    if (!prev || prev === next || U.reduceMotion() || mode === 'none') {
      if (prev && prev !== next) hide(prev);
      return;
    }
    animating = true;
    const dur = mode === 'tab' ? 300 : 420;
    let a1, a2;
    if (mode === 'back') {
      show(prev);
      a2 = next.animate(
        [{ transform: 'translateX(-24%)', opacity: 0.6 }, { transform: 'translateX(0)', opacity: 1 }],
        { duration: dur, easing: EASE, fill: 'both' });
      a1 = prev.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }],
        { duration: dur, easing: EASE, fill: 'both' });
    } else if (mode === 'tab') {
      show(prev);
      a2 = next.animate(
        [{ opacity: 0, transform: 'scale(.985)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: dur, easing: EASE, fill: 'both' });
      a1 = prev.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur * 0.7, easing: 'ease', fill: 'both' });
    } else if (mode === 'morph') {
      // 卡片 → 详情：不做位移动画，交给共享元素图层飞行
      show(prev);
      a2 = next.animate(
        [{ opacity: 0, transform: 'scale(.99)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 360, easing: EASE, fill: 'both' });
      a1 = prev.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease', fill: 'both' });
    } else {
      a2 = next.animate(
        [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }],
        { duration: dur, easing: EASE, fill: 'both' });
      a1 = prev.animate(
        [{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(-24%)', opacity: 0.55 }],
        { duration: dur, easing: EASE, fill: 'both' });
    }
    // 收尾必须保证执行：动画事件在后台标签页/省电模式下可能不触发，再加一道定时兜底
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      animating = false;
      if (prev && prev !== next) { hide(prev); prev.style.opacity = ''; prev.style.transform = ''; }
      next.style.transform = '';
      next.style.opacity = '';
      try { a1.cancel(); a2.cancel(); } catch (e) { /* noop */ }
    };
    a2.onfinish = done;
    a2.oncancel = done;
    setTimeout(done, dur + 80);
  }

  function render(hash, mode) {
    const m = match(hash);
    const key = m.hash;
    let entry = pages.get(key);
    if (!entry) entry = build(key, m.def, m.params);
    if (!entry) return;

    const prevEntry = active && pages.get(active);
    if (prevEntry && prevEntry.el !== entry.el) prevEntry.scrollTop = prevEntry.el.scrollTop;

    if (active !== key) {
      const i = stack.indexOf(key);
      if (i >= 0) stack.splice(i, 1);
      stack.push(key);
    }
    active = key;
    transition(prevEntry, entry, mode);
    prune();

    document.documentElement.setAttribute('data-view', m.def.view);
    listeners.change.forEach((fn) => fn({ hash: key, def: m.def, params: m.params }));
    window.scrollTo(0, 0);
  }

  const router = (CZ.router = {
    get current() { return active; },
    get stack() { return stack.slice(); },
    onChange(fn) { listeners.change.push(fn); },
    match: match,

    go(hash, opts) {
      opts = opts || {};
      if (!hash) return;
      if (hash === active) {
        const e = pages.get(hash);
        if (e && opts.scrollTop !== false) e.el.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const mode = opts.mode || 'push';
      pendingSelf = hash;
      clearPendingSoon(hash);
      try {
        history.pushState({ h: hash, mode: mode }, '', hash);
      } catch (e) {
        // file:// 下部分浏览器禁止 pushState，退回改 hash（会触发 popstate/hashchange）
        location.hash = hash;
      }
      render(hash, mode);
    },

    replace(hash) {
      pendingSelf = hash;
      clearPendingSoon(hash);
      try { history.replaceState({ h: hash }, '', hash); } catch (e) { location.hash = hash; }
      render(hash, 'tab');
    },

    back() {
      if (history.length > 1) history.back();
      else router.go('#/home', { mode: 'back' });
    },

    refresh() {
      if (!active) return;
      const p = pages.get(active);
      if (!p) return;
      const m = match(active);
      const fresh = CZ.views[m.def.view]({ params: m.params, hash: active, def: m.def });
      const el = p.el;
      const scroll = el.scrollTop;
      el.innerHTML = '';
      if (fresh && fresh.nodeType === 1) el.appendChild(fresh);
      else el.innerHTML = fresh || '';
      if (CZ.views[m.def.view].mounted) CZ.views[m.def.view].mounted(el, { params: m.params, hash: active });
      el.scrollTop = scroll;
      listeners.change.forEach((fn) => fn({ hash: active, def: m.def, params: m.params, refreshed: true }));
    },

    start() {
      const start = match(location.hash || '#/home').hash;
      pendingSelf = start;
      try { history.replaceState({ h: start }, '', start); } catch (e) { /* file:// 下可能被拒绝，忽略 */ }
      render(start, 'none');
      // 浏览器前进/后退：file:// 场景下 pushState 不可用，改 hash 也会走这两个事件
      const onHistory = () => {
        if (ignorePop) { ignorePop = false; return; }
        const h = match(location.hash).hash;
        if (pendingSelf && h === pendingSelf) { pendingSelf = null; return; }
        render(h, 'back');
      };
      window.addEventListener('popstate', onHistory);
      window.addEventListener('hashchange', onHistory);
      attachSwipeBack();
      document.addEventListener('click', (e) => {
        const a = e.target.closest('[data-nav]');
        if (!a) return;
        e.preventDefault();
        const hash = a.getAttribute('data-nav');
        if (a.hasAttribute('data-tab')) router.go(hash, { mode: 'tab' });
        else if (a.hasAttribute('data-back')) router.back();
        else router.go(hash, { mode: a.getAttribute('data-mode') || 'push' });
      });
    }
  });

  /* ------------------------------ 边缘滑动返回 ------------------------------ */
  function attachSwipeBack() {
    let dragging = false, startX = 0, startY = 0, dx = 0, locked = null;
    let curEl = null, prevEl = null, prevHash = null;

    app().addEventListener('pointerdown', (e) => {
      if (animating || !active) return;
      const idx = stack.indexOf(active);
      if (idx <= 0) return;
      if (e.clientX - app().getBoundingClientRect().left > 32) return;
      dragging = true; locked = null; dx = 0; startX = e.clientX; startY = e.clientY;
      curEl = pages.get(active).el;
      prevHash = stack[idx - 1];
      const pe = pages.get(prevHash);
      prevEl = pe ? pe.el : null;
      if (prevEl) show(prevEl);
    });

    app().addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const mx = e.clientX - startX, my = e.clientY - startY;
      if (locked === null) {
        if (Math.abs(mx) < 6 && Math.abs(my) < 6) return;
        locked = Math.abs(mx) > Math.abs(my) * 1.2 ? 'x' : 'y';
        if (locked === 'x' && curEl) curEl.style.transition = 'none';
      }
      if (locked !== 'x') return;
      dx = Math.max(0, mx);
      const w = app().clientWidth || 390;
      const t = Math.min(1, dx / w);
      curEl.style.transform = 'translateX(' + dx + 'px)';
      curEl.style.boxShadow = dx > 4 ? '-8px 0 28px rgba(0,0,0,.16)' : '';
      if (prevEl) {
        prevEl.style.transform = 'translateX(' + (-24 + 24 * t) + '%)';
        prevEl.style.opacity = String(0.6 + 0.4 * t);
      }
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    const end = (e) => {
      if (!dragging) return;
      const wasX = locked === 'x';
      dragging = false;
      if (!wasX) {
        locked = null;
        // 竖向滑动：把为「返回」预览而显示的上一页重新藏好
        if (prevEl && prevEl !== pages.get(active).el) {
          prevEl.style.transform = '';
          prevEl.style.opacity = '';
          hide(prevEl);
        }
        return;
      }
      const w = app().clientWidth || 390;
      const commit = dx > w * 0.28 || (e && e.clientX - startX > 70);
      curEl.style.transition = '';
      curEl.style.boxShadow = '';
      if (prevEl) { prevEl.style.transform = ''; prevEl.style.opacity = ''; }
      if (commit) {
        const target = prevHash;
        prevEl = null;
        ignorePop = true;
        setTimeout(() => { ignorePop = false; }, 800);
        history.back();
        render(target, 'none');
      } else {
        curEl.animate([{ transform: 'translateX(' + dx + 'px)' }, { transform: 'translateX(0)' }],
          { duration: 260, easing: EASE }).onfinish = () => { curEl.style.transform = ''; };
        if (prevEl) {
          prevEl.animate([{ transform: 'translateX(' + (-24 + 24 * (dx / w)) + '%)', opacity: 0.6 + 0.4 * (dx / w) },
            { transform: 'translateX(-24%)', opacity: 0.6 }], { duration: 260, easing: EASE, fill: 'both' })
            .onfinish = () => { prevEl.style.transform = ''; prevEl.style.opacity = ''; if (prevEl !== pages.get(active).el) hide(prevEl); };
        }
      }
      locked = null;
    };
    app().addEventListener('pointerup', end);
    app().addEventListener('pointercancel', end);
    app().addEventListener('pointerleave', end);
  }
})();

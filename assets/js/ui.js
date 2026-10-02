/* ==========================================================================
   ui.js —— 通用交互组件：Toast / 动作面板 / 对话框 / 滚动揭示 / 下拉刷新 /
           共享元素转场 / 骨架屏 / 触感反馈
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});

  /* ---------------------------------- 小工具 --------------------------------- */
  const util = (CZ.util = {
    esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },
    qs(sel, root) { return (root || document).querySelector(sel); },
    qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); },
    el(html) {
      const t = document.createElement('template');
      t.innerHTML = html.trim();
      return t.content.firstElementChild;
    },
    fmtViews(n) { return n >= 10000 ? (n / 10000).toFixed(1) + ' 万' : String(n); },
    pad(i) { return String(i).padStart(2, '0'); },
    reduceMotion() {
      return document.documentElement.getAttribute('data-motion') === 'off' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  });

  const layer = () => document.getElementById('overlayLayer');

  /* ---------------------------------- Toast --------------------------------- */
  const ui = (CZ.ui = {});
  let toastTimer = null;
  ui.toast = function (msg, opts) {
    opts = opts || {};
    const host = layer();
    util.qsa('.toast', host).forEach((t) => t.remove());
    if (toastTimer) clearTimeout(toastTimer);
    const node = util.el(
      '<div class="toast" role="status">' +
      (opts.icon ? CZ.icon(opts.icon, { size: 18 }) : '') +
      '<span>' + util.esc(msg) + '</span></div>'
    );
    host.appendChild(node);
    requestAnimationFrame(() => node.classList.add('is-in'));
    toastTimer = setTimeout(() => {
      node.classList.remove('is-in');
      setTimeout(() => node.remove(), 320);
    }, opts.duration || 1900);
    if (opts.haptic !== false) ui.haptic('light');
    return node;
  };

  ui.haptic = function (kind) {
    if (navigator.vibrate) { try { navigator.vibrate(kind === 'heavy' ? 18 : 8); } catch (e) { /* noop */ } }
  };

  /* -------------------------------- 动作面板 -------------------------------- */
  ui.sheet = function (cfg) {
    const host = layer();
    const items = (cfg.items || []).map((it, i) => (
      '<button class="sheet__item' + (it.danger ? ' is-danger' : '') + '" data-i="' + i + '">' +
      (it.icon ? '<span class="sheet__ic">' + CZ.icon(it.icon, { size: 21 }) + '</span>' : '') +
      '<span class="sheet__tx"><b>' + util.esc(it.label) + '</b>' +
      (it.desc ? '<i>' + util.esc(it.desc) + '</i>' : '') + '</span>' +
      (it.value ? '<span class="sheet__val">' + util.esc(it.value) + '</span>' : '') +
      (it.checked ? '<span class="sheet__check">' + CZ.icon('check', { size: 18 }) + '</span>' : '') +
      '</button>'
    )).join('');

    const node = util.el(
      '<div class="sheet-wrap">' +
      '<div class="sheet-backdrop"></div>' +
      '<div class="sheet" role="dialog" aria-modal="true">' +
      '<div class="sheet__grip"></div>' +
      (cfg.title ? '<h3 class="sheet__title">' + util.esc(cfg.title) + '</h3>' : '') +
      (cfg.desc ? '<p class="sheet__desc">' + util.esc(cfg.desc) + '</p>' : '') +
      '<div class="sheet__items">' + items + '</div>' +
      (cfg.cancel === false ? '' : '<button class="sheet__cancel">取消</button>') +
      '</div></div>'
    );
    host.appendChild(node);

    const sheet = util.qs('.sheet', node);
    const backdrop = util.qs('.sheet-backdrop', node);
    let closed = false;

    function close() {
      if (closed) return;
      closed = true;
      node.classList.remove('is-in');
      backdrop.style.opacity = '0';
      sheet.style.transform = 'translateY(102%)';
      setTimeout(() => node.remove(), 360);
    }

    requestAnimationFrame(() => {
      node.classList.add('is-in');
      backdrop.style.opacity = '1';
      sheet.style.transform = 'translateY(0)';
    });

    backdrop.addEventListener('click', close);
    const cancelBtn = util.qs('.sheet__cancel', node);
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    util.qsa('.sheet__item', node).forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = (cfg.items || [])[+btn.dataset.i];
        close();
        ui.haptic('light');
        setTimeout(() => { if (item && item.onTap) item.onTap(item); }, 120);
      });
    });

    // 下拉关闭
    let sy = 0, dy = 0, dragging = false;
    sheet.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.sheet__item, .sheet__cancel')) return;
      dragging = true; sy = e.clientY; dy = 0;
      sheet.style.transition = 'none';
      sheet.setPointerCapture(e.pointerId);
    });
    sheet.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - sy);
      sheet.style.transform = 'translateY(' + dy + 'px)';
      backdrop.style.opacity = String(Math.max(0.15, 1 - dy / 420));
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      sheet.style.transition = '';
      if (dy > 90) close();
      else { sheet.style.transform = 'translateY(0)'; backdrop.style.opacity = '1'; }
    };
    sheet.addEventListener('pointerup', endDrag);
    sheet.addEventListener('pointercancel', endDrag);

    return { close: close, node: node };
  };

  /* --------------------------------- 对话框 --------------------------------- */
  ui.confirm = function (cfg) {
    return new Promise((resolve) => {
      const host = layer();
      const node = util.el(
        '<div class="dialog-wrap">' +
        '<div class="dialog-backdrop"></div>' +
        '<div class="dialog" role="alertdialog" aria-modal="true">' +
        '<h3>' + util.esc(cfg.title || '提示') + '</h3>' +
        (cfg.text ? '<p>' + util.esc(cfg.text) + '</p>' : '') +
        '<div class="dialog__acts">' +
        '<button class="btn btn--ghost" data-act="cancel">' + util.esc(cfg.cancelText || '取消') + '</button>' +
        '<button class="btn btn--ink" data-act="ok">' + util.esc(cfg.okText || '确定') + '</button>' +
        '</div></div></div>'
      );
      host.appendChild(node);
      requestAnimationFrame(() => node.classList.add('is-in'));
      const done = (v) => {
        node.classList.remove('is-in');
        setTimeout(() => node.remove(), 260);
        resolve(v);
      };
      node.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]');
        if (b) done(b.dataset.act === 'ok');
        else if (e.target.classList.contains('dialog-backdrop')) done(false);
      });
    });
  };

  /* ------------------------------ 滚动揭示动画 ------------------------------ */
  // 说明：不用 IntersectionObserver，改为按滚动位置计算，避免元素在页面尚未
  // 显示（visibility:hidden / 转场中）时被判定为不可见而永远不揭示。
  function revealList(items, opts) {
    opts = opts || {};
    if (!items.length) return;
    if (util.reduceMotion()) { items.forEach((el) => el.classList.add('is-shown')); return; }
    const box = opts.box || document.documentElement;
    let pending = items.slice();
    const check = () => {
      const b = box.getBoundingClientRect ? box.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
      const next = [];
      for (let i = 0; i < pending.length; i++) {
        const el = pending[i];
        if (el.classList.contains('is-shown')) continue;
        const r = el.getBoundingClientRect();
        if (r.top < b.bottom + 80 && r.bottom > b.top - 120) {
          el.style.transitionDelay = Math.min(i * 45, 300) + 'ms';
          el.classList.add('is-shown');
        } else {
          next.push(el);
        }
      }
      pending = next;
      if (!pending.length) {
        window.removeEventListener('scroll', check, true);
        window.removeEventListener('resize', check);
      }
    };
    window.addEventListener('scroll', check, true);
    window.addEventListener('resize', check);
    requestAnimationFrame(check);
    setTimeout(check, 90);
    setTimeout(check, 420);
  }

  ui.reveal = function (root, opts) {
    revealList(util.qsa('[data-reveal]', root || document), opts);
  };

  // 在指定滚动容器内做揭示
  ui.revealIn = function (scrollRoot, container) {
    revealList(util.qsa('[data-reveal]', container || scrollRoot), { box: scrollRoot });
  };

  /* -------------------------------- 下拉刷新 -------------------------------- */
  ui.pullToRefresh = function (scrollEl, contentEl, onRefresh) {
    if (util.reduceMotion() || !contentEl) return;
    let startY = 0, pulling = false, dist = 0, busy = false;
    const indicator = util.el('<div class="ptr"><span class="ptr__ink"></span><span class="ptr__tx">下拉刷新</span></div>');
    scrollEl.insertBefore(indicator, scrollEl.firstChild);
    const tx = util.qs('.ptr__tx', indicator);
    const ink = util.qs('.ptr__ink', indicator);

    function reset() {
      indicator.style.height = '0px';
      contentEl.style.transform = '';
      indicator.classList.remove('is-ready', 'is-busy');
      tx.textContent = '下拉刷新';
      ink.style.transform = 'scale(.4)';
    }
    reset();

    scrollEl.addEventListener('touchstart', (e) => {
      if (busy || scrollEl.scrollTop > 0) return;
      startY = e.touches[0].clientY;
      pulling = true; dist = 0;
    }, { passive: true });

    scrollEl.addEventListener('touchmove', (e) => {
      if (!pulling || busy) return;
      dist = e.touches[0].clientY - startY;
      if (dist <= 0) { reset(); return; }
      const eased = Math.min(88, dist * 0.46);
      indicator.style.height = eased + 'px';
      contentEl.style.transition = 'none';
      contentEl.style.transform = 'translateY(' + eased + 'px)';
      indicator.classList.toggle('is-ready', eased > 50);
      tx.textContent = eased > 50 ? '松开刷新' : '下拉刷新';
      ink.style.transform = 'scale(' + Math.min(1, 0.4 + eased / 70) + ') rotate(' + eased * 3 + 'deg)';
      if (e.cancelable && eased > 10) e.preventDefault();
    }, { passive: false });

    const finish = () => {
      if (!pulling) return;
      pulling = false;
      contentEl.style.transition = 'transform .34s cubic-bezier(.32,.72,0,1)';
      const go = dist * 0.46 > 50;
      if (!go) { reset(); return; }
      busy = true;
      indicator.style.height = '50px';
      indicator.classList.add('is-busy');
      tx.textContent = '正在更新语料…';
      contentEl.style.transform = 'translateY(50px)';
      setTimeout(() => {
        reset();
        busy = false;
        if (onRefresh) onRefresh();
      }, 900);
    };
    scrollEl.addEventListener('touchend', finish);
    scrollEl.addEventListener('touchcancel', finish);
  };

  /* ------------------------------ 共享元素转场 ------------------------------ */
  // 把来源图形「飞」到目标元素位置：src 可以是元素，也可以是 { rect, html }
  ui.morph = function (src, dstEl, opts) {
    opts = opts || {};
    if (!src || !dstEl || util.reduceMotion()) return null;
    const screen = document.getElementById('screen');
    const sr = src.rect || src.getBoundingClientRect();
    const html = src.html != null ? src.html : src.innerHTML;
    const dr = dstEl.getBoundingClientRect();
    const box = screen.getBoundingClientRect();
    if (!sr.width || !sr.height || !dr.width || !dr.height) return null;
    const clone = util.el('<div class="morph"><div class="morph__inner">' + html + '</div></div>');
    clone.style.cssText = 'position:absolute;left:' + (sr.left - box.left) + 'px;top:' + (sr.top - box.top) +
      'px;width:' + sr.width + 'px;height:' + sr.height + 'px;';
    const inner = util.qs('.morph__inner', clone);
    inner.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;';
    const svg = util.qs('svg', inner);
    if (svg) svg.style.cssText = 'width:100%;height:100%;display:block;';
    screen.appendChild(clone);
    const dx = dr.left - sr.left, dy = dr.top - sr.top;
    const sx = dr.width / sr.width, sy = dr.height / sr.height;
    const dur = opts.duration || 460;
    const anim = clone.animate(
      [{ transform: 'translate(0,0) scale(1,1)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')', opacity: 1 }],
      { duration: dur, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'forwards' }
    );
    const finish = () => {
      clone.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' })
        .onfinish = () => clone.remove();
    };
    anim.onfinish = finish;
    anim.oncancel = () => clone.remove();
    return clone;
  };

  /* --------------------------------- 骨架屏 --------------------------------- */
  ui.skeletonGrid = function (n, cols) {
    let s = '<div class="sk-grid" style="--cols:' + (cols || 3) + '">';
    for (let i = 0; i < n; i++) s += '<div class="sk sk--card"></div>';
    return s + '</div>';
  };
  ui.skeletonRows = function (n) {
    let s = '';
    for (let i = 0; i < n; i++) s += '<div class="sk sk--row"></div>';
    return s;
  };

  /* ------------------------------ 空状态 / 页脚 ------------------------------ */
  ui.empty = function (title, desc, actionHTML) {
    return '<div class="empty">' + CZ.Art.empty('e') +
      '<b>' + util.esc(title) + '</b>' +
      (desc ? '<p>' + util.esc(desc) + '</p>' : '') +
      (actionHTML || '') + '</div>';
  };

  ui.footer = function () {
    return '<footer class="page-foot"><span class="page-foot__line"></span>' +
      '<p>' + util.esc(CZ.DATA.app.museum) + ' · ' + util.esc(CZ.DATA.app.name) + '</p>' +
      '<p class="page-foot__sub">' + util.esc(CZ.DATA.app.version) + ' · 示例数据仅用于界面演示</p></footer>';
  };

  /* ------------------------------ 纹样图形快捷入口 ------------------------------ */
  ui.motif = function (p, opts) {
    opts = opts || {};
    const photo = opts.line ? null : (p.photo || CZ.Art.photos.motif[p.id]);
    return CZ.Art.motif({
      seed: p.id + (opts.line ? '-l' : ''),
      motif: p.motif,
      comp: opts.comp || p.comp,
      line: !!opts.line,
      photo: photo,
      alt: p.title || p.listName
    });
  };

  // 视图层更常写作 U.footer() / U.motif(p) / U.revealIn(...)
  util.footer = ui.footer;
  util.motif = ui.motif;
  util.empty = ui.empty;
  util.reveal = ui.reveal;
  util.revealIn = ui.revealIn;
  util.toast = ui.toast;
  util.sheet = ui.sheet;
  util.confirm = ui.confirm;
})();

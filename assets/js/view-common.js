/* ==========================================================================
   view-common.js —— 视图公共构件（导航条 / 卡片 / 列表行 / 章节头）
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  const U = CZ.util;
  const vc = (CZ.vc = {});
  CZ.views = CZ.views || {};   // 全部页面视图的注册表

  /* --------------------------------- 导航条 --------------------------------- */
  vc.navbar = function (title, opts) {
    opts = opts || {};
    const left = opts.back === false
      ? '<span class="navbar__ph"></span>'
      : '<button class="glass-btn" data-back aria-label="返回">' + CZ.icon('back', { size: 20 }) + '</button>';
    const right = opts.right || '<button class="glass-btn" data-more aria-label="更多">' + CZ.icon('dots', { size: 20 }) + '</button>';
    return '<header class="navbar">' +
      '<div class="navbar__bar">' + left +
      '<h1 class="navbar__title">' + U.esc(title) + '</h1>' + right + '</div>' +
      '<div class="navbar__line"></div></header>';
  };

  // 滚动时给导航条加毛玻璃与分隔线
  vc.bindScrollChrome = function (pageEl, opts) {
    opts = opts || {};
    const nav = U.qs('.navbar', pageEl);
    const chips = U.qs('.chipsbar', pageEl);
    const onScroll = () => {
      const y = pageEl.scrollTop;
      if (nav) nav.classList.toggle('is-stuck', y > 6);
      if (chips) chips.classList.toggle('is-stuck', y > 6);
      if (opts.onScroll) opts.onScroll(y);
    };
    pageEl.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return onScroll;
  };

  vc.bindBack = function (pageEl) {
    const b = U.qs('[data-back]', pageEl);
    if (b) b.addEventListener('click', () => CZ.router.back());
  };

  /* --------------------------------- 章节头 --------------------------------- */
  vc.sectionHead = function (title, sub, rightHTML) {
    return '<div class="sec-head"><div class="sec-head__tx"><h2>' + U.esc(title) + '</h2>' +
      (sub ? '<p>' + U.esc(sub) + '</p>' : '') + '</div>' + (rightHTML || '') + '</div>';
  };

  /* --------------------------------- 纹样卡片 --------------------------------- */
  vc.patternCard = function (p, opts) {
    opts = opts || {};
    return '<article class="pcard" data-nav="#/detail/' + p.id + '" data-id="' + p.id + '"' +
      (opts.reveal === false ? '' : ' data-reveal') + '>' +
      '<div class="pcard__media" data-morph-src>' + U.motif(p) + '</div>' +
      '<div class="pcard__foot"><span class="pcard__name">' + U.esc(p.listName) + '</span>' +
      '<span class="pcard__mark">' + CZ.icon('list', { size: 13, sw: 1.9 }) + '</span></div>' +
      '</article>';
  };

  vc.patternRow = function (p, opts) {
    opts = opts || {};
    return '<article class="prow" data-nav="#/detail/' + p.id + '" data-id="' + p.id + '">' +
      '<div class="prow__media">' + U.motif(p) + '</div>' +
      '<div class="prow__tx"><b>' + U.esc(p.title) + '</b>' +
      '<p>' + U.esc(p.styleLabel) + ' · ' + U.esc(p.meta.era) + '</p>' +
      '<span>' + U.esc(p.meta.tech) + '</span></div>' +
      (opts.right || '<span class="prow__go">' + CZ.icon('next', { size: 16 }) + '</span>') +
      '</article>';
  };

  /* --------------------------------- 信息行 --------------------------------- */
  vc.kv = function (rows, cls) {
    return '<dl class="kv ' + (cls || '') + '">' + rows.map((r) =>
      '<div class="kv__row"><dt>' + U.esc(r[0]) + '</dt><dd>' + U.esc(r[1]) + '</dd></div>').join('') + '</dl>';
  };

  vc.listRow = function (cfg) {
    const tag = cfg.nav ? 'a' : 'div';
    return '<' + tag + ' class="lrow' + (cfg.cls ? ' ' + cfg.cls : '') + '"' +
      (cfg.nav ? ' data-nav="' + cfg.nav + '"' : '') + (cfg.attrs || '') + '>' +
      (cfg.icon ? '<span class="lrow__ic">' + CZ.icon(cfg.icon, { size: 21 }) + '</span>' : '') +
      (cfg.art ? '<span class="lrow__art">' + cfg.art + '</span>' : '') +
      '<span class="lrow__tx"><b>' + U.esc(cfg.title) + '</b>' +
      (cfg.desc ? '<i>' + U.esc(cfg.desc) + '</i>' : '') + '</span>' +
      (cfg.right || (cfg.nav ? '<span class="lrow__go">' + CZ.icon('next', { size: 16 }) + '</span>' : '')) +
      '</' + tag + '>';
  };

  /* --------------------------------- 标签条 --------------------------------- */
  vc.chips = function (items, activeKey, opts) {
    opts = opts || {};
    return '<div class="chipsbar"><div class="chips" role="tablist">' + items.map((it) =>
      '<button class="chip' + (it.key === activeKey ? ' is-on' : '') + '" role="tab"' +
      ' aria-selected="' + (it.key === activeKey) + '" data-chip="' + it.key + '">' + U.esc(it.name) +
      (it.count ? '<i>' + it.count + '</i>' : '') + '</button>').join('') + '</div></div>';
  };

  /* --------------------------------- 底部占位 --------------------------------- */
  vc.bottomSpace = function (extra) {
    return '<div class="bottom-space" style="height:' + (extra || 96) + 'px"></div>';
  };

  /* ----------------------------- 收藏 / 关注 按钮行为 ----------------------------- */
  vc.wire = {};

  vc.wire.patternInteractions = function (pageEl, onLongPress) {
    const cards = U.qsa('.pcard, .prow', pageEl);
    cards.forEach((card) => {
      let timer = null, moved = false, startX = 0, startY = 0;
      const id = card.dataset.id;
      card.addEventListener('pointerdown', (e) => {
        moved = false; startX = e.clientX; startY = e.clientY;
        card.classList.add('is-press');
        timer = setTimeout(() => {
          timer = null;
          if (!moved && onLongPress) onLongPress(id, card);
        }, 480);
      });
      card.addEventListener('pointermove', (e) => {
        if (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8) {
          moved = true;
          card.classList.remove('is-press');
          if (timer) { clearTimeout(timer); timer = null; }
        }
      });
      const up = () => {
        card.classList.remove('is-press');
        if (timer) { clearTimeout(timer); timer = null; }
      };
      card.addEventListener('pointerup', up);
      card.addEventListener('pointercancel', up);
      card.addEventListener('pointerleave', up);
      card.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  };

  // 长按快捷操作面板
  vc.patternActions = function (id) {
    const p = CZ.DATA.byId(id);
    if (!p) return;
    const faved = CZ.store.isFav(id);
    CZ.ui.sheet({
      title: p.title + ' · ' + p.listName,
      desc: p.styleLabel + ' · ' + p.meta.era + ' · ' + p.meta.tech,
      items: [
        { icon: 'eye', label: '查看纹样详情', desc: '出处、语料与范本', onTap: () => CZ.router.go('#/detail/' + id) },
        {
          icon: 'star', label: faved ? '取消收藏' : '收藏纹样', desc: faved ? '已在我的收藏中' : '加入我的收藏',
          onTap: () => {
            const on = CZ.store.toggleFav(id);
            CZ.ui.toast(on ? '已加入我的收藏' : '已取消收藏', { icon: on ? 'star' : 'close' });
          }
        },
        { icon: 'downBox', label: '下载高清图', desc: '约 6.4 MB · PNG', onTap: () => CZ.ui.toast('已加入下载队列', { icon: 'downBox' }) },
        { icon: 'share', label: '分享纹样', desc: '复制链接或分享图片', onTap: () => CZ.ui.toast('分享链接已复制', { icon: 'share' }) }
      ]
    });
  };

  /* ------------------------------ 卡片点击涟漪反馈 ------------------------------ */
  vc.wirePress = function (root) {
    U.qsa('[data-nav], .btn, .chip, .qgrid__item', root).forEach((el) => {
      if (el.dataset.pressWired) return;
      el.dataset.pressWired = '1';
      el.addEventListener('pointerdown', () => el.classList.add('is-press'));
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) =>
        el.addEventListener(ev, () => el.classList.remove('is-press')));
    });
  };
})();

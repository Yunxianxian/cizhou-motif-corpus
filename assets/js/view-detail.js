/* ==========================================================================
   view-detail.js —— 三级界面：纹样详情（出处 / 图版 / 相关语料 / 语料范本）
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  const U = CZ.util;
  const vc = CZ.vc;

  function views(p) {
    return [
      { key: 'line', label: '线稿', html: U.motif(p, { line: true, comp: p.comp }) },
      { key: 'ware', label: '器物', html: CZ.Art.onWare(p.id, { seed: p.id, motif: p.motif, comp: p.comp }, p.motif === 'child' || p.motif === 'story' || p.motif === 'immortal' ? 'pillow' : 'plate') },
      { key: 'jar', label: '瓶罐', html: CZ.Art.onWare(p.id, { seed: p.id + 'b', motif: p.motif, comp: p.comp }, 'jar') },
      { key: 'sherd', label: '瓷片', html: CZ.Art.onWare(p.id, { seed: p.id + 'c', motif: p.motif, comp: p.comp }, 'sherd') },
      { key: 'tile', label: '范本', html: CZ.Art.tile(p.id, { seed: p.id, motif: p.motif, comp: p.comp }, 3, 3) }
    ];
  }

  CZ.views.detail = function (ctx) {
    const D = CZ.DATA;
    const p = D.byId(ctx.params.id) || D.patterns[0];
    CZ.store.pushHistory(p.id);

    const cat = D.categories[p.cat];
    const vs = views(p);
    const faved = CZ.store.isFav(p.id);
    const siblings = D.siblings(p).slice(0, 6);

    const node = U.el(
      '<div class="detail">' +
      vc.navbar(cat.title) +

      '<section class="dhead">' +
      '<div class="dhead__main" data-morph-dst role="button" tabindex="0" aria-label="全屏查看纹样图片">' + vs[0].html +
      '<span class="image-zoom-hint" aria-hidden="true">' + CZ.icon('search', { size: 15 }) + '</span>' +
      '<span class="dhead__badge">' + U.esc(p.styleLabel) + '</span></div>' +
      '<div class="dhead__info">' +
      '<h1 class="dhead__title" data-reveal>' + U.esc(p.title) + '</h1>' +
      '<p class="dhead__label">纹样出处</p>' +
      vc.kv([
        ['名称', p.meta.name],
        ['年代', p.meta.era],
        ['技法', p.meta.tech],
        ['产地', p.meta.origin],
        ['尺寸', p.meta.size]
      ], 'kv--compact') +
      '<div class="dhead__stat">' + CZ.icon('eye', { size: 14 }) + '<span>' + U.fmtViews(p.views) + ' 次查看</span>' +
      '<i>·</i><span>更新于' + U.esc(p.updated) + '</span></div>' +
      '</div></section>' +

      '<div class="thumbs" id="thumbs">' + vs.map((v, i) =>
        '<button class="thumb' + (i === 0 ? ' is-on' : '') + '" data-v="' + i + '" aria-label="' + U.esc(v.label) + '">' +
        '<span class="thumb__art">' + v.html + '</span><span class="thumb__tx">' + U.esc(v.label) + '</span></button>').join('') +
      '</div>' +

      '<section class="dcols">' +
      '<div class="dcol">' +
      '<h2 class="dcol__title">相关语料</h2>' +
      '<div class="dcard" data-reveal>' + CZ.Art.onWare(p.id + '-corpus', { seed: p.id + '-c', motif: p.motif, comp: p.comp }, 'pillow') + '</div>' +
      '<dl class="kvs">' +
      '<div class="kvs__row"><dt>主题词</dt><dd>' + U.esc(p.themes.join('、')) + '</dd></div>' +
      '<div class="kvs__row"><dt>寓意</dt><dd>' + U.esc(p.meaning) + '</dd></div>' +
      '<div class="kvs__row"><dt>形式与构图</dt><dd>' + U.esc(p.form) + '</dd></div>' +
      '<div class="kvs__row"><dt>历史语境</dt><dd>' + U.esc(p.context) + '</dd></div>' +
      '</dl>' + '</div>' +
      '<div class="dcol">' +
      '<h2 class="dcol__title">语料范本</h2>' +
      '<div class="dcard" data-reveal>' + CZ.Art.tile(p.id + '-sample', { seed: p.id + '-s', motif: p.motif, comp: p.comp }, 3, 3) + '</div>' +
      '<p class="dtext" id="dtext">' + U.esc(p.sample) + '</p>' +
      '<button class="morebtn" id="moreText">展开全文' + CZ.icon('down', { size: 14 }) + '</button>' +
      '<div class="dquote"><span class="dquote__mark">“</span>' + U.esc(p.styleLabel) + ' · ' + U.esc(p.meta.era) +
      '<br>收录于' + U.esc(D.app.name) + '</div>' +
      '</div>' +
      '</section>' +

      (siblings.length ? '<section class="dsib">' +
        '<div class="sec-head"><div class="sec-head__tx"><h2>同主题纹样</h2><p>' + U.esc(p.groupName) + ' 共 ' +
        (siblings.length + 1) + ' 件</p></div></div>' +
        '<div class="sibrow">' + siblings.map((s) =>
          '<a class="sibcard" data-nav="#/detail/' + s.id + '"><span class="sibcard__art">' + U.motif(s) + '</span>' +
          '<b>' + U.esc(s.listName) + '</b><i>' + U.esc(s.styleLabel) + '</i></a>').join('') + '</div></section>' : '') +

      U.footer() + vc.bottomSpace(132) + '</div>'
    );
    return node;
  };

  CZ.views.detail.mounted = function (pageEl, ctx) {
    const D = CZ.DATA;
    const p = D.byId(ctx.params.id) || D.patterns[0];
    const vs = views(p);
    const main = U.qs('.dhead__main', pageEl);
    let currentView = 0;
    const corpusImages = U.qsa('.dcard', pageEl);
    const gallery = vs.concat(corpusImages.map((card, i) => ({
      label: i === 0 ? '相关语料' : '语料范本', html: card.innerHTML
    })));
    function wireViewer(el, getIndex, label) {
      el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', label);
      const open = () => CZ.ui.imageViewer(gallery, getIndex(), p.title);
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    }
    wireViewer(main, () => currentView, '全屏查看纹样图片');
    corpusImages.forEach((card, i) => wireViewer(card, () => vs.length + i,
      '全屏查看' + (i === 0 ? '相关语料图片' : '语料范本图片')));

    U.qsa('.thumb', pageEl).forEach((t) => {
      t.addEventListener('click', () => {
        const i = +t.dataset.v;
        currentView = i;
        if (t.classList.contains('is-on')) return;
        U.qsa('.thumb', pageEl).forEach((x) => x.classList.remove('is-on'));
        t.classList.add('is-on');
        const old = U.qs('.art', main);
        const tmp = U.el('<div class="dhead__swap">' + vs[i].html + '</div>');
        const badge = U.qs('.dhead__badge', main);
        main.insertBefore(tmp, badge);
        const fresh = U.qs('.art', tmp);
        if (old && !U.reduceMotion()) {
          old.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.96)' }],
            { duration: 240, easing: 'ease', fill: 'forwards' });
          fresh.animate([{ opacity: 0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'scale(1)' }],
            { duration: 420, easing: 'cubic-bezier(.32,.72,0,1)' });
        }
        setTimeout(() => { if (old) old.remove(); tmp.replaceWith(fresh); }, 260);
        CZ.ui.haptic('light');
      });
    });

    // 长文本展开
    const moreText = U.qs('#moreText', pageEl);
    if (moreText) {
      const tx = U.qs('#dtext', pageEl);
      tx.classList.add('is-clamped');
      moreText.addEventListener('click', () => {
        const on = tx.classList.toggle('is-clamped');
        moreText.innerHTML = (on ? '展开全文' : '收起全文') + CZ.icon(on ? 'down' : 'up', { size: 14 });
        moreText.classList.toggle('is-open', !on);
      });
    }

    // 横向缩略图边缘渐隐
    const thumbs = U.qs('#thumbs', pageEl);
    const edge = () => {
      const max = thumbs.scrollWidth - thumbs.clientWidth;
      thumbs.classList.toggle('is-end', thumbs.scrollLeft > max - 6);
    };
    thumbs.addEventListener('scroll', edge, { passive: true });
    requestAnimationFrame(edge);

    // 顶部「更多」动作
    U.qs('[data-more]', pageEl).addEventListener('click', () => {
      const faved = CZ.store.isFav(p.id);
      const followed = CZ.store.isFollowed('group-' + p.group);
      CZ.ui.sheet({
        title: p.title,
        desc: p.meta.era + ' · ' + p.meta.tech + ' · ' + p.meta.origin,
        items: [
          {
            icon: 'star', label: faved ? '取消收藏' : '收藏纹样', desc: faved ? '已在我的收藏中' : '加入我的收藏',
            onTap: () => {
              const on = CZ.store.toggleFav(p.id);
              CZ.ui.toast(on ? '已加入我的收藏' : '已取消收藏', { icon: on ? 'star' : 'close' });
            }
          },
          {
            icon: 'heart', label: followed ? '取消关注「' + p.groupName + '」' : '关注「' + p.groupName + '」',
            desc: '有更新时提醒我',
            onTap: () => {
              const on = CZ.store.toggleFollow({ id: 'group-' + p.group, kind: 'group', name: p.groupName, desc: '纹样合集 · 已关注' });
              CZ.ui.toast(on ? '已关注 ' + p.groupName : '已取消关注', { icon: 'heart' });
            }
          },
          { icon: 'downBox', label: '下载高清图与线稿', desc: '约 6.4 MB · PNG / SVG', onTap: () => CZ.ui.toast('已加入下载队列', { icon: 'downBox' }) },
          { icon: 'camera', label: '同款实物照片', desc: '馆藏 3 张', onTap: () => CZ.ui.toast('馆藏实物照片加载中…', { icon: 'camera' }) },
          { icon: 'share', label: '分享纹样', desc: '生成分享卡片', onTap: () => CZ.ui.toast('分享链接已复制', { icon: 'share' }) },
          { icon: 'info', label: '纹样纠错', desc: '提交名称或年代的更正', onTap: () => CZ.ui.toast('已记录，感谢你的反馈', { icon: 'check' }) }
        ]
      });
    });

    // 快捷收藏浮标
    const fab = U.el('<button class="dfab' + (CZ.store.isFav(p.id) ? ' is-on' : '') + '" aria-label="收藏">' +
      CZ.icon('star', { size: 20 }) + '</button>');
    pageEl.appendChild(fab);
    fab.addEventListener('click', () => {
      const on = CZ.store.toggleFav(p.id);
      fab.classList.toggle('is-on', on);
      fab.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }],
        { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      CZ.ui.toast(on ? '已加入我的收藏' : '已取消收藏', { icon: on ? 'star' : 'close' });
    });

    vc.bindScrollChrome(pageEl, {
      onScroll(y) {
        const t = Math.min(1, y / 220);
        fab.style.opacity = String(Math.max(0.25, 1 - t));
      }
    });
    vc.bindBack(pageEl);
    U.revealIn(pageEl, pageEl);
    vc.wirePress(pageEl);
  };
})();

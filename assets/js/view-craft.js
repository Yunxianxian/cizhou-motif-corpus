/* ==========================================================================
   view-craft.js —— 二级界面：传统烧制工艺 / 展览信息 及其详情
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  const U = CZ.util;
  const vc = CZ.vc;

  /* --------------------------------- 工艺总览 --------------------------------- */
  CZ.views.craft = function () {
    const D = CZ.DATA;
    const steps = D.crafts.map((c, i) =>
      '<a class="stepcard" data-nav="#/craft/' + c.id + '" data-reveal data-delay="' + (i * 50) + '">' +
      '<span class="stepcard__media">' + CZ.Art.craft(c.art, c.id) + '</span>' +
      '<span class="stepcard__no">' + U.esc(c.step) + '</span>' +
      '<b>' + U.esc(c.name) + '</b><i>' + U.esc(c.short) + '</i></a>').join('');

    const acc = D.crafts.map((c, i) =>
      '<div class="acc" data-acc="' + c.id + '" data-reveal data-delay="' + (i * 36) + '">' +
      '<button class="acc__hd"><span class="acc__no">' + U.esc(c.step) + '</span>' +
      '<span class="acc__tx"><b>' + U.esc(c.name) + '</b><i>' + U.esc(c.short) + '</i></span>' +
      '<span class="acc__ic">' + CZ.icon('down', { size: 16 }) + '</span></button>' +
      '<div class="acc__bd"><p>' + U.esc(c.desc) + '</p>' +
      '<ul class="bullet">' + c.points.map((pt) => '<li>' + U.esc(pt) + '</li>').join('') + '</ul>' +
      '<a class="acc__more" data-nav="#/craft/' + c.id + '">工序详解' + CZ.icon('next', { size: 13 }) + '</a>' +
      '</div></div>').join('');

    const sites = D.sites.map((s, i) =>
      '<div class="siterow" data-reveal data-delay="' + (i * 50) + '">' +
      '<span class="siterow__pin">' + CZ.icon('location', { size: 16 }) + '</span>' +
      '<span class="siterow__tx"><b>' + U.esc(s.name) + '</b><i>' + U.esc(s.place) + '</i>' +
      '<em>' + U.esc(s.note) + '</em></span>' +
      '<span class="siterow__era">' + U.esc(s.era) + '</span></div>').join('');

    return U.el(
      '<div class="craftpage">' +
      vc.navbar('传统烧制工艺') +
      '<section class="crafthero">' +
      '<div class="crafthero__art">' + CZ.Art.craft('kiln', 'hero-craft') + '</div>' +
      '<div class="crafthero__tx"><span class="chip chip--ghost">一窑一器，薪火不息</span>' +
      '<h2>七道工序，一件器物</h2><p>' + U.esc(D.craftIntro) + '</p></div></section>' +

      '<section class="stepped">' +
      '<div class="sec-head"><div class="sec-head__tx"><h2>工序流程</h2><p>左右滑动查看 8 道工序</p></div></div>' +
      '<div class="steprow">' + steps + '</div></section>' +

      '<section class="accs">' +
      '<div class="sec-head"><div class="sec-head__tx"><h2>工序详解</h2><p>点击展开要点</p></div></div>' +
      acc + '</section>' +

      '<section class="sites">' +
      '<div class="sec-head"><div class="sec-head__tx"><h2>窑址分布</h2><p>磁州窑中心窑场</p></div></div>' +
      sites + '</section>' +

      U.footer() + vc.bottomSpace(120) + '</div>'
    );
  };

  CZ.views.craft.mounted = function (pageEl) {
    U.qsa('.acc', pageEl).forEach((a) => {
      const hd = U.qs('.acc__hd', a);
      hd.addEventListener('click', () => {
        const open = a.classList.contains('is-open');
        a.classList.toggle('is-open', !open);
        const bd = U.qs('.acc__bd', a);
        if (!open) {
          bd.style.height = 'auto';
          const h = bd.offsetHeight;
          bd.style.height = '0px';
          requestAnimationFrame(() => {
            bd.style.transition = 'height .38s cubic-bezier(.32,.72,0,1)';
            bd.style.height = h + 'px';
            setTimeout(() => { bd.style.height = 'auto'; }, 400);
          });
        } else {
          bd.style.height = bd.offsetHeight + 'px';
          requestAnimationFrame(() => {
            bd.style.transition = 'height .3s cubic-bezier(.32,.72,0,1)';
            bd.style.height = '0px';
          });
        }
        CZ.ui.haptic('light');
      });
    });
    vc.bindScrollChrome(pageEl);
    vc.bindBack(pageEl);
    U.qs('[data-more]', pageEl).addEventListener('click', () => {
      CZ.ui.sheet({
        title: '传统烧制工艺',
        desc: '8 道工序 · 4 处窑址',
        items: [
          { icon: 'play', label: '观看工艺影像', desc: '约 12 分钟', onTap: () => CZ.ui.toast('影像资料加载中…', { icon: 'play' }) },
          { icon: 'downBox', label: '下载工艺手册', desc: 'PDF · 4.2 MB', onTap: () => CZ.ui.toast('已加入下载队列', { icon: 'downBox' }) },
          { icon: 'share', label: '分享工艺图谱', desc: '生成分享卡片', onTap: () => CZ.ui.toast('分享链接已复制', { icon: 'share' }) }
        ]
      });
    });
    U.revealIn(pageEl, pageEl);
    vc.wirePress(pageEl);
  };

  /* --------------------------------- 工序详情 --------------------------------- */
  CZ.views.craftDetail = function (ctx) {
    const D = CZ.DATA;
    const idx = Math.max(0, D.crafts.findIndex((c) => c.id === ctx.params.id));
    const c = D.crafts[idx] || D.crafts[0];
    const prev = D.crafts[(idx - 1 + D.crafts.length) % D.crafts.length];
    const next = D.crafts[(idx + 1) % D.crafts.length];

    return U.el(
      '<div class="craftdetail">' +
      vc.navbar('工序详解') +
      '<section class="chero"><div class="chero__art">' + CZ.Art.craft(c.art, c.id + '-big') + '</div>' +
      '<div class="chero__tx"><span class="chero__no">工序 ' + U.esc(c.step) + '</span>' +
      '<h1>' + U.esc(c.name) + '</h1><p>' + U.esc(c.short) + '</p>' +
      '<span class="chip chip--ghost">' + U.esc(c.era) + '</span></div></section>' +

      '<section class="cblock" data-reveal><h2>工序说明</h2><p class="cbody">' + U.esc(c.desc) + '</p></section>' +

      '<section class="cblock" data-reveal><h2>工序要点</h2><ul class="bullet bullet--num">' +
      c.points.map((pt, i) => '<li><span>' + U.pad(i + 1) + '</span>' + U.esc(pt) + '</li>').join('') + '</ul></section>' +

      '<section class="cblock" data-reveal><h2>常见问题</h2><div class="flaws">' +
      c.flaws.map((f) => '<div class="flaw">' + CZ.icon('info', { size: 15 }) + '<span>' + U.esc(f) + '</span></div>').join('') +
      '</div></section>' +

      '<section class="cblock" data-reveal><h2>相关纹样</h2>' +
      '<div class="sibrow">' + D.patterns.slice(idx * 2, idx * 2 + 5).map((p) =>
        '<a class="sibcard" data-nav="#/detail/' + p.id + '"><span class="sibcard__art">' + U.motif(p) + '</span>' +
        '<b>' + U.esc(p.listName) + '</b><i>' + U.esc(p.styleLabel) + '</i></a>').join('') + '</div></section>' +

      '<nav class="stepnav">' +
      '<a class="stepnav__it" data-nav="#/craft/' + prev.id + '"><span>上一道</span><b>' + U.esc(prev.name) + '</b></a>' +
      '<a class="stepnav__it stepnav__it--next" data-nav="#/craft/' + next.id + '"><span>下一道</span><b>' + U.esc(next.name) + '</b></a>' +
      '</nav>' + U.footer() + vc.bottomSpace(120) + '</div>'
    );
  };

  CZ.views.craftDetail.mounted = function (pageEl) {
    vc.bindScrollChrome(pageEl);
    vc.bindBack(pageEl);
    U.qs('[data-more]', pageEl).addEventListener('click', () => {
      CZ.ui.sheet({
        items: [
          { icon: 'star', label: '收藏本工序', desc: '加入我的收藏', onTap: () => CZ.ui.toast('已加入我的收藏', { icon: 'star' }) },
          { icon: 'share', label: '分享', desc: '生成分享卡片', onTap: () => CZ.ui.toast('分享链接已复制', { icon: 'share' }) }
        ]
      });
    });
    U.revealIn(pageEl, pageEl);
    vc.wirePress(pageEl);
  };

  /* --------------------------------- 展览列表 --------------------------------- */
  const STATUS = { ongoing: '进行中', soon: '即将开始', past: '已结束' };

  CZ.views.exhibitions = function () {
    const D = CZ.DATA;
    return U.el(
      '<div class="exhpage">' +
      vc.navbar('展览信息') +
      vc.chips([{ key: 'all', name: '全部' }, { key: 'ongoing', name: '进行中' }, { key: 'soon', name: '即将开始' }, { key: 'past', name: '已结束' }], 'all') +
      '<div class="exhlist" id="exhList"></div>' +
      vc.bottomSpace(120) + '</div>'
    );
  };

  CZ.views.exhibitions.mounted = function (pageEl) {
    const D = CZ.DATA;
    const list = U.qs('#exhList', pageEl);

    function draw(filter) {
      const items = D.exhibitions.filter((e) => filter === 'all' || e.status === filter);
      if (!items.length) { list.innerHTML = CZ.ui.empty('暂无该状态的展览', '', ''); return; }
      list.innerHTML = items.map((e, i) =>
        '<a class="exhrow-card" data-nav="#/exhibition/' + e.id + '" data-reveal data-delay="' + (i * 60) + '">' +
        '<div class="exhrow-card__media">' + CZ.Art.craft(e.art, e.id) +
        '<span class="status status--' + e.status + '">' + STATUS[e.status] + '</span></div>' +
        '<div class="exhrow-card__tx"><b>' + U.esc(e.title) + '</b>' +
        '<p>' + CZ.icon('calendar', { size: 13 }) + U.esc(e.date) + '</p>' +
        '<p>' + CZ.icon('location', { size: 13 }) + U.esc(e.place) + '</p>' +
        '<span class="exhrow-card__tag">' + U.esc(e.tag) + '</span></div></a>').join('');
      U.revealIn(pageEl, list);
      vc.wirePress(list);
    }

    U.qsa('.chip', pageEl).forEach((c) => c.addEventListener('click', () => {
      U.qsa('.chip', pageEl).forEach((x) => x.classList.remove('is-on'));
      c.classList.add('is-on');
      draw(c.dataset.chip);
    }));
    draw('all');
    vc.bindScrollChrome(pageEl);
    vc.bindBack(pageEl);
    U.qs('[data-more]', pageEl).addEventListener('click', () => {
      CZ.ui.sheet({
        title: '展览信息',
        items: [
          { icon: 'calendar', label: '订阅展讯提醒', desc: '开展前 3 天提醒', onTap: () => CZ.ui.toast('已开启展讯提醒', { icon: 'calendar' }) },
          { icon: 'share', label: '分享展讯', onTap: () => CZ.ui.toast('分享链接已复制', { icon: 'share' }) }
        ]
      });
    });
  };

  /* --------------------------------- 展览详情 --------------------------------- */
  CZ.views.exhibition = function (ctx) {
    const D = CZ.DATA;
    const e = D.exhibitionById(ctx.params.id) || D.exhibitions[0];
    return U.el(
      '<div class="exhdetail">' +
      vc.navbar('展览详情') +
      '<section class="ehero"><div class="ehero__art">' + CZ.Art.craft(e.art, e.id + '-big') + '</div>' +
      '<div class="ehero__tx"><span class="status status--' + e.status + '">' + STATUS[e.status] + '</span>' +
      '<h1>' + U.esc(e.title) + '</h1>' +
      '<p class="ehero__date">' + CZ.icon('calendar', { size: 14 }) + U.esc(e.date) + '</p>' +
      '<p class="ehero__date">' + CZ.icon('location', { size: 14 }) + U.esc(e.place) + '</p></div></section>' +
      '<section class="cblock" data-reveal><h2>展览简介</h2><p class="cbody">' + U.esc(e.desc) + '</p></section>' +
      '<section class="cblock" data-reveal><h2>参观信息</h2>' +
      vc.kv([
        ['开放时间', '周二至周日 09:00 — 17:00（16:30 停止入馆）'],
        ['讲解服务', '每日 10:00、14:00 志愿讲解'],
        ['预约方式', '公众号预约 · 现场凭身份证入馆'],
        ['门票', '免费开放']
      ]) + '</section>' +
      '<section class="cblock" data-reveal><h2>相关纹样</h2><div class="sibrow">' +
      D.patterns.slice(0, 5).map((p) =>
        '<a class="sibcard" data-nav="#/detail/' + p.id + '"><span class="sibcard__art">' + U.motif(p) + '</span>' +
        '<b>' + U.esc(p.listName) + '</b><i>' + U.esc(p.styleLabel) + '</i></a>').join('') + '</div></section>' +
      U.footer() + vc.bottomSpace(120) + '</div>'
    );
  };

  CZ.views.exhibition.mounted = function (pageEl) {
    vc.bindScrollChrome(pageEl);
    vc.bindBack(pageEl);
    U.qs('[data-more]', pageEl).addEventListener('click', () => {
      CZ.ui.sheet({
        items: [
          { icon: 'calendar', label: '加入我的日程', desc: '开展前提醒', onTap: () => CZ.ui.toast('已加入日程', { icon: 'calendar' }) },
          { icon: 'share', label: '分享展讯', onTap: () => CZ.ui.toast('分享链接已复制', { icon: 'share' }) }
        ]
      });
    });
    U.revealIn(pageEl, pageEl);
    vc.wirePress(pageEl);
  };
})();

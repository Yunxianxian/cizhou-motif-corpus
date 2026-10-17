/* ==========================================================================
   view-profile.js —— 一级界面：我的（含我的关注 / 收藏 / 主题 / 历史 / 上传 / 下载）
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  const U = CZ.util;
  const vc = CZ.vc;

  /* ----------------------------------- 我的 ----------------------------------- */
  CZ.views.profile = function () {
    const D = CZ.DATA;
    const st = CZ.store.state;

    const quick = D.services.map((s, i) =>
      '<a class="qgrid__item" data-nav="' + s.route + '" data-reveal data-delay="' + (i * 30) + '">' +
      '<span class="qgrid__ic">' + CZ.icon(s.icon, { size: 24, sw: 1.6 }) + '</span>' +
      '<b>' + U.esc(s.title) + '</b></a>').join('');

    const friends = D.friends.slice(0, 4).map((f, i) =>
      '<span class="avstack__it" style="z-index:' + (9 - i) + '">' + U.esc(f) + '</span>').join('');

    const watch = D.watchList.map((w, i) => {
      const p = D.byId(w.id) || D.patterns[i];
      // 「我常看的纹样」使用专属照片（seed 带 watchimg- 前缀），不影响列表/详情的矢量线稿
      const art = CZ.Art.photos.motif['watchimg-' + p.id]
        ? CZ.Art.motif({ seed: 'watchimg-' + p.id, alt: p.title })
        : U.motif(p);
      return '<a class="watch" data-nav="#/detail/' + p.id + '"><span class="watch__art">' + art + '</span>' +
        '<b>' + U.esc(w.label) + '</b><i class="' + (w.status.indexOf('暂无') === 0 ? 'is-quiet' : '') + '">' + U.esc(w.status) + '</i></a>';
    }).join('');

    return U.el(
      '<div class="profile">' +
      '<section class="phead">' +
      '<div class="phead__bg">' +
      (CZ.Art.photos.scene.phead
        ? '<img class="art art--scene" src="' + CZ.Art.photos.scene.phead + '" alt="">'
        : CZ.Art.headTexture('profile')) +
      '</div>' +
      '<div class="phead__tools">' +
      '<button class="glass-btn glass-btn--dark" id="pScan" aria-label="扫码">' + CZ.icon('scan', { size: 19 }) + '</button>' +
      '<button class="glass-btn glass-btn--dark" id="pBadge" aria-label="成就">' + CZ.icon('hexagon', { size: 19 }) + '</button>' +
      '<button class="glass-btn glass-btn--dark" id="pMsg" aria-label="消息">' + CZ.icon('message', { size: 19 }) + '</button>' +
      '</div>' +
      '<div class="phead__user">' +
      '<span class="pavatar">' + CZ.icon('user', { size: 26, sw: 1.5 }) + '</span>' +
      '<div class="puser">' +
      '<button class="puser__name" id="pName">' + U.esc(st.userName) + CZ.icon('pencil', { size: 14 }) + '</button>' +
      '<div class="puser__friends"><span class="avstack">' + friends + '</span>' +
      '<span class="puser__frtx">等 ' + D.friends.length + ' 个朋友</span></div>' +
      '</div>' +
      '<button class="glass-btn glass-btn--dark phead__grid" id="pGrid" aria-label="我的板块">' + CZ.icon('grid', { size: 18 }) + '</button>' +
      '</div></section>' +

      '<div class="profilesheet">' +
      '<nav class="qgrid">' + quick + '</nav>' +

      '<button class="notice" id="notice">' +
      '<span class="notice__ic">' + CZ.icon('speaker', { size: 18 }) + '</span>' +
      '<span class="notice__vp"><span class="notice__track">' + U.esc(D.app.notice) + '</span></span>' +
      '</button>' +

      '<a class="report-entry" href="#/report" data-nav="#/report">' +
      '<span class="report-entry__top"><span class="report-entry__icon">' + CZ.icon('book', { size: 21 }) + '</span>' +
      '<span>项目研究 · 总结报告</span></span>' +
      '<h2>' + U.esc(CZ.REPORT.title) + '</h2>' +
      '<span class="report-entry__bottom"><span>研究概览 · 技术路径 · 创新成果</span>' +
      '<span class="report-entry__go">阅读报告' + CZ.icon('next', { size: 14 }) + '</span></span></a>' +

      '<section class="watchcard">' +
      '<div class="sec-head"><div class="sec-head__tx"><h2>我常看的纹样</h2></div>' +
      '<a class="linkbtn" data-nav="#/favorites">全部' + CZ.icon('next', { size: 13 }) + '</a></div>' +
      '<div class="watchrow">' + watch + '</div></section>' +

      '<section class="minecard">' +
      '<div class="sec-head"><div class="sec-head__tx"><h2>我的语料</h2><p>收藏、上传与下载</p></div></div>' +
      '<div class="minegrid">' +
      '<a class="minecell" data-nav="#/favorites"><b>' + st.favorites.length + '</b><span>收藏纹样</span></a>' +
      '<a class="minecell" data-nav="#/follows"><b>' + st.follows.length + '</b><span>关注更新</span></a>' +
      '<a class="minecell" data-nav="#/uploads"><b>' + st.uploads.length + '</b><span>我的上传</span></a>' +
      '<a class="minecell" data-nav="#/downloads"><b>' + st.downloads.filter((d) => d.done).length + '</b><span>已下载</span></a>' +
      '</div></section>' +

      U.footer() + vc.bottomSpace(128) + '</div></div>'
    );
  };

  CZ.views.profile.mounted = function (pageEl) {
    // 跑马灯公告
    const track = U.qs('.notice__track', pageEl);
    if (track && !U.reduceMotion()) {
      const w = track.scrollWidth;
      if (w > 210) {
        track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-' + (w - 200) + 'px)' }],
          { duration: (w - 200) * 46, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      }
    }
    U.qs('#notice', pageEl).addEventListener('click', () => {
      CZ.ui.sheet({
        title: '语料库公告',
        desc: CZ.DATA.app.notice,
        items: [
          { icon: 'book', label: '查看更新日志', desc: 'v1.2.0 · 黑白摄影馆藏图上线', onTap: () => CZ.router.go('#/about') },
          { icon: 'calendar', label: '预约上线提醒', desc: '上线当日通知我', onTap: () => CZ.ui.toast('已预约上线提醒', { icon: 'check' }) }
        ]
      });
    });
    U.qs('#pScan', pageEl).addEventListener('click', () => {
      CZ.ui.toast('请对准器物上的纹样标签', { icon: 'scan' });
      setTimeout(() => CZ.ui.toast('识别中…', { icon: 'search' }), 900);
    });
    U.qs('#pMsg', pageEl).addEventListener('click', () => {
      CZ.ui.sheet({
        title: '消息',
        items: [
          { icon: 'heart', label: '「牡丹纹」有 5 条更新', desc: '2 小时前', onTap: () => CZ.router.go('#/list/plant') },
          { icon: 'calendar', label: '婴戏纹专题展即将开展', desc: '昨天', onTap: () => CZ.router.go('#/exhibition/e3') },
          { icon: 'check', label: '你上传的纹样已通过审核', desc: '3 天前', onTap: () => CZ.router.go('#/uploads') }
        ]
      });
    });
    U.qs('#pBadge', pageEl).addEventListener('click', () => {
      CZ.ui.sheet({
        title: '我的纹样徽章',
        desc: '持续浏览与上传可获得更多徽章',
        items: [
          { icon: 'star', label: '牡丹鉴赏者', desc: '浏览牡丹纹 12 件以上', checked: true },
          { icon: 'clock', label: '窑火守望', desc: '连续使用 7 天', checked: true },
          { icon: 'camera', label: '语料贡献者', desc: '上传并通过审核 3 组', checked: false }
        ]
      });
    });
    U.qs('#pGrid', pageEl).addEventListener('click', () => {
      CZ.ui.sheet({
        title: '我的板块',
        items: CZ.DATA.services.map((s) => ({ icon: s.icon, label: s.title, onTap: () => CZ.router.go(s.route) }))
      });
    });
    U.qs('#pName', pageEl).addEventListener('click', () => {
      const cur = CZ.store.state.userName;
      CZ.ui.sheet({
        title: '修改昵称',
        desc: '当前：' + cur,
        items: [
          { icon: 'pencil', label: '使用「纹样研究员」', onTap: () => { CZ.store.setUserName('纹样研究员'); CZ.router.refresh(); CZ.ui.toast('昵称已更新', { icon: 'check' }); } },
          { icon: 'user', label: '使用「磁州窑爱好者」', onTap: () => { CZ.store.setUserName('磁州窑爱好者'); CZ.router.refresh(); CZ.ui.toast('昵称已更新', { icon: 'check' }); } },
          { icon: 'refresh', label: '恢复默认昵称', onTap: () => { CZ.store.setUserName(CZ.DATA.user.name); CZ.router.refresh(); CZ.ui.toast('已恢复默认', { icon: 'check' }); } }
        ]
      });
    });
    U.revealIn(pageEl, pageEl);
    vc.wirePress(pageEl);
  };

  /* --------------------------------- 我的关注 --------------------------------- */
  CZ.views.follows = function () {
    const st = CZ.store.state;
    if (!st.follows.length) {
      return U.el('<div class="pagebox">' + vc.navbar('我的关注') +
        CZ.ui.empty('还没有关注任何纹样', '在纹样详情里点「关注」即可订阅更新',
          '<a class="btn btn--ink" data-nav="#/list/plant">去看看牡丹纹</a>') + vc.bottomSpace(120) + '</div>');
    }
    const rows = st.follows.map((f, i) => {
      const p = CZ.DATA.patterns.filter((x) => ('group-' + x.group) === f.id)[0] || CZ.DATA.patterns[i] || CZ.DATA.patterns[0];
      const nav = f.kind === 'exhibition' ? '#/exhibitions' : f.kind === 'site' ? '#/craft' : '#/list/' + p.cat;
      return vc.listRow({
        art: U.motif(p),
        title: f.name,
        desc: f.desc,
        nav: nav,
        right: '<button class="btn btn--mini js-unfollow" data-id="' + U.esc(f.id) + '">已关注</button>'
      });
    }).join('');
    return U.el('<div class="pagebox">' + vc.navbar('我的关注') +
      '<p class="pagehint">共关注 ' + st.follows.length + ' 项，有更新时会在消息中提醒</p>' +
      '<div class="lrows">' + rows + '</div>' + vc.bottomSpace(120) + '</div>');
  };

  CZ.views.follows.mounted = function (pageEl) {
    vc.bindBack(pageEl);
    U.qsa('.js-unfollow', pageEl).forEach((b) => b.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = b.dataset.id;
      const item = CZ.store.state.follows.filter((f) => f.id === id)[0];
      const ok = await CZ.ui.confirm({ title: '取消关注', text: '取消关注「' + (item ? item.name : '') + '」？', okText: '取消关注' });
      if (!ok) return;
      CZ.store.toggleFollow({ id: id });
      CZ.ui.toast('已取消关注');
      CZ.router.refresh();
    }));
    U.qs('[data-more]', pageEl).addEventListener('click', () => {
      CZ.ui.sheet({
        items: [{ icon: 'refresh', label: '全部标记为已读', onTap: () => { CZ.ui.toast('已全部标记为已读', { icon: 'check' }); } }]
      });
    });
    vc.wirePress(pageEl);
  };

  /* --------------------------------- 我的收藏 --------------------------------- */
  CZ.views.favorites = function () {
    const st = CZ.store.state;
    const items = st.favorites.map((id) => CZ.DATA.byId(id)).filter(Boolean);
    if (!items.length) {
      return U.el('<div class="pagebox">' + vc.navbar('我的收藏') +
        CZ.ui.empty('收藏夹还是空的', '在纹样详情页点右下角的星标即可收藏',
          '<a class="btn btn--ink" data-nav="#/list/plant">开始浏览纹样</a>') + vc.bottomSpace(120) + '</div>');
    }
    return U.el('<div class="pagebox">' + vc.navbar('我的收藏') +
      '<p class="pagehint">共 ' + items.length + ' 件 · 长按可取消收藏</p>' +
      '<div class="grid grid--3" id="favGrid">' + items.map((p) => vc.patternCard(p)).join('') + '</div>' +
      vc.bottomSpace(120) + '</div>');
  };

  CZ.views.favorites.mounted = function (pageEl) {
    vc.bindBack(pageEl);
    vc.wire.patternInteractions(pageEl, (id) => {
      const p = CZ.DATA.byId(id);
      CZ.ui.sheet({
        title: p.title,
        desc: p.styleLabel + ' · ' + p.meta.era,
        items: [
          { icon: 'eye', label: '查看详情', onTap: () => CZ.router.go('#/detail/' + id) },
          {
            icon: 'close', label: '取消收藏', danger: true, onTap: () => {
              CZ.store.toggleFav(id);
              CZ.ui.toast('已取消收藏');
              CZ.router.refresh();
            }
          }
        ]
      });
    });
    U.qs('[data-more]', pageEl).addEventListener('click', async () => {
      const ok = await CZ.ui.confirm({ title: '清空收藏', text: '将移除全部收藏纹样，操作不可撤销。', okText: '清空' });
      if (!ok) return;
      CZ.store.state.favorites.slice().forEach((id) => CZ.store.toggleFav(id));
      CZ.ui.toast('收藏已清空');
      CZ.router.refresh();
    });
    U.revealIn(pageEl, pageEl);
    vc.wirePress(pageEl);
  };

  /* --------------------------------- 历史记录 --------------------------------- */
  CZ.views.history = function () {
    const st = CZ.store.state;
    if (!st.history.length) {
      return U.el('<div class="pagebox">' + vc.navbar('历史记录') +
        CZ.ui.empty('暂无浏览记录', '看过的纹样会自动记录在这里', '') + vc.bottomSpace(120) + '</div>');
    }
    const groups = [
      { name: '今天', items: st.history.slice(0, 3) },
      { name: '更早', items: st.history.slice(3) }
    ].filter((g) => g.items.length);

    const html = groups.map((g) =>
      '<section class="hg"><h3 class="hg__t">' + g.name + '</h3>' +
      g.items.map((id, i) => {
        const p = CZ.DATA.byId(id);
        if (!p) return '';
        const t = ['14:26', '11:02', '09:41', '昨天 20:15', '昨天 16:40', '前天 10:08'][i % 6];
        return '<a class="hrow" data-nav="#/detail/' + p.id + '"><span class="hrow__time">' + t + '</span>' +
          '<span class="hrow__art">' + U.motif(p) + '</span>' +
          '<span class="hrow__tx"><b>' + U.esc(p.title) + '</b><i>' + U.esc(p.groupName) + ' · ' + U.esc(p.meta.era) + '</i></span>' +
          '</a>';
      }).join('') + '</section>').join('');

    return U.el('<div class="pagebox">' + vc.navbar('历史记录') +
      '<p class="pagehint">最近浏览 ' + st.history.length + ' 条</p>' + html + vc.bottomSpace(120) + '</div>');
  };

  CZ.views.history.mounted = function (pageEl) {
    vc.bindBack(pageEl);
    U.qs('[data-more]', pageEl).addEventListener('click', async () => {
      const ok = await CZ.ui.confirm({ title: '清空历史记录', text: '将删除全部浏览记录。', okText: '清空' });
      if (!ok) return;
      CZ.store.clearHistory();
      CZ.ui.toast('历史记录已清空');
      CZ.router.refresh();
    });
    vc.wirePress(pageEl);
  };

  /* --------------------------------- 我的上传 --------------------------------- */
  const UP_STATUS = {
    pass: { t: '已通过', c: 'ok' },
    review: { t: '审核中', c: 'wait' },
    reject: { t: '未通过', c: 'no' }
  };

  CZ.views.uploads = function () {
    const st = CZ.store.state;
    const rows = st.uploads.map((u, i) => {
      const p = CZ.DATA.patterns[i % CZ.DATA.patterns.length];
      const s = UP_STATUS[u.status] || UP_STATUS.review;
      return '<div class="uprow" data-id="' + u.id + '">' +
        '<span class="uprow__art">' + CZ.Art.onWare(u.id, { seed: u.id, motif: p.motif, comp: p.comp }, 'sherd') + '</span>' +
        '<span class="uprow__tx"><b>' + U.esc(u.name) + '</b>' +
        '<i>' + U.esc(u.date) + ' · ' + u.num + ' 张图片</i>' +
        '<span class="status status--' + (s.c === 'ok' ? 'ongoing' : s.c === 'wait' ? 'soon' : 'past') + '">' + s.t + '</span></span>' +
        '<button class="iconbtn js-upmore" data-id="' + u.id + '" aria-label="更多">' + CZ.icon('dots', { size: 18 }) + '</button>' +
        '</div>';
    }).join('');

    return U.el('<div class="pagebox">' + vc.navbar('我的上传') +
      '<div class="uphead"><div><b>' + st.uploads.length + '</b><span>组语料</span></div>' +
      '<div><b>' + st.uploads.reduce((a, b) => a + b.num, 0) + '</b><span>张图片</span></div>' +
      '<button class="btn btn--ink btn--mini" data-nav="#/upload">继续上传</button></div>' +
      (st.uploads.length ? '<div class="uprows">' + rows + '</div>' : CZ.ui.empty('还没有上传记录', '上传纹样照片可参与语料共建', '')) +
      vc.bottomSpace(120) + '</div>');
  };

  CZ.views.uploads.mounted = function (pageEl) {
    vc.bindBack(pageEl);
    U.qsa('.js-upmore', pageEl).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.id;
      CZ.ui.sheet({
        items: [
          { icon: 'eye', label: '查看审核详情', onTap: () => CZ.ui.toast('审核详情：资料完整，纹样清晰', { icon: 'info' }) },
          { icon: 'pencil', label: '编辑信息', onTap: () => CZ.router.go('#/upload') },
          {
            icon: 'trash', label: '删除该记录', danger: true, onTap: async () => {
              const ok = await CZ.ui.confirm({ title: '删除上传记录', okText: '删除' });
              if (!ok) return;
              CZ.store.removeUpload(id);
              CZ.ui.toast('已删除');
              CZ.router.refresh();
            }
          }
        ]
      });
    }));
    U.qs('[data-more]', pageEl).addEventListener('click', () => {
      CZ.ui.sheet({ items: [{ icon: 'info', label: '上传规范', desc: '分辨率、光照与命名要求', onTap: () => CZ.ui.toast('已打开上传规范', { icon: 'book' }) }] });
    });
    vc.wirePress(pageEl);
  };

  /* --------------------------------- 本地下载 --------------------------------- */
  CZ.views.downloads = function () {
    const st = CZ.store.state;
    const used = st.downloads.filter((d) => d.done).reduce((a, b) => a + parseFloat(b.size), 0);
    const rows = st.downloads.map((d) =>
      '<div class="dlrow" data-id="' + d.id + '">' +
      '<span class="dlrow__ic">' + CZ.icon(d.done ? 'check' : 'downBox', { size: 20 }) + '</span>' +
      '<span class="dlrow__tx"><b>' + U.esc(d.name) + '</b><i>' + d.count + ' · ' + U.esc(d.size) + '</i>' +
      '<span class="bar"><span class="bar__in" style="width:' + (d.done ? 100 : 0) + '%"></span></span></span>' +
      '<button class="btn btn--mini js-dl' + (d.done ? ' btn--ghost' : ' btn--ink') + '" data-id="' + d.id + '">' +
      (d.done ? '已下载' : '下载') + '</button></div>').join('');

    return U.el('<div class="pagebox">' + vc.navbar('本地下载') +
      '<div class="storage"><div class="storage__hd"><b>本地存储</b><span>' + used.toFixed(0) + ' MB / 2 GB</span></div>' +
      '<span class="bar bar--lg"><span class="bar__in" style="width:' + Math.max(4, Math.min(100, used / 20)) + '%"></span></span>' +
      '<p>离线可查看已下载的高清图与线稿</p></div>' +
      '<div class="dlrows">' + rows + '</div>' + vc.bottomSpace(120) + '</div>');
  };

  CZ.views.downloads.mounted = function (pageEl) {
    vc.bindBack(pageEl);
    U.qsa('.js-dl', pageEl).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.id;
      const row = U.qs('.dlrow[data-id="' + id + '"]', pageEl);
      const bar = U.qs('.bar__in', row);
      const item = CZ.store.state.downloads.filter((d) => d.id === id)[0];
      if (item && item.done) {
        CZ.store.toggleDownload(id);
        bar.style.width = '0%';
        b.textContent = '下载';
        b.classList.remove('btn--ghost');
        b.classList.add('btn--ink');
        CZ.ui.toast('已删除本地文件');
        return;
      }
      b.textContent = '下载中';
      let pct = 0;
      const t = setInterval(() => {
        pct += 12 + Math.random() * 18;
        bar.style.width = Math.min(100, pct) + '%';
        if (pct >= 100) {
          clearInterval(t);
          CZ.store.toggleDownload(id);
          b.textContent = '已下载';
          b.classList.remove('btn--ink');
          b.classList.add('btn--ghost');
          U.qs('.dlrow__ic', row).innerHTML = CZ.icon('check', { size: 20 });
          CZ.ui.toast('下载完成，可离线查看', { icon: 'check' });
        }
      }, 260);
    }));
    U.qs('[data-more]', pageEl).addEventListener('click', () => {
      CZ.ui.sheet({
        items: [{ icon: 'trash', label: '清空本地文件', danger: true, onTap: () => { CZ.ui.toast('已清空本地下载'); CZ.store.state.downloads.forEach((d) => { if (d.done) CZ.store.toggleDownload(d.id); }); CZ.router.refresh(); } }]
      });
    });
    vc.wirePress(pageEl);
  };
})();

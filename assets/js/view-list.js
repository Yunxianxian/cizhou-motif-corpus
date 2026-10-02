/* ==========================================================================
   view-list.js —— 二级界面：装饰纹样列表（植物装饰 / 人物装饰）+ 搜索
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  const U = CZ.util;
  const vc = CZ.vc;

  const PAGE_SIZE = 9;

  CZ.views.list = function (ctx) {
    const D = CZ.DATA;
    const catKey = D.categories[ctx.params.cat] ? ctx.params.cat : 'plant';
    const cat = D.categories[catKey];
    const groups = D.groups[catKey];
    const chipItems = [{ key: 'all', name: '全部', count: D.patterns.filter((p) => p.cat === catKey).length }]
      .concat(groups.map((g) => ({ key: g.key, name: g.name, count: g.count })));

    const node = U.el(
      '<div class="list">' +
      vc.navbar(cat.title) +
      '<div class="list__head">' +
      '<h2 class="list__slogan">' + U.esc(cat.subtitle) + '</h2>' +
      '<p class="list__meta">共 ' + D.patterns.filter((p) => p.cat === catKey).length + ' 件纹样 · 支持长按快捷操作</p>' +
      '</div>' +
      vc.chips(chipItems, 'all') +
      '<div class="grid grid--3" id="grid"></div>' +
      '<div class="loadmore" id="loadmore"><span class="spin"></span><span>正在加载纹样…</span></div>' +
      vc.bottomSpace(120) +
      '</div>'
    );
    return node;
  };

  CZ.views.list.mounted = function (pageEl, ctx) {
    const D = CZ.DATA;
    const catKey = D.categories[ctx.params.cat] ? ctx.params.cat : 'plant';
    const grid = U.qs('#grid', pageEl);
    const more = U.qs('#loadmore', pageEl);
    const chips = U.qsa('.chip', pageEl);
    let group = 'all';
    let shown = 0;
    let list = [];
    const loaded = {};

    function pool() {
      return D.patterns.filter((p) => p.cat === catKey && (group === 'all' || p.group === group));
    }

    function cardHTML(p, i) {
      return vc.patternCard(p).replace(' data-reveal', ' data-reveal data-delay="' + Math.min(i * 26, 260) + '"');
    }

    function render(reset) {
      list = pool();
      if (reset) { shown = 0; grid.innerHTML = ''; }
      const next = list.slice(shown, shown + PAGE_SIZE);
      if (!next.length) {
        more.classList.add('is-done');
        more.innerHTML = list.length ? '<span>已显示全部 ' + list.length + ' 件纹样</span>' : '';
        return;
      }
      if (shown === 0) grid.innerHTML = '';
      const frag = U.el('<div class="grid__frag"></div>');
      frag.innerHTML = next.map((p, i) => cardHTML(p, i)).join('');
      while (frag.firstChild) grid.appendChild(frag.firstChild);
      shown += next.length;
      more.classList.toggle('is-done', shown >= list.length);
      more.innerHTML = shown >= list.length
        ? '<span>已显示全部 ' + list.length + ' 件纹样</span>'
        : '<span class="spin"></span><span>正在加载更多纹样…</span>';
      U.revealIn(pageEl, grid);
      vc.wire.patternInteractions(pageEl, (id) => vc.patternActions(id));
      vc.wirePress(grid);
    }

    function switchGroup(key) {
      if (key === group) return;
      group = key;
      chips.forEach((c) => {
        const on = c.dataset.chip === key;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-selected', String(on));
      });
      CZ.ui.haptic('light');
      // 首次进入某分类时给一次骨架屏，模拟语料检索
      if (!loaded[key]) {
        loaded[key] = true;
        grid.innerHTML = CZ.ui.skeletonGrid(6, 3);
        more.classList.add('is-hidden');
        setTimeout(() => { more.classList.remove('is-hidden'); render(true); }, 280);
      } else {
        render(true);
      }
      pageEl.scrollTo({ top: 0, behavior: 'smooth' });
    }

    chips.forEach((c) => c.addEventListener('click', () => switchGroup(c.dataset.chip)));

    render(true);

    // 触底自动加载
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => {
        if (en.isIntersecting && shown < list.length) {
          more.classList.add('is-loading');
          setTimeout(() => { more.classList.remove('is-loading'); render(false); }, 260);
        }
      });
    }, { root: pageEl, rootMargin: '240px 0px' });
    io.observe(more);

    vc.bindScrollChrome(pageEl);
    vc.bindBack(pageEl);
    U.qs('[data-more]', pageEl).addEventListener('click', () => {
      const favOnly = false;
      CZ.ui.sheet({
        title: CZ.DATA.categories[catKey].title,
        desc: '共 ' + D.patterns.filter((p) => p.cat === catKey).length + ' 件纹样',
        items: [
          { icon: 'star', label: '只看我收藏的', desc: favOnly ? '已开启' : '筛选收藏纹样', onTap: () => { CZ.router.go('#/favorites'); } },
          { icon: 'downBox', label: '批量下载本类', desc: '约 286 MB', onTap: () => CZ.ui.toast('已加入下载队列', { icon: 'downBox' }) },
          { icon: 'share', label: '分享本类纹样', desc: '生成分享卡片', onTap: () => CZ.ui.toast('分享链接已复制', { icon: 'share' }) },
          { icon: 'refresh', label: '按更新时间排序', desc: '当前：默认顺序', onTap: () => { render(true); CZ.ui.toast('已按更新时间排序', { icon: 'refresh' }); } }
        ]
      });
    });

    CZ.ui.pullToRefresh(pageEl, U.qs('.list', pageEl), () => {
      CZ.ui.toast('本类语料已更新', { icon: 'check' });
      render(true);
    });
  };

  /* ---------------------------------- 搜索页 ---------------------------------- */
  CZ.views.search = function (ctx) {
    const D = CZ.DATA;
    return U.el(
      '<div class="searchpage">' +
      '<header class="searchbar">' +
      '<div class="searchbar__field">' + CZ.icon('search', { size: 18 }) +
      '<input id="q" type="search" placeholder="搜索纹样、工艺、展讯" autocomplete="off" enterkeyhint="search">' +
      '<button class="searchbar__clear" id="qClear" aria-label="清空">' + CZ.icon('close', { size: 15 }) + '</button>' +
      '</div>' +
      '<button class="searchbar__cancel" data-back>取消</button>' +
      '</header>' +
      '<div class="search__body" id="sBody"></div>' +
      vc.bottomSpace(110) +
      '</div>'
    );
  };

  CZ.views.search.mounted = function (pageEl) {
    const D = CZ.DATA;
    const input = U.qs('#q', pageEl);
    const body = U.qs('#sBody', pageEl);
    const clear = U.qs('#qClear', pageEl);

    function idleView() {
      const hot = D.hotSearch.map((k) => '<button class="tag" data-kw="' + U.esc(k) + '">' + U.esc(k) + '</button>').join('');
      const his = CZ.store.state.searchHistory.map((k) => '<button class="tag tag--soft" data-kw="' + U.esc(k) + '">' + U.esc(k) + '</button>').join('');
      body.innerHTML =
        '<section class="sblock" data-reveal><div class="sec-head"><div class="sec-head__tx"><h2>热门搜索</h2></div></div>' +
        '<div class="tags">' + hot + '</div></section>' +
        (his ? '<section class="sblock" data-reveal><div class="sec-head"><div class="sec-head__tx"><h2>搜索历史</h2></div>' +
          '<button class="linkbtn" id="clearHis">清空</button></div><div class="tags">' + his + '</div></section>' : '') +
        '<section class="sblock" data-reveal><div class="sec-head"><div class="sec-head__tx"><h2>按类别浏览</h2></div></div>' +
        '<div class="browse">' +
        Object.keys(D.categories).map((k) => {
          const c = D.categories[k];
          return '<a class="browsecard" data-nav="#/list/' + k + '"><div class="browsecard__media">' +
            CZ.Art.motif({ seed: 'bs-' + k, motif: c.motif, comp: 'medallion' }) + '</div><b>' + U.esc(c.title) + '</b></a>';
        }).join('') +
        '<a class="browsecard" data-nav="#/craft"><div class="browsecard__media">' + CZ.Art.craft('kiln', 'bs') + '</div><b>传统烧制工艺</b></a>' +
        '</div></section>';
      U.revealIn(pageEl, body);
      const cl = U.qs('#clearHis', body);
      if (cl) cl.addEventListener('click', () => { CZ.store.clearSearch(); idleView(); CZ.ui.toast('已清空搜索历史'); });
      bindKeywords();
      vc.wirePress(body);
    }

    function bindKeywords() {
      U.qsa('[data-kw]', body).forEach((b) => b.addEventListener('click', () => {
        input.value = b.dataset.kw;
        run(b.dataset.kw);
      }));
    }

    function run(kw) {
      kw = (kw || '').trim();
      clear.classList.toggle('is-on', !!kw);
      if (!kw) { idleView(); return; }
      const lower = kw.toLowerCase();
      const hitP = D.patterns.filter((p) =>
        (p.title + p.listName + p.groupName + p.themes.join('') + p.meta.tech + p.meta.era + p.meaning).toLowerCase().indexOf(lower) >= 0);
      const hitC = D.crafts.filter((c) => (c.name + c.desc + c.short + c.points.join('')).toLowerCase().indexOf(lower) >= 0);
      const hitE = D.exhibitions.filter((e) => (e.title + e.desc + e.place).toLowerCase().indexOf(lower) >= 0);

      if (!hitP.length && !hitC.length && !hitE.length) {
        body.innerHTML = CZ.ui.empty('未找到「' + kw + '」', '试试「牡丹纹」「白地黑花」「馒头窑」', '');
        return;
      }
      let html = '';
      if (hitP.length) {
        html += '<section class="sblock"><div class="sec-head"><div class="sec-head__tx"><h2>纹样</h2>' +
          '<p>共 ' + hitP.length + ' 件</p></div></div><div class="grid grid--3">' +
          hitP.slice(0, 9).map((p) => vc.patternCard(p, { reveal: false })).join('') + '</div></section>';
      }
      if (hitC.length) {
        html += '<section class="sblock"><div class="sec-head"><div class="sec-head__tx"><h2>工艺</h2></div></div>' +
          hitC.map((c) => vc.listRow({
            art: CZ.Art.craft(c.art, c.id), title: c.name, desc: c.step + ' · ' + c.short, nav: '#/craft/' + c.id
          })).join('') + '</section>';
      }
      if (hitE.length) {
        html += '<section class="sblock"><div class="sec-head"><div class="sec-head__tx"><h2>展览</h2></div></div>' +
          hitE.map((e) => vc.listRow({
            icon: 'calendar', title: e.title, desc: e.date + ' · ' + e.place, nav: '#/exhibition/' + e.id
          })).join('') + '</section>';
      }
      body.innerHTML = html;
      vc.wire.patternInteractions(pageEl, (id) => vc.patternActions(id));
      vc.wirePress(body);
    }

    let t = null;
    input.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => run(input.value), 180);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { CZ.store.pushSearch(input.value.trim()); input.blur(); run(input.value); }
    });
    clear.addEventListener('click', () => { input.value = ''; input.focus(); run(''); });

    idleView();
    setTimeout(() => input.focus(), 260);
  };
})();

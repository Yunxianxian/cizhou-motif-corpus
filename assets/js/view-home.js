/* ==========================================================================
   view-home.js —— 一级界面：首页（轮播 / 装饰分类 / 传统烧制工艺 / 展览 / 数据）
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  const U = CZ.util;
  const vc = CZ.vc;

  CZ.views.home = function () {
    const D = CZ.DATA;

    const slides = D.hero.map((h, i) =>
      '<button class="hero__slide" data-i="' + i + '" data-nav="' + (D.heroLink[h.id] || '#/exhibitions') + '"' +
      ' aria-label="' + U.esc(h.title) + '">' +
      '<span class="hero__art">' + CZ.Art.hero(h.id, h.variant) + '</span>' +
      '<span class="hero__veil"></span></button>').join('');

    const dots = D.hero.map((h, i) =>
      '<button class="hero__dot' + (i === 0 ? ' is-on' : '') + '" data-dot="' + i + '" aria-label="第' + (i + 1) + '张"></button>').join('');

    const cats = Object.keys(D.categories).map((k) => {
      const c = D.categories[k];
      return '<a class="catcard" data-nav="#/list/' + k + '" data-morph-src>' +
        '<div class="catcard__tx"><h3>' + U.esc(c.title) + '</h3><p>' + U.esc(c.subtitle) + '</p></div>' +
        '<div class="catcard__media">' + CZ.Art.motif({
          seed: 'cat-' + k, motif: c.motif, comp: c.key === 'plant' ? 'cluster' : 'medallion'
        }) + '</div></a>';
    }).join('');

    const craftCells = [
      { id: 'kiln', cls: 'craft-cell--tall' },
      { id: 'wheel', cls: '' },
      { id: 'glaze', cls: '' }
    ].map((c, i) =>
      '<a class="craft-cell ' + c.cls + '" data-nav="#/craft/' + c.id + '" data-reveal data-delay="' + (i * 70) + '"' +
      ' aria-label="' + U.esc(D.craftById(c.id).name) + '">' + CZ.Art.craft(c.id, c.id) +
      '<span class="craft-cell__label">' + U.esc(D.craftById(c.id).name) + CZ.icon('next', { size: 12 }) + '</span></a>').join('');

    const exh = D.exhibitions.filter((e) => e.status !== 'past').slice(0, 3).map((e, i) =>
      '<a class="exhcard" data-nav="#/exhibition/' + e.id + '" data-reveal data-delay="' + (i * 70) + '">' +
      '<div class="exhcard__media">' + CZ.Art.craft(e.art, e.id) + '</div>' +
      '<div class="exhcard__tx"><span class="exhcard__tag">' + U.esc(e.tag) + '</span>' +
      '<b>' + U.esc(e.title) + '</b><i>' + U.esc(e.date) + '</i></div></a>').join('');

    const stats = D.app.stats.map((s) =>
      '<div class="stat"><b>' + U.esc(s.n) + '</b><span>' + U.esc(s.l) + '</span></div>').join('');

    const node = U.el(
      '<div class="home">' +
      '<header class="hometop" id="hometop">' +
      '<div class="hometop__bg"></div>' +
      '<div class="hometop__in">' +
      '<span class="hometop__slogan">' + U.esc(D.app.slogan) + '</span>' +
      '<h1 class="hometop__title">首页</h1>' +
      '<button class="glass-btn glass-btn--glass js-search" aria-label="搜索">' + CZ.icon('search', { size: 19 }) + '</button>' +
      '</div></header>' +

      '<section class="hero" id="hero">' +
      '<div class="hero__viewport"><div class="hero__track">' + slides + '</div></div>' +
      '<div class="hero__meta">' +
      '<span class="hero__eyebrow">CIZHOU · COLLECTION</span>' +
      '<div class="hero__copy">' +
      '<p class="hero__caption" id="heroCap">' + U.esc(D.hero[0].title) + '</p>' +
      '<p class="hero__sub" id="heroSub">' + U.esc(D.hero[0].sub) + '</p>' +
      '</div>' +
      '<div class="hero__dots">' + dots + '</div>' +
      '</div></section>' +

      '<div class="homesheet">' +
      '<section class="catrow" id="catrow">' + cats + '</section>' +

      '<section class="craft">' +
      '<a class="sec-head sec-head--link" data-nav="#/craft" data-reveal>' +
      '<div class="sec-head__tx"><h2>传统烧制工艺</h2><p>一窑一器，薪火不息</p></div>' +
      '<span class="sec-head__more">全部工艺' + CZ.icon('next', { size: 14 }) + '</span></a>' +
      '<div class="craft-grid">' + craftCells + '</div>' +
      '</section>' +
      CZ.applications.homeSection() +

      '<section class="exh">' +
      '<a class="sec-head sec-head--link" data-nav="#/exhibitions" data-reveal>' +
      '<div class="sec-head__tx"><h2>展览与活动</h2><p>博物馆正在发生</p></div>' +
      '<span class="sec-head__more">全部展讯' + CZ.icon('next', { size: 14 }) + '</span></a>' +
      '<div class="exhrow">' + exh + '</div>' +
      '</section>' +

      '<section class="datacard" data-reveal>' +
      '<div class="datacard__hd"><h2>语料库数据</h2><span>持续更新中</span></div>' +
      '<div class="stats">' + stats + '</div>' +
      '<p class="datacard__note">数据来源：' + U.esc(D.app.museum) + ' 藏品测绘与窑址采集</p>' +
      '</section>' +

      '<section class="quicklinks" data-reveal>' +
      '<a class="quicklink" data-nav="#/search">' + CZ.icon('search', { size: 20 }) + '<span>检索纹样</span></a>' +
      '<a class="quicklink" data-nav="#/craft">' + CZ.icon('layers', { size: 20 }) + '<span>工艺图谱</span></a>' +
      '<a class="quicklink" data-nav="#/favorites">' + CZ.icon('star', { size: 20 }) + '<span>我的收藏</span></a>' +
      '</section>' +

      U.footer() + vc.bottomSpace(112) +
      '</div></div>'
    );

    return node;
  };

  CZ.views.home.mounted = function (pageEl) {
    const hero = U.qs('#hero', pageEl);
    const track = U.qs('.hero__track', pageEl);
    const caption = U.qs('#heroCap', pageEl);
    const subtitle = U.qs('#heroSub', pageEl);
    const copy = U.qs('.hero__copy', pageEl);
    const hometop = U.qs('#hometop', pageEl);
    const dots = U.qsa('.hero__dot', pageEl);
    const D = CZ.DATA;
    let index = 0, timer = null, dragging = false, startX = 0, dx = 0, w = 1, moved = false;
    let copyAnimation = null;

    function goTo(i, animate) {
      const next = (i + D.hero.length) % D.hero.length;
      const changed = next !== index;
      index = next;
      const motion = animate !== false && !U.reduceMotion();
      track.style.transition = motion ? 'transform .52s cubic-bezier(.32,.72,0,1)' : 'none';
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      if (changed) {
        if (copyAnimation) copyAnimation.cancel();
        caption.textContent = D.hero[index].title;
        subtitle.textContent = D.hero[index].sub;
        copyAnimation = motion && copy.animate ? copy.animate([
          { opacity: 0, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 400, easing: 'cubic-bezier(.22,.61,.36,1)' }) : null;
      }
      dots.forEach((d, k) => d.classList.toggle('is-on', k === index));
    }
    function autoplay() {
      clearInterval(timer);
      if (U.reduceMotion()) return;
      timer = setInterval(() => goTo(index + 1), 5200);
    }

    dots.forEach((d) => d.addEventListener('click', (e) => { e.stopPropagation(); goTo(+d.dataset.dot); autoplay(); }));
    /* click 是在 pointerup 之后才触发的，那时 dx 已被 endDrag 清零，
       所以不能再用 dx 判断「这是拖拽还是点击」，否则滑完一张会立刻误跳转。
       改用独立的 moved 标记；并且必须 stopPropagation —— 路由的 [data-nav]
       委托挂在 document 的冒泡阶段，只 preventDefault 拦不住它。 */
    track.addEventListener('click', (e) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
    }, true);

    const vp = U.qs('.hero__viewport', pageEl);
    vp.addEventListener('pointerdown', (e) => {
      dragging = true; moved = false; startX = e.clientX; dx = 0; w = vp.clientWidth || 390;
      track.style.transition = 'none';
      clearInterval(timer);
    });
    vp.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dx = e.clientX - startX;
      if (Math.abs(dx) > 8) moved = true;
      track.style.transform = 'translateX(' + (-index * 100 + (dx / w) * 100) + '%)';
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(dx) > w * 0.18) goTo(index + (dx < 0 ? 1 : -1));
      else goTo(index);
      dx = 0; // 注意：这里不要重置 moved，紧随其后的 click 还要靠它判断
      autoplay();
    };
    vp.addEventListener('pointerup', endDrag);
    vp.addEventListener('pointercancel', endDrag);
    vp.addEventListener('pointerleave', endDrag);
    autoplay();

    // 滚动联动：顶部栏与轮播视差
    const root = document.documentElement;
    pageEl.addEventListener('scroll', () => {
      const y = pageEl.scrollTop;
      hometop.classList.toggle('is-stuck', y > 44);
      root.setAttribute('data-hero', y < 58 ? '1' : '0');
      const t = Math.min(1, y / 260);
      if (hero) {
        U.qs('.hero__viewport', pageEl).style.transform = 'translateY(' + y * 0.18 + 'px)';
        U.qs('.hero__meta', pageEl).style.opacity = String(Math.max(0, 1 - t * 1.5));
      }
    }, { passive: true });
    root.setAttribute('data-hero', '1');

    U.qs('.js-search', pageEl).addEventListener('click', () => CZ.router.go('#/search', { mode: 'push' }));

    // 分类横滑边缘提示
    const row = U.qs('#catrow', pageEl);
    const updateEdge = () => {
      const max = row.scrollWidth - row.clientWidth;
      row.classList.toggle('is-start', row.scrollLeft < 6);
      row.classList.toggle('is-end', row.scrollLeft > max - 6);
    };
    row.addEventListener('scroll', updateEdge, { passive: true });
    requestAnimationFrame(updateEdge);

    U.revealIn(pageEl, pageEl);
    vc.wirePress(pageEl);
    CZ.ui.pullToRefresh(pageEl, U.qs('.home', pageEl), () => CZ.ui.toast('语料已更新至最新', { icon: 'check' }));
  };
})();

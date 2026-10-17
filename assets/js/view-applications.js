(function () {
  'use strict';
  const CZ = window.CZ, U = CZ.util, vc = CZ.vc;
  const cases = [
    {
      id: 'brand', category: '品牌视觉', title: '磁州窑造 · 区域品牌设计',
      subtitle: '从陶瓷器形，到当代品牌语言', cover: 26, figures: [26, 23, 24, 25],
      labels: ['品牌应用效果', '标识方案', '标识配色', '标识构成与应用'],
      intro: '项目团队参与“磁州窑造”区域品牌标识征集，以磁州窑陶瓷文化为基础，探索地域品牌的视觉识别与传播。',
      steps: [
        ['文化线索', '以磁州窑器形与黑白装饰语言建立地域识别，让传统陶瓷文化成为品牌表达的起点。'],
        ['视觉转译', '将器物轮廓、文字与印章式视觉语言整理为标识方案，在黑白主色中加入克制的红色点缀。'],
        ['应用延展', '通过品牌物料的应用展示，呈现标识在不同尺寸与载体上的识别效果。']
      ],
      related: []
    },
    {
      id: 'social', category: '数字传播', title: '让纹样走进日常表达',
      subtitle: '牡丹、缠枝与地域文化的轻量化转译', cover: 28, figures: [28, 27, 29, 31, 32, 30],
      labels: ['峰小峰表情包', '一只叫旺财的虎表情包', '数字文化衍生设计', '峰小峰设计理念', '旺财虎设计理念', '传播应用记录'],
      intro: '结合磁州窑黑白刻纹样、峰峰矿区地域文化与日常交流语境，项目将传统视觉元素转化为可用于社交媒体的情绪表达。',
      steps: [
        ['提取纹样特征', '报告选取牡丹纹、缠枝纹等代表性元素，简化形态，保留黑白对比和线条特征。'],
        ['融入角色与情绪', '将传统元素与人物表情、日常用语和地域文化结合，使视觉符号更亲近当代生活。'],
        ['进入数字媒介', '以表情包和社交内容为载体，让传统文化从静态图像进入日常交流。']
      ],
      related: ['plant-mudan-01', 'plant-chanzhi-01']
    },
    {
      id: 'platform', category: '交互展示', title: '纹间磁州 · 数字平台设计',
      subtitle: '让采集、检索与生成形成可见的路径', cover: 14, figures: [14, 13, 15, 16, 17, 18],
      labels: ['平台主页设计', '平台首页视觉', '一级分类界面', '二级分类界面', 'AI纹样生成界面', '语料展示界面'],
      intro: '项目以可视化交互平台承载图像与文本语料，通过分类浏览、关键词检索与生成结果展示，连接纹样研究与公众使用。',
      steps: [
        ['组织语料', '把采集图像、分类与文字信息整理为清晰的信息层级，为浏览和检索建立基础。'],
        ['建立浏览路径', '通过一级分类、二级分类与详情页逐步展开内容，让图像与文化信息相互补充。'],
        ['呈现生成成果', '将AI生成结果与原有纹样资料结合展示，为纹样的当代转化提供交互入口。']
      ],
      related: ['plant-mudan-01']
    }
  ];
  const src = id => CZ.REPORT.figures[id].src;
  function card(item, compact) {
    return '<a class="application-card' + (compact ? ' application-card--compact' : '') + '" href="#/applications/' + item.id + '" data-nav="#/applications/' + item.id + '">' +
      '<div class="application-card__image application-card__image--' + item.id + '"><img src="' + src(item.cover) + '" alt="' + U.esc(item.title) + '" loading="lazy"></div>' +
      '<div class="application-card__copy"><span>' + U.esc(item.category) + '</span><h3>' + U.esc(item.title) + '</h3><p>' + U.esc(item.subtitle) + '</p>' +
      '<b>探索案例 ' + CZ.icon('next', { size: 14 }) + '</b></div></a>';
  }
  CZ.applications = {
    cases: cases,
    homeSection: () => '<section class="application-home"><a class="sec-head sec-head--link" href="#/applications" data-nav="#/applications">' +
      '<div class="sec-head__tx"><h2>创新应用</h2><p>让传统纹样，走进当代生活</p></div><span class="sec-head__more">全部案例 ' + CZ.icon('next', { size: 14 }) + '</span></a>' +
      '<div class="application-strip">' + cases.map(item => card(item, true)).join('') + '</div></section>'
  };
  CZ.views.applications = function () {
    return U.el('<div class="applications-page">' + vc.navbar('创新应用', { right: '<span class="navbar__ph"></span>' }) +
      '<header class="applications-intro"><span>FROM PATTERN TO EVERYDAY</span><h1>传统纹样的<br>当代表达</h1><p>从品牌视觉到数字传播，探索磁州窑文化在不同媒介中的新生。</p></header>' +
      '<div class="application-filters" role="group" aria-label="案例分类">' + ['全部', '品牌视觉', '数字传播', '交互展示'].map((name, i) => '<button data-application-filter="' + name + '" aria-pressed="' + (i === 0) + '" class="' + (i === 0 ? 'is-on' : '') + '">' + name + '</button>').join('') + '</div>' +
      '<div class="application-list">' + cases.map(item => '<div data-application-category="' + item.category + '">' + card(item) + '</div>').join('') + '</div>' +
      '<p class="application-source">案例与图像整理自项目总结报告第七章。</p>' + vc.bottomSpace(128) + '</div>');
  };
  CZ.views.applications.mounted = function (page) {
    vc.bindBack(page); vc.bindScrollChrome(page);
    U.qsa('[data-application-filter]', page).forEach(button => button.addEventListener('click', () => {
      const category = button.dataset.applicationFilter;
      U.qsa('[data-application-filter]', page).forEach(b => {
        const selected = b === button; b.classList.toggle('is-on', selected); b.setAttribute('aria-pressed', String(selected));
      });
      U.qsa('[data-application-category]', page).forEach(el => { el.hidden = category !== '全部' && el.dataset.applicationCategory !== category; });
    }));
  };
  CZ.views.applicationDetail = function (ctx) {
    const item = cases.find(c => c.id === ctx.params.id);
    if (!item) return U.el('<div>' + vc.navbar('创新应用') + '<div class="applications-intro"><h1>案例暂未收录</h1><a class="btn btn--ghost" href="#/applications" data-nav="#/applications">返回全部案例</a></div></div>');
    const related = item.related.map(id => CZ.DATA.byId(id)).filter(Boolean);
    return U.el('<article class="application-detail">' + vc.navbar('应用案例', { right: '<span class="navbar__ph"></span>' }) +
      '<header class="application-detail__heading"><span>' + U.esc(item.category) + ' · 项目实践</span><h1>' + U.esc(item.title) + '</h1><p>' + U.esc(item.intro) + '</p></header>' +
      '<figure class="application-main"><button data-application-image="0" aria-label="放大查看：' + U.esc(item.labels[0]) + '"><img src="' + src(item.cover) + '" alt="' + U.esc(item.labels[0]) + '"></button><figcaption>' + U.esc(item.labels[0]) + ' · 点击放大</figcaption></figure>' +
      '<section class="application-process"><h2>从文化到应用</h2>' + item.steps.map((s, i) => '<div><span>0' + (i + 1) + '</span><section><h3>' + U.esc(s[0]) + '</h3><p>' + U.esc(s[1]) + '</p></section></div>').join('') + '</section>' +
      '<section class="application-gallery"><h2>设计图集</h2><div>' + item.figures.slice(1).map((id, i) => '<button data-application-image="' + (i + 1) + '" aria-label="放大查看：' + U.esc(item.labels[i + 1]) + '"><div class="application-gallery__image"><img src="' + src(id) + '" alt="' + U.esc(item.labels[i + 1]) + '" loading="lazy"></div><span>' + U.esc(item.labels[i + 1]) + '</span></button>').join('') + '</div></section>' +
      (related.length ? '<section class="application-related"><h2>相关纹样阅读</h2><p>继续了解报告提及的纹样类别。</p><div>' + related.map(p => '<a href="#/detail/' + p.id + '" data-nav="#/detail/' + p.id + '">' + U.motif(p) + '<span>' + U.esc(p.title) + '</span>' + CZ.icon('next', { size: 16 }) + '</a>').join('') + '</div></section>' : '') +
      '<a class="application-report" href="#/report/chapter-7" data-nav="#/report/chapter-7"><span><small>了解完整研究过程</small><b>阅读项目报告 · 第七章</b></span>' + CZ.icon('next', { size: 18 }) + '</a>' +
      '<p class="application-source">图片与案例来源：项目总结报告第七章。相关纹样供延伸阅读，不代表作品与单张馆藏图片的一一对应关系。</p>' + vc.bottomSpace(128) + '</article>');
  };
  CZ.views.applicationDetail.mounted = function (page, ctx) {
    vc.bindBack(page); vc.bindScrollChrome(page);
    const item = cases.find(c => c.id === ctx.params.id);
    if (!item) return;
    U.qsa('[data-application-image]', page).forEach(button => button.addEventListener('click', () => {
      CZ.ui.imageViewer(item.figures.map((id, i) => ({ label: item.labels[i], html: '<img class="art" src="' + src(id) + '" alt="' + U.esc(item.labels[i]) + '">' })), +button.dataset.applicationImage, item.title);
    }));
  };
})();

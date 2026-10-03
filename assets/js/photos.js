/* ==========================================================================
   photos.js —— 真实照片覆盖表
   assets/img/ 下的黑白摄影素材（AI 生成示例图，正式上线请替换为馆藏照片），
   在这里登记后替换程序化生成的占位图形；未登记的条目继续使用水墨矢量图。
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  if (!CZ.Art) return;

  // 纹样图（键为 data.js 中纹样的 id，或视图里 Art.motif 的 seed）
  Object.assign(CZ.Art.photos.motif, {
    'cat-plant': 'assets/img/cat-plant.jpg',      // 首页「植物装饰」分类卡
    'cat-figure': 'assets/img/cat-figure.jpg',    // 首页「人物装饰」分类卡
    'watchimg-plant-mudan-01': 'assets/img/watch-mudan.jpg',     // 我的·常看·牡丹纹
    'watchimg-plant-juancao-01': 'assets/img/watch-juancao.jpg', // 我的·常看·卷草纹
    'watchimg-plant-lianhua-01': 'assets/img/watch-lianhua.jpg', // 我的·常看·莲花纹
  });

  // 工艺 / 窑址 / 展陈场景图（键为 kind：kiln、workshop、wheel、saggars、shards、glaze、clay、museum、fuel）
  Object.assign(CZ.Art.photos.scene, {
    kiln: 'assets/img/craft-kiln.jpg',      // 窑址（首页工艺高卡 / 工艺页）
    wheel: 'assets/img/craft-wheel.jpg',    // 拉坯
    glaze: 'assets/img/craft-glaze.jpg',    // 施釉
    museum: 'assets/img/scene-museum.jpg',  // 展陈场景（展览卡片）
    phead: 'assets/img/profile-head.jpg',   // 「我的」页头深色背景
  });

  // 首页轮播大图（键为 hero 的 id：h1…h5）
  Object.assign(CZ.Art.photos.hero, {
    h1: 'assets/img/hero-h1.jpg',  // 馆藏瓶 · 博物馆射灯
    h2: 'assets/img/hero-h2.jpg',  // 观台窑址 · 馒头窑群
    h3: 'assets/img/hero-h3.jpg',  // 瓷片纹样特写
    h4: 'assets/img/hero-h4.jpg',  // 匣钵装烧
    h5: 'assets/img/hero-h5.jpg',  // 施化妆土
  });
})();

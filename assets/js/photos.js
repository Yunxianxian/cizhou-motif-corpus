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

  // 用户提供的全部 121 张植物纹样；原有条目的配图对应关系保留。
  Object.assign(CZ.Art.photos.motif, {
    'plant-mudan-01': 'assets/img/patterns/plant-mudan-01.jpg',
    'plant-mudan-02': 'assets/img/patterns/plant-mudan-02.jpg',
    'plant-mudan-03': 'assets/img/patterns/plant-mudan-03.jpg',
    'plant-mudan-04': 'assets/img/patterns/plant-mudan-04.jpg',
    'plant-mudan-05': 'assets/img/patterns/plant-mudan-05.jpg',
    'plant-mudan-06': 'assets/img/patterns/plant-mudan-06.jpg',
    'plant-mudan-07': 'assets/img/patterns/plant-mudan-07.jpg',
    'plant-mudan-08': 'assets/img/patterns/plant-mudan-08.jpg',
    'plant-mudan-09': 'assets/img/patterns/plant-mudan-09.jpg',
    'plant-mudan-10': 'assets/img/patterns/plant-mudan-10.jpg',
    'plant-mudan-11': 'assets/img/patterns/plant-mudan-11.jpg',
    'plant-mudan-12': 'assets/img/patterns/plant-mudan-12.jpg',
    'plant-juancao-01': 'assets/img/patterns/plant-juancao-01.jpg',
    'plant-juancao-02': 'assets/img/patterns/plant-juancao-02.jpg',
    'plant-juancao-03': 'assets/img/patterns/plant-juancao-03.jpg',
    'plant-juancao-04': 'assets/img/patterns/plant-juancao-04.jpg',
    'plant-juancao-05': 'assets/img/patterns/plant-juancao-05.jpg',
    'plant-juancao-06': 'assets/img/patterns/plant-juancao-06.jpg',
    'plant-juancao-07': 'assets/img/patterns/plant-juancao-07.jpg',
    'plant-juancao-08': 'assets/img/patterns/plant-juancao-08.jpg',
    'plant-lianhua-01': 'assets/img/patterns/plant-lianhua-01.jpg',
    'plant-lianhua-02': 'assets/img/patterns/plant-lianhua-02.jpg',
    'plant-lianhua-03': 'assets/img/patterns/plant-lianhua-03.jpg',
    'plant-lianhua-04': 'assets/img/patterns/plant-lianhua-04.jpg',
    'plant-lianhua-05': 'assets/img/patterns/plant-lianhua-05.jpg',
    'plant-lianhua-06': 'assets/img/patterns/plant-lianhua-06.jpg',
    'plant-lianhua-07': 'assets/img/patterns/plant-lianhua-07.jpg',
    'plant-lianhua-08': 'assets/img/patterns/plant-lianhua-08.jpg',
    'plant-juhua-01': 'assets/img/patterns/plant-juhua-01.jpg',
    'plant-juhua-02': 'assets/img/patterns/plant-juhua-02.jpg',
    'plant-juhua-03': 'assets/img/patterns/plant-juhua-03.jpg',
    'plant-juhua-04': 'assets/img/patterns/plant-juhua-04.jpg',
    'plant-juhua-05': 'assets/img/patterns/plant-juhua-05.jpg',
    'plant-juhua-06': 'assets/img/patterns/plant-juhua-06.jpg',
  });

  // 补齐剩余素材。
  Object.assign(CZ.Art.photos.motif, {
    'plant-chanzhi-01': 'assets/img/patterns/plant-chanzhi-01.jpg',
    'plant-chanzhi-02': 'assets/img/patterns/plant-chanzhi-02.jpg',
    'plant-chanzhi-03': 'assets/img/patterns/plant-chanzhi-03.jpg',
    'plant-chanzhi-04': 'assets/img/patterns/plant-chanzhi-04.jpg',
    'plant-chanzhi-05': 'assets/img/patterns/plant-chanzhi-05.jpg',
    'plant-chanzhi-06': 'assets/img/patterns/plant-chanzhi-06.jpg',
    'plant-chanzhi-07': 'assets/img/patterns/plant-chanzhi-07.jpg',
    'plant-chanzhi-08': 'assets/img/patterns/plant-chanzhi-08.jpg',
    'plant-chanzhi-09': 'assets/img/patterns/plant-chanzhi-09.jpg',
    'plant-chanzhi-10': 'assets/img/patterns/plant-chanzhi-10.jpg',
    'plant-chanzhi-11': 'assets/img/patterns/plant-chanzhi-11.jpg',
    'plant-chanzhi-12': 'assets/img/patterns/plant-chanzhi-12.jpg',
    'plant-chanzhi-13': 'assets/img/patterns/plant-chanzhi-13.jpg',
    'plant-chanzhi-14': 'assets/img/patterns/plant-chanzhi-14.jpg',
    'plant-chanzhi-15': 'assets/img/patterns/plant-chanzhi-15.jpg',
    'plant-chanzhi-16': 'assets/img/patterns/plant-chanzhi-16.jpg',
    'plant-chanzhi-17': 'assets/img/patterns/plant-chanzhi-17.jpg',
    'plant-chanzhi-18': 'assets/img/patterns/plant-chanzhi-18.jpg',
    'plant-chanzhi-19': 'assets/img/patterns/plant-chanzhi-19.jpg',
    'plant-chanzhi-20': 'assets/img/patterns/plant-chanzhi-20.jpg',
    'plant-chanzhi-21': 'assets/img/patterns/plant-chanzhi-21.jpg',
    'plant-chanzhi-22': 'assets/img/patterns/plant-chanzhi-22.jpg',
    'plant-chanzhi-23': 'assets/img/patterns/plant-chanzhi-23.jpg',
    'plant-chanzhi-24': 'assets/img/patterns/plant-chanzhi-24.jpg',
    'plant-chanzhi-25': 'assets/img/patterns/plant-chanzhi-25.jpg',
    'plant-chanzhi-26': 'assets/img/patterns/plant-chanzhi-26.jpg',
    'plant-chanzhi-27': 'assets/img/patterns/plant-chanzhi-27.jpg',
    'plant-chanzhi-28': 'assets/img/patterns/plant-chanzhi-28.jpg',
    'plant-chanzhi-29': 'assets/img/patterns/plant-chanzhi-29.jpg',
    'plant-chanzhi-30': 'assets/img/patterns/plant-chanzhi-30.jpg',
    'plant-chanzhi-31': 'assets/img/patterns/plant-chanzhi-31.jpg',
    'plant-juancao-09': 'assets/img/patterns/plant-juancao-09.jpg',
    'plant-juancao-10': 'assets/img/patterns/plant-juancao-10.jpg',
    'plant-huahui-01': 'assets/img/patterns/plant-huahui-01.jpg',
    'plant-huahui-02': 'assets/img/patterns/plant-huahui-02.jpg',
    'plant-huahui-03': 'assets/img/patterns/plant-huahui-03.jpg',
    'plant-huahui-04': 'assets/img/patterns/plant-huahui-04.jpg',
    'plant-huahui-05': 'assets/img/patterns/plant-huahui-05.jpg',
    'plant-huahui-06': 'assets/img/patterns/plant-huahui-06.jpg',
    'plant-huahui-07': 'assets/img/patterns/plant-huahui-07.jpg',
    'plant-huahui-08': 'assets/img/patterns/plant-huahui-08.jpg',
    'plant-huahui-09': 'assets/img/patterns/plant-huahui-09.jpg',
    'plant-huahui-10': 'assets/img/patterns/plant-huahui-10.jpg',
    'plant-huahui-11': 'assets/img/patterns/plant-huahui-11.jpg',
    'plant-huahui-12': 'assets/img/patterns/plant-huahui-12.jpg',
    'plant-huahui-13': 'assets/img/patterns/plant-huahui-13.jpg',
    'plant-huahui-14': 'assets/img/patterns/plant-huahui-14.jpg',
    'plant-huahui-15': 'assets/img/patterns/plant-huahui-15.jpg',
    'plant-huahui-16': 'assets/img/patterns/plant-huahui-16.jpg',
    'plant-huahui-17': 'assets/img/patterns/plant-huahui-17.jpg',
    'plant-huahui-18': 'assets/img/patterns/plant-huahui-18.jpg',
    'plant-huahui-19': 'assets/img/patterns/plant-huahui-19.jpg',
    'plant-huahui-20': 'assets/img/patterns/plant-huahui-20.jpg',
    'plant-huahui-21': 'assets/img/patterns/plant-huahui-21.jpg',
    'plant-huahui-22': 'assets/img/patterns/plant-huahui-22.jpg',
    'plant-huahui-23': 'assets/img/patterns/plant-huahui-23.jpg',
    'plant-huahui-24': 'assets/img/patterns/plant-huahui-24.jpg',
    'plant-huahui-25': 'assets/img/patterns/plant-huahui-25.jpg',
    'plant-huahui-26': 'assets/img/patterns/plant-huahui-26.jpg',
    'plant-huahui-27': 'assets/img/patterns/plant-huahui-27.jpg',
    'plant-huahui-28': 'assets/img/patterns/plant-huahui-28.jpg',
    'plant-huahui-29': 'assets/img/patterns/plant-huahui-29.jpg',
    'plant-huahui-30': 'assets/img/patterns/plant-huahui-30.jpg',
    'plant-huahui-31': 'assets/img/patterns/plant-huahui-31.jpg',
    'plant-huahui-32': 'assets/img/patterns/plant-huahui-32.jpg',
    'plant-huahui-33': 'assets/img/patterns/plant-huahui-33.jpg',
    'plant-huahui-34': 'assets/img/patterns/plant-huahui-34.jpg',
    'plant-huahui-35': 'assets/img/patterns/plant-huahui-35.jpg',
    'plant-huahui-36': 'assets/img/patterns/plant-huahui-36.jpg',
    'plant-huahui-37': 'assets/img/patterns/plant-huahui-37.jpg',
    'plant-huahui-38': 'assets/img/patterns/plant-huahui-38.jpg',
    'plant-huahui-39': 'assets/img/patterns/plant-huahui-39.jpg',
    'plant-huahui-40': 'assets/img/patterns/plant-huahui-40.jpg',
    'plant-huahui-41': 'assets/img/patterns/plant-huahui-41.jpg',
    'plant-huahui-42': 'assets/img/patterns/plant-huahui-42.jpg',
    'plant-huahui-43': 'assets/img/patterns/plant-huahui-43.jpg',
    'plant-huahui-44': 'assets/img/patterns/plant-huahui-44.jpg',
    'plant-huahui-45': 'assets/img/patterns/plant-huahui-45.jpg',
    'plant-huahui-46': 'assets/img/patterns/plant-huahui-46.jpg',
    'plant-huahui-47': 'assets/img/patterns/plant-huahui-47.jpg',
    'plant-huahui-48': 'assets/img/patterns/plant-huahui-48.jpg',
    'plant-huahui-49': 'assets/img/patterns/plant-huahui-49.jpg',
    'plant-huahui-50': 'assets/img/patterns/plant-huahui-50.jpg',
    'plant-huahui-51': 'assets/img/patterns/plant-huahui-51.jpg',
    'plant-huahui-52': 'assets/img/patterns/plant-huahui-52.jpg',
    'plant-huahui-53': 'assets/img/patterns/plant-huahui-53.jpg',
    'plant-huahui-54': 'assets/img/patterns/plant-huahui-54.jpg',
  });

  // 详情首图复用列表素材，避免离线版重复嵌入同一张图片。
  Object.keys(CZ.Art.photos.motif).filter((id) => id.indexOf('plant-') === 0).forEach((id) => {
    CZ.Art.photos.motif[id + '-l'] = CZ.Art.photos.motif[id];
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

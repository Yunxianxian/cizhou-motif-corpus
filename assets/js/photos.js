/* ==========================================================================
   photos.js —— 真实照片覆盖表（可选）
   把馆藏照片放进 assets/img/ 后，在这里登记即可替换程序化生成的占位图形；
   未登记的条目继续使用内置水墨矢量图，互不影响。

   示例：
     CZ.Art.photos.motif['plant-mudan-01'] = 'assets/img/mudan-01.jpg'; // 列表 / 详情主图
     CZ.Art.photos.scene.kiln  = 'assets/img/kiln.jpg';                 // 工艺场景图
     CZ.Art.photos.hero.h1     = 'assets/img/hero-museum.jpg';          // 首页轮播大图
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  if (!CZ.Art) return;

  // 纹样图（键为 data.js 中纹样的 id）
  Object.assign(CZ.Art.photos.motif, {
    // 'plant-mudan-01': 'assets/img/plant-mudan-01.jpg',
  });

  // 工艺 / 窑址 / 展陈场景图（键为 kind：kiln、workshop、wheel、saggars、shards、glaze、clay、museum、fuel）
  Object.assign(CZ.Art.photos.scene, {
    // kiln: 'assets/img/kiln.jpg',
  });

  // 首页轮播大图（键为 hero 的 id：h1…h5）
  Object.assign(CZ.Art.photos.hero, {
    // h1: 'assets/img/hero-museum.jpg',
  });
})();

/* ==========================================================================
   glass.js —— 液态玻璃「指针追光」
   指针（鼠标 / 触摸）掠过玻璃元素时，把光斑位置写入 --mx / --my，
   由 glass.css 的 ::before 镀层渲染镜面高光。事件委托 + rAF 节流，
   兼容视图动态重渲染，零依赖、无框架。
   ========================================================================== */
(function () {
  'use strict';

  // Keep moving highlights on controls; leave reading and image surfaces quiet.
  var SEL = '.quicklink,.glass-btn,.chip,.tag,.dfab,.btn,.themecard,' +
    '.dropzone,.searchbar__field,.stepnav__it,.morebtn,.iconbtn';

  var raf = 0;
  var pending = null;
  var lit = null; // 当前点亮的元素

  function paint(e) {
    var t = e.target && e.target.closest ? e.target.closest(SEL) : null;
    if (t === lit && !t) return;
    if (t) {
      var r = t.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        t.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
        t.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
      }
      t.classList.add('is-glow');
    }
    if (lit && lit !== t) lit.classList.remove('is-glow');
    lit = t;
  }

  function onMove(e) {
    if (document.documentElement.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    pending = e;
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      if (pending) paint(pending);
      pending = null;
    });
  }

  // 指针移动：桌面鼠标追光
  window.addEventListener('pointermove', onMove, { passive: true });

  // 按下：触摸设备上立即点亮一次（跟随手指位置）
  window.addEventListener('pointerdown', function (e) {
    if (document.documentElement.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    paint(e);
  }, { passive: true });

  // 抬起 / 离开窗口：熄灭
  window.addEventListener('pointerup', function () {
    if (lit && lit.classList && lit.matches(':hover') === false && matchMedia('(hover: none)').matches) {
      // 触摸设备：延迟熄灭，形成光斑渐隐
      var el = lit;
      setTimeout(function () { el.classList.remove('is-glow'); }, 240);
      lit = null;
    }
  }, { passive: true });

  document.addEventListener('pointerleave', function () {
    if (lit) { lit.classList.remove('is-glow'); lit = null; }
  });

  window.addEventListener('pointercancel', function () {
    if (lit) { lit.classList.remove('is-glow'); lit = null; }
  }, { passive: true });

  // 滚动时熄灭，避免光斑悬停在错误位置
  window.addEventListener('scroll', function () {
    if (lit) { lit.classList.remove('is-glow'); lit = null; }
  }, { passive: true, capture: true });
})();

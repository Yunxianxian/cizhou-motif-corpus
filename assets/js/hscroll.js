/* ==========================================================================
   hscroll.js —— 横向横幅的鼠标拖拽滚动
   触屏上浏览器原生支持「拖动即滚动」，桌面鼠标没有这种能力；
   而这些横幅又都隐藏了滚动条（scrollbar-width: none），
   于是鼠标用户完全无法横向浏览。这里补上标准的拖拽滚动：
     · 只处理 pointerType === 'mouse'，不干扰触屏原生惯性滚动
     · 从事件目标向上找 overflow-x: auto/scroll 且确实能滚的容器，无需预先注册
     · 拖动超过阈值后吞掉紧随其后的 click，避免误触进卡片链接
   ========================================================================== */
(function () {
  'use strict';
  if (!window.PointerEvent) return;

  var THRESHOLD = 5; // px，超过才判定为拖动
  var drag = null;   // { el, id, x0, left0, moved }
  var swallow = null; // { el, until } 拖动后需要吞掉的首次点击

  function scrollableAncestor(node) {
    var el = node;
    while (el && el.nodeType === 1 && el !== document.documentElement) {
      var ox = getComputedStyle(el).overflowX;
      if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 4) return el;
      el = el.parentElement;
    }
    return null;
  }

  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    var el = scrollableAncestor(e.target);
    if (!el) return;
    drag = { el: el, id: e.pointerId, x0: e.clientX, left0: el.scrollLeft, moved: false };
    el.classList.add('is-hscroll', 'is-dragging');
  }, true);

  document.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x0;
    if (!drag.moved) {
      if (Math.abs(dx) <= THRESHOLD) return;
      drag.moved = true;
    }
    e.preventDefault(); // 拖动时不要选中文字
    drag.el.scrollLeft = drag.left0 - dx;
  }, { capture: true, passive: false });

  // 悬停时给出「可拖动」的光标提示（只在鼠标下）
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse' || drag) return;
    var el = scrollableAncestor(e.target);
    if (el) el.classList.add('is-hscroll');
  }, true);

  /* 关键：真实鼠标拖动 <a> / <img> 会触发浏览器的原生拖拽（Drag and Drop），
     一旦进入 DnD，pointermove 就收不到、并会收到 pointercancel，拖拽滚动随即中断。
     合成事件测不出这个问题，所以这里必须无条件取消条带内的原生拖拽。 */
  document.addEventListener('dragstart', function (e) {
    if (scrollableAncestor(e.target)) e.preventDefault();
  }, true);

  function end() {
    if (!drag) return;
    var el = drag.el, moved = drag.moved;
    drag = null;
    el.classList.remove('is-dragging');
    if (moved) swallow = { el: el, until: Date.now() + 400 };
  }

  document.addEventListener('pointerup', end, true);
  document.addEventListener('pointercancel', end, true);

  document.addEventListener('click', function (e) {
    if (!swallow) return;
    if (Date.now() > swallow.until) { swallow = null; return; }
    if (swallow.el.contains(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      swallow = null;
    }
  }, true);
})();

/* Full-screen image viewer. Pointer Events support pinch, pan and swipe. */
(function () {
  'use strict';
  const CZ = window.CZ;
  const U = CZ.util;
  let activeClose = null;

  CZ.ui.imageViewer = function (items, initialIndex, title) {
    if (!items || !items.length) return;
    if (activeClose) activeClose();
    const previousFocus = document.activeElement;
    const node = U.el('<div class="imageviewer" role="dialog" aria-modal="true" aria-label="图片查看器" tabindex="-1">' +
      '<header class="imageviewer__header"><div><b class="imageviewer__title"></b>' +
      '<span class="imageviewer__count" aria-live="polite"></span></div>' +
      '<button class="glass-btn" data-viewer-close aria-label="关闭图片查看器">' + CZ.icon('close', { size: 22 }) + '</button></header>' +
      '<div class="imageviewer__stage"><div class="imageviewer__image"></div></div>' +
      '<footer class="imageviewer__footer"><p>双指缩放 · 放大后拖动 · 原始大小时左右滑动</p>' +
      '<div class="imageviewer__tools"><button class="glass-btn" data-viewer-prev aria-label="上一张">' + CZ.icon('back') + '</button>' +
      '<button class="glass-btn" data-viewer-out aria-label="缩小图片">−</button>' +
      '<button class="imageviewer__reset" data-viewer-reset aria-label="恢复图片原始大小">100%</button>' +
      '<button class="glass-btn" data-viewer-in aria-label="放大图片">+</button>' +
      '<button class="glass-btn" data-viewer-next aria-label="下一张">' + CZ.icon('next') + '</button></div></footer></div>');
    document.body.appendChild(node);
    const siblings = Array.from(document.body.children).filter((el) => el !== node);
    const previousInert = siblings.map((el) => el.inert);
    siblings.forEach((el) => { el.inert = true; });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const stage = U.qs('.imageviewer__stage', node);
    const image = U.qs('.imageviewer__image', node);
    const resetButton = U.qs('[data-viewer-reset]', node);
    const prev = U.qs('[data-viewer-prev]', node);
    const next = U.qs('[data-viewer-next]', node);
    const zoomIn = U.qs('[data-viewer-in]', node);
    const zoomOut = U.qs('[data-viewer-out]', node);
    let index = Math.max(0, Math.min(items.length - 1, initialIndex || 0));
    let zoom = 1, x = 0, y = 0, fitWidth = 1, fitHeight = 1;
    let gesture = null, tappedAt = 0, closed = false;
    const pointers = new Map();
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    function paint() {
      const maxX = Math.max(0, (fitWidth * zoom - stage.clientWidth) / 2);
      const maxY = Math.max(0, (fitHeight * zoom - stage.clientHeight) / 2);
      x = clamp(x, -maxX, maxX); y = clamp(y, -maxY, maxY);
      image.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + zoom + ')';
      resetButton.textContent = Math.round(zoom * 100) + '%';
      zoomOut.disabled = zoom <= 1; zoomIn.disabled = zoom >= 5;
      stage.classList.toggle('is-zoomed', zoom > 1);
    }
    function fit() {
      const art = image.querySelector('.art');
      if (!art) return;
      const box = art.tagName.toLowerCase() === 'svg' && art.viewBox && art.viewBox.baseVal;
      const w = art.naturalWidth || (box && box.width) || 1;
      const h = art.naturalHeight || (box && box.height) || 1;
      const ratio = Math.min(stage.clientWidth / w, stage.clientHeight / h);
      fitWidth = Math.max(1, w * ratio); fitHeight = Math.max(1, h * ratio);
      image.style.width = fitWidth + 'px'; image.style.height = fitHeight + 'px';
      paint();
    }
    function reset() { zoom = 1; x = y = 0; paint(); }
    function show(i) {
      index = clamp(i, 0, items.length - 1);
      pointers.clear(); gesture = null; tappedAt = 0;
      image.innerHTML = items[index].html;
      const art = image.querySelector('.art');
      if (art) {
        art.setAttribute('draggable', 'false');
        if (art.tagName.toLowerCase() === 'img') {
          art.loading = 'eager'; art.alt = (title || '纹样') + ' · ' + items[index].label;
          art.addEventListener('load', fit, { once: true });
        }
      }
      U.qs('.imageviewer__title', node).textContent = title || '纹样图版';
      U.qs('.imageviewer__count', node).textContent = items[index].label + ' · ' + (index + 1) + ' / ' + items.length;
      prev.disabled = index === 0; next.disabled = index === items.length - 1;
      zoom = 1; x = y = 0; fit();
    }
    function changeZoom(value, anchor) {
      const nextZoom = clamp(value, 1, 5);
      if (anchor) {
        const ratio = nextZoom / zoom;
        x = anchor.x + (x - anchor.x) * ratio;
        y = anchor.y + (y - anchor.y) * ratio;
      }
      zoom = nextZoom; paint();
    }
    function point(e) {
      const r = stage.getBoundingClientRect();
      return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 };
    }
    function begin() {
      const pts = Array.from(pointers.values());
      if (pts.length >= 2) {
        const [a, b] = pts;
        gesture = { pinch: true, distance: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
          center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, zoom, x, y };
        tappedAt = 0;
      } else if (pts.length === 1) {
        gesture = { start: pts[0], x, y, zoom, moved: false, started: performance.now() };
      }
    }
    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault(); stage.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, point(e)); begin();
    });
    stage.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId) || !gesture) return;
      pointers.set(e.pointerId, point(e));
      const pts = Array.from(pointers.values());
      if (gesture.pinch && pts.length >= 2) {
        const [a, b] = pts;
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        zoom = clamp(gesture.zoom * distance / gesture.distance, 1, 5);
        const ratio = zoom / gesture.zoom;
        x = (a.x + b.x) / 2 + (gesture.x - gesture.center.x) * ratio;
        y = (a.y + b.y) / 2 + (gesture.y - gesture.center.y) * ratio;
        paint();
      } else if (!gesture.pinch) {
        const p = pts[0], dx = p.x - gesture.start.x, dy = p.y - gesture.start.y;
        if (Math.hypot(dx, dy) > 8) gesture.moved = true;
        if (zoom > 1) { x = gesture.x + dx; y = gesture.y + dy; paint(); }
      }
    });
    function end(e, cancelled) {
      if (!pointers.has(e.pointerId)) return;
      const was = gesture, p = point(e);
      pointers.delete(e.pointerId);
      if (!cancelled && was && !was.pinch && pointers.size === 0) {
        const dx = p.x - was.start.x, dy = p.y - was.start.y;
        if (was.zoom <= 1 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          show(index + (dx < 0 ? 1 : -1));
        } else if (!was.moved && Math.hypot(dx, dy) < 8) {
          const now = performance.now();
          if (tappedAt && now - tappedAt < 320) { changeZoom(zoom > 1 ? 1 : 2.5, p); tappedAt = 0; }
          else tappedAt = now;
        }
      }
      // A remaining finger after a pinch may pan, but must never trigger a swipe or double tap.
      begin();
      if (was && was.pinch && gesture) { gesture.moved = true; gesture.zoom = Math.max(1.01, gesture.zoom); }
      if (!pointers.size) gesture = null;
    }
    stage.addEventListener('pointerup', (e) => end(e, false));
    stage.addEventListener('pointercancel', (e) => end(e, true));
    stage.addEventListener('lostpointercapture', (e) => end(e, true));
    stage.addEventListener('wheel', (e) => {
      e.preventDefault(); changeZoom(zoom * Math.exp(-e.deltaY * .002), point(e));
    }, { passive: false });
    function close() {
      if (closed) return;
      closed = true; node.remove();
      siblings.forEach((el, i) => { el.inert = previousInert[i]; });
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', keydown, true);
      window.removeEventListener('resize', fit);
      window.removeEventListener('hashchange', close);
      if (activeClose === close) activeClose = null;
      if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    }
    function keydown(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); changeZoom(zoom * 1.4); }
      else if (e.key === '-') { e.preventDefault(); changeZoom(zoom / 1.4); }
      else if (e.key === '0') { e.preventDefault(); reset(); }
      else if (e.key === 'Tab') {
        const buttons = U.qsa('button:not(:disabled)', node);
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (e.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    U.qs('[data-viewer-close]', node).addEventListener('click', close);
    prev.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    zoomIn.addEventListener('click', () => changeZoom(zoom * 1.5));
    zoomOut.addEventListener('click', () => changeZoom(zoom / 1.5));
    resetButton.addEventListener('click', reset);
    window.addEventListener('keydown', keydown, true);
    window.addEventListener('resize', fit);
    window.addEventListener('hashchange', close);
    activeClose = close; show(index);
    U.qs('[data-viewer-close]', node).focus({ preventScroll: true });
    return { close };
  };
})();

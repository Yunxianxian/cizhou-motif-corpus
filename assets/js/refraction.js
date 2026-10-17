/* Rounded glass refraction. Only the backdrop is displaced; labels stay sharp. */
(function () {
  'use strict';
  if (!window.ResizeObserver || !window.CSS || !CSS.supports('backdrop-filter', 'url("#glass")')) return;
  const NS = 'http://www.w3.org/2000/svg';
  const selector = '.tabbar__material,.tabbar__pill,.glass-btn,.dfab,.sheet,.dialog,.pavatar,.puser__friends';
  const media = matchMedia('(prefers-reduced-transparency: reduce)');
  const records = new Map();
  const make = name => document.createElementNS(NS, name);
  const svg = make('svg'), defs = make('defs');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;pointer-events:none;overflow:hidden';
  svg.appendChild(defs); document.body.appendChild(svg);
  let sequence = 0, timer = 0;
  const waiting = new Set();
  function update(el) {
    const record = records.get(el);
    if (!record || !el.isConnected) return;
    if (media.matches) { el.classList.remove('has-refraction'); return; }
    const width = el.clientWidth, height = el.clientHeight;
    if (width < 2 || height < 2) return;
    const radius = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 20, width / 2, height / 2);
    const key = Math.round(width / 2) + ':' + Math.round(height / 2) + ':' + Math.round(radius);
    if (record.key === key) { el.classList.add('has-refraction'); return; }
    record.key = key;
    // The normal map is low resolution and stretched by the SVG filter.
    const ratio = Math.min(1, 440 / width, 150 / height);
    const w = Math.max(2, Math.round(width * ratio)), h = Math.max(2, Math.round(height * ratio));
    const r = radius * ratio, bevel = Math.max(3, Math.min(12 * ratio, h * .22));
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const context = canvas.getContext('2d');
    if (!context) return;
    const map = context.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const px = x + .5 - w / 2, py = y + .5 - h / 2;
        const qx = Math.abs(px) - (w / 2 - r), qy = Math.abs(py) - (h / 2 - r);
        const ox = Math.max(qx, 0), oy = Math.max(qy, 0), len = Math.hypot(ox, oy);
        const distance = len + Math.min(Math.max(qx, qy), 0) - r;
        let nx, ny;
        if (len > 0) { nx = ox / len * Math.sign(px); ny = oy / len * Math.sign(py); }
        else if (qx > qy) { nx = Math.sign(px); ny = 0; }
        else { nx = 0; ny = Math.sign(py); }
        // A smooth lens shoulder bends the scene at the rim, leaving its center clear.
        const t = Math.max(0, Math.min(1, -distance / bevel));
        const bend = distance <= 0 && t < 1 ? Math.sin(Math.PI * t) : 0;
        const i = (y * w + x) * 4;
        map.data[i] = Math.round(128 - nx * bend * 112);
        map.data[i + 1] = Math.round(128 - ny * bend * 112);
        map.data[i + 2] = 128; map.data[i + 3] = 255;
      }
    }
    context.putImageData(map, 0, 0);
    record.filter.setAttribute('width', width); record.filter.setAttribute('height', height);
    record.image.setAttribute('width', width); record.image.setAttribute('height', height);
    record.image.setAttribute('href', canvas.toDataURL());
    const strength = el.classList.contains('tabbar__pill') ? 12 : 8;
    record.displace.setAttribute('scale', strength);
    el.style.setProperty('--glass-refraction', 'url("#' + record.id + '")');
    el.classList.add('has-refraction');
  }
  function queue(el) {
    waiting.add(el);
    if (!timer) timer = setTimeout(() => {
      timer = 0; waiting.forEach(update); waiting.clear();
    }, 70);
  }
  const observer = new ResizeObserver(entries => entries.forEach(entry => queue(entry.target)));
  function register(el) {
    if (records.has(el)) return;
    const id = 'glass-rim-' + (++sequence);
    const filter = make('filter'), image = make('feImage'), displace = make('feDisplacementMap');
    filter.setAttribute('id', id); filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('x', '0'); filter.setAttribute('y', '0');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    image.setAttribute('result', 'rim'); image.setAttribute('preserveAspectRatio', 'none');
    displace.setAttribute('in', 'SourceGraphic'); displace.setAttribute('in2', 'rim');
    displace.setAttribute('xChannelSelector', 'R'); displace.setAttribute('yChannelSelector', 'G');
    filter.append(image, displace); defs.appendChild(filter);
    records.set(el, { id, filter, image, displace }); observer.observe(el); queue(el);
  }
  function scan(root) {
    if (root.nodeType !== 1) return;
    if (root.matches(selector)) register(root);
    root.querySelectorAll(selector).forEach(register);
  }
  scan(document.body);
  new MutationObserver(changes => {
    let removed = false;
    changes.forEach(change => {
      change.addedNodes.forEach(scan);
      if (change.removedNodes.length) removed = true;
    });
    if (removed) records.forEach((record, el) => {
      if (!el.isConnected) { observer.unobserve(el); waiting.delete(el); record.filter.remove(); records.delete(el); }
    });
  }).observe(document.body, { childList: true, subtree: true });
  const refresh = () => records.forEach((_, el) => { if (media.matches) el.classList.remove('has-refraction'); else queue(el); });
  if (media.addEventListener) media.addEventListener('change', refresh);
})();

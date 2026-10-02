/* ==========================================================================
   icons.js —— 线性图标（24 网格，随 currentColor 变色）
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});

  // 描边类图标
  const STROKE = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M16.3 16.3 21 21"/>',
    back: '<path d="M15 4.8 7.6 12 15 19.2"/>',
    next: '<path d="M9 4.8 16.4 12 9 19.2"/>',
    down: '<path d="M4.8 9 12 16.4 19.2 9"/>',
    up: '<path d="M12 19.4V5.6M5.8 11.8 12 5.6l6.2 6.2"/>',
    upBox: '<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.6"/><path d="M12 16.4V8.4M8.8 11.6 12 8.4l3.2 3.2"/>',
    downBox: '<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.6"/><path d="M12 7.6v8M8.8 12.4 12 15.6l3.2-3.2"/>',
    heart: '<path d="M12 20.6S3.7 15.4 3.7 9.9A4.7 4.7 0 0 1 12 6.9a4.7 4.7 0 0 1 8.3 3c0 5.5-8.3 10.7-8.3 10.7Z"/>',
    star: '<path d="m12 3.6 2.7 5.5 6 .9-4.4 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.3 10l6-.9z"/>',
    shirt: '<path d="M8.6 3.4 4.8 5.2l1.3 3.7 1.7-.6V20.5h8.4V8.3l1.7.6 1.3-3.7-3.8-1.8a3.6 3.6 0 0 1-6.8 0Z"/>',
    clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 6.9v5.4l3.5 2.1"/>',
    pavilion: '<path d="M2.8 9.4 12 4.2l9.2 5.2"/><path d="M12 2.6v1.6M5.6 9.4v9.8M12 9.4v9.8M18.4 9.4v9.8M3.6 19.4h16.8"/>',
    dots: '<circle cx="5.4" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18.6" cy="12" r="1.7"/>',
    scan: '<path d="M4 8.6V6.2a2.2 2.2 0 0 1 2.2-2.2h2.4M15.4 4h2.4A2.2 2.2 0 0 1 20 6.2v2.4M20 15.4v2.4a2.2 2.2 0 0 1-2.2 2.2h-2.4M8.6 20H6.2A2.2 2.2 0 0 1 4 17.8v-2.4"/><path d="M4 12h16"/>',
    hexagon: '<path d="M12 3.4 19.4 7.7v8.6L12 20.6 4.6 16.3V7.7z"/><path d="M12 8.4 15.6 10.5v4.2L12 16.8 8.4 14.7v-4.2z"/>',
    message: '<path d="M20.4 12.4c0 3.7-3.8 6.7-8.4 6.7-1 0-2-.14-2.9-.4L4.4 20.6l1.3-3.5C4.5 15.9 3.6 14.3 3.6 12.4c0-3.7 3.8-6.7 8.4-6.7s8.4 3 8.4 6.7Z"/>',
    grid: '<rect x="3.6" y="3.6" width="7.6" height="7.6" rx="2.4"/><rect x="12.8" y="3.6" width="7.6" height="7.6" rx="2.4"/><rect x="3.6" y="12.8" width="7.6" height="7.6" rx="2.4"/><rect x="12.8" y="12.8" width="7.6" height="7.6" rx="2.4"/>',
    speaker: '<path d="M4 9.4h3l4.6-3.4v12L7 14.6H4z"/><path d="M15.2 9.6a3.6 3.6 0 0 1 0 4.8M17.8 7.2a7 7 0 0 1 0 9.6"/>',
    user: '<circle cx="12" cy="8.4" r="3.7"/><path d="M4.6 20.4c.7-3.6 3.8-6 7.4-6s6.7 2.4 7.4 6"/>',
    pencil: '<path d="M4 20l.9-4L15.6 5.3a2 2 0 0 1 2.9 0l.2.2a2 2 0 0 1 0 2.9L8 19.1 4 20Z"/><path d="m14.6 6.6 2.8 2.8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    camera: '<path d="M4 8.6h3l1.4-2.2h7.2L17 8.6h3v10.2H4z"/><circle cx="12" cy="13.4" r="3.3"/>',
    image: '<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="3"/><circle cx="8.6" cy="9.6" r="1.7"/><path d="m4.4 17.6 4.8-4.6 4 3.6 3-2.6 3.4 3"/>',
    tag: '<path d="M12.6 3.4H20v7.4l-8.8 8.8a1.6 1.6 0 0 1-2.3 0L3.4 14a1.6 1.6 0 0 1 0-2.3z"/><circle cx="16.4" cy="7.2" r="1.3"/>',
    share: '<path d="M12 3.6v11.2M8 7.4 12 3.6l4 3.8"/><path d="M5.2 13v6.8h13.6V13"/>',
    bookmark: '<path d="M6.6 4.4h10.8V20l-5.4-4-5.4 4z"/>',
    check: '<path d="M5 12.8 9.8 17.6 19.2 7"/>',
    close: '<path d="M6 6 18 18M18 6 6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6"/>',
    moon: '<path d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8 8.6 8.6 0 1 0 20.2 14.6Z"/>',
    book: '<path d="M4 5.6A2 2 0 0 1 6 3.6h13v14.8H6a2 2 0 0 0-2 2z"/><path d="M4 18.4a2 2 0 0 0 2 2h13"/>',
    trash: '<path d="M5 7.2h14M9.4 7.2V4.8h5.2v2.4M7.2 7.2 8.2 20h7.6l1-12.8"/>',
    info: '<circle cx="12" cy="12" r="8.4"/><path d="M12 11v5.2"/><circle cx="12" cy="7.9" r=".9" fill="currentColor" stroke="none"/>',
    arrow: '<path d="M4.6 12h14M13 6.6 18.4 12 13 17.4"/>',
    filter: '<path d="M4 7.4h16M6.8 12h10.4M10 16.6h4"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20.4 4.6v4.8h-4.8"/>',
    list: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    layers: '<path d="M12 3.6 3.6 7.8 12 12l8.4-4.2z"/><path d="M3.6 12.4 12 16.6l8.4-4.2"/><path d="M3.6 16.6 12 20.8l8.4-4.2"/>',
    edit: '<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/>',
    target: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="3.6"/>',
    cloud: '<path d="M7.4 18.6a4.4 4.4 0 0 1-.5-8.8 5.6 5.6 0 0 1 10.8 1.2 3.8 3.8 0 0 1-.6 7.6z"/>',
    location: '<path d="M12 21s6.4-6 6.4-11a6.4 6.4 0 1 0-12.8 0C5.6 15 12 21 12 21Z"/><circle cx="12" cy="10" r="2.4"/>',
    calendar: '<rect x="3.6" y="5.2" width="16.8" height="15.2" rx="3"/><path d="M3.6 10h16.8M8.4 3.4v3.4M15.6 3.4v3.4"/>',
    eye: '<path d="M2.6 12S6.4 5.8 12 5.8 21.4 12 21.4 12 17.6 18.2 12 18.2 2.6 12 2.6 12Z"/><circle cx="12" cy="12" r="3"/>',
    play: '<circle cx="12" cy="12" r="8.4"/><path d="M10.2 8.8 15.4 12l-5.2 3.2z"/>'
  };

  // 实心类图标
  const FILLED = {
    corpus: '<rect x="3" y="4.6" width="18" height="4.4" rx="1.8"/><rect x="3" y="10.2" width="18" height="4.4" rx="1.8"/><rect x="3" y="15.8" width="18" height="4.4" rx="1.8"/>',
    upload: '<path fill-rule="evenodd" d="M12 3.6 21.6 19.6H2.4zM9.6 15.2h4.8v3.6H9.6z"/>',
    me: '<circle cx="12" cy="7.8" r="3.8"/><path d="M4.2 20.6c0-4.1 3.6-6.4 7.8-6.4s7.8 2.3 7.8 6.4z"/>'
  };

  // 常用别名
  STROKE.uploadBox = STROKE.upBox;
  STROKE.downloadBox = STROKE.downBox;
  STROKE.arrowUp = STROKE.up;

  CZ.icon = function (name, opts) {
    opts = opts || {};
    const size = opts.size || 22;
    const sw = opts.sw || 1.7;
    const body = STROKE[name] || FILLED[name] || '';
    const filled = !!FILLED[name];
    return '<svg class="ic' + (opts.cls ? ' ' + opts.cls : '') + '" width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="' + (filled ? 'currentColor' : 'none') +
      '" stroke="' + (filled ? 'none' : 'currentColor') + '" stroke-width="' + sw +
      '" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  };
  CZ.hasIcon = (n) => !!(STROKE[n] || FILLED[n]);
  CZ.tabIcons = { corpus: 'corpus', upload: 'upload', me: 'me' };
})();

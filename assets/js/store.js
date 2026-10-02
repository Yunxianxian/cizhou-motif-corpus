/* ==========================================================================
   store.js —— 本地状态（收藏 / 关注 / 历史 / 上传 / 下载 / 主题 / 用户名 / 搜索历史）
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  const KEY = 'cizhou.yuyuliao.v1';

  const defaults = () => ({
    theme: 'light',
    fontScale: 1,
    motion: 'on',
    userName: CZ.DATA.user.name,
    favorites: CZ.DATA.seed.favorites.slice(),
    follows: CZ.DATA.seed.follows.map((f) => Object.assign({}, f)),
    history: CZ.DATA.seed.history.slice(),
    uploads: CZ.DATA.seed.uploads.map((u) => Object.assign({}, u)),
    downloads: CZ.DATA.seed.downloads.map((d) => Object.assign({}, d)),
    searchHistory: ['白地黑花', '元宝枕'],
    noticesRead: false
  });

  let state;
  // 手机本地打开（file://）时浏览器可能禁用 localStorage：此时退化为「本次会话内存状态」，
  // 功能照常可用，只是关掉页面后收藏/主题等不保留。
  const memory = {};
  const safeStore = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return memory[k] == null ? null : memory[k]; } },
    set(k, v) {
      try { localStorage.setItem(k, v); } catch (e) { memory[k] = v; }
    }
  };
  let persistent = true;
  try {
    localStorage.setItem('cizhou.probe', '1');
    localStorage.removeItem('cizhou.probe');
  } catch (e) {
    persistent = false;
  }
  CZ.storePersistent = persistent;

  try {
    const raw = safeStore.get(KEY);
    state = raw ? Object.assign(defaults(), JSON.parse(raw)) : defaults();
  } catch (e) {
    state = defaults();
  }

  const listeners = {};
  function emit(evt) {
    (listeners[evt] || []).forEach((fn) => { try { fn(state); } catch (e) { /* noop */ } });
    (listeners['*'] || []).forEach((fn) => { try { fn(evt, state); } catch (e) { /* noop */ } });
  }
  function save(evt) {
    safeStore.set(KEY, JSON.stringify(state));
    if (evt) emit(evt);
  }

  const S = (CZ.store = {
    get state() { return state; },
    on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); return () => S.off(evt, fn); },
    off(evt, fn) { listeners[evt] = (listeners[evt] || []).filter((f) => f !== fn); },

    setTheme(t) { state.theme = t; save('theme'); },
    setFontScale(v) { state.fontScale = v; save('font'); },
    setMotion(v) { state.motion = v; save('motion'); },
    setUserName(n) { state.userName = n; save('user'); },

    isFav(id) { return state.favorites.indexOf(id) >= 0; },
    toggleFav(id) {
      const i = state.favorites.indexOf(id);
      if (i >= 0) state.favorites.splice(i, 1); else state.favorites.unshift(id);
      save('favorites');
      return i < 0;
    },

    isFollowed(id) { return state.follows.some((f) => f.id === id); },
    toggleFollow(item) {
      const i = state.follows.findIndex((f) => f.id === item.id);
      if (i >= 0) { state.follows.splice(i, 1); save('follows'); return false; }
      state.follows.unshift(Object.assign({}, item));
      save('follows');
      return true;
    },

    pushHistory(id) {
      const i = state.history.indexOf(id);
      if (i >= 0) state.history.splice(i, 1);
      state.history.unshift(id);
      state.history = state.history.slice(0, 40);
      save('history');
    },
    clearHistory() { state.history = []; save('history'); },

    addUpload(item) { state.uploads.unshift(item); save('uploads'); },
    removeUpload(id) { state.uploads = state.uploads.filter((u) => u.id !== id); save('uploads'); },

    toggleDownload(id) {
      const d = state.downloads.filter((x) => x.id === id)[0];
      if (!d) return null;
      d.done = !d.done;
      d.progress = d.done ? 100 : 0;
      save('downloads');
      return d;
    },

    pushSearch(kw) {
      if (!kw) return;
      state.searchHistory = [kw].concat(state.searchHistory.filter((k) => k !== kw)).slice(0, 12);
      save('search');
    },
    clearSearch() { state.searchHistory = []; save('search'); },

    reset() { state = defaults(); save('*'); }
  });

  S.applyTheme = function () {
    const root = document.documentElement;
    root.setAttribute('data-theme', state.theme);
    root.setAttribute('data-font', String(state.fontScale));
    root.setAttribute('data-motion', state.motion === 'off' ? 'off' : 'on');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', state.theme === 'dark' ? '#101012' : state.theme === 'sepia' ? '#f2ebdd' : '#ffffff');
  };
})();

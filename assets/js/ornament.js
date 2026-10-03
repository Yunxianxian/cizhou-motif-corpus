/* ==========================================================================
   ornament.js —— 程序化生成「磁州窑」纹样与窑址场景插画
   全部为内联 SVG：纹样用 currentColor，可随主题换色；场景插画为灰度图。
   ========================================================================== */
(function () {
  const CZ = (window.CZ = window.CZ || {});
  const Art = (CZ.Art = {});

  /* --------------------------- 真实照片替换入口 ---------------------------
     程序化生成的图形只是占位。把馆藏照片放到 assets/img/ 后，只需填这张表：
       CZ.Art.photos.motif['plant-mudan-01'] = 'assets/img/mudan-01.jpg';
       CZ.Art.photos.scene.kiln            = 'assets/img/kiln.jpg';
       CZ.Art.photos.hero.h1               = 'assets/img/hero-1.jpg';
     也可以直接编辑 assets/js/photos.js（加载顺序在 ornament.js 之后）。
  ------------------------------------------------------------------------ */
  Art.photos = { motif: {}, scene: {}, hero: {} };
  const photoTag = (src, alt, cls) =>
    '<img class="art art--photo ' + (cls || '') + '" src="' + src + '" alt="' + (alt || '') + '" loading="lazy">';

  /* ---------------------------------- 基础工具 --------------------------------- */
  let uidSeq = 0;
  const uid = (p) => p + '_' + (++uidSeq).toString(36) + Math.floor(Math.random() * 1296).toString(36);
  const n = (v) => Math.round(v * 100) / 100;
  const pt = (x, y) => n(x) + ' ' + n(y);

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rng(seed) {
    let h = 2166136261;
    const s = String(seed);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return mulberry32(h >>> 0);
  }
  const rr = (r, a, b) => a + r() * (b - a);
  const ri = (r, a, b) => Math.floor(a + r() * (b - a + 1));
  const pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];

  /* ---------------------------------- 形状构造 --------------------------------- */
  // 带波状花边的圆润花瓣：基点 (0,0)，尖端 (0,-L)
  function petalRound(w, L, lobes, r) {
    const tipY = -L * 0.97;
    let d = 'M0 0 C ' + pt(w * 0.56, -L * 0.24) + ' ' + pt(w * 0.82, -L * 0.56) + ' ' + pt(w * 0.52, tipY);
    const x0 = w * 0.52, x1 = -w * 0.52;
    for (let i = 1; i <= lobes; i++) {
      const xa = x0 + ((x1 - x0) * (i - 1)) / lobes;
      const xb = x0 + ((x1 - x0) * i) / lobes;
      const bump = -L * (1.1 + rr(r, 0, 0.06));
      d += ' Q ' + pt((xa + xb) / 2, bump) + ' ' + pt(xb, tipY);
    }
    d += ' C ' + pt(-w * 0.82, -L * 0.56) + ' ' + pt(-w * 0.56, -L * 0.24) + ' 0 0 Z';
    return d;
  }
  // 尖花瓣（莲瓣）
  function petalSharp(w, L) {
    return 'M0 0 C ' + pt(w * 0.52, -L * 0.42) + ' ' + pt(w * 0.36, -L * 0.76) + ' ' + pt(0, -L) +
      ' C ' + pt(-w * 0.36, -L * 0.76) + ' ' + pt(-w * 0.52, -L * 0.42) + ' 0 0 Z';
  }
  // 细长花瓣（菊）
  function petalThin(w, L) {
    return 'M0 0 Q ' + pt(w, -L * 0.52) + ' ' + pt(0, -L) + ' Q ' + pt(-w, -L * 0.52) + ' 0 0 Z';
  }
  // 平滑折线（山脊）
  function smoothLine(pts) {
    let d = 'M' + pt(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i][0] + pts[i + 1][0]) / 2, yc = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ' Q' + pt(pts[i][0], pts[i][1]) + ' ' + pt(xc, yc);
    }
    const last = pts[pts.length - 1];
    d += ' L' + pt(last[0], last[1]);
    return d;
  }
  // 山脊点集
  function ridge(r, baseY, amp, from, to, step, closeY) {
    const pts = [];
    const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
    for (let x = from; x <= to; x += step) {
      const t = (x - from) / (to - from);
      let k = Math.sin(t * 6.1 + ph[0]) * 0.5 + Math.sin(t * 13.3 + ph[1]) * 0.28 + Math.sin(t * 24.7 + ph[2]) * 0.14;
      k = (k + 1) / 2;
      pts.push([x, baseY - amp * (0.35 + k * 0.9)]);
    }
    let d = smoothLine(pts);
    if (closeY !== undefined) d += ' L' + pt(to, closeY) + ' L' + pt(from, closeY) + 'Z';
    return d;
  }
  // 叶片
  function leaf(w, L) {
    return 'M0 0 Q ' + pt(w, -L * 0.46) + ' 0 ' + pt(0, -L) + ' Q ' + pt(-w, -L * 0.46) + ' 0 0 Z';
  }
  // 卷涡
  function spiral(cx, cy, r0, r1, turns, dir, start) {
    const steps = Math.max(10, Math.round(turns * 18));
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = (start || 0) + dir * t * turns * Math.PI * 2;
      const rad = r0 + (r1 - r0) * t;
      d += (i ? ' L' : 'M') + pt(cx + rad * Math.cos(a), cy + rad * Math.sin(a));
    }
    return d;
  }
  function blob(cx, cy, r, r2) {
    const k = r * 0.5523;
    return 'M' + pt(cx - r, cy) + ' C' + pt(cx - r, cy - k * (r2 || 1)) + ' ' + pt(cx - k * (r2 || 1), cy - r) + ' ' + pt(cx, cy - r) +
      ' C' + pt(cx + k * (r2 || 1), cy - r) + ' ' + pt(cx + r, cy - k * (r2 || 1)) + ' ' + pt(cx + r, cy) +
      ' C' + pt(cx + r, cy + k * (r2 || 1)) + ' ' + pt(cx + k * (r2 || 1), cy + r) + ' ' + pt(cx, cy + r) +
      ' C' + pt(cx - k * (r2 || 1), cy + r) + ' ' + pt(cx - r, cy + k * (r2 || 1)) + ' ' + pt(cx - r, cy) + 'Z';
  }

  // 变换包裹：translate → rotate → translate
  const T = (shapes, dx, dy, deg, sc) =>
    'translate(' + n(dx) + ' ' + n(dy) + ') rotate(' + n(deg) + ')' + (sc && sc !== 1 ? ' scale(' + n(sc) + ')' : '');

  /* ---------------------------------- 纹样构件 --------------------------------- */
  // 牡丹：多层波边花瓣
  function peony(r, cx, cy, R, opt) {
    opt = opt || {};
    const out = [];
    const rings = [
      { n: 8 + ri(r, 0, 2), rad: R * 0.60, len: R * 0.55, w: R * 0.50, lobes: 3, rot: 0, jitter: 6 },
      { n: 7, rad: R * 0.42, len: R * 0.46, w: R * 0.44, lobes: 3, rot: 26, jitter: 8 },
      { n: 6, rad: R * 0.26, len: R * 0.36, w: R * 0.38, lobes: 2, rot: 12, jitter: 10 },
      { n: 5, rad: R * 0.11, len: R * 0.28, w: R * 0.30, lobes: 2, rot: 44, jitter: 12 }
    ];
    rings.forEach((rg, ri2) => {
      const step = 360 / rg.n;
      for (let i = 0; i < rg.n; i++) {
        const a = rg.rot + i * step + rr(r, -rg.jitter, rg.jitter) * 0.4;
        const rad = rg.rad * (1 + rr(r, -0.06, 0.06));
        const len = rg.len * (1 + rr(r, -0.08, 0.08));
        const wid = rg.w * (1 + rr(r, -0.08, 0.08));
        out.push({
          t: 'solid',
          d: petalRound(wid, len, rg.lobes, r),
          tf: 'translate(' + n(cx) + ' ' + n(cy) + ') rotate(' + n(a) + ') translate(0 ' + n(-rad) + ')'
        });
      }
    });
    // 花心
    if (!opt.noCore) {
      out.push({ t: 'solid', d: blob(cx, cy, R * 0.13, 1) });
      const dots = ri(r, 3, 5);
      for (let i = 0; i < dots; i++) {
        const a = r() * Math.PI * 2, rad = rr(r, R * 0.16, R * 0.3);
        out.push({ t: 'vein', d: blob(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, R * 0.026, 1) });
      }
    }
    // 花瓣内白色脉络
    if (opt.veins !== false) {
      const k = ri(r, 4, 6);
      for (let i = 0; i < k; i++) {
        const a = (i / k) * Math.PI * 2 + rr(r, -0.3, 0.3);
        const r0 = R * 0.16, r1 = R * (0.5 + rr(r, 0, 0.28));
        const p0 = [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0];
        const p1 = [cx + Math.cos(a + 0.22) * r1 * 0.7, cy + Math.sin(a + 0.22) * r1 * 0.7];
        const p2 = [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1];
        out.push({ t: 'vein', d: 'M' + pt(p0[0], p0[1]) + ' Q' + pt(p1[0], p1[1]) + ' ' + pt(p2[0], p2[1]), sw: 1.1 });
      }
    }
    return out;
  }

  // 莲：两三层尖瓣 + 莲蓬
  function lotus(r, cx, cy, R, opt) {
    opt = opt || {};
    const out = [];
    const rings = [
      { n: 9, rad: R * 0.34, len: R * 0.66, w: R * 0.46, rot: 0 },
      { n: 7, rad: R * 0.22, len: R * 0.50, w: R * 0.40, rot: 25 },
      { n: 5, rad: R * 0.12, len: R * 0.34, w: R * 0.32, rot: 12 }
    ];
    rings.forEach((rg) => {
      const step = 360 / rg.n;
      for (let i = 0; i < rg.n; i++) {
        out.push({
          t: 'solid',
          d: petalSharp(rg.w * rr(r, 0.94, 1.06), rg.len * rr(r, 0.92, 1.08)),
          tf: 'translate(' + n(cx) + ' ' + n(cy) + ') rotate(' + n(rg.rot + i * step) + ') translate(0 ' + n(-rg.rad) + ')'
        });
      }
    });
    out.push({ t: 'solid', d: blob(cx, cy, R * 0.16, 1) });
    const holes = ri(r, 5, 7);
    for (let i = 0; i < holes; i++) {
      const a = (i / holes) * Math.PI * 2;
      out.push({ t: 'vein', d: blob(cx + Math.cos(a) * R * 0.085, cy + Math.sin(a) * R * 0.085, R * 0.03, 1) });
    }
    return out;
  }

  // 菊：细密放射瓣
  function chrys(r, cx, cy, R, opt) {
    opt = opt || {};
    const out = [];
    const layers = [
      { n: 22 + ri(r, 0, 6), rad: R * 0.36, len: R * 0.62, w: R * 0.13, rot: 0 },
      { n: 16 + ri(r, 0, 4), rad: R * 0.24, len: R * 0.46, w: R * 0.12, rot: 10 },
      { n: 12, rad: R * 0.13, len: R * 0.30, w: R * 0.11, rot: 22 }
    ];
    layers.forEach((rg) => {
      const step = 360 / rg.n;
      for (let i = 0; i < rg.n; i++) {
        out.push({
          t: 'solid',
          d: petalThin(rg.w * rr(r, 0.9, 1.1), rg.len * rr(r, 0.9, 1.1)),
          tf: 'translate(' + n(cx) + ' ' + n(cy) + ') rotate(' + n(rg.rot + i * step + rr(r, -3, 3)) + ') translate(0 ' + n(-rg.rad) + ')'
        });
      }
    });
    out.push({ t: 'solid', d: blob(cx, cy, R * 0.14, 1) });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      out.push({ t: 'vein', d: blob(cx + Math.cos(a) * R * 0.07, cy + Math.sin(a) * R * 0.07, R * 0.024, 1) });
    }
    return out;
  }

  // 卷草：蔓枝 + 卷涡 + 叶
  function vine(r, cx, cy, W, H, opt) {
    opt = opt || {};
    const out = [];
    const waves = ri(r, 2, 3);
    let d = 'M' + pt(cx - W / 2, cy);
    let x = cx - W / 2;
    const seg = W / (waves * 2);
    for (let i = 0; i < waves * 2; i++) {
      const up = i % 2 === 0;
      d += ' Q' + pt(x + seg * 0.5, cy + (up ? -H : H)) + ' ' + pt(x + seg, cy);
      x += seg;
    }
    out.push({ t: 'stem', d: d });
    // 端部卷涡
    out.push({ t: 'stem', d: spiral(cx - W / 2 - H * 0.35, cy, H * 0.42, H * 0.06, 1.15, 1, Math.PI) });
    out.push({ t: 'stem', d: spiral(cx + W / 2 + H * 0.35, cy, H * 0.42, H * 0.06, 1.15, -1, 0) });
    // 叶与卷涡
    const k = ri(r, 7, 10);
    for (let i = 0; i < k; i++) {
      const t = (i + 0.5) / k;
      const px = cx - W / 2 + W * t;
      const dir = i % 2 === 0 ? -1 : 1;
      const ang = dir * (38 + rr(r, -12, 12));
      const L = H * rr(r, 0.55, 0.95);
      out.push({ t: 'solid', d: leaf(L * 0.42, L), tf: T(null, px, cy + dir * H * 0.18, ang) });
      if (r() > 0.55) {
        out.push({ t: 'stem', d: spiral(px + dir * L * 0.5, cy + dir * (H * 0.5), L * 0.3, L * 0.05, 1, -dir) });
      }
    }
    // 蔓上小花
    const fk = ri(r, 1, 2);
    for (let i = 0; i < fk; i++) {
      const px = cx + rr(r, -W * 0.34, W * 0.34);
      const py = cy + (i % 2 === 0 ? -1 : 1) * H * 0.5;
      out.push({ t: 'solid', d: blob(px, py, H * 0.2, 1) });
      for (let j = 0; j < 5; j++) {
        const a = (j / 5) * Math.PI * 2;
        out.push({
          t: 'solid',
          d: petalThin(H * 0.13, H * 0.36),
          tf: 'translate(' + n(px) + ' ' + n(py) + ') rotate(' + n((a * 180) / Math.PI) + ') translate(0 ' + n(-H * 0.16) + ')'
        });
      }
      out.push({ t: 'vein', d: blob(px, py, H * 0.07, 1) });
    }
    return out;
  }

  // 折枝：斜向枝条 + 花 + 叶
  function brokenBranch(r, cx, cy, R, flowerFn, opt) {
    opt = opt || {};
    const out = [];
    const ang = rr(r, -32, -18);
    const len = R * 1.5;
    const rad = (ang * Math.PI) / 180;
    const x0 = cx - Math.cos(rad) * len * 0.5, y0 = cy + Math.sin(rad) * len * 0.5 + R * 0.55;
    const x1 = cx + Math.cos(rad) * len * 0.42, y1 = cy - Math.sin(rad) * len * 0.42 - R * 0.1;
    out.push({ t: 'stem', d: 'M' + pt(x0, y0) + ' Q' + pt(cx - R * 0.15, cy + R * 0.7) + ' ' + pt(x1, y1) });
    // 分枝
    out.push({
      t: 'stem',
      d: 'M' + pt(cx - R * 0.1, cy + R * 0.52) + ' Q' + pt(cx + R * 0.5, cy + R * 0.5) + ' ' + pt(cx + R * 0.72, cy + R * 0.05)
    });
    const leaves = ri(r, 4, 6);
    for (let i = 0; i < leaves; i++) {
      const t = (i + 1) / (leaves + 1);
      const px = x0 + (x1 - x0) * t + rr(r, -8, 8);
      const py = y0 + (y1 - y0) * t + rr(r, -6, 6);
      const dir = i % 2 === 0 ? 1 : -1;
      const L = R * rr(r, 0.36, 0.54);
      out.push({ t: 'solid', d: leaf(L * 0.4, L), tf: T(null, px, py, dir * rr(r, 30, 62)) });
    }
    out.push({ t: 'solid', d: blob(cx + R * 0.74, cy + R * 0.02, R * 0.09, 1) });
    out.push({ t: 'solid', d: blob(cx + R * 0.86, cy + R * 0.1, R * 0.05, 1) });
    const fl = flowerFn(r, cx + R * 0.06, cy - R * 0.14, R * 0.78);
    out.push.apply(out, fl);
    return out;
  }

  // 婴戏／人物：剪纸式人物剪影
  function figure(r, cx, cy, S, opt) {
    opt = opt || {};
    const out = [];
    const head = S * 0.17;
    // 发髻
    out.push({ t: 'solid', d: blob(cx, cy - S * 0.46, head * 0.5, 1) });
    if (opt.tuft !== false) {
      out.push({ t: 'solid', d: petalThin(head * 0.3, head * 0.9), tf: T(null, cx + head * 0.18, cy - S * 0.42, -18) });
      out.push({ t: 'solid', d: petalThin(head * 0.26, head * 0.8), tf: T(null, cx - head * 0.2, cy - S * 0.42, 22) });
    }
    // 头
    out.push({ t: 'solid', d: blob(cx, cy - S * 0.3, head, 1) });
    // 五官（留白）
    if (opt.face !== false) {
      out.push({ t: 'vein', d: blob(cx - head * 0.34, cy - S * 0.32, head * 0.11, 1) });
      out.push({ t: 'vein', d: blob(cx + head * 0.34, cy - S * 0.32, head * 0.11, 1) });
      out.push({ t: 'vein', d: 'M' + pt(cx - head * 0.16, cy - S * 0.22) + ' Q' + pt(cx, cy - S * 0.185) + ' ' + pt(cx + head * 0.16, cy - S * 0.22), sw: 1.1 });
    }
    // 身躯（袍）
    const bw = S * 0.3;
    out.push({
      t: 'solid',
      d: 'M' + pt(cx - head * 0.72, cy - S * 0.16) +
        ' C' + pt(cx - bw, cy + S * 0.08) + ' ' + pt(cx - bw * 1.18, cy + S * 0.34) + ' ' + pt(cx - bw * 1.1, cy + S * 0.56) +
        ' L' + pt(cx + bw * 1.1, cy + S * 0.56) +
        ' C' + pt(cx + bw * 1.18, cy + S * 0.34) + ' ' + pt(cx + bw, cy + S * 0.08) + ' ' + pt(cx + head * 0.72, cy - S * 0.16) + 'Z'
    });
    // 衣纹
    out.push({ t: 'vein', d: 'M' + pt(cx - bw * 0.5, cy + S * 0.2) + ' Q' + pt(cx, cy + S * 0.28) + ' ' + pt(cx + bw * 0.5, cy + S * 0.2), sw: 1.1 });
    out.push({ t: 'vein', d: 'M' + pt(cx - bw * 0.6, cy + S * 0.4) + ' Q' + pt(cx, cy + S * 0.48) + ' ' + pt(cx + bw * 0.6, cy + S * 0.4), sw: 1.1 });
    // 手臂
    const armUp = opt.armUp === undefined ? true : opt.armUp;
    out.push({
      t: 'solid',
      d: 'M' + pt(cx - bw * 0.9, cy) + ' C' + pt(cx - bw * 1.5, armUp ? cy - S * 0.12 : cy + S * 0.1) + ' ' + pt(cx - bw * 1.4, armUp ? cy - S * 0.3 : cy + S * 0.3) + ' ' + pt(cx - bw * 1.15, armUp ? cy - S * 0.34 : cy + S * 0.36) +
        ' C' + pt(cx - bw * 1.15, armUp ? cy - S * 0.12 : cy + S * 0.16) + ' ' + pt(cx - bw * 1.1, cy - S * 0.05) + ' ' + pt(cx - bw * 0.9, cy - S * 0.06) + 'Z'
    });
    out.push({
      t: 'solid',
      d: 'M' + pt(cx + bw * 0.9, cy) + ' C' + pt(cx + bw * 1.5, armUp ? cy - S * 0.12 : cy + S * 0.1) + ' ' + pt(cx + bw * 1.4, armUp ? cy - S * 0.3 : cy + S * 0.3) + ' ' + pt(cx + bw * 1.15, armUp ? cy - S * 0.34 : cy + S * 0.36) +
        ' C' + pt(cx + bw * 1.15, armUp ? cy - S * 0.12 : cy + S * 0.16) + ' ' + pt(cx + bw * 1.1, cy - S * 0.05) + ' ' + pt(cx + bw * 0.9, cy - S * 0.06) + 'Z'
    });
    // 腿
    out.push({ t: 'solid', d: 'M' + pt(cx - bw * 0.66, cy + S * 0.54) + ' h' + n(bw * 0.42) + ' v' + n(S * 0.16) + ' h' + n(-bw * 0.42) + 'Z' });
    out.push({ t: 'solid', d: 'M' + pt(cx + bw * 0.24, cy + S * 0.54) + ' h' + n(bw * 0.42) + ' v' + n(S * 0.16) + ' h' + n(-bw * 0.42) + 'Z' });
    // 手持道具
    if (opt.prop === 'lotus') {
      out.push({ t: 'stem', d: 'M' + pt(cx + bw * 1.2, cy - S * 0.34) + ' L' + pt(cx + bw * 1.5, cy - S * 0.82) });
      out.push({ t: 'solid', d: blob(cx + bw * 1.52, cy - S * 0.9, S * 0.075, 1) });
      for (let j = 0; j < 6; j++) {
        const a = (j / 6) * Math.PI * 2;
        out.push({
          t: 'solid',
          d: petalThin(S * 0.045, S * 0.12),
          tf: 'translate(' + n(cx + bw * 1.52) + ' ' + n(cy - S * 0.9) + ') rotate(' + n((a * 180) / Math.PI) + ') translate(0 ' + n(-S * 0.06) + ')'
        });
      }
    } else if (opt.prop === 'ball') {
      out.push({ t: 'solid', d: blob(cx + bw * 1.35, cy - S * 0.5, S * 0.1, 1) });
      out.push({ t: 'vein', d: blob(cx + bw * 1.35, cy - S * 0.5, S * 0.045, 1) });
    } else if (opt.prop === 'fan') {
      out.push({
        t: 'solid',
        d: 'M' + pt(cx + bw * 1.25, cy - S * 0.3) + ' A' + n(S * 0.26) + ' ' + n(S * 0.26) + ' 0 0 1 ' + pt(cx + bw * 1.25, cy - S * 0.82) + ' L' + pt(cx + bw * 1.3, cy - S * 0.56) + 'Z'
      });
    }
    return out;
  }

  // 云纹
  function cloud(r, cx, cy, W) {
    const out = [];
    const h = W * 0.28;
    out.push({
      t: 'stem',
      d: 'M' + pt(cx - W / 2, cy) +
        ' q' + pt(W * 0.12, -h) + ' ' + pt(W * 0.3, 0) +
        ' q' + pt(W * 0.02, -h * 0.9) + ' ' + pt(W * 0.24, -h * 0.2) +
        ' q' + pt(W * 0.06, -h * 0.8) + ' ' + pt(W * 0.26, h * 0.1) +
        ' q' + pt(W * 0.12, h * 0.2) + ' ' + pt(W * 0.2, h * 1.1)
    });
    out.push({ t: 'stem', d: spiral(cx - W * 0.52, cy + h * 0.5, h * 0.5, h * 0.08, 1, -1, Math.PI) });
    return out;
  }

  /* ---------------------------------- 纹样组装 --------------------------------- */
  const FLOWERS = { peony: peony, lotus: lotus, chrys: chrys };

  function motifShapes(r, spec) {
    const motif = spec.motif || 'peony';
    const comp = spec.comp || 'single';
    const cx = 100, cy = 100;
    let shapes = [];

    if (motif === 'scroll') {
      if (comp === 'scatter') {
        const pts = [[62, 56, 92], [140, 102, 82], [88, 150, 78]];
        pts.forEach((p) => { shapes = shapes.concat(vine(r, p[0], p[1], p[2], 15)); });
      } else if (comp === 'medallion') {
        shapes = [{ t: 'ring', cx: cx, cy: cy, r: 88 }];
        shapes = shapes.concat(vine(r, cx, cy - 14, 120, 24));
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const px = cx + Math.cos(a) * 58, py = cy + Math.sin(a) * 58;
          shapes.push({ t: 'solid', d: blob(px, py, 9, 1) });
          for (let j = 0; j < 5; j++) {
            const b = (j / 5) * Math.PI * 2;
            shapes.push({
              t: 'solid', d: petalThin(5, 15),
              tf: 'translate(' + n(px) + ' ' + n(py) + ') rotate(' + n((b * 180) / Math.PI) + ') translate(0 -7)'
            });
          }
        }
        return { shapes: shapes, frame: null };
      } else {
        shapes = vine(r, cx, cy, 150, rr(r, 30, 42));
        if (comp === 'band') {
          shapes = shapes.concat(vine(r, cx, cy - 52, 150, 20), vine(r, cx, cy + 52, 150, 20));
        }
      }
      return { shapes: shapes, frame: comp === 'band' ? 'rect' : null };
    }

    if (motif === 'child' || motif === 'story' || motif === 'immortal') {
      const S = 96;
      if (comp === 'pair' || comp === 'scatter') {
        shapes = figure(r, cx - 32, cy + 4, S * 0.78, { prop: pick(r, ['lotus', 'ball', null]), armUp: r() > 0.4 });
        shapes = shapes.concat(figure(r, cx + 34, cy + 8, S * 0.74, { prop: pick(r, ['lotus', 'ball', 'fan']), armUp: r() > 0.4 }));
      } else {
        shapes = figure(r, cx, cy + 6, S, { prop: pick(r, ['lotus', 'ball', 'fan', null]), armUp: true });
      }
      if (motif === 'immortal') {
        shapes = shapes.concat(cloud(r, cx - 46, cy - 44, 56));
        shapes = shapes.concat(cloud(r, cx + 48, cy - 26, 48));
      }
      if (motif === 'story' && r() > 0.5) {
        shapes.push({ t: 'stem', d: 'M18 ' + n(cy + 74) + ' H182' });
        for (let i = 0; i < 5; i++) {
          shapes.push({ t: 'vein', d: 'M' + pt(24 + i * 38, cy + 74) + ' l6 -8', sw: 1.2 });
        }
      }
      if (comp === 'medallion') shapes = [{ t: 'ring', cx: cx, cy: cy, r: 92 }].concat(shapes);
      return { shapes: shapes, frame: comp === 'band' ? 'rect' : null };
    }

    const flower = FLOWERS[motif] || peony;
    if (comp === 'broken') {
      shapes = brokenBranch(r, cx, cy, 66, flower);
      // 折枝再补一朵小蕾
      return { shapes: shapes, frame: null };
    }
    if (comp === 'wrap') {
      shapes = vine(r, cx, cy, 132, 30);
      shapes = shapes.concat(flower(r, cx - 8, cy - 6, 44));
      shapes.push({ t: 'stem', d: 'M' + pt(cx - 6, cy + 34) + ' q' + pt(30, 26) + ' ' + pt(56, 6) });
      return { shapes: shapes, frame: null };
    }
    if (comp === 'scatter') {
      const pts = [[62, 62, 40], [140, 78, 34], [92, 146, 30], [146, 148, 22]];
      pts.forEach((p, i) => {
        if (i === 3 && r() > 0.6) return;
        shapes = shapes.concat(flower(r, p[0], p[1], p[2] * rr(r, 0.9, 1.1)));
        shapes.push({ t: 'solid', d: leaf(p[2] * 0.3, p[2] * 0.66), tf: T(null, p[0] - p[2] * 0.5, p[1] + p[2] * 0.5, rr(r, 30, 70)) });
      });
      return { shapes: shapes, frame: null };
    }
    if (comp === 'band') {
      for (let i = 0; i < 3; i++) {
        const x = 34 + i * 66;
        shapes = shapes.concat(flower(r, x, cy + (i % 2 ? -12 : 6), 30));
      }
      shapes.push({ t: 'stem', d: 'M16 ' + n(cy + 40) + ' q' + pt(60, -40) + ' ' + pt(168, 0) });
      shapes = shapes.concat(vine(r, cx, cy - 46, 168, 14));
      return { shapes: shapes, frame: 'rect' };
    }
    if (comp === 'medallion') {
      shapes = [{ t: 'ring', cx: cx, cy: cy, r: 88 }].concat(flower(r, cx, cy, 62));
      const petals = ri(r, 10, 14);
      for (let i = 0; i < petals; i++) {
        const a = (i / petals) * Math.PI * 2;
        shapes.push({
          t: 'solid',
          d: petalSharp(9, 24),
          tf: 'translate(' + n(cx) + ' ' + n(cy) + ') rotate(' + n((a * 180) / Math.PI) + ') translate(0 -84)'
        });
      }
      return { shapes: shapes, frame: null };
    }
    // single / cluster
    if (comp === 'cluster') {
      shapes = flower(r, cx - 6, cy - 10, 52);
      shapes = shapes.concat(flower(r, cx + 54, cy + 40, 26));
      shapes = shapes.concat(flower(r, cx - 56, cy + 46, 20));
      shapes.push({ t: 'stem', d: 'M' + pt(cx - 60, cy + 62) + ' q' + pt(30, 18) + ' ' + pt(64, -6) });
      shapes.push({ t: 'stem', d: 'M' + pt(cx + 10, cy + 46) + ' q' + pt(24, 22) + ' ' + pt(46, -4) });
      shapes.push({ t: 'solid', d: leaf(15, 34), tf: T(null, cx + 22, cy + 68, 46) });
      shapes.push({ t: 'solid', d: leaf(13, 30), tf: T(null, cx - 30, cy + 74, -40) });
      return { shapes: shapes, frame: null };
    }
    // 单独纹样
    shapes = flower(r, cx, cy + 4, 66);
    if (r() > 0.45) {
      shapes.push({ t: 'solid', d: leaf(16, 40), tf: T(null, cx - 44, cy + 62, -52) });
      shapes.push({ t: 'solid', d: leaf(15, 36), tf: T(null, cx + 46, cy + 60, 52) });
      shapes.push({ t: 'stem', d: 'M' + pt(cx - 40, cy + 66) + ' q' + pt(38, 20) + ' ' + pt(78, -4) });
    }
    return { shapes: shapes, frame: null };
  }

  function serialize(shapes, line) {
    let out = '';
    shapes.forEach((s) => {
      if (s.t === 'ring') {
        out += '<circle cx="' + n(s.cx) + '" cy="' + n(s.cy) + '" r="' + n(s.r) + '" fill="none" stroke="currentColor" stroke-width="' +
          (line ? 2 : 3) + '"' + (line ? '' : ' opacity=".9"') + '/>';
        return;
      }
      const tf = s.tf ? ' transform="' + s.tf + '"' : '';
      if (s.t === 'solid') {
        out += line
          ? '<path d="' + s.d + '" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"' + tf + '/>'
          : '<path d="' + s.d + '" fill="currentColor" stroke="var(--art-gap,#fff)" stroke-width="1.5" stroke-linejoin="round"' + tf + '/>';
      } else if (s.t === 'vein') {
        out += '<path d="' + s.d + '" fill="' + (line ? 'none' : 'none') + '" stroke="' +
          (line ? 'currentColor' : 'var(--art-gap,#fff)') + '" stroke-width="' + (s.sw || 1.4) +
          '" stroke-linecap="round" opacity="' + (line ? '.5' : '.85') + '"' + tf + '/>';
      } else if (s.t === 'stem') {
        out += '<path d="' + s.d + '" fill="none" stroke="currentColor" stroke-width="' +
          (line ? 1.5 : 3.4) + '" stroke-linecap="round" stroke-linejoin="round"' + tf + '/>';
      }
    });
    return out;
  }

  function motifBody(spec) {
    const r = rng(spec.seed || 'seed');
    const built = motifShapes(r, spec);
    const line = !!spec.line;
    let frame = '';
    if (built.frame === 'rect') {
      frame = '<rect x="8" y="14" width="184" height="172" rx="10" fill="none" stroke="currentColor" stroke-width="' +
        (line ? 1.5 : 2.6) + '" opacity=".85"/>';
      if (!line) {
        frame += '<rect x="14" y="20" width="172" height="160" rx="7" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/>';
      }
    }
    return { inner: frame + serialize(built.shapes, line), line: line };
  }

  Art.motif = function (spec) {
    spec = spec || {};
    const photo = spec.photo || Art.photos.motif[spec.seed];
    if (photo) return photoTag(photo, spec.alt || '', 'art--motif');
    const body = motifBody(spec);
    const cls = 'art art--motif' + (body.line ? ' art--line' : '');
    return '<svg class="' + cls + '" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' +
      body.inner + '</svg>';
  };

  /* ------------------------- 器物表面效果（模拟实物照片） ------------------------- */
  const WARE_SHAPE = {
    plate: '<ellipse cx="150" cy="150" rx="128" ry="128"/>',
    bowl: '<path d="M22 108h256c0 78-52 140-128 140S22 186 22 108Z"/>',
    jar: '<path d="M96 34h108c14 0 20 10 14 22-16 30-22 54-22 92s8 62 24 92c6 12 0 22-14 22H94c-14 0-20-10-14-22 16-30 24-54 24-92s-8-62-24-92c-6-12 0-22 14-22Z"/>',
    pillow: '<rect x="34" y="72" width="232" height="156" rx="46"/>',
    sherd: '<path d="M52 78 128 42l104 22 30 92-58 82-116-6-42-84Z"/>'
  };

  Art.onWare = function (seed, spec, ware) {
    const id = uid('ow');
    const r = rng('ware-' + seed);
    const body = motifBody(Object.assign({}, spec, { seed: spec.seed + '-w' }));
    const shape = WARE_SHAPE[ware] || WARE_SHAPE.plate;
    const scale = ware === 'jar' ? 0.62 : ware === 'sherd' ? 0.72 : 0.8;
    const size = 200 * scale;
    const off = (300 - size) / 2 + (ware === 'jar' ? -4 : 0);
    return '<svg class="art art--ware" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"' +
      ' style="--art-gap:#d9d4cc">' +
      '<defs>' +
      '<linearGradient id="' + id + 'bg" x1="0" y1="0" x2=".3" y2="1">' +
      '<stop offset="0" stop-color="#f2efea"/><stop offset="1" stop-color="#c9c3bb"/></linearGradient>' +
      '<linearGradient id="' + id + 'w" x1=".1" y1="0" x2=".9" y2="1">' +
      '<stop offset="0" stop-color="#f6f4f0"/><stop offset=".5" stop-color="#e3ded6"/><stop offset="1" stop-color="#cbc5bc"/></linearGradient>' +
      '<radialGradient id="' + id + 'hi" cx=".34" cy=".26" r=".6">' +
      '<stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'v" cx=".5" cy=".45" r=".78"><stop offset=".5" stop-color="#000" stop-opacity="0"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>' +
      '<clipPath id="' + id + 'c">' + shape + '</clipPath>' +
      grainDefs(id + 'g') +
      '</defs>' +
      '<rect width="300" height="300" fill="url(#' + id + 'bg)"/>' +
      '<g filter="url(#' + id + 'g)">' +
      '<g transform="translate(7 9)" opacity=".18" fill="#3a352f">' + shape + '</g>' +
      '<g fill="url(#' + id + 'w)" stroke="#8f8a83" stroke-width="1.4">' + shape + '</g>' +
      '<g clip-path="url(#' + id + 'c)">' +
      '<svg x="' + n(off) + '" y="' + n(off) + '" width="' + n(size) + '" height="' + n(size) + '" viewBox="0 0 200 200">' +
      '<g opacity=".92" style="color:#201e1c">' + body.inner + '</g></svg>' +
      '<rect width="300" height="300" fill="url(#' + id + 'hi)"/>' +
      '<rect width="300" height="300" fill="#b9b3aa" opacity=".12"/>' +
      '</g>' +
      '<g fill="none" stroke="#f7f5f1" stroke-width="2.4" opacity=".5">' + shape + '</g>' +
      '</g>' +
      '<rect width="300" height="300" fill="url(#' + id + 'v)"/>' +
      '</svg>';
  };

  // 连续纹样（语料范本：像织物 / 壁纸的重复单元）
  Art.tile = function (seed, spec, cols, rows) {
    const id = uid('tl');
    cols = cols || 3; rows = rows || 3;
    const cw = 300 / cols, ch = 300 / rows;
    let cells = '';
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const b = motifBody(Object.assign({}, spec, { seed: spec.seed + '-' + i + '-' + j, line: false }));
        cells += '<svg x="' + n(i * cw) + '" y="' + n(j * ch) + '" width="' + n(cw) + '" height="' + n(ch) +
          '" viewBox="0 0 200 200"><g opacity=".9" style="color:#211f1d">' + b.inner + '</g></svg>';
      }
    }
    return '<svg class="art art--tile" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"' +
      ' style="--art-gap:#c7c1b8">' +
      '<defs><linearGradient id="' + id + 'b" x1="0" y1="0" x2=".4" y2="1">' +
      '<stop offset="0" stop-color="#ded9d1"/><stop offset="1" stop-color="#b4aea6"/></linearGradient>' +
      '<radialGradient id="' + id + 'v" cx=".5" cy=".45" r=".8"><stop offset=".5" stop-color="#000" stop-opacity="0"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity=".34"/></radialGradient>' +
      grainDefs(id + 'g') + '</defs>' +
      '<rect width="300" height="300" fill="url(#' + id + 'b)"/>' +
      '<g filter="url(#' + id + 'g)">' + cells + '</g>' +
      '<rect width="300" height="300" fill="url(#' + id + 'v)"/>' +
      '</svg>';
  };

  /* ---------------------------------- 场景插画（灰度） --------------------------------- */
  function grainDefs(id) {
    return '<filter id="' + id + '" x="-6%" y="-6%" width="112%" height="112%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="' + (uidSeq % 40) + '" result="n"/>' +
      '<feColorMatrix in="n" type="saturate" values="0"/>' +
      '<feComponentTransfer><feFuncA type="linear" slope="0.14"/></feComponentTransfer>' +
      '<feComposite operator="over" in2="SourceGraphic"/></filter>';
  }

  const CRAFT_BUILDERS = {
    // 馒头窑剖面
    kiln: function (r, ink, gray, dark) {
      let s = '';
      s += '<path d="M40 250 q0 -120 110 -120 q110 0 110 120Z" fill="' + gray[0] + '"/>';
      s += '<path d="M40 250 q0 -120 110 -120 q110 0 110 120" fill="none" stroke="' + ink + '" stroke-width="2.4"/>';
      s += '<path d="M60 250 q4 -96 90 -96 q86 0 90 96" fill="none" stroke="' + ink + '" stroke-width="1.2" opacity=".55"/>';
      // 砖缝
      for (let i = 0; i < 7; i++) {
        const y = 250 - i * 15;
        const w = 150 - i * 16;
        s += '<path d="M' + n(150 - w / 2) + ' ' + n(y) + ' H' + n(150 + w / 2) + '" stroke="' + ink + '" stroke-width=".9" opacity=".35"/>';
      }
      // 窑门
      s += '<path d="M118 250 v-34 a32 32 0 0 1 64 0 v34Z" fill="' + dark + '"/>';
      s += '<path d="M118 250 v-34 a32 32 0 0 1 64 0 v34" fill="none" stroke="' + ink + '" stroke-width="1.6"/>';
      // 火焰
      s += '<path d="M150 244 q-14 -12 -4 -26 q2 10 8 10 q-2 -14 8 -22 q-4 16 6 22 q8 8 -2 16Z" fill="#f2f0ec" opacity=".9"/>';
      // 烟囱
      s += '<path d="M128 130 v-46 h44 v46" fill="' + gray[1] + '" stroke="' + ink + '" stroke-width="2"/>';
      s += '<path d="M124 84 h52 l-6 -12 h-40Z" fill="' + dark + '"/>';
      for (let i = 0; i < 3; i++) {
        s += '<path d="M150 ' + (72 - i * 22) + ' q' + (14 + i * 6) + ' -10 ' + (2 + i * 4) + ' -22" fill="none" stroke="' + ink +
          '" stroke-width="1.6" opacity="' + (0.45 - i * 0.1) + '" stroke-linecap="round"/>';
      }
      // 地面
      s += '<path d="M8 250 H292" stroke="' + ink + '" stroke-width="2.2"/>';
      for (let i = 0; i < 26; i++) {
        const x = 10 + i * 11 + r() * 5;
        s += '<path d="M' + n(x) + ' 250 l' + n(r() * 6 - 3) + ' 10" stroke="' + ink + '" stroke-width="1" opacity=".4"/>';
      }
      return s;
    },
    // 作坊遗址：石墙 + 拱门
    workshop: function (r, ink, gray, dark) {
      let s = '';
      s += '<rect x="26" y="96" width="248" height="164" fill="' + gray[0] + '"/>';
      s += '<rect x="26" y="96" width="248" height="164" fill="none" stroke="' + ink + '" stroke-width="2.2"/>';
      // 石块
      let y = 200;
      for (let row = 0; row < 6; row++) {
        let x = 26 + (row % 2 ? -12 : 0);
        while (x < 274) {
          const w = 22 + r() * 26, h = 24 + r() * 8;
          s += '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" fill="' + gray[1 + (row % 2)] +
            '" stroke="' + ink + '" stroke-width=".9" opacity=".9" rx="3"/>';
          x += w + 3;
        }
        y -= 26;
      }
      // 拱门
      s += '<path d="M112 260 v-56 a38 38 0 0 1 76 0 v56Z" fill="' + dark + '"/>';
      s += '<path d="M112 260 v-56 a38 38 0 0 1 76 0 v56" fill="none" stroke="' + ink + '" stroke-width="1.8"/>';
      s += '<path d="M104 204 q46 -30 92 0" fill="none" stroke="' + ink + '" stroke-width="1.4" opacity=".6"/>';
      // 檐与瓦
      s += '<path d="M16 96 h268 l-16 -22 q-118 -18 -236 0Z" fill="' + dark + '"/>';
      s += '<path d="M16 96 h268 l-16 -22 q-118 -18 -236 0Z" fill="none" stroke="' + ink + '" stroke-width="2"/>';
      for (let i = 0; i < 12; i++) {
        s += '<path d="M' + n(34 + i * 22) + ' ' + n(78 + Math.abs(6 - i) * 1.6) + ' v' + n(16 - Math.abs(6 - i)) +
          '" stroke="' + ink + '" stroke-width="1" opacity=".5"/>';
      }
      // 远处树
      s += '<path d="M282 260 v-40" stroke="' + ink + '" stroke-width="2.4"/>';
      for (let i = 0; i < 9; i++) {
        const a = r() * Math.PI * 2, rad = 12 + r() * 22;
        s += '<ellipse cx="' + n(282 + Math.cos(a) * rad) + '" cy="' + n(208 + Math.sin(a) * rad * 0.7) + '" rx="' + n(10 + r() * 8) +
          '" ry="' + n(7 + r() * 6) + '" fill="' + gray[2] + '" opacity=".75"/>';
      }
      s += '<path d="M8 260 H292" stroke="' + ink + '" stroke-width="2.2"/>';
      s += '<path d="M8 264 q140 -8 284 0 v14 H8Z" fill="' + gray[1] + '" opacity=".8"/>';
      return s;
    },
    // 拉坯
    wheel: function (r, ink, gray, dark) {
      let s = '';
      // 背景坯架
      s += '<rect x="222" y="96" width="70" height="104" fill="none" stroke="' + ink + '" stroke-width="2"/>';
      for (let i = 0; i < 3; i++) {
        s += '<path d="M222 ' + (122 + i * 28) + ' H292" stroke="' + ink + '" stroke-width="1.3" opacity=".65"/>';
        s += '<path d="M' + (232 + i * 5) + ' ' + (122 + i * 28) + ' q9 -13 18 0 q9 -10 16 0Z" fill="' + dark + '" opacity=".8"/>';
      }
      // 地面
      s += '<rect x="8" y="214" width="284" height="52" fill="' + gray[1] + '"/>';
      s += '<path d="M8 214 H292" stroke="' + ink + '" stroke-width="2"/>';
      // 辘轳：底座 + 轴 + 轮盘
      s += '<path d="M118 258 h64 l-10 -18 h-44Z" fill="' + dark + '" stroke="' + ink + '" stroke-width="1.6"/>';
      s += '<path d="M150 240 v-30" stroke="' + ink + '" stroke-width="5"/>';
      s += '<ellipse cx="150" cy="212" rx="98" ry="20" fill="' + gray[2] + '" stroke="' + ink + '" stroke-width="2"/>';
      s += '<ellipse cx="150" cy="206" rx="98" ry="20" fill="' + gray[0] + '" stroke="' + ink + '" stroke-width="2"/>';
      s += '<ellipse cx="150" cy="206" rx="66" ry="13" fill="none" stroke="' + ink + '" stroke-width="1" opacity=".45"/>';
      s += '<ellipse cx="150" cy="206" rx="34" ry="7" fill="none" stroke="' + ink + '" stroke-width="1" opacity=".35"/>';
      // 坯体（拉高的瓶）
      s += '<path d="M132 202 q-10 -30 5 -48 q-7 -14 5 -18 h16 q12 4 5 18 q15 18 5 48Z" fill="' + dark + '"/>';
      s += '<path d="M132 202 q-10 -30 5 -48 q-7 -14 5 -18 h16 q12 4 5 18 q15 18 5 48" fill="none" stroke="' + ink + '" stroke-width="1.6"/>';
      for (let i = 0; i < 5; i++) {
        s += '<path d="M' + n(133 + i * 0.8) + ' ' + n(194 - i * 10) + ' q' + n(17) + ' -5 ' + n(34) + ' 0" fill="none" stroke="#f4f2ee" stroke-width="1" opacity=".5"/>';
      }
      // 双手（细剪影 + 指缝留白）
      s += '<path d="M112 162 q14 -14 28 -6 q10 6 4 15 q-8 10 -22 6 q-12 -4 -10 -15Z" fill="' + ink + '"/>';
      s += '<path d="M188 162 q-14 -14 -28 -6 q-10 6 -4 15 q8 10 22 6 q12 -4 10 -15Z" fill="' + ink + '"/>';
      for (let i = 0; i < 3; i++) {
        s += '<path d="M124 ' + (160 + i * 5) + ' q8 2 14 -1" stroke="#f4f2ee" stroke-width="1" opacity=".5" fill="none"/>';
        s += '<path d="M176 ' + (160 + i * 5) + ' q-8 2 -14 -1" stroke="#f4f2ee" stroke-width="1" opacity=".5" fill="none"/>';
      }
      // 水盆
      s += '<ellipse cx="46" cy="222" rx="30" ry="9" fill="' + gray[0] + '" stroke="' + ink + '" stroke-width="1.6"/>';
      s += '<ellipse cx="46" cy="219" rx="22" ry="6" fill="#f4f2ee" opacity=".85"/>';
      s += '<path d="M46 228 v10" stroke="' + ink + '" stroke-width="2"/>';
      return s;
    },
    // 匣钵与窑具
    saggars: function (r, ink, gray, dark) {
      let s = '';
      s += '<rect x="8" y="216" width="284" height="50" fill="' + gray[1] + '"/>';
      s += '<path d="M8 216 H292" stroke="' + ink + '" stroke-width="2"/>';
      for (let i = 0; i < 3; i++) {
        const x = 44 + i * 92, h = 58 + i * 4;
        s += '<rect x="' + x + '" y="' + n(216 - h) + '" width="70" height="' + h + '" rx="6" fill="' + gray[0] + '" stroke="' + ink + '" stroke-width="2"/>';
        s += '<rect x="' + (x - 5) + '" y="' + n(216 - h - 10) + '" width="80" height="12" rx="4" fill="' + dark + '" stroke="' + ink + '" stroke-width="1.6"/>';
        s += '<path d="M' + (x + 8) + ' ' + n(216 - h + 12) + ' h54" stroke="' + ink + '" stroke-width="1" opacity=".45"/>';
        s += '<ellipse cx="' + (x + 35) + '" cy="' + n(216 - h - 14) + '" rx="26" ry="7" fill="' + gray[2] + '" stroke="' + ink + '" stroke-width="1.4"/>';
      }
      // 散落瓷碗
      s += '<path d="M156 250 q0 -22 22 -22 q22 0 22 22Z" fill="' + dark + '"/>';
      s += '<ellipse cx="178" cy="228" rx="22" ry="6" fill="' + gray[2] + '" stroke="' + ink + '" stroke-width="1.4"/>';
      s += '<ellipse cx="248" cy="252" rx="26" ry="8" fill="' + gray[0] + '" stroke="' + ink + '" stroke-width="1.4"/>';
      s += '<ellipse cx="248" cy="249" rx="18" ry="5" fill="#f2f0ec"/>';
      return s;
    },
    // 瓷片堆积
    shards: function (r, ink, gray, dark) {
      let s = '';
      s += '<path d="M8 244 q60 -26 140 -22 q80 4 144 22 v22 H8Z" fill="' + gray[1] + '"/>';
      s += '<path d="M8 244 q60 -26 140 -22 q80 4 144 22" fill="none" stroke="' + ink + '" stroke-width="1.6" opacity=".7"/>';
      for (let i = 0; i < 16; i++) {
        const cx2 = 24 + r() * 252, cy2 = 150 + r() * 90, w = 22 + r() * 34, h = 14 + r() * 22, a = r() * 360;
        s += '<g transform="translate(' + n(cx2) + ' ' + n(cy2) + ') rotate(' + n(a) + ')">' +
          '<path d="M' + n(-w / 2) + ' ' + n(h / 3) + ' l' + n(w * 0.2) + ' ' + n(-h) + ' l' + n(w * 0.7) + ' ' + n(h * 0.2) +
          ' l' + n(w * 0.1) + ' ' + n(h * 0.8) + 'Z" fill="' + (i % 3 === 0 ? dark : gray[0]) + '" stroke="' + ink + '" stroke-width="1.2"/>' +
          '<path d="M' + n(-w * 0.1) + ' ' + n(-h * 0.4) + ' q' + n(w * 0.2) + ' ' + n(-h * 0.3) + ' ' + n(w * 0.4) + ' ' + n(h * 0.1) +
          '" fill="none" stroke="#f4f2ee" stroke-width="1.4" opacity=".8"/></g>';
      }
      for (let i = 0; i < 10; i++) {
        const cx2 = 20 + r() * 260, cy2 = 232 + r() * 24;
        s += '<ellipse cx="' + n(cx2) + '" cy="' + n(cy2) + '" rx="' + n(8 + r() * 14) + '" ry="' + n(3 + r() * 5) + '" fill="' + gray[2] + '" opacity=".8"/>';
      }
      return s;
    },
    // 施釉
    glaze: function (r, ink, gray, dark) {
      let s = '';
      // 釉缸
      s += '<path d="M56 158 h188 l-14 104 H70Z" fill="' + gray[0] + '" stroke="' + ink + '" stroke-width="2.2"/>';
      s += '<path d="M48 150 h204 v14 H48Z" fill="' + dark + '" stroke="' + ink + '" stroke-width="1.8"/>';
      s += '<path d="M72 200 q78 16 156 0 v30 q-78 18 -156 0Z" fill="' + gray[2] + '" opacity=".9"/>';
      s += '<ellipse cx="150" cy="200" rx="76" ry="11" fill="#eceae5" opacity=".9"/>';
      s += '<ellipse cx="150" cy="200" rx="52" ry="7" fill="' + gray[2] + '" opacity=".7"/>';
      // 夹持的碗（浸釉中）
      s += '<path d="M118 176 q-6 -32 32 -32 q38 0 32 32Z" fill="' + dark + '"/>';
      s += '<path d="M118 176 q32 12 64 0" fill="none" stroke="' + ink + '" stroke-width="1.4"/>';
      for (let i = 0; i < 5; i++) {
        s += '<path d="M' + n(124 + i * 13) + ' 176 q2 14 6 24" stroke="#f4f2ee" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>';
      }
      s += '<path d="M150 144 v-30 M150 114 l-16 -14 M150 114 l16 -14" stroke="' + ink + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
      // 釉滴
      for (let i = 0; i < 10; i++) {
        const x = 84 + r() * 132, y = 216 + r() * 38;
        s += '<path d="M' + n(x) + ' ' + n(y) + ' q4 14 0 18 q-4 -4 0 -18Z" fill="' + ink + '" opacity=".3"/>';
      }
      // 侧面已施釉的器物
      s += '<path d="M258 258 q-8 -22 6 -30 q-4 -10 6 -12 h12 q10 2 6 12 q14 8 6 30Z" fill="' + dark + '" opacity=".92" stroke="' + ink + '" stroke-width="1.4"/>';
      s += '<ellipse cx="278" cy="258" rx="18" ry="6" fill="' + gray[2] + '" stroke="' + ink + '" stroke-width="1.2"/>';
      s += '<ellipse cx="42" cy="254" rx="26" ry="9" fill="' + gray[0] + '" stroke="' + ink + '" stroke-width="1.4"/>';
      s += '<ellipse cx="42" cy="250" rx="17" ry="5" fill="#f2f0ec"/>';
      s += '<rect x="8" y="262" width="284" height="14" fill="' + gray[1] + '"/>';
      return s;
    },
    // 练泥
    clay: function (r, ink, gray, dark) {
      let s = '';
      // 泥凳
      s += '<rect x="30" y="196" width="240" height="16" rx="4" fill="' + gray[0] + '" stroke="' + ink + '" stroke-width="2"/>';
      s += '<path d="M54 212 v52 M246 212 v52" stroke="' + ink + '" stroke-width="5"/>';
      s += '<path d="M40 264 h220" stroke="' + ink + '" stroke-width="2"/>';
      // 泥料堆
      s += '<path d="M46 196 q-4 -34 40 -40 q46 -6 62 22 q10 12 6 18Z" fill="' + gray[2] + '" stroke="' + ink + '" stroke-width="1.8"/>';
      for (let i = 0; i < 7; i++) {
        s += '<path d="M' + n(58 + r() * 80) + ' ' + n(162 + r() * 30) + ' q' + n(10 + r() * 16) + ' ' + n(r() * 12 - 6) + ' ' + n(26) + ' ' + n(r() * 8 - 4) +
          '" fill="none" stroke="' + ink + '" stroke-width="1" opacity=".38"/>';
      }
      // 泥条（盘筑用）
      for (let i = 0; i < 3; i++) {
        const y = 190 - i * 11;
        s += '<path d="M168 ' + y + ' q10 -10 22 0 t22 0 t22 0" fill="none" stroke="' + dark + '" stroke-width="10" stroke-linecap="round" opacity=".95"/>';
        s += '<path d="M168 ' + y + ' q10 -10 22 0 t22 0 t22 0" fill="none" stroke="#f4f2ee" stroke-width="1.4" opacity=".35"/>';
      }
      // 木槌
      s += '<path d="M214 152 l30 34" stroke="' + ink + '" stroke-width="4.5" stroke-linecap="round"/>';
      s += '<rect x="236" y="176" width="34" height="20" rx="7" fill="' + dark + '" stroke="' + ink + '" stroke-width="1.6" transform="rotate(34 253 186)"/>';
      // 水桶
      s += '<path d="M20 244 h34 l-5 22 H25Z" fill="' + gray[1] + '" stroke="' + ink + '" stroke-width="1.6"/>';
      s += '<ellipse cx="37" cy="244" rx="17" ry="5" fill="#f0eee9" stroke="' + ink + '" stroke-width="1.2"/>';
      return s;
    },
    // 柴垛与窑口火
    fuel: function (r, ink, gray, dark) {
      let s = '';
      s += '<path d="M8 252 H292" stroke="' + ink + '" stroke-width="2"/>';
      s += '<rect x="8" y="252" width="284" height="20" fill="' + gray[1] + '" opacity=".8"/>';
      // 码放的柴垛
      for (let row = 0; row < 6; row++) {
        const y = 250 - row * 19;
        const cnt = 7 - Math.floor(row / 2);
        for (let i = 0; i < cnt; i++) {
          const x = 26 + i * 34 + (row % 2 ? 16 : 0);
          if (x > 178) continue;
          s += '<rect x="' + n(x) + '" y="' + n(y - 16) + '" width="30" height="16" rx="7.5" fill="' + gray[(row + i) % 3] +
            '" stroke="' + ink + '" stroke-width="1.1" opacity=".95"/>';
          s += '<ellipse cx="' + n(x + 2.5) + '" cy="' + n(y - 8) + '" rx="2.6" ry="6.4" fill="#efece7" opacity=".85"/>';
        }
      }
      // 窑口与火
      s += '<path d="M206 252 v-34 a34 34 0 0 1 68 0 v34Z" fill="' + dark + '" stroke="' + ink + '" stroke-width="2"/>';
      s += '<path d="M220 252 q-8 -22 14 -32 q-2 12 8 14 q-4 -12 12 -18 q-6 18 6 22 q10 6 -2 14Z" fill="#f2f0ec" opacity=".95"/>';
      s += '<path d="M240 252 q-4 -14 10 -20 q-2 10 6 12 q-2 -10 8 -14 q-2 14 6 18Z" fill="' + gray[2] + '" opacity=".75"/>';
      for (let i = 0; i < 3; i++) {
        s += '<path d="M240 ' + (206 - i * 26) + ' q' + n(16 + i * 8) + ' -12 ' + n(2 + i * 6) + ' -24" fill="none" stroke="' + ink +
          '" stroke-width="1.6" opacity="' + n(0.4 - i * 0.1) + '" stroke-linecap="round"/>';
      }
      return s;
    },
    // 遗址博物馆建筑
    museum: function (r, ink, gray, dark) {
      let s = '';
      s += '<path d="M8 250 H292" stroke="' + ink + '" stroke-width="2"/>';
      s += '<rect x="60" y="150" width="180" height="100" fill="' + gray[0] + '" stroke="' + ink + '" stroke-width="2.2"/>';
      // 大屋顶
      s += '<path d="M30 150 h240 l-30 -34 q-90 -16 -180 0Z" fill="' + dark + '" stroke="' + ink + '" stroke-width="2"/>';
      s += '<path d="M46 138 q104 -22 208 0" fill="none" stroke="#f4f2ee" stroke-width="1.4" opacity=".5"/>';
      s += '<path d="M150 116 v-18" stroke="' + ink + '" stroke-width="3"/>';
      s += '<circle cx="150" cy="94" r="7" fill="' + dark + '"/>';
      // 廊柱与门
      s += '<rect x="78" y="166" width="14" height="84" fill="' + gray[2] + '" stroke="' + ink + '" stroke-width="1.4"/>';
      s += '<rect x="208" y="166" width="14" height="84" fill="' + gray[2] + '" stroke="' + ink + '" stroke-width="1.4"/>';
      s += '<rect x="126" y="176" width="48" height="74" rx="4" fill="' + dark + '"/>';
      s += '<path d="M150 176 v74 M126 206 h48" stroke="#f4f2ee" stroke-width="1.4" opacity=".6"/>';
      // 台阶
      s += '<path d="M112 250 h76 v-8 h-76Z M104 258 h92 v-8 h-92Z" fill="' + gray[1] + '" stroke="' + ink + '" stroke-width="1.2"/>';
      // 参观者
      s += '<g opacity=".85">' + figure(r, 108, 232, 30, { prop: null, tuft: false }) + '</g>';
      s += '<g opacity=".85">' + figure(r, 196, 234, 28, { prop: 'ball', tuft: false }) + '</g>';
      // 树
      s += '<path d="M268 250 v-46" stroke="' + ink + '" stroke-width="2.6"/>';
      for (let i = 0; i < 8; i++) {
        const a = r() * Math.PI * 2, rad = 12 + r() * 20;
        s += '<ellipse cx="' + n(268 + Math.cos(a) * rad) + '" cy="' + n(196 + Math.sin(a) * rad * 0.7) + '" rx="' + n(9 + r() * 8) +
          '" ry="' + n(6 + r() * 6) + '" fill="' + gray[2] + '" opacity=".7"/>';
      }
      return s;
    }
  };

  Art.craft = function (kind, seed) {
    if (Art.photos.scene[kind]) return photoTag(Art.photos.scene[kind], kind, 'art--scene');
    const r = rng('craft-' + kind + '-' + (seed || ''));
    const id = uid('gf');
    const ink = '#1e1c1a';
    const gray = ['#b9b4ad', '#cdc8c1', '#8f8a83'];
    const dark = '#3a3632';
    const build = CRAFT_BUILDERS[kind] || CRAFT_BUILDERS.kiln;
    return '<svg class="art art--scene" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#f2f0ec"/><stop offset="1" stop-color="#d6d1ca"/></linearGradient>' +
      '<radialGradient id="' + id + 'v" cx=".5" cy=".42" r=".78">' +
      '<stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></radialGradient>' +
      grainDefs(id + 'g') + '</defs>' +
      '<rect width="300" height="300" fill="url(#' + id + 'b)"/>' +
      '<g filter="url(#' + id + 'g)">' + build(r, ink, gray, dark) + '</g>' +
      '<rect width="300" height="300" fill="url(#' + id + 'v)"/>' +
      '</svg>';
  };

  Art.scene = function (kind, seed) { return Art.craft(kind, seed); };

  /* ---------------------------------- 意象大图（首页轮播 / 头部背景） ---------------------------------- */
  Art.hero = function (seed, variant) {
    if (Art.photos.hero[seed]) return photoTag(Art.photos.hero[seed], variant || '', 'art--hero');
    const r = rng('hero-' + seed + '-' + (variant || ''));
    const id = uid('hg');
    // 深色水墨层：山影 / 云雾 / 遗址剪影（对应设计稿「深色照片 + 白字」）
    let s = '';
    const layers = [
      { y: 250, amp: 84, c: '#4a4640' },
      { y: 292, amp: 74, c: '#3a3733' },
      { y: 340, amp: 62, c: '#2a2825' },
      { y: 396, amp: 54, c: '#191817' },
      { y: 452, amp: 40, c: '#0d0d0c' }
    ];
    layers.forEach((L, i) => {
      s += '<path d="' + ridge(r, L.y, L.amp, -30, 430, 34, 480) + '" fill="' + L.c + '"/>';
      if (i < 4) {
        for (let k = 0; k < 3; k++) {
          s += '<ellipse cx="' + n(30 + r() * 350) + '" cy="' + n(L.y + 14 + r() * 20) + '" rx="' + n(80 + r() * 120) +
            '" ry="' + n(6 + r() * 9) + '" fill="#cfc9c1" opacity="' + n(0.08 + r() * 0.14) + '"/>';
        }
      }
    });
    // 月（放在中上部偏左，避开顶部标题与搜索按钮）
    s += '<circle cx="' + n(58 + r() * 74) + '" cy="' + n(150 + r() * 46) + '" r="' + n(20 + r() * 12) + '" fill="#e8e3db" opacity=".18"/>';
    // 山脊高光笔触
    for (let i = 0; i < 16; i++) {
      const x = 16 + r() * 370, y = 320 + r() * 120, len = 26 + r() * 60;
      s += '<path d="M' + n(x) + ' ' + n(y) + ' q' + n(len * 0.4) + ' ' + n(-len * 0.26) + ' ' + n(len) + ' ' + n(-len * 0.12) +
        '" fill="none" stroke="#b7b1a8" stroke-width="' + n(0.9 + r() * 1.2) + '" opacity="' + n(0.08 + r() * 0.16) + '" stroke-linecap="round"/>';
    }
    // 遗址剪影
    let sil = '';
    if (variant === 'kiln' || variant === 'a') {
      sil = '<g transform="translate(206 468)">' +
        CRAFT_BUILDERS.kiln(r, '#0b0b0a', ['#141312', '#191817', '#0b0b0a'], '#070706').replace(/fill="#f2f0ec"/g, 'fill="#d8d2c9" opacity=".55"') +
        '</g>';
    } else if (variant === 'museum') {
      sil = '<g transform="translate(38 470) scale(1.15)">' +
        CRAFT_BUILDERS.museum(r, '#0b0b0a', ['#131211', '#191817', '#0f0e0d'], '#080807').replace(/stroke="#f4f2ee"/g, 'stroke="#b9b3aa" opacity=".35"') +
        '</g>';
    } else if (variant === 'shards') {
      sil = '<g transform="translate(150 452) scale(1.1)">' +
        CRAFT_BUILDERS.shards(r, '#0b0b0a', ['#171614', '#1e1c1a', '#0f0e0d'], '#0b0b0a') + '</g>';
    } else {
      sil = '<g transform="translate(120 456) scale(1.05)">' +
        CRAFT_BUILDERS.saggars(r, '#0b0b0a', ['#141312', '#1b1a18', '#0f0e0d'], '#0b0b0a') + '</g>';
    }
    // 前景山脊遮挡，让剪影有层次
    s += sil;
    s += '<path d="' + ridge(r, 470, 30, -30, 430, 40, 500) + '" fill="#0a0a09"/>';
    for (let i = 0; i < 5; i++) {
      const x = 20 + r() * 360, y = 120 + r() * 130, w = 5 + r() * 5;
      s += '<path d="M' + n(x) + ' ' + n(y) + ' q' + n(w) + ' ' + n(-w * 0.8) + ' ' + n(w * 2) + ' 0 M' + n(x + w * 2) + ' ' + n(y) +
        ' q' + n(w) + ' ' + n(-w * 0.8) + ' ' + n(w * 2) + ' 0" fill="none" stroke="#cfc9c1" stroke-width="1.2" opacity=".28" stroke-linecap="round"/>';
    }
    return '<svg class="art art--hero" viewBox="0 0 400 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="' + id + 's" x1="0" y1="0" x2="0.2" y2="1">' +
      '<stop offset="0" stop-color="#37342f"/><stop offset=".5" stop-color="#232120"/><stop offset="1" stop-color="#0c0c0b"/></linearGradient>' +
      '<radialGradient id="' + id + 'v" cx=".42" cy=".3" r=".8"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>' +
      grainDefs(id + 'g') + '</defs>' +
      '<rect width="400" height="480" fill="url(#' + id + 's)"/>' +
      '<g filter="url(#' + id + 'g)">' + s + '</g>' +
      '<rect width="400" height="480" fill="url(#' + id + 'v)"/>' +
      '</svg>';
  };

  // 头部深色底纹（我的页面）
  Art.headTexture = function (seed) {
    const r = rng('head-' + seed);
    const id = uid('ht');
    let s = '';
    for (let i = 0; i < 26; i++) {
      s += '<ellipse cx="' + n(r() * 400) + '" cy="' + n(r() * 300) + '" rx="' + n(30 + r() * 110) + '" ry="' + n(20 + r() * 70) +
        '" fill="#' + (r() > 0.5 ? '2a2825' : '57524b') + '" opacity="' + n(0.22 + r() * 0.4) + '"/>';
    }
    for (let i = 0; i < 7; i++) {
      s += '<path d="M' + n(r() * 400) + ' ' + n(r() * 300) + ' q' + n(40 + r() * 80) + ' ' + n(-30 + r() * 60) + ' ' + n(110 + r() * 90) + ' ' + n(r() * 40 - 20) +
        '" fill="none" stroke="#efece7" stroke-width="1.2" opacity=".14"/>';
    }
    return '<svg class="art art--head" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="' + id + 'b" x1="0" y1="0" x2="0.4" y2="1">' +
      '<stop offset="0" stop-color="#4a453f"/><stop offset="1" stop-color="#1b1a18"/></linearGradient>' +
      '<filter id="' + id + 'f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="26"/></filter>' +
      grainDefs(id + 'g') + '</defs>' +
      '<rect width="400" height="300" fill="url(#' + id + 'b)"/>' +
      '<g filter="url(#' + id + 'f)">' + s + '</g>' +
      '<rect width="400" height="300" fill="url(#' + id + 'b)" opacity=".25"/>' +
      '</svg>';
  };

  // 空状态插画
  Art.empty = function (seed) {
    const id = uid('em');
    return '<svg class="art art--empty" viewBox="0 0 200 140" aria-hidden="true" focusable="false">' +
      '<ellipse cx="100" cy="118" rx="62" ry="9" fill="currentColor" opacity=".08"/>' +
      '<path d="M62 112 q-4 -30 12 -46 q-6 -12 4 -16 h44 q10 4 4 16 q16 16 12 46Z" fill="none" stroke="currentColor" stroke-width="2" opacity=".55"/>' +
      '<path d="M74 74 q26 -10 52 0" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".4"/>' +
      '<path d="M100 44 q-8 -12 4 -20 q10 -6 16 4" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".35" stroke-linecap="round"/>' +
      '</svg>';
  };

  Art.uid = uid;
  Art.rng = rng;
})();

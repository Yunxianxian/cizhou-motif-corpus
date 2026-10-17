// Exercise the production tabbar handlers, including hold, drag and cancellation.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
let now = 0, serial = 0, scale = 1, mounted = false;
const frames = new Map(), calls = [];
class Element {
  constructor() {
    this.events = new Map(); this.style = { setProperty(k, v) { this[k] = v; } };
    const classes = new Set();
    this.classList = { add: k => classes.add(k), remove: k => classes.delete(k), toggle: (k, on) => on ? classes.add(k) : classes.delete(k) };
  }
  addEventListener(type, fn) { const list = this.events.get(type) || []; list.push(fn); this.events.set(type, list); }
  emit(type, extra = {}) { for (const fn of this.events.get(type) || []) fn({ preventDefault() {}, ...extra }); }
  setAttribute() {}
  removeAttribute() {}
}
const bar = new Element(), pill = new Element(), track = new Element(), window = new Element(), document = new Element();
Object.assign(bar, { clientWidth: 338, offsetWidth: 340, clientHeight: 72, clientLeft: 1 });
bar.querySelector = s => s === '.tabbar__in' ? mounted : track;
Object.defineProperty(bar, 'innerHTML', { set() { mounted = true; } });
bar.getBoundingClientRect = () => ({ left: 100, top: 700, width: 340 * scale, height: 72 * scale });
bar.setPointerCapture = id => { bar.capture = id; };
bar.hasPointerCapture = id => bar.capture === id;
bar.releasePointerCapture = () => { bar.capture = null; };
pill.getBoundingClientRect = () => {
  const left = 100 + (1 + parseFloat(pill.style.left)) * scale;
  const top = 700 + parseFloat(pill.style.top) * scale;
  return { left, right: left + parseFloat(pill.style.width) * scale, top, bottom: top + parseFloat(pill.style.height) * scale };
};
const buttons = ['corpus', 'upload', 'me'].map((key, i) => {
  const b = new Element(); Object.assign(b, { dataset: { tab: key }, offsetLeft: 4 + i * 110, offsetWidth: 110 });
  b.getBoundingClientRect = () => ({ left: 100 + (1 + b.offsetLeft) * scale, width: 110 * scale });
  return b;
});
const reflections = buttons.map(() => new Element());
document.getElementById = id => id === 'tabbar' ? bar : pill;
const CZ = { util: { qsa: s => s.includes('reflection') ? reflections : buttons, reduceMotion: () => false },
  icon: () => '', ui: { haptic() {} }, router: { go(route, options) {
    calls.push({ route, options });
    window.renderTest(route === '#/home' ? 'corpus' : route === '#/upload' ? 'upload' : 'me');
  } } };
window.CZ = CZ;
const source = fs.readFileSync(new URL('../assets/js/app.js', import.meta.url), 'utf8');
vm.runInNewContext(source.slice(0, source.indexOf('  let booted = false;')) + 'window.renderTest=renderTabs;})();', {
  window, document, performance: { now: () => now },
  requestAnimationFrame: fn => { frames.set(++serial, fn); return serial; }, cancelAnimationFrame: id => frames.delete(id)
});
function advance(ms) {
  for (let elapsed = 0; elapsed < ms; elapsed += 16) {
    now += 16; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(now));
    const left = parseFloat(pill.style.left), width = parseFloat(pill.style.width);
    assert(left >= 0 && left + width <= bar.clientWidth + .01, 'expanded lens stays inside bar');
  }
}
function pointer(type, x, y = 736) { bar.emit(type, { pointerId: 1, pointerType: 'touch', clientX: x, clientY: y }); }
function center() { const r = pill.getBoundingClientRect(); return [(r.left + r.right) / 2, (r.top + r.bottom) / 2]; }
window.renderTest('corpus');
const baseWidth = parseFloat(pill.style.width), baseHeight = parseFloat(pill.style.height);
assert.equal(bar.style['--lens-frost'], '1.000', 'idle lens uses readable frost');
pointer('pointerdown', ...center()); advance(300);
assert(parseFloat(pill.style.width) > baseWidth); assert(parseFloat(pill.style.height) > baseHeight);
assert.equal(bar.style['--lens-frost'], '0.000', 'holding clears the lens material');
pointer('pointermove', 390); assert.equal(calls.length, 0, 'drag only previews before release');
pointer('pointerup', 390); assert.equal(calls.at(-1).route, '#/profile');
const count = calls.length; buttons[2].emit('click', { detail: 1 }); assert.equal(calls.length, count, 'post-drag synthetic click suppressed');
advance(600);
assert(Math.abs(parseFloat(pill.style.height) - baseHeight) < .01, 'release returns to normal size');
assert.equal(bar.style['--lens-frost'], '1.000', 'release restores readable frost');
pointer('pointerdown', ...center()); pointer('pointermove', 250); pointer('pointercancel', 250); advance(600);
assert.equal(calls.length, count, 'cancel does not navigate');
assert(Math.abs(parseFloat(pill.style.left) - 229) < .01, 'cancel returns to selected tab');
pointer('pointerdown', ...center()); advance(320); pointer('pointerup', ...center()); advance(600);
assert.equal(calls.at(-1).route, '#/profile', 'holding current tab still returns to its root');
assert(calls.at(-1).options.resetScroll);
scale = .65;
const start = center(); pointer('pointerdown', ...start); advance(300);
pointer('pointermove', 140, start[1]); pointer('pointerup', 140, start[1]); advance(600);
assert.equal(calls.at(-1).route, '#/home', 'drag works inside scaled desktop device');
buttons[1].emit('click', { detail: 0 }); advance(600);
assert.equal(calls.at(-1).route, '#/upload', 'keyboard clicks remain available');
pointer('pointerdown', ...center()); advance(200); window.emit('blur'); advance(600);
assert(!bar.capture, 'blur clears pointer capture'); assert.equal(frames.size, 0, 'animations finish cleanly');
console.log('PASS: hold enlargement, follow drag, release selection, click suppression, cancellation, root return, desktop scale, keyboard, blur and animation cleanup');

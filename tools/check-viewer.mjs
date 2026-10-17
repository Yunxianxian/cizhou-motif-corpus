// Exercise the real viewer handlers with a small DOM fixture; no browser needed.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

class Element {
  constructor() {
    this.style = {}; this.events = new Map(); this.attributes = {};
    this.disabled = false; this.isConnected = true; this.inert = false;
    this.clientWidth = 390; this.clientHeight = 600;
    this.classes = new Set();
    this.classList = { toggle: (k, on) => on ? this.classes.add(k) : this.classes.delete(k) };
  }
  addEventListener(name, fn) { const list = this.events.get(name) || []; list.push(fn); this.events.set(name, list); }
  removeEventListener(name, fn) { this.events.set(name, (this.events.get(name) || []).filter(f => f !== fn)); }
  emit(name, extra = {}) {
    const event = { preventDefault() {}, stopPropagation() {}, ...extra };
    for (const fn of [...(this.events.get(name) || [])]) fn(event);
  }
  setAttribute(k, v) { this.attributes[k] = v; }
  focus() { document.activeElement = this; }
  getBoundingClientRect() { return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight }; }
  setPointerCapture() {}
  remove() { this.isConnected = false; document.body.children = document.body.children.filter(e => e !== this); }
  contains(el) { return this === el || Object.values(this.elements || {}).includes(el); }
  set innerHTML(html) {
    this.html = html;
    if (html.includes('art')) {
      this.art = new Element(); this.art.tagName = 'IMG';
      this.art.naturalWidth = 800; this.art.naturalHeight = 1200;
    }
  }
  querySelector() { return this.art; }
}
const background = new Element(), opener = new Element(), window = new Element();
const document = { activeElement: opener, body: new Element() };
document.body.children = [background];
document.body.appendChild = el => document.body.children.push(el);
let now = 1000, modal;
const util = {
  el() {
    modal = new Element(); modal.elements = {};
    for (const name of ['.imageviewer__stage', '.imageviewer__image', '.imageviewer__title', '.imageviewer__count',
      '[data-viewer-close]', '[data-viewer-reset]', '[data-viewer-prev]', '[data-viewer-next]', '[data-viewer-in]', '[data-viewer-out]']) {
      modal.elements[name] = new Element();
    }
    return modal;
  },
  qs: (selector, root) => root.elements[selector],
  qsa: (selector, root) => Object.entries(root.elements).filter(([name, el]) => name.startsWith('[data-') && !el.disabled).map(([, el]) => el)
};
window.CZ = { util, ui: {}, icon: () => '<svg></svg>' };
vm.runInNewContext(fs.readFileSync(new URL('../assets/js/viewer.js', import.meta.url), 'utf8'),
  { window, document, performance: { now: () => now } });
const items = ['线稿', '器物', '范本'].map(label => ({ label, html: '<img class="art">' }));
const open = index => window.CZ.ui.imageViewer(items, index, '牡丹纹');
const el = selector => modal.elements[selector];
const click = selector => el(selector).emit('click');
const pointer = (name, id, x, y) => el('.imageviewer__stage').emit(name,
  { pointerId: id, clientX: x, clientY: y, pointerType: 'touch' });
const count = () => el('.imageviewer__count').textContent;

open(0);
assert(background.inert); assert.equal(document.activeElement, el('[data-viewer-close]'));
assert(count().includes('1 / 3')); assert(el('[data-viewer-prev]').disabled);
click('[data-viewer-in]'); assert.equal(el('[data-viewer-reset]').textContent, '150%');
pointer('pointerdown', 1, 195, 300); pointer('pointermove', 1, 300, 500); pointer('pointerup', 1, 300, 500);
assert(!el('.imageviewer__image').style.transform.startsWith('translate(0px,0px)'));
assert(count().includes('1 / 3'), 'panning must not change images');
click('[data-viewer-reset]'); assert.equal(el('[data-viewer-reset]').textContent, '100%');
pointer('pointerdown', 1, 300, 300); pointer('pointermove', 1, 100, 310); pointer('pointerup', 1, 100, 310);
assert(count().includes('2 / 3'), 'swipe goes to next image');
assert.equal(el('[data-viewer-reset]').textContent, '100%');
pointer('pointerdown', 1, 145, 300); pointer('pointerdown', 2, 245, 300);
pointer('pointermove', 2, 345, 300); assert.equal(el('[data-viewer-reset]').textContent, '200%');
pointer('pointerup', 2, 345, 300); pointer('pointermove', 1, 50, 300); pointer('pointerup', 1, 50, 300);
assert(count().includes('2 / 3'), 'pinch ending must not accidentally swipe');
window.emit('keydown', { key: '0' });
pointer('pointerdown', 1, 300, 300); pointer('pointermove', 1, 100, 300); pointer('pointercancel', 1, 100, 300);
assert(count().includes('2 / 3'), 'cancelled gestures must not change images');
for (let i = 0; i < 20; i++) click('[data-viewer-in]');
assert.equal(el('[data-viewer-reset]').textContent, '500%'); assert(el('[data-viewer-in]').disabled);
window.emit('keydown', { key: 'ArrowRight' }); assert(count().includes('3 / 3'));
assert(el('[data-viewer-next]').disabled); assert.equal(el('[data-viewer-reset]').textContent, '100%');
window.emit('keydown', { key: 'ArrowLeft' }); assert(count().includes('2 / 3'));
now += 1000; pointer('pointerdown', 1, 195, 300); pointer('pointerup', 1, 195, 300);
now += 100; pointer('pointerdown', 1, 195, 300); pointer('pointerup', 1, 195, 300);
assert.equal(el('[data-viewer-reset]').textContent, '250%', 'double tap zooms');
el('.imageviewer__stage').clientWidth = 800; window.emit('resize');
assert(!el('.imageviewer__image').style.transform.includes('NaN'));
window.emit('keydown', { key: 'Escape' });
assert(!background.inert); assert.equal(document.activeElement, opener);
assert.equal(window.events.get('keydown').length, 0); assert.equal(document.body.children.length, 1);
open(1); const old = modal; open(2); assert(!old.isConnected, 'only one viewer may remain open');
window.emit('hashchange'); assert.equal(document.body.children.length, 1);
assert(!background.inert);
console.log('PASS: open, focus, zoom limits, pan, swipe, pinch, cancellation, double tap, resize, keyboard, close and cleanup');

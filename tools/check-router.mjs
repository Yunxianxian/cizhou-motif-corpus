import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const jobs = new Map(); let serial = 0;
class Element {
  constructor(hash='') {
    this.hash=hash; this.style={}; this.scrollTop=0; this.clientWidth=390; this.events={}; this.animations=[];
    const classes=new Set();
    this.classList={add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k)};
  }
  addEventListener(name,fn){(this.events[name] ||= []).push(fn);}
  emit(name,event){for(const fn of this.events[name] || []) fn(event);}
  appendChild(el){el.parentNode=this;}
  getBoundingClientRect(){return {left:0,width:390};}
  scrollTo(){this.scrollTop=0;}
  getAnimations(){return this.animations.filter(a=>!a.cancelled);}
  animate(frames,options){
    const a={frames,options,cancelled:false,cancel(){this.cancelled=true;this.oncancel?.();}};
    this.animations.push(a);return a;
  }
}
const app=new Element(), elements=new Map(), location={hash:'#/home'}, window=new Element();
window.scrollTo=()=>{};
const document={getElementById:()=>app,documentElement:{setAttribute(){}},addEventListener(){}};
const CZ={views:{},util:{reduceMotion:()=>false,el:html=>{
  const hash=html.match(/data-hash="([^"]+)"/)[1]; const el=new Element(hash); elements.set(hash,el);return el;
}}};
for(const name of ['home','applications','applicationDetail','profile','upload']) CZ.views[name]=()=>'';
window.CZ=CZ;
const history={length:1,pushState(_,__,hash){location.hash=hash;this.length++;},replaceState(_,__,hash){location.hash=hash;},back(){}};
vm.runInNewContext(fs.readFileSync(new URL('../assets/js/router.js',import.meta.url),'utf8'),{
  window,document,location,history,setTimeout:fn=>{jobs.set(++serial,fn);return serial;},clearTimeout:id=>jobs.delete(id)
});
const router=CZ.router;
const flush=()=>{const pending=[...jobs.values()];jobs.clear();pending.forEach(fn=>fn());};
const finishAnimations=el=>el.getAnimations().forEach(a=>a.onfinish?.());
router.start();router.go('#/applications');flush();router.go('#/applications/platform');flush();
const listing=elements.get('#/applications'),detail=elements.get('#/applications/platform');
// Cancel a short edge swipe. The cached list must not retain -24% / .6 fill.
app.emit('pointerdown',{clientX:1,clientY:50});
app.emit('pointermove',{clientX:40,clientY:50,cancelable:true,preventDefault(){}});
app.emit('pointerup',{clientX:40});
assert(listing.getAnimations().length>0);
finishAnimations(listing);finishAnimations(detail);
assert.equal(listing.getAnimations().length,0,'cancelled edge swipe releases animation fill');
router.go('#/applications',{mode:'back'});flush();
assert(listing.classList.contains('page--active'));assert.equal(listing.getAnimations().length,0);
assert.equal(listing.style.transform,'');assert.equal(listing.style.opacity,'');
// Interrupt an incoming transition with a return, then deliver obsolete finish callbacks.
router.go('#/applications/platform');
const obsolete=detail.getAnimations().map(a=>a.onfinish).filter(Boolean);
router.go('#/applications',{mode:'back'});
obsolete.forEach(fn=>fn());flush();
assert(listing.classList.contains('page--active'),'obsolete callbacks cannot hide current page');
assert(detail.classList.contains('page--hidden'));
assert.equal(listing.getAnimations().length,0);
// Some browsers emit both history events for one traversal.
router.go('#/profile');flush();location.hash='#/applications';
window.emit('popstate',{});const count=listing.animations.length;window.emit('hashchange',{});
assert.equal(listing.animations.length,count,'duplicate history event does not restart transition');flush();
assert.equal(listing.getAnimations().length,0);assert(!listing.inert);
console.log('PASS: cancelled swipe cleanup, cached page reuse, interrupted transitions, stale callbacks and duplicate history events');

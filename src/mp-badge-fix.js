window.KOMA=window.KOMA||{};
(function(K){
if(K._mpBadgeFixPatched)return;
K._mpBadgeFixPatched=true;
function cleanOne(el){
  if(!el)return;
  const m=String(el.textContent||'').match(/(\d+)/);
  if(!m)return;
  el.dataset.mp=m[1];
  el.setAttribute('aria-label','MP '+m[1]);
  el.textContent='';
}
function apply(){
  document.querySelectorAll('.mp,.benchMp').forEach(cleanOne);
}
const render0=K.render;
if(render0){
  K.render=function(){
    const r=render0.apply(this,arguments);
    apply();
    return r;
  };
}
const start0=K.start;
if(start0){
  K.start=function(){
    const r=start0.apply(this,arguments);
    setTimeout(apply,0);
    return r;
  };
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,0));
})(window.KOMA);

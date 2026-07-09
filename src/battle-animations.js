window.KOMA=window.KOMA||{};
(function(K){
function applyFxClasses(){
  if(!K.s||!K.s.fx)return;
  for(const id of Object.keys(K.s.fx)){
    const fx=K.s.fx[id];
    const p=K.byId&&K.byId(id);
    if(!p||!fx||!fx.cls)continue;
    for(const el of document.querySelectorAll('.fig')){
      const nm=el.querySelector('.figName');
      if(nm&&nm.textContent===p.n&&el.classList.contains(p.owner))el.classList.add(fx.cls);
    }
  }
}
if(!K._battleMotionRenderPatched){
  K._battleMotionRenderPatched=true;
  const render0=K.render;
  K.render=function(){
    render0&&render0();
    applyFxClasses();
  };
}
if(!K._battleMotionFxPatched){
  K._battleMotionFxPatched=true;
  const fx0=K.fxPiece;
  K.fxPiece=function(p,cls,done){
    if(!p){done&&done();return;}
    K.s.fx=K.s.fx||{};
    K.s.fx[p.id]={cls:cls||'fx-ko'};
    K.render&&K.render();
    window.setTimeout(()=>{
      if(K.s&&K.s.fx)delete K.s.fx[p.id];
      done&&done();
    },620);
  };
}
if(!K._battleMotionPcPatched){
  K._battleMotionPcPatched=true;
  const pc0=K.pc;
  K.pc=function(p){
    if(p&&K.s&&K.s[p.owner]&&K.s[p.owner].field.includes(p)&&(!K.s.fx||!K.s.fx[p.id])){
      K.s.fx=K.s.fx||{};
      K.s.fx[p.id]={cls:'fx-ko'};
      K.render&&K.render();
    }
    return pc0.apply(this,arguments);
  };
}
})(window.KOMA);

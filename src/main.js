window.KOMA=window.KOMA||{};
(function(K){
K.restoreFigureAbilities=function(){
  if(K.FIGURES.gengar){
    K.FIGURES.gengar.ability={name:'すりぬけ',text:'このポケモン自身は他のポケモンを通過して移動できます。ただし他のポケモンがこのポケモンを通過できるわけではありません。',passThrough:true};
  }
  if(K.FIGURES.rotom){
    K.FIGURES.rotom.ability={name:'ふゆう',text:'このポケモン自身は他のポケモンを通過して移動できます。ただし他のポケモンがこのポケモンを通過できるわけではありません。',passThrough:true};
  }
  if(K.FIGURES.greninja){
    K.FIGURES.greninja.ability=null;
  }
  K.isPassThrough=p=>p.status.condition==='sleep'||p.status.condition==='frozen';
};
K.setBossDecks=function(){
  K.DECKS={
    p1:['deoxysA','deoxysD','mewtwo','gengar','koko','rotom'],
    p2:['koko','gengar','rotom','greninja','mewtwo','deoxysD']
  };
};
K.applyBossBuffs=function(){
  if(!K.s||!K.s.p2)return;
  for(const p of [...K.s.p2.bench,...K.s.p2.field]){
    p.boss=true;
    p.level=5;
    p.mp=Math.min(4,p.mp+1);
    p.tuning=p.tuning||{};
    const wheel=K.FIGURES[p.fig].w||[];
    for(let i=0;i<wheel.length;i++){
      const seg=wheel[i];
      if(seg.c==='miss')p.tuning[i]=(p.tuning[i]||0)-10;
      else if(seg.c==='blue')p.tuning[i]=(p.tuning[i]||0)+4;
      else if(seg.c==='purple')p.tuning[i]=(p.tuning[i]||0)+8;
      else p.tuning[i]=(p.tuning[i]||0)+6;
    }
  }
};
if(!K._bossBaseValuePatched){
  K._bossBaseValuePatched=true;
  const base=K.baseValue;
  K.baseValue=function(seg,p){
    let v=base?base(seg,p):(seg.d||0);
    if(p&&p.owner==='p2'&&(seg.c==='white'||seg.c==='gold')){
      v+=p.boss?30:0;
      if(p.fig==='mewtwo'||p.fig==='greninja'||p.fig==='koko'||p.fig==='gengar')v+=10;
    }
    return v;
  };
}
K.start=function(){
  K.restoreFigureAbilities&&K.restoreFigureAbilities();
  K.setBossDecks&&K.setBossDecks();
  K.initState();
  K.applyBossBuffs&&K.applyBossBuffs();
  K.seedPlates&&K.seedPlates();
  K.render();
};
function loadCss(href){const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l);}
function loadScript(src,done){const s=document.createElement('script');s.src=src;s.onload=done;s.onerror=done;document.body.appendChild(s);}
window.addEventListener('DOMContentLoaded',()=>{
  K.restoreFigureAbilities&&K.restoreFigureAbilities();
  K.setBossDecks&&K.setBossDecks();
  loadCss('learning-ui.css');
  loadScript('src/ai-defaults.js',()=>{
    loadScript('src/lw.js',()=>{
      loadScript('src/learning-ui.js',()=>{K.bindUi();K.start();});
    });
  });
});
})(window.KOMA);

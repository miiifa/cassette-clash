window.KOMA=window.KOMA||{};
(function(K){
K.restoreFigureAbilities=function(){
  if(K.installOriginalPartyPatches)K.installOriginalPartyPatches();
  K.isPassThrough=p=>p.status.condition==='sleep'||p.status.condition==='frozen';
};
K.setBossDecks=function(){
  const o=K.ORIGINAL_PARTY;
  K.DECKS={
    p1:o&&o.p1?o.p1.slice():['modulyn','pushwyrm','sleepvine','gaiarmor','phasecat','luminelle'],
    p2:o&&o.p2?o.p2.slice():['voidray','thornogre','mirrormoth','blastboar','stormrook','gaiarmor']
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
      if(p.fig==='voidray'||p.fig==='thornogre'||p.fig==='mirrormoth'||p.fig==='blastboar'||p.fig==='stormrook')v+=10;
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
function v(src){return src+(src.includes('?')?'&':'?')+'v=20260722-selfplay-1';}
function loadCss(href){const l=document.createElement('link');l.rel='stylesheet';l.href=v(href);document.head.appendChild(l);}
function loadScript(src,done){const s=document.createElement('script');s.src=v(src);s.onload=done;s.onerror=done;document.body.appendChild(s);}
window.addEventListener('DOMContentLoaded',()=>{
  K.restoreFigureAbilities&&K.restoreFigureAbilities();
  K.setBossDecks&&K.setBossDecks();
  loadCss('learning-ui.css');
  loadScript('src/ai-defaults.js',()=>{
    loadScript('src/lw.js',()=>{
      loadScript('src/learning-ui.js',()=>{
        loadScript('src/ai-match-quality-fix.js',()=>{
          loadScript('src/action-chain-quality-fix.js',()=>{
            loadScript('src/self-play.js',()=>{
              loadScript('src/report-quality-digest-fix.js',()=>{K.bindUi();K.start();});
            });
          });
        });
      });
    });
  });
});
})(window.KOMA);

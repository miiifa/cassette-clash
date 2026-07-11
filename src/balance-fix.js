window.KOMA=window.KOMA||{};
(function(K){
if(K._bossDamageToneDownPatched)return;
K._bossDamageToneDownPatched=true;
const base=K.baseValue;
K.baseValue=function(seg,p){
  let v=base?base(seg,p):(seg.d||0);
  if(p&&p.owner==='p2'&&(seg.c==='white'||seg.c==='gold')){
    if(p.boss)v-=30;
    if(p.fig==='voidray'||p.fig==='thornogre'||p.fig==='mirrormoth'||p.fig==='blastboar'||p.fig==='stormrook')v-=10;
    v=Math.max(0,v);
  }
  return v;
};
if(!K._bossBuffToneDownPatched){
  K._bossBuffToneDownPatched=true;
  const apply0=K.applyBossBuffs;
  K.applyBossBuffs=function(){
    apply0&&apply0();
    if(!K.s||!K.s.p2)return;
    for(const p of [...K.s.p2.bench,...K.s.p2.field]){
      p.level=3;
      if(p.mp>3&&p.fig!=='voidray'&&p.fig!=='stormrook')p.mp=3;
      const wheel=K.FIGURES[p.fig].w||[];
      p.tuning=p.tuning||{};
      for(let i=0;i<wheel.length;i++){
        const seg=wheel[i];
        if(seg.c==='miss')p.tuning[i]=(p.tuning[i]||0)+6;
        else if(seg.c==='blue')p.tuning[i]=(p.tuning[i]||0)-2;
        else if(seg.c==='purple')p.tuning[i]=(p.tuning[i]||0)-5;
        else if(seg.c==='white'||seg.c==='gold')p.tuning[i]=(p.tuning[i]||0)-4;
      }
    }
  };
}
})(window.KOMA);

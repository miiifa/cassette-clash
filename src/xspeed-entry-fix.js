window.KOMA=window.KOMA||{};
(function(K){
if(K._xSpeedEntryFixPatched)return;
K._xSpeedEntryFixPatched=true;
function ownerTurnPenalty(owner){return K.s&&K.s.turnCount===1&&owner==='p1'?1:0;}
function entryMp(p,owner){
  if(!p||p.wait>0)return 0;
  if(K.effectiveMp)return K.effectiveMp(p,owner);
  return Math.max(0,(p.mp||0)-(p.status&&p.status.mpMinus||0)-ownerTurnPenalty(owner));
}
K.entryTargets=function(p,owner){
  if(!K.s||!p||!owner)return[];
  const total=entryMp(p,owner);
  if(total<=0||p.wait>0)return[];
  const r=new Set();
  const stops=K.occupiedAll?K.occupiedAll():new Set(K.all().map(x=>x.pos));
  const blocked=K.ability&&K.ability(p,'passThrough')?new Set():new Set(K.all().filter(x=>!K.isPassThrough||!K.isPassThrough(x)).map(x=>x.pos));
  for(const sp of K.SPAWN[owner]||[]){
    if(K.at(sp))continue;
    r.add(sp);
    for(const n of K.reachableFrom(sp,total-1,blocked,p))if(!stops.has(n))r.add(n);
  }
  return[...r];
};
const deploy0=K.deploy;
if(deploy0){
  K.deploy=function(p,node){
    const act=K.s&&K.s.activePlate;
    const hadX=!!(act&&act.id==='xSpeed'&&p&&act.owner===p.owner);
    if(hadX&&K.log)K.log('Xスピード: '+p.n+'の出撃移動にもMP+1を反映します。');
    return deploy0.apply(this,arguments);
  };
}
})(window.KOMA);

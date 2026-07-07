window.KOMA=window.KOMA||{};
(function(K){
function patchData(){
  const f=K.FIGURES&&K.FIGURES.mewtwo;
  if(f){
    for(const seg of f.w){
      if(seg.n==='サイコバリア'){
        seg.e={pushLine:true,wait:2};
        seg.d=3;
      }
    }
  }
}
function nextAway(prev,cur,from){
  if(!K.NODES[cur]||!K.NODES[from])return null;
  const [fx,fy]=K.NODES[from],[cx,cy]=K.NODES[cur];
  const dx=cx-fx,dy=cy-fy;
  let best=null,bestScore=-Infinity;
  for(const n of K.neigh(cur)){
    if(n===prev)continue;
    const [nx,ny]=K.NODES[n];
    const vx=nx-cx,vy=ny-cy;
    const away=(nx-fx)*(nx-fx)+(ny-fy)*(ny-fy)-((cx-fx)*(cx-fx)+(cy-fy)*(cy-fy));
    const score=vx*dx+vy*dy+away*.35;
    if(away>=-1&&score>bestScore){best=n;bestScore=score;}
  }
  return best;
}
K.pushLine=function(user,target,done){
  if(!user||!target||!user.pos||!target.pos){done&&done();return;}
  const chain=[target.pos];
  let prev=user.pos,cur=target.pos;
  for(let i=0;i<12;i++){
    const nx=nextAway(prev,cur,user.pos);
    if(!nx||chain.includes(nx))break;
    chain.push(nx);prev=cur;cur=nx;
  }
  const occ=chain.map(n=>K.at(n)).filter(Boolean);
  if(!occ.length){done&&done();return;}
  const dest=chain.slice(Math.max(0,chain.length-occ.length));
  const moved=[];
  for(let i=0;i<occ.length;i++){
    if(occ[i].pos!==dest[i])moved.push(occ[i]);
  }
  if(!moved.length){K.log(target.n+'は押し流されませんでした。');done&&done();return;}
  K.s.fx=K.s.fx||{};
  for(const p of moved)K.s.fx[p.id]={cls:'fx-push'};
  K.render&&K.render();
  window.setTimeout(()=>{
    for(let i=0;i<occ.length;i++)occ[i].pos=dest[i];
    for(const p of moved)if(K.s.fx)delete K.s.fx[p.id];
    K.log(target.n+'たちは後方へ押し流されました。');
    K.resolveSurrounds&&K.resolveSurrounds();
    K.render&&K.render();
    done&&done();
  },430);
};
const oldApply=K.applyEffect;
K.applyEffect=function(seg,user,target,done){
  const e=seg&&seg.e;
  if(e&&e.pushLine&&target){
    if(e.wait){K.addWait(target,e.wait);K.log(target.n+'にウェイト'+e.wait+'がつきました。');}
    if(e.condition){target.status.condition=e.condition;K.log(target.n+'は'+K.COND[e.condition]+'になりました。');}
    K.pushLine(user,target,done);
    return;
  }
  return oldApply.call(this,seg,user,target,done);
};
const oldBattleScore=K.battleScore;
K.battleScore=function(a,d){
  let s=oldBattleScore?oldBattleScore(a,d):0;
  function bonus(p){
    let b=0;
    const f=K.FIGURES[p.fig];
    if(K.ability&&K.ability(p,'jump'))b+=16;
    if(K.ability&&K.ability(p,'passThrough'))b+=18;
    for(const seg of f.w){
      if(!seg.e||seg.c==='miss')continue;
      const rate=(seg.s||0)/100;
      if(seg.e.bench)b+=rate*170;
      if(seg.e.pushLine)b+=rate*210;
      if(seg.e.swap)b+=rate*90;
      if(seg.e.condition)b+=rate*65;
      if(seg.e.mpMinus)b+=rate*55;
    }
    return b;
  }
  return s+bonus(a)-bonus(d)*.75;
};
patchData();
})(window.KOMA);

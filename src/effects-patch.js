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
function unit(v){return Math.abs(v)<0.001?0:(v>0?1:-1);}
function dirOf(a,b){
  if(!K.NODES[a]||!K.NODES[b])return null;
  const [ax,ay]=K.NODES[a],[bx,by]=K.NODES[b];
  return [unit(bx-ax),unit(by-ay)];
}
function sameDir(a,b){return a&&b&&a[0]===b[0]&&a[1]===b[1];}
function nextStraight(prev,cur,dir){
  let best=null,bestLen=Infinity;
  const [cx,cy]=K.NODES[cur];
  for(const n of K.neigh(cur)){
    if(n===prev)continue;
    const nd=dirOf(cur,n);
    if(!sameDir(nd,dir))continue;
    const [nx,ny]=K.NODES[n];
    const len=(nx-cx)*(nx-cx)+(ny-cy)*(ny-cy);
    if(len<bestLen){best=n;bestLen=len;}
  }
  return best;
}
K.pushLine=function(user,target,done){
  if(!user||!target||!user.pos||!target.pos){done&&done();return;}
  const dir=dirOf(user.pos,target.pos);
  if(!dir||dir[0]===0&&dir[1]===0){done&&done();return;}
  const chain=[target.pos];
  let prev=user.pos,cur=target.pos;
  for(let i=0;i<8;i++){
    const nx=nextStraight(prev,cur,dir);
    if(!nx||chain.includes(nx))break;
    chain.push(nx);prev=cur;cur=nx;
  }
  const occ=[];
  for(const n of chain){const p=K.at(n);if(p)occ.push(p);}
  if(!occ.length){done&&done();return;}
  const dest=chain.slice(Math.max(0,chain.length-occ.length));
  const moved=[];
  for(let i=0;i<occ.length;i++)if(occ[i].pos!==dest[i])moved.push(occ[i]);
  if(!moved.length){K.log(target.n+'は押し流されませんでした。');done&&done();return;}
  K.s.fx=K.s.fx||{};
  for(const p of moved)K.s.fx[p.id]={cls:'fx-push'};
  K.render&&K.render();
  window.setTimeout(()=>{
    for(let i=0;i<occ.length;i++)occ[i].pos=dest[i];
    for(const p of moved)if(K.s.fx)delete K.s.fx[p.id];
    K.log(target.n+'たちは直線方向へ押し流されました。');
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
      if(seg.e.pushLine)b+=rate*160;
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

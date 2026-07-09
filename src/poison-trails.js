window.KOMA=window.KOMA||{};
(function(K){
function isSleepvine(p){return p&&p.fig==='sleepvine';}
function ensure(){if(!K.s.poisonTraps)K.s.poisonTraps=[];return K.s.poisonTraps;}
function uniq(a){return[...new Set(a.filter(Boolean))];}
function pathFor(p,node){
  try{
    const old=p.pos,mp=K.effectiveMp(p,p.owner);
    return K.findPath(old,node,mp,K.blockedFor(p),p)||[old,node];
  }catch(e){return[p&&p.pos,node];}
}
function poison(p,trap){
  if(!p||!trap||p.owner===trap.owner)return false;
  if(p.status.condition==='toxic'||p.status.condition==='poison')return false;
  p.status.condition='poison';
  K.log(p.n+'は'+trap.sourceName+'の毒の足跡を踏んでどくになりました。');
  return true;
}
K.addPoisonTrail=function(p,path){
  if(!isSleepvine(p)||!path||path.length<2)return;
  const nodes=uniq(path.slice(0,-1));
  if(!nodes.length)return;
  const traps=ensure();
  K.s.poisonTraps=traps.filter(t=>!(t.owner===p.owner&&t.sourceId===p.id));
  K.s.poisonTraps.push({owner:p.owner,sourceId:p.id,sourceName:p.n,nodes,createdTurn:K.s.turnCount});
  K.log(p.n+'の特性「毒の足跡」: 通った道に毒床を残しました。');
};
K.checkPoisonTraps=function(p,path){
  if(!K.s||!K.s.poisonTraps||!p)return;
  const nodes=uniq(path&&path.length?path:[p.pos]);
  for(const trap of K.s.poisonTraps){
    if(trap.owner===p.owner)continue;
    if((trap.nodes||[]).some(n=>nodes.includes(n))){poison(p,trap);return;}
  }
};
K.expirePoisonTrapsForTurn=function(){
  if(!K.s||!K.s.poisonTraps)return;
  const turn=K.s.turn;
  const before=K.s.poisonTraps.length;
  K.s.poisonTraps=K.s.poisonTraps.filter(t=>t.owner!==turn);
  if(before!==K.s.poisonTraps.length)K.log('毒の足跡が消えました。');
};
if(K.FIGURES&&K.FIGURES.sleepvine){
  K.FIGURES.sleepvine.ability={name:'毒の足跡',text:'移動したあと、通ったマスに毒床を残します。毒床は相手ターンの間だけ残り、敵が通る/止まるとどくになります。'};
  K.FIGURES.sleepvine.desc='眠りと毒で道を作る胞子ユニット。移動後に通った道へ毒床を残す。';
}
if(!K._poisonTrailMovePatched){
  K._poisonTrailMovePatched=true;
  const move0=K.movePiece;
  K.movePiece=function(p,node){
    const path=pathFor(p,node);
    if(!isSleepvine(p))K.checkPoisonTraps&&K.checkPoisonTraps(p,path);
    const ret=move0.apply(this,arguments);
    if(isSleepvine(p))window.setTimeout(()=>{K.addPoisonTrail&&K.addPoisonTrail(p,path);K.render&&K.render();},0);
    return ret;
  };
  const deploy0=K.deploy;
  K.deploy=function(p,node){
    K.checkPoisonTraps&&K.checkPoisonTraps(p,[node]);
    return deploy0.apply(this,arguments);
  };
}
if(!K._poisonTrailTurnPatched){
  K._poisonTrailTurnPatched=true;
  const end0=K.endTurn;
  K.endTurn=function(){
    const ret=end0.apply(this,arguments);
    if(K.s&&!K.s.win)K.expirePoisonTrapsForTurn&&K.expirePoisonTrapsForTurn();
    K.render&&K.render();
    return ret;
  };
}
if(!K._poisonTrailRenderPatched){
  K._poisonTrailRenderPatched=true;
  const render0=K.render;
  K.render=function(){
    render0&&render0();
    if(!K.s||!K.s.poisonTraps)return;
    const nodes=new Set();
    for(const t of K.s.poisonTraps)for(const n of t.nodes||[])nodes.add(n);
    const btns=[...document.querySelectorAll('button.node')];
    for(const el of btns){
      const left=parseFloat(el.style.left),top=parseFloat(el.style.top);
      let id=null;
      for(const k of Object.keys(K.NODES||{})){
        const xy=K.NODES[k];
        if(Math.abs(xy[0]-left)<0.05&&Math.abs(xy[1]-top)<0.05){id=k;break;}
      }
      if(id&&nodes.has(id)){el.classList.add('poisonTrap');el.title='毒の足跡';}
    }
  };
}
})(window.KOMA);

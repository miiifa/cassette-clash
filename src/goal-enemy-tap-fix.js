window.KOMA=window.KOMA||{};
(function(K){
if(K._goalEnemyTapFixPatched)return;
K._goalEnemyTapFixPatched=true;
function attacker(){return K.byId&&K.byId(K.s&&(K.s.pendingAttacker||K.s.selectedId));}
function canBattle(a,p){return !!(a&&p&&p.owner!==a.owner&&p.pos&&a.pos&&a.status.condition!=='sleep'&&a.status.condition!=='frozen'&&K.neigh(a.pos).includes(p.pos));}
function goalAtEvent(e){
  const board=document.getElementById('board');
  if(!board||!K.NODES)return null;
  const r=board.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  let best=null,score=Infinity;
  for(const node of [K.TARGET&&K.TARGET.p1,K.TARGET&&K.TARGET.p2].filter(Boolean)){
    const pos=K.NODES[node];
    if(!pos)continue;
    const nx=pos[0]/100*r.width,ny=pos[1]/100*r.height;
    const d=(nx-x)*(nx-x)+(ny-y)*(ny-y);
    if(d<score){score=d;best=node;}
  }
  return score<=3600?best:null;
}
function tryGoalEnemy(e){
  if(!K.s||K.s.locked||K.s.win)return false;
  if(!(K.s.phase==='chooseTarget'||K.s.phase==='chooseBattle'))return false;
  const board=document.getElementById('board');
  if(!board||!board.contains(e.target))return false;
  const node=goalAtEvent(e);
  if(!node)return false;
  const p=K.at&&K.at(node),a=attacker();
  if(!p||!a||p.owner===a.owner)return false;
  if(!canBattle(a,p)){
    if(p.owner!==K.s.turn){K.log&&K.log('ゴール上の'+p.n+'は、隣接している行動可能な駒で選ぶとバトルできます。');K.render&&K.render();}
    return false;
  }
  e.preventDefault&&e.preventDefault();
  e.stopPropagation&&e.stopPropagation();
  K.log&&K.log('ゴール上の'+p.n+'を選択。バトルを開始します。');
  K.startBattle(p.id);
  return true;
}
document.addEventListener('pointerup',function(e){tryGoalEnemy(e);},true);
})(window.KOMA);

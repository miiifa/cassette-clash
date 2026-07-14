window.KOMA=window.KOMA||{};
(function(K){
function tagFigures(){
  if(!K.s||!K.all)return;
  const used=new Set();
  document.querySelectorAll('#board .fig').forEach(el=>{
    const nm=el.querySelector('.figName');
    const owner=el.classList.contains('p1')?'p1':el.classList.contains('p2')?'p2':null;
    if(!nm||!owner)return;
    const p=K.all().find(x=>x.owner===owner&&x.n===nm.textContent&&!used.has(x.id));
    if(p){el.dataset.pieceId=p.id;used.add(p.id);}
  });
}
function attacker(){return K.byId&&K.byId(K.s&& (K.s.pendingAttacker||K.s.selectedId));}
function canBattle(a,p){return !!(a&&p&&p.owner!==a.owner&&p.pos&&a.pos&&a.status.condition!=='sleep'&&a.status.condition!=='frozen'&&K.neigh(a.pos).includes(p.pos));}
function tryStartFromPiece(p,e){
  if(!K.s||K.s.locked||K.s.win)return false;
  if(!(K.s.phase==='chooseTarget'||K.s.phase==='chooseBattle'))return false;
  const a=attacker();
  if(!canBattle(a,p))return false;
  e&&e.preventDefault&&e.preventDefault();
  e&&e.stopPropagation&&e.stopPropagation();
  K.log&&K.log(p.n+'を選択。バトルを開始します。');
  K.startBattle(p.id);
  return true;
}
function nearestAttackableFromEvent(e){
  const a=attacker();
  if(!a)return null;
  const candidates=K.all().filter(p=>canBattle(a,p));
  if(!candidates.length)return null;
  const x=e.clientX,y=e.clientY;
  let best=null,score=Infinity;
  for(const el of document.querySelectorAll('#board .fig')){
    const id=el.dataset.pieceId,p=id&&K.byId(id);
    if(!p||!candidates.some(c=>c.id===p.id))continue;
    const r=el.getBoundingClientRect();
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const d=(cx-x)*(cx-x)+(cy-y)*(cy-y);
    if(d<score){score=d;best=p;}
  }
  return score<2600?best:null;
}
if(!K._battleTapRenderPatched){
  K._battleTapRenderPatched=true;
  const render0=K.render;
  K.render=function(){
    render0&&render0.apply(this,arguments);
    tagFigures();
  };
}
if(!K._battleTapBoardPatched){
  K._battleTapBoardPatched=true;
  document.addEventListener('pointerup',function(e){
    const board=document.getElementById('board');
    if(!board||!board.contains(e.target))return;
    const fig=e.target.closest&&e.target.closest('#board .fig');
    if(fig&&fig.dataset.pieceId){
      const p=K.byId(fig.dataset.pieceId);
      if(tryStartFromPiece(p,e))return;
    }
    const near=nearestAttackableFromEvent(e);
    if(near)tryStartFromPiece(near,e);
  },true);
}
})(window.KOMA);

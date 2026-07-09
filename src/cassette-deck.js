window.KOMA=window.KOMA||{};
(function(K){
const FAVORITES=['cassette','jumpCassette','burstCassette'];
const POOL=['goldCassette','swapCassette','homeCassette','healCassette','phaseCassette','xSpeed','xAttack'];
const LIFE=3;
function shuffle(a){
  const x=a.slice();
  for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=x[i];x[i]=x[j];x[j]=t;}
  return x;
}
function ownerKey(owner,key){return owner+'Cassette'+key;}
function hand(owner){return K.s[ownerKey(owner,'Hand')]||(K.s[ownerKey(owner,'Hand')]=[]);}
function deck(owner){return K.s[ownerKey(owner,'Deck')]||(K.s[ownerKey(owner,'Deck')]=[]);}
function discard(owner){return K.s[ownerKey(owner,'Discard')]||(K.s[ownerKey(owner,'Discard')]=[]);}
function lives(owner){return K.s[ownerKey(owner,'Life')]||(K.s[ownerKey(owner,'Life')]={});}
function setLife(owner,id,n=LIFE){lives(owner)[id]=n;}
function getLife(owner,id){const l=lives(owner);if(!l[id])l[id]=LIFE;return l[id];}
function syncLegacy(owner){K.s[owner+'plates']=hand(owner);}
function refill(owner){
  const d=deck(owner),x=discard(owner);
  if(d.length||!x.length)return;
  const sh=shuffle(x.splice(0,x.length));
  d.push(...sh);
  K.log&&K.log('カセットの捨て札をシャッフルして山札に戻しました。');
}
K.drawCassette=function(owner='p1',n=1){
  const h=hand(owner),d=deck(owner);
  for(let i=0;i<n;i++){
    refill(owner);
    if(!d.length)break;
    const id=d.shift();
    h.push(id);
    setLife(owner,id,LIFE);
    K.log&&K.log('カセットを1枚引きました: '+(K.PLATES[id]&&K.PLATES[id].name||id));
  }
  syncLegacy(owner);
};
K.discardUsedCassette=function(owner,id){
  const h=hand(owner),l=lives(owner);
  const idx=h.indexOf(id);
  if(idx>=0)h.splice(idx,1);
  delete l[id];
  discard(owner).push(id);
  K.drawCassette(owner,1);
  syncLegacy(owner);
};
K.ageCassetteHand=function(owner='p1'){
  if(!K.s||K.s.win)return;
  const h=hand(owner),l=lives(owner),expired=[];
  for(const id of h.slice()){
    if(K.s.activePlate&&K.s.activePlate.owner===owner&&K.s.activePlate.id===id)continue;
    l[id]=(l[id]||LIFE)-1;
    if(l[id]<=0)expired.push(id);
  }
  for(const id of expired){
    const idx=h.indexOf(id);
    if(idx>=0)h.splice(idx,1);
    delete l[id];
    discard(owner).push(id);
    K.log&&K.log((K.PLATES[id]&&K.PLATES[id].name||id)+'は寿命切れで捨て札に行きました。');
  }
  while(h.length<3){const before=h.length;K.drawCassette(owner,1);if(h.length===before)break;}
  syncLegacy(owner);
};
K.setupCassetteDeck=function(owner='p1'){
  K.s[ownerKey(owner,'Hand')]=FAVORITES.slice();
  K.s[ownerKey(owner,'Deck')]=shuffle(POOL.slice());
  K.s[ownerKey(owner,'Discard')]=[];
  K.s[ownerKey(owner,'Life')]={};
  for(const id of FAVORITES)setLife(owner,id,LIFE);
  syncLegacy(owner);
};
if(!K._cassetteDeckSeedPatched){
  K._cassetteDeckSeedPatched=true;
  const seed0=K.seedPlates;
  K.seedPlates=function(){
    seed0&&seed0();
    K.setupCassetteDeck('p1');
    if(K.s){K.s.p2plates=[];K.s.activePlate=null;K.s.usedPlateThisTurn=false;K.s.pendingPlateId=null;}
  };
}
if(!K._cassetteDeckUsePatched){
  K._cassetteDeckUsePatched=true;
  const use0=K.usePlate;
  K.usePlate=function(id){
    const before=K.s&&K.s.p1CassetteHand&&K.s.p1CassetteHand.includes(id);
    const ret=use0.apply(this,arguments);
    if(before&&K.s&&K.s.usedPlateThisTurn&&id==='healCassette'&&!K.s.activePlate){
      K.discardUsedCassette('p1',id);
      K.render&&K.render();
    }
    return ret;
  };
  const consume0=K.consumeActivePlate;
  K.consumeActivePlate=function(){
    const act=K.s&&K.s.activePlate?{...K.s.activePlate}:null;
    const ret=consume0.apply(this,arguments);
    if(act&&act.owner==='p1'){
      K.discardUsedCassette('p1',act.id);
      K.render&&K.render();
    }
    return ret;
  };
  const end0=K.endTurn;
  K.endTurn=function(){
    const prev=K.s&&K.s.turn;
    const act=K.s&&K.s.activePlate&&K.s.activePlate.owner===K.s.turn?{...K.s.activePlate}:null;
    const ret=end0.apply(this,arguments);
    if(act&&act.owner==='p1'&&K.s&&hand('p1').includes(act.id)){
      K.discardUsedCassette('p1',act.id);
      K.log&&K.log('使い切らなかったカセットを捨て札に置き、1枚引きました。');
    }
    if(prev==='p1'&&K.s&&!K.s.win)K.ageCassetteHand('p1');
    K.render&&K.render();
    return ret;
  };
}
if(!K._cassetteDeckRenderPatched){
  K._cassetteDeckRenderPatched=true;
  K.renderPlates=function(){
    const root=document.getElementById('plateTray');
    if(!root||!K.s)return;
    syncLegacy('p1');
    const active=K.s.activePlate&&K.s.activePlate.owner==='p1'?K.s.activePlate.id:null;
    const h=hand('p1'),d=deck('p1'),x=discard('p1');
    const cards=h.map((id,i)=>{
      const p=K.PLATES[id];
      if(!p)return'';
      const powered=K.isStrengthenedCassette&&K.isStrengthenedCassette(id,'p1');
      const name=powered?(K.CASSETTE_POWER_NAMES[id]||p.name):p.name;
      const isActive=active===id;
      const disabled=K.s.turn!=='p1'||!!K.s.win||K.s.locked||K.s.phase!=='idle'||K.s.usedPlateThisTurn||isActive;
      const desc=powered&&K.plateMessage?K.plateMessage(id,true):p.desc;
      const life=getLife('p1',id);
      return '<div class="plateCard handCard'+(isActive?' active':'')+(powered?' powered':'')+(life<=1?' expiring':'')+'">'
        +'<img class="plateArt" src="'+p.asset+'" alt="'+name+'">'
        +'<div class="plateName">'+name+'</div>'
        +'<div class="plateLife">寿命 '+life+'</div>'
        +'<div class="plateDesc">'+desc+'</div>'
        +'<button class="plateBtn" data-plate="'+id+'" data-hand="'+i+'" '+(disabled?'disabled':'')+'>'+(isActive?'使用中':'確認')+'</button>'
        +'</div>';
    }).join('');
    const sync=K.hasCassetteSync&&K.hasCassetteSync('p1')?' / モジュリン: 強化カセット中':'';
    root.innerHTML='<div class="platesTitle"><span>カセット手札 '+h.length+'枚</span><span class="hintPlate">山札 '+d.length+' / 捨て札 '+x.length+' / 寿命3T'+sync+'</span></div><div class="plateRow handRow">'+cards+'</div>';
    root.querySelectorAll('[data-plate]').forEach(btn=>btn.onclick=()=>K.openPlateDialog(btn.dataset.plate));
  };
}
})(window.KOMA);

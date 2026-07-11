window.KOMA=window.KOMA||{};
(function(K){
const BATTLE_RUNES=['xAttack','cassette','burstCassette','goldCassette','swapCassette'];
function hand(){return K.s&&K.s.p1CassetteHand||K.s&&K.s.p1plates||[];}
function lifeOf(id){const l=K.s&&K.s.p1CassetteLife;return l&&l[id]||3;}
function runeName(id){const p=K.PLATES&&K.PLATES[id];const powered=K.isStrengthenedCassette&&K.isStrengthenedCassette(id,'p1');return powered&&K.CASSETTE_POWER_NAMES&&K.CASSETTE_POWER_NAMES[id]||p&&p.name||id;}
function canUseBattleRune(id){return BATTLE_RUNES.includes(id)&&K.PLATES&&K.PLATES[id];}
function battleRunes(){return hand().filter(canUseBattleRune);}
function ensurePrompt(){
  let o=document.getElementById('preBattleRuneOverlay');
  if(o)return o;
  o=document.createElement('div');
  o.id='preBattleRuneOverlay';
  o.innerHTML='<div class="preBattleRuneBox"><div class="preBattleRuneTitle">バトル前に魔札を使う？</div><div class="preBattleRuneSub">このターンまだ魔札を使っていません。今使える魔札を選べます。</div><div id="preBattleRuneList" class="preBattleRuneList"></div><div class="preBattleRuneActions"><button id="preBattleRuneNo">使わないでバトル</button><button id="preBattleRuneClose">戻る</button></div></div>';
  document.body.appendChild(o);
  o.querySelector('#preBattleRuneClose').onclick=()=>{o.style.display='none';K.s.pendingPreBattleRune=null;};
  o.addEventListener('click',e=>{if(e.target===o){o.style.display='none';K.s.pendingPreBattleRune=null;}});
  return o;
}
function activateRuneNow(id){
  if(!K.s||!K.PLATES||!K.PLATES[id])return false;
  if(K.s.usedPlateThisTurn)return false;
  const powered=K.isStrengthenedCassette&&K.isStrengthenedCassette(id,'p1');
  K.s.usedPlateThisTurn=true;
  K.s.activePlate={owner:'p1',id,powered};
  K.showPlateFlash&&K.showPlateFlash(id);
  K.log('魔札「'+runeName(id)+'」をバトル前に使用。'+(K.plateMessage?K.plateMessage(id,powered):''));
  K.render&&K.render();
  return true;
}
function proceed(defenderId){
  const o=document.getElementById('preBattleRuneOverlay');
  if(o)o.style.display='none';
  K.s.pendingPreBattleRune=null;
  K.s.skipPreBattleRunePrompt=true;
  try{K.startBattle(defenderId);}finally{K.s.skipPreBattleRunePrompt=false;}
}
K.showPreBattleRunePrompt=function(defenderId){
  const opts=battleRunes();
  if(!opts.length)return false;
  const o=ensurePrompt();
  K.s.pendingPreBattleRune=defenderId;
  const list=o.querySelector('#preBattleRuneList');
  list.innerHTML=opts.map(id=>{
    const p=K.PLATES[id],powered=K.isStrengthenedCassette&&K.isStrengthenedCassette(id,'p1');
    const desc=powered&&K.plateMessage?K.plateMessage(id,true):p.desc;
    return '<button class="preBattleRuneCard" data-rune="'+id+'"><img src="'+p.asset+'" alt="'+runeName(id)+'"><span class="preBattleRuneName">'+runeName(id)+'</span><span class="preBattleRuneLife">寿命 '+lifeOf(id)+'</span><span class="preBattleRuneDesc">'+desc+'</span></button>';
  }).join('');
  list.querySelectorAll('[data-rune]').forEach(btn=>btn.onclick=()=>{const id=btn.dataset.rune;if(activateRuneNow(id))proceed(defenderId);});
  o.querySelector('#preBattleRuneNo').onclick=()=>proceed(defenderId);
  o.style.display='flex';
  return true;
};
if(!K._preBattleRuneStartPatched){
  K._preBattleRuneStartPatched=true;
  const start0=K.startBattle;
  K.startBattle=function(defenderId){
    if(K.s&&K.s.turn==='p1'&&!K.s.skipPreBattleRunePrompt&&!K.s.usedPlateThisTurn&&!K.s.activePlate&&!K.s.locked&&!K.s.win){
      if(K.showPreBattleRunePrompt&&K.showPreBattleRunePrompt(defenderId))return;
    }
    return start0.apply(this,arguments);
  };
}
if(!K._tapWholeRuneCardPatched){
  K._tapWholeRuneCardPatched=true;
  const render0=K.renderPlates;
  K.renderPlates=function(){
    render0&&render0();
    const root=document.getElementById('plateTray');
    if(!root)return;
    root.querySelectorAll('.plateCard').forEach(card=>{
      const btn=card.querySelector('[data-plate]');
      if(!btn)return;
      card.classList.add('tapRuneCard');
      btn.style.display='none';
      card.setAttribute('role','button');
      card.setAttribute('tabindex',btn.disabled?'-1':'0');
      card.onclick=e=>{if(btn.disabled)return;if(e.target&&e.target.closest('button'))return;K.openPlateDialog&&K.openPlateDialog(btn.dataset.plate);};
    });
  };
}
})(window.KOMA);

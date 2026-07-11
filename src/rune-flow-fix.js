window.KOMA=window.KOMA||{};
(function(K){
const BATTLE_RUNES=['xAttack','cassette','burstCassette','goldCassette','swapCassette'];
function hand(){return K.s&&K.s.p1CassetteHand||K.s&&K.s.p1plates||[];}
function lifeOf(id){const l=K.s&&K.s.p1CassetteLife;return l&&l[id]||3;}
function runeName(id){const p=K.PLATES&&K.PLATES[id];const powered=K.isStrengthenedCassette&&K.isStrengthenedCassette(id,'p1');return powered&&K.CASSETTE_POWER_NAMES&&K.CASSETTE_POWER_NAMES[id]||p&&p.name||id;}
function runeDesc(id){const p=K.PLATES&&K.PLATES[id];const powered=K.isStrengthenedCassette&&K.isStrengthenedCassette(id,'p1');return powered&&K.plateMessage?K.plateMessage(id,true):p&&p.desc||'';}
function canUseBattleRune(id){return BATTLE_RUNES.includes(id)&&K.PLATES&&K.PLATES[id];}
function battleRunes(){return hand().filter(canUseBattleRune);}
function useReason(){
  if(!K.s)return 'まだ使えません。';
  if(K.s.win)return '対局終了後は使えません。';
  if(K.s.turn!=='p1')return '相手ターンなので今は使えません。';
  if(K.s.locked||K.s.phase!=='idle')return '行動中なので今は使えません。';
  if(K.s.usedPlateThisTurn)return 'このターンはすでに魔札を使っています。';
  return '';
}
function useNow(id){
  if(!K.s||!K.PLATES||!K.PLATES[id])return false;
  const reason=useReason();
  if(reason){K.log(reason);K.render&&K.render();return false;}
  if(K.usePlate){K.usePlate(id);return true;}
  return false;
}
function ensureInfo(){
  let o=document.getElementById('runeInfoOverlay');
  if(o)return o;
  o=document.createElement('div');
  o.id='runeInfoOverlay';
  o.innerHTML='<div class="runeInfoBox"><div class="runeInfoTitle" id="runeInfoTitle"></div><div class="runeInfoMain"><img id="runeInfoArt" alt=""><div><div id="runeInfoDesc"></div><div id="runeInfoState"></div></div></div><div class="runeInfoActions"><button id="runeInfoUse">使う</button><button id="runeInfoClose">閉じる</button></div></div>';
  document.body.appendChild(o);
  o.querySelector('#runeInfoClose').onclick=()=>{o.style.display='none';if(K.s)K.s.pendingPlateId=null;};
  o.addEventListener('click',e=>{if(e.target===o){o.style.display='none';if(K.s)K.s.pendingPlateId=null;}});
  return o;
}
K.openRuneInfo=function(id){
  if(!K.PLATES||!K.PLATES[id])return;
  const o=ensureInfo(),p=K.PLATES[id],reason=useReason();
  if(K.s)K.s.pendingPlateId=id;
  o.querySelector('#runeInfoTitle').textContent=runeName(id);
  o.querySelector('#runeInfoArt').src=p.asset;
  o.querySelector('#runeInfoDesc').textContent=runeDesc(id);
  o.querySelector('#runeInfoState').textContent=reason?('今は使えません: '+reason):'今すぐ使えます。';
  const use=o.querySelector('#runeInfoUse');
  use.disabled=!!reason;
  use.onclick=()=>{if(useNow(id)){o.style.display='none';}};
  o.style.display='flex';
};
function ensurePrompt(){
  let o=document.getElementById('preBattleRuneOverlay');
  if(o)return o;
  o=document.createElement('div');
  o.id='preBattleRuneOverlay';
  o.innerHTML='<div class="preBattleRuneBox"><div class="preBattleRuneTitle">バトル前に魔札を使う？</div><div class="preBattleRuneSub">使う魔札を選んでから、下の「この魔札を使う」で確定します。</div><div id="preBattleRuneList" class="preBattleRuneList"></div><div id="preBattleRunePreview" class="preBattleRunePreview">魔札を選んでください。</div><div class="preBattleRuneActions"><button id="preBattleRuneNo">使わないでバトル</button><button id="preBattleRuneUse" disabled>この魔札を使う</button><button id="preBattleRuneClose">戻る</button></div></div>';
  document.body.appendChild(o);
  o.querySelector('#preBattleRuneClose').onclick=()=>{o.style.display='none';K.s.pendingPreBattleRune=null;K.s.pendingPreBattleRuneId=null;};
  o.addEventListener('click',e=>{if(e.target===o){o.style.display='none';K.s.pendingPreBattleRune=null;K.s.pendingPreBattleRuneId=null;}});
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
  K.s.pendingPreBattleRuneId=null;
  K.s.skipPreBattleRunePrompt=true;
  try{K.startBattle(defenderId);}finally{K.s.skipPreBattleRunePrompt=false;}
}
K.showPreBattleRunePrompt=function(defenderId){
  const opts=battleRunes();
  if(!opts.length)return false;
  const o=ensurePrompt();
  K.s.pendingPreBattleRune=defenderId;
  K.s.pendingPreBattleRuneId=null;
  const list=o.querySelector('#preBattleRuneList'),preview=o.querySelector('#preBattleRunePreview'),use=o.querySelector('#preBattleRuneUse');
  list.innerHTML=opts.map(id=>{const p=K.PLATES[id];return '<button class="preBattleRuneCard" data-rune="'+id+'"><img src="'+p.asset+'" alt="'+runeName(id)+'"><span class="preBattleRuneName">'+runeName(id)+'</span><span class="preBattleRuneLife">寿命 '+lifeOf(id)+'</span><span class="preBattleRuneDesc">'+runeDesc(id)+'</span></button>';}).join('');
  preview.textContent='魔札を選んでください。';
  use.disabled=true;
  list.querySelectorAll('[data-rune]').forEach(btn=>btn.onclick=()=>{const id=btn.dataset.rune;K.s.pendingPreBattleRuneId=id;list.querySelectorAll('.preBattleRuneCard').forEach(x=>x.classList.toggle('selected',x===btn));preview.textContent='選択中: '+runeName(id)+' / '+runeDesc(id);use.disabled=false;});
  use.onclick=()=>{const id=K.s&&K.s.pendingPreBattleRuneId;if(id&&activateRuneNow(id))proceed(defenderId);};
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
      const id=btn.dataset.plate;
      card.classList.add('tapRuneCard');
      btn.style.display='none';
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      card.onclick=e=>{if(e.target&&e.target.closest('button'))return;K.openRuneInfo&&K.openRuneInfo(id);};
    });
  };
}
})(window.KOMA);

window.KOMA=window.KOMA||{};
(function(K){
K.PLATES={
  xAttack:{name:'Xアタック',asset:'assets/plates/x-attack.svg',desc:'次の白/金ワザのダメージを+20。',kind:'boost'},
  cassette:{name:'カセット',asset:'assets/plates/cassette.svg',desc:'次の白/金ワザのダメージを+10。',kind:'boostSmall'},
  xSpeed:{name:'Xスピード',asset:'assets/plates/x-speed.svg',desc:'プレートアセット用。次段階で移動強化に対応。',kind:'preview'}
};
K.seedPlates=function(){
  if(!K.s)return;
  K.s.p1plates=['xAttack','cassette','xSpeed'];
  K.s.p2plates=[];
  K.s.activePlate=null;
};
K.usePlate=function(id){
  if(!K.s||K.s.turn!=='p1'||K.s.win||K.s.locked||K.s.phase!=='idle')return;
  if(!K.s.p1plates||!K.s.p1plates.includes(id))return;
  K.s.activePlate={owner:'p1',id};
  K.log('プレート「'+K.PLATES[id].name+'」を使います。次のバトルに反映されます。');
  K.render&&K.render();
};
K.consumeActivePlate=function(){
  if(!K.s||!K.s.activePlate)return;
  const act=K.s.activePlate; const list=K.s[act.owner+'plates'];
  if(Array.isArray(list)){
    const idx=list.indexOf(act.id);
    if(idx>=0)list.splice(idx,1);
  }
  K.log('プレート「'+K.PLATES[act.id].name+'」の効果が消費されました。');
  K.s.activePlate=null;
};
K.renderPlates=function(){
  const root=document.getElementById('plateTray');
  if(!root||!K.s)return;
  const active=K.s.activePlate&&K.s.activePlate.owner==='p1'?K.s.activePlate.id:null;
  const cards=(K.s.p1plates||[]).map(id=>{
    const p=K.PLATES[id];
    const isActive=active===id;
    const disabled=K.s.turn!=='p1'||!!K.s.win||K.s.locked||K.s.phase!=='idle';
    return '<div class="plateCard'+(isActive?' active':'')+'">'
      +'<img class="plateArt" src="'+p.asset+'" alt="'+p.name+'">'
      +'<div class="plateName">'+p.name+'</div>'
      +'<div class="plateDesc">'+p.desc+'</div>'
      +'<button class="plateBtn" data-plate="'+id+'" '+(disabled?'disabled':'')+'>'+(isActive?'使用中':'使う')+'</button>'
      +'</div>';
  }).join('');
  root.innerHTML='<div class="platesTitle"><span>プレート</span><span class="hintPlate">カードで次の行動を強化</span></div><div class="plateRow">'+cards+'</div>';
  root.querySelectorAll('[data-plate]').forEach(btn=>btn.onclick=()=>K.usePlate(btn.dataset.plate));
};
if(!K._plateRenderPatched){
  K._plateRenderPatched=true;
  const render0=K.render;
  K.render=function(){render0&&render0();K.renderPlates&&K.renderPlates();};
}
if(!K._plateValuePatched){
  K._plateValuePatched=true;
  const base0=K.baseValue;
  K.baseValue=function(seg,p){
    let v=base0?base0(seg,p):(seg.d||0);
    const act=K.s&&K.s.activePlate;
    if(act&&act.owner===p.owner){
      if(act.id==='xAttack'&&(seg.c==='white'||seg.c==='gold'))v+=20;
      if(act.id==='cassette'&&(seg.c==='white'||seg.c==='gold'))v+=10;
    }
    return v;
  };
}
if(!K._plateBattlePatched){
  K._plateBattlePatched=true;
  const battle0=K.resolveBattle;
  K.resolveBattle=function(a,d,as,ds,out){
    const useNow=!!(K.s&&K.s.activePlate&&(K.s.activePlate.owner===a.owner||K.s.activePlate.owner===d.owner));
    battle0.apply(this,arguments);
    if(useNow)window.setTimeout(()=>K.consumeActivePlate&&K.consumeActivePlate(),0);
  };
}
if(!K._plateTurnPatched){
  K._plateTurnPatched=true;
  const end0=K.endTurn;
  K.endTurn=function(){
    if(K.s&&K.s.activePlate&&K.s.activePlate.owner===K.s.turn){
      K.log('プレート「'+K.PLATES[K.s.activePlate.id].name+'」は未使用のまま終了しました。');
      K.s.activePlate=null;
    }
    end0.apply(this,arguments);
  };
}
})(window.KOMA);

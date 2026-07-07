window.KOMA=window.KOMA||{};
(function(K){
K.PLATES={
  xAttack:{name:'Xアタック',asset:'assets/plates/x-attack.svg',desc:'次の白/金ワザのダメージを+20。',kind:'boost'},
  cassette:{name:'パワーカセット',asset:'assets/plates/cassette.svg',desc:'次の白/金ワザ+10。カセット技はさらに強化。',kind:'cassettePower'},
  phaseCassette:{name:'フェイズカセット',asset:'assets/plates/phase-cassette.svg',desc:'次に動かす駒が1回だけすりぬけ移動。',kind:'cassettePhase'},
  xSpeed:{name:'Xスピード',asset:'assets/plates/x-speed.svg',desc:'このターン、次に動かす自分の駒のMPを+1。',kind:'speed'}
};
K.seedPlates=function(){
  if(!K.s)return;
  K.s.p1plates=['xAttack','cassette','phaseCassette','xSpeed'];
  K.s.p2plates=[];
  K.s.activePlate=null;
  K.s.usedPlateThisTurn=false;
};
K.showPlateFlash=function(id){
  const p=K.PLATES[id];
  if(!p)return;
  let box=document.getElementById('plateFlash');
  if(!box){box=document.createElement('div');box.id='plateFlash';box.className='plateFlash';document.body.appendChild(box);}
  box.innerHTML='<div class="plateFlashCard"><img src="'+p.asset+'" alt="'+p.name+'"><div>'+p.name+'</div></div>';
  box.classList.add('show');
  window.setTimeout(()=>box.classList.remove('show'),760);
};
K.usePlate=function(id){
  if(!K.s||K.s.turn!=='p1'||K.s.win||K.s.locked||K.s.phase!=='idle')return;
  if(K.s.usedPlateThisTurn){K.log('プレートは1ターンに1枚までです。');K.render&&K.render();return;}
  if(!K.s.p1plates||!K.s.p1plates.includes(id))return;
  K.s.activePlate={owner:'p1',id};
  K.s.usedPlateThisTurn=true;
  K.showPlateFlash&&K.showPlateFlash(id);
  let msg='次のバトルに反映されます。';
  if(id==='xSpeed')msg='次に動かす自分の駒のMPが+1されます。';
  if(id==='phaseCassette')msg='次に動かす自分の駒が1回だけすりぬけ移動できます。';
  if(id==='cassette')msg='次の白/金ワザが強化され、カセット技は追加で強くなります。';
  K.log('プレート「'+K.PLATES[id].name+'」を使います。'+msg);
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
  K.render&&K.render();
};
K.renderPlates=function(){
  const root=document.getElementById('plateTray');
  if(!root||!K.s)return;
  const active=K.s.activePlate&&K.s.activePlate.owner==='p1'?K.s.activePlate.id:null;
  const cards=(K.s.p1plates||[]).map(id=>{
    const p=K.PLATES[id];
    const isActive=active===id;
    const disabled=K.s.turn!=='p1'||!!K.s.win||K.s.locked||K.s.phase!=='idle'||(K.s.usedPlateThisTurn&&!isActive);
    return '<div class="plateCard'+(isActive?' active':'')+'">'
      +'<img class="plateArt" src="'+p.asset+'" alt="'+p.name+'">'
      +'<div class="plateName">'+p.name+'</div>'
      +'<div class="plateDesc">'+p.desc+'</div>'
      +'<button class="plateBtn" data-plate="'+id+'" '+(disabled?'disabled':'')+'>'+(isActive?'使用中':'使う')+'</button>'
      +'</div>';
  }).join('');
  root.innerHTML='<div class="platesTitle"><span>プレート</span><span class="hintPlate">1ターン1枚 / カセット連携あり</span></div><div class="plateRow">'+cards+'</div>';
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
if(!K._plateMpPatched){
  K._plateMpPatched=true;
  const eff0=K.effectiveMp;
  K.effectiveMp=function(p,owner=K.s.turn){
    let v=eff0?eff0(p,owner):Math.max(0,p.mp-(p.status&&p.status.mpMinus||0));
    const act=K.s&&K.s.activePlate;
    if(act&&act.id==='xSpeed'&&act.owner===owner&&p&&p.owner===owner&&K.canAct(p))v+=1;
    return v;
  };
}
if(!K._phaseCassetteMovePatched){
  K._phaseCassetteMovePatched=true;
  const blocked0=K.blockedFor;
  K.blockedFor=function(p){
    const act=K.s&&K.s.activePlate;
    if(act&&act.id==='phaseCassette'&&p&&p.owner===act.owner)return new Set();
    return blocked0?blocked0(p):new Set();
  };
  const entry0=K.entryTargets;
  K.entryTargets=function(p,owner){
    const act=K.s&&K.s.activePlate;
    if(act&&act.id==='phaseCassette'&&p&&p.owner===act.owner){
      const f=K.FIGURES[p.fig],old=f.ability;
      f.ability=Object.assign({},old||{},{passThrough:true});
      try{return entry0.call(this,p,owner);}finally{f.ability=old;}
    }
    return entry0.call(this,p,owner);
  };
}
if(!K._plateBattlePatched){
  K._plateBattlePatched=true;
  const battle0=K.resolveBattle;
  K.resolveBattle=function(a,d,as,ds,out){
    const act=K.s&&K.s.activePlate;
    const useNow=!!(act&&(act.id==='xAttack'||act.id==='cassette')&&(act.owner===a.owner||act.owner===d.owner));
    battle0.apply(this,arguments);
    if(useNow)window.setTimeout(()=>K.consumeActivePlate&&K.consumeActivePlate(),0);
  };
}
if(!K._plateMovePatched){
  K._plateMovePatched=true;
  const move0=K.movePiece;
  K.movePiece=function(p,node){
    const act=K.s&&K.s.activePlate;
    const useNow=!!(act&&(act.id==='xSpeed'||act.id==='phaseCassette')&&act.owner===p.owner);
    const ret=move0.apply(this,arguments);
    if(useNow)window.setTimeout(()=>K.consumeActivePlate&&K.consumeActivePlate(),0);
    return ret;
  };
  const deploy0=K.deploy;
  K.deploy=function(p,node){
    const act=K.s&&K.s.activePlate;
    const useNow=!!(act&&(act.id==='xSpeed'||act.id==='phaseCassette')&&act.owner===p.owner);
    const ret=deploy0.apply(this,arguments);
    if(useNow)window.setTimeout(()=>K.consumeActivePlate&&K.consumeActivePlate(),0);
    return ret;
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
    const prev=K.s&&K.s.turn;
    end0.apply(this,arguments);
    if(K.s&&prev!==K.s.turn&&K.s.turn==='p1')K.s.usedPlateThisTurn=false;
  };
}
})(window.KOMA);

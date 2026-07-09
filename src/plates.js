window.KOMA=window.KOMA||{};
(function(K){
K.PLATES={
  xAttack:{name:'Xアタック',asset:'assets/plates/x-attack.svg',desc:'次の白/金ワザのダメージを+20。',kind:'boost'},
  cassette:{name:'パワーカセット',asset:'assets/plates/cassette.svg',desc:'次の白/金ワザ+10。カセット技はさらに強化。',kind:'cassettePower'},
  burstCassette:{name:'バーストカセット',asset:'assets/plates/cassette.svg',desc:'次の白/金ワザのダメージを+30。',kind:'cassetteBurst'},
  goldCassette:{name:'ゴールドカセット',asset:'assets/plates/cassette.svg',desc:'次のバトルだけ、自分の白技が全部金技になる。',kind:'cassetteGold'},
  swapCassette:{name:'スワップカセット',asset:'assets/plates/cassette.svg',desc:'次のバトルで勝てば相手と位置入れ替え。',kind:'cassetteSwap'},
  homeCassette:{name:'ホームカセット',asset:'assets/plates/cassette.svg',desc:'次に動かす駒が自分ゴールへ戻れる。',kind:'cassetteHome'},
  jumpCassette:{name:'ジャンプカセット',asset:'assets/plates/cassette.svg',desc:'次に動かす駒が1回だけ飛び越え移動。',kind:'cassetteJump'},
  healCassette:{name:'ヒールカセット',asset:'assets/plates/cassette.svg',desc:'味方全体の状態異常とMP低下を回復。',kind:'cassetteHeal'},
  phaseCassette:{name:'フェイズカセット',asset:'assets/plates/phase-cassette.svg',desc:'次に動かす駒が1回だけすりぬけ移動。',kind:'cassettePhase'},
  xSpeed:{name:'Xスピード',asset:'assets/plates/x-speed.svg',desc:'このターン、次に動かす自分の駒のMPを+1。',kind:'speed'}
};
function consumePlateId(owner,id){
  const list=K.s&&K.s[owner+'plates'];
  if(Array.isArray(list)){const idx=list.indexOf(id);if(idx>=0)list.splice(idx,1);}
  K.s.activePlate=null;
  K.render&&K.render();
}
K.seedPlates=function(){
  if(!K.s)return;
  K.s.p1plates=['xAttack','cassette','burstCassette','goldCassette','swapCassette','homeCassette','jumpCassette','healCassette','phaseCassette','xSpeed'];
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
  K.s.usedPlateThisTurn=true;
  K.showPlateFlash&&K.showPlateFlash(id);
  if(id==='healCassette'){
    for(const p of [...K.s.p1.field,...K.s.p1.bench]){p.status.condition=null;p.status.mpMinus=0;}
    K.log('プレート「'+K.PLATES[id].name+'」で味方全体の状態異常とMP低下を回復しました。');
    consumePlateId('p1',id);
    return;
  }
  K.s.activePlate={owner:'p1',id};
  let msg='次のバトルに反映されます。';
  if(id==='xSpeed')msg='次に動かす自分の駒のMPが+1されます。';
  if(id==='phaseCassette')msg='次に動かす自分の駒が1回だけすりぬけ移動できます。';
  if(id==='jumpCassette')msg='次に動かす自分の駒が1回だけ飛び越え移動できます。';
  if(id==='homeCassette')msg='次に動かす自分の駒が自分ゴールへ戻れるようになります。';
  if(id==='swapCassette')msg='次のバトルで勝った時、相手と位置を入れ替えます。';
  if(id==='burstCassette')msg='次の白/金ワザが+30されます。';
  if(id==='goldCassette')msg='次のバトルだけ、自分の白技がすべて金技になります。紫技に強く出られます。';
  if(id==='cassette')msg='次の白/金ワザが強化され、カセット技は追加で強くなります。';
  K.log('プレート「'+K.PLATES[id].name+'」を使います。'+msg);
  K.render&&K.render();
};
K.consumeActivePlate=function(){
  if(!K.s||!K.s.activePlate)return;
  const act=K.s.activePlate;
  consumePlateId(act.owner,act.id);
  K.log('プレート「'+K.PLATES[act.id].name+'」の効果が消費されました。');
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
if(!K._plateGoldWheelPatched){
  K._plateGoldWheelPatched=true;
  const wheel0=K.wheelFor;
  K.wheelFor=function(p,silent=false){
    const w=wheel0.call(this,p,silent);
    const act=K.s&&K.s.activePlate;
    if(act&&act.id==='goldCassette'&&p&&p.owner===act.owner){
      for(const seg of w){
        if(seg.c==='white'){
          seg.c='gold';
          seg.n='金化 '+seg.n;
          seg.goldCassette=true;
        }
      }
    }
    return w;
  };
}
if(!K._plateValuePatched){
  K._plateValuePatched=true;
  const base0=K.baseValue;
  K.baseValue=function(seg,p){
    let v=base0?base0(seg,p):(seg.d||0);
    const act=K.s&&K.s.activePlate;
    if(act&&p&&act.owner===p.owner){
      if(act.id==='xAttack'&&(seg.c==='white'||seg.c==='gold'))v+=20;
      if(act.id==='cassette'&&(seg.c==='white'||seg.c==='gold'))v+=10;
      if(act.id==='burstCassette'&&(seg.c==='white'||seg.c==='gold'))v+=30;
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
if(!K._cassetteMovePatched){
  K._cassetteMovePatched=true;
  const ability0=K.ability;
  K.ability=function(p,key){
    const act=K.s&&K.s.activePlate;
    if(act&&p&&p.owner===act.owner&&act.id==='jumpCassette'&&key==='jump')return true;
    if(act&&p&&p.owner===act.owner&&act.id==='phaseCassette'&&key==='passThrough')return true;
    return ability0?ability0(p,key):false;
  };
  const blocked0=K.blockedFor;
  K.blockedFor=function(p){
    const act=K.s&&K.s.activePlate;
    if(act&&act.id==='phaseCassette'&&p&&p.owner===act.owner)return new Set();
    return blocked0?blocked0(p):new Set();
  };
  const moveTargets0=K.moveTargets;
  K.moveTargets=function(p,owner=p.owner){
    let out=moveTargets0.call(this,p,owner);
    const act=K.s&&K.s.activePlate;
    if(act&&act.id==='homeCassette'&&p&&p.owner===act.owner){
      const home=K.TARGET[K.other(owner)];
      if(home&&!K.at(home)&&!out.includes(home))out=out.concat(home);
    }
    return out;
  };
  const entry0=K.entryTargets;
  K.entryTargets=function(p,owner){
    const act=K.s&&K.s.activePlate;
    if(act&&(act.id==='phaseCassette'||act.id==='jumpCassette')&&p&&p.owner===act.owner){
      const f=K.FIGURES[p.fig],old=f.ability;
      f.ability=Object.assign({},old||{},act.id==='phaseCassette'?{passThrough:true}:{jump:true});
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
    const battlePlate=act&&(act.id==='xAttack'||act.id==='cassette'||act.id==='burstCassette'||act.id==='goldCassette'||act.id==='swapCassette')&&(act.owner===a.owner||act.owner===d.owner);
    if(act&&act.id==='swapCassette'){
      const own=act.owner===a.owner?a:d;
      const ownSeg=own===a?as.seg:ds.seg;
      if(ownSeg&&ownSeg.c!=='miss'&&ownSeg.c!=='blue')ownSeg.e=Object.assign({},ownSeg.e||{},{swap:true});
    }
    battle0.apply(this,arguments);
    if(battlePlate)window.setTimeout(()=>K.consumeActivePlate&&K.consumeActivePlate(),0);
  };
}
if(!K._plateMovePatched){
  K._plateMovePatched=true;
  const move0=K.movePiece;
  K.movePiece=function(p,node){
    const act=K.s&&K.s.activePlate;
    const useNow=!!(act&&(act.id==='xSpeed'||act.id==='phaseCassette'||act.id==='jumpCassette'||act.id==='homeCassette')&&act.owner===p.owner);
    const ret=move0.apply(this,arguments);
    if(useNow)window.setTimeout(()=>K.consumeActivePlate&&K.consumeActivePlate(),0);
    return ret;
  };
  const deploy0=K.deploy;
  K.deploy=function(p,node){
    const act=K.s&&K.s.activePlate;
    const useNow=!!(act&&(act.id==='xSpeed'||act.id==='phaseCassette'||act.id==='jumpCassette')&&act.owner===p.owner);
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

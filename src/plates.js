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
K.CASSETTE_POWER_NAMES={
  cassette:'強化パワーカセット',
  burstCassette:'強化バーストカセット',
  goldCassette:'強化ゴールドカセット',
  swapCassette:'強化スワップカセット',
  homeCassette:'強化ホームカセット',
  jumpCassette:'強化ジャンプカセット',
  healCassette:'強化ヒールカセット',
  phaseCassette:'強化フェイズカセット'
};
K.isCassettePlate=function(id){return !!K.CASSETTE_POWER_NAMES[id];};
K.hasCassetteSync=function(owner='p1'){
  return !!(K.s&&K.s[owner]&&K.s[owner].field&&K.s[owner].field.some(p=>p.fig==='modulyn'));
};
K.isStrengthenedCassette=function(id,owner='p1'){
  return K.isCassettePlate(id)&&K.hasCassetteSync(owner);
};
function plateName(id,powered){return powered?(K.CASSETTE_POWER_NAMES[id]||K.PLATES[id].name):K.PLATES[id].name;}
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
  K.s.pendingPlateId=null;
};
K.plateMessage=function(id,powered=false){
  if(id==='xSpeed')return '次に動かす自分の駒のMPが+1されます。';
  if(id==='xAttack')return '次の白/金ワザのダメージを+20します。';
  if(id==='cassette')return powered?'強化カセット: 次の白/金ワザが+20。カセット技はさらに大きく強化されます。':'次の白/金ワザが+10。カセット技はさらに強化されます。';
  if(id==='burstCassette')return powered?'強化カセット: 次の白/金ワザが+50されます。':'次の白/金ワザが+30されます。';
  if(id==='goldCassette')return powered?'強化カセット: 次のバトルだけ白技がすべて金技になり、白/金ワザがさらに+10されます。':'次のバトルだけ、自分の白技がすべて金技になります。紫技に強く出られます。';
  if(id==='swapCassette')return powered?'強化カセット: 次のバトルで勝った時、相手と位置を入れ替え、さらに相手にウェイトを付けます。':'次のバトルで勝った時、相手と位置を入れ替えます。';
  if(id==='homeCassette')return powered?'強化カセット: 次に動かす駒が自分ゴールへ戻れます。戻る時に状態異常とMP低下も回復します。':'次に動かす自分の駒が自分ゴールへ戻れるようになります。';
  if(id==='jumpCassette')return powered?'強化カセット: 次に動かす駒が飛び越え移動でき、すりぬけもできます。':'次に動かす自分の駒が1回だけ飛び越え移動できます。';
  if(id==='phaseCassette')return powered?'強化カセット: 次に動かす駒がすりぬけ移動でき、飛び越えもできます。':'次に動かす自分の駒が1回だけすりぬけ移動できます。';
  if(id==='healCassette')return powered?'強化カセット: 味方全体の状態異常とMP低下を回復し、ウェイトも1軽減します。':'味方全体の状態異常とMP低下を回復します。';
  return '次のバトルに反映されます。';
};
K.ensurePlateDialog=function(){
  let box=document.getElementById('plateConfirmOverlay');
  if(box)return box;
  box=document.createElement('div');
  box.id='plateConfirmOverlay';
  box.style.cssText='position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(2,6,23,.72);z-index:3000;padding:20px;';
  box.innerHTML=''
    +'<div style="width:min(92vw,420px);background:#0f172a;color:#e5e7eb;border:1px solid #475569;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.45);overflow:hidden">'
    +'<div style="padding:16px 16px 8px;font-weight:700;font-size:18px">プレートを使いますか？</div>'
    +'<div style="display:flex;gap:12px;align-items:center;padding:8px 16px 0">'
    +'<img id="plateConfirmArt" src="" alt="" style="width:72px;height:72px;object-fit:contain;border-radius:12px;background:#ffffff10;border:1px solid #334155;padding:8px">'
    +'<div style="min-width:0;flex:1">'
    +'<div id="plateConfirmName" style="font-size:16px;font-weight:700"></div>'
    +'<div id="plateConfirmDesc" style="font-size:13px;line-height:1.5;color:#cbd5e1;margin-top:6px"></div>'
    +'</div></div>'
    +'<div id="plateConfirmEffect" style="padding:12px 16px 4px;font-size:13px;line-height:1.6;color:#f8fafc"></div>'
    +'<div style="display:flex;gap:10px;padding:16px">'
    +'<button id="plateConfirmCancel" style="flex:1;height:42px;border-radius:12px;border:1px solid #64748b;background:#1e293b;color:#e2e8f0;font-weight:700">キャンセル</button>'
    +'<button id="plateConfirmUse" style="flex:1;height:42px;border-radius:12px;border:0;background:#38bdf8;color:#082f49;font-weight:800">使う</button>'
    +'</div></div>';
  document.body.appendChild(box);
  box.addEventListener('click',e=>{if(e.target===box)K.closePlateDialog();});
  box.querySelector('#plateConfirmCancel').onclick=()=>K.closePlateDialog();
  box.querySelector('#plateConfirmUse').onclick=()=>{const id=K.s&&K.s.pendingPlateId;if(id)K.usePlate(id);};
  return box;
};
K.openPlateDialog=function(id){
  if(!K.s||K.s.turn!=='p1'||K.s.win||K.s.locked||K.s.phase!=='idle')return;
  if(K.s.usedPlateThisTurn){K.log('プレートは1ターンに1枚までです。');K.render&&K.render();return;}
  if(!K.s.p1plates||!K.s.p1plates.includes(id))return;
  const p=K.PLATES[id],powered=K.isStrengthenedCassette(id,'p1');
  const box=K.ensurePlateDialog();
  K.s.pendingPlateId=id;
  box.querySelector('#plateConfirmArt').src=p.asset;
  box.querySelector('#plateConfirmArt').alt=plateName(id,powered);
  box.querySelector('#plateConfirmName').textContent=plateName(id,powered);
  box.querySelector('#plateConfirmDesc').textContent=powered?'モジュリンの特性「カセットシンク」で強化カセットになっています。':p.desc;
  box.querySelector('#plateConfirmEffect').textContent=K.plateMessage(id,powered);
  box.style.display='flex';
};
K.closePlateDialog=function(){
  if(K.s)K.s.pendingPlateId=null;
  const box=document.getElementById('plateConfirmOverlay');
  if(box)box.style.display='none';
};
K.showPlateFlash=function(id){
  const p=K.PLATES[id],act=K.s&&K.s.activePlate,powered=!!(act&&act.id===id&&act.powered);
  if(!p)return;
  let box=document.getElementById('plateFlash');
  if(!box){box=document.createElement('div');box.id='plateFlash';box.className='plateFlash';document.body.appendChild(box);}
  box.innerHTML='<div class="plateFlashCard"><img src="'+p.asset+'" alt="'+plateName(id,powered)+'"><div>'+plateName(id,powered)+'</div></div>';
  box.classList.add('show');
  window.setTimeout(()=>box.classList.remove('show'),760);
};
K.usePlate=function(id){
  if(!K.s||K.s.turn!=='p1'||K.s.win||K.s.locked||K.s.phase!=='idle')return;
  if(K.s.usedPlateThisTurn){K.log('プレートは1ターンに1枚までです。');K.render&&K.render();return;}
  if(!K.s.p1plates||!K.s.p1plates.includes(id))return;
  const powered=K.isStrengthenedCassette(id,'p1');
  K.closePlateDialog&&K.closePlateDialog();
  K.s.usedPlateThisTurn=true;
  if(id==='healCassette'){
    for(const p of [...K.s.p1.field,...K.s.p1.bench]){
      p.status.condition=null;
      p.status.mpMinus=0;
      if(powered)p.wait=Math.max(0,(p.wait||0)-1);
    }
    K.s.activePlate={owner:'p1',id,powered};
    K.showPlateFlash&&K.showPlateFlash(id);
    K.log('プレート「'+plateName(id,powered)+'」を使用。'+K.plateMessage(id,powered));
    consumePlateId('p1',id);
    return;
  }
  K.s.activePlate={owner:'p1',id,powered};
  K.showPlateFlash&&K.showPlateFlash(id);
  K.log('プレート「'+plateName(id,powered)+'」を使用。'+K.plateMessage(id,powered));
  K.render&&K.render();
};
K.consumeActivePlate=function(){
  if(!K.s||!K.s.activePlate)return;
  const act=K.s.activePlate;
  consumePlateId(act.owner,act.id);
  K.log('プレート「'+plateName(act.id,act.powered)+'」の効果が消費されました。');
};
K.renderPlates=function(){
  const root=document.getElementById('plateTray');
  if(!root||!K.s)return;
  const active=K.s.activePlate&&K.s.activePlate.owner==='p1'?K.s.activePlate.id:null;
  const cards=(K.s.p1plates||[]).map(id=>{
    const p=K.PLATES[id],powered=K.isStrengthenedCassette(id,'p1');
    const isActive=active===id;
    const disabled=K.s.turn!=='p1'||!!K.s.win||K.s.locked||K.s.phase!=='idle'||K.s.usedPlateThisTurn||isActive;
    return '<div class="plateCard'+(isActive?' active':'')+(powered?' powered':'')+'">'
      +'<img class="plateArt" src="'+p.asset+'" alt="'+plateName(id,powered)+'">'
      +'<div class="plateName">'+plateName(id,powered)+'</div>'
      +'<div class="plateDesc">'+(powered?K.plateMessage(id,true):p.desc)+'</div>'
      +'<button class="plateBtn" data-plate="'+id+'" '+(disabled?'disabled':'')+'>'+(isActive?'使用中':'確認')+'</button>'
      +'</div>';
  }).join('');
  const sync=K.hasCassetteSync('p1')?'<span class="hintPlate">モジュリン: 強化カセット中</span>':'<span class="hintPlate">1ターン1枚 / カセット連携あり</span>';
  root.innerHTML='<div class="platesTitle"><span>プレート</span>'+sync+'</div><div class="plateRow">'+cards+'</div>';
  root.querySelectorAll('[data-plate]').forEach(btn=>btn.onclick=()=>K.openPlateDialog(btn.dataset.plate));
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
      if(act.id==='cassette'&&(seg.c==='white'||seg.c==='gold'))v+=act.powered?20:10;
      if(act.id==='burstCassette'&&(seg.c==='white'||seg.c==='gold'))v+=act.powered?50:30;
      if(act.id==='goldCassette'&&act.powered&&(seg.c==='white'||seg.c==='gold'))v+=10;
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
    if(act&&p&&p.owner===act.owner){
      if(act.id==='jumpCassette'&&key==='jump')return true;
      if(act.id==='jumpCassette'&&act.powered&&key==='passThrough')return true;
      if(act.id==='phaseCassette'&&key==='passThrough')return true;
      if(act.id==='phaseCassette'&&act.powered&&key==='jump')return true;
    }
    return ability0?ability0(p,key):false;
  };
  const blocked0=K.blockedFor;
  K.blockedFor=function(p){
    const act=K.s&&K.s.activePlate;
    if(act&&act.id==='phaseCassette'&&p&&p.owner===act.owner)return new Set();
    if(act&&act.id==='jumpCassette'&&act.powered&&p&&p.owner===act.owner)return new Set();
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
      const add=act.id==='phaseCassette'?{passThrough:true,jump:!!act.powered}:{jump:true,passThrough:!!act.powered};
      f.ability=Object.assign({},old||{},add);
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
      if(ownSeg&&ownSeg.c!=='miss'&&ownSeg.c!=='blue')ownSeg.e=Object.assign({},ownSeg.e||{},act.powered?{swap:true,wait:1}:{swap:true});
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
    if(useNow&&act.id==='homeCassette'&&act.powered){p.status.condition=null;p.status.mpMinus=0;}
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
      K.log('プレート「'+plateName(K.s.activePlate.id,K.s.activePlate.powered)+'」は未使用のまま終了しました。');
      K.s.activePlate=null;
    }
    K.closePlateDialog&&K.closePlateDialog();
    const prev=K.s&&K.s.turn;
    end0.apply(this,arguments);
    if(K.s&&prev!==K.s.turn&&K.s.turn==='p1')K.s.usedPlateThisTurn=false;
  };
}
if(K.FIGURES&&K.FIGURES.modulyn){
  K.FIGURES.modulyn.ability={name:'カセットシンク',text:'モジュリンが盤面にいる間、自分のカセットが1段階上の「強化カセット」になります。',cassetteSync:true};
  K.FIGURES.modulyn.desc='カセット信号を読み替える小型メカ。盤面にいるだけで自分のカセットを強化カセットへ変化させる。';
}
})(window.KOMA);

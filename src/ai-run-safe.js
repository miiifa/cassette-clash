window.KOMA=window.KOMA||{};
(function(K){
function plans(o){const r=[];try{for(const p of K.s[o].field){if(K.canWakeByAlly(p))r.push({type:'wake',p});if(!K.canAct(p))continue;for(const d of K.battleableEnemies(p))r.push({type:'battle',p,d});for(const n of K.moveTargets(p,o))r.push({type:'move',p,n});}for(const p of K.s[o].bench){for(const n of K.entryTargets(p,o))r.push({type:'deploy',p,n});}}catch(e){K.log('AI候補生成エラー: '+e.message);}return r;}
function fallbackPlan(){const ps=plans('p2');const goal=ps.find(p=>(p.type==='move'||p.type==='deploy')&&p.n===K.TARGET.p2);if(goal)return goal;const battle=ps.find(p=>p.type==='battle');if(battle)return battle;const move=ps.find(p=>p.type==='move');if(move)return move;const dep=ps.find(p=>p.type==='deploy');if(dep)return dep;const wake=ps.find(p=>p.type==='wake');if(wake)return wake;return null;}
function valid(p){return p&&p.type&&p.p&&(p.type==='wake'||p.type==='battle'||p.n);}
K.runAi=function(){const s=K.s;if(!s||!s.ai||s.turn!=='p2'||s.win||s.locked)return;if(s.phase!=='idle')return;let p=null;try{p=K.chooseAiPlan&&K.chooseAiPlan();}catch(e){K.log('BOSS AI思考エラー: '+e.message);}if(!valid(p)){p=fallbackPlan();if(p)K.log('BOSS AI: 安全フォールバックで行動します。');}
if(!valid(p)){K.log('AIは動けません。');K.endTurn();return;}
try{
  if(p.type==='wake'){const old=p.p.status.condition;p.p.status.condition=null;K.log('BOSS AI: '+p.p.n+'の'+(old==='frozen'?'こおり':'ねむり')+'を治しました。');K.endTurn();return;}
  if(p.type==='deploy'){K.log('BOSS AI: '+p.p.n+'を出撃。');K.deploy(p.p,p.n);return;}
  if(p.type==='move'){K.log('BOSS AI: '+p.p.n+'が移動。');K.movePiece(p.p,p.n);return;}
  if(p.type==='battle'){K.s.pendingAttacker=p.p.id;K.log('BOSS AI: '+p.p.n+'で'+p.d.n+'にバトル。');K.startBattle(p.d.id);return;}
}catch(e){K.log('BOSS AI実行エラー: '+e.message);K.s.locked=false;K.s.phase='idle';K.endTurn();}}
K.scheduleAi=function(){clearTimeout(K.aiTimer);if(K.s&&K.s.ai&&K.s.turn==='p2'&&!K.s.win&&!K.s.locked&&K.s.phase==='idle')K.aiTimer=setTimeout(()=>K.runAi(),520);};
K.aiChooseEnemy=function(){const a=K.byId(K.s.pendingAttacker);if(!a||K.s.turn!=='p2'||K.s.phase!=='chooseBattle')return;let best=null;for(const e of K.battleableEnemies(a)){let sc=0;try{sc=(K.battleScore?K.battleScore(a,e):0)*25;if(K.moveTargets(e,'p1').includes(K.TARGET.p1))sc+=90000;}catch(_){}if(!best||sc>best.sc)best={e,sc};}if(best&&best.sc>-100){K.log('BOSS AI: '+best.e.n+'にバトルします。');K.startBattle(best.e.id);}else{K.log('BOSS AI: バトルしない。');K.endTurn();}};
})(window.KOMA);

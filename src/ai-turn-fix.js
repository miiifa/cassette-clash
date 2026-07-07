window.KOMA=window.KOMA||{};
(function(K){
K.DECKS={p1:['modulyn','pushwyrm','sleepvine','gaiarmor','phasecat','luminelle'],p2:['voidray','thornogre','mirrormoth','blastboar','stormrook','gaiarmor']};
function dist(a,b){if(a===b)return 0;const q=[a],m=new Map([[a,0]]);while(q.length){const c=q.shift(),d=m.get(c);for(const n of K.neigh(c)){if(m.has(n))continue;if(n===b)return d+1;m.set(n,d+1);q.push(n);}}return 99;}
function pieces(){return[...K.s.p1.bench,...K.s.p1.field,...K.s.p1.pc,...K.s.p2.bench,...K.s.p2.field,...K.s.p2.pc];}
function legal(o){const r=[];for(const p of K.s[o].field.slice()){try{if(K.canWakeByAlly(p))r.push({type:'wake',p});if(!K.canAct(p))continue;for(const x of K.battleableEnemies(p))r.push({type:'battle',p,d:x});for(const n of K.moveTargets(p,o))r.push({type:'move',p,n});}catch(e){}}for(const p of K.s[o].bench.slice()){try{for(const n of K.entryTargets(p,o))r.push({type:'deploy',p,n});}catch(e){}}return r;}
function valid(p){return p&&p.p&&(p.type==='wake'||p.type==='battle'||p.n);}
function goals(o){return legal(o).filter(x=>(x.type==='move'||x.type==='deploy')&&x.n===K.TARGET[o]);}
function snap(){return{f1:K.s.p1.field.slice(),b1:K.s.p1.bench.slice(),pc1:K.s.p1.pc.slice(),f2:K.s.p2.field.slice(),b2:K.s.p2.bench.slice(),pc2:K.s.p2.pc.slice(),pos:new Map(pieces().map(p=>[p.id,p.pos]))};}
function restore(s){K.s.p1.field=s.f1;K.s.p1.bench=s.b1;K.s.p1.pc=s.pc1;K.s.p2.field=s.f2;K.s.p2.bench=s.b2;K.s.p2.pc=s.pc2;for(const p of pieces())p.pos=s.pos.has(p.id)?s.pos.get(p.id):null;}
function apply(p){if(p.type==='move')p.p.pos=p.n;if(p.type==='deploy'){const pl=K.s[p.p.owner];pl.bench=pl.bench.filter(x=>x.id!==p.p.id);if(!pl.field.some(x=>x.id===p.p.id))pl.field.push(p.p);p.p.pos=p.n;}}
function isSurrounded(piece){if(!piece||!piece.pos)return false;const ns=K.neigh(piece.pos);return ns.length&&ns.every(n=>{const o=K.at(n);return o&&o.owner!==piece.owner;});}
function afterHumanGoal(p){const s=snap();try{apply(p);return goals('p1').length>0;}finally{restore(s);}}
function selfSurroundedAfter(p){const s=snap();try{apply(p);return isSurrounded(p.p);}finally{restore(s);}}
function safeGoal(p){return(p.type==='move'||p.type==='deploy')&&p.n===K.TARGET[p.p.owner]&&!selfSurroundedAfter(p);}
function holdsGoal(){return K.s.p2.field.find(p=>p.pos===K.TARGET.p1)||null;}
function humanThreats(){return goals('p1');}
function targetBlockers(ps){return ps.filter(x=>(x.type==='move'||x.type==='deploy')&&x.n===K.TARGET.p1&&!selfSurroundedAfter(x));}
function fieldCount(o){return K.s[o].field.length;}
function fastThreat(){return K.s.p1.field.some(p=>K.canAct(p)&&dist(p.pos,K.TARGET.p1)<=K.effectiveMp(p,'p1')+1);}
function guardNode(n){return n===K.TARGET.p1?20000000:500000-dist(n,K.TARGET.p1)*130000+(K.SPAWN.p1.includes(n)?80000:0);}
function attackNode(n){return 900000-dist(n,K.TARGET.p2)*120000+(K.SPAWN.p2.includes(n)?70000:0);}
function score(p){
  const blocker=holdsGoal();
  if(safeGoal(p))return 90000000;
  if((p.type==='move'||p.type==='deploy')&&p.n===K.TARGET.p2&&selfSurroundedAfter(p))return-95000000;
  if(p.type==='move'&&p.p.pos===K.TARGET.p1&&p.n!==K.TARGET.p1)return-90000000;
  if(afterHumanGoal(p))return-80000000;
  if(selfSurroundedAfter(p))return-70000000;
  if(p.type==='battle'){
    let s=160000+(K.battleScore?K.battleScore(p.p,p.d)*50:0);
    if(goals('p1').some(g=>g.p&&g.p.id===p.d.id))s+=12000000;
    if(p.d.pos&&dist(p.d.pos,K.TARGET.p1)<=K.effectiveMp(p.d,'p1'))s+=4500000;
    if(blocker&&p.p.id!==blocker.id)s+=500000;
    return s;
  }
  if(p.type==='move'||p.type==='deploy'){
    let s=0;
    if(p.n===K.TARGET.p1)s+=30000000;
    if(blocker&&p.p.id!==blocker.id){
      s+=attackNode(p.n)*3;
      s+=Math.max(0,8-dist(p.n,K.TARGET.p2))*45000;
      if(fieldCount('p2')<3&&p.type==='deploy')s+=1200000;
    }else{
      s+=(fastThreat()?10:2)*guardNode(p.n);
      s+=attackNode(p.n)*0.35;
    }
    if(K.ability&&K.ability(p.p,'jump'))s+=12000;
    if(K.ability&&K.ability(p.p,'passThrough'))s+=26000;
    if(p.type==='deploy'&&(p.p.fig==='voidray'||p.p.fig==='stormrook'||p.p.fig==='mirrormoth'||p.p.fig==='blastboar'))s+=90000;
    return s;
  }
  if(p.type==='wake')return 30000;
  return 0;
}
function think(){
  const ps=legal('p2');
  if(!ps.length)return null;
  let p=ps.find(x=>safeGoal(x));
  if(p)return p;

  const threats=humanThreats();
  if(threats.length){
    const blocks=targetBlockers(ps).sort((a,b)=>score(b)-score(a));
    if(blocks.length){K.log('BOSS AI: 即ゴールをゴール上で止めます。');return blocks[0];}
    const hit=ps.filter(x=>x.type==='battle'&&threats.some(t=>t.p&&t.p.id===x.d.id)).sort((a,b)=>score(b)-score(a))[0];
    if(hit){K.log('BOSS AI: 即ゴール駒を攻撃します。');return hit;}
  }

  const blocker=holdsGoal();
  if(blocker){
    const deploys=ps.filter(x=>x.type==='deploy'&&fieldCount('p2')<3&&score(x)>-10000000);
    if(deploys.length)return deploys.sort((a,b)=>score(b)-score(a))[0];
    const safe=ps.filter(x=>!(x.type==='move'&&x.p.id===blocker.id)&&score(x)>-10000000);
    return(safe.length?safe:ps).sort((a,b)=>score(b)-score(a))[0]||null;
  }

  p=targetBlockers(ps).sort((a,b)=>score(b)-score(a))[0];
  if(p)return p;
  const hg=goals('p1');
  p=ps.find(x=>x.type==='battle'&&hg.some(g=>g.p&&g.p.id===x.d.id));
  if(p)return p;
  const safe=ps.filter(x=>score(x)>-10000000);
  return(safe.length?safe:ps).sort((a,b)=>score(b)-score(a))[0];
}
function lose(o){K.s.win=K.other(o);K.s.locked=false;K.s.phase='idle';K.clearSelection&&K.clearSelection();K.log(o+'は完全に動けません。'+K.s.win+'の勝利です。');K.render&&K.render();}
function runLater(){clearTimeout(K.aiTimer);setTimeout(()=>{if(K.s&&K.s.turn==='p2'&&K.s.ai&&!K.s.win&&!K.s.locked&&K.s.phase==='idle')K.runAi();},80);}
K.chooseAiPlan=function(){return think();};
K.runAi=function(){const s=K.s;if(!s||!s.ai||s.turn!=='p2'||s.win||s.locked||s.phase!=='idle')return;const p=think();if(!valid(p)){lose('p2');return;}try{if(p.type==='wake'){p.p.status.condition=null;K.log('AI: '+p.p.n+'を回復。');K.endTurn();return;}if(p.type==='deploy'){K.log('AI: '+p.p.n+'を出撃。');K.deploy(p.p,p.n);return;}if(p.type==='move'){K.log('AI: '+p.p.n+'が移動。');K.movePiece(p.p,p.n);return;}if(p.type==='battle'){K.s.pendingAttacker=p.p.id;K.log('AI: '+p.p.n+'でバトル。');K.startBattle(p.d.id);return;}}catch(e){K.log('AI実行失敗。');lose('p2');}};
K.scheduleAi=function(){clearTimeout(K.aiTimer);if(K.s&&K.s.ai&&K.s.turn==='p2'&&!K.s.win&&!K.s.locked&&K.s.phase==='idle')K.aiTimer=setTimeout(()=>K.runAi(),160);};
const end0=K.endTurn;
K.endTurn=function(){end0.apply(this,arguments);if(K.s&&K.s.turn==='p2'&&K.s.ai&&!K.s.win&&!K.s.locked&&K.s.phase==='idle')runLater();};
})(window.KOMA);

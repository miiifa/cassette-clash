window.KOMA=window.KOMA||{};
(function(K){
K.DECKS={p1:['pikachu','charmander','squirtle','bulbasaur','gengar','koko'],p2:['koko','rotom','charizard','mewtwo','gyarados','deoxysD']};
function dist(a,b){if(a===b)return 0;const q=[a],m=new Map([[a,0]]);while(q.length){const c=q.shift(),d=m.get(c);for(const n of K.neigh(c)){if(m.has(n))continue;if(n===b)return d+1;m.set(n,d+1);q.push(n);}}return 99;}
function legal(o){const r=[];for(const p of K.s[o].field.slice()){try{if(K.canWakeByAlly(p))r.push({type:'wake',p});if(!K.canAct(p))continue;for(const x of K.battleableEnemies(p))r.push({type:'battle',p,d:x});for(const n of K.moveTargets(p,o))r.push({type:'move',p,n});}catch(e){}}for(const p of K.s[o].bench.slice()){try{for(const n of K.entryTargets(p,o))r.push({type:'deploy',p,n});}catch(e){}}return r;}
function valid(p){return p&&p.p&&(p.type==='wake'||p.type==='battle'||p.n);}
function goals(o){return legal(o).filter(x=>(x.type==='move'||x.type==='deploy')&&x.n===K.TARGET[o]);}
function fastThreat(){return K.s.p1.field.some(p=>K.canAct(p)&&dist(p.pos,K.TARGET.p1)<=K.effectiveMp(p,'p1')+1);}
function guardNode(n){return n===K.TARGET.p1?10000000:220000-dist(n,K.TARGET.p1)*50000+(K.SPAWN.p1.includes(n)?35000:0);}
function score(p){if((p.type==='move'||p.type==='deploy')&&p.n===K.TARGET.p2)return 9000000;if(p.type==='battle'){let s=120000+(K.battleScore?K.battleScore(p.p,p.d)*45:0);if(goals('p1').some(g=>g.p&&g.p.id===p.d.id))s+=4000000;if(dist(p.d.pos,K.TARGET.p1)<=K.effectiveMp(p.d,'p1'))s+=900000;return s;}if(p.type==='move'||p.type==='deploy'){let s=0;if(fastThreat())s+=guardNode(p.n)*5;else s+=guardNode(p.n);s+=Math.max(0,10-dist(p.n,K.TARGET.p2))*5000;if(K.ability&&K.ability(p.p,'jump'))s+=20000;if(K.ability&&K.ability(p.p,'passThrough'))s+=24000;if(p.type==='deploy'&&(p.p.fig==='koko'||p.p.fig==='rotom'))s+=80000;return s;}if(p.type==='wake')return 30000;return 0;}
function think(){const ps=legal('p2');if(!ps.length)return null;let p=ps.find(x=>(x.type==='move'||x.type==='deploy')&&x.n===K.TARGET.p2);if(p)return p;const hg=goals('p1');p=ps.find(x=>(x.type==='move'||x.type==='deploy')&&x.n===K.TARGET.p1);if(p)return p;p=ps.find(x=>x.type==='battle'&&hg.some(g=>g.p&&g.p.id===x.d.id));if(p)return p;return ps.sort((a,b)=>score(b)-score(a))[0];}
function lose(o){K.s.win=K.other(o);K.s.locked=false;K.s.phase='idle';K.clearSelection&&K.clearSelection();K.log(o+'は完全に動けません。'+K.s.win+'の勝利です。');K.render&&K.render();}
function runLater(){clearTimeout(K.aiTimer);setTimeout(()=>{if(K.s&&K.s.turn==='p2'&&K.s.ai&&!K.s.win&&!K.s.locked&&K.s.phase==='idle')K.runAi();},80);}
K.chooseAiPlan=function(){return think();};
K.runAi=function(){const s=K.s;if(!s||!s.ai||s.turn!=='p2'||s.win||s.locked||s.phase!=='idle')return;const p=think();if(!valid(p)){lose('p2');return;}try{if(p.type==='wake'){p.p.status.condition=null;K.log('AI: '+p.p.n+'を回復。');K.endTurn();return;}if(p.type==='deploy'){K.log('AI: '+p.p.n+'を出撃。');K.deploy(p.p,p.n);return;}if(p.type==='move'){K.log('AI: '+p.p.n+'が移動。');K.movePiece(p.p,p.n);return;}if(p.type==='battle'){K.s.pendingAttacker=p.p.id;K.log('AI: '+p.p.n+'でバトル。');K.startBattle(p.d.id);return;}}catch(e){K.log('AI実行失敗。');lose('p2');}};
K.scheduleAi=function(){clearTimeout(K.aiTimer);if(K.s&&K.s.ai&&K.s.turn==='p2'&&!K.s.win&&!K.s.locked&&K.s.phase==='idle')K.aiTimer=setTimeout(()=>K.runAi(),160);};
const end0=K.endTurn;
K.endTurn=function(){end0.apply(this,arguments);if(K.s&&K.s.turn==='p2'&&K.s.ai&&!K.s.win&&!K.s.locked&&K.s.phase==='idle')runLater();};
})(window.KOMA);

window.KOMA=window.KOMA||{};
(function(K){
K.DECKS={
  p1:['pikachu','charmander','squirtle','bulbasaur','gengar','koko'],
  p2:['charizard','machop','psyduck','dratini','deoxysD','mewtwo']
};
if(K.FIGURES.gengar&&K.FIGURES.gengar.ability){K.FIGURES.gengar.ability={name:'すりぬけ',text:'技名として扱います。移動で他のポケモンを通り抜ける効果はありません。'};}
if(K.FIGURES.rotom&&K.FIGURES.rotom.ability){K.FIGURES.rotom.ability={name:'ふゆう',text:'移動で他のポケモンを通り抜ける効果はありません。'};}
K.aiTraining={decisions:[],games:0};
const MEM='koma_ai_play_memory_v1';
function keys(){return Object.keys(K.DEFAULT_AI_WEIGHTS||{});}
function getW(){return K.getAiWeights?K.getAiWeights():JSON.parse(JSON.stringify(K.DEFAULT_AI_WEIGHTS||{}));}
function saveW(w){return K.saveAiWeights?K.saveAiWeights(w):w;}
function mem(){try{return JSON.parse(localStorage.getItem(MEM)||'{"n":0,"f":{}}');}catch(e){return{n:0,f:{}};}}
function saveMem(m){try{localStorage.setItem(MEM,JSON.stringify(m));}catch(e){}}
K.playMemory=mem;
function other(o){return o==='p1'?'p2':'p1';}
function dist(a,b){if(a===b)return 0;const q=[a],seen=new Map([[a,0]]);while(q.length){const c=q.shift(),d=seen.get(c);for(const n of K.neigh(c)){if(seen.has(n))continue;if(n===b)return d+1;seen.set(n,d+1);q.push(n);}}return 99;}
function plans(o){const r=[];for(const p of K.s[o].field){if(K.canWakeByAlly(p))r.push({type:'wake',p});if(!K.canAct(p))continue;for(const e of K.battleableEnemies(p))r.push({type:'battle',p,d:e});for(const n of K.moveTargets(p,o))r.push({type:'move',p,n});}for(const p of K.s[o].bench)for(const n of K.entryTargets(p,o))r.push({type:'deploy',p,n});return r;}
function goalPlans(o){return plans(o).filter(p=>(p.type==='move'||p.type==='deploy')&&p.n===K.TARGET[o]);}
function withPlan(p,fn){if(!p)return fn();if(p.type==='move'){const old=p.p.pos;p.p.pos=p.n;const r=fn();p.p.pos=old;return r;}if(p.type==='deploy'){const pl=K.s[p.p.owner],old=p.p.pos;pl.bench=pl.bench.filter(x=>x.id!==p.p.id);pl.field.push(p.p);p.p.pos=p.n;const r=fn();pl.field=pl.field.filter(x=>x.id!==p.p.id);pl.bench.push(p.p);p.p.pos=old;return r;}return fn();}
function surroundGain(piece,node){const e=other(piece.owner),old=piece.pos;piece.pos=node;let g=0;for(const x of K.s[e].field){const ns=K.neigh(x.pos);if(ns.length&&ns.every(m=>{const a=K.at(m);return a&&a.owner===piece.owner;}))g++;}piece.pos=old;return g;}
function surroundRisk(piece,node){const e=other(piece.owner),old=piece.pos;piece.pos=node;let en=0,empty=0,ns=K.neigh(node);for(const n of ns){const a=K.at(n);if(a&&a.owner===e)en++;else if(!a)empty++;}piece.pos=old;if(ns.length&&en===ns.length)return 5;if(en>=2&&empty<=1)return 3;if(en>=2)return 1;return 0;}
function feat(p,o){const e=other(o),f={goalNow:0,blockGoal:0,oppGoal:0,goalDist:0,goalThreat:0,spawnBlock:0,ownSpawnBlocked:0,center:0,surroundKill:0,surroundRisk:0,battle:0,statusInflict:0,statusSuffer:0,tempo:1};if(!p)return f;if((p.type==='move'||p.type==='deploy')&&p.n===K.TARGET[o])f.goalNow=1;if(goalPlans(e).length)f.oppGoal=1;if(p.type==='wake'){f.tempo=.4;return f;}if(p.type==='battle'){f.battle=(K.battleScore?K.battleScore(p.p,p.d):0)/180;if(K.moveTargets(p.d,e).includes(K.TARGET[e]))f.blockGoal=1;return f;}if(p.type==='move'||p.type==='deploy'){const n=p.n,d=dist(n,K.TARGET[o]);f.goalDist=Math.max(0,7-d)/7;if(K.effectiveMp(p.p,o)>=d)f.goalThreat=1;if(n===K.TARGET[e])f.blockGoal=1;if(K.SPAWN[e].includes(n))f.spawnBlock=1;if(K.SPAWN[o].includes(n))f.ownSpawnBlocked=1;if(['it1','it2','it3','im1','im3','ib1','ib2','ib3'].includes(n))f.center=1;f.surroundKill=surroundGain(p.p,n);f.surroundRisk=surroundRisk(p.p,n);for(const a of K.s[e].field)if(a.pos&&K.neigh(n).includes(a.pos)){f.battle+=(K.battleScore?K.battleScore(p.p,a):0)/240;}}return f;}
function value(f){const W=getW();let s=0;for(const k in f)s+=(W[k]||0)*(f[k]||0);return s;}
function humanLike(f){const m=mem();if(!m.n)return 0;let s=0;for(const k in f)s+=(m.f[k]||0)/m.n*(f[k]||0);return s*1300;}
function basicScore(p,o){const e=other(o),f=feat(p,o);let s=value(f)*.2;if(f.goalNow)s+=2000000;if(f.blockGoal&&goalPlans(e).length)s+=1400000;if(goalPlans(e).length&&!f.blockGoal)s-=1800000;if(p.type==='battle')s+=(K.battleScore?K.battleScore(p.p,p.d):0)*22;if(p.type==='move'||p.type==='deploy'){s-=surroundRisk(p.p,p.n)*4500;s+=surroundGain(p.p,p.n)*18000;s-=dist(p.n,K.TARGET[o])*850;}return s;}
function ranked(o,n){return plans(o).map(p=>({p,score:basicScore(p,o)+humanLike(feat(p,o))})).sort((a,b)=>b.score-a.score).slice(0,n);}
function humanReplyValue(aiPlan){return withPlan(aiPlan,()=>{let best=0;for(const h of ranked('p1',10)){let aiCounter=0;withPlan(h.p,()=>{for(const a of ranked('p2',6))aiCounter=Math.max(aiCounter,a.score);});best=Math.max(best,h.score-aiCounter*.45);}return best;});}
function emergencyBlock(){const hp=goalPlans('p1');if(!hp.length)return null;let best=null;for(const p of plans('p2')){let sc=basicScore(p,'p2');if((p.type==='move'||p.type==='deploy')&&p.n===K.TARGET.p1)sc+=2000000;if(p.type==='battle'&&hp.some(h=>h.p===p.d))sc+=1600000+(K.battleScore?K.battleScore(p.p,p.d)*30:0);sc-=humanReplyValue(p)*.3;if(!best||sc>best.score)best={...p,score:sc,feat:feat(p,'p2')};}if(best)K.log('BOSS AI: 即負け筋を最優先で処理します。');return best;}
K.chooseAiPlan=function(){const ps=plans('p2');const win=ps.find(p=>(p.type==='move'||p.type==='deploy')&&p.n===K.TARGET.p2);if(win)return{...win,score:2000000,feat:feat(win,'p2')};const block=emergencyBlock();if(block)return block;let cand=ps.map(p=>({p,base:basicScore(p,'p2')})).sort((a,b)=>b.base-a.base).slice(0,20),best=null;for(const c of cand){const f=feat(c.p,'p2');let sc=c.base-humanReplyValue(c.p)*.95+Math.random();if(f.spawnBlock)sc+=18000;if(f.surroundKill)sc+=35000*f.surroundKill;if(f.blockGoal)sc+=20000;if(!best||sc>best.score)best={...c.p,score:sc,feat:f};}return best;};
K.recordAiDecision=function(f,score){K.aiTraining.decisions.push({feat:f||{},score:score||0});if(K.aiTraining.decisions.length>120)K.aiTraining.decisions.shift();};
K.learnFromOutcome=function(winner){if(!K.aiTraining.decisions.length)return;const r=winner==='p2'?1:winner==='p1'?-1:0;if(!r)return;const W=getW(),base=K.DEFAULT_AI_WEIGHTS,start=Math.max(0,K.aiTraining.decisions.length-8);for(let i=start;i<K.aiTraining.decisions.length;i++){const d=K.aiTraining.decisions[i],rec=(i-start+1)/8,lr=winner==='p1'?.08:.04;for(const k of keys()){const x=Number(d.feat[k]||0);if(x)W[k]+=r*x*Math.max(1,Math.abs(base[k]||1))*lr*rec;}}saveW(W);K.aiTraining.decisions=[];K.aiTraining.games++;K.log('BOSS AI反省: '+winner+' を反映。対局 '+K.aiTraining.games);};
function sample(){const r=Math.random,f={};for(const k of keys())f[k]=0;f.tempo=1;const m=Math.floor(r()*7);if(m===0)f.goalNow=1;if(m===1){f.blockGoal=1;f.oppGoal=1;}if(m===2){f.battle=r()*2-0.5;f.statusInflict=r();f.statusSuffer=r()*.7;}if(m===3){f.surroundKill=r();f.surroundRisk=r()*1.6;}if(m===4){f.goalDist=r();f.goalThreat=r()>.5?1:0;}if(m===5){f.spawnBlock=r()>.4?1:0;f.ownSpawnBlocked=r()>.55?1:0;}if(m===6){f.center=r();f.pc=r()*2-1;f.field=r()*2-1;}return f;}
function expert(f){let s=0;if(f.goalNow)s+=150;if(f.blockGoal&&f.oppGoal)s+=130;if(f.oppGoal&&!f.blockGoal)s-=150;s+=f.goalDist*15+f.goalThreat*40;s+=f.spawnBlock*28-f.ownSpawnBlocked*45;s+=f.surroundKill*75-f.surroundRisk*55;s+=f.battle*25+f.statusInflict*10-f.statusSuffer*12+s+f.center*5;return s;}
function pred(f,W){let s=0;for(const k of keys())s+=(W[k]||0)*(f[k]||0)/Math.max(1,Math.abs((K.DEFAULT_AI_WEIGHTS||{})[k]||1));return s;}
K.runLocalTraining=function(rounds){rounds=rounds||1600;const W=getW(),base=K.DEFAULT_AI_WEIGHTS;let err=0;for(let i=0;i<rounds;i++){const f=sample(),y=expert(f),p=pred(f,W),e=y-p;err+=Math.abs(e);for(const k of keys()){const x=f[k]||0;if(x)W[k]+=e*x*.13*Math.max(1,Math.abs(base[k]||1))/100;}}saveW(W);K.log('BOSS AI学習: '+rounds+' サンプル完了 / 平均誤差 '+Math.round(err/rounds));K.render&&K.render();};
K.resetLocalTraining=function(){K.resetAiWeights&&K.resetAiWeights();K.aiTraining.decisions=[];try{localStorage.removeItem(MEM);}catch(e){}K.log('BOSS AIの学習重みと手筋記憶を初期化しました。');K.render&&K.render();};
function recordHuman(p){if(!p||!p.p||p.p.owner!=='p1')return;const m=mem(),f=feat(p,'p1');m.n=(m.n||0)+1;for(const k in f)m.f[k]=(m.f[k]||0)+f[k];saveMem(m);}
const om=K.movePiece,od=K.deploy,ob=K.startBattle;
K.movePiece=function(p,n){if(K.s&&K.s.turn==='p1')recordHuman({type:'move',p,n});return om.apply(this,arguments);};
K.deploy=function(p,n){if(K.s&&K.s.turn==='p1')recordHuman({type:'deploy',p,n});return od.apply(this,arguments);};
K.startBattle=function(id){const a=K.byId(K.s.pendingAttacker||K.s.selectedId),d=K.byId(id);if(a&&a.owner==='p1'&&d)recordHuman({type:'battle',p:a,d});return ob.apply(this,arguments);};
const oldBind=K.bindUi;
K.bindUi=function(){oldBind&&oldBind();const train=document.querySelector('#trainAiBtn'),reset=document.querySelector('#resetLearnBtn');if(train)train.onclick=function(){K.runLocalTraining(1600);};if(reset)reset.onclick=function(){K.resetLocalTraining();};if(!K.render._learnHook){const br=K.render;K.render=function(){br();if(K.s&&K.s.win&&!K.s._learned){K.s._learned=true;K.learnFromOutcome&&K.learnFromOutcome(K.s.win);}};K.render._learnHook=true;}};
})(window.KOMA);

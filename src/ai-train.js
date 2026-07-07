window.KOMA=window.KOMA||{};
(function(K){
K.DECKS={
  p1:['pikachu','charmander','squirtle','bulbasaur','gengar','koko'],
  p2:['charizard','machop','psyduck','dratini','deoxysD','mewtwo']
};
K.aiTraining={decisions:[],games:0};
const MEM='koma_ai_play_memory_v1';
function other(o){return o==='p1'?'p2':'p1';}
function mem(){try{return JSON.parse(localStorage.getItem(MEM)||'{"n":0,"f":{}}');}catch(e){return{n:0,f:{}};}}
function saveMem(m){try{localStorage.setItem(MEM,JSON.stringify(m));}catch(e){}}
K.playMemory=mem;
function dist(a,b){if(a===b)return 0;const q=[a],seen=new Map([[a,0]]);while(q.length){const c=q.shift(),d=seen.get(c);for(const n of K.neigh(c)){if(seen.has(n))continue;if(n===b)return d+1;seen.set(n,d+1);q.push(n);}}return 99;}
function allPlans(o){const r=[];for(const p of K.s[o].field){if(K.canWakeByAlly(p))r.push({type:'wake',p});if(!K.canAct(p))continue;for(const d of K.battleableEnemies(p))r.push({type:'battle',p,d});for(const n of K.moveTargets(p,o))r.push({type:'move',p,n});}for(const p of K.s[o].bench){for(const n of K.entryTargets(p,o))r.push({type:'deploy',p,n});}return r;}
function goalPlans(o){return allPlans(o).filter(p=>(p.type==='move'||p.type==='deploy')&&p.n===K.TARGET[o]);}
function snap(){return{p1f:K.s.p1.field.slice(),p1b:K.s.p1.bench.slice(),p2f:K.s.p2.field.slice(),p2b:K.s.p2.bench.slice(),pos:new Map(K.all().map(p=>[p.id,p.pos]))};}
function restore(s){K.s.p1.field=s.p1f;K.s.p1.bench=s.p1b;K.s.p2.field=s.p2f;K.s.p2.bench=s.p2b;for(const p of K.all())p.pos=s.pos.get(p.id);}
function applyVirtual(p){if(!p)return;if(p.type==='move'){p.p.pos=p.n;return;}if(p.type==='deploy'){const pl=K.s[p.p.owner];pl.bench=pl.bench.filter(x=>x.id!==p.p.id);if(!pl.field.some(x=>x.id===p.p.id))pl.field.push(p.p);p.p.pos=p.n;}}
function withPlan(p,fn){const s=snap();try{applyVirtual(p);return fn();}finally{restore(s);}}
function surroundGain(piece,node){const s=snap();piece.pos=node;let g=0,e=other(piece.owner);for(const x of K.s[e].field){const ns=K.neigh(x.pos);if(ns.length&&ns.every(n=>{const a=K.at(n);return a&&a.owner===piece.owner;}))g++;}restore(s);return g;}
function surroundRisk(piece,node){const s=snap();piece.pos=node;let en=0,empty=0,e=other(piece.owner),ns=K.neigh(node);for(const n of ns){const a=K.at(n);if(a&&a.owner===e)en++;else if(!a)empty++;}restore(s);if(ns.length&&en===ns.length)return 5;if(en>=2&&empty<=1)return 3;if(en>=2)return 1;return 0;}
function dangerousHumanPieces(){const gp=goalPlans('p1');return new Set(gp.map(x=>x.p.id));}
function canHumanWinAfter(p){return withPlan(p,()=>goalPlans('p1').length>0);}
function canAiWinAfterHuman(p){return withPlan(p,()=>goalPlans('p2').length>0);}
function humanReplyScore(p){return withPlan(p,()=>{let b=0;for(const h of allPlans('p1'))b=Math.max(b,rawScore(h,'p1',true));return b;});}
function routeScore(p,o){if(!(p.type==='move'||p.type==='deploy'))return 0;const n=p.n,goal=K.TARGET[o],enemyGoal=K.TARGET[other(o)];let s=0,d=dist(n,goal);s+=(12-d)*2200;if(K.effectiveMp(p.p,o)>=d)s+=28000;if(n===goal)s+=3000000;if(n===enemyGoal)s+=900000;if(K.SPAWN[other(o)].includes(n))s+=12000;if(K.SPAWN[o].includes(n))s-=18000;if(['it1','it2','it3','im1','im3','ib1','ib2','ib3'].includes(n))s-=3500;s+=surroundGain(p.p,n)*30000;s-=surroundRisk(p.p,n)*24000;for(const e of K.s[other(o)].field){if(e.pos&&K.neigh(n).includes(e.pos))s+=(K.battleScore?K.battleScore(p.p,e):0)*6;}return s;}
function battleScorePlan(p,o){if(p.type!=='battle')return 0;let s=0,bs=K.battleScore?K.battleScore(p.p,p.d):0;s+=bs*35;const danger=dangerousHumanPieces();if(o==='p2'&&danger.has(p.d.id))s+=1500000;if(K.moveTargets(p.d,other(o)).includes(K.TARGET[other(o)]))s+=300000;return s;}
function rawScore(p,o,forHuman){let s=0;if(!p)return-99999999;if((p.type==='move'||p.type==='deploy')&&p.n===K.TARGET[o])s+=9000000;s+=routeScore(p,o);s+=battleScorePlan(p,o);if(p.type==='wake')s+=3000;if(o==='p2'&&!forHuman){if(canHumanWinAfter(p))s-=8000000;if(canAiWinAfterHuman(p))s+=900000;}return s;}
function pickBest(list,o){let best=null;for(const p of list){let sc=rawScore(p,o,false);if(o==='p2')sc-=Math.max(0,humanReplyScore(p))*0.55;if(!best||sc>best.score)best={...p,score:sc,feat:{tempo:1}};}return best;}
function emergencyBlock(){const threats=goalPlans('p1');if(!threats.length)return null;const plans=allPlans('p2');let blocks=plans.filter(p=>(p.type==='move'||p.type==='deploy')&&p.n===K.TARGET.p1);let attacks=plans.filter(p=>p.type==='battle'&&threats.some(t=>t.p.id===p.d.id));let cand=blocks.concat(attacks);if(!cand.length)cand=plans;const best=pickBest(cand,'p2');if(best)K.log('BOSS AI: 人間の即ゴールを止めます。');return best;}
K.chooseAiPlan=function(){const plans=allPlans('p2');const win=plans.find(p=>(p.type==='move'||p.type==='deploy')&&p.n===K.TARGET.p2);if(win)return{...win,score:9999999,feat:{goalNow:1,tempo:1}};const block=emergencyBlock();if(block)return block;const safe=plans.filter(p=>!canHumanWinAfter(p));const pool=safe.length?safe:plans;return pickBest(pool,'p2');};
K.recordAiDecision=function(f,score){K.aiTraining.decisions.push({feat:f||{},score:score||0});if(K.aiTraining.decisions.length>80)K.aiTraining.decisions.shift();};
K.learnFromOutcome=function(winner){K.aiTraining.games++;K.aiTraining.decisions=[];K.log('BOSS AI記録: '+winner+' / 対局 '+K.aiTraining.games+'。重み学習は暴走防止のため停止中。');};
K.runLocalTraining=function(){K.log('BOSS AI: 今は重み学習より詰み/受け読みを優先しています。学習データは手筋記憶だけ保存します。');};
K.resetLocalTraining=function(){if(K.resetAiWeights)K.resetAiWeights();K.aiTraining.decisions=[];try{localStorage.removeItem(MEM);}catch(e){}K.log('BOSS AIのローカル重みと手筋記憶を初期化しました。');K.render&&K.render();};
function fForHuman(p){return{goalNow:(p.type==='move'||p.type==='deploy')&&p.n===K.TARGET.p1?1:0,goalDist:(p.n?Math.max(0,8-dist(p.n,K.TARGET.p1))/8:0),goalThreat:(p.n&&K.effectiveMp(p.p,'p1')>=dist(p.n,K.TARGET.p1))?1:0,spawnBlock:(p.n&&K.SPAWN.p2.includes(p.n))?1:0,center:(p.n&&['it1','it2','it3','im1','im3','ib1','ib2','ib3'].includes(p.n))?1:0,battle:p.type==='battle'?(K.battleScore?K.battleScore(p.p,p.d):0)/200:0,tempo:1};}
function recordHuman(p){if(!p||!p.p||p.p.owner!=='p1')return;const m=mem(),f=fForHuman(p);m.n=(m.n||0)+1;m.f=m.f||{};for(const k in f)m.f[k]=(m.f[k]||0)+f[k];saveMem(m);}
const om=K.movePiece,od=K.deploy,ob=K.startBattle;
K.movePiece=function(p,n){if(K.s&&K.s.turn==='p1')recordHuman({type:'move',p,n});return om.apply(this,arguments);};
K.deploy=function(p,n){if(K.s&&K.s.turn==='p1')recordHuman({type:'deploy',p,n});return od.apply(this,arguments);};
K.startBattle=function(id){const a=K.byId(K.s.pendingAttacker||K.s.selectedId),d=K.byId(id);if(a&&a.owner==='p1'&&d)recordHuman({type:'battle',p:a,d});return ob.apply(this,arguments);};
const oldBind=K.bindUi;
K.bindUi=function(){oldBind&&oldBind();const train=document.querySelector('#trainAiBtn'),reset=document.querySelector('#resetLearnBtn');if(train)train.onclick=function(){K.runLocalTraining();};if(reset)reset.onclick=function(){K.resetLocalTraining();};if(!K.render._learnHook){const br=K.render;K.render=function(){br();if(K.s&&K.s.win&&!K.s._learned){K.s._learned=true;K.learnFromOutcome&&K.learnFromOutcome(K.s.win);}};K.render._learnHook=true;}};
})(window.KOMA);

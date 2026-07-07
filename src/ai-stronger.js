window.KOMA=window.KOMA||{};
(function(K){
const KEY='koma_ai_play_memory_v1';
function mem(){try{return JSON.parse(localStorage.getItem(KEY)||'{"n":0,"f":{}}');}catch(e){return{n:0,f:{}};}}
function save(m){try{localStorage.setItem(KEY,JSON.stringify(m));}catch(e){}}
function other(o){return o==='p1'?'p2':'p1';}
function dist(a,b){if(a===b)return 0;const q=[a],seen=new Map([[a,0]]);while(q.length){const c=q.shift(),d=seen.get(c);for(const n of K.neigh(c)){if(seen.has(n))continue;if(n===b)return d+1;seen.set(n,d+1);q.push(n);}}return 99;}
function plans(o){const r=[];for(const p of K.s[o].field){if(K.canWakeByAlly(p))r.push({type:'wake',p});if(!K.canAct(p))continue;for(const e of K.battleableEnemies(p))r.push({type:'battle',p,d:e});for(const n of K.moveTargets(p,o))r.push({type:'move',p,n});}for(const p of K.s[o].bench)for(const n of K.entryTargets(p,o))r.push({type:'deploy',p,n});return r;}
function goals(o){const r=[];for(const p of K.s[o].field)if(K.canAct(p)&&K.moveTargets(p,o).includes(K.TARGET[o]))r.push(p);for(const p of K.s[o].bench)if(K.entryTargets(p,o).includes(K.TARGET[o]))r.push(p);return r;}
function risk(p,n){const e=other(p.owner),old=p.pos;p.pos=n;let en=0,emp=0,ns=K.neigh(n);for(const x of ns){const a=K.at(x);if(a&&a.owner===e)en++;else if(!a)emp++;}p.pos=old;if(ns.length&&en===ns.length)return 5;if(en>=2&&emp<=1)return 3;if(en>=2)return 1;return 0;}
function gain(p,n){const e=other(p.owner),old=p.pos;p.pos=n;let g=0;for(const x of K.s[e].field){const ns=K.neigh(x.pos);if(ns.length&&ns.every(m=>{const a=K.at(m);return a&&a.owner===p.owner;}))g++;}p.pos=old;return g;}
function feat(p,o){const e=other(o),f={goal:0,block:0,threat:0,center:0,spawn:0,badspawn:0,surround:0,risk:0,battle:0};if(!p)return f;if((p.type==='move'||p.type==='deploy')&&p.n===K.TARGET[o])f.goal=1;if(p.type==='battle'){f.battle=(K.battleScore?K.battleScore(p.p,p.d):0)/200;if(K.moveTargets(p.d,e).includes(K.TARGET[e]))f.block=1;return f;}if(p.type==='move'||p.type==='deploy'){const n=p.n,d=dist(n,K.TARGET[o]);f.threat=Math.max(0,6-d)/6;if(n===K.TARGET[e])f.block=1;if(['it1','it2','it3','im1','im3','ib1','ib2','ib3'].includes(n))f.center=1;if(K.SPAWN[e].includes(n))f.spawn=1;if(K.SPAWN[o].includes(n))f.badspawn=1;f.surround=gain(p.p,n);f.risk=risk(p.p,n);for(const a of K.s[e].field)if(a.pos&&K.neigh(n).includes(a.pos))f.battle+=(K.battleScore?K.battleScore(p.p,a):0)/240;}return f;}
function like(f,m){if(!m.n)return 0;let s=0;for(const k in f)s+=(m.f[k]||0)/m.n*(f[k]||0);return s*900;}
function score(p,o){const e=other(o),f=feat(p,o),W=K.getAiWeights?K.getAiWeights():K.DEFAULT_AI_WEIGHTS;let s=0;if(f.goal)s+=1000000;if(f.block&&goals(e).length)s+=900000;if(goals(e).length&&!f.block)s-=900000;s+=f.threat*(W.goalThreat||5000);s+=f.center*(W.center||100);s+=f.spawn*(W.spawnBlock||900);s+=f.badspawn*(W.ownSpawnBlocked||-1200);s+=f.surround*(W.surroundKill||7000);s-=f.risk*2600;s+=f.battle*(W.battle||12)*18;return s;}
function withPlan(p,fn){if(p.type==='move'){const old=p.p.pos;p.p.pos=p.n;const r=fn();p.p.pos=old;return r;}if(p.type==='deploy'){const pl=K.s[p.p.owner],old=p.p.pos;pl.bench=pl.bench.filter(x=>x.id!==p.p.id);pl.field.push(p.p);p.p.pos=p.n;const r=fn();pl.field=pl.field.filter(x=>x.id!==p.p.id);pl.bench.push(p.p);p.p.pos=old;return r;}return fn();}
function replyValue(p){const m=mem();return withPlan(p,()=>{let best=0;for(const q of plans('p1'))best=Math.max(best,score(q,'p1')+like(feat(q,'p1'),m));return best;});}
K.chooseAiPlan=function(){const ps=plans('p2'),win=ps.find(p=>(p.type==='move'||p.type==='deploy')&&p.n===K.TARGET.p2);if(win)return{...win,score:1000000,feat:feat(win,'p2')};let best=null;for(const p of ps){const f=feat(p,'p2');let s=score(p,'p2')-replyValue(p)*.75+Math.random();if(!best||s>best.score)best={...p,score:s,feat:f};}return best;};
function record(p){if(!p||!p.p||p.p.owner!=='p1')return;const m=mem(),f=feat(p,'p1');m.n=(m.n||0)+1;for(const k in f)m.f[k]=(m.f[k]||0)+f[k];save(m);}
const om=K.movePiece,od=K.deploy,ob=K.startBattle;
K.movePiece=function(p,n){if(K.s&&K.s.turn==='p1')record({type:'move',p,n});return om.apply(this,arguments);};
K.deploy=function(p,n){if(K.s&&K.s.turn==='p1')record({type:'deploy',p,n});return od.apply(this,arguments);};
K.startBattle=function(id){const a=K.byId(K.s.pendingAttacker||K.s.selectedId),d=K.byId(id);if(a&&a.owner==='p1'&&d)record({type:'battle',p:a,d});return ob.apply(this,arguments);};
})(window.KOMA);

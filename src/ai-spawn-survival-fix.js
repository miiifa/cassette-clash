window.KOMA=window.KOMA||{};
(function(K){
if(K._aiSpawnSurvivalFixPatched)return;
K._aiSpawnSurvivalFixPatched=true;
function arr(x){return Array.isArray(x)?x:[];}
function mini(p){return p?{id:p.id,name:p.n,fig:p.fig,pos:p.pos||null,owner:p.owner,mp:p.mp,wait:p.wait||0,condition:p.status&&p.status.condition||null,mpMinus:p.status&&p.status.mpMinus||0,boss:!!p.boss}:null;}
function canAct(p){return !!(p&&K.canAct&&K.canAct(p));}
function scoreBattle(a,d){try{return K.battleScore?K.battleScore(a,d):0;}catch(e){return 0;}}
function spawnBlockers(owner){
  const enemy=K.other(owner),out=[];
  for(const n of arr(K.SPAWN&&K.SPAWN[owner])){
    const p=K.at&&K.at(n);
    if(p&&p.owner===enemy)out.push({node:n,p});
  }
  return out;
}
function immediateGoal(owner){
  const goal=K.TARGET&&K.TARGET[owner];
  if(!goal||K.at(goal))return null;
  for(const p of arr(K.s&&K.s[owner]&&K.s[owner].field))if(canAct(p)&&K.moveTargets(p,owner).includes(goal))return {type:'move',p,n:goal,score:1000000,why:'spawn_survival_take_goal'};
  for(const p of arr(K.s&&K.s[owner]&&K.s[owner].bench))if(K.entryTargets(p,owner).includes(goal))return {type:'deploy',p,n:goal,score:1000000,why:'spawn_survival_take_goal'};
  return null;
}
function battleBlocker(owner,blockers){
  let best=null;
  function set(plan,score,why){if(!best||score>best.score)best={...plan,score,why};}
  for(const b of blockers){
    for(const p of arr(K.s&&K.s[owner]&&K.s[owner].field)){
      if(canAct(p)&&p.pos&&K.neigh(p.pos).includes(b.node))set({type:'battle',p,d:b.p},965000+scoreBattle(p,b.p)*35,'spawn_survival_battle_blocker');
    }
  }
  return best;
}
function moveToHitBlocker(owner,blockers){
  let best=null;
  function set(plan,score,why,target){
    if(!best||score>best.score)best={...plan,score,why,spawnTarget:target};
  }
  for(const b of blockers){
    for(const p of arr(K.s&&K.s[owner]&&K.s[owner].field)){
      if(!canAct(p))continue;
      for(const n of K.moveTargets(p,owner)){
        if(K.at(n))continue;
        if(K.neigh(n).includes(b.node)){
          const keepGoal=(n===(K.TARGET&&K.TARGET[K.other(owner)]))?25000:0;
          set({type:'move',p,n},910000+keepGoal+scoreBattle(p,b.p)*18,'spawn_survival_mark_blocker',b.p);
        }
      }
    }
  }
  return best;
}
function occupyFreeSpawn(owner,blockers){
  const spawns=arr(K.SPAWN&&K.SPAWN[owner]);
  if(!spawns.length)return null;
  const free=spawns.find(n=>!K.at(n));
  if(!free)return null;
  let best=null;
  function set(plan,score,why){if(!best||score>best.score)best={...plan,score,why};}
  for(const p of arr(K.s&&K.s[owner]&&K.s[owner].field))if(canAct(p)&&K.moveTargets(p,owner).includes(free))set({type:'move',p,n:free},835000,'spawn_survival_hold_free_spawn');
  return best;
}
function chooseSpawnSurvival(owner){
  if(!K.s||!K.s[owner])return null;
  const bench=arr(K.s[owner].bench),field=arr(K.s[owner].field),blockers=spawnBlockers(owner);
  if(!bench.length||!blockers.length)return null;
  const allBlocked=arr(K.SPAWN&&K.SPAWN[owner]).length>0&&blockers.length>=arr(K.SPAWN&&K.SPAWN[owner]).length;
  const critical=allBlocked||field.length<=1||blockers.length>=2;
  if(!critical)return null;
  const win=immediateGoal(owner);
  if(win)return win;
  return battleBlocker(owner,blockers)||moveToHitBlocker(owner,blockers)||occupyFreeSpawn(owner,blockers)||null;
}
function out(plan){return plan?{type:plan.type,piece:mini(plan.p),to:plan.n||null,defender:mini(plan.d),spawnTarget:mini(plan.spawnTarget),score:Math.round(plan.score||0),why:plan.why||null}:null;}
const choose0=K.chooseAiPlan;
if(choose0){
  K.chooseAiPlan=function(){
    const plan=chooseSpawnSurvival('p2');
    if(plan){
      K.log&&K.log('AI生存防衛: 出撃地点を塞がれて詰む前に解除します。');
      if(K.learningAddEvent)K.learningAddEvent('ai_spawn_survival',{chosen:out(plan),blockers:spawnBlockers('p2').map(x=>({node:x.node,piece:mini(x.p)})),field:arr(K.s&&K.s.p2&&K.s.p2.field).map(mini),bench:arr(K.s&&K.s.p2&&K.s.p2.bench).map(mini)});
      return plan;
    }
    return choose0.apply(this,arguments);
  };
}
})(window.KOMA);

window.KOMA=window.KOMA||{};
(function(K){
function canThreatGoal(p,owner){
  return !!(p&&p.pos&&K.canAct(p)&&K.moveTargets(p,owner).includes(K.TARGET[owner]));
}
function enemyGoalThreats(owner){
  const enemy=K.other(owner);
  const out=[];
  for(const p of K.s[enemy].field)if(canThreatGoal(p,enemy))out.push(p);
  return out;
}
function plansFor(owner){
  const plans=[];
  for(const p of K.s[owner].field){
    if(!K.canAct(p))continue;
    for(const e of K.battleableEnemies(p))plans.push({type:'battle',p,d:e,kind:'direct-battle'});
    for(const n of K.moveTargets(p,owner))plans.push({type:'move',p,n,kind:'move'});
  }
  for(const p of K.s[owner].bench){
    if(p.wait>0)continue;
    for(const n of K.entryTargets(p,owner))plans.push({type:'deploy',p,n,kind:'deploy'});
  }
  return plans;
}
function planAttacksThreat(plan,threat){
  if(plan.type==='battle')return plan.d&&plan.d.id===threat.id;
  if(!threat.pos)return false;
  return plan.n&&K.neigh(plan.n).includes(threat.pos);
}
function blocksEnemyGoal(plan,owner){
  const enemy=K.other(owner);
  return (plan.type==='move'||plan.type==='deploy')&&plan.n===K.TARGET[enemy];
}
function scoreGuardPlan(plan,threat,owner){
  let s=0;
  if(blocksEnemyGoal(plan,owner))s+=980000;
  if(planAttacksThreat(plan,threat)){
    s+=900000;
    if(plan.type==='battle')s+=65000+(K.battleScore?K.battleScore(plan.p,threat)*22:0);
    if(plan.type==='deploy')s+=36000+(K.battleScore?K.battleScore(plan.p,threat)*16:0);
    if(plan.type==='move')s+=24000+(K.battleScore?K.battleScore(plan.p,threat)*12:0);
  }
  if(plan.p&&plan.p.fig==='stormrook')s+=12000;
  if(plan.p&&plan.p.fig==='voidray')s+=9000;
  return s;
}
function bestGoalGuard(owner='p2'){
  if(!K.s||K.s.win)return null;
  const threats=enemyGoalThreats(owner);
  if(!threats.length)return null;
  let best=null;
  for(const th of threats){
    for(const pl of plansFor(owner)){
      const score=scoreGuardPlan(pl,th,owner);
      if(score<=0)continue;
      if(!best||score>best.score)best={...pl,threat:th,score};
    }
  }
  if(best)K.log('AI警戒: '+best.threat.n+'の次ターンゴールを止めにいきます。');
  return best;
}
if(!K._goalGuardChoosePatched){
  K._goalGuardChoosePatched=true;
  const choose0=K.chooseAiPlan;
  K.chooseAiPlan=function(){
    const base=choose0?choose0.apply(this,arguments):null;
    if(base&&(base.type==='move'||base.type==='deploy')&&base.n===K.TARGET.p2)return base;
    const guard=bestGoalGuard('p2');
    if(guard)return guard;
    return base;
  };
}
})(window.KOMA);

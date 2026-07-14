window.KOMA=window.KOMA||{};
(function(K){
if(K._aiEmergencyBlockFixPatched)return;
K._aiEmergencyBlockFixPatched=true;
function arr(x){return Array.isArray(x)?x:[];}
function mini(p){return p?{id:p.id,name:p.n,fig:p.fig,pos:p.pos||null,owner:p.owner,mp:p.mp,wait:p.wait||0,condition:p.status&&p.status.condition||null,mpMinus:p.status&&p.status.mpMinus||0,boss:!!p.boss}:null;}
function canBattle(a,d){return !!(a&&d&&a.owner!==d.owner&&a.pos&&d.pos&&K.canAct(a)&&K.neigh(a.pos).includes(d.pos));}
function goalThreatActions(owner){
  const goal=K.TARGET[owner],out=[];
  if(!K.s||!K.s[owner]||K.at(goal))return out;
  for(const p of arr(K.s[owner].field))if(K.canAct(p)&&K.moveTargets(p,owner).includes(goal))out.push({type:'move',p,n:goal});
  for(const p of arr(K.s[owner].bench))if(K.entryTargets(p,owner).includes(goal))out.push({type:'deploy',p,n:goal});
  return out;
}
function ownGoalNow(owner){return goalThreatActions(owner)[0]||null;}
function occupyGoal(owner,enemy){
  const goal=K.TARGET[enemy];
  if(!goal||K.at(goal))return null;
  let best=null;
  function set(plan,score,why){if(!best||score>best.score)best={...plan,score,why};}
  for(const p of arr(K.s[owner].field)){
    if(!K.canAct(p))continue;
    if(K.moveTargets(p,owner).includes(goal))set({type:'move',p,n:goal},980000+(p.pos===goal?1000:0),'emergency_occupy_goal');
  }
  for(const p of arr(K.s[owner].bench))if(K.entryTargets(p,owner).includes(goal))set({type:'deploy',p,n:goal},955000,'emergency_deploy_goal');
  return best;
}
function hitThreat(owner,threats){
  let best=null;
  function set(plan,score,why){if(!best||score>best.score)best={...plan,score,why};}
  for(const th of threats){
    if(!th.p||!th.p.pos)continue;
    for(const p of arr(K.s[owner].field)){
      if(canBattle(p,th.p))set({type:'battle',p,d:th.p},850000+(K.battleScore?K.battleScore(p,th.p)*30:0),'emergency_battle_goal_threat');
    }
  }
  return best;
}
function chooseEmergency(owner){
  const enemy=K.other(owner);
  const ownWin=ownGoalNow(owner);
  if(ownWin)return {...ownWin,score:1000000,why:'emergency_take_own_goal'};
  const threats=goalThreatActions(enemy);
  if(!threats.length)return null;
  return occupyGoal(owner,enemy)||hitThreat(owner,threats)||null;
}
function planOut(p){return p?{type:p.type,piece:mini(p.p),to:p.n||null,defender:mini(p.d),score:Math.round(p.score||0),why:p.why||null}:null;}
const choose0=K.chooseAiPlan;
if(choose0){
  K.chooseAiPlan=function(){
    const emergency=chooseEmergency('p2');
    if(emergency){
      const enemyThreats=goalThreatActions('p1');
      if(emergency.why!=='emergency_take_own_goal')K.log&&K.log('AI緊急防衛: 次ターンのゴール負けを止めます。');
      if(K.learningAddEvent)K.learningAddEvent('ai_emergency_block',{chosen:planOut(emergency),enemyThreats:enemyThreats.map(planOut),ownGoal:planOut(ownGoalNow('p2'))});
      return emergency;
    }
    return choose0.apply(this,arguments);
  };
}
})(window.KOMA);

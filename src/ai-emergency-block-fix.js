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
function immediateSurroundDeath(owner,node){
  const enemy=K.other(owner),ns=K.neigh(node);
  return !!(ns.length&&ns.every(n=>{const o=K.at(n);return o&&o.owner===enemy;}));
}
function occupyGoal(owner,enemy){
  const goal=K.TARGET[enemy];
  if(!goal||K.at(goal))return null;
  let best=null,suicidal=[];
  function set(plan,score,why){
    const out={...plan,score,why,suicide:immediateSurroundDeath(owner,plan.n)};
    if(out.suicide){suicidal.push(out);return;}
    if(!best||score>best.score)best=out;
  }
  for(const p of arr(K.s[owner].field)){
    if(!K.canAct(p))continue;
    if(K.moveTargets(p,owner).includes(goal))set({type:'move',p,n:goal},980000+(p.pos===goal?1000:0),'emergency_occupy_goal');
  }
  for(const p of arr(K.s[owner].bench))if(K.entryTargets(p,owner).includes(goal))set({type:'deploy',p,n:goal},955000,'emergency_deploy_goal');
  if(!best&&suicidal.length)return {none:true,why:'no_safe_goal_block',blockedSuicides:suicidal};
  return best;
}
function battleScore(a,d){try{return K.battleScore?K.battleScore(a,d):0;}catch(e){return 0;}}
function hitThreat(owner,threats){
  let best=null;
  function set(plan,score,why){if(!best||score>best.score)best={...plan,score,why};}
  for(const th of threats){
    if(!th.p||!th.p.pos)continue;
    for(const p of arr(K.s[owner].field)){
      if(canBattle(p,th.p))set({type:'battle',p,d:th.p},850000+battleScore(p,th.p)*30,'emergency_battle_goal_threat');
    }
  }
  return best;
}
function pressureThreat(owner,threats){
  let best=null;
  function set(plan,score,why,target){
    if(immediateSurroundDeath(owner,plan.n))return;
    const out={...plan,score,why,pressureTarget:target};
    if(!best||score>best.score)best=out;
  }
  for(const th of threats){
    if(!th.p||!th.p.pos)continue;
    for(const p of arr(K.s[owner].field)){
      if(!K.canAct(p))continue;
      for(const n of K.moveTargets(p,owner)){
        if(K.at(n))continue;
        if(K.neigh(n).includes(th.p.pos))set({type:'move',p,n},785000+battleScore(p,th.p)*25,'emergency_mark_goal_threat',th.p);
      }
    }
    for(const p of arr(K.s[owner].bench)){
      for(const n of K.entryTargets(p,owner)){
        if(K.at(n))continue;
        if(K.neigh(n).includes(th.p.pos))set({type:'deploy',p,n},805000+battleScore(p,th.p)*25,'emergency_deploy_to_battle_threat',th.p);
      }
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
  const block=occupyGoal(owner,enemy);
  const hit=hitThreat(owner,threats);
  const pressure=pressureThreat(owner,threats);
  if(block&&block.none)return hit||pressure||{none:true,why:'no_safe_answer',enemyThreats:threats,blockedSuicides:block.blockedSuicides};
  return block||hit||pressure||{none:true,why:'no_legal_answer',enemyThreats:threats};
}
function planOut(p){return p?{type:p.type,piece:mini(p.p),to:p.n||null,defender:mini(p.d),pressureTarget:mini(p.pressureTarget),score:Math.round(p.score||0),why:p.why||null,suicide:!!p.suicide}:null;}
const choose0=K.chooseAiPlan;
if(choose0){
  K.chooseAiPlan=function(){
    const emergency=chooseEmergency('p2');
    if(emergency){
      const enemyThreats=goalThreatActions('p1');
      if(emergency.none){
        K.log&&K.log('AI緊急防衛: 即ゴール脅威あり。ただし安全に止める手がありません。');
        if(K.learningAddEvent)K.learningAddEvent('ai_emergency_block',{chosen:null,noSafe:true,reason:emergency.why,enemyThreats:enemyThreats.map(planOut),blockedSuicides:arr(emergency.blockedSuicides).map(planOut),ownGoal:planOut(ownGoalNow('p2'))});
        return null;
      }
      if(emergency.why!=='emergency_take_own_goal')K.log&&K.log('AI緊急防衛: 次ターンのゴール負けを止めます。');
      if(K.learningAddEvent)K.learningAddEvent('ai_emergency_block',{chosen:planOut(emergency),enemyThreats:enemyThreats.map(planOut),ownGoal:planOut(ownGoalNow('p2'))});
      return emergency;
    }
    return choose0.apply(this,arguments);
  };
}
})(window.KOMA);

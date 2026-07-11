window.KOMA=window.KOMA||{};
(function(K){
function enemyGoalThreats(owner){
  const enemy=K.other(owner),target=K.TARGET[enemy],out=[];
  for(const p of K.s[enemy].field)if(K.canAct(p)&&K.moveTargets(p,enemy).includes(target))out.push(p);
  for(const p of K.s[enemy].bench)if(K.entryTargets(p,enemy).includes(target))out.push(p);
  return out;
}
function genSafePlans(owner,blocker){
  const plans=[];
  for(const p of K.s[owner].field){
    if(K.canWakeByAlly&&K.canWakeByAlly(p)&&p.id!==blocker.id)plans.push({type:'wake',p,score:820000});
    if(!K.canAct(p))continue;
    for(const e of K.battleableEnemies(p))plans.push({type:'battle',p,d:e,score:(p.id===blocker.id?880000:820000)+(K.battleScore?K.battleScore(p,e)*20:0)});
    if(p.id===blocker.id)continue;
    for(const n of K.moveTargets(p,owner))plans.push({type:'move',p,n,score:760000+(K.neigh(n).some(x=>K.at(x)&&K.at(x).owner!==owner)?8000:0)});
  }
  for(const p of K.s[owner].bench){
    if(p.wait>0)continue;
    for(const n of K.entryTargets(p,owner))plans.push({type:'deploy',p,n,score:790000});
  }
  return plans.sort((a,b)=>(b.score||0)-(a.score||0));
}
if(!K._holdGoalGuardChoosePatched){
  K._holdGoalGuardChoosePatched=true;
  const choose0=K.chooseAiPlan;
  K.chooseAiPlan=function(){
    const plan=choose0?choose0.apply(this,arguments):null;
    if(!K.s||K.s.turn!=='p2'||K.s.win)return plan;
    const enemyTarget=K.TARGET.p1;
    const blocker=K.at&&K.at(enemyTarget);
    const threats=enemyGoalThreats('p2');
    if(blocker&&blocker.owner==='p2'&&threats.length){
      if(plan&&!(plan.type==='move'&&plan.p&&plan.p.id===blocker.id&&plan.n!==enemyTarget))return plan;
      const safe=genSafePlans('p2',blocker)[0];
      K.log('AI警戒: ゴール封鎖中なので'+blocker.n+'をどかしません。');
      return safe||{type:'hold',p:blocker,score:740000};
    }
    return plan;
  };
}
if(!K._holdGoalGuardRunPatched){
  K._holdGoalGuardRunPatched=true;
  const run0=K.runAi;
  K.runAi=function(){
    const s=K.s;
    if(!s||!s.ai||s.turn!=='p2'||s.win||s.locked||s.phase!=='idle')return;
    const plan=K.chooseAiPlan&&K.chooseAiPlan();
    if(plan&&plan.type==='hold'){
      K.log('AIはゴール封鎖を維持しました。');
      K.endTurn();
      return;
    }
    const chooseSaved=K.chooseAiPlan;
    K.chooseAiPlan=function(){return plan;};
    try{return run0.apply(this,arguments);}finally{K.chooseAiPlan=chooseSaved;}
  };
}
})(window.KOMA);

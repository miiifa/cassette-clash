window.KOMA=window.KOMA||{};
(function(K){
if(K._aiTargetGuardFixPatched)return;
K._aiTargetGuardFixPatched=true;
function arr(x){return Array.isArray(x)?x:[];}
function canReachIfTargetEmpty(p,owner,target,guard){
  if(!p||!K.canAct(p))return false;
  const old=guard&&guard.pos;
  if(guard)guard.pos=null;
  try{
    if(p.pos)return K.moveTargets(p,owner).includes(target);
    return K.entryTargets(p,owner).includes(target);
  }catch(e){return false;}
  finally{if(guard)guard.pos=old;}
}
function enemyThreatsIfVacated(owner,guard,target){
  const enemy=K.other(owner),out=[];
  for(const p of arr(K.s&&K.s[enemy]&&K.s[enemy].field))if(canReachIfTargetEmpty(p,enemy,target,guard))out.push(p);
  for(const p of arr(K.s&&K.s[enemy]&&K.s[enemy].bench))if(canReachIfTargetEmpty(p,enemy,target,guard))out.push(p);
  return out;
}
function guardInfo(owner){
  if(!K.s||!K.s[owner])return null;
  const enemy=K.other(owner),target=K.TARGET[enemy];
  const guard=arr(K.s[owner].field).find(p=>p.pos===target);
  if(!guard)return null;
  const threats=enemyThreatsIfVacated(owner,guard,target);
  if(!threats.length)return null;
  return {owner,enemy,target,guard,threats};
}
function unsafeGuardPlan(plan,info){
  if(!plan||!info)return false;
  if((plan.type==='move'||plan.type==='deploy')&&plan.n===K.TARGET[info.owner])return false;
  if(plan.p&&plan.p.id===info.guard.id&&(plan.type==='move'||plan.type==='battle'))return true;
  return false;
}
const choose0=K.chooseAiPlan;
if(choose0){
  K.chooseAiPlan=function(){
    const plan=choose0.apply(this,arguments);
    const info=guardInfo('p2');
    if(unsafeGuardPlan(plan,info)){
      const names=info.threats.map(p=>p.n).slice(0,3).join('・');
      K.log&&K.log('AI警戒: '+info.guard.n+'は'+info.target+'を守ります。離れると'+names+'に即ゴールされるため待機。');
      if(K.learningAddEvent)K.learningAddEvent('ai_target_guard_hold',{target:info.target,guard:{id:info.guard.id,name:info.guard.n,fig:info.guard.fig,pos:info.guard.pos},threats:info.threats.map(p=>({id:p.id,name:p.n,fig:p.fig,pos:p.pos||null,owner:p.owner})),blockedPlan:{type:plan.type,piece:plan.p?{id:plan.p.id,name:plan.p.n,fig:plan.p.fig,pos:plan.p.pos||null}:null,to:plan.n||null,defender:plan.d?{id:plan.d.id,name:plan.d.n,fig:plan.d.fig,pos:plan.d.pos||null}:null,score:plan.score||0}});
      return null;
    }
    return plan;
  };
}
})(window.KOMA);

window.KOMA=window.KOMA||{};
(function(K){
if(K._aiDecisionLogFixPatched)return;
K._aiDecisionLogFixPatched=true;
function arr(x){return Array.isArray(x)?x:[];}
function mini(p){return p?{id:p.id,name:p.n,fig:p.fig,pos:p.pos||null,owner:p.owner,mp:p.mp,wait:p.wait||0,condition:p.status&&p.status.condition||null,mpMinus:p.status&&p.status.mpMinus||0,boss:!!p.boss}:null;}
function goalActions(owner){
  const out=[];
  if(!K.s||!K.s[owner])return out;
  for(const p of arr(K.s[owner].field))if(K.canAct(p)&&K.moveTargets(p,owner).includes(K.TARGET[owner]))out.push({type:'move',piece:mini(p),to:K.TARGET[owner]});
  for(const p of arr(K.s[owner].bench))if(K.entryTargets(p,owner).includes(K.TARGET[owner]))out.push({type:'deploy',piece:mini(p),to:K.TARGET[owner]});
  return out;
}
function canReachIfEmpty(p,owner,target,blocker){
  if(!p||!K.canAct(p))return false;
  const old=blocker&&blocker.pos;
  if(blocker)blocker.pos=null;
  try{return p.pos?K.moveTargets(p,owner).includes(target):K.entryTargets(p,owner).includes(target);}
  catch(e){return false;}
  finally{if(blocker)blocker.pos=old;}
}
function guardContext(owner){
  if(!K.s||!K.s[owner])return null;
  const enemy=K.other(owner),target=K.TARGET[enemy],guard=arr(K.s[owner].field).find(p=>p.pos===target);
  if(!guard)return null;
  const threats=[];
  for(const p of arr(K.s[enemy].field))if(canReachIfEmpty(p,enemy,target,guard))threats.push(mini(p));
  for(const p of arr(K.s[enemy].bench))if(canReachIfEmpty(p,enemy,target,guard))threats.push(mini(p));
  return {target,guard:mini(guard),vacateThreats:threats};
}
function effectTags(p){
  const tags=new Set();
  if(!p||!K.wheelFor)return[];
  try{
    for(const seg of K.wheelFor(p,true)){
      const e=seg.e||{};
      if(seg.c==='blue')tags.add('blue');
      if(seg.c==='gold')tags.add('gold');
      if((seg.c==='white'||seg.c==='gold')&&(seg.d||0)>0)tags.add('damage');
      for(const k of ['condition','wait','mpMinus','swap','bench','selfBench','fly','selfko','pushLine','cassetteBoost'])if(e[k])tags.add(k==='condition'?'condition_'+e[k]:k);
    }
  }catch(e){}
  return[...tags];
}
function planSummary(plan){
  if(!plan)return null;
  const out={type:plan.type,piece:mini(plan.p),to:plan.n||null,defender:mini(plan.d),score:plan.score==null?null:Math.round(plan.score)};
  const reasons=[];
  if((plan.type==='move'||plan.type==='deploy')&&plan.n===K.TARGET.p2)reasons.push('goal_now');
  if((plan.type==='move'||plan.type==='deploy')&&plan.n===K.TARGET.p1)reasons.push('block_enemy_goal');
  if(plan.type==='battle'&&plan.d){
    out.defenderEffects=effectTags(plan.d);
    out.attackerEffects=effectTags(plan.p);
    if(plan.d.pos===K.TARGET.p2)reasons.push('clear_own_goal');
    if(K.moveTargets(plan.d,'p1').includes(K.TARGET.p1))reasons.push('attack_goal_threat');
  }
  out.reasons=reasons;
  return out;
}
function boardContext(){
  return {
    p2Goals:goalActions('p2').slice(0,5),
    p1Goals:goalActions('p1').slice(0,5),
    p2GoalBlockers:arr(K.s&&K.s.p1&&K.s.p1.field).filter(p=>p.pos===K.TARGET.p2).map(mini),
    p1GoalBlockers:arr(K.s&&K.s.p2&&K.s.p2.field).filter(p=>p.pos===K.TARGET.p1).map(mini),
    guard:guardContext('p2'),
    pc:{p1:K.s&&K.s.p1&&K.s.p1.pc.length||0,p2:K.s&&K.s.p2&&K.s.p2.pc.length||0},
    field:{p1:K.s&&K.s.p1&&K.s.p1.field.length||0,p2:K.s&&K.s.p2&&K.s.p2.field.length||0}
  };
}
const choose0=K.chooseAiPlan;
if(choose0){
  K.chooseAiPlan=function(){
    const before=boardContext();
    const plan=choose0.apply(this,arguments);
    if(K.learningAddEvent)K.learningAddEvent('ai_decision_final',{chosen:planSummary(plan),context:before});
    return plan;
  };
}
})(window.KOMA);

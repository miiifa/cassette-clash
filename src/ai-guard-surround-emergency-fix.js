window.KOMA=window.KOMA||{};
(function(K){
if(K._aiGuardSurroundEmergencyFixPatched)return;
K._aiGuardSurroundEmergencyFixPatched=true;
function arr(x){return Array.isArray(x)?x:[];}
function mini(p){return p?{id:p.id,name:p.n,fig:p.fig,pos:p.pos||null,owner:p.owner,mp:p.mp,wait:p.wait||0,condition:p.status&&p.status.condition||null,mpMinus:p.status&&p.status.mpMinus||0,boss:!!p.boss}:null;}
function canAct(p){return p&&K.canAct&&K.canAct(p);}
function canEnemyFill(enemy,node){
  for(const p of arr(K.s&&K.s[enemy]&&K.s[enemy].field))if(canAct(p)&&K.moveTargets(p,enemy).includes(node))return true;
  for(const p of arr(K.s&&K.s[enemy]&&K.s[enemy].bench))if(K.entryTargets(p,enemy).includes(node))return true;
  return false;
}
function wouldBeSurrounded(owner,node){
  const enemy=K.other(owner),ns=K.neigh(node);
  if(!ns.length)return false;
  return ns.every(n=>{const o=K.at(n);return o&&o.owner===enemy;});
}
function futureSurroundDanger(owner,node){
  const enemy=K.other(owner),ns=K.neigh(node);
  if(!ns.length)return null;
  const enemyNs=[],emptyNs=[];
  for(const n of ns){const o=K.at(n);if(o&&o.owner===enemy)enemyNs.push({node:n,piece:o});else if(!o)emptyNs.push(n);}
  if(enemyNs.length===ns.length)return {kind:'surrounded_now',enemyNs,fillNode:null};
  if(enemyNs.length===ns.length-1&&emptyNs.length===1&&canEnemyFill(enemy,emptyNs[0]))return {kind:'surround_next',enemyNs,fillNode:emptyNs[0]};
  return null;
}
function goalThreatActions(owner){
  const goal=K.TARGET[owner],out=[];
  if(!K.s||!K.s[owner]||K.at(goal))return out;
  for(const p of arr(K.s[owner].field))if(canAct(p)&&K.moveTargets(p,owner).includes(goal))out.push({type:'move',p,n:goal});
  for(const p of arr(K.s[owner].bench))if(K.entryTargets(p,owner).includes(goal))out.push({type:'deploy',p,n:goal});
  return out;
}
function blockers(owner,target){
  const out=[];
  for(const p of arr(K.s&&K.s[owner]&&K.s[owner].field))if(canAct(p)&&K.moveTargets(p,owner).includes(target))out.push({type:'move',p,n:target});
  for(const p of arr(K.s&&K.s[owner]&&K.s[owner].bench))if(K.entryTargets(p,owner).includes(target))out.push({type:'deploy',p,n:target});
  return out;
}
function battlePlans(owner,enemies){
  const out=[];
  for(const e of enemies){
    if(!e||!e.pos)return out;
    for(const p of arr(K.s&&K.s[owner]&&K.s[owner].field)){
      if(canAct(p)&&K.neigh(p.pos).includes(e.pos))out.push({type:'battle',p,d:e,score:880000+(K.battleScore?K.battleScore(p,e)*30:0),why:'emergency_hit_surround_piece'});
    }
  }
  return out;
}
function chooseStop(owner){
  const enemy=K.other(owner),target=K.TARGET[enemy],threats=goalThreatActions(enemy);
  if(!threats.length)return null;
  const bs=blockers(owner,target).map(p=>{
    const danger=futureSurroundDanger(owner,target)||wouldBeSurrounded(owner,target);
    const score=danger?520000:990000;
    return {...p,score,why:danger?'emergency_block_goal_but_surrounded':'emergency_block_goal_safe',surroundDanger:danger};
  }).sort((a,b)=>b.score-a.score);
  const safe=bs.find(x=>!x.surroundDanger);
  if(safe)return safe;
  const enemyPieces=[...new Map(threats.map(x=>[x.p&&x.p.id,x.p]).filter(x=>x[0])).values()];
  const hit=battlePlans(owner,enemyPieces).sort((a,b)=>b.score-a.score)[0];
  if(hit)return hit;
  return bs[0]||null;
}
function planOut(p){return p?{type:p.type,piece:mini(p.p),to:p.n||null,defender:mini(p.d),score:Math.round(p.score||0),why:p.why||null,surroundDanger:p.surroundDanger||null}:null;}
const choose0=K.chooseAiPlan;
if(choose0){
  K.chooseAiPlan=function(){
    const plan=chooseStop('p2');
    if(plan&&plan.why==='emergency_block_goal_safe'){
      K.log&&K.log('AI緊急防衛: 包囲されない形でゴールを塞ぎます。');
      if(K.learningAddEvent)K.learningAddEvent('ai_guard_surround_emergency',{chosen:planOut(plan),enemyThreats:goalThreatActions('p1').map(planOut)});
      return plan;
    }
    if(plan&&plan.why==='emergency_hit_surround_piece'){
      K.log&&K.log('AI緊急防衛: ゴール塞ぎが包囲されるため、ゴール脅威を攻撃します。');
      if(K.learningAddEvent)K.learningAddEvent('ai_guard_surround_emergency',{chosen:planOut(plan),enemyThreats:goalThreatActions('p1').map(planOut)});
      return plan;
    }
    if(plan&&plan.surroundDanger&&K.learningAddEvent)K.learningAddEvent('ai_guard_surround_no_good_block',{candidate:planOut(plan),enemyThreats:goalThreatActions('p1').map(planOut)});
    return choose0.apply(this,arguments);
  };
}
})(window.KOMA);

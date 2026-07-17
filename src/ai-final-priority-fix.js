window.KOMA=window.KOMA||{};
(function(K){
if(K._aiFinalPriorityFixPatched)return;
K._aiFinalPriorityFixPatched=true;
function arr(x){return Array.isArray(x)?x:[];}
function mini(p){return p?{id:p.id,owner:p.owner,fig:p.fig,pos:p.pos||null,mp:p.mp,wait:p.wait||0,condition:p.status&&p.status.condition||null,mpMinus:p.status&&p.status.mpMinus||0,boss:!!p.boss}:null;}
function canAct(p){return !!(p&&K.canAct&&K.canAct(p));}
function goalPlans(owner){
  const target=K.TARGET&&K.TARGET[owner],out=[];
  if(!target||!K.s||!K.s[owner]||K.at(target))return out;
  for(const p of arr(K.s[owner].field))if(canAct(p)&&K.moveTargets(p,owner).includes(target))out.push({type:'move',p,n:target,score:3000000,why:'final_take_goal'});
  for(const p of arr(K.s[owner].bench))if(K.entryTargets(p,owner).includes(target))out.push({type:'deploy',p,n:target,score:2990000,why:'final_deploy_goal'});
  return out;
}
function immediateGoal(owner){return goalPlans(owner)[0]||null;}
function canBattle(a,d){return !!(a&&d&&a.owner!==d.owner&&a.pos&&d.pos&&canAct(a)&&K.neigh(a.pos).includes(d.pos));}
function surroundedIfPlaced(owner,node){
  const enemy=K.other(owner),ns=K.neigh(node);
  return !!(ns.length&&ns.every(n=>{const o=K.at(n);return o&&o.owner===enemy;}));
}
function blockEnemyGoal(owner){
  const enemy=K.other(owner),target=K.TARGET&&K.TARGET[enemy],threats=goalPlans(enemy);
  if(!target||!threats.length)return null;
  if(!K.at(target)){
    let best=null;
    function set(plan,score,why){if(surroundedIfPlaced(owner,plan.n))return;if(!best||score>best.score)best={...plan,score,why};}
    for(const p of arr(K.s[owner].field))if(canAct(p)&&K.moveTargets(p,owner).includes(target))set({type:'move',p,n:target},2600000,'final_block_enemy_goal');
    for(const p of arr(K.s[owner].bench))if(K.entryTargets(p,owner).includes(target))set({type:'deploy',p,n:target},2590000,'final_deploy_block_enemy_goal');
    if(best)return best;
  }
  let hit=null;
  for(const th of threats){
    if(!th.p||!th.p.pos)continue;
    for(const p of arr(K.s[owner].field)){
      if(canBattle(p,th.p)){
        const sc=2500000+(K.battleScore?K.battleScore(p,th.p)*40:0);
        if(!hit||sc>hit.score)hit={type:'battle',p,d:th.p,score:sc,why:'final_hit_enemy_goal_threat'};
      }
    }
  }
  return hit;
}
function planOut(p){return p?{type:p.type,piece:mini(p.p),to:p.n||null,defender:mini(p.d),score:Math.round(p.score||0),why:p.why||null}:null;}
function emit(kind,plan){
  if(K.learningAddEvent)K.learningAddEvent('ai_final_priority',{kind,chosen:planOut(plan),ownGoal:planOut(immediateGoal('p2')),enemyThreats:goalPlans('p1').map(planOut)});
}
function execute(plan){
  if(!plan)return false;
  if(plan.type==='deploy'){K.log&&K.log('AI最優先: '+plan.p.n+'でゴール/緊急防衛。');K.deploy(plan.p,plan.n);return true;}
  if(plan.type==='move'){K.log&&K.log('AI最優先: '+plan.p.n+'でゴール/緊急防衛。');K.movePiece(plan.p,plan.n);return true;}
  if(plan.type==='battle'){K.s.pendingAttacker=plan.p.id;K.log&&K.log('AI最優先: '+plan.p.n+'で即ゴール脅威を攻撃。');K.startBattle(plan.d.id);return true;}
  return false;
}
const choose0=K.chooseAiPlan;
if(choose0){
  K.chooseAiPlan=function(){
    const win=immediateGoal('p2');
    if(win){emit('own_goal',win);return win;}
    const block=blockEnemyGoal('p2');
    if(block){emit('enemy_goal_block',block);return block;}
    return choose0.apply(this,arguments);
  };
}
const run0=K.runAi;
if(run0){
  K.runAi=function(){
    const s=K.s;
    if(!s||!s.ai||s.turn!=='p2'||s.win||s.locked||s.phase!=='idle')return run0.apply(this,arguments);
    const win=immediateGoal('p2');
    if(win){emit('own_goal_runai',win);if(execute(win))return;}
    const block=blockEnemyGoal('p2');
    if(block){emit('enemy_goal_block_runai',block);if(execute(block))return;}
    return run0.apply(this,arguments);
  };
}
})(window.KOMA);

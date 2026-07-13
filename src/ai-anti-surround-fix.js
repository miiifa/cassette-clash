window.KOMA=window.KOMA||{};
(function(K){
if(K._aiAntiSurroundFixPatched)return;
K._aiAntiSurroundFixPatched=true;
function arr(x){return Array.isArray(x)?x:[];}
function pieceMini(p){return p?{id:p.id,name:p.n,fig:p.fig,pos:p.pos||null,owner:p.owner}:null;}
function canEnemyFill(enemy,target){
  const out=[];
  for(const p of arr(K.s&&K.s[enemy]&&K.s[enemy].field))if(K.canAct(p)&&K.moveTargets(p,enemy).includes(target))out.push({type:'move',p,n:target});
  for(const p of arr(K.s&&K.s[enemy]&&K.s[enemy].bench))if(K.entryTargets(p,enemy).includes(target))out.push({type:'deploy',p,n:target});
  return out;
}
function blockPlans(owner,target,guard){
  const plans=[];
  for(const p of arr(K.s&&K.s[owner]&&K.s[owner].field)){
    if(p.id===guard.id||!K.canAct(p))continue;
    if(K.moveTargets(p,owner).includes(target))plans.push({type:'move',p,n:target,score:940000});
  }
  for(const p of arr(K.s&&K.s[owner]&&K.s[owner].bench))if(K.entryTargets(p,owner).includes(target))plans.push({type:'deploy',p,n:target,score:930000});
  return plans;
}
function battlePlans(owner,enemies){
  const plans=[];
  for(const e of enemies){
    for(const p of arr(K.s&&K.s[owner]&&K.s[owner].field)){
      if(!K.canAct(p)||!p.pos||!e.pos)continue;
      if(K.neigh(p.pos).includes(e.pos))plans.push({type:'battle',p,d:e,score:820000+(K.battleScore?K.battleScore(p,e)*30:0)});
    }
  }
  return plans;
}
function findDanger(owner){
  if(!K.s||!K.s[owner])return null;
  const enemy=K.other(owner),candidates=[];
  for(const guard of arr(K.s[owner].field)){
    if(!guard.pos)continue;
    const ns=K.neigh(guard.pos);
    if(ns.length<2)continue;
    const enemyNs=ns.map(n=>K.at(n)).filter(p=>p&&p.owner===enemy);
    const emptyNs=ns.filter(n=>!K.at(n));
    if(!enemyNs.length||emptyNs.length!==1)continue;
    const fill=canEnemyFill(enemy,emptyNs[0]);
    if(!fill.length)continue;
    const important=(guard.pos===K.TARGET[enemy]?4:0)+(guard.boss?2:0)+enemyNs.length;
    candidates.push({guard,node:emptyNs[0],enemyNs,fill,score:important});
  }
  candidates.sort((a,b)=>b.score-a.score);
  return candidates[0]||null;
}
function chooseRescue(owner){
  const d=findDanger(owner);
  if(!d)return null;
  const blockers=blockPlans(owner,d.node,d.guard).sort((a,b)=>b.score-a.score);
  if(blockers[0])return {...blockers[0],why:'anti_surround_block',danger:d};
  const battles=battlePlans(owner,d.enemyNs).sort((a,b)=>b.score-a.score);
  if(battles[0])return {...battles[0],why:'anti_surround_battle',danger:d};
  return null;
}
function isImmediateGoal(plan,owner){return plan&&(plan.type==='move'||plan.type==='deploy')&&plan.n===K.TARGET[owner];}
const choose0=K.chooseAiPlan;
if(choose0){
  K.chooseAiPlan=function(){
    const base=choose0.apply(this,arguments);
    if(isImmediateGoal(base,'p2'))return base;
    const rescue=chooseRescue('p2');
    if(rescue){
      const d=rescue.danger;
      K.log&&K.log('AI警戒: '+d.guard.n+'が包囲されそうです。'+d.node+'を塞ぐ/隣接敵を処理します。');
      if(K.learningAddEvent)K.learningAddEvent('ai_anti_surround',{guard:pieceMini(d.guard),blockNode:d.node,enemyNeighbors:d.enemyNs.map(pieceMini),enemyFillers:d.fill.map(x=>({type:x.type,piece:pieceMini(x.p),to:x.n})),chosen:{type:rescue.type,piece:pieceMini(rescue.p),to:rescue.n||null,defender:pieceMini(rescue.d),score:Math.round(rescue.score||0),why:rescue.why},base:base&&{type:base.type,piece:pieceMini(base.p),to:base.n||null,defender:pieceMini(base.d),score:Math.round(base.score||0)}});
      return rescue;
    }
    return base;
  };
}
})(window.KOMA);

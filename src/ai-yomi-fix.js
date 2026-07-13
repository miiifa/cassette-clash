window.KOMA=window.KOMA||{};
(function(K){
if(K._aiYomiFixPatched)return;
K._aiYomiFixPatched=true;
function arr(x){return Array.isArray(x)?x:[];}
function mini(p){return p?{id:p.id,name:p.n,fig:p.fig,pos:p.pos||null,owner:p.owner}:null;}
function dist(a,b){if(!a||!b)return 99;if(a===b)return 0;const seen=new Map([[a,0]]),q=[a];while(q.length){const c=q.shift(),d=seen.get(c);for(const n of K.neigh(c)){if(seen.has(n))continue;if(n===b)return d+1;seen.set(n,d+1);q.push(n);}}return 99;}
function plans(owner){const out=[];if(!K.s||!K.s[owner])return out;for(const p of arr(K.s[owner].field)){if(!K.canAct(p))continue;for(const e of K.battleableEnemies(p))out.push({type:'battle',p,d:e});for(const n of K.moveTargets(p,owner))if(!K.at(n))out.push({type:'move',p,n});}for(const p of arr(K.s[owner].bench))for(const n of K.entryTargets(p,owner))if(!K.at(n))out.push({type:'deploy',p,n});return out;}
function surroundCompletion(plan,owner){
  if(!plan||!(plan.type==='move'||plan.type==='deploy')||!plan.n)return null;
  const enemy=K.other(owner),node=plan.n;
  for(const target of arr(K.s&&K.s[enemy]&&K.s[enemy].field)){
    if(!target.pos)continue;
    const ns=K.neigh(target.pos);
    if(!ns.includes(node))continue;
    let enemyFilled=0,empty=0;
    for(const n of ns){
      if(n===node){enemyFilled++;continue;}
      const o=K.at(n);
      if(o&&o.owner===owner)enemyFilled++;
      else if(!o)empty++;
    }
    if(enemyFilled===ns.length&&empty===0)return {target,node,kind:'pc_now'};
    if(enemyFilled>=ns.length-1&&empty<=1)return {target,node,kind:'pc_setup'};
  }
  return null;
}
function predict(owner){
  const enemy=K.other(owner),ps=plans(enemy),ranked=[];
  for(const p of ps){
    let s=0,why=[];
    if((p.type==='move'||p.type==='deploy')&&p.n===K.TARGET[enemy]){s+=1000000;why.push('goal_now');}
    if((p.type==='move'||p.type==='deploy')&&p.n){
      const gd=dist(p.n,K.TARGET[enemy]);
      s+=Math.max(0,6-gd)*900;why.push('goal_pressure_'+gd);
      if(p.n===K.TARGET[owner]){s+=12000;why.push('hold_own_goal');}
      const sur=surroundCompletion(p,enemy);
      if(sur){s+=sur.kind==='pc_now'?180000:65000;why.push(sur.kind+'_'+sur.target.n);p.surround=sur;}
    }
    if(p.type==='battle'&&p.d){
      s+=3000+(K.battleScore?K.battleScore(p.p,p.d)*80:0);why.push('battle');
      if(p.d.pos===K.TARGET[enemy]){s+=110000;why.push('clear_goal_blocker');}
      if(K.moveTargets(p.d,owner).includes(K.TARGET[owner])){s+=45000;why.push('hit_goal_threat');}
    }
    ranked.push({...p,score:s,why});
  }
  ranked.sort((a,b)=>b.score-a.score);
  return ranked[0]||null;
}
function counterOccupy(owner,node){
  if(!node||K.at(node))return null;
  let best=null;
  function set(plan,score){if(!best||score>best.score)best={...plan,score};}
  for(const p of arr(K.s&&K.s[owner]&&K.s[owner].field))if(K.canAct(p)&&K.moveTargets(p,owner).includes(node))set({type:'move',p,n:node,why:'yomi_occupy'},880000-dist(p.pos,node));
  for(const p of arr(K.s&&K.s[owner]&&K.s[owner].bench))if(K.entryTargets(p,owner).includes(node))set({type:'deploy',p,n:node,why:'yomi_occupy'},860000);
  return best;
}
function counterBattle(owner,pred){
  if(!pred||!pred.p||!pred.p.pos)return null;
  let best=null;
  function set(plan,score){if(!best||score>best.score)best={...plan,score};}
  for(const p of arr(K.s&&K.s[owner]&&K.s[owner].field)){
    if(!K.canAct(p)||!p.pos)continue;
    if(K.neigh(p.pos).includes(pred.p.pos))set({type:'battle',p,d:pred.p,why:'yomi_battle'},720000+(K.battleScore?K.battleScore(p,pred.p)*50:0));
    for(const n of K.moveTargets(p,owner))if(K.neigh(n).includes(pred.p.pos))set({type:'move',p,n,why:'yomi_mark'},620000+(K.battleScore?K.battleScore(p,pred.p)*25:0));
  }
  return best;
}
function chooseCounter(owner,pred){
  if(!pred||pred.score<45000)return null;
  if(pred.type==='move'||pred.type==='deploy'){
    const c=counterOccupy(owner,pred.n);
    if(c)return c;
    if(pred.surround){
      const b=counterBattle(owner,pred);
      if(b)return b;
    }
  }
  if(pred.type==='battle'){
    const c=counterBattle(owner,pred);
    if(c)return c;
  }
  return null;
}
function immediateWin(plan,owner){return plan&&(plan.type==='move'||plan.type==='deploy')&&plan.n===K.TARGET[owner];}
function explainPlan(p){return p?{type:p.type,piece:mini(p.p),to:p.n||null,defender:mini(p.d),score:Math.round(p.score||0),why:p.why||[],surround:p.surround&&{target:mini(p.surround.target),node:p.surround.node,kind:p.surround.kind}}:null;}
const choose0=K.chooseAiPlan;
if(choose0){
  K.chooseAiPlan=function(){
    const base=choose0.apply(this,arguments);
    if(immediateWin(base,'p2'))return base;
    const pred=predict('p2');
    const counter=chooseCounter('p2',pred);
    if(counter&&(!base||counter.score>(base.score||0)+120000)){
      K.log&&K.log('AI読み: 次に'+(pred.p&&pred.p.n||'相手')+'が'+(pred.n||pred.d&&pred.d.n||'狙い')+'を狙うと予測して先回りします。');
      if(K.learningAddEvent)K.learningAddEvent('ai_yomi',{predicted:explainPlan(pred),counter:explainPlan(counter),base:explainPlan(base)});
      return counter;
    }
    if(K.learningAddEvent&&pred)K.learningAddEvent('ai_yomi_scan',{predicted:explainPlan(pred),counter:explainPlan(counter),base:explainPlan(base),used:false});
    return base;
  };
}
})(window.KOMA);

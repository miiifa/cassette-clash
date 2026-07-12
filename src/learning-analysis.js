window.KOMA=window.KOMA||{};
(function(K){
const STORE='runeClashStrategicLearning.v2';
const LR=.018;
const DEFAULT_WEIGHTS={
  goalNow:1000,
  blockEnemyGoal:760,
  goalPressure:42,
  enemyGoalDanger:-70,
  battleExpected:18,
  surroundGain:190,
  surroundRisk:-170,
  centerControl:18,
  spawnBlock:24,
  targetOccupy:210,
  pcLead:28,
  fieldLead:12,
  statusPressure:18,
  tempo:8
};
function arr(x){return Array.isArray(x)?x:[];}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function loadProfile(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{};}catch(e){return{};}}
function saveProfile(p){try{localStorage.setItem(STORE,JSON.stringify(p));}catch(e){}}
function profile(){const p=loadProfile();p.weights=p.weights||{...DEFAULT_WEIGHTS};p.matches=p.matches||0;p.concepts=p.concepts||{};p.updatedAt=p.updatedAt||null;return p;}
function piece(p){return p?{id:p.id,owner:p.owner,fig:p.fig,name:p.n,pos:p.pos||null,mp:p.mp,wait:p.wait||0,status:{condition:p.status&&p.status.condition||null,mpMinus:p.status&&p.status.mpMinus||0},level:p.level||1,boss:!!p.boss}:null;}
function event(type,data){
  if(!K.s)return;
  K.s.report=K.s.report||{schema:'koma-match-report.v2',startedAt:new Date().toISOString(),events:[],logs:[]};
  K.s.report.events=K.s.report.events||[];
  K.s.report.events.push({i:K.s.report.events.length,t:Date.now(),turn:K.s.turn,turnCount:K.s.turnCount,phase:K.s.phase,type,data});
  if(K.s.report.events.length>620)K.s.report.events.shift();
}
function dist(a,b){
  if(!a||!b)return 99;if(a===b)return 0;
  const seen=new Map([[a,0]]),q=[a];
  while(q.length){const c=q.shift(),d=seen.get(c);for(const n of K.neigh(c)){if(seen.has(n))continue;if(n===b)return d+1;seen.set(n,d+1);q.push(n);}}
  return 99;
}
function legalSnapshot(owner){
  const out={owner,goals:[],moves:[],deploys:[],battles:[],enemyGoalThreats:[],counts:{goals:0,moves:0,deploys:0,battles:0,enemyGoalThreats:0}};
  if(!K.s||!K.s[owner])return out;
  const enemy=K.other(owner);
  try{
    for(const p of arr(K.s[owner].field)){
      if(!K.canAct(p))continue;
      for(const n of K.moveTargets(p,owner)){const x={piece:piece(p),to:n,goal:n===K.TARGET[owner],distToGoal:dist(n,K.TARGET[owner])};out.moves.push(x);if(x.goal)out.goals.push({type:'move',piece:piece(p),to:n});}
      for(const e of K.battleableEnemies(p))out.battles.push({attacker:piece(p),defender:piece(e),score:K.battleScore?Math.round(K.battleScore(p,e)):null});
    }
    for(const p of arr(K.s[owner].bench))for(const n of K.entryTargets(p,owner)){const x={piece:piece(p),to:n,goal:n===K.TARGET[owner],distToGoal:dist(n,K.TARGET[owner])};out.deploys.push(x);if(x.goal)out.goals.push({type:'deploy',piece:piece(p),to:n});}
    for(const p of arr(K.s[enemy]&&K.s[enemy].field))if(K.canAct(p)&&K.moveTargets(p,enemy).includes(K.TARGET[enemy]))out.enemyGoalThreats.push({type:'move',piece:piece(p),to:K.TARGET[enemy]});
    for(const p of arr(K.s[enemy]&&K.s[enemy].bench))if(K.entryTargets(p,enemy).includes(K.TARGET[enemy]))out.enemyGoalThreats.push({type:'deploy',piece:piece(p),to:K.TARGET[enemy]});
  }catch(e){out.error=e.message;}
  out.counts={goals:out.goals.length,moves:out.moves.length,deploys:out.deploys.length,battles:out.battles.length,enemyGoalThreats:out.enemyGoalThreats.length};
  return out;
}
K.learningLegalSnapshot=legalSnapshot;
function statusPressure(p){
  if(!p||!K.wheelFor)return 0;
  let v=0,total=0;
  try{for(const seg of K.wheelFor(p,true)){total+=seg.s||0;const e=seg.e;if(!e)continue;if(e.condition==='sleep'||e.condition==='frozen')v+=(seg.s||0)*5;if(e.condition==='paralyze'||e.condition==='confuse')v+=(seg.s||0)*3;if(e.condition==='poison'||e.condition==='toxic')v+=(seg.s||0)*2;if(e.wait)v+=(seg.s||0)*2*e.wait;if(e.mpMinus)v+=(seg.s||0)*e.mpMinus;if(e.swap||e.bench||e.pushLine)v+=(seg.s||0)*2;}}catch(e){}
  return total?Math.round(v/total*10):0;
}
function center(node){return ['it1','it2','it3','im1','im3','ib1','ib2','ib3'].includes(node)?1:0;}
function surroundGain(owner,node){
  if(!K.s)return 0;const enemy=K.other(owner);let gain=0;
  for(const e of arr(K.s[enemy].field)){const ns=K.neigh(e.pos);if(ns.length&&ns.every(n=>{if(n===node)return true;const o=K.at(n);return o&&o.owner===owner;}))gain++;}
  return gain;
}
function surroundRisk(owner,node){
  if(!K.s)return 0;const enemy=K.other(owner),ns=K.neigh(node);if(!ns.length)return 0;let enemyN=0,empty=0;
  for(const n of ns){const o=K.at(n);if(o&&o.owner===enemy)enemyN++;else if(!o)empty++;}
  if(enemyN===ns.length)return 4;if(enemyN>=2&&empty<=1)return 2.4;if(enemyN>=2)return 1.2;if(enemyN>=1&&empty===0)return .8;return 0;
}
function featuresForPlan(plan,owner){
  const enemy=K.other(owner),f={goalNow:0,blockEnemyGoal:0,goalPressure:0,enemyGoalDanger:0,battleExpected:0,surroundGain:0,surroundRisk:0,centerControl:0,spawnBlock:0,targetOccupy:0,pcLead:0,fieldLead:0,statusPressure:0,tempo:1};
  if(!plan||!K.s)return f;
  const p=plan.p,node=plan.n||p&&p.pos;
  f.pcLead=(arr(K.s[enemy].pc).length-arr(K.s[owner].pc).length);
  f.fieldLead=(arr(K.s[owner].field).length-arr(K.s[enemy].field).length);
  if((plan.type==='move'||plan.type==='deploy')&&plan.n===K.TARGET[owner])f.goalNow=1;
  if((plan.type==='move'||plan.type==='deploy')&&plan.n===K.TARGET[enemy])f.blockEnemyGoal=1;
  if(node&&p){
    f.goalPressure=Math.max(0,6-dist(node,K.TARGET[owner]));
    f.centerControl=center(node);
    f.spawnBlock=K.SPAWN[enemy].includes(node)?1:0;
    f.targetOccupy=node===K.TARGET[enemy]?1:0;
    f.surroundGain=surroundGain(owner,node);
    f.surroundRisk=surroundRisk(owner,node);
    f.statusPressure=statusPressure(p);
  }
  for(const e of arr(K.s[enemy].field))if(K.canAct(e)&&e.pos&&dist(e.pos,K.TARGET[enemy])<=K.effectiveMp(e,enemy))f.enemyGoalDanger++;
  if(plan.type==='battle'&&plan.d){
    f.battleExpected=K.battleScore?clamp(K.battleScore(plan.p,plan.d)/40,-6,6):0;
    if(K.moveTargets(plan.d,enemy).includes(K.TARGET[enemy]))f.blockEnemyGoal+=.6;
    f.statusPressure+=statusPressure(plan.p)*.5;
  }
  return f;
}
function dot(w,f){let s=0;for(const k of Object.keys(f))s+=(w[k]||0)*f[k];return s;}
function planSummary(plan,owner){return plan?{type:plan.type,piece:piece(plan.p),to:plan.n||null,defender:piece(plan.d),score:plan.score!=null?Math.round(plan.score):null,features:featuresForPlan(plan,owner)}:null;}
function genPlans(owner){
  const plans=[];if(!K.s||!K.s[owner])return plans;
  for(const p of arr(K.s[owner].field)){if(!K.canAct(p))continue;for(const e of K.battleableEnemies(p))plans.push({type:'battle',p,d:e});for(const n of K.moveTargets(p,owner))plans.push({type:'move',p,n});}
  for(const p of arr(K.s[owner].bench))for(const n of K.entryTargets(p,owner))plans.push({type:'deploy',p,n});
  return plans;
}
function genericBest(owner){
  const prof=profile(),plans=genPlans(owner);let best=null;
  for(const pl of plans){
    const f=featuresForPlan(pl,owner);
    const s=dot(prof.weights,f);
    const scored={...pl,score:s,why:'generic_feature_learning',features:f};
    if(!best||s>best.score)best=scored;
  }
  return best;
}
if(!K._genericLearningAiPatched){
  K._genericLearningAiPatched=true;
  const choose0=K.chooseAiPlan;
  if(choose0){
    K.chooseAiPlan=function(){
      const base=choose0.apply(this,arguments);
      const learned=genericBest('p2');
      let chosen=base;
      if(learned){
        if(!base)chosen=learned;
        else if(learned.features&&learned.features.goalNow)chosen=learned;
        else if(learned.features&&learned.features.blockEnemyGoal&&(!base.n||base.n!==K.TARGET.p1))chosen=learned;
        else if(learned.score>(base.score||0)+180)chosen=learned;
      }
      event('ai_plan_generic',{legalSummary:legalSnapshot('p2').counts,base:planSummary(base,'p2'),learned:planSummary(learned,'p2'),chosen:planSummary(chosen,'p2'),weights:profile().weights});
      if(chosen&&learned&&chosen===learned)K.log('AI学習: 勝敗構造の重みに基づいて行動を選びました。');
      return chosen;
    };
  }
}
function nodeFromPoint(e){const b=document.getElementById('board');if(!b||!K.NODES)return null;const r=b.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;let best=null,bd=9999;for(const id of Object.keys(K.NODES)){const n=K.NODES[id],d=(n[0]-x)*(n[0]-x)+(n[1]-y)*(n[1]-y);if(d<bd){bd=d;best=id;}}return bd<18?best:null;}
function pieceFromElement(el){if(!el)return null;const id=el.dataset&&el.dataset.pieceId;if(id&&K.byId)return K.byId(id);const nm=el.querySelector&&el.querySelector('.figName');const owner=el.classList&&el.classList.contains('p1')?'p1':el.classList&&el.classList.contains('p2')?'p2':null;if(!nm||!owner||!K.all)return null;return K.all().find(p=>p.owner===owner&&p.n===nm.textContent)||null;}
if(!K._learningTapPatched){
  K._learningTapPatched=true;
  document.addEventListener('pointerup',function(e){
    const board=document.getElementById('board');if(!board||!board.contains(e.target)||!K.s)return;
    const before={turn:K.s.turn,turnCount:K.s.turnCount,phase:K.s.phase,selectedId:K.s.selectedId||null,pendingAttacker:K.s.pendingAttacker||null,events:K.s.report&&K.s.report.events&&K.s.report.events.length||0};
    const node=nodeFromPoint(e),fig=pieceFromElement(e.target.closest&&e.target.closest('#board .fig')),occ=node&&K.at?K.at(node):null,target={node,piece:piece(fig||occ),raw:{x:Math.round(e.clientX),y:Math.round(e.clientY)}};
    const selected=K.byId&&K.byId(K.s.pendingAttacker||K.s.selectedId);
    const couldBattle=!!(selected&&target.piece&&target.piece.owner!==selected.owner&&selected.pos&&target.piece.pos&&K.neigh(selected.pos).includes(target.piece.pos));
    const couldMove=!!(target.node&&arr(K.s.targets).includes(target.node));
    event('user_tap',{target,before,legalSummary:legalSnapshot(K.s.turn||'p1').counts,couldBattle,couldMove});
    setTimeout(()=>{if(!K.s||K.s.win)return;const afterEvents=K.s.report&&K.s.report.events&&K.s.report.events.length||0;const same=K.s.turnCount===before.turnCount&&K.s.phase===before.phase&&K.s.selectedId===before.selectedId;if((couldBattle||couldMove)&&same&&afterEvents<=before.events+1)event('tap_possible_no_action',{target,before,reason:couldBattle?'legal_battle_tap_did_not_advance':'legal_move_tap_did_not_advance'});},140);
  },true);
}
if(!K._learningActionPatched){
  K._learningActionPatched=true;
  const dep0=K.deploy;if(dep0)K.deploy=function(p,n){event('strategic_action',{owner:p&&p.owner,plan:planSummary({type:'deploy',p,n},p&&p.owner)});return dep0.apply(this,arguments);};
  const mov0=K.movePiece;if(mov0)K.movePiece=function(p,n){event('strategic_action',{owner:p&&p.owner,plan:planSummary({type:'move',p,n},p&&p.owner)});return mov0.apply(this,arguments);};
  const bat0=K.startBattle;if(bat0)K.startBattle=function(defenderId){const a=K.byId(K.s&&K.s.pendingAttacker||K.s&&K.s.selectedId),d=K.byId(defenderId);if(a&&d)event('strategic_action',{owner:a.owner,plan:planSummary({type:'battle',p:a,d},a.owner)});return bat0.apply(this,arguments);};
}
if(!K._learningEndTurnPatched){
  K._learningEndTurnPatched=true;
  const end0=K.endTurn;if(end0)K.endTurn=function(){if(K.s)event('turn_end_snapshot',{owner:K.s.turn,legal:legalSnapshot(K.s.turn)});return end0.apply(this,arguments);};
}
function learn(rep){
  if(!K.s||!rep||!rep.winner||K.s.report.genericLearned)return profile();
  const prof=profile(),result=rep.winner==='p2'?1:-1;
  const actions=arr(rep.events).filter(e=>e.type==='strategic_action'&&e.data&&e.data.plan&&e.data.plan.features);
  const totals={};
  for(const e of actions){const sign=e.data.owner==='p2'?result:-result;const f=e.data.plan.features;for(const k of Object.keys(DEFAULT_WEIGHTS)){totals[k]=(totals[k]||0)+sign*(f[k]||0);}}
  for(const k of Object.keys(DEFAULT_WEIGHTS)){const delta=clamp((totals[k]||0)*LR,-18,18);prof.weights[k]=clamp((prof.weights[k]==null?DEFAULT_WEIGHTS[k]:prof.weights[k])+delta,-1200,1400);}
  prof.matches=(prof.matches||0)+1;prof.p2Wins=(prof.p2Wins||0)+(rep.winner==='p2'?1:0);prof.p1Wins=(prof.p1Wins||0)+(rep.winner==='p1'?1:0);
  prof.concepts=prof.concepts||{};
  const logs=arr(rep.logs).join('\n');
  if(/ゴール/.test(logs))prof.concepts.goalRace=(prof.concepts.goalRace||0)+1;
  if(/包囲/.test(logs))prof.concepts.surround=(prof.concepts.surround||0)+1;
  if(/魔札|カセット|プレート/.test(logs))prof.concepts.runeTiming=(prof.concepts.runeTiming||0)+1;
  if(/ねむり|混乱|マヒ|毒|こおり/.test(logs))prof.concepts.statusControl=(prof.concepts.statusControl||0)+1;
  prof.lastDelta=totals;prof.updatedAt=new Date().toISOString();K.s.report.genericLearned=true;saveProfile(prof);return prof;
}
function topWeights(w){return Object.entries(w||{}).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,7).map(([k,v])=>k+': '+Math.round(v));}
function analyze(rep){
  const ev=arr(rep.events),logs=arr(rep.logs),out={bugSuspicions:[],winLoss:[],decisiveMoments:[],strategicLearning:[],aiLearningHints:[]};
  const noActions=ev.filter(e=>e.type==='tap_possible_no_action');if(noActions.length)out.bugSuspicions.push('合法手っぽいタップ後に状態が進まない記録が '+noActions.length+' 件あります。');
  const rejects=logs.filter(x=>/今はそのユニットを選べません/.test(x)).length;if(rejects>=3)out.bugSuspicions.push('「今はそのユニットを選べません」が '+rejects+' 回あります。');
  const winner=rep.winner,final=rep.winDetail&&rep.winDetail.piece;
  if(winner==='p1'&&final)out.winLoss.push('勝因: ゴール到達。重要なのはキャラ名ではなく「ゴール圧・通路確保・相手ブロック遅れ」の構造です。');
  if(winner==='p2'&&final)out.winLoss.push('敗因: 相手のゴール到達。AI側のゴール圧が通った構造として学習します。');
  const pcBy={p1:0,p2:0};for(const e of ev.filter(e=>e.type==='pc')){const o=e.data&&e.data.pieceBefore&&e.data.pieceBefore.owner;if(o)pcBy[o]++;}
  out.winLoss.push('PC送り差: 自分 '+pcBy.p1+' / 相手 '+pcBy.p2+'。');
  const actions=ev.filter(e=>e.type==='strategic_action');out.strategicLearning.push('学習対象の行動特徴を '+actions.length+' 件記録しました。');
  const prof=loadProfile();if(prof.weights)out.strategicLearning.push('現在の重み上位: '+topWeights(prof.weights).join(' / '));
  const missedUserGoals=ev.filter(e=>e.type==='turn_end_snapshot'&&e.data&&e.data.owner==='p1'&&e.data.legal&&e.data.legal.counts&&e.data.legal.counts.goals>0);if(missedUserGoals.length)out.decisiveMoments.push('自分のターン終了時点で即ゴール可能だった記録が '+missedUserGoals.length+' 件あります。');
  const missedAiGoals=ev.filter(e=>e.type==='turn_end_snapshot'&&e.data&&e.data.owner==='p2'&&e.data.legal&&e.data.legal.counts&&e.data.legal.counts.goals>0);if(missedAiGoals.length)out.aiLearningHints.push('AIが即ゴール可能な状態でターンを終えた疑いが '+missedAiGoals.length+' 件あります。');
  const generic=ev.filter(e=>e.type==='ai_plan_generic');if(generic.length)out.aiLearningHints.push('汎用特徴量によるAI候補評価を '+generic.length+' 回記録しました。');
  return out;
}
if(!K._analysisReportPatched){
  K._analysisReportPatched=true;
  const build0=K.buildMatchReport;
  K.buildMatchReport=function(){
    const rep=build0?build0.apply(this,arguments):{};
    rep.analysis=analyze(rep);
    rep.strategicLearningProfile=learn(rep);
    return rep;
  };
}
})(window.KOMA);

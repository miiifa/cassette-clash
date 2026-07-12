window.KOMA=window.KOMA||{};
(function(K){
const STORE='runeClashHumanPatterns.v1';
function now(){return Date.now();}
function arr(x){return Array.isArray(x)?x:[];}
function piece(p){return p?{id:p.id,owner:p.owner,fig:p.fig,name:p.n,pos:p.pos||null,mp:p.mp,wait:p.wait||0,status:{condition:p.status&&p.status.condition||null,mpMinus:p.status&&p.status.mpMinus||0},level:p.level||1,boss:!!p.boss}:null;}
function event(type,data){
  if(!K.s)return;
  K.s.report=K.s.report||{schema:'koma-match-report.v2',startedAt:new Date().toISOString(),events:[],logs:[]};
  K.s.report.events=K.s.report.events||[];
  K.s.report.events.push({i:K.s.report.events.length,t:now(),turn:K.s.turn,turnCount:K.s.turnCount,phase:K.s.phase,type,data});
  if(K.s.report.events.length>520)K.s.report.events.shift();
}
function loadProfile(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{};}catch(e){return{};}}
function saveProfile(p){try{localStorage.setItem(STORE,JSON.stringify(p));}catch(e){}}
function inc(obj,key,n=1){obj[key]=(obj[key]||0)+n;}
function dist(a,b){if(!a||!b)return 99;if(a===b)return 0;const seen=new Map([[a,0]]),q=[a];while(q.length){const c=q.shift(),d=seen.get(c);for(const n of K.neigh(c)){if(seen.has(n))continue;if(n===b)return d+1;seen.set(n,d+1);q.push(n);}}return 99;}
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
    if(K.s[enemy]){
      for(const p of arr(K.s[enemy].field))if(K.canAct(p)&&K.moveTargets(p,enemy).includes(K.TARGET[enemy]))out.enemyGoalThreats.push({type:'move',piece:piece(p),to:K.TARGET[enemy]});
      for(const p of arr(K.s[enemy].bench))if(K.entryTargets(p,enemy).includes(K.TARGET[enemy]))out.enemyGoalThreats.push({type:'deploy',piece:piece(p),to:K.TARGET[enemy]});
    }
  }catch(e){out.error=e.message;}
  out.counts={goals:out.goals.length,moves:out.moves.length,deploys:out.deploys.length,battles:out.battles.length,enemyGoalThreats:out.enemyGoalThreats.length};
  return out;
}
K.learningLegalSnapshot=legalSnapshot;
function nodeFromPoint(e){
  const b=document.getElementById('board');
  if(!b||!K.NODES)return null;
  const r=b.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;
  let best=null,bd=9999;
  for(const id of Object.keys(K.NODES)){const n=K.NODES[id],d=(n[0]-x)*(n[0]-x)+(n[1]-y)*(n[1]-y);if(d<bd){bd=d;best=id;}}
  return bd<18?best:null;
}
function pieceFromElement(el){
  if(!el)return null;
  const id=el.dataset&&el.dataset.pieceId;
  if(id&&K.byId)return K.byId(id);
  const nm=el.querySelector&&el.querySelector('.figName');
  const owner=el.classList&&el.classList.contains('p1')?'p1':el.classList&&el.classList.contains('p2')?'p2':null;
  if(!nm||!owner||!K.all)return null;
  return K.all().find(p=>p.owner===owner&&p.n===nm.textContent)||null;
}
function classifyTap(e){
  const fig=pieceFromElement(e.target.closest&&e.target.closest('#board .fig'));
  const node=nodeFromPoint(e);
  const occ=node&&K.at?K.at(node):null;
  return {node,piece:piece(fig||occ),raw:{x:Math.round(e.clientX),y:Math.round(e.clientY)}};
}
if(!K._learningTapPatched){
  K._learningTapPatched=true;
  document.addEventListener('pointerup',function(e){
    const board=document.getElementById('board');
    if(!board||!board.contains(e.target)||!K.s)return;
    const before={turn:K.s.turn,turnCount:K.s.turnCount,phase:K.s.phase,selectedId:K.s.selectedId||null,pendingAttacker:K.s.pendingAttacker||null,events:K.s.report&&K.s.report.events&&K.s.report.events.length||0};
    const target=classifyTap(e),legal=legalSnapshot(K.s.turn||'p1');
    const selected=K.byId&&K.byId(K.s.pendingAttacker||K.s.selectedId);
    const couldBattle=!!(selected&&target.piece&&target.piece.owner!==selected.owner&&selected.pos&&target.piece.pos&&K.neigh(selected.pos).includes(target.piece.pos));
    const couldMove=!!(target.node&&arr(K.s.targets).includes(target.node));
    event('user_tap',{target,before,legalSummary:legal.counts,couldBattle,couldMove});
    setTimeout(()=>{
      if(!K.s||K.s.win)return;
      const afterEvents=K.s.report&&K.s.report.events&&K.s.report.events.length||0;
      const same=K.s.turnCount===before.turnCount&&K.s.phase===before.phase&&K.s.selectedId===before.selectedId;
      if((couldBattle||couldMove)&&same&&afterEvents<=before.events+1){
        event('tap_possible_no_action',{target,before,reason:couldBattle?'legal_battle_tap_did_not_advance':'legal_move_tap_did_not_advance'});
      }
    },140);
  },true);
}
function planSummary(plan){return plan?{type:plan.type,piece:piece(plan.p),to:plan.n||null,defender:piece(plan.d),score:plan.score!=null?Math.round(plan.score):null}:null;}
function counterHumanPlan(){
  const prof=loadProfile();
  if(!K.s||!prof||!prof.figWins)return null;
  const dangerous=Object.keys(prof.figWins).filter(f=>(prof.figWins[f]||0)>=2 || (prof.goalFinishers&&prof.goalFinishers[f]>=1));
  if(!dangerous.length)return null;
  const target=K.TARGET.p1;
  let best=null;
  function set(plan,score,why){if(!best||score>best.score)best={...plan,score,why};}
  for(const p of arr(K.s.p1.field)){
    if(!dangerous.includes(p.fig))continue;
    const d=dist(p.pos,target);
    const danger=(prof.goalFinishers&&prof.goalFinishers[p.fig]||0)*32000+(prof.figWins[p.fig]||0)*9000+(d<=2?42000:0);
    for(const a of arr(K.s.p2.field))if(K.canAct(a)&&K.neigh(a.pos).includes(p.pos))set({type:'battle',p:a,d:p},780000+danger+(K.battleScore?K.battleScore(a,p)*18:0),'learned_human_finisher_counter');
  }
  for(const p of arr(K.s.p2.field))if(K.canAct(p)&&K.moveTargets(p,'p2').includes(target))set({type:'move',p,n:target},760000,'learned_goal_block');
  for(const p of arr(K.s.p2.bench))if(K.entryTargets(p,'p2').includes(target))set({type:'deploy',p,n:target},735000,'learned_goal_block');
  return best;
}
if(!K._learningAiPatched){
  K._learningAiPatched=true;
  const choose0=K.chooseAiPlan;
  if(choose0){
    K.chooseAiPlan=function(){
      const snap=legalSnapshot('p2');
      const base=choose0.apply(this,arguments);
      const learned=counterHumanPlan();
      const chosen=learned&&(!base||learned.score>(base.score||0)+70000)?learned:base;
      event('ai_plan',{legalSummary:snap.counts,base:planSummary(base),learned:planSummary(learned),chosen:planSummary(chosen)});
      if(chosen&&learned&&chosen===learned)K.log('AI学習: あなたの勝ち筋を警戒して行動を変更します。');
      return chosen;
    };
  }
}
if(!K._learningEndTurnPatched){
  K._learningEndTurnPatched=true;
  const end0=K.endTurn;
  if(end0){
    K.endTurn=function(){
      if(K.s)event('turn_end_snapshot',{owner:K.s.turn,legal:legalSnapshot(K.s.turn)});
      return end0.apply(this,arguments);
    };
  }
}
function analyze(rep){
  const ev=arr(rep.events),logs=arr(rep.logs),out={bugSuspicions:[],winLoss:[],decisiveMoments:[],humanLearning:[],aiLearningHints:[]};
  const noActions=ev.filter(e=>e.type==='tap_possible_no_action');
  if(noActions.length)out.bugSuspicions.push('合法手っぽいタップ後に状態が進まない記録が '+noActions.length+' 件あります。隣接敵タップ/移動マス判定の確認対象です。');
  const rejects=logs.filter(x=>/今はそのユニットを選べません/.test(x)).length;
  if(rejects>=3)out.bugSuspicions.push('「今はそのユニットを選べません」が '+rejects+' 回あります。UIが意図と違う対象を拾っている可能性があります。');
  const winner=rep.winner,final=rep.winDetail&&rep.winDetail.piece;
  if(winner==='p1'&&final)out.winLoss.push('勝因: '+final.name+' が '+rep.winDetail.target+' に到達してゴール勝ち。');
  if(winner==='p2'&&final)out.winLoss.push('敗因: 相手の '+final.name+' にゴールを許しました。');
  const pcBy={p1:0,p2:0};
  for(const e of ev.filter(e=>e.type==='pc')){const o=e.data&&e.data.pieceBefore&&e.data.pieceBefore.owner;if(o)pcBy[o]++;}
  out.winLoss.push('PC送り: 自分 '+pcBy.p1+' / 相手 '+pcBy.p2+'。');
  const runeUses=logs.filter(x=>/魔札「|プレート「/.test(x)&&/使用/.test(x));
  if(runeUses.length)out.humanLearning.push('魔札使用パターン: '+runeUses.slice(-4).join(' / '));
  const surrounds=logs.filter(x=>/包囲されました/.test(x));
  if(surrounds.length)out.humanLearning.push('包囲で相手を落とす勝ち筋が使われています: '+surrounds.slice(-3).join(' / '));
  const statusWins=ev.filter(e=>e.type==='battle_result'&&e.data&&e.data.attacker&&e.data.attacker.owner==='p1'&&e.data.attackerSeg&&e.data.attackerSeg.c==='purple');
  if(statusWins.length)out.humanLearning.push('紫技で判定勝ち/状態異常を狙う傾向があります。件数: '+statusWins.length); 
  const missedUserGoals=ev.filter(e=>e.type==='turn_end_snapshot'&&e.data&&e.data.owner==='p1'&&e.data.legal&&e.data.legal.counts&&e.data.legal.counts.goals>0);
  if(missedUserGoals.length)out.decisiveMoments.push('自分のターン終了時点で即ゴール可能だった記録が '+missedUserGoals.length+' 件あります。意図的に攻めなかった/気づかなかった場面の確認対象です。');
  const missedAiGoals=ev.filter(e=>e.type==='turn_end_snapshot'&&e.data&&e.data.owner==='p2'&&e.data.legal&&e.data.legal.counts&&e.data.legal.counts.goals>0);
  if(missedAiGoals.length)out.aiLearningHints.push('AIが即ゴール可能な状態でターンを終えた疑いが '+missedAiGoals.length+' 件あります。即勝ち優先をさらに強めるべきです。');
  const aiLearned=ev.filter(e=>e.type==='ai_plan'&&e.data&&e.data.learned&&e.data.chosen&&e.data.learned.why);
  if(aiLearned.length)out.aiLearningHints.push('あなたの勝ち筋を参照したAI補正が '+aiLearned.length+' 回発火しました。');
  if(winner==='p1'&&final)out.aiLearningHints.push('AI改善: '+final.name+' のゴールルートを危険パターンとして記憶し、次回以降ブロック/攻撃優先度を上げます。');
  return out;
}
function learn(rep){
  if(!K.s||!rep||rep.winner!=='p1'||K.s.report.learnedMatchKey===rep.generatedAt)return null;
  const prof=loadProfile();
  prof.matches=(prof.matches||0)+1;
  prof.p1Wins=(prof.p1Wins||0)+1;
  prof.figWins=prof.figWins||{};
  prof.goalFinishers=prof.goalFinishers||{};
  prof.runes=prof.runes||{};
  prof.tags=prof.tags||{};
  const final=rep.winDetail&&rep.winDetail.piece;
  if(final){inc(prof.figWins,final.fig);inc(prof.goalFinishers,final.fig);inc(prof.tags,'goal_rush');}
  for(const e of arr(rep.events)){
    if(e.type==='battle_result'){
      const a=e.data&&e.data.attacker,d=e.data&&e.data.defender;
      if(a&&a.owner==='p1')inc(prof.figWins,a.fig,.15);
      if(d&&d.owner==='p1')inc(prof.figWins,d.fig,.08);
    }
  }
  for(const l of arr(rep.logs)){
    const m=l.match(/魔札「([^」]+)」/);if(m)inc(prof.runes,m[1]);
    if(/包囲されました/.test(l))inc(prof.tags,'surround_pc');
    if(/ねむり|眠り/.test(l))inc(prof.tags,'sleep_control');
  }
  prof.updatedAt=new Date().toISOString();
  saveProfile(prof);
  K.s.report.learnedMatchKey=rep.generatedAt;
  return prof;
}
if(!K._analysisReportPatched){
  K._analysisReportPatched=true;
  const build0=K.buildMatchReport;
  K.buildMatchReport=function(){
    const rep=build0?build0.apply(this,arguments):{};
    rep.analysis=analyze(rep);
    const prof=learn(rep);
    rep.humanLearningProfile=prof||loadProfile();
    return rep;
  };
}
})(window.KOMA);

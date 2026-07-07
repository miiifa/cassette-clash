window.KOMA=window.KOMA||{};
(function(K){
function cloneStatus(s){return s?{condition:s.condition||null,mpMinus:s.mpMinus||0}:{};}
function piece(p){return p?{id:p.id,owner:p.owner,fig:p.fig,name:p.n,pos:p.pos||null,mp:p.mp,effMp:(K.effectiveMp&&K.s&&!K.s.win)?K.effectiveMp(p,p.owner):null,wait:p.wait||0,status:cloneStatus(p.status),level:p.level||1,boss:!!p.boss,tuning:p.tuning||null}:null;}
function zone(owner,z){return ((K.s&&K.s[owner]&&K.s[owner][z])||[]).map(piece);}
function legalGoals(owner){
  if(!K.s||K.s.win)return[];
  const out=[];
  try{
    for(const p of K.s[owner].field){
      if(!K.canAct(p))continue;
      for(const n of K.moveTargets(p,owner))if(n===K.TARGET[owner])out.push({type:'move',piece:piece(p),to:n});
    }
    for(const p of K.s[owner].bench){
      for(const n of K.entryTargets(p,owner))if(n===K.TARGET[owner])out.push({type:'deploy',piece:piece(p),to:n});
    }
  }catch(e){out.push({error:e.message});}
  return out;
}
function surrounded(){
  const r=[];
  if(!K.s)return r;
  try{
    for(const p of K.all()){
      const ns=K.neigh(p.pos);
      const ok=!!(ns.length&&ns.every(n=>{const o=K.at(n);return o&&o.owner!==p.owner;}));
      if(ok)r.push({piece:piece(p),neighbors:ns.map(n=>({node:n,occupant:piece(K.at(n))}))});
    }
  }catch(e){r.push({error:e.message});}
  return r;
}
function inferReason(){
  const logs=((K.s&&K.s.log)||[]).slice();
  const tail=logs.slice(-12).join('\n');
  if(/ゴールしました/.test(tail))return'goal';
  if(/動けません/.test(tail)||/完全に動けません/.test(tail))return'no_legal_action';
  if(/包囲/.test(tail)&&/PC/.test(tail))return'surround_pc_sequence';
  if(K.s&&K.s.win)return'unknown_win_condition';
  return'not_finished';
}
function boardMap(){
  const m={};
  if(!K.s)return m;
  for(const id of Object.keys(K.NODES))m[id]=piece(K.at(id));
  return m;
}
function report(){
  const s=K.s;
  const rep={
    schema:'koma-match-report.v1',
    generatedAt:new Date().toISOString(),
    winner:s&&s.win||null,
    turn:s&&s.turn||null,
    turnCount:s&&s.turnCount||0,
    phase:s&&s.phase||null,
    reason:inferReason(),
    targets:K.TARGET,
    spawn:K.SPAWN,
    decks:{p1:K.DECKS&&K.DECKS.p1||[],p2:K.DECKS&&K.DECKS.p2||[]},
    plates:{p1Remaining:s&&s.p1plates||[],p2Remaining:s&&s.p2plates||[],active:s&&s.activePlate||null,usedPlateThisTurn:!!(s&&s.usedPlateThisTurn)},
    zones:{
      p1:{bench:zone('p1','bench'),field:zone('p1','field'),pc:zone('p1','pc')},
      p2:{bench:zone('p2','bench'),field:zone('p2','field'),pc:zone('p2','pc')}
    },
    board:boardMap(),
    diagnostics:{
      tailLog:(s&&s.log||[]).slice(-30),
      surroundedAtEnd:surrounded(),
      immediateGoalActions:{p1:legalGoals('p1'),p2:legalGoals('p2')}
    },
    events:(s&&s.report&&s.report.events||[]).slice(),
    logs:(s&&s.report&&s.report.logs||s&&s.log||[]).slice()
  };
  return rep;
}
K.buildMatchReport=report;
function addEvent(type,data){
  if(!K.s)return;
  K.s.report=K.s.report||{events:[],logs:[],startedAt:new Date().toISOString()};
  K.s.report.events.push({i:K.s.report.events.length,t:Date.now(),turn:K.s.turn,turnCount:K.s.turnCount,phase:K.s.phase,type,data});
  if(K.s.report.events.length>260)K.s.report.events.shift();
}
if(!K._reportInitPatched){
  K._reportInitPatched=true;
  const init0=K.initState;
  K.initState=function(){
    const ret=init0.apply(this,arguments);
    K.s.report={schema:'koma-match-report.v1',startedAt:new Date().toISOString(),events:[],logs:[]};
    addEvent('match_start',{decks:K.DECKS,targets:K.TARGET,spawn:K.SPAWN});
    return ret;
  };
}
if(!K._reportLogPatched){
  K._reportLogPatched=true;
  const log0=K.log;
  K.log=function(msg){
    const ret=log0.apply(this,arguments);
    if(K.s){
      K.s.report=K.s.report||{events:[],logs:[],startedAt:new Date().toISOString()};
      K.s.report.logs.push(String(msg));
      if(K.s.report.logs.length>300)K.s.report.logs.shift();
    }
    return ret;
  };
}
if(!K._reportActionPatched){
  K._reportActionPatched=true;
  const dep0=K.deploy;
  K.deploy=function(p,n){addEvent('deploy',{pieceBefore:piece(p),to:n});return dep0.apply(this,arguments);};
  const mov0=K.movePiece;
  K.movePiece=function(p,n){addEvent('move_start',{pieceBefore:piece(p),from:p&&p.pos,to:n});return mov0.apply(this,arguments);};
  const pc0=K.pc;
  K.pc=function(p){addEvent('pc',{pieceBefore:piece(p),at:p&&p.pos});return pc0.apply(this,arguments);};
  const bench0=K.sendToBench;
  K.sendToBench=function(p,done){addEvent('send_to_bench',{pieceBefore:piece(p),at:p&&p.pos});return bench0.apply(this,arguments);};
  const battle0=K.resolveBattle;
  K.resolveBattle=function(a,d,as,ds,out){
    addEvent('battle_result',{attacker:piece(a),defender:piece(d),attackerSeg:as&&as.seg,defenderSeg:ds&&ds.seg,outcome:out});
    return battle0.apply(this,arguments);
  };
  const end0=K.endTurn;
  K.endTurn=function(){addEvent('end_turn',{from:K.s&&K.s.turn});return end0.apply(this,arguments);};
}
function ensurePanel(){
  let p=document.getElementById('matchReportPanel');
  if(p)return p;
  const log=document.getElementById('log');
  if(!log||!log.parentNode)return null;
  p=document.createElement('section');
  p.id='matchReportPanel';
  p.className='matchReportPanel';
  p.innerHTML='<div class="reportHead"><b>試合レポート JSON</b><button id="copyReportBtn">コピー</button></div><textarea id="matchReportText" spellcheck="false"></textarea>';
  log.parentNode.insertBefore(p,log.nextSibling);
  p.querySelector('#copyReportBtn').onclick=()=>{
    const text=p.querySelector('#matchReportText').value;
    if(navigator.clipboard)navigator.clipboard.writeText(text).catch(()=>{});
    const b=p.querySelector('#copyReportBtn');b.textContent='コピー済';setTimeout(()=>b.textContent='コピー',900);
  };
  return p;
}
K.renderMatchReport=function(){
  const p=ensurePanel();
  if(!p||!K.s)return;
  if(!K.s.win){p.style.display='none';return;}
  p.style.display='block';
  const text=JSON.stringify(K.buildMatchReport(),null,2);
  const ta=p.querySelector('#matchReportText');
  if(ta&&ta.value!==text)ta.value=text;
};
if(!K._reportRenderPatched){
  K._reportRenderPatched=true;
  const render0=K.render;
  K.render=function(){render0&&render0();K.renderMatchReport&&K.renderMatchReport();};
}
})(window.KOMA);

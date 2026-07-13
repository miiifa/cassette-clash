window.KOMA=window.KOMA||{};
(function(K){
if(K._reportUiFixPatched)return;
K._reportUiFixPatched=true;
const render0=K.renderMatchReport;
let reportUrl=null;
function safe(s){return String(s||'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');}
function fileName(rep){
  const t=new Date().toISOString().replace(/[:.]/g,'-');
  return 'rc-min-t'+(rep.turnCount||0)+'-'+safe(rep.winner||'x')+'-'+t+'.json';
}
function pz(p){return p?{i:p.id,o:p.owner,f:p.fig,n:p.name||p.n,p:p.pos||p.rawPos||null,m:p.mp,w:p.wait||0,c:p.status&&p.status.condition||null,mm:p.status&&p.status.mpMinus||0,b:!!p.boss}:null;}
function segz(s){return s?{c:s.c,n:s.n,d:s.d,e:s.e||null}:null;}
function fz(f){if(!f)return null;const out={};for(const k of ['goalNow','blockEnemyGoal','goalPressure','enemyGoalDanger','battleExpected','surroundGain','surroundRisk','centerControl','spawnBlock','targetOccupy','pcLead','fieldLead','statusPressure','tempo','clearOwnGoal','postBattleGoalRisk'])if(f[k])out[k]=Math.round(f[k]*100)/100;return out;}
function planz(pl){return pl?{t:pl.type,p:pz(pl.piece||pl.p),to:pl.to||pl.n||null,d:pz(pl.defender||pl.d),s:pl.score==null?null:Math.round(pl.score),f:fz(pl.features),why:pl.why||null,surround:pl.surround||null}:null;}
function boardz(board){const o={};if(!board)return o;for(const k of Object.keys(board)){const p=board[k];if(p)o[k]=[p.owner,p.fig,p.name||p.n,p.mp,p.wait||0,p.status&&p.status.condition||null];}return o;}
function zonez(z){return{bench:(z&&z.bench||[]).map(pz),field:(z&&z.field||[]).map(pz),pc:(z&&z.pc||[]).map(pz)};}
function slimEvent(e){
  const d=e.data||{},base={i:e.i,tc:e.turnCount,t:e.turn,ph:e.phase,ty:e.type};
  if(e.type==='match_start')return {...base,decks:d.decks,targets:d.targets,spawn:d.spawn};
  if(e.type==='deploy')return {...base,p:pz(d.pieceBefore||d.pieceAfter),to:d.to};
  if(e.type==='move')return {...base,p:pz(d.pieceBefore||d.pieceAfter),from:d.from,to:d.to};
  if(e.type==='pc')return {...base,p:pz(d.pieceBefore||d.pieceAfter)};
  if(e.type==='battle_result')return {...base,a:pz(d.attacker),d:pz(d.defender),as:segz(d.attackerSeg),ds:segz(d.defenderSeg),o:d.outcome};
  if(e.type==='strategic_action')return {...base,o:d.owner,pl:planz(d.plan),ab:!!d.actualBattle};
  if(e.type==='ai_plan_code'||e.type==='ai_plan_generic')return {...base,ls:d.legalSummary,b:planz(d.base),c:planz(d.code||d.learned),ch:planz(d.chosen),v:d.codeLearningVersion||null};
  if(e.type==='ai_target_guard_hold')return {...base,target:d.target,guard:d.guard,threats:d.threats,blocked:d.blockedPlan};
  if(e.type==='ai_anti_surround')return {...base,guard:d.guard,blockNode:d.blockNode,enemyNeighbors:d.enemyNeighbors,enemyFillers:d.enemyFillers,chosen:d.chosen,base:d.base};
  if(e.type==='ai_yomi'||e.type==='ai_yomi_scan')return {...base,predicted:d.predicted,counter:d.counter,basePlan:d.base,used:e.type==='ai_yomi'};
  if(e.type==='ai_ev_choice')return {...base,v:d.version,basePlan:d.base,evBest:d.evBest,top:d.top,chosen:d.chosen,used:!!d.used};
  if(e.type==='turn_end_snapshot')return {...base,o:d.owner,ls:d.legal&&d.legal.counts,goals:(d.legal&&d.legal.goals||[]).map(x=>({t:x.type,p:pz(x.piece),to:x.to})),threats:(d.legal&&d.legal.enemyGoalThreats||[]).map(x=>({t:x.type,p:pz(x.piece),to:x.to}))};
  if(e.type==='tap_possible_no_action')return {...base,target:d.target&&{node:d.target.node,p:pz(d.target.piece)},reason:d.reason,before:d.before};
  if(e.type==='user_tap'){
    if(!d.couldBattle&&!d.couldMove)return null;
    return {...base,target:d.target&&{node:d.target.node,p:pz(d.target.piece)},cb:!!d.couldBattle,cm:!!d.couldMove,before:d.before};
  }
  if(e.type==='prebattle_prompt_open')return {...base,d:pz(d.defender),ls:d.legal&&d.legal.counts};
  if(e.type==='ai_turn_start')return {...base,ls:d.legal&&d.legal.counts,v:d.codeLearningVersion||null};
  if(e.type==='end_turn')return {...base,from:d.from};
  if(e.type==='place_piece')return null;
  return {...base,d};
}
function compactReport(rep){
  const events=(rep.events||[]).map(slimEvent).filter(Boolean);
  return {
    v:'rc-min-1',
    gen:rep.generatedAt,
    res:{w:rep.winner,t:rep.turn,tc:rep.turnCount,ph:rep.phase,r:rep.reason,detail:rep.winDetail&&{r:rep.winDetail.reason,w:rep.winDetail.winner,target:rep.winDetail.target,p:pz(rep.winDetail.piece)}},
    targets:rep.targets,
    plates:{p1:rep.plates&&rep.plates.p1Remaining,active:rep.plates&&rep.plates.active,used:rep.plates&&rep.plates.usedPlateThisTurn},
    zones:{p1:zonez(rep.zones&&rep.zones.p1),p2:zonez(rep.zones&&rep.zones.p2)},
    board:boardz(rep.board),
    diag:{imm:rep.diagnostics&&rep.diagnostics.immediateGoalActions,stale:rep.diagnostics&&rep.diagnostics.staleNonFieldPositions,tail:(rep.diagnostics&&rep.diagnostics.tailLog||[]).slice(0,18)},
    analysis:rep.analysis,
    profile:rep.strategicLearningProfile,
    ev:events
  };
}
function summary(rep,small){
  const a=rep.analysis||{};
  const lines=[];
  lines.push('勝者: '+(rep.winner||'-')+' / 理由: '+(rep.reason||'-')+' / TURN '+(rep.turnCount||0));
  if(rep.winDetail&&rep.winDetail.piece)lines.push('決着: '+rep.winDetail.piece.name+' → '+rep.winDetail.target);
  if(a.winLoss&&a.winLoss.length)lines.push('勝敗分析: '+a.winLoss.slice(0,2).join(' / '));
  if(a.aiLearningHints&&a.aiLearningHints.length)lines.push('AI改善メモ: '+a.aiLearningHints.slice(0,2).join(' / '));
  if(a.bugSuspicions&&a.bugSuspicions.length)lines.push('バグ疑い: '+a.bugSuspicions.slice(0,2).join(' / '));
  lines.push('保存ファイルはAI解析用の軽量JSONです。画面表示用の全文JSONは作りません。');
  if(small)lines.push('軽量化: '+small.fullKb+'KB → '+small.minKb+'KB');
  return lines.join('\n');
}
function makeFile(text){
  if(reportUrl)URL.revokeObjectURL(reportUrl);
  reportUrl=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'}));
  return reportUrl;
}
function ensurePanel(){let p=document.getElementById('matchReportPanel');if(p)return p;render0&&render0();return document.getElementById('matchReportPanel');}
function enhancePanel(p){
  if(p.dataset.fileEnhanced)return;
  p.dataset.fileEnhanced='1';
  p.innerHTML='<div class="reportHead"><b>試合レポート</b><span class="reportActions"><button id="downloadReportBtn" type="button">軽量JSON保存</button><button id="closeReportBtn" type="button">閉じる</button><button id="replayReportBtn" type="button">もう一回</button></span></div><pre id="matchReportSummary" class="matchReportSummary"></pre>';
  const close=p.querySelector('#closeReportBtn');
  if(close)close.onclick=()=>{p.dataset.closed='1';p.style.display='none';};
  const replay=p.querySelector('#replayReportBtn');
  if(replay)replay.onclick=()=>{p.dataset.closed='1';const reset=document.getElementById('resetBtn');if(reset)reset.click();else if(K.initState){K.initState();K.render&&K.render();}};
}
K.renderMatchReport=function(){
  if(!K.s||!K.s.win){const p=document.getElementById('matchReportPanel');if(p)p.style.display='none';return;}
  const p=ensurePanel();if(!p)return;if(p.dataset.closed==='1'){p.style.display='none';return;}
  enhancePanel(p);p.style.display='block';
  const rep=K.buildMatchReport?K.buildMatchReport():{};
  const compact=compactReport(rep);
  const text=JSON.stringify(compact);
  const fullLen=JSON.stringify(rep).length,minLen=text.length;
  const url=makeFile(text);
  const sum=p.querySelector('#matchReportSummary');
  if(sum)sum.textContent=summary(rep,{fullKb:Math.round(fullLen/1024),minKb:Math.round(minLen/1024)});
  const dl=p.querySelector('#downloadReportBtn');
  if(dl)dl.onclick=()=>{const a=document.createElement('a');a.href=url;a.download=fileName(rep);document.body.appendChild(a);a.click();a.remove();dl.textContent='保存しました';setTimeout(()=>dl.textContent='軽量JSON保存',900);};
};
const init0=K.initState;
if(init0&&!K._reportUiInitPatched){K._reportUiInitPatched=true;K.initState=function(){const p=document.getElementById('matchReportPanel');if(p)p.dataset.closed='';if(reportUrl){URL.revokeObjectURL(reportUrl);reportUrl=null;}return init0.apply(this,arguments);};}
})(window.KOMA);

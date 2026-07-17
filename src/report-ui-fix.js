window.KOMA=window.KOMA||{};
(function(K){
if(K._reportUiFixPatched)return;
K._reportUiFixPatched=true;
const render0=K.renderMatchReport;
let reportUrl=null;
function safe(s){return String(s||'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');}
function fileName(rep){const t=new Date().toISOString().replace(/[:.]/g,'-');return 'rc-fast-t'+(rep.turnCount||0)+'-'+safe(rep.winner||'x')+'-'+t+'.json';}
function pz(p){return p?{i:p.id,o:p.owner,f:p.fig,p:p.pos||p.rawPos||null,m:p.mp,w:p.wait||0,c:p.status&&p.status.condition||null,mm:p.status&&p.status.mpMinus||0,b:!!p.boss}:null;}
function segz(s){return s?{c:s.c,d:s.d,e:s.e||null}:null;}
function planz(pl){return pl?{t:pl.type,p:pz(pl.piece||pl.p),to:pl.to||pl.n||null,d:pz(pl.defender||pl.d),s:pl.score==null?null:Math.round(pl.score),why:pl.why||pl.reasons||null,blockNode:pl.blockNode||null,surroundDanger:pl.surroundDanger||null}:null;}
function zonez(z){return{b:(z&&z.bench||[]).map(pz),f:(z&&z.field||[]).map(pz),pc:(z&&z.pc||[]).map(pz)};}
function boardz(board){const o={};if(!board)return o;for(const k of Object.keys(board)){const p=board[k];if(p)o[k]=[p.owner,p.fig,p.mp,p.wait||0,p.status&&p.status.condition||null];}return o;}
function counts(events){const o={};for(const e of events||[])o[e.type]=(o[e.type]||0)+1;return o;}
function base(e){return{i:e.i,tc:e.turnCount,t:e.turn,ph:e.phase,ty:e.type};}
function slimDecision(d){return{chosen:d.chosen,ctx:d.context&&{p2Goals:d.context.p2Goals,p1Goals:d.context.p1Goals,p2GoalBlockers:d.context.p2GoalBlockers,p1GoalBlockers:d.context.p1GoalBlockers,guard:d.context.guard,pc:d.context.pc,field:d.context.field}};}
function slimEvent(e){
  const d=e.data||{},b=base(e),t=e.type;
  if(t==='deploy')return{...b,p:pz(d.pieceBefore||d.pieceAfter),to:d.to};
  if(t==='move'||t==='move_start')return{...b,p:pz(d.pieceBefore||d.pieceAfter),from:d.from,to:d.to};
  if(t==='pc')return{...b,p:pz(d.pieceBefore||d.pieceAfter)};
  if(t==='battle_result')return{...b,a:pz(d.attacker),d:pz(d.defender),as:segz(d.attackerSeg),ds:segz(d.defenderSeg),o:d.outcome};
  if(t==='strategic_action')return{...b,o:d.owner,pl:planz(d.plan),ab:!!d.actualBattle};
  if(t==='turn_end_snapshot')return{...b,o:d.owner,ls:d.legal&&d.legal.counts,goals:(d.legal&&d.legal.goals||[]).map(x=>({t:x.type,p:pz(x.piece),to:x.to})),threats:(d.legal&&d.legal.enemyGoalThreats||[]).map(x=>({t:x.type,p:pz(x.piece),to:x.to}))};
  if(t==='ai_decision_final')return{...b,...slimDecision(d)};
  if(t==='ai_emergency_block')return{...b,chosen:d.chosen,enemyThreats:d.enemyThreats,ownGoal:d.ownGoal,noSafe:!!d.noSafe,reason:d.reason||null};
  if(t==='ai_guard_surround_emergency'||t==='ai_guard_surround_no_good_block')return{...b,chosen:d.chosen||d.candidate,enemyThreats:d.enemyThreats,used:t==='ai_guard_surround_emergency'};
  if(t==='ai_guard_surround_rescue')return{...b,chosen:d.chosen,danger:d.danger};
  if(t==='ai_guard_core_hold'||t==='ai_guard_core_skip')return{...b,target:d.target,guard:d.guard,threats:d.threats,reason:d.reason,blocked:d.blockedPlan,chosen:d.chosen||null};
  if(t==='ai_target_guard_hold')return{...b,target:d.target,guard:d.guard,threats:d.threats,blocked:d.blockedPlan};
  if(t==='ai_anti_surround')return{...b,guard:d.guard,blockNode:d.blockNode,enemyNeighbors:d.enemyNeighbors,enemyFillers:d.enemyFillers,chosen:d.chosen,base:d.base};
  if(t==='ai_yomi'||t==='ai_yomi_scan')return{...b,predicted:d.predicted,counter:d.counter,basePlan:d.base,used:t==='ai_yomi'};
  if(t==='ai_ev_choice')return{...b,v:d.version,basePlan:d.base,evBest:d.evBest,top:d.top,chosen:d.chosen,used:!!d.used};
  if(t==='tap_possible_no_action')return{...b,target:d.target&&{node:d.target.node,p:pz(d.target.piece)},reason:d.reason,before:d.before};
  if(t==='prebattle_prompt_open')return{...b,d:pz(d.defender),ls:d.legal&&d.legal.counts};
  if(t==='end_turn')return{...b,from:d.from};
  return null;
}
function isImportant(e,lastStart){
  if(!e)return false;
  if(e.ty&&e.ty.indexOf('ai_')===0)return true;
  if(e.tc>=lastStart)return true;
  if(e.ty==='turn_end_snapshot'&&((e.goals&&e.goals.length)||(e.threats&&e.threats.length)))return true;
  if(e.ty==='tap_possible_no_action')return true;
  return false;
}
function compactReport(rep){
  const raw=rep.events||[],lastStart=Math.max(0,(rep.turnCount||0)-14);
  const ev=raw.map(slimEvent).filter(e=>isImportant(e,lastStart));
  const a=rep.analysis||{};
  return{
    v:'rc-fast-2',
    gen:rep.generatedAt,
    res:{w:rep.winner,t:rep.turn,tc:rep.turnCount,ph:rep.phase,r:rep.reason,detail:rep.winDetail&&{r:rep.winDetail.reason,w:rep.winDetail.winner,target:rep.winDetail.target,p:pz(rep.winDetail.piece)}},
    targets:rep.targets,
    zones:{p1:zonez(rep.zones&&rep.zones.p1),p2:zonez(rep.zones&&rep.zones.p2)},
    board:boardz(rep.board),
    plates:{p1:rep.plates&&rep.plates.p1Remaining,active:rep.plates&&rep.plates.active,used:rep.plates&&rep.plates.usedPlateThisTurn},
    ana:{bug:a.bugSuspicions||[],win:a.winLoss||[],dm:a.decisiveMoments||[],hint:a.aiLearningHints||[],noise:a.filteredNoise||[]},
    cnt:counts(raw),
    ev
  };
}
function summary(rep,small){
  const a=rep.analysis||{},lines=[];
  lines.push('勝者: '+(rep.winner||'-')+' / 理由: '+(rep.reason||'-')+' / TURN '+(rep.turnCount||0));
  if(rep.winDetail&&rep.winDetail.piece)lines.push('決着: '+rep.winDetail.piece.name+' → '+rep.winDetail.target);
  if(a.winLoss&&a.winLoss.length)lines.push('勝敗分析: '+a.winLoss.slice(0,2).join(' / '));
  if(a.aiLearningHints&&a.aiLearningHints.length)lines.push('AI改善メモ: '+a.aiLearningHints.slice(0,2).join(' / '));
  if(a.bugSuspicions&&a.bugSuspicions.length)lines.push('バグ疑い: '+a.bugSuspicions.slice(0,2).join(' / '));
  lines.push('保存形式: rc-fast-2。終盤・AI判断・脅威スナップショット中心の複数行JSONです。');
  if(small)lines.push('サイズ: '+small.minKb+'KB / events '+small.evCount+'件');
  return lines.join('\n');
}
function makeFile(text){if(reportUrl)URL.revokeObjectURL(reportUrl);reportUrl=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'}));return reportUrl;}
function ensurePanel(){let p=document.getElementById('matchReportPanel');if(p)return p;render0&&render0();return document.getElementById('matchReportPanel');}
function enhancePanel(p){
  if(p.dataset.fileEnhanced)return;
  p.dataset.fileEnhanced='1';
  p.innerHTML='<div class="reportHead"><b>試合レポート</b><span class="reportActions"><button id="downloadReportBtn" type="button">高速JSON保存</button><button id="closeReportBtn" type="button">閉じる</button><button id="replayReportBtn" type="button">もう一回</button></span></div><pre id="matchReportSummary" class="matchReportSummary"></pre>';
  const close=p.querySelector('#closeReportBtn');if(close)close.onclick=()=>{p.dataset.closed='1';p.style.display='none';};
  const replay=p.querySelector('#replayReportBtn');if(replay)replay.onclick=()=>{p.dataset.closed='1';const reset=document.getElementById('resetBtn');if(reset)reset.click();else if(K.initState){K.initState();K.render&&K.render();}};
}
K.renderMatchReport=function(){
  if(!K.s||!K.s.win){const p=document.getElementById('matchReportPanel');if(p)p.style.display='none';return;}
  const p=ensurePanel();if(!p)return;if(p.dataset.closed==='1'){p.style.display='none';return;}
  enhancePanel(p);p.style.display='block';
  const rep=K.buildMatchReport?K.buildMatchReport():{};
  const compact=compactReport(rep);
  const text=JSON.stringify(compact,null,2);
  const url=makeFile(text);
  const sum=p.querySelector('#matchReportSummary');
  if(sum)sum.textContent=summary(rep,{minKb:Math.round(text.length/1024),evCount:compact.ev.length});
  const dl=p.querySelector('#downloadReportBtn');
  if(dl)dl.onclick=()=>{const a=document.createElement('a');a.href=url;a.download=fileName(rep);document.body.appendChild(a);a.click();a.remove();dl.textContent='保存しました';setTimeout(()=>dl.textContent='高速JSON保存',900);};
};
const init0=K.initState;
if(init0&&!K._reportUiInitPatched){K._reportUiInitPatched=true;K.initState=function(){const p=document.getElementById('matchReportPanel');if(p)p.dataset.closed='';if(reportUrl){URL.revokeObjectURL(reportUrl);reportUrl=null;}return init0.apply(this,arguments);};}
})(window.KOMA);

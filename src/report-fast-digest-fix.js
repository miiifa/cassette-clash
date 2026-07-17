window.KOMA=window.KOMA||{};
(function(K){
if(K._reportFastDigestFixPatched)return;
K._reportFastDigestFixPatched=true;
let reportUrl=null;
function safe(s){return String(s||'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');}
function fname(rep){const t=new Date().toISOString().replace(/[:.]/g,'-');return 'rc-digest-t'+(rep.turnCount||0)+'-'+safe(rep.winner||'x')+'-'+t+'.json';}
function pz(p){return p?{i:p.id||p.i,o:p.owner||p.o,f:p.fig||p.f,p:p.pos||p.p||p.rawPos||null,m:p.mp||p.m||0,w:p.wait||p.w||0,c:(p.status&&p.status.condition)||p.c||null,mm:(p.status&&p.status.mpMinus)||p.mm||0,b:!!(p.boss||p.b)}:null;}
function planz(pl){return pl?{t:pl.type||pl.t,p:pz(pl.piece||pl.p),to:pl.to||pl.n||null,d:pz(pl.defender||pl.d),s:pl.score==null&&pl.s==null?null:Math.round(pl.score||pl.s||0),why:pl.why||pl.reasons||null}:null;}
function slim(e){
  const d=e.data||e.d||{},ty=e.type||e.ty,base={i:e.i,tc:e.turnCount||e.tc,t:e.turn||e.t,ty};
  if(ty==='strategic_action')return {...base,o:d.owner||e.o,pl:planz(d.plan||e.pl),ab:!!(d.actualBattle||e.ab)};
  if(ty==='turn_end_snapshot')return {...base,o:d.owner||e.o,goals:(d.legal&&d.legal.goals||e.goals||[]).map(planz),threats:(d.legal&&d.legal.enemyGoalThreats||e.threats||[]).map(planz)};
  if(ty==='battle_result')return {...base,a:pz(d.attacker||e.a),d:pz(d.defender||e.d),o:d.outcome||e.o};
  if(ty==='move'||ty==='move_start')return {...base,p:pz(d.pieceBefore||d.pieceAfter||e.p),from:d.from||e.from,to:d.to||e.to};
  if(ty==='deploy')return {...base,p:pz(d.pieceBefore||d.pieceAfter||e.p),to:d.to||e.to};
  if(ty==='pc')return {...base,p:pz(d.pieceBefore||d.pieceAfter||e.p)};
  if(/^ai_/.test(ty))return {...base,d:e.d||d};
  if(ty==='tap_possible_no_action')return {...base,target:d.target||e.target,reason:d.reason||e.reason};
  return null;
}
function keyEvents(rep){
  const ev=rep.events||[];
  const tc=rep.turnCount||0;
  const out=[];
  for(const e of ev){
    const ty=e.type||e.ty,t=e.turnCount||e.tc;
    const isAi=/^ai_/.test(ty);
    const isLate=t>=tc-14;
    const isThreat=ty==='turn_end_snapshot'&&(((e.data&&e.data.legal&&e.data.legal.enemyGoalThreats)||e.threats||[]).length||((e.data&&e.data.legal&&e.data.legal.goals)||e.goals||[]).length);
    const isCritical=['pc','battle_result','strategic_action','move_start','move','deploy','tap_possible_no_action'].includes(ty);
    if(isAi||isThreat||(isLate&&isCritical)){const s=slim(e);if(s)out.push(s);}
  }
  return out.slice(-140);
}
function zonez(z){return{f:(z&&z.field||[]).map(pz),b:(z&&z.bench||[]).map(pz),pc:(z&&z.pc||[]).map(pz)}}
function digest(rep){
  const analysis=rep.analysis||{};
  return {
    v:'rc-digest-1',
    gen:rep.generatedAt,
    result:{w:rep.winner,r:rep.reason,tc:rep.turnCount,detail:rep.winDetail&&{w:rep.winDetail.winner,r:rep.winDetail.reason,target:rep.winDetail.target,p:pz(rep.winDetail.piece)}},
    targets:rep.targets,
    zones:{p1:zonez(rep.zones&&rep.zones.p1),p2:zonez(rep.zones&&rep.zones.p2)},
    board:rep.board,
    flags:{bugs:(analysis.bugSuspicions||[]).length,noise:(analysis.filteredNoise||[]).length,winLoss:analysis.winLoss||[],hints:analysis.aiLearningHints||[]},
    key:keyEvents(rep)
  };
}
function makeFile(text){if(reportUrl)URL.revokeObjectURL(reportUrl);reportUrl=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'}));return reportUrl;}
function panel(){let p=document.getElementById('matchReportPanel');if(!p){p=document.createElement('div');p.id='matchReportPanel';p.className='matchReportPanel';document.body.appendChild(p);}return p;}
K.renderMatchReport=function(){
  if(!K.s||!K.s.win){const p=document.getElementById('matchReportPanel');if(p)p.style.display='none';return;}
  const p=panel();if(p.dataset.closed==='1'){p.style.display='none';return;}p.style.display='block';
  p.innerHTML='<div class="reportHead"><b>試合レポート</b><span class="reportActions"><button id="downloadReportBtn" type="button">解析JSON保存</button><button id="closeReportBtn" type="button">閉じる</button><button id="replayReportBtn" type="button">もう一回</button></span></div><pre id="matchReportSummary" class="matchReportSummary"></pre>';
  const rep=K.buildMatchReport?K.buildMatchReport():{};
  const small=digest(rep);
  const text=JSON.stringify(small,null,2);
  const url=makeFile(text);
  const sum=p.querySelector('#matchReportSummary');
  if(sum)sum.textContent=['勝者: '+(rep.winner||'-')+' / '+(rep.reason||'-')+' / TURN '+(rep.turnCount||0),rep.winDetail&&rep.winDetail.piece?'決着: '+rep.winDetail.piece.name+' → '+rep.winDetail.target:null,'出力: rc-digest-1 / 終盤・AI判断・ゴール脅威だけ'].filter(Boolean).join('\n');
  const close=p.querySelector('#closeReportBtn');if(close)close.onclick=()=>{p.dataset.closed='1';p.style.display='none';};
  const replay=p.querySelector('#replayReportBtn');if(replay)replay.onclick=()=>{p.dataset.closed='1';const r=document.getElementById('resetBtn');if(r)r.click();else if(K.initState){K.initState();K.render&&K.render();}};
  const dl=p.querySelector('#downloadReportBtn');if(dl)dl.onclick=()=>{const a=document.createElement('a');a.href=url;a.download=fname(rep);document.body.appendChild(a);a.click();a.remove();dl.textContent='保存しました';setTimeout(()=>dl.textContent='解析JSON保存',900);};
};
const init0=K.initState;
if(init0&&!K._reportFastDigestInitPatched){K._reportFastDigestInitPatched=true;K.initState=function(){const p=document.getElementById('matchReportPanel');if(p)p.dataset.closed='';if(reportUrl){URL.revokeObjectURL(reportUrl);reportUrl=null;}return init0.apply(this,arguments);};}
})(window.KOMA);

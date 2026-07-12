window.KOMA=window.KOMA||{};
(function(K){
if(K._reportUiFixPatched)return;
K._reportUiFixPatched=true;
const render0=K.renderMatchReport;
let reportUrl=null;
function safe(s){return String(s||'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');}
function fileName(rep){
  const t=new Date().toISOString().replace(/[:.]/g,'-');
  return 'rune-clash-report-turn'+(rep.turnCount||0)+'-'+safe(rep.winner||'unfinished')+'-'+t+'.json';
}
function summary(rep){
  const a=rep.analysis||{};
  const prof=rep.strategicLearningProfile||rep.humanLearningProfile||{};
  const lines=[];
  lines.push('勝者: '+(rep.winner||'-')+' / 理由: '+(rep.reason||'-')+' / TURN '+(rep.turnCount||0));
  if(rep.winDetail&&rep.winDetail.piece)lines.push('決着: '+rep.winDetail.piece.name+' → '+rep.winDetail.target);
  if(a.winLoss&&a.winLoss.length)lines.push('勝敗分析: '+a.winLoss.slice(0,2).join(' / '));
  if(a.strategicLearning&&a.strategicLearning.length)lines.push('汎用学習: '+a.strategicLearning.slice(0,2).join(' / '));
  if(a.aiLearningHints&&a.aiLearningHints.length)lines.push('AI改善メモ: '+a.aiLearningHints.slice(0,2).join(' / '));
  if(a.bugSuspicions&&a.bugSuspicions.length)lines.push('バグ疑い: '+a.bugSuspicions.slice(0,2).join(' / '));
  if(prof.matches)lines.push('学習済み試合数: '+prof.matches);
  lines.push('下のボタンでJSONファイルを保存して、このチャットにアップロードしてください。');
  return lines.join('\n');
}
function makeFile(text){
  if(reportUrl)URL.revokeObjectURL(reportUrl);
  reportUrl=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'}));
  return reportUrl;
}
function ensurePanel(){
  let p=document.getElementById('matchReportPanel');
  if(p)return p;
  render0&&render0();
  return document.getElementById('matchReportPanel');
}
function enhancePanel(p){
  if(p.dataset.fileEnhanced)return;
  p.dataset.fileEnhanced='1';
  p.innerHTML='<div class="reportHead"><b>試合レポート</b><span class="reportActions"><button id="downloadReportBtn" type="button">JSONファイル保存</button><button id="closeReportBtn" type="button">閉じる</button><button id="replayReportBtn" type="button">もう一回</button></span></div><pre id="matchReportSummary" class="matchReportSummary"></pre><details class="reportJsonDetails"><summary>JSONを画面で見る</summary><textarea id="matchReportText" spellcheck="false"></textarea></details>';
  const close=p.querySelector('#closeReportBtn');
  if(close)close.onclick=()=>{p.dataset.closed='1';p.style.display='none';};
  const replay=p.querySelector('#replayReportBtn');
  if(replay)replay.onclick=()=>{
    p.dataset.closed='1';
    const reset=document.getElementById('resetBtn');
    if(reset)reset.click();
    else if(K.initState){K.initState();K.render&&K.render();}
  };
}
K.renderMatchReport=function(){
  if(!K.s||!K.s.win){
    const p=document.getElementById('matchReportPanel');
    if(p)p.style.display='none';
    return;
  }
  const p=ensurePanel();
  if(!p)return;
  if(p.dataset.closed==='1'){p.style.display='none';return;}
  enhancePanel(p);
  p.style.display='block';
  const rep=K.buildMatchReport?K.buildMatchReport():{};
  const text=JSON.stringify(rep,null,2);
  const url=makeFile(text);
  const sum=p.querySelector('#matchReportSummary');
  if(sum)sum.textContent=summary(rep);
  const ta=p.querySelector('#matchReportText');
  if(ta&&ta.value!==text)ta.value=text;
  const dl=p.querySelector('#downloadReportBtn');
  if(dl)dl.onclick=()=>{
    const a=document.createElement('a');
    a.href=url;
    a.download=fileName(rep);
    document.body.appendChild(a);
    a.click();
    a.remove();
    dl.textContent='保存しました';
    setTimeout(()=>dl.textContent='JSONファイル保存',900);
  };
};
const init0=K.initState;
if(init0&&!K._reportUiInitPatched){
  K._reportUiInitPatched=true;
  K.initState=function(){
    const p=document.getElementById('matchReportPanel');
    if(p)p.dataset.closed='';
    if(reportUrl){URL.revokeObjectURL(reportUrl);reportUrl=null;}
    return init0.apply(this,arguments);
  };
}
})(window.KOMA);

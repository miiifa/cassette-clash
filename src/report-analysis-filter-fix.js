window.KOMA=window.KOMA||{};
(function(K){
if(K._reportAnalysisFilterFixPatched)return;
K._reportAnalysisFilterFixPatched=true;
function arr(x){return Array.isArray(x)?x:[];}
function sameTarget(a,b){
  const ap=a&&a.data&&a.data.target;
  const bd=b&&b.data&&b.data.defender;
  if(!ap||!bd)return false;
  const p=ap.piece||ap.p;
  return !!(p&&bd&&p.id&&bd.id&&p.id===bd.id);
}
function isPrebattleFalsePositive(e,events){
  if(!e||e.type!=='tap_possible_no_action')return false;
  if(!e.data||e.data.reason!=='legal_battle_tap_did_not_advance')return false;
  return events.some(x=>x&&x.type==='prebattle_prompt_open'&&x.turnCount===e.turnCount&&Math.abs((x.i||0)-(e.i||0))<=4&&sameTarget(e,x));
}
function rebuildBugSuspicions(rep){
  rep.analysis=rep.analysis||{};
  const other=arr(rep.analysis.bugSuspicions).filter(s=>!/合法手っぽいタップ後/.test(s));
  const no=arr(rep.events).filter(e=>e.type==='tap_possible_no_action');
  if(no.length)other.unshift('合法手っぽいタップ後に状態が進まない記録が '+no.length+' 件あります。');
  rep.analysis.bugSuspicions=other;
}
const build0=K.buildMatchReport;
if(build0){
  K.buildMatchReport=function(){
    const rep=build0.apply(this,arguments)||{};
    const events=arr(rep.events);
    const filtered=events.filter(e=>!isPrebattleFalsePositive(e,events));
    if(filtered.length!==events.length){
      rep.events=filtered.map((e,i)=>({...e,i}));
      rep.analysis=rep.analysis||{};
      rep.analysis.filteredNoise=arr(rep.analysis.filteredNoise);
      rep.analysis.filteredNoise.push('バトル前魔札ポップアップ表示によるタップ無反応誤検知を '+(events.length-filtered.length)+' 件除外しました。');
      rebuildBugSuspicions(rep);
    }
    return rep;
  };
}
})(window.KOMA);

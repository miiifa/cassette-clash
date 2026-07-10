window.KOMA=window.KOMA||{};
(function(K){
if(K._reportUiFixPatched)return;
K._reportUiFixPatched=true;
const render0=K.renderMatchReport;
K.renderMatchReport=function(){
  render0&&render0();
  const p=document.getElementById('matchReportPanel');
  if(!p)return;
  if(p.dataset.closed==='1'){
    p.style.display='none';
    return;
  }
  if(!p.dataset.enhanced){
    p.dataset.enhanced='1';
    const head=p.querySelector('.reportHead');
    if(head){
      let actions=document.createElement('span');
      actions.className='reportActions';
      const copy=p.querySelector('#copyReportBtn');
      if(copy)actions.appendChild(copy);
      actions.insertAdjacentHTML('beforeend','<button id="closeReportBtn" type="button">閉じる</button><button id="replayReportBtn" type="button">もう一回</button>');
      head.appendChild(actions);
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
  }
};
const init0=K.initState;
if(init0&&!K._reportUiInitPatched){
  K._reportUiInitPatched=true;
  K.initState=function(){
    const p=document.getElementById('matchReportPanel');
    if(p)p.dataset.closed='';
    return init0.apply(this,arguments);
  };
}
})(window.KOMA);

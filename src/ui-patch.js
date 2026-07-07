window.KOMA=window.KOMA||{};
(function(K){
  K.tickWait=function(owner){
    if(!K.s||!K.s[owner])return;
    const pieces=[...K.s[owner].bench,...K.s[owner].field];
    for(const p of pieces)if(p.wait>0)p.wait--;
  };
  const baseRender=K.render;
  K.render=function(){
    baseRender&&baseRender();
    if(K.s&&K.s.phase==='moving'){
      const status=document.querySelector('#status');
      if(status)status.textContent='移動中...';
    }
    if(K.s&&K.s.fx){
      for(const id of Object.keys(K.s.fx)){
        const fx=K.s.fx[id];
        if(!fx||!fx.cls)continue;
        const p=K.byId&&K.byId(id);
        if(!p)continue;
        for(const el of document.querySelectorAll('.fig')){
          const name=el.querySelector('span')&&el.querySelector('span').textContent;
          if(name===p.n&&el.classList.contains(p.owner))el.classList.add(fx.cls);
        }
      }
    }
  };
  const placeBase=K.placePiece;
  K.placePiece=function(p,node,from){
    try{
      placeBase.apply(this,arguments);
    }catch(e){
      K.log('ターン処理エラーを修復: '+e.message);
      K.s.locked=false;
      K.s.phase='idle';
      K.endTurn();
      return;
    }
    setTimeout(()=>{
      if(!K.s||K.s.win||K.s.locked||!p||p.owner!=='p1'||K.s.turn!=='p1')return;
      if(K.s.phase==='chooseBattle'){
        const a=K.byId(K.s.pendingAttacker||K.s.selectedId);
        if(a&&K.battleableEnemies(a).length)return;
        K.log('バトル相手がいないためターン終了。');
        K.endTurn();
        return;
      }
      if(K.s.phase==='idle'||K.s.phase==='chooseTarget'){
        K.log('行動完了。AIターンへ。');
        K.endTurn();
      }
    },80);
  };
})(window.KOMA);

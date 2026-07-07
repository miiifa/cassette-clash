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
  K.placePiece=function(p,node,from){
    p.pos=node;
    K.setFx(p,from,node);

    // 重要: ゴール勝利より先に包囲判定。
    // ゴール上に乗っても、その瞬間に包囲されていればPC送りで勝利しない。
    K.resolveSurrounds();

    if(!K.s[p.owner].field.includes(p)){
      K.s.locked=false;
      K.endTurn();
      return;
    }

    if(node===K.TARGET[p.owner]){
      K.s.win=p.owner;
      K.clearSelection();
      K.s.locked=false;
      K.log(p.n+'がゴールしました。'+p.owner+'の勝利！');
      K.render&&K.render();
      return;
    }

    const enemies=K.battleableEnemies(p);
    if(enemies.length){
      K.s.locked=false;
      K.s.phase='chooseBattle';
      K.s.pendingAttacker=p.id;
      K.s.selectedId=null;
      K.s.selectedType=null;
      K.s.targets=[];
      K.s.attacks=enemies.map(e=>e.pos);
      K.log('隣接敵を選ぶとバトルします。戦わない場合は「バトルしない」。');
      K.render&&K.render();
      if(p.owner==='p2'&&K.s.ai)window.setTimeout(()=>K.aiChooseEnemy(),350);
      return;
    }

    K.s.locked=false;
    K.endTurn();
  };
})(window.KOMA);

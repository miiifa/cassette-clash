window.KOMA=window.KOMA||{};
(function(K){
K.checkGoals=function(){
  if(!K.s||K.s.win)return;
  K.resolveSurrounds&&K.resolveSurrounds();
  if(K.s.win)return;
  for(const owner of ['p1','p2']){
    const target=K.TARGET[owner];
    const p=K.s[owner].field.find(x=>x.pos===target);
    if(p){
      K.s.win=owner;
      K.s.locked=false;
      K.s.phase='idle';
      K.clearSelection&&K.clearSelection();
      K.log(p.n+'がゴールしました。'+owner+'の勝利！');
      K.render&&K.render();
      return;
    }
  }
};
if(!K._goalAfterEffectPatched){
  K._goalAfterEffectPatched=true;
  const end0=K.endTurn;
  K.endTurn=function(){
    K.checkGoals&&K.checkGoals();
    if(K.s&&K.s.win){K.render&&K.render();return;}
    return end0.apply(this,arguments);
  };
}
if(!K._typeComparePatched){
  K._typeComparePatched=true;
  const cmp0=K.compare;
  K.compare=function(a,b,ap,bp){
    function apply(seg,p,enemy){
      if(!seg||!p||!enemy||seg._typeApplied)return;
      if(seg.c==='white'||seg.c==='gold'){
        const bonus=K.typeAdvantage?K.typeAdvantage(p,enemy):0;
        if(bonus>0){seg.d=(seg.d||0)+bonus;seg.typeBonus=(seg.typeBonus||0)+bonus;}
      }
      seg._typeApplied=true;
    }
    apply(a,ap,bp);apply(b,bp,ap);
    return cmp0.call(this,a,b,ap,bp);
  };
}
if(!K._noMoveGracePatched){
  K._noMoveGracePatched=true;
  K.checkNoMoveWin=function(){
    if(K.s.win)return;
    const owner=K.s.turn;
    const can=K.s[owner].bench.some(p=>K.entryTargets(p,owner).length)||K.s[owner].field.some(p=>K.canWakeByAlly(p)||(K.canAct(p)&&(K.moveTargets(p,owner).length||K.battleableEnemies(p).length)));
    if(!can){
      K.log(owner+'は有効な行動がありません。ターンを終了します。');
    }
  };
}
})(window.KOMA);

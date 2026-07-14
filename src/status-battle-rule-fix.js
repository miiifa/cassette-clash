window.KOMA=window.KOMA||{};
(function(K){
if(K._statusBattleRuleFixPatched)return;
K._statusBattleRuleFixPatched=true;
function isHardStatus(p){return p&&p.status&&(p.status.condition==='sleep'||p.status.condition==='frozen');}
function statusName(c){return c==='frozen'?'こおり':'ねむり';}
K.battleableEnemies=function(p){return K.adjacentEnemies(p);};
const start0=K.startBattle;
K.startBattle=function(defenderId){
  const a=K.byId(K.s&&(K.s.pendingAttacker||K.s.selectedId)),d=K.byId(defenderId);
  if(!a||!d||!a.pos||!d.pos||!K.neigh(a.pos).includes(d.pos)){
    K.log&&K.log('隣接していないのでバトルできません。');
    K.render&&K.render();
    return;
  }
  if(isHardStatus(a)){
    K.log&&K.log(statusName(a.status.condition)+'状態の駒はバトルを仕掛けられません。');
    K.render&&K.render();
    return;
  }
  if(isHardStatus(d)){
    const old=d.status.condition;
    d.status.condition=null;
    K.log&&K.log(d.n+'はバトル対象になったため'+statusName(old)+'が治りました。');
  }
  return start0.apply(this,arguments);
};
})(window.KOMA);

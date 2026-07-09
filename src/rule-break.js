window.KOMA=window.KOMA||{};
(function(K){
function hasRuleBreak(p){return !!(p&&K.FIGURES[p.fig]&&K.FIGURES[p.fig].ability&&K.FIGURES[p.fig].ability.ruleBreak);}
function rawValue(seg,p){
  let v=Math.max(0,(seg.d||0)-(seg.typeBonus||0));
  if((seg.c==='white'||seg.c==='gold')&&p&&p.status){
    if(p.status.condition==='poison')v=Math.max(0,v-20);
    if(p.status.condition==='toxic')v=Math.max(0,v-40);
    if(p.status.condition==='burn')v=Math.max(0,v-10);
  }
  return v;
}
function stripBoost(seg){
  if(!seg)return seg;
  const z=Object.assign({},seg);
  if(z.typeBonus){z.d=Math.max(0,(z.d||0)-z.typeBonus);z.typeBonus=0;}
  if(z.boost&&z.boost>1)z.boost=1;
  return z;
}
K.ruleBreakSuppressed=function(p){return !!(K.s&&K.s._ruleBreakSuppress&&p&&K.s._ruleBreakSuppress[p.id]);};
if(!K._ruleBreakTypePatched){
  K._ruleBreakTypePatched=true;
  const type0=K.typeAdvantage;
  K.typeAdvantage=function(attacker,defender){
    if(K.ruleBreakSuppressed&&K.ruleBreakSuppressed(attacker))return 0;
    return type0?type0(attacker,defender):0;
  };
}
if(!K._ruleBreakValuePatched){
  K._ruleBreakValuePatched=true;
  const base0=K.baseValue;
  K.baseValue=function(seg,p){
    if(K.ruleBreakSuppressed&&K.ruleBreakSuppressed(p)&&(seg.c==='white'||seg.c==='gold'))return rawValue(seg,p);
    return base0?base0(seg,p):(seg.d||0);
  };
}
if(!K._ruleBreakComparePatched){
  K._ruleBreakComparePatched=true;
  const cmp0=K.compare;
  K.compare=function(a,b,ap,bp){
    const suppress={};
    const aRule=hasRuleBreak(ap),bRule=hasRuleBreak(bp);
    let aa=a,bb=b;
    if(aRule&&bp){suppress[bp.id]=true;bb=stripBoost(b);}
    if(bRule&&ap){suppress[ap.id]=true;aa=stripBoost(a);}
    const old=K.s&&K.s._ruleBreakSuppress;
    if(K.s)K.s._ruleBreakSuppress=suppress;
    if(aRule&&bp)K.log(ap.n+'の特性「ルールブレイク」: '+bp.n+'の強化補正を無効化します。');
    if(bRule&&ap)K.log(bp.n+'の特性「ルールブレイク」: '+ap.n+'の強化補正を無効化します。');
    try{return cmp0.call(this,aa,bb,ap,bp);}finally{if(K.s)K.s._ruleBreakSuppress=old;}
  };
}
if(K.FIGURES&&K.FIGURES.modulyn){
  K.FIGURES.modulyn.ability={name:'ルールブレイク',text:'このユニットがバトルする時、相手のカセット・特性・技・弱点による一時的なダメージアップを無効化します。元のダメージや状態異常による低下はそのままです。',ruleBreak:true};
  K.FIGURES.modulyn.desc='カセット信号を読み替える小型メカ。相手の強化ルールを壊し、一時的なダメージアップを無効化する。';
}
})(window.KOMA);

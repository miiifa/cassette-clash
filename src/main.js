window.KOMA=window.KOMA||{};
(function(K){
function M(c,n,d,s,e){return{c,n,d,s,e:e||null};}
K.installOriginalFigures=function(){
  K.FIGURES.shadowlynx={
    n:'シャドリンクス',mp:3,r:'OR',
    ability:{name:'影すり抜け',text:'このポケモン自身は他のポケモンを通過して移動できます。相手の背後に回り込んで包囲を作る役。',passThrough:true},
    w:[M('purple','影しばり',2,28,{condition:'confuse'}),M('white','ナイトクロー',70,28),M('blue','すりぬけ',0,24),M('miss','ミス',0,20)]
  };
  K.FIGURES.morinemuri={
    n:'モリネムリ',mp:2,r:'OR',
    w:[M('purple','ねむり胞子',2,30,{condition:'sleep'}),M('white','からみツル',50,24,{mpMinus:1}),M('purple','どくの霧',1,24,{condition:'poison'}),M('miss','ミス',0,22)]
  };
  K.FIGURES.oshinaga={
    n:'オシナガ',mp:2,r:'OR',
    w:[M('purple','押し潮',3,28,{pushLine:true,wait:1}),M('white','シェルバッシュ',80,28),M('blue','受け流し',0,20),M('miss','ミス',0,24)]
  };
  K.FIGURES.kanamemori={
    n:'カナメモリ',mp:1,r:'OR',
    w:[M('blue','鉄壁姿勢',0,36,{selfWait:1}),M('white','反射の盾',70,28),M('purple','足止め結界',2,20,{wait:2}),M('miss','ミス',0,16)]
  };
  K.FIGURES.hanebiri={
    n:'ハネビリ',mp:3,r:'OR',
    ability:{name:'跳電',text:'隣のポケモンを1体だけ飛び越えられる。ゴール取りと包囲補助が得意。',jump:true},
    w:[M('gold','瞬電',50,28),M('white','ライトニング',80,26),M('purple','しびれ羽',2,26,{condition:'paralyze'}),M('miss','ミス',0,20)]
  };
  K.FIGURES.shimetori={
    n:'シメトリ',mp:2,r:'OR',
    w:[M('purple','位置入れ替え',2,28,{swap:true}),M('white','はさみうち',60,28),M('purple','逃げ道封じ',2,24,{mpMinus:1}),M('miss','ミス',0,20)]
  };

  K.FIGURES.gravion={
    n:'グラビオン',mp:2,r:'BOSS',
    w:[M('purple','重力波',3,28,{pushLine:true,wait:1}),M('white','グラビクラッシュ',90,30),M('purple','重圧',2,22,{mpMinus:1}),M('miss','ミス',0,20)]
  };
  K.FIGURES.nightwarp={
    n:'ナイトワープ',mp:3,r:'BOSS',
    ability:{name:'暗転移動',text:'このポケモン自身は他のポケモンを通過して移動できます。',passThrough:true},
    w:[M('purple','幻惑',2,30,{condition:'confuse'}),M('white','ワープエッジ',80,30),M('blue','フェイズアウト',0,22),M('miss','ミス',0,18)]
  };
  K.FIGURES.voltclaw={
    n:'ボルトクロウ',mp:3,r:'BOSS',
    ability:{name:'雷跳び',text:'隣のポケモンを1体だけ飛び越えられる。',jump:true},
    w:[M('gold','雷爪',70,26),M('white','ボルトブレイク',90,28),M('purple','感電ロック',2,26,{condition:'paralyze'}),M('miss','ミス',0,20)]
  };
  K.FIGURES.mirrorguard={
    n:'ミラーガード',mp:1,r:'BOSS',
    w:[M('blue','完全防御',0,38,{selfWait:1}),M('white','ミラータックル',80,28),M('purple','封印反射',2,20,{wait:2}),M('miss','ミス',0,14)]
  };
  K.FIGURES.venomleaf={
    n:'ヴェノムリーフ',mp:2,r:'BOSS',
    w:[M('purple','猛毒花粉',2,28,{condition:'toxic'}),M('purple','眠り花粉',2,24,{condition:'sleep'}),M('white','リーフカッター',70,28),M('miss','ミス',0,20)]
  };
  K.FIGURES.novadrake={
    n:'ノヴァドレイク',mp:2,r:'BOSS',
    ability:{name:'飛翔',text:'隣のポケモンを1体だけ飛び越えられる。',jump:true},
    w:[M('white','ノヴァフレア',120,32),M('purple','吹き飛ばし',2,24,{bench:true}),M('white','かぎ爪',70,24),M('miss','ミス',0,20)]
  };
};
K.restoreFigureAbilities=function(){
  K.installOriginalFigures&&K.installOriginalFigures();
  if(K.FIGURES.gengar){
    K.FIGURES.gengar.ability={name:'すりぬけ',text:'このポケモン自身は他のポケモンを通過して移動できます。ただし他のポケモンがこのポケモンを通過できるわけではありません。',passThrough:true};
  }
  if(K.FIGURES.rotom){
    K.FIGURES.rotom.ability={name:'ふゆう',text:'このポケモン自身は他のポケモンを通過して移動できます。ただし他のポケモンがこのポケモンを通過できるわけではありません。',passThrough:true};
  }
  if(K.FIGURES.greninja){
    K.FIGURES.greninja.ability=null;
  }
  K.isPassThrough=p=>p.status.condition==='sleep'||p.status.condition==='frozen';
};
K.setBossDecks=function(){
  K.installOriginalFigures&&K.installOriginalFigures();
  K.DECKS={
    p1:['oshinaga','morinemuri','kanamemori','shadowlynx','shimetori','hanebiri'],
    p2:['gravion','nightwarp','voltclaw','mirrorguard','venomleaf','novadrake']
  };
};
K.applyBossBuffs=function(){
  if(!K.s||!K.s.p2)return;
  for(const p of [...K.s.p2.bench,...K.s.p2.field]){
    p.boss=true;
    p.level=5;
    p.mp=Math.min(4,p.mp+1);
    p.tuning=p.tuning||{};
    const wheel=K.FIGURES[p.fig].w||[];
    for(let i=0;i<wheel.length;i++){
      const seg=wheel[i];
      if(seg.c==='miss')p.tuning[i]=(p.tuning[i]||0)-10;
      else if(seg.c==='blue')p.tuning[i]=(p.tuning[i]||0)+4;
      else if(seg.c==='purple')p.tuning[i]=(p.tuning[i]||0)+8;
      else p.tuning[i]=(p.tuning[i]||0)+6;
    }
  }
};
if(!K._bossBaseValuePatched){
  K._bossBaseValuePatched=true;
  const base=K.baseValue;
  K.baseValue=function(seg,p){
    let v=base?base(seg,p):(seg.d||0);
    if(p&&p.owner==='p2'&&(seg.c==='white'||seg.c==='gold')){
      v+=p.boss?30:0;
      if(p.fig==='nightwarp'||p.fig==='voltclaw'||p.fig==='novadrake'||p.fig==='gravion')v+=10;
    }
    return v;
  };
}
K.start=function(){
  K.restoreFigureAbilities&&K.restoreFigureAbilities();
  K.setBossDecks&&K.setBossDecks();
  K.initState();
  K.applyBossBuffs&&K.applyBossBuffs();
  K.seedPlates&&K.seedPlates();
  K.render();
};
function loadCss(href){const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l);}
function loadScript(src,done){const s=document.createElement('script');s.src=src;s.onload=done;s.onerror=done;document.body.appendChild(s);}
window.addEventListener('DOMContentLoaded',()=>{
  K.restoreFigureAbilities&&K.restoreFigureAbilities();
  K.setBossDecks&&K.setBossDecks();
  loadCss('learning-ui.css');
  loadScript('src/ai-defaults.js',()=>{
    loadScript('src/lw.js',()=>{
      loadScript('src/learning-ui.js',()=>{K.bindUi();K.start();});
    });
  });
});
})(window.KOMA);

window.KOMA=window.KOMA||{};
(function(K){
K.FEATURED_CHARACTERS={
  modulyn:{
    vibe:'インテリ系 / 小型メカ',
    role:'カセット強化・盤面干渉',
    personality:'無表情だけど計算が速い、工具箱みたいな相棒。',
    desc:'カセット信号を読み替える小型メカ。小さい体で戦場のルールを書き換え、カセット技の火力を伸ばす。',
    iconPreset:{body:'smart',mood:'calm',gear:'antenna',sub:'gear'}
  },
  pushwyrm:{
    vibe:'クール系 / 流線モンスター',
    role:'押し流し・ライン崩し',
    personality:'静かに近づいて、一気に盤面を流す。',
    desc:'水流の背骨を持つ細長い獣。直線方向に相手を押し流し、ゴール前の形を崩す。',
    iconPreset:{body:'dragon',mood:'sharp',gear:'tail',sub:'wings'}
  },
  sleepvine:{
    vibe:'かわいい系 / 毒草トラップ',
    role:'眠り・毒床・妨害',
    personality:'ふわふわしているが、通ったあとに危険な胞子を残す。',
    desc:'眠りと毒で道を作る胞子ユニット。移動後に毒の足跡を残し、二度踏ませるとどくどくにする。',
    iconPreset:{body:'plant',mood:'sleepy',gear:'tail',sub:'leaf'}
  },
  gaiarmor:{
    vibe:'重装型 / ゴール番人',
    role:'防衛・壁・ゴール前固定',
    personality:'無口で頑固。動きは遅いが、どかすのが大変。',
    desc:'岩盤装甲の守護者。ゴール前に居座って道を塞ぐ、防衛寄りの重装ユニット。',
    iconPreset:{body:'armored',mood:'calm',gear:'shield',sub:'horns'}
  },
  phasecat:{
    vibe:'セクシー/クール系 / すりぬけ猫',
    role:'すりぬけ・入れ替え・奇襲',
    personality:'余裕たっぷりで、相手の背後にするりと現れる。',
    desc:'位相をずらして歩く猫型ユニット。すりぬけと入れ替えで相手の読みを外す。',
    iconPreset:{body:'elegant',mood:'wink',gear:'tail',sub:'cape'}
  },
  luminelle:{
    vibe:'かわいい系 / 光のサポーター',
    role:'MP低下・終盤ゴール',
    personality:'明るく軽い足取りで、相手のテンポを少しずつ削る。',
    desc:'光の鱗粉をまとう小さなランナー。MP低下でテンポを奪い、終盤のゴールを狙う。',
    iconPreset:{body:'bird',mood:'smile',gear:'halo',sub:'wings'}
  },
  voidray:{
    vibe:'クール系 / 闇の浮遊獣',
    role:'すりぬけ奇襲・BOSS圧力',
    personality:'深海のように静か。気づいた時にはゴール前にいる。',
    desc:'虚空を泳ぐBOSSユニット。暗い尾を引きながら、守りの隙間へ入り込む。',
    iconPreset:{body:'spirit',mood:'sharp',gear:'tail',sub:'halo'}
  },
  thornogre:{
    vibe:'モンスター型 / 棘の巨人',
    role:'眠り・拘束・圧力',
    personality:'怒りっぽく、近づいた相手を棘と胞子で縛る。',
    desc:'棘まみれの森の鬼。眠りと拘束で相手の動きを止め、BOSS側の進軍を支える。',
    iconPreset:{body:'beast',mood:'angry',gear:'horns',sub:'claws'}
  },
  mirrormoth:{
    vibe:'インテリ/妖艶系 / 鏡蛾',
    role:'入れ替え・幻惑',
    personality:'相手の位置関係を鏡のように反転させて遊ぶ。',
    desc:'鏡鱗粉をまとう幻惑型の蛾。位置入れ替えで安全地帯を危険地帯に変える。',
    iconPreset:{body:'elegant',mood:'calm',gear:'wings',sub:'gem'}
  },
  blastboar:{
    vibe:'モンスター型 / 爆走猪',
    role:'高火力・突進・押し込み',
    personality:'考える前に突っ込む。爆発力だけならトップ級。',
    desc:'燃える装甲を持つ猪型BOSS。高火力と突進でラインを壊す。',
    iconPreset:{body:'beast',mood:'angry',gear:'claws',sub:'flame'}
  },
  stormrook:{
    vibe:'クール系 / 嵐の鳥騎士',
    role:'飛行・奇襲・機動力',
    personality:'上空から盤面を見下ろし、薄い守りへ一直線に落ちる。',
    desc:'嵐をまとった鳥騎士。飛び越えや高速移動で、空いたルートを一気に突く。',
    iconPreset:{body:'bird',mood:'sharp',gear:'wings',sub:'weapon'}
  }
};
K.applyFeaturedCharacters=function(){
  if(!K.FIGURES)return;
  for(const [key,c] of Object.entries(K.FEATURED_CHARACTERS)){
    const f=K.FIGURES[key];
    if(!f)continue;
    f.vibe=c.vibe;
    f.role=c.role;
    f.personality=c.personality;
    f.desc=c.desc;
    f.iconPreset=c.iconPreset;
  }
};
K.applyFeaturedCharacters();
})(window.KOMA);

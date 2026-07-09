window.KOMA=window.KOMA||{};
(function(K){
const ASSETS={
  modulyn:'assets/characters/modulyn.svg',
  pushwyrm:'assets/characters/pushwyrm.svg',
  sleepvine:'assets/characters/sleepvine.svg',
  gaiarmor:'assets/characters/gaiarmor.svg',
  phasecat:'assets/characters/phasecat.svg',
  luminelle:'assets/characters/luminelle.svg',
  voidray:'assets/characters/voidray.svg',
  thornogre:'assets/characters/thornogre.svg',
  mirrormoth:'assets/characters/mirrormoth.svg',
  blastboar:'assets/characters/blastboar.svg',
  stormrook:'assets/characters/stormrook.svg'
};
const VIBES={
  modulyn:'インテリ系 / 小型メカ',
  pushwyrm:'クール系 / 流線モンスター',
  sleepvine:'かわいい系 / 毒草トラップ',
  gaiarmor:'重装型 / ゴール番人',
  phasecat:'セクシー/クール系 / すりぬけ猫',
  luminelle:'かわいい系 / 光のサポーター',
  voidray:'クール系 / 闇の浮遊獣',
  thornogre:'モンスター型 / 棘の巨人',
  mirrormoth:'インテリ/妖艶系 / 鏡蛾',
  blastboar:'モンスター型 / 爆走猪',
  stormrook:'クール系 / 嵐の鳥騎士'
};
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function fallback(p){
  const f=K.FIGURES[p.fig]||{},type=f.type||'mystic';
  const color=(K.TYPE_COLORS&&K.TYPE_COLORS[type])||'#94a3b8';
  const sym=(K.TYPE_SYMBOLS&&K.TYPE_SYMBOLS[type])||'●';
  return '<span class="charFallback" style="background:'+esc(color)+'">'+esc(sym)+'</span>';
}
K.characterIconMarkup=function(p){
  const src=ASSETS[p.fig];
  if(src)return '<img class="charImg" src="'+src+'" alt="'+esc(p.n)+'">';
  return fallback(p);
};
K.characterIconSmall=function(p){return K.characterIconMarkup(p);};
K.iconFor=function(p){return K.characterIconMarkup(p);};
K.characterVibe=function(fig){return VIBES[fig]||'個性派';};
K.characterVibeLabel=function(fig){return K.characterVibe(fig);};
})(window.KOMA);

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
  phasecat:'妖艶/クール系 / すりぬけ猫',
  luminelle:'かわいい系 / 光のサポーター',
  voidray:'クール系 / 闇の浮遊獣',
  thornogre:'モンスター型 / 棘の巨人',
  mirrormoth:'インテリ/妖艶系 / 鏡蛾',
  blastboar:'モンスター型 / 爆走猪',
  stormrook:'クール系 / 嵐の鳥騎士'
};
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function art(p){
  const src=K.CHARACTER_ART&&K.CHARACTER_ART[p.fig];
  if(!src)return null;
  return '<img class="charImg charArt" src="'+src+'" alt="'+esc(p.n)+'" loading="eager">';
}
function sprite(p){
  const pos=K.CHARACTER_SPRITE_POS&&K.CHARACTER_SPRITE_POS[p.fig];
  if(!K.CHARACTER_SPRITE||!pos)return null;
  const cols=K.CHARACTER_SPRITE_COLS||4,rows=K.CHARACTER_SPRITE_ROWS||3;
  const x=cols===1?0:(pos[0]/(cols-1))*100;
  const y=rows===1?0:(pos[1]/(rows-1))*100;
  return '<span class="charSprite" title="'+esc(p.n)+'" style="background-image:url('+K.CHARACTER_SPRITE+');background-position:'+x+'% '+y+'%"></span>';
}
function fallback(p){
  const src=ASSETS[p.fig];
  if(src)return '<img class="charImg" src="'+src+'" alt="'+esc(p.n)+'">';
  const f=K.FIGURES[p.fig]||{},type=f.type||'mystic';
  const color=(K.TYPE_COLORS&&K.TYPE_COLORS[type])||'#94a3b8';
  const sym=(K.TYPE_SYMBOLS&&K.TYPE_SYMBOLS[type])||'●';
  return '<span class="charFallback" style="background:'+esc(color)+'">'+esc(sym)+'</span>';
}
K.characterIconMarkup=function(p){return art(p)||sprite(p)||fallback(p);};
K.characterIconSmall=function(p){return K.characterIconMarkup(p);};
K.iconFor=function(p){return K.characterIconMarkup(p);};
K.characterVibe=function(fig){return VIBES[fig]||'個性派';};
K.characterVibeLabel=function(fig){return K.characterVibe(fig);};
})(window.KOMA);

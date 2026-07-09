window.KOMA=window.KOMA||{};
(function(K){
const bodyTypes=['cute','cool','smart','elegant','beast','mech','spirit','dragon','plant','armored','slime','bird'];
const moods=['smile','sharp','calm','wink','angry','sleepy'];
const gear=['none','tail','wings','horns','weapon','book','cape','antenna','claws','halo'];
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function palette(type,no){
  const base=(K.TYPE_COLORS&&K.TYPE_COLORS[type])||'#94a3b8';
  const dark={fire:'#7f1d1d',water:'#075985',leaf:'#14532d',electric:'#713f12',earth:'#422006',wind:'#134e4a',light:'#64748b',dark:'#2e1065',metal:'#334155',mystic:'#581c87'}[type]||'#111827';
  const hi={fire:'#fed7aa',water:'#bae6fd',leaf:'#bbf7d0',electric:'#fef08a',earth:'#fde68a',wind:'#99f6e4',light:'#ffffff',dark:'#ddd6fe',metal:'#e2e8f0',mystic:'#f5d0fe'}[type]||'#fff';
  const glow={fire:'#fb923c',water:'#7dd3fc',leaf:'#86efac',electric:'#fde047',earth:'#d97706',wind:'#5eead4',light:'#ffffff',dark:'#a78bfa',metal:'#cbd5e1',mystic:'#f0abfc'}[type]||'#fff';
  return{base,dark,hi,glow};
}
function iconMarkup(no,type){
  const p=palette(type,no);
  const body=bodyTypes[no%bodyTypes.length];
  const mood=moods[(no*3)%moods.length];
  const g1=gear[(no*5)%gear.length];
  const g2=gear[(no*7+3)%gear.length];
  return '<span class="charIcon fullBody body-'+esc(body)+' mood-'+esc(mood)+' gear-'+esc(g1)+' sub-'+esc(g2)+'" style="--c:'+p.base+';--d:'+p.dark+';--h:'+p.hi+';--g:'+p.glow+'">'
    +'<i class="shadow"></i><i class="back back1"></i><i class="back back2"></i><i class="leg l"></i><i class="leg r"></i><i class="tail"></i><i class="body"></i><i class="arm l"></i><i class="arm r"></i><i class="head"></i><i class="ear l"></i><i class="ear r"></i><i class="eye l"></i><i class="eye r"></i><i class="mouth"></i><i class="item"></i><i class="badge"></i>'
    +'</span>';
}
K.characterIconMarkup=function(p){
  const f=K.FIGURES[p.fig]||{},type=f.type||'mystic',no=f.no||1;
  return iconMarkup(no,type);
};
K.characterIconSmall=function(p){return K.characterIconMarkup(p);};
K.iconFor=function(p){return K.characterIconMarkup(p);};
K.characterVibe=function(fig){
  const f=K.FIGURES[fig]||{},no=f.no||1;
  return bodyTypes[no%bodyTypes.length];
};
K.characterVibeLabel=function(fig){
  return {cute:'かわいい系',cool:'クール系',smart:'インテリ系',elegant:'セクシー/優雅系',beast:'モンスター型',mech:'機械型',spirit:'精霊型',dragon:'ドラゴン型',plant:'植物型',armored:'重装型',slime:'ぷに系',bird:'鳥/飛行型'}[K.characterVibe(fig)]||'個性派';
};
})(window.KOMA);

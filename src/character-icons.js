window.KOMA=window.KOMA||{};
(function(K){
const shapes=['horns','ears','visor','orb','wings','crest','fangs','plant','ghost','shell','drake','mask'];
const eyeSets=['normal','wide','sleepy','angry','mono'];
const accents=['dot','stripe','gem','slash','spark','leaf','gear','moon','flame','drop'];
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function palette(type,no){
  const base=(K.TYPE_COLORS&&K.TYPE_COLORS[type])||'#94a3b8';
  const dark={fire:'#7f1d1d',water:'#075985',leaf:'#14532d',electric:'#713f12',earth:'#422006',wind:'#134e4a',light:'#64748b',dark:'#2e1065',metal:'#334155',mystic:'#581c87'}[type]||'#111827';
  const hi={fire:'#fed7aa',water:'#bae6fd',leaf:'#bbf7d0',electric:'#fef08a',earth:'#fde68a',wind:'#99f6e4',light:'#ffffff',dark:'#ddd6fe',metal:'#e2e8f0',mystic:'#f5d0fe'}[type]||'#fff';
  return{base,dark,hi};
}
function faceMarkup(no,type){
  const p=palette(type,no),shape=shapes[no%shapes.length],eyes=eyeSets[no%eyeSets.length],acc=accents[no%accents.length];
  const eye=eyes==='angry'?'<i class="eye l angry"></i><i class="eye r angry"></i>':eyes==='mono'?'<i class="eye mono"></i>':eyes==='sleepy'?'<i class="eye l sleepy"></i><i class="eye r sleepy"></i>':'<i class="eye l"></i><i class="eye r"></i>';
  return '<span class="charIcon char-'+esc(shape)+' eye-'+esc(eyes)+' acc-'+esc(acc)+'" style="--c:'+p.base+';--d:'+p.dark+';--h:'+p.hi+'"><i class="a1"></i><i class="a2"></i><b></b>'+eye+'<em></em></span>';
}
K.characterIconMarkup=function(p){
  const f=K.FIGURES[p.fig]||{},type=f.type||'mystic',no=f.no||1;
  return faceMarkup(no,type);
};
K.characterIconSmall=function(p){return K.characterIconMarkup(p);};
})(window.KOMA);

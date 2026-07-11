window.KOMA=window.KOMA||{};
(function(K){
function svg(rows,pal){
  const h=rows.length,w=Math.max(...rows.map(r=>r.length)),u=8;
  let body='<rect width="100%" height="100%" fill="none"/>';
  for(let y=0;y<h;y++)for(let x=0;x<rows[y].length;x++){
    const c=rows[y][x];
    if(c!=='.'&&pal[c])body+='<rect x="'+(x*u)+'" y="'+(y*u)+'" width="'+u+'" height="'+u+'" fill="'+pal[c]+'"/>';
  }
  const s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(w*u)+' '+(h*u)+'" shape-rendering="crispEdges">'+body+'</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
const P={k:'#111827',w:'#f8fafc',g:'#94a3b8',y:'#facc15',o:'#f97316',r:'#ef4444',b:'#38bdf8',n:'#2563eb',p:'#a855f7',m:'#ec4899',v:'#7c3aed',l:'#84cc16',d:'#166534',c:'#22d3ee',s:'#64748b',e:'#fde68a',t:'#92400e'};
K.CHARACTER_ART={
modulyn:svg([
'......kk......','.....kggk.....','....kgbbgk....','....kgwwgk....','...kkgyygkk...','..kgggssggk..','..kgbgbgbgk..','..kgggygggk..','...kgggggk...','....kgygk....','...kk...kk...','..kk.....kk..','..k.......k..','..............'],P),
pushwyrm:svg([
'........kk....','......kkbbk...','....kkbbbbk...','..kkbbbbbbk...','.kbbkkbbkk....','.kbbk.kbbk....','..kk..kbbk....','.....kbbk.....','....kbbk......','...kbbk.......','..kbbk........','.kbbk.........','.kbbkk........','..kk..........'],P),
sleepvine:svg([
'......kk......','.....kllk.....','....kllllk....','...kllwwllk...','...kllllllk...','....kllllk....','.....kddk.....','.....kddk.....','....kddddk....','...kddllddk...','..kddk..kddk..','..kk....kk....','....kk..kk....','..............'],P),
gaiarmor:svg([
'.....kkkk.....','....kssssk....','...kssggssk...','..ksskkkkssk..','..kskwwwwksk..','..kskssssksk..','.ksskssssksk.','.ksssssssssk.','.ksskskkssk..','..kkstttskk...','...kttttk....','...kt..tk....','..kk....kk...','.............'],P),
phasecat:svg([
'....kk..kk....','...kppkkppk...','..kppppppppk..','..kpwppppwpk..','..kpppkkpppk..','...kpmppmpk...','....kppppk....','...kkppppkk...','..kp.kppk.pk..','..k..kppk..k..','.....kppk.....','.....k..k.....','....kk..kk....','..............'],P),
luminelle:svg([
'......y.......','...y..y..y....','....kyyk.....','...kywwyk....','..kywwwwyk...','...kywwyk....','....kyyk.....','..y..kk..y...','.....kk......','....kbbk.....','...kbbbbk....','....kkkk.....','.............','.............'],P),
voidray:svg([
'..............','.....kppk.....','....kppppk....','...kppkkppk...','..kppkwwkppk..','.kpppkkkkpppk.','kpppkkkkkkpppk','..kkppppppkk..','....kppppk....','.....kkkk.....','......kk......','..............','..............','..............'],P),
thornogre:svg([
'..k......k....','..kk....kk....','...krrrrk.....','..krrwwrrk....','.krrrrrrrrk...','.krrkkkkrrk...','krrrrrrrrrrk..','krrrkrrkrrrk..','..kkrrrrkk....','...kttttk.....','..kttkkttk....','..kk....kk....','..............','..............'],P),
mirrormoth:svg([
'..kk......kk..','.kcck....kcck.','kcccck..kcccck','kccwwkkkkwwcck','.kccccppcccck.','..kkcppppckk..','....kppppk....','...kppkkppk...','..kkpkkkkpkk..','.kcck....kcck.','kcck......kcck','kk..........kk','..............','..............'],P),
blastboar:svg([
'..............','....kkk.......','...krrrk..kk..','..krrrrkkrrk..','.krrwwrrrrrk..','.krrrrrrrrrk..','krrrrkkkkrrrk.','krrrkttrkrrrk.','.kkkttttkkk...','...ktootk.....','..kkk..kkk....','..............','..............','..............'],P),
stormrook:svg([
'......kk......','.....kbbk.....','....kbbbbk....','..kkbbwwbbkk..','.kbbbbbbbbbbk.','kbbbkbbbbkbbbk','.kk..kbbk..kk.','.....kbbk.....','....kbnnbk....','...kbnkkbk....','..kkk....kkk..','..............','..............','..............'],P)
};
K.CHARACTER_SPRITE=null;
K.CHARACTER_SPRITE_POS=null;
})(window.KOMA);

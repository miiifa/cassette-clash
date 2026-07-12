window.KOMA=window.KOMA||{};
(function(K){
function pix(rows,pal){
  const h=rows.length,w=Math.max(...rows.map(r=>r.length)),u=8;
  let body='<rect width="100%" height="100%" fill="none"/>';
  for(let y=0;y<h;y++)for(let x=0;x<rows[y].length;x++){const c=rows[y][x];if(c!=='.'&&pal[c])body+='<rect x="'+(x*u)+'" y="'+(y*u)+'" width="'+u+'" height="'+u+'" fill="'+pal[c]+'"/>';}
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(w*u)+' '+(h*u)+'" shape-rendering="crispEdges">'+body+'</svg>');
}
const P={K:'#0b1020',W:'#f8fafc',G:'#94a3b8',S:'#475569',Y:'#facc15',E:'#fde68a',O:'#f97316',R:'#ef4444',D:'#991b1b',B:'#38bdf8',N:'#2563eb',P:'#a855f7',V:'#6d28d9',M:'#ec4899',L:'#84cc16',Q:'#16a34a',T:'#92400e',C:'#22d3ee'};
K.CHARACTER_ART={
modulyn:pix([
'......KKKK......','.....KSGGSK.....','....KSBCCBSK....','....KBCWWCBK....','...KKSBYYBSKK...','..KSSGGSSGGSSK..','..KSBGBKKBGBSK..','..KSGGGYYGGGSK..','...KSSGGGGSSK...','....KKGYYGKK....','.....KYKKYK.....','....KKK..KKK....','...KK......KK...','..KK........KK..','................','................'],P),
pushwyrm:pix([
'............KK..','.........KKKBBK.','.......KKBBBBBK.','....KKKBBBBCCBK.','..KKBBBBKKBBKK..','.KBBBBBK.KBBK...','.KBBBK...KBBK...','..KKK...KBBK....','.......KBBBK....','......KBBBK.....','.....KBBBK......','....KBBBK.......','...KBBBK........','..KBBBKK........','.KBBKK..........','..KK............'],P),
sleepvine:pix([
'.......KKK......','.....KKLLLKK....','....KLLQQLLLK...','...KLLLWWLLLK...','...KLLLKKLLLK...','....KLLMMLLK....','.....KKLLKK.....','......KQQK......','.....KQDDQK.....','....KQDDDDQK....','...KQDQDDQDQK...','..KQDKKQQKKDQK..','..KK...QQ...KK..','.......QQ.......','......KKKK......','................'],P),
gaiarmor:pix([
'......KKKK......','....KKSSSSKK....','...KSSGGGGSSK...','..KSSKKGGKKSSK..','..KSKWWSSWWKSK..','.KSSKSSSSSSKSSK.','.KSSSSYYYYSSSSK.','.KSSSSSYYSSSSSK.','..KSSKSSSSKSSK..','...KKSTTTSKKK...','....KTTTTTTK....','...KKTTKKTTKK...','..KK........KK..','................','................','................'],P),
phasecat:pix([
'....KK....KK....','...KPPK..KPPK...','..KPPPPKKPPPPK..','..KPPVPPPPVPPK..','.KPPWPPKKPPWPPK.','.KPPPPKMMKPPPPK.','..KPPPPPPPPPPK..','...KKPPPPPPKK...','..KP.KPPPPK.PK..','.KP..KPPPPK..PK.','.....KPPPPK.....','.....KKPPKK.....','....KK....KK....','...KK......KK...','................','................'],P),
luminelle:pix([
'.......YY.......','...Y...YY...Y...','....Y.KYYK.Y....','.....KYWWYK.....','...KKYWWWWYKK...','..KYWWYKKYWWYK..','...KKYWWWWYKK...','.....KYWWYK.....','....Y.KYYK.Y....','...Y...KK...Y...','.......KK.......','......KBBK......','.....KBBBBK.....','......KKKK......','................','................'],P),
voidray:pix([
'................','.......KK.......','.....KKPPKK.....','....KPPVVPPK....','...KPPVKKVPPK...','..KPPVKWWKVPPK..','.KPPPVKKKKVPPPK.','KPPVVKKKKKKVVPPK','.KKPPVVVVVVPPKK.','...KKPPVVPPKK...','.....KPPPPK.....','......KKKK......','.......KK.......','................','................','................'],P),
thornogre:pix([
'..KK........KK..','..KQK......KQK..','...KRRKKKKRRK...','..KRRRWWWWRRRK..','.KRRRRKKKKRRRRK.','.KRRRKTDDTKRRRK.','KRRRRRRDDRRRRRRK','KRRRKKRRRRKKRRRK','.KKK.RRRRRR.KKK.','....KTTTTTTK....','...KTTKTTKTTK...','..KKK......KKK..','................','................','................','................'],P),
mirrormoth:pix([
'..KKK......KKK..','.KCCCK....KCCCK.','KCCCCCK..KCCCCCK','KCCWWCKKKKCWWCCK','.KCCCCPVVPCCCCK.','..KKCCPVVPCCKK..','....KPPVVPPK....','...KPPKMMKPPK...','..KKPKKKKKKPKK..','.KCCK......KCCK.','KCCK........KCCK','KKK..........KKK','................','................','................','................'],P),
blastboar:pix([
'................','....KKKK........','...KRRRRK..KK...','..KRRORRKKRRK...','.KRRWWRRRRRRK...','.KRRRRRKKRRRK...','KRRRRKTTKRRRRK..','KRRRRTTTTRRRRK..','.KKKTTOTTTKKK...','...KTOOOTK......','..KKK....KKK....','................','................','................','................','................'],P),
stormrook:pix([
'.......KK.......','......KNNK......','.....KNNNNK.....','...KKNWWNNKK....','..KNNNNNNNNNK...','.KNNNKNNNNKNNK..','KNNNK.KNNK.KNNK.','.KK...KNNK...KK.','......KNNK......','.....KNCNCK.....','....KNCKKCNK....','...KKK....KKK...','................','................','................','................'],P)
};
})(window.KOMA);

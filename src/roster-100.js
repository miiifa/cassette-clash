window.KOMA=window.KOMA||{};
(function(K){
const TYPES=['fire','water','leaf','electric','earth','wind','light','dark','metal','mystic'];
K.TYPE_NAMES={fire:'火',water:'水',leaf:'森',electric:'雷',earth:'地',wind:'風',light:'光',dark:'闇',metal:'機鋼',mystic:'幻'};
K.TYPE_SYMBOLS={fire:'🔥',water:'💧',leaf:'🌿',electric:'⚡',earth:'◆',wind:'🌀',light:'✦',dark:'☾',metal:'⚙',mystic:'✣'};
K.TYPE_COLORS={fire:'#ef4444',water:'#38bdf8',leaf:'#65a30d',electric:'#facc15',earth:'#a16207',wind:'#14b8a6',light:'#f8fafc',dark:'#7e22ce',metal:'#94a3b8',mystic:'#c084fc'};
K.TYPE_STRONG={fire:['leaf','metal'],water:['fire','earth'],leaf:['water','earth'],electric:['water','wind','metal'],earth:['electric','metal'],wind:['leaf','earth'],light:['dark','mystic'],dark:['light','mystic'],metal:['light','wind'],mystic:['metal','fire']};
const seed=[
  ['modulyn','モジュリン','metal','カセット信号を読み替える小型ユニット。カセット技の火力が伸びる。'],
  ['pushwyrm','オシナガ','water','直線方向に相手を押し流し、陣形を崩す流線獣。'],
  ['sleepvine','ネムリネ','leaf','眠りと毒で道を作る胞子ユニット。'],
  ['gaiarmor','ガイアーマ','earth','ゴール前に居座る重装ガーディアン。'],
  ['phasecat','フェイズキャット','mystic','位相をずらして敵の背後に回る猫型ユニット。'],
  ['luminelle','ルミネル','light','光でMPを削り、終盤のゴールを狙う。'],
  ['voidray','ヴォイドレイ','dark','虚空を泳ぐBOSSユニット。すりぬけ奇襲が得意。'],
  ['thornogre','トゲオーガ','leaf','棘と眠りで相手を縛るBOSSユニット。'],
  ['mirrormoth','ミラーモス','mystic','鏡鱗粉で位置を入れ替える幻惑型。'],
  ['blastboar','ブラストボア','fire','爆発的な突進でラインを壊す猪型BOSS。']
];
const names=['フレアキッド','アクアプル','リーフィン','ボルトマロ','ロックン','ゲイルーク','ソルナイト','シャドミン','ギアポッド','ミスティア','ヒノガル','ミズクラゲ','ハナピクシ','ライジロー','ドグモグ','カゼバネ','ルクシオン','ヤミローブ','メタロイド','ルーンボール','マグマドン','アイスレイ','ツリオン','スパークギア','ゴーレムリ','フェザーク','ホーリィン','ナイトメア','メカウルフ','パープルン','ブラウル','ジェルネ','カクタロン','ビリニャー','ドスロック','クラウディ','レオライト','ダークバグ','アイアンアイ','クリスタルム','エンリュウ','スノウラ','モスリーフ','サンダホーク','テラホーン','トルネコア','ゴルディア','ヴォイドン','シルバル','マジリス','ラヴァゴン','シャークル','スプラウト','エレワン','サンドワーム','ビークロン','パラディア','レイヴン','ベアメカ','アメジスト','ブレイズン','シードラ','マンイーター','ボルトロン','クレイポン','アクアリス','グリフォン','デモナイト','クローム','ウィスプル','フレイア','ペンギア','パンダリーフ','ライトアーマ','クリスタロ','フクロウィン','ハロギア','クロネロ','メカファング','オーブリン','オニボム','フロストル','キノコロン','ピカスピア','ドリルホーン','フェアリス','ホワイトガード','フードレイス','スチールン','ラベンデル','イグニオ','アクアキャット','リーフガード','サンダテイル','ストーンコア','ドラグーン','セイントラ','シャドドラ','メカナイト','コスモアイ'];
function pad(n){return String(n).padStart(3,'0');}
function makeWheel(type,i){
  const sym=K.TYPE_NAMES[type]||'';
  const dmg=40+(i%4)*10;
  const e1=i%5===0?{mpMinus:1}:i%5===1?{condition:'confuse'}:i%5===2?{wait:1}:i%5===3?{pushLine:true}:null;
  return[
    {c:'white',n:sym+'ストライク',d:dmg+20,s:30,e:e1},
    {c:'gold',n:sym+'スピア',d:dmg,s:18,e:null},
    {c:'purple',n:sym+'トリック',d:2,s:24,e:i%7===0?{swap:true}:i%7===1?{condition:'sleep'}:i%7===2?{mpMinus:1}:{wait:1}},
    {c:'blue',n:'ガード',d:0,s:16,e:i%6===0?{selfWait:1}:null},
    {c:'miss',n:'ミス',d:0,s:12,e:null}
  ];
}
function ensureFigure(key,no,name,type,desc){
  const f=K.FIGURES[key]||{};
  if(!f.n)f.n=name;
  if(!f.mp)f.mp=1+(no%3);
  if(!f.r)f.r=no%10===0?'SR':no%5===0?'R':'N';
  if(!f.w)f.w=makeWheel(type,no);
  f.no=no;f.type=type;f.types=[type];f.desc=desc;f.icon=K.TYPE_SYMBOLS[type];f.iconColor=K.TYPE_COLORS[type];
  if(no%13===0)f.ability={name:'すりぬけ',text:'このユニット自身は他のユニットを通過して移動できます。',passThrough:true};
  if(no%17===0)f.ability={name:'跳躍',text:'隣のユニットを1体だけ飛び越えられます。',jump:true};
  K.FIGURES[key]=f;
  return key;
}
K.ROSTER100=[];
for(let i=1;i<=100;i++){
  const fixed=seed[i-1];
  const type=fixed?fixed[2]:TYPES[(i-1)%TYPES.length];
  const key=fixed?fixed[0]:'unit'+pad(i);
  const name=fixed?fixed[1]:names[i-1];
  const desc=fixed?fixed[3]:(K.TYPE_NAMES[type]+'タイプのオリジナルユニット。相性有利の相手には白/金技が+20される。');
  ensureFigure(key,i,name,type,desc);
  K.ROSTER100.push(key);
}
K.typeOfFigure=function(fig){const f=K.FIGURES[fig];return f&&(f.type||(f.types&&f.types[0]))||'mystic';};
K.typeLabel=function(fig){const t=K.typeOfFigure(fig);return(K.TYPE_SYMBOLS[t]||'●')+' '+(K.TYPE_NAMES[t]||t);};
K.iconFor=function(p){const f=K.FIGURES[p.fig];return f&&f.icon?f.icon:'●';};
K.typeAdvantage=function(attacker,defender){
  if(!attacker||!defender)return 0;
  const at=K.typeOfFigure(attacker.fig),dt=K.typeOfFigure(defender.fig);
  return(K.TYPE_STRONG[at]||[]).includes(dt)?20:0;
};
})(window.KOMA);

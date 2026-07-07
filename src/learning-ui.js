window.KOMA=window.KOMA||{};
(function(K){
const WEIGHT_KEY='koma_ai_learned_weights_v1';
const MEMORY_KEY='koma_ai_play_memory_v1';
function readJson(key, fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch(e){return fallback;}}
function payload(){return{version:1,createdAt:new Date().toISOString(),weights:readJson(WEIGHT_KEY,K.DEFAULT_AI_WEIGHTS||{}),memory:readJson(MEMORY_KEY,{n:0,f:{}})}}
function savePayload(p){if(!p||typeof p!=='object')throw new Error('形式が違います');if(p.weights)localStorage.setItem(WEIGHT_KEY,JSON.stringify(p.weights));if(p.memory)localStorage.setItem(MEMORY_KEY,JSON.stringify(p.memory));}
function statsText(){const p=payload(),changed=K.aiWeightSummary?K.aiWeightSummary().changed:0,n=(p.memory&&p.memory.n)||0,g=(K.aiTraining&&K.aiTraining.games)||0;return '学習: 重み変更 '+changed+' / 手筋記憶 '+n+' / 対局反映 '+g;}
function ensureBox(){let box=document.querySelector('#learnBox');if(box)return box;box=document.createElement('div');box.id='learnBox';box.className='learnBox';box.innerHTML='<div id="learnStats" class="learnStats"></div><div class="learnBtns"><button id="nextMatchBtn" class="miniLearn">次の試合</button><button id="copyLearnBtn" class="miniLearn">学習コピー</button><button id="pasteLearnBtn" class="miniLearn">学習貼付</button></div><textarea id="learnText" class="learnText" placeholder="学習データJSONがここに出ます。貼り付けインポートにも使えます。"></textarea>';
const field=document.querySelector('.field');if(field)field.appendChild(box);return box;}
function refresh(){ensureBox();const st=document.querySelector('#learnStats');if(st)st.textContent=statsText();const next=document.querySelector('#nextMatchBtn');if(next)next.style.display=(K.s&&K.s.win)?'inline-block':'none';}
function exportData(){const text=JSON.stringify(payload(),null,2),area=document.querySelector('#learnText');if(area){area.style.display='block';area.value=text;area.focus();area.select();}
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(()=>K.log('学習データをコピーしました。このJSONをチャットに貼ればGitHub側へ反映できます。')).catch(()=>K.log('コピーできない場合は、表示されたJSONを手動でコピーしてください。'));}else{K.log('表示されたJSONを手動でコピーしてください。');}
K.render&&K.render();}
function importData(){const area=document.querySelector('#learnText');let text=(area&&area.value||'').trim();if(!text)text=prompt('学習データJSONを貼り付けてください')||'';try{savePayload(JSON.parse(text));K.log('学習データを取り込みました。次の試合から反映されます。');if(area)area.value='';K.render&&K.render();}catch(e){K.log('学習データの読み込みに失敗しました: '+e.message);K.render&&K.render();}}
const oldRender=K.render;
K.render=function(){oldRender&&oldRender();refresh();};
const oldBind=K.bindUi;
K.bindUi=function(){oldBind&&oldBind();ensureBox();const c=document.querySelector('#copyLearnBtn'),p=document.querySelector('#pasteLearnBtn'),n=document.querySelector('#nextMatchBtn');if(c)c.onclick=exportData;if(p)p.onclick=importData;if(n)n.onclick=function(){K.start();};refresh();};
})(window.KOMA);

window.KOMA=window.KOMA||{};
(function(K){
function ensureBox(){let box=document.querySelector('#learnBox');if(box)return box;box=document.createElement('div');box.id='learnBox';box.className='learnBox';box.innerHTML='<button id="nextMatchBtn" class="miniLearn nextOnly">次の試合</button>';const field=document.querySelector('.field');if(field)field.appendChild(box);return box;}
function refresh(){ensureBox();const next=document.querySelector('#nextMatchBtn');if(next)next.style.display=(K.s&&K.s.win)?'block':'none';}
const oldRender=K.render;
K.render=function(){oldRender&&oldRender();refresh();};
const oldBind=K.bindUi;
K.bindUi=function(){oldBind&&oldBind();ensureBox();const n=document.querySelector('#nextMatchBtn');if(n)n.onclick=function(){K.start();};refresh();};
})(window.KOMA);

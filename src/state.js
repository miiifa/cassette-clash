window.KOMA=window.KOMA||{};
(function(K){
let seq=1;
K.s=null;
K.other=p=>p==='p1'?'p2':'p1';
K.neigh=id=>K.EDGES.filter(e=>e[0]===id||e[1]===id).map(e=>e[0]===id?e[1]:e[0]);
K.freshStatus=()=>({condition:null,mpMinus:0});
K.makePiece=function(fig,owner){const f=K.FIGURES[fig];return{id:owner+'-'+seq++,owner,fig,n:f.n,mp:f.mp,pos:null,wait:0,status:K.freshStatus(),focusGuard:false,level:1,tuning:{}}};
K.makePlayer=function(id){return{bench:K.DECKS[id].map(x=>K.makePiece(x,id)),field:[],pc:[]};};
K.initState=function(){seq=1;K.s={p1:K.makePlayer('p1'),p2:K.makePlayer('p2'),turn:'p1',phase:'idle',selectedId:null,selectedType:null,targets:[],attacks:[],pendingAttacker:null,pendingBattle:null,locked:false,win:null,turnCount:1,ai:true,fx:null,lastMoved:null,fxTimer:null,log:['分割・安定版で開始。']};};
K.all=function(){const s=K.s;return[...s.p1.field,...s.p2.field];};
K.at=function(node){return K.all().find(p=>p.pos===node)||null;};
K.byId=function(id){const s=K.s;if(!id)return null;return[...s.p1.bench,...s.p2.bench,...s.p1.field,...s.p2.field,...s.p1.pc,...s.p2.pc].find(p=>p.id===id)||null;};
K.log=function(msg){K.s.log.unshift(msg);};
K.clearSelection=function(){const s=K.s;s.phase='idle';s.selectedId=null;s.selectedType=null;s.targets=[];s.attacks=[];s.pendingAttacker=null;};
K.setFx=function(p,from,to){const s=K.s;s.lastMoved=p.id;if(from&&to)s.fx={from,to};clearTimeout(s.fxTimer);s.fxTimer=setTimeout(()=>{if(!K.s)return;K.s.fx=null;K.s.lastMoved=null;K.render&&K.render();},850);};
})(window.KOMA);

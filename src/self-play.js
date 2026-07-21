window.KOMA=window.KOMA||{};
(function(K){
'use strict';
if(K._selfPlayLeaguePatched)return;
K._selfPlayLeaguePatched=true;

const ENGINE_VERSION='20260722-selfplay-1';
const DEFAULT_WEIGHTS={
  goalNow:1000000,
  allowImmediateGoal:1250000,
  blockGoal:180000,
  targetHold:145000,
  progress:115,
  mobility:18,
  opponentMobility:20,
  fieldValue:340,
  pcValue:1250,
  statusValue:1,
  surroundRisk:980,
  battleExpected:1,
  replyWeight:.68,
  downsideWeight:.72,
  upsideWeight:.08,
  battleThreshold:-30,
  threatBattleBonus:90000,
  leadRisk:1.05,
  balancedRisk:.72,
  chaseRisk:.38
};
const MUTABLE_KEYS=[
  'blockGoal','targetHold','progress','mobility','opponentMobility','fieldValue',
  'pcValue','surroundRisk','battleExpected','replyWeight','downsideWeight',
  'upsideWeight','battleThreshold','threatBattleBonus','leadRisk',
  'balancedRisk','chaseRisk'
];

function arr(x){return Array.isArray(x)?x:[];}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function round(x){return Math.round(Number(x)||0);}
function other(o){return o==='p1'?'p2':'p1';}
function nowIso(){return new Date().toISOString();}
function cloneStatus(s){return{condition:s&&s.condition||null,mpMinus:s&&s.mpMinus||0};}
function copyWeights(w){return Object.assign({},DEFAULT_WEIGHTS,w||{});}
function mulberry32(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hashSeed(a,b,c){let x=(a|0)^Math.imul((b|0)+1,0x9e3779b1)^Math.imul((c|0)+7,0x85ebca6b);x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;return x>>>0;}
function sample(rng,xs){return xs[Math.floor(rng()*xs.length)];}
function mini(p){return p?{id:p.id,owner:p.owner,fig:p.fig,name:p.n,pos:p.pos||null,mp:p.mp,wait:p.wait||0,condition:p.status&&p.status.condition||null,mpMinus:p.status&&p.status.mpMinus||0,boss:!!p.boss}:null;}

function makePiece(fig,owner,index){
  const f=K.FIGURES[fig];
  const p={id:owner+'-'+index,owner,fig,n:f.n,mp:f.mp,pos:null,wait:0,status:{condition:null,mpMinus:0},focusGuard:false,level:1,tuning:{},boss:false};
  if(owner==='p2'){
    p.boss=true;p.level=5;p.mp=Math.min(4,p.mp+1);
    const wheel=f.w||[];
    for(let i=0;i<wheel.length;i++){
      const seg=wheel[i];
      p.tuning[i]=(seg.c==='miss'?-10:seg.c==='blue'?4:seg.c==='purple'?8:6);
    }
  }
  return p;
}
function makeState(){
  const decks={p1:arr(K.DECKS&&K.DECKS.p1).slice(0,6),p2:arr(K.DECKS&&K.DECKS.p2).slice(0,6)};
  return{
    p1:{bench:decks.p1.map((f,i)=>makePiece(f,'p1',i+1)),field:[],pc:[]},
    p2:{bench:decks.p2.map((f,i)=>makePiece(f,'p2',i+1)),field:[],pc:[]},
    turn:'p1',turnCount:1,win:null,reason:null
  };
}
function clonePiece(p){return{id:p.id,owner:p.owner,fig:p.fig,n:p.n,mp:p.mp,pos:p.pos,wait:p.wait,status:cloneStatus(p.status),focusGuard:!!p.focusGuard,level:p.level,tuning:Object.assign({},p.tuning),boss:!!p.boss};}
function cloneState(s){
  return{
    p1:{bench:s.p1.bench.map(clonePiece),field:s.p1.field.map(clonePiece),pc:s.p1.pc.map(clonePiece)},
    p2:{bench:s.p2.bench.map(clonePiece),field:s.p2.field.map(clonePiece),pc:s.p2.pc.map(clonePiece)},
    turn:s.turn,turnCount:s.turnCount,win:s.win,reason:s.reason
  };
}
function all(s){return s.p1.field.concat(s.p2.field);}
function at(s,node){return all(s).find(p=>p.pos===node)||null;}
function byId(s,id){return s.p1.bench.concat(s.p2.bench,s.p1.field,s.p2.field,s.p1.pc,s.p2.pc).find(p=>p.id===id)||null;}
function neigh(node){return K.EDGES.filter(e=>e[0]===node||e[1]===node).map(e=>e[0]===node?e[1]:e[0]);}
function ability(p,key){const a=K.FIGURES[p.fig]&&K.FIGURES[p.fig].ability;return!!(a&&a[key]);}
function canAct(p){return p.wait<=0&&p.status.condition!=='sleep'&&p.status.condition!=='frozen';}
function effectiveMp(s,p,owner=p.owner){if(!canAct(p))return 0;return Math.max(0,p.mp-(p.status.mpMinus||0)-(s.turnCount===1&&owner==='p1'?1:0));}
function isPassThrough(p){return p.status.condition==='sleep'||p.status.condition==='frozen';}
function blockedFor(s,self){if(ability(self,'passThrough'))return new Set();return new Set(all(s).filter(p=>p.id!==self.id&&!isPassThrough(p)).map(p=>p.pos));}
function reachable(s,start,mp,blocked,self){
  const vis=new Map([[start,0]]),q=[start];
  while(q.length){
    const c=q.shift(),d=vis.get(c);
    if(d>=mp)continue;
    for(const n of neigh(c)){
      if(!blocked.has(n)&&!vis.has(n)){vis.set(n,d+1);q.push(n);}
      if(self&&ability(self,'jump')&&d+2<=mp&&at(s,n)){
        for(const land of neigh(n)){
          if(land===c||blocked.has(land)||at(s,land)||vis.has(land))continue;
          vis.set(land,d+2);q.push(land);
        }
      }
    }
  }
  vis.delete(start);return Array.from(vis.keys());
}
function moveTargets(s,p,owner=p.owner){
  const stops=new Set(all(s).map(x=>x.pos));stops.delete(p.pos);
  return reachable(s,p.pos,effectiveMp(s,p,owner),blockedFor(s,p),p).filter(n=>!stops.has(n));
}
function entryTargets(s,p,owner){
  const total=Math.max(0,p.mp-(s.turnCount===1&&owner==='p1'?1:0));
  if(total<=0||p.wait>0)return[];
  const out=new Set(),stops=new Set(all(s).map(x=>x.pos));
  const blocked=ability(p,'passThrough')?new Set():new Set(all(s).filter(x=>!isPassThrough(x)).map(x=>x.pos));
  for(const sp of K.SPAWN[owner]){
    if(at(s,sp))continue;
    out.add(sp);
    for(const n of reachable(s,sp,total-1,blocked,p))if(!stops.has(n))out.add(n);
  }
  return Array.from(out);
}
function adjacentEnemies(s,p){return all(s).filter(o=>o.owner!==p.owner&&p.pos&&neigh(p.pos).includes(o.pos));}
function battleableEnemies(s,p){return adjacentEnemies(s,p).filter(e=>e.status.condition!=='sleep'&&e.status.condition!=='frozen');}
function canWake(s,p){return(p.status.condition==='sleep'||p.status.condition==='frozen')&&s[p.owner].field.some(a=>a.id!==p.id&&canAct(a)&&neigh(a.pos).includes(p.pos));}
function dist(a,b){
  if(!a||!b)return 99;if(a===b)return 0;
  const seen=new Map([[a,0]]),q=[a];
  while(q.length){const c=q.shift(),d=seen.get(c);for(const n of neigh(c)){if(seen.has(n))continue;if(n===b)return d+1;seen.set(n,d+1);q.push(n);}}
  return 99;
}
function immediateGoals(s,owner){
  if(at(s,K.TARGET[owner]))return[];
  const out=[];
  for(const p of s[owner].field)if(canAct(p)&&moveTargets(s,p,owner).includes(K.TARGET[owner]))out.push({type:'move',pid:p.id,to:K.TARGET[owner]});
  for(const p of s[owner].bench)if(entryTargets(s,p,owner).includes(K.TARGET[owner]))out.push({type:'deploy',pid:p.id,to:K.TARGET[owner]});
  return out;
}
function legalPlans(s,owner){
  const out=[];
  for(const p of s[owner].field){
    if(canWake(s,p))out.push({type:'wake',pid:p.id});
    if(!canAct(p))continue;
    for(const d of battleableEnemies(s,p))out.push({type:'battle',pid:p.id,did:d.id});
    for(const n of moveTargets(s,p,owner))out.push({type:'move',pid:p.id,to:n});
  }
  for(const p of s[owner].bench)for(const n of entryTargets(s,p,owner))out.push({type:'deploy',pid:p.id,to:n});
  return out;
}
function hasLegal(s,owner){return legalPlans(s,owner).length>0;}

function normalizedWheel(p){
  const f=K.FIGURES[p.fig],src=(f&&f.w||[]).map(x=>({c:x.c,n:x.n,d:x.d,s:x.s,e:x.e?Object.assign({},x.e):null,boost:x.boost||1}));
  let total=0;
  for(let i=0;i<src.length;i++){src[i].s=Math.max(1,(src[i].s||0)+(p.tuning&&p.tuning[i]||0));total+=src[i].s;}
  if(src.length)src[src.length-1].s=Math.max(1,src[src.length-1].s+(100-total));
  if(p.status.condition==='paralyze'){
    const valid=src.filter(x=>x.c!=='miss');const min=valid.length?Math.min.apply(null,valid.map(x=>x.s)):0;
    for(const seg of src)if(seg.c!=='miss'&&seg.s===min){seg.c='miss';seg.n='ミス';seg.d=0;seg.e=null;}
  }
  if(p.status.condition==='frozen')for(const seg of src){seg.c='miss';seg.n='ミス';seg.d=0;seg.e=null;}
  return src;
}
function baseValue(seg,p){
  let v=(seg.d||0)*(seg.boost||1);
  const c=p.status.condition;
  if(seg.c==='white'||seg.c==='gold'){
    if(c==='poison')v=Math.max(0,v-20);
    if(c==='toxic')v=Math.max(0,v-40);
    if(c==='burn')v=Math.max(0,v-10);
    if(p.owner==='p2'){
      if(p.boss)v+=30;
      if(['voidray','thornogre','mirrormoth','blastboar','stormrook'].includes(p.fig))v+=10;
    }
  }
  return v;
}
function compare(a,b,ap,bp){
  const A=a.c,B=b.c,av=baseValue(a,ap),bv=baseValue(b,bp);
  if(A==='blue'||B==='blue')return{winner:'draw',ko:false,blue:true,mode:A==='blue'&&B==='blue'?'blue-both':'blue-null'};
  if(A==='miss'&&B==='miss')return{winner:'draw',ko:false,mode:'null'};
  if(A==='miss')return{winner:'def',ko:(B==='white'||B==='gold')&&bv>0,mode:'oneway'};
  if(B==='miss')return{winner:'atk',ko:(A==='white'||A==='gold')&&av>0,mode:'oneway'};
  if(A==='gold'&&B==='purple')return{winner:'atk',ko:av>0,mode:'oneway'};
  if(B==='gold'&&A==='purple')return{winner:'def',ko:bv>0,mode:'oneway'};
  if(A==='purple'||B==='purple'){
    if(A==='purple'&&B==='purple'){if(av===bv)return{winner:'draw',ko:false,mode:'null'};return{winner:av>bv?'atk':'def',ko:false,mode:'oneway'};}
    return{winner:A==='purple'?'atk':'def',ko:false,mode:'oneway'};
  }
  if(av===bv)return{winner:'draw',ko:false,mode:'damage-draw'};
  const winner=av>bv?'atk':'def';
  return{winner,ko:baseValue(winner==='atk'?a:b,winner==='atk'?ap:bp)>0,mode:'damage'};
}
function unitValue(p){
  if(!p)return 0;let v=p.boss?1450:820;v+=(p.mp||0)*105;
  if(p.pos){v+=Math.max(0,7-dist(p.pos,K.TARGET[p.owner]))*95;if(p.pos===K.TARGET[other(p.owner)])v+=900;}
  const c=p.status&&p.status.condition;
  if(c==='sleep'||c==='frozen')v-=380;if(c==='paralyze')v-=230;if(c==='confuse')v-=160;if(c==='toxic')v-=250;if(c==='poison'||c==='burn')v-=125;
  v-=145*(p.status&&p.status.mpMinus||0);v-=190*(p.wait||0);return Math.max(180,v);
}
function effectValue(e,user,target){
  if(!e)return 0;let v=0;
  if(e.condition==='sleep'||e.condition==='frozen')v+=430;
  if(e.condition==='paralyze')v+=290;if(e.condition==='confuse')v+=210;if(e.condition==='toxic')v+=260;if(e.condition==='poison'||e.condition==='burn')v+=135;
  if(e.wait)v+=220*e.wait;if(e.mpMinus)v+=145*e.mpMinus;if(e.bench&&target)v+=unitValue(target)*.72;if(e.pushLine)v+=150;if(e.swap)v+=110;
  if(e.selfWait)v-=150*e.selfWait;if(e.selfko)v-=user?unitValue(user):700;if(e.selfBench||e.fly)v-=user?unitValue(user)*.35:260;
  return v;
}
function outcomeUtility(a,d,A,D,o){
  let u=0;
  if(o.blue){if(A.c==='blue')u+=effectValue(A.e,a,null);if(D.c==='blue')u-=effectValue(D.e,d,null);return u;}
  if(o.winner==='atk'){u+=65;if(o.ko)u+=unitValue(d);u+=effectValue(A.e,a,d);return u;}
  if(o.winner==='def'){u-=65;if(o.ko)u-=unitValue(a);u-=effectValue(D.e,d,a);return u;}
  if(o.mode==='damage-draw'){u+=effectValue(A.e,a,d)-effectValue(D.e,d,a);}
  return u;
}
function tailMean(outcomes,q){
  const xs=outcomes.slice().sort((a,b)=>a.u-b.u);let need=q,take=0,sum=0;
  for(const x of xs){if(need<=0)break;const z=Math.min(need,x.p);sum+=z*x.u;take+=z;need-=z;}
  return take?sum/take:0;
}
function battleProfile(a,d){
  const aw=normalizedWheel(a),dw=normalizedWheel(d),atot=aw.reduce((s,x)=>s+x.s,0)||1,dtot=dw.reduce((s,x)=>s+x.s,0)||1,outs=[];
  let mean=0,m2=0,win=0,lose=0,draw=0,koFor=0,koAgainst=0,bigReturn=0,catastrophe=0,best=-Infinity,worst=Infinity;
  for(const A of aw)for(const D of dw){
    const p=A.s/atot*D.s/dtot,o=compare(A,D,a,d),u=outcomeUtility(a,d,A,D,o);outs.push({p,u});mean+=p*u;m2+=p*u*u;best=Math.max(best,u);worst=Math.min(worst,u);
    if(o.blue||o.winner==='draw')draw+=p;else if(o.winner==='atk'){win+=p;if(o.ko)koFor+=p;}else{lose+=p;if(o.ko)koAgainst+=p;}
    if(u>=250)bigReturn+=p;if(u<=-Math.max(300,unitValue(a)*.35))catastrophe+=p;
  }
  return{win,lose,draw,koFor,koAgainst,bigReturn,catastrophe,expected:mean,stdev:Math.sqrt(Math.max(0,m2-mean*mean)),cvar25:tailMean(outs,.25),best:best===-Infinity?0:best,worst:worst===Infinity?0:worst};
}

function surroundRisk(s,p,node=p&&p.pos){
  if(!p||!node)return 0;const ns=neigh(node),enemy=other(p.owner);if(!ns.length)return 0;let en=0,empty=0;
  for(const n of ns){const o=at(s,n);if(o&&o.owner===enemy)en++;else if(!o)empty++;}
  if(en===ns.length)return 1;if(en>=2&&empty<=1)return .78;if(en>=2)return .42;if(en>=1&&empty===0)return .28;return 0;
}
function mobility(s,owner){let n=0;for(const p of s[owner].field){if(canAct(p))n+=moveTargets(s,p,owner).length+battleableEnemies(s,p).length;if(canWake(s,p))n++;}for(const p of s[owner].bench)n+=entryTargets(s,p,owner).length;return n;}
function boardScore(s,owner,w){
  const enemy=other(owner);let v=(s[enemy].pc.length-s[owner].pc.length)*w.pcValue+(s[owner].field.length-s[enemy].field.length)*w.fieldValue;
  for(const p of s[owner].field){let u=unitValue(p);u-=surroundRisk(s,p)*w.surroundRisk;v+=u+Math.max(0,7-dist(p.pos,K.TARGET[owner]))*w.progress;}
  for(const p of s[enemy].field){let u=unitValue(p);u-=surroundRisk(s,p)*w.surroundRisk;v-=u+Math.max(0,7-dist(p.pos,K.TARGET[enemy]))*w.progress;}
  const og=immediateGoals(s,owner).length,eg=immediateGoals(s,enemy).length;
  if(og)v+=260000+og*15000;if(eg)v-=330000+eg*25000;
  const h=at(s,K.TARGET[enemy]);if(h&&h.owner===owner)v+=w.targetHold;
  const b=at(s,K.TARGET[owner]);if(b&&b.owner===enemy)v-=w.blockGoal;
  v+=(mobility(s,owner)*w.mobility-mobility(s,enemy)*w.opponentMobility);
  return v;
}
function metrics(s,owner,w){const enemy=other(owner);return{score:boardScore(s,owner,w),ownGoals:immediateGoals(s,owner).length,enemyGoals:immediateGoals(s,enemy).length,ownMobility:mobility(s,owner),enemyMobility:mobility(s,enemy),ownField:s[owner].field.length,enemyField:s[enemy].field.length,ownPc:s[owner].pc.length,enemyPc:s[enemy].pc.length};}
function planKey(p){return[p.type,p.pid||'',p.to||'',p.did||''].join('|');}

function removeField(s,p){s[p.owner].field=s[p.owner].field.filter(x=>x.id!==p.id);p.pos=null;}
function resetPiece(p){p.status={condition:null,mpMinus:0};p.focusGuard=false;}
function addWait(s,p,n){p.wait=Math.max(p.wait,p.owner===s.turn?n+1:n);}
function sendBench(s,p){removeField(s,p);resetPiece(p);p.wait=Math.max(p.wait,1);s[p.owner].bench.push(p);}
function pc(s,p){
  removeField(s,p);resetPiece(p);const pl=s[p.owner];
  if(pl.pc.length>=2){const out=pl.pc.shift();resetPiece(out);out.wait=Math.max(out.wait,1);pl.bench.push(out);}
  pl.pc.push(p);
}
function resolveSurrounds(s){
  let changed=true;
  while(changed){changed=false;for(const p of all(s).slice()){const ns=neigh(p.pos);if(ns.length&&ns.every(n=>{const o=at(s,n);return o&&o.owner!==p.owner;})){pc(s,p);changed=true;break;}}}
}
function unitSign(v){return Math.abs(v)<.001?0:(v>0?1:-1);}
function direction(a,b){if(!K.NODES[a]||!K.NODES[b])return null;return[unitSign(K.NODES[b][0]-K.NODES[a][0]),unitSign(K.NODES[b][1]-K.NODES[a][1])];}
function nextStraight(prev,cur,dir){
  let best=null,bestLen=Infinity;const c=K.NODES[cur];
  for(const n of neigh(cur)){if(n===prev)continue;const nd=direction(cur,n);if(!nd||nd[0]!==dir[0]||nd[1]!==dir[1])continue;const z=K.NODES[n],len=(z[0]-c[0])**2+(z[1]-c[1])**2;if(len<bestLen){best=n;bestLen=len;}}
  return best;
}
function pushLine(s,user,target){
  if(!user.pos||!target.pos)return;const dir=direction(user.pos,target.pos);if(!dir||(dir[0]===0&&dir[1]===0))return;
  const chain=[target.pos];let prev=user.pos,cur=target.pos;
  for(let i=0;i<8;i++){const nx=nextStraight(prev,cur,dir);if(!nx||chain.includes(nx))break;chain.push(nx);prev=cur;cur=nx;}
  const occ=chain.map(n=>at(s,n)).filter(Boolean);if(!occ.length)return;
  const dest=chain.slice(Math.max(0,chain.length-occ.length));for(let i=0;i<occ.length;i++)occ[i].pos=dest[i];
}
function applyEffect(s,seg,user,target){
  const e=seg&&seg.e;if(!e)return;
  if(e.selfWait)addWait(s,user,e.selfWait);
  if(e.pushLine&&target){if(e.wait)addWait(s,target,e.wait);if(e.condition)target.status.condition=e.condition;pushLine(s,user,target);return;}
  if(e.fly||e.selfBench){sendBench(s,user);return;}
  if(e.condition&&target)target.status.condition=e.condition;
  if(e.wait&&target)addWait(s,target,e.wait);
  if(e.mpMinus&&target)target.status.mpMinus=Math.max(target.status.mpMinus,e.mpMinus);
  if(e.swap&&target&&user.pos&&target.pos){const a=user.pos;user.pos=target.pos;target.pos=a;}
  if(e.bench&&target&&s[target.owner].field.some(x=>x.id===target.id))sendBench(s,target);
  if(e.selfko&&target){if(s[user.owner].field.some(x=>x.id===user.id))pc(s,user);if(s[target.owner].field.some(x=>x.id===target.id))pc(s,target);}
}
function spin(p,rng){
  const w=normalizedWheel(p),total=w.reduce((s,x)=>s+x.s,0)||1;let r=rng()*total,chosen=w[w.length-1],idx=w.length-1;
  for(let i=0;i<w.length;i++){r-=w[i].s;if(r<=0){chosen=Object.assign({},w[i],{e:w[i].e?Object.assign({},w[i].e):null});idx=i;break;}}
  if(p.status.condition==='confuse'&&w.length>1){idx=(idx+1)%w.length;chosen=Object.assign({},w[idx],{e:w[idx].e?Object.assign({},w[idx].e):null});}
  return chosen;
}
function resolveSpin(p,rng){
  let seg=spin(p,rng);
  if(seg.e&&seg.e.focus){p.focusGuard=true;const next=spin(p,rng);if(next.c==='white'||next.c==='gold')next.boost=seg.e.boost||2;else next.noKo=true;seg=next;}
  return seg;
}
function resolveBattle(s,a,d,rng){
  const A=resolveSpin(a,rng),D=resolveSpin(d,rng),out=compare(A,D,a,d),expected=battleProfile(a,d),actual=outcomeUtility(a,d,A,D,out);
  function finish(){a.focusGuard=false;d.focusGuard=false;resolveSurrounds(s);}
  if(out.blue){if(out.mode!=='blue-both'){const bp=A.c==='blue'?a:d,bs=A.c==='blue'?A:D;applyEffect(s,bs,bp,null);}finish();return{out,A,D,expected,actual};}
  if(out.winner==='draw'){if(out.mode==='damage-draw'){applyEffect(s,A,a,d);applyEffect(s,D,d,a);}finish();return{out,A,D,expected,actual};}
  const atkWin=out.winner==='atk',winP=atkWin?a:d,loseP=atkWin?d:a,winSeg=atkWin?A:D,loseSeg=atkWin?D:A;
  applyEffect(s,winSeg,winP,loseP);
  if(out.mode==='damage'&&(loseSeg.c==='white'||loseSeg.c==='gold'))applyEffect(s,loseSeg,loseP,winP);
  if(out.ko&&s[loseP.owner].field.some(x=>x.id===loseP.id)){
    if(!(loseP.focusGuard||loseSeg.noKo)&&!(winSeg.e&&(winSeg.e.bench||winSeg.e.selfko||winSeg.e.fly||winSeg.e.selfBench)))pc(s,loseP);
  }
  finish();return{out,A,D,expected,actual};
}
function endTurn(s){
  const prev=s.turn;for(const p of s[prev].bench.concat(s[prev].field))if(p.wait>0)p.wait--;
  s.turn=other(prev);s.turnCount++;
  if(!s.win&&!hasLegal(s,s.turn)){s.win=other(s.turn);s.reason='no_legal_action';}
}
function applyPositionPlan(s,plan){
  const p=byId(s,plan.pid);if(!p)return;
  if(plan.type==='wake'){p.status.condition=null;return;}
  if(plan.type==='deploy'){s[p.owner].bench=s[p.owner].bench.filter(x=>x.id!==p.id);s[p.owner].field.push(p);}
  if(plan.type==='move'||plan.type==='deploy'){
    p.pos=plan.to;resolveSurrounds(s);
    if(s[p.owner].field.some(x=>x.id===p.id)&&p.pos===K.TARGET[p.owner]){s.win=p.owner;s.reason='goal';}
  }
}
function postBattleChoice(s,p,w){
  if(!p||!p.pos||!s[p.owner].field.some(x=>x.id===p.id))return null;
  let best=null;
  for(const d of battleableEnemies(s,p)){
    const b=battleProfile(p,d),threat=immediateGoals(s,other(p.owner)).some(x=>x.pid===d.id),score=b.expected*w.battleExpected+(threat?w.threatBattleBonus:0);
    if(!best||score>best.score)best={d,profile:b,score};
  }
  return best&&best.score>=w.battleThreshold?best:null;
}
function executePlan(s,plan,w,rng,quality){
  const owner=s.turn,p=byId(s,plan.pid),beforeScore=boardScore(s,owner,w),beforeEnemyGoals=immediateGoals(s,other(owner)).length;
  let battle=null;
  if(plan.type==='battle'){
    const d=byId(s,plan.did);if(p&&d)battle=resolveBattle(s,p,d,rng);
  }else if(plan.type==='wake'){
    if(p)p.status.condition=null;
  }else if(plan.type==='hold'){
  }else{
    applyPositionPlan(s,plan);
    if(!s.win&&p&&s[p.owner].field.some(x=>x.id===p.id)){
      const pb=postBattleChoice(s,p,w);if(pb)battle=resolveBattle(s,p,pb.d,rng);
    }
  }
  const afterScore=boardScore(s,owner,w),afterEnemyGoals=immediateGoals(s,other(owner)).length;
  quality.actions++;
  quality.totalBoardDelta+=afterScore-beforeScore;
  if(afterScore-beforeScore<-100)quality.selfHarm++;
  if(beforeEnemyGoals===0&&afterEnemyGoals>0)quality.allowedGoals++;
  if(battle){
    quality.battles++;quality.totalBattleExpected+=battle.expected.expected;
    if(battle.expected.expected<0)quality.negativeBattles++;
    if(battle.expected.expected<0&&battle.expected.catastrophe>=.2)quality.badGambles++;
    if(battle.expected.expected>0&&battle.expected.bigReturn>=.2&&battle.expected.stdev>350)quality.calculatedGambles++;
    const luck=battle.actual-battle.expected.expected;
    if(battle.expected.expected>=80&&battle.actual<0)quality.goodDecisionBadLuck++;
    if(battle.expected.expected<0&&battle.actual>100)quality.badDecisionGoodLuck++;
    quality.luckTotal+=luck;
  }
  if(!s.win)endTurn(s);
}

function simulatePosition(s,plan){
  const c=cloneState(s);applyPositionPlan(c,plan);return c;
}
function posture(before,w){
  if(before.enemyGoals>0)return{mode:'emergency',risk:1.2,upside:0};
  if(before.score>1800)return{mode:'protect_lead',risk:w.leadRisk,upside:.02};
  if(before.score<-1800)return{mode:'chasing',risk:w.chaseRisk,upside:w.upsideWeight};
  return{mode:'balanced',risk:w.balancedRisk,upside:w.upsideWeight};
}
function shallowEval(s,plan,owner,w){
  const before=metrics(s,owner,w);let after=before,tactical=0,battle=null;
  if(plan.type==='move'||plan.type==='deploy'||plan.type==='wake'){const c=simulatePosition(s,plan);after=metrics(c,owner,w);}
  if(plan.type==='battle'){const a=byId(s,plan.pid),d=byId(s,plan.did);if(a&&d){battle=battleProfile(a,d);tactical+=battle.expected*w.battleExpected;}}
  if((plan.type==='move'||plan.type==='deploy')&&plan.to===K.TARGET[owner])tactical+=w.goalNow;
  if((plan.type==='move'||plan.type==='deploy')&&plan.to===K.TARGET[other(owner)])tactical+=w.blockGoal;
  return{score:(after.score-before.score)+tactical,after,battle};
}
function bestReply(s,plan,owner,w){
  let c=cloneState(s);applyPositionPlan(c,plan);if(c.win)return null;
  const enemy=other(owner),plans=legalPlans(c,enemy);let best=null;
  for(const p of plans){const e=shallowEval(c,p,enemy,w);if(!best||e.score>best.score)best={plan:p,score:e.score};}
  return best;
}
function evaluatePlan(s,plan,owner,w,skipReply){
  const before=metrics(s,owner,w);let after=before,tactical=0,battle=null;
  if(plan.type==='move'||plan.type==='deploy'||plan.type==='wake'){after=metrics(simulatePosition(s,plan),owner,w);}
  if(plan.type==='battle'){
    const a=byId(s,plan.pid),d=byId(s,plan.did);
    if(a&&d){battle=battleProfile(a,d);tactical+=battle.expected*w.battleExpected;if(immediateGoals(s,other(owner)).some(x=>x.pid===d.id))tactical+=w.threatBattleBonus;}
  }
  if((plan.type==='move'||plan.type==='deploy')&&plan.to===K.TARGET[owner])tactical+=w.goalNow;
  if((plan.type==='move'||plan.type==='deploy')&&plan.to===K.TARGET[other(owner)])tactical+=w.blockGoal;
  const boardDelta=after.score-before.score;
  let replyTax=0;
  if(!skipReply&&tactical<w.goalNow*.9){const r=bestReply(s,plan,owner,w);if(r)replyTax=Math.max(0,r.score)*w.replyWeight;}
  const pos=posture(before,w);let downside=0,upside=0;
  if(battle){downside=Math.max(0,-battle.cvar25)*pos.risk+battle.catastrophe*unitValue(byId(s,plan.pid))*w.downsideWeight;upside=pos.upside*Math.max(0,battle.best)*battle.bigReturn;}
  if(after.enemyGoals>0)downside+=w.allowImmediateGoal+after.enemyGoals*50000;
  if(after.enemyMobility>before.enemyMobility)downside+=(after.enemyMobility-before.enemyMobility)*w.opponentMobility;
  if(plan.to){const p=byId(s,plan.pid);if(p)downside+=surroundRisk(s,p,plan.to)*w.surroundRisk;}
  const expected=boardDelta+tactical-replyTax,score=expected-downside+upside;
  const tags=[];
  if((plan.type==='move'||plan.type==='deploy')&&plan.to===K.TARGET[owner])tags.push('immediate_goal');
  if(after.enemyGoals>0&&before.enemyGoals===0)tags.push('allows_immediate_goal');
  if(expected<0)tags.push('negative_expected_value');
  if(battle&&battle.expected<0&&battle.stdev>250)tags.push('bad_gamble');
  if(battle&&battle.catastrophe>=.25&&battle.bigReturn<.15)tags.push('low_return_high_risk');
  if(battle&&battle.expected>0&&battle.bigReturn>=.2&&battle.stdev>350)tags.push('high_risk_high_return');
  return{plan,score,expected,boardDelta,tactical,replyTax,downside,upside,battle,tags,before,after};
}
function choosePlan(s,owner,w,quality){
  const plans=legalPlans(s,owner);
  if(!plans.length)return{type:'hold'};
  const goals=plans.filter(p=>(p.type==='move'||p.type==='deploy')&&p.to===K.TARGET[owner]);
  const evals=plans.map(p=>evaluatePlan(s,p,owner,w,false)).sort((a,b)=>b.score-a.score);
  const chosen=goals.length?evaluatePlan(s,goals[0],owner,w,false):evals[0];
  if(goals.length&&!chosen.tags.includes('immediate_goal'))quality.missedWins++;
  if(chosen.expected<0)quality.negativeChoices++;
  if(chosen.tags.includes('bad_gamble')||chosen.tags.includes('low_return_high_risk'))quality.riskyChoices++;
  quality.totalDecisionValue+=chosen.score;
  quality.worstDecision=Math.min(quality.worstDecision,chosen.score);
  return chosen.plan;
}
function newQuality(){return{actions:0,battles:0,missedWins:0,allowedGoals:0,negativeChoices:0,riskyChoices:0,badGambles:0,calculatedGambles:0,negativeBattles:0,selfHarm:0,totalBoardDelta:0,totalBattleExpected:0,totalDecisionValue:0,worstDecision:Infinity,goodDecisionBadLuck:0,badDecisionGoodLuck:0,luckTotal:0};}
function compactQuality(q){return{
  actions:q.actions,battles:q.battles,missedWins:q.missedWins,allowedGoals:q.allowedGoals,negativeChoices:q.negativeChoices,riskyChoices:q.riskyChoices,
  badGambles:q.badGambles,calculatedGambles:q.calculatedGambles,negativeBattles:q.negativeBattles,selfHarm:q.selfHarm,
  avgBoardDelta:q.actions?q.totalBoardDelta/q.actions:0,avgBattleExpected:q.battles?q.totalBattleExpected/q.battles:0,
  avgDecisionValue:q.actions?q.totalDecisionValue/q.actions:0,worstDecision:q.worstDecision===Infinity?0:q.worstDecision,
  goodDecisionBadLuck:q.goodDecisionBadLuck,badDecisionGoodLuck:q.badDecisionGoodLuck,avgLuck:q.battles?q.luckTotal/q.battles:0
};}
function mergeQuality(dst,src){
  for(const k of Object.keys(dst)){
    if(k==='worstDecision')continue;
    if(typeof dst[k]==='number'&&typeof src[k]==='number')dst[k]+=src[k];
  }
  dst.worstDecision=Math.min(dst.worstDecision,src.worstDecision);
}

function playMatch(seed,identityBySide,weightsByIdentity,maxTurns){
  const rng=mulberry32(seed),s=makeState(),q={champion:newQuality(),challenger:newQuality()},events=[];
  while(!s.win&&s.turnCount<=maxTurns){
    const side=s.turn,id=identityBySide[side],w=weightsByIdentity[id],quality=q[id],goalsBefore=immediateGoals(s,side).length;
    const plan=choosePlan(s,side,w,quality);
    const ev={turn:s.turnCount,side,identity:id,plan:{type:plan.type,pid:plan.pid||null,to:plan.to||null,did:plan.did||null},goalsBefore};
    executePlan(s,plan,w,rng,quality);
    ev.winnerAfter=s.win||null;events.push(ev);
    if(events.length>maxTurns+5)break;
  }
  if(!s.win&&s.turnCount>maxTurns){s.reason='turn_limit';}
  const winnerIdentity=s.win?identityBySide[s.win]:null;
  const row={
    seed,winnerSide:s.win||null,winnerIdentity,reason:s.reason||'turn_limit',turns:Math.min(s.turnCount,maxTurns),
    p1Identity:identityBySide.p1,p2Identity:identityBySide.p2,
    champion:compactQuality(q.champion),challenger:compactQuality(q.challenger)
  };
  const notable={
    seed,winnerIdentity,reason:row.reason,turns:row.turns,p1Identity:row.p1Identity,p2Identity:row.p2Identity,
    champion:{missedWins:q.champion.missedWins,allowedGoals:q.champion.allowedGoals,badGambles:q.champion.badGambles,worstDecision:round(q.champion.worstDecision===Infinity?0:q.champion.worstDecision)},
    challenger:{missedWins:q.challenger.missedWins,allowedGoals:q.challenger.allowedGoals,badGambles:q.challenger.badGambles,worstDecision:round(q.challenger.worstDecision===Infinity?0:q.challenger.worstDecision)},
    tail:events.slice(-8)
  };
  return{row,quality:q,notable};
}
function mutateWeights(base,rng,generation){
  const out=copyWeights(base),changes={},count=4+Math.floor(rng()*5),keys=MUTABLE_KEYS.slice();
  for(let i=0;i<count&&keys.length;i++){
    const idx=Math.floor(rng()*keys.length),k=keys.splice(idx,1)[0],old=out[k];
    let factor=1+(rng()*.28-.14);
    let next=old*factor;
    if(k==='replyWeight'||k==='downsideWeight'||k==='upsideWeight'||k==='leadRisk'||k==='balancedRisk'||k==='chaseRisk')next=clamp(next,.02,1.5);
    if(k==='battleThreshold')next=clamp(old+(rng()*.4-.2)*100,-180,120);
    out[k]=+next.toFixed(4);changes[k]={from:old,to:out[k]};
  }
  return{weights:out,changes,mutationSeed:generation};
}
function penalty(q){
  const actions=Math.max(1,q.actions);
  return(q.missedWins*1000+q.allowedGoals*800+q.badGambles*180+q.riskyChoices*80+q.negativeChoices*30+q.selfHarm*20)/actions;
}
function aggregateQuality(q){const z=compactQuality(q);z.penalty=penalty(q);return z;}
function promotionDecision(wins,champQ,challQ,matches){
  const decisive=wins.champion+wins.challenger,rate=decisive?wins.challenger/decisive:0;
  const cq=aggregateQuality(champQ),nq=aggregateQuality(challQ);
  const checks={
    minimumSample:matches>=20,
    winRate:rate>=.53,
    noMissedWins:nq.missedWins===0,
    allowedGoals:nq.allowedGoals/Math.max(1,nq.actions)<=cq.allowedGoals/Math.max(1,cq.actions)+.003,
    badGambles:nq.badGambles/Math.max(1,nq.battles)<=cq.badGambles/Math.max(1,cq.battles)+.01,
    qualityPenalty:nq.penalty<=cq.penalty*1.05+1
  };
  const accepted=Object.values(checks).every(Boolean);
  return{accepted,challengerWinRate:rate,checks,championQuality:cq,challengerQuality:nq,reason:accepted?'win_rate_and_quality_improved':Object.keys(checks).filter(k=>!checks[k]).join(',')};
}
function generationCsv(rows){
  const head=['generation','matches','champion_wins','challenger_wins','draws','challenger_win_rate','champion_penalty','challenger_penalty','champion_missed_wins','challenger_missed_wins','champion_allowed_goals','challenger_allowed_goals','champion_bad_gambles','challenger_bad_gambles','promoted'];
  return head.join(',')+'\n'+rows.map(g=>[
    g.generation,g.matches,g.wins.champion,g.wins.challenger,g.wins.draw,(g.promotion.challengerWinRate||0).toFixed(4),
    (g.promotion.championQuality.penalty||0).toFixed(3),(g.promotion.challengerQuality.penalty||0).toFixed(3),
    g.promotion.championQuality.missedWins,g.promotion.challengerQuality.missedWins,
    g.promotion.championQuality.allowedGoals,g.promotion.challengerQuality.allowedGoals,
    g.promotion.championQuality.badGambles,g.promotion.challengerQuality.badGambles,
    g.promotion.accepted
  ].join(',')).join('\n');
}
function strategyMd(result){
  const last=result.generations[result.generations.length-1],p=last&&last.promotion;
  const lines=[
    '# AI自己対戦 方針',
    '',
    '生成日時: '+result.generatedAt,
    'エンジン: '+ENGINE_VERSION,
    '',
    '## 絶対条件',
    '',
    '- 即ゴール可能なら必ずゴールする。',
    '- 相手の即ゴールを許す行動は、他に防御手がない場合を除き選ばない。',
    '- 相手ゴールを封鎖している駒を動かす場合、封鎖解除後の損失を評価する。',
    '',
    '## 勝負の期待値',
    '',
    '- 平均期待値だけでなく、悪い方25%の平均結果と破滅確率を評価する。',
    '- 優勢時は下振れを重くし、劣勢時はプラス期待値の逆転手を許容する。',
    '- 小リターン・高破滅確率の勝負を避ける。',
    '- 実際の勝敗と判断の良否を分け、運勝ちを正解として扱わない。',
    '',
    '## 最新世代',
    ''
  ];
  if(last&&p){
    lines.push('- 世代: '+last.generation);
    lines.push('- 対戦数: '+last.matches);
    lines.push('- 挑戦者勝率: '+(p.challengerWinRate*100).toFixed(1)+'%');
    lines.push('- 昇格: '+(p.accepted?'採用':'不採用'));
    lines.push('- 理由: '+p.reason);
    lines.push('- 王者の品質ペナルティ: '+p.championQuality.penalty.toFixed(2));
    lines.push('- 挑戦者の品質ペナルティ: '+p.challengerQuality.penalty.toFixed(2));
  }else lines.push('- 完了した世代はありません。');
  lines.push('','## 運用','','- ブラウザには学習状態を保存しない。','- 王者設定はGitHubの `training/champion.json` を正本とする。','- 自己対戦結果JSONを分析後、採用した王者のみGitHubへ反映する。');
  return lines.join('\n');
}

let champion={schema:'rc-ai-champion.v1',generation:0,version:'initial',weights:copyWeights(DEFAULT_WEIGHTS),updatedAt:null};
let run=null,lastResult=null;

async function loadChampion(){
  try{
    const r=await fetch('training/champion.json?v='+encodeURIComponent(ENGINE_VERSION),{cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const x=await r.json();champion={schema:x.schema||'rc-ai-champion.v1',generation:x.generation||0,version:x.version||'repo',weights:copyWeights(x.weights),updatedAt:x.updatedAt||null};
  }catch(e){champion={schema:'rc-ai-champion.v1',generation:0,version:'fallback',weights:copyWeights(DEFAULT_WEIGHTS),updatedAt:null};}
  renderStatus();
}
function makePanel(){
  if(document.getElementById('selfPlayPanel'))return;
  const root=document.querySelector('.app')||document.body,box=document.createElement('section');
  box.id='selfPlayPanel';
  box.style.cssText='margin:16px 0;padding:14px;border:1px solid #334155;border-radius:16px;background:#0f172acc;color:#e2e8f0;box-shadow:0 12px 30px #0003;';
  box.innerHTML=''
    +'<details><summary style="cursor:pointer;font-weight:800;font-size:17px">AI自己対戦（AI対AI）</summary>'
    +'<div style="display:grid;gap:10px;margin-top:12px">'
    +'<div style="font-size:13px;line-height:1.6;color:#cbd5e1">端末保存なし。GitHub上の王者設定を読み込み、王者AIと変異させた挑戦者AIを先後交代で対戦させます。</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
    +'<label>1世代 <select id="spMatches"><option value="20">20試合</option><option value="100" selected>100試合</option><option value="300">300試合</option></select></label>'
    +'<label>世代数 <select id="spGenerations"><option value="1" selected>1世代</option><option value="3">3世代</option><option value="5">5世代</option></select></label>'
    +'<label>最大TURN <select id="spMaxTurns"><option value="80">80</option><option value="120" selected>120</option><option value="180">180</option></select></label>'
    +'</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap"><button id="spStart">自己対戦開始</button><button id="spStop" disabled>停止</button><button id="spJson" disabled>学習JSON保存</button><button id="spCsv" disabled>集計CSV保存</button><button id="spMd" disabled>方針MD保存</button></div>'
    +'<progress id="spProgress" value="0" max="1" style="width:100%;height:14px"></progress>'
    +'<pre id="spStatus" style="white-space:pre-wrap;margin:0;font-size:12px;line-height:1.55;color:#dbeafe"></pre>'
    +'</div></details>';
  root.appendChild(box);
  box.querySelector('#spStart').onclick=startRun;
  box.querySelector('#spStop').onclick=()=>{if(run)run.stop=true;};
  box.querySelector('#spJson').onclick=()=>downloadText('rc-selfplay-'+stamp()+'.json',JSON.stringify(lastResult,null,2),'application/json');
  box.querySelector('#spCsv').onclick=()=>downloadText('rc-selfplay-history-'+stamp()+'.csv',generationCsv(lastResult.generations),'text/csv');
  box.querySelector('#spMd').onclick=()=>downloadText('rc-selfplay-strategy-'+stamp()+'.md',strategyMd(lastResult),'text/markdown');
}
function stamp(){return new Date().toISOString().replace(/[:.]/g,'-');}
function downloadText(name,text,type){const u=URL.createObjectURL(new Blob([text],{type:type+';charset=utf-8'})),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function renderStatus(extra){
  const el=document.getElementById('spStatus');if(!el)return;
  const lines=['王者: generation '+champion.generation+' / '+champion.version,'保存先: 端末保存なし（結果ファイルのみ）'];
  if(run)lines.push('実行中: 世代 '+(run.generationIndex+1)+' / '+run.generations+'、試合 '+run.matchIndex+' / '+run.matches);
  if(lastResult){const g=lastResult.generations[lastResult.generations.length-1];if(g)lines.push('直近: 挑戦者 '+g.wins.challenger+'勝 / 王者 '+g.wins.champion+'勝 / 引分 '+g.wins.draw+'、昇格 '+(g.promotion.accepted?'あり':'なし'));}
  if(extra)lines.push(extra);el.textContent=lines.join('\n');
}
function updateButtons(running){
  const box=document.getElementById('selfPlayPanel');if(!box)return;
  box.querySelector('#spStart').disabled=running;box.querySelector('#spStop').disabled=!running;
  for(const id of['#spJson','#spCsv','#spMd'])box.querySelector(id).disabled=running||!lastResult;
}
function pickNotables(xs){
  const map=new Map();
  function add(x){if(x&&!map.has(x.seed))map.set(x.seed,x);}
  add(xs.slice().sort((a,b)=>b.turns-a.turns)[0]);
  add(xs.find(x=>x.champion.missedWins||x.challenger.missedWins));
  add(xs.find(x=>x.champion.allowedGoals||x.challenger.allowedGoals));
  add(xs.find(x=>x.champion.badGambles||x.challenger.badGambles));
  add(xs.slice().sort((a,b)=>Math.min(a.champion.worstDecision,a.challenger.worstDecision)-Math.min(b.champion.worstDecision,b.challenger.worstDecision))[0]);
  for(const x of xs.slice(0,4))add(x);
  return Array.from(map.values()).slice(0,10);
}
function startRun(){
  if(run)return;
  const box=document.getElementById('selfPlayPanel'),matches=Math.max(20,parseInt(box.querySelector('#spMatches').value,10)||100),generations=parseInt(box.querySelector('#spGenerations').value,10)||1,maxTurns=parseInt(box.querySelector('#spMaxTurns').value,10)||120;
  const evenMatches=matches%2?matches+1:matches,seedBase=(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;
  lastResult={schema:'rc-selfplay-training.v1',engineVersion:ENGINE_VERSION,generatedAt:nowIso(),config:{matchesPerGeneration:evenMatches,generations,maxTurns,pairedSeeds:true,storage:'none'},championBefore:JSON.parse(JSON.stringify(champion)),generations:[],championAfter:null};
  run={stop:false,matches:evenMatches,generations,maxTurns,seedBase,generationIndex:0,matchIndex:0,current:null,championWeights:copyWeights(champion.weights),championGeneration:champion.generation,nextGeneration:champion.generation+1};
  updateButtons(true);stepRun();
}
function beginGeneration(){
  const gi=run.generationIndex+1,generation=run.nextGeneration,rng=mulberry32(hashSeed(run.seedBase,gi,17)),mut=mutateWeights(run.championWeights,rng,generation);
  run.current={generation,matches:run.matches,championBefore:copyWeights(run.championWeights),challenger:mut,wins:{champion:0,challenger:0,draw:0},quality:{champion:newQuality(),challenger:newQuality()},matchRows:[],notablePool:[]};
  run.matchIndex=0;
}
function finishGeneration(){
  const g=run.current,prom=promotionDecision(g.wins,g.quality.champion,g.quality.challenger,g.matches);
  const out={generation:g.generation,matches:g.matches,championBefore:g.championBefore,challenger:{weights:g.challenger.weights,changes:g.challenger.changes,mutationSeed:g.challenger.mutationSeed},wins:g.wins,promotion:prom,matchRows:g.matchRows,notableMatches:pickNotables(g.notablePool),championAfter:prom.accepted?g.challenger.weights:g.championBefore};
  lastResult.generations.push(out);
  if(prom.accepted){run.championWeights=copyWeights(g.challenger.weights);run.championGeneration=g.generation;}
  run.nextGeneration=g.generation+1;run.generationIndex++;run.current=null;
}
function finishRun(stopped){
  lastResult.generatedAt=nowIso();lastResult.stopped=!!stopped;lastResult.championAfter={schema:'rc-ai-champion.v1',generation:run.championGeneration,version:ENGINE_VERSION,weights:copyWeights(run.championWeights),updatedAt:lastResult.generatedAt};
  run=null;updateButtons(false);const p=document.getElementById('spProgress');if(p&&!stopped)p.value=p.max;renderStatus(stopped?'途中停止。完了分を保存できます。':'自己対戦完了。JSONを保存してこのチャットへ送ってください。');
}
function stepRun(){
  if(!run)return;
  if(run.stop){if(run.current&&run.matchIndex>0){run.current.matches=run.matchIndex;finishGeneration();}finishRun(true);return;}
  if(run.generationIndex>=run.generations){finishRun(false);return;}
  if(!run.current)beginGeneration();
  const g=run.current,idx=run.matchIndex,pair=Math.floor(idx/2),seed=hashSeed(run.seedBase,run.generationIndex,pair);
  const identityBySide=idx%2===0?{p1:'champion',p2:'challenger'}:{p1:'challenger',p2:'champion'};
  const weights={champion:g.championBefore,challenger:g.challenger.weights},m=playMatch(seed,identityBySide,weights,run.maxTurns);
  if(m.row.winnerIdentity)g.wins[m.row.winnerIdentity]++;else g.wins.draw++;
  mergeQuality(g.quality.champion,m.quality.champion);mergeQuality(g.quality.challenger,m.quality.challenger);
  g.matchRows.push(m.row);g.notablePool.push(m.notable);run.matchIndex++;
  const progress=document.getElementById('spProgress');if(progress){progress.max=run.matches*run.generations;progress.value=run.generationIndex*run.matches+run.matchIndex;}
  renderStatus();
  if(run.matchIndex>=run.matches)finishGeneration();
  setTimeout(stepRun,0);
}

makePanel();
loadChampion();
K.selfPlay={version:ENGINE_VERSION,start:startRun,getResult:()=>lastResult,getChampion:()=>JSON.parse(JSON.stringify(champion))};
})(window.KOMA);

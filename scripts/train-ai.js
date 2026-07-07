const fs=require('fs');
const weightsPath='src/learned-weights.json';
const aiWeightsPath='src/ai-weights.js';
const base=JSON.parse(fs.readFileSync(weightsPath,'utf8'));
const keys=Object.keys(base);
function sample(){const r=Math.random,f={};for(const k of keys)f[k]=0;f.tempo=1;const m=Math.floor(r()*8);if(m===0)f.goalNow=1;if(m===1){f.blockGoal=1;f.oppGoal=1;}if(m===2){f.battle=r()*2-.45;f.statusInflict=r();f.statusSuffer=r()*.8;}if(m===3){f.surroundKill=r()*1.2;f.surroundRisk=r()*1.8;}if(m===4){f.goalDist=r();f.goalThreat=r()>.45?1:0;f.cornerThreat=r()>.78?1:0;}if(m===5){f.spawnBlock=r()>.35?1:0;f.ownSpawnBlocked=r()>.55?1:0;}if(m===6){f.center=r();f.field=r()*2-1;f.pc=r()*2-1;}if(m===7){f.oppGoal=1;f.blockGoal=r()>.35?1:0;f.battle=r()*1.5;}return f;}
function expert(f){let s=0;if(f.goalNow)s+=180;if(f.blockGoal&&f.oppGoal)s+=165;if(f.oppGoal&&!f.blockGoal)s-=190;s+=f.goalDist*18+f.goalThreat*52+f.cornerThreat*55;s+=f.spawnBlock*35-f.ownSpawnBlocked*55;s+=f.surroundKill*90-f.surroundRisk*72;s+=f.battle*30+f.statusInflict*13-f.statusSuffer*16;s+=f.center*7+f.pc*10+f.field*5;return s;}
function predict(f,w){let s=0;for(const k of keys)s+=(w[k]||0)*(f[k]||0)/Math.max(1,Math.abs(base[k]||1));return s;}
function clamp(w){const out={};for(const k of keys){const b=base[k],cap=Math.max(20,Math.abs(b)*3);out[k]=Math.max(-cap,Math.min(cap,Math.round(w[k])));}return out;}
let w={...base};const rounds=Number(process.env.TRAIN_ROUNDS||50000);let err=0;for(let i=0;i<rounds;i++){const f=sample(),y=expert(f),p=predict(f,w),e=y-p;err+=Math.abs(e);for(const k of keys){const x=f[k]||0;if(!x)continue;w[k]+=e*x*.16*Math.max(1,Math.abs(base[k]||1))/100;}}
w=clamp(w);fs.writeFileSync(weightsPath,JSON.stringify(w,null,2)+'\n');
let src=fs.readFileSync(aiWeightsPath,'utf8');
const obj='K.DEFAULT_AI_WEIGHTS='+JSON.stringify(w,null,2).replace(/"([^"\\]+)":/g,'$1:')+';';
src=src.replace(/K\.DEFAULT_AI_WEIGHTS=\{[\s\S]*?\n\};/,obj);
fs.writeFileSync(aiWeightsPath,src);
console.log(`trained ${rounds} samples, avg error ${Math.round(err/rounds)}`);
console.log(w);

window.KOMA=window.KOMA||{};
(function(K){
K.AI_WEIGHT_KEY=K.AI_WEIGHT_KEY||'koma_ai_learned_weights_v1';
K.DEFAULT_AI_WEIGHTS={
  goalNow:12000000,
  blockGoal:10000000,
  oppGoal:-6000000,
  pc:1200,
  field:90,
  goalDist:450,
  goalThreat:75000,
  cornerThreat:54000,
  spawnBlock:4500,
  ownSpawnBlocked:-18000,
  center:-800,
  surroundKill:30000,
  surroundRisk:-70000,
  battle:55,
  statusInflict:25,
  statusSuffer:-80,
  tempo:700
};
const HARD={goalNow:15000000,blockGoal:12000000,oppGoal:8000000,pc:2500,field:500,goalDist:1000,goalThreat:100000,cornerThreat:75000,spawnBlock:15000,ownSpawnBlocked:50000,center:5000,surroundKill:60000,surroundRisk:120000,battle:200,statusInflict:200,statusSuffer:300,tempo:2000};
const POS=['goalNow','blockGoal','pc','field','goalDist','goalThreat','cornerThreat','spawnBlock','surroundKill','battle','statusInflict','tempo'];
const NEG=['oppGoal','ownSpawnBlocked','surroundRisk','statusSuffer'];
function clone(o){return JSON.parse(JSON.stringify(o));}
function clean(w){const b=K.DEFAULT_AI_WEIGHTS,out=clone(b);for(const k of Object.keys(b)){let v=Number(w&&w[k]);if(Number.isFinite(v)){const cap=HARD[k]||Math.max(20,Math.abs(b[k])*2);v=Math.max(-cap,Math.min(cap,v));out[k]=v;}if(POS.includes(k)&&out[k]<0)out[k]=b[k];if(NEG.includes(k)&&out[k]>0)out[k]=b[k];}return out;}
K.getAiWeights=function(){try{const raw=localStorage.getItem(K.AI_WEIGHT_KEY);if(raw)return clean(JSON.parse(raw));}catch(e){}return clone(K.DEFAULT_AI_WEIGHTS);};
K.saveAiWeights=function(w){const c=clean(w);try{localStorage.setItem(K.AI_WEIGHT_KEY,JSON.stringify(c));}catch(e){}return c;};
K.resetAiWeights=function(){try{localStorage.removeItem(K.AI_WEIGHT_KEY);}catch(e){}return clone(K.DEFAULT_AI_WEIGHTS);};
K.aiWeightSummary=function(){const w=K.getAiWeights(),b=K.DEFAULT_AI_WEIGHTS;let changed=0;for(const k of Object.keys(b))if(Math.round(w[k])!==Math.round(b[k]))changed++;return{changed,weights:w};};
})(window.KOMA);

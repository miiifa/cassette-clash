window.KOMA=window.KOMA||{};
(function(K){
K.AI_WEIGHT_KEY='koma_ai_learned_weights_v1';
K.DEFAULT_AI_WEIGHTS={
  goalNow: 15000000,
  blockGoal: 12000000,
  oppGoal: -8000000,
  pc: 2500,
  field: 463,
  goalDist: 1000,
  goalThreat: 100000,
  cornerThreat: 75000,
  spawnBlock: 15000,
  ownSpawnBlocked: -50000,
  center: -5000,
  surroundKill: 60000,
  surroundRisk: -120000,
  battle: 200,
  statusInflict: 200,
  statusSuffer: -300,
  tempo: 2000
};
const POSITIVE_KEYS=['goalNow','blockGoal','pc','field','goalDist','goalThreat','cornerThreat','spawnBlock','surroundKill','battle','statusInflict','tempo'];
const NEGATIVE_KEYS=['oppGoal','ownSpawnBlocked','surroundRisk','statusSuffer'];
function clone(o){return JSON.parse(JSON.stringify(o));}
function normalize(w){const base=K.DEFAULT_AI_WEIGHTS,out=clone(base);for(const k of Object.keys(base)){const v=Number(w&&w[k]);if(Number.isFinite(v)){const cap=Math.max(20,Math.abs(base[k])*3);out[k]=Math.max(-cap,Math.min(cap,v));}if(POSITIVE_KEYS.includes(k)&&out[k]<0)out[k]=base[k];if(NEGATIVE_KEYS.includes(k)&&out[k]>0)out[k]=base[k];}return out;}
K.getAiWeights=function(){try{const raw=localStorage.getItem(K.AI_WEIGHT_KEY);if(raw)return normalize(JSON.parse(raw));}catch(e){}return clone(K.DEFAULT_AI_WEIGHTS);};
K.saveAiWeights=function(w){const clean=normalize(w);try{localStorage.setItem(K.AI_WEIGHT_KEY,JSON.stringify(clean));}catch(e){}return clean;};
K.resetAiWeights=function(){try{localStorage.removeItem(K.AI_WEIGHT_KEY);}catch(e){}return clone(K.DEFAULT_AI_WEIGHTS);};
K.aiWeightSummary=function(){const w=K.getAiWeights(),b=K.DEFAULT_AI_WEIGHTS;let changed=0;for(const k of Object.keys(b))if(Math.round(w[k])!==Math.round(b[k]))changed++;return{changed,weights:w};};
})(window.KOMA);

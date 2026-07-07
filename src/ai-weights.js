window.KOMA=window.KOMA||{};
(function(K){
K.AI_WEIGHT_KEY='koma_ai_learned_weights_v1';
K.DEFAULT_AI_WEIGHTS={
  goalNow:3000000,
  blockGoal:2664000,
  oppGoal:-2774000,
  pc:700,
  field:105,
  goalDist:94,
  goalThreat:15600,
  cornerThreat:54000,
  spawnBlock:3750,
  ownSpawnBlocked:-4350,
  center:170,
  surroundKill:25500,
  surroundRisk:-16800,
  battle:39,
  statusInflict:20,
  statusSuffer:-20,
  tempo:232
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

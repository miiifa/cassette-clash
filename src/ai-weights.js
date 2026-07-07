window.KOMA=window.KOMA||{};
(function(K){
K.AI_WEIGHT_KEY='koma_ai_learned_weights_v1';
K.DEFAULT_AI_WEIGHTS={
  goalNow:1000000,
  blockGoal:900000,
  oppGoal:-950000,
  pc:520,
  field:105,
  goalDist:32,
  goalThreat:5200,
  cornerThreat:18000,
  spawnBlock:1250,
  ownSpawnBlocked:-1450,
  center:170,
  surroundKill:8500,
  surroundRisk:-5600,
  battle:13,
  statusInflict:4,
  statusSuffer:-5,
  tempo:90
};
function clone(o){return JSON.parse(JSON.stringify(o));}
function normalize(w){const base=K.DEFAULT_AI_WEIGHTS,out=clone(base);for(const k of Object.keys(base)){const v=Number(w&&w[k]);if(Number.isFinite(v)){const cap=Math.max(20,Math.abs(base[k])*3);out[k]=Math.max(-cap,Math.min(cap,v));}}return out;}
K.getAiWeights=function(){try{const raw=localStorage.getItem(K.AI_WEIGHT_KEY);if(raw)return normalize(JSON.parse(raw));}catch(e){}return clone(K.DEFAULT_AI_WEIGHTS);};
K.saveAiWeights=function(w){const clean=normalize(w);try{localStorage.setItem(K.AI_WEIGHT_KEY,JSON.stringify(clean));}catch(e){}return clean;};
K.resetAiWeights=function(){try{localStorage.removeItem(K.AI_WEIGHT_KEY);}catch(e){}return clone(K.DEFAULT_AI_WEIGHTS);};
K.aiWeightSummary=function(){const w=K.getAiWeights(),b=K.DEFAULT_AI_WEIGHTS;let changed=0;for(const k of Object.keys(b))if(Math.round(w[k])!==Math.round(b[k]))changed++;return{changed,weights:w};};
})(window.KOMA);

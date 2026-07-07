window.KOMA=window.KOMA||{};
(function(K){
  const baseRender=K.render;
  K.render=function(){
    baseRender&&baseRender();
    if(K.s&&K.s.phase==='moving'){
      const status=document.querySelector('#status');
      if(status)status.textContent='移動中...';
    }
    if(K.s&&K.s.fx){
      for(const id of Object.keys(K.s.fx)){
        const fx=K.s.fx[id];
        if(!fx||!fx.cls)continue;
        const p=K.byId&&K.byId(id);
        if(!p)continue;
        for(const el of document.querySelectorAll('.fig')){
          const name=el.querySelector('span')&&el.querySelector('span').textContent;
          if(name===p.n&&el.classList.contains(p.owner))el.classList.add(fx.cls);
        }
      }
    }
  };
})(window.KOMA);

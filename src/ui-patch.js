window.KOMA=window.KOMA||{};
(function(K){
  const baseRender=K.render;
  K.render=function(){
    baseRender&&baseRender();
    if(K.s&&K.s.phase==='moving'){
      const status=document.querySelector('#status');
      if(status)status.textContent='移動中...';
    }
  };
})(window.KOMA);

(() => {
  // Decorative effects never compete with the initial page load.
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let loaded=false,scheduled=false;
  function schedule() {
    if(loaded||scheduled||document.readyState!=='complete'||!fine.matches||reduced.matches)return;
    scheduled=true;
    const load=()=>{
      scheduled=false;
      if(loaded||!fine.matches||reduced.matches)return;
      loaded=true;
      ['js/home-sparkles.js?v=idle','js/intro-ripple.js?v=idle'].forEach(src=>{
        const script=document.createElement('script');
        script.src=src;script.async=true;script.fetchPriority='low';document.body.append(script);
      });
    };
    if('requestIdleCallback' in window)requestIdleCallback(load,{timeout:2000});
    else setTimeout(load,150);
  }
  addEventListener('load',schedule,{once:true});
  fine.addEventListener('change',schedule);
  reduced.addEventListener('change',schedule);
  schedule();
})();

(() => {
  /* SCROLL STORYBOARD
   * Work approaches the introduction → the statement and surname dissolve.
   * A damped spring shrinks the remaining name into the top-left corner.
   * Scrolling back reverses the same movement. Native page scrolling stays intact.
   */
  const config = { stiffness:240, damping:31, compactSize:22, clearance:80 };
  const intro=document.querySelector('.v3-intro');
  const title=intro.querySelector('h1');
  const statement=intro.querySelector('.v3-statement');
  const surname=intro.querySelector('.v3-surname');
  const name=intro.querySelector('.v3-name');
  const home=intro.querySelector('.v3-home');
  const grid=document.querySelector('.work-grid');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let start=0,end=1,scale=1,target=0,value=0,velocity=0,last=0,frame=0;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function paint() {
    const p=clamp(value), fade=1-clamp(p/.55);
    intro.style.transform=`scale(${1+(scale-1)*p})`;
    statement.style.opacity=fade;
    surname.style.opacity=fade;
    const weightProgress=p*p*(3-2*p);
    name.style.fontWeight=300+100*weightProgress;
    document.documentElement.style.setProperty('--v3-progress',clamp((p-.55)/.45));
    home.style.display=p>.98?'block':'none';
    home.tabIndex=p>.98?0:-1;
    const compact=p>.98?'true':'false';
    if(document.documentElement.dataset.introCompact!==compact) {
      document.documentElement.dataset.introCompact=compact;
      document.dispatchEvent(new Event('portfolio:intro-state'));
    }
  }
  function tick(time) {
    let dt=last?Math.min((time-last)/1000,.04):1/60;last=time;
    while(dt>0) { const h=Math.min(dt,1/120);velocity+=(config.stiffness*(target-value)-config.damping*velocity)*h;value+=velocity*h;dt-=h; }
    if(Math.abs(target-value)<.0001 && Math.abs(velocity)<.001) { value=target;velocity=0;frame=0;last=0;paint();return; }
    paint();frame=requestAnimationFrame(tick);
  }
  function update() {
    target=clamp((scrollY-start)/(end-start));
    paint();
    if(reduced.matches) { cancelAnimationFrame(frame);frame=0;last=0;value=target;velocity=0;paint(); }
    else if(!frame) frame=requestAnimationFrame(tick);
  }
  function measure() {
    const top=parseFloat(getComputedStyle(intro).top);
    scale=config.compactSize/parseFloat(getComputedStyle(title).fontSize);
    // Show a 40px preview of the first row.
    const mobile=matchMedia('(max-width:780px)').matches;
    const viewportHeight=mobile && window.visualViewport ? window.visualViewport.height : innerHeight;
    const cardsTop=viewportHeight-40;
    grid.closest('main').style.paddingTop=Math.max(0,cardsTop)+'px';
    const gridTop=grid.getBoundingClientRect().top+scrollY;
    // Compact the introduction as the cards approach the header.
    const introBottom=top+title.offsetHeight;
    start=Math.max(0,gridTop-introBottom-config.clearance);
    end=Math.max(start+120,gridTop-120);
    update();
  }
  home.addEventListener('click',event=>{ event.preventDefault();measure();window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}); });
  addEventListener('scroll',update,{passive:true});
  addEventListener('resize',measure);
  addEventListener('pageshow',measure);
  reduced.addEventListener('change',update);
  document.fonts.ready.then(measure);
  measure();
})();

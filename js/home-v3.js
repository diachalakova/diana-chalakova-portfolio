(() => {
  /* SCROLL STORYBOARD
   * Work approaches the introduction → the statement and surname dissolve.
   * A damped spring shrinks the remaining name into the top-left corner.
   * Scrolling back reverses the same movement. Native page scrolling stays intact.
   */
  const config = { stiffness:180, damping:27, compactSize:22, clearance:80 };
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
    const p=clamp(value), fade=1-clamp(p/.65);
    intro.style.transform=`scale(${1+(scale-1)*p})`;
    statement.style.opacity=fade;
    surname.style.opacity=fade;
    const weightProgress=p*p*(3-2*p);
    name.style.fontWeight=300+100*weightProgress;
    document.documentElement.style.setProperty('--v3-progress',clamp((p-.55)/.45));
    home.style.display=p>.98?'block':'none';
    home.tabIndex=p>.98?0:-1;
  }
  function tick(time) {
    let dt=last?Math.min((time-last)/1000,.04):1/60;last=time;
    while(dt>0) { const h=Math.min(dt,1/120);velocity+=(config.stiffness*(target-value)-config.damping*velocity)*h;value+=velocity*h;dt-=h; }
    if(Math.abs(target-value)<.0001 && Math.abs(velocity)<.001) { value=target;velocity=0;frame=0;last=0;paint();return; }
    paint();frame=requestAnimationFrame(tick);
  }
  function update() {
    target=clamp((scrollY-start)/(end-start));
    if(reduced.matches) { cancelAnimationFrame(frame);frame=0;last=0;value=target;velocity=0;paint(); }
    else if(!frame) frame=requestAnimationFrame(tick);
  }
  function measure() {
    const top=parseFloat(getComputedStyle(intro).top);
    scale=config.compactSize/parseFloat(getComputedStyle(title).fontSize);
    const gridTop=grid.getBoundingClientRect().top+scrollY;
    start=Math.max(0,gridTop-(top+title.offsetHeight)-config.clearance);
    end=Math.max(start+120,gridTop-100);
    update();
  }
  home.addEventListener('click',event=>{ event.preventDefault();window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}); });
  addEventListener('scroll',update,{passive:true});
  addEventListener('resize',measure);
  addEventListener('pageshow',measure);
  reduced.addEventListener('change',update);
  document.fonts.ready.then(measure);
  measure();
})();

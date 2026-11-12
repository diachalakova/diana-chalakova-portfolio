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
  const filters=document.querySelector('.v3-project-filters');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let start=0,end=1,scale=1,target=0,value=0,velocity=0,last=0,frame=0;
  const filterScroll = { stiffness:110, damping:23, topInset:76 };
  let scrollFrame=0, keepFiltersVisible=false;
  function cancelFilterScroll() { cancelAnimationFrame(scrollFrame);scrollFrame=0; }
  function scrollToProjects() {
    cancelFilterScroll();
    const destination=Math.max(0,Math.min(
      grid.getBoundingClientRect().top+scrollY-(64+filters.offsetHeight+16),
      document.documentElement.scrollHeight-innerHeight
    ));
    if(reduced.matches) { window.scrollTo({top:destination,behavior:'instant'});return; }
    let position=scrollY,speed=0,previous=0;
    function advance(time) {
      let dt=previous?Math.min((time-previous)/1000,.04):1/60;previous=time;
      while(dt>0) {
        const h=Math.min(dt,1/120);
        speed+=(filterScroll.stiffness*(destination-position)-filterScroll.damping*speed)*h;
        position+=speed*h;dt-=h;
      }
      if(Math.abs(destination-position)<.5 && Math.abs(speed)<2) {
        window.scrollTo({top:destination,behavior:'instant'});scrollFrame=0;return;
      }
      window.scrollTo({top:position,behavior:'instant'});
      scrollFrame=requestAnimationFrame(advance);
    }
    scrollFrame=requestAnimationFrame(advance);
  }
  // Manual input takes control immediately instead of fighting the animated scroll.
  addEventListener('wheel',cancelFilterScroll,{passive:true});
  addEventListener('touchstart',cancelFilterScroll,{passive:true});
  addEventListener('pointerdown',cancelFilterScroll,{passive:true});
  addEventListener('keydown',event=>{
    if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','Escape'].includes(event.key))cancelFilterScroll();
  });
  addEventListener('resize',cancelFilterScroll);
  reduced.addEventListener('change',cancelFilterScroll);
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
    const pinFilters=keepFiltersVisible && matchMedia('(min-width:781px)').matches;
    // Filters remain readable alongside the cards; only fade at the header.
    const filterFade=clamp((filters.getBoundingClientRect().top-64)/40);
    filters.style.opacity=pinFilters?1:filterFade;
    filters.style.visibility=!pinFilters && filterFade===0?'hidden':'visible';
    filters.inert=!pinFilters && filterFade===0;
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
    // Show a 40px preview of the first row, with filters directly above it.
    const mobile=matchMedia('(max-width:780px)').matches;
    const viewportHeight=mobile && window.visualViewport ? window.visualViewport.height : innerHeight;
    const filterGap=parseFloat(getComputedStyle(filters).marginBottom);
    const cardsTop=viewportHeight-40;
    grid.closest('main').style.paddingTop=Math.max(0,cardsTop-filters.offsetHeight-filterGap)+'px';
    const gridTop=grid.getBoundingClientRect().top+scrollY;
    // Begin as the filters approach the full introduction, then compact
    // near the header rather than leaving a large empty area above the cards.
    const filterTop=gridTop-filters.offsetHeight-filterGap;
    const introBottom=top+title.offsetHeight;
    start=Math.max(0,filterTop-introBottom-config.clearance);
    end=Math.max(start+120,filterTop-120);
    update();
  }
  filters.addEventListener('click',event=>{
    const button=event.target.closest('button[data-filter]');
    if(!button)return;
    const shouldScroll=matchMedia('(min-width:781px)').matches && scrollY<=2;
    if(shouldScroll)keepFiltersVisible=true;
    const selected=button.dataset.filter;
    filters.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    grid.querySelectorAll('.pcard').forEach(card=>{
      card.hidden=selected!=='all'&&!card.dataset.categories.split(/\s+/).includes(selected);
      if(card.hidden)card.querySelectorAll('video').forEach(video=>video.pause());
    });
    measure();
    if(shouldScroll)scrollToProjects();
  });
  home.addEventListener('click',event=>{ event.preventDefault();keepFiltersVisible=false;measure();window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}); });
  addEventListener('scroll',update,{passive:true});
  addEventListener('resize',measure);
  addEventListener('pageshow',measure);
  reduced.addEventListener('change',update);
  document.fonts.ready.then(measure);
  measure();
})();

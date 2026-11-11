(() => {
  // Nearby pointer movement sends a small wave through the sentence; the name stays still.
  const sentence=document.querySelector('.v3-statement');
  if(!sentence)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const config={radius:80, amplitude:8, stiffness:120, damping:24};
  const letters=[];
  for(const node of [...sentence.childNodes]) {
    if(node.nodeType!==Node.TEXT_NODE)continue;
    const fragment=document.createDocumentFragment();
    for(const token of node.textContent.split(/(\s+)/)) {
      if(!token)continue;
      if(/^\s+$/.test(token))fragment.append(document.createTextNode(token));
      else {
        const span=document.createElement('span');
        span.className='intro-ripple-word';
        span.setAttribute('aria-label',token);
        for(const character of token) {
          const letter=document.createElement('span');
          letter.className='intro-ripple-letter';letter.textContent=character;
          letter.setAttribute('aria-hidden','true');span.append(letter);
          letters.push({span:letter,y:0,v:0,cx:0,cy:0,phase:letters.length*.55});
        }
        fragment.append(span);
      }
    }
    node.replaceWith(fragment);
  }
  let frame=0,last=0,x=-999,y=-999,geometryDirty=true;
  const allowed=()=>fine.matches&&!reduced.matches&&!document.hidden;
  function reset() {
    cancelAnimationFrame(frame);frame=0;last=0;geometryDirty=true;
    letters.forEach(letter=>{letter.y=letter.v=0;letter.span.style.transform='';});
  }
  function tick(time) {
    if(!allowed()||Number(getComputedStyle(sentence).opacity)<.95){reset();return;}
    const dt=last?Math.min((time-last)/1000,.04):1/60;last=time;
    let moving=false;
    for(const letter of letters) {
      const distance=Math.hypot(letter.cx-x,letter.cy-y);
      const influence=Math.max(0,1-distance/config.radius);
      const direction=letter.cy>=y?1:-1;
      const target=direction*config.amplitude*influence*influence;
      if(target===0 && Math.abs(letter.y)<.005 && Math.abs(letter.v)<.01) {
        if(letter.y!==0){letter.y=letter.v=0;letter.span.style.transform='';}
        continue;
      }
      let remaining=dt;
      while(remaining>0){const h=Math.min(remaining,1/120);letter.v+=(config.stiffness*(target-letter.y)-config.damping*letter.v)*h;letter.y+=letter.v*h;remaining-=h;}
      letter.span.style.transform=`translateY(${letter.y.toFixed(3)}px) rotate(${(letter.y*.75).toFixed(3)}deg)`;
      if(Math.abs(target-letter.y)>.005||Math.abs(letter.v)>.01)moving=true;
    }
    if(moving)frame=requestAnimationFrame(tick);else { frame=0;last=0; }
  }
  addEventListener('pointermove',event=>{
    if(!allowed()||event.pointerType==='touch'||Number(getComputedStyle(sentence).opacity)<.95)return;
    const rect=sentence.getBoundingClientRect();
    const nearby=event.clientX>=rect.left-config.radius&&event.clientX<=rect.right+config.radius&&event.clientY>=rect.top-config.radius&&event.clientY<=rect.bottom+config.radius;
    x=nearby?event.clientX:-999;y=nearby?event.clientY:-999;
    if(!frame) {
      if(geometryDirty) {
        letters.forEach(letter=>{
          const rect=letter.span.getBoundingClientRect();
          letter.cx=rect.left+rect.width/2;letter.cy=rect.top+rect.height/2-letter.y;
        });
        geometryDirty=false;
      }
      frame=requestAnimationFrame(tick);
    }
  },{passive:true});
  addEventListener('pointerout',event=>{
    if(!event.relatedTarget){ x=y=-999;if(!frame)frame=requestAnimationFrame(tick); }
  });
  addEventListener('scroll',()=>{ if(Number(getComputedStyle(sentence).opacity)<.95)reset(); },{passive:true});
  addEventListener('resize',reset);
  document.fonts.ready.then(reset);
  document.addEventListener('visibilitychange',reset);
  reduced.addEventListener('change',reset);
  fine.addEventListener('change',reset);
})();

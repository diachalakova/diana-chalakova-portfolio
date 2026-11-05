(() => {
 const sections=Array.from(document.querySelectorAll('.case-section'));
 const links=Array.from(document.querySelectorAll('.section-nav a'));
 const bottom=document.querySelector('.section-nav');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 function measure() {
  sections.forEach(section=>{
   const copy=section.querySelector('.case-copy');
   // Tall text scrolls naturally until its last line fits above the bottom nav.
   const top=Math.min(24,window.innerHeight-bottom.offsetHeight-copy.offsetHeight-24);
   copy.style.setProperty('--sticky-top',top+'px');
   const figures=Array.from(section.querySelectorAll('.case-media'));
   figures.forEach((figure,index)=>{
    const next=figure.nextElementSibling;
    if(!next)return;
    const note=next.classList.contains('media-note')?next:null;
    const spacer=note||figure;
    const anchor=section.id==='overview'&&index===0
      ? figure.getBoundingClientRect().top+window.scrollY
      : 24;
    const occupied=figure.offsetHeight+(note?note.offsetHeight+24:0);
    const gap=Math.max(48,window.innerHeight-bottom.offsetHeight-anchor-occupied-80);
    spacer.style.setProperty('--visual-gap',gap+'px');
   });
  });
 }
 let queued=false;
 function update() {
  queued=false;
  let active=sections[0];
  sections.forEach(section=>{if(section.getBoundingClientRect().top<=window.innerHeight*.3)active=section;});
  links.forEach(link=>{
   if(link.hash==='#'+active.id)link.setAttribute('aria-current','location');
   else link.removeAttribute('aria-current');
  });
 }
 window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});
 window.addEventListener('resize',()=>{measure();update();});
 const observer=new ResizeObserver(measure);
 sections.forEach(section=>observer.observe(section.querySelector('.case-copy')));
 observer.observe(bottom);
 document.querySelectorAll('.case-media').forEach(media=>observer.observe(media));
 measure();update();
 if(document.fonts)document.fonts.ready.then(measure);
 const videos=Array.from(document.querySelectorAll('.case-media video'));
 const visibility=new Map();
 function playback() {
  let selected=null, best=.55;
  if(!reduced.matches&&!document.hidden) {
   videos.forEach(video=>{
    const ratio=visibility.get(video)||0;
    if(ratio>=best) { selected=video; best=ratio; }
   });
  }
  videos.forEach(video=>{if(video!==selected)video.pause();});
  if(selected&&selected.paused)selected.play().catch(()=>{});
 }
 const videoObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>visibility.set(entry.target,entry.isIntersecting?entry.intersectionRatio:0));
  playback();
 },{threshold:Array.from({length:21},(_,i)=>i/20),rootMargin:'0px 0px -'+bottom.offsetHeight+'px 0px'});
 videos.forEach(video=>{
  video.removeAttribute('autoplay');video.removeAttribute('controls');video.controls=false;video.pause();videoObserver.observe(video);
  // Manual playback also stops any other video immediately.
  video.addEventListener('play',()=>videos.forEach(other=>{if(other!==video)other.pause();}));
 });
 reduced.addEventListener('change',playback);
 document.addEventListener('visibilitychange',playback);
})();

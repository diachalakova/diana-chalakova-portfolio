document.querySelectorAll('.pcard video').forEach(video=>{
 const card=video.closest('.pcard');
 const museum=video.classList.contains('mos-logo-vid');
 let hovering=false;
 function still() { if(museum&&Number.isFinite(video.duration))video.currentTime=Math.max(0,video.duration-.05); }
 if(museum) { video.loop=false; video.addEventListener('loadedmetadata',still); }
 function play() { hovering=true; if(museum)video.currentTime=0; video.play().catch(()=>{}); }
 function pause() { hovering=false; video.pause(); still(); }
 card.addEventListener('mouseenter',play);
 card.addEventListener('mouseleave',pause);
 card.addEventListener('focus',play);
 card.addEventListener('blur',pause);
});

// Retain the original Cairn galleries inside the scrolling media column.
document.querySelectorAll('.case-visuals .slideshow').forEach(gallery => {
 const slides=Array.from(gallery.querySelectorAll('.slide'));
 const caption=gallery.querySelector('.slide-cap');
 const count=gallery.querySelector('.slide-count');
 let index=0;
 function show(next) {
  index=(next+slides.length)%slides.length;
  slides.forEach((slide,i)=>{
   slide.classList.toggle('active',i===index);
   slide.setAttribute('aria-hidden',String(i!==index));
  });
  if(caption)caption.textContent=slides[index].dataset.cap||'';
  if(count)count.textContent=`${index+1} / ${slides.length}`;
 }
 if(!slides.length)return;
 const previous=gallery.querySelector('.slide-prev'),next=gallery.querySelector('.slide-next');
 if(previous)previous.addEventListener('click',()=>show(index-1));
 if(next)next.addEventListener('click',()=>show(index+1));
 show(0);
});

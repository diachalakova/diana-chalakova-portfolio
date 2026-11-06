// V1's coral circular cursor, shared across the portfolio.
(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let cursor = document.getElementById('cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.id = 'cursor';
    document.body.append(cursor);
  }
  cursor.setAttribute('aria-hidden', 'true');
  const interactive = 'a,button,input,select,textarea,[role="button"],[tabindex]';
  function hide() {
    cursor.style.opacity = '0';
    cursor.classList.remove('hover');
    document.body.classList.remove('has-cursor');
  }
  document.addEventListener('mousemove', event => {
    if (!finePointer.matches) return;
    cursor.style.left = event.clientX + 'px';
    cursor.style.top = event.clientY + 'px';
    cursor.style.opacity = '1';
    cursor.classList.toggle('hover', !!event.target.closest(interactive));
    document.body.classList.add('has-cursor');
  }, { passive: true });
  document.addEventListener('mouseover', event => {
    cursor.classList.toggle('hover', !!event.target.closest(interactive));
  });
  document.documentElement.addEventListener('mouseleave', hide);
  window.addEventListener('blur', hide);
  finePointer.addEventListener('change', hide);
  hide();
})();

(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const main = document.querySelector('main');
  const pages = ['index.html', 'shop-all.html', 'ux.html', 'creative.html', 'ai.html', 'branding.html'];
  const key = 'portfolio-navigation-motion';
  let leaving = false;
  const current = location.pathname.split('/').pop() || 'index.html';
  let arrival;
  try {
    arrival = JSON.parse(sessionStorage.getItem(key) || 'null');
    sessionStorage.removeItem(key);
  } catch (_) {}
  if (main && arrival && arrival.to === current && Date.now() - arrival.time < 10000 && !reduced.matches) {
    const frames = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const spring = i === 60 ? 0 : Math.exp(-7 * t) * Math.cos(9 * t);
      frames.push({
        transform: `translateX(${arrival.direction * 36 * spring}px)`,
        opacity: Math.min(1, t * 5),
        offset: t
      });
    }
    main.animate(frames, { duration: 650, easing: 'linear' });
  }
  document.querySelectorAll('.home-nav a').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
      const destination = new URL(link.href, location.href);
      const next = destination.pathname.split('/').pop();
      if (destination.origin !== location.origin || !pages.includes(next) || !pages.includes(current)) return;
      if (next === current && destination.search === location.search) { event.preventDefault(); return; }
      if (reduced.matches || !main || typeof main.animate !== 'function') return;
      event.preventDefault();
      if (leaving) return;
      leaving = true;
      const direction = pages.indexOf(next) > pages.indexOf(current) ? 1 : -1;
      try { sessionStorage.setItem(key, JSON.stringify({ to: next, direction, time: Date.now() })); } catch (_) {}
      const animation = main.animate([
        { transform: 'translateX(0)', opacity: 1 },
        { transform: `translateX(${-direction * 16}px)`, opacity: 0 }
      ], { duration: 130, easing: 'ease-in', fill: 'forwards' });
      animation.finished.catch(() => {}).then(() => location.assign(destination.href));
    });
  });
  // Restore the outgoing page when returning through the browser's back/forward cache.
  window.addEventListener('pageshow', event => {
    if (event.persisted && main) { main.getAnimations().forEach(animation => animation.cancel()); leaving = false; }
  });
})();

// Nearby navigation links attract the pointer visually, with a damped return.
(() => {
  const nav = document.querySelector('.home-nav');
  if (!nav) return;
  const allowed = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const items = Array.from(nav.querySelectorAll('a')).map(element => ({ element, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }));
  let frame = 0, previous = 0;
  function tick(time) {
    const dt = previous ? Math.min((time - previous) / 1000, .032) : 1 / 60;
    previous = time;
    let moving = false;
    items.forEach(item => {
      item.vx += ((item.tx - item.x) * 240 - item.vx * 24) * dt;
      item.vy += ((item.ty - item.y) * 240 - item.vy * 24) * dt;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      if (Math.abs(item.tx - item.x) + Math.abs(item.ty - item.y) + Math.abs(item.vx) + Math.abs(item.vy) > .03) moving = true;
      else { item.x = item.tx; item.y = item.ty; item.vx = item.vy = 0; }
      item.element.style.transform = `translate(${item.x}px, ${item.y}px)`;
    });
    frame = moving ? requestAnimationFrame(tick) : 0;
    if (!moving) previous = 0;
  }
  function wake() { if (!frame) frame = requestAnimationFrame(tick); }
  function reset() {
    items.forEach(item => { item.tx = item.ty = 0; item.element.classList.remove('is-magnetic'); });
    wake();
  }
  document.addEventListener('pointermove', event => {
    if (!allowed.matches || event.pointerType !== 'mouse') return;
    let nearest = null, closest = 25;
    items.forEach(item => {
      const rect = item.element.getBoundingClientRect();
      const left = rect.left - item.x, top = rect.top - item.y;
      const dx = event.clientX - (left + rect.width / 2);
      const dy = event.clientY - (top + rect.height / 2);
      const distance = Math.hypot(Math.max(Math.abs(dx) - rect.width / 2, 0), Math.max(Math.abs(dy) - rect.height / 2, 0));
      item.tx = item.ty = 0;
      item.element.classList.remove('is-magnetic');
      if (distance < closest) { closest = distance; nearest = { item, dx, dy }; }
    });
    if (nearest) {
      nearest.item.tx = Math.max(-9, Math.min(9, nearest.dx * .2));
      nearest.item.ty = Math.max(-7, Math.min(7, nearest.dy * .25));
      nearest.item.element.classList.add('is-magnetic');
    }
    wake();
  }, { passive: true });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) reset(); });
  window.addEventListener('blur', reset);
  window.addEventListener('scroll', reset, { passive: true });
  allowed.addEventListener('change', () => {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    items.forEach(item => {
      item.x = item.y = item.vx = item.vy = item.tx = item.ty = 0;
      item.element.style.transform = '';
      item.element.classList.remove('is-magnetic');
    });
  });
})();

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

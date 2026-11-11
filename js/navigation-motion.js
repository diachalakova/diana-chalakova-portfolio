(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let main = document.querySelector('main');
  const pages = ['index.html', 'shop-all.html', 'ux.html', 'ai.html', 'branding.html'];
  const categories = pages.filter(page => page !== 'index.html');
  // Category lists depart in navigation order; the incoming list settles on a spring.
  const swipe = { exitMs: 220, enterMs: 720, damping: 8, frequency: 9, exitFraction: .35 };
  const key = 'portfolio-navigation-motion';
  let leaving = false;
  let current = location.pathname.split('/').pop() || 'index.html';
  let arrival;
  try {
    arrival = JSON.parse(sessionStorage.getItem(key) || 'null');
    sessionStorage.removeItem(key);
  } catch (_) {}
  if (main && arrival && arrival.to === current && Date.now() - arrival.time < 10000 && !reduced.matches && typeof main.animate === 'function') {
    const categorySwipe = arrival.kind === 'category' && categories.includes(current) && categories.includes(arrival.from);
    const distance = categorySwipe ? document.documentElement.clientWidth : 36;
    const frames = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const spring = i === 60 ? 0 : Math.exp(-(categorySwipe ? swipe.damping : 7) * t) * Math.cos((categorySwipe ? swipe.frequency : 9) * t);
      frames.push({
        transform: `translateX(${arrival.direction * distance * spring}px)`,
        opacity: Math.min(1, t * 5),
        offset: t
      });
    }
    main.animate(frames, { duration: categorySwipe ? swipe.enterMs : 650, easing: 'linear' });
  }
  // Keep the current document painted while the next list and its leading images load.
  // Both lists then move together, with no opacity fade or blank navigation frame.
  async function switchCategory(destination, next) {
    let outgoing;
    try {
      const response = await fetch(destination.href, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Category unavailable');
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      // Category swaps retain the document; refresh a revised shared stylesheet too.
      const nextStyles = page.querySelector('link[href*="styles/project-grid.css"]');
      const currentStyles = document.querySelector('link[href*="styles/project-grid.css"]');
      if (nextStyles && currentStyles && nextStyles.getAttribute('href') !== currentStyles.getAttribute('href')) {
        currentStyles.setAttribute('href', nextStyles.getAttribute('href'));
      }
      const incoming = page.querySelector('main.work-page');
      if (!incoming) throw new Error('Category layout unavailable');
      await Promise.all(Array.from(incoming.querySelectorAll('img')).slice(0, 4).map(img => {
        img.loading = 'eager';
        return Promise.race([img.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 2000))]);
      }));
      const direction = categories.indexOf(next) > categories.indexOf(current) ? 1 : -1;
      window.scrollTo({ top: 0, behavior: 'instant' });
      const rect = main.getBoundingClientRect();
      outgoing = main;
      outgoing.replaceWith(incoming);
      Object.assign(outgoing.style, {
        position: 'fixed', top: rect.top + 'px', left: rect.left + 'px',
        width: rect.width + 'px', margin: '0', zIndex: '10',
        background: '#fff', pointerEvents: 'none'
      });
      outgoing.inert = true;
      outgoing.setAttribute('aria-hidden', 'true');
      document.body.append(outgoing);
      main = incoming;
      main.style.background = '#fff';
      document.title = page.title;
      history.pushState({ category: next }, '', destination.href);
      current = next;
      document.querySelectorAll('.home-nav .filters > a').forEach(link => {
        if (new URL(link.href).pathname === destination.pathname) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      document.dispatchEvent(new Event('portfolio:category-ready'));
      if (!reduced.matches) {
        const incomingFrames = [], outgoingFrames = [];
        const width = document.documentElement.clientWidth;
        for (let i = 0; i <= 60; i++) {
          const t = i / 60;
          const spring = i === 60 ? 0 : Math.exp(-swipe.damping * t) * Math.cos(swipe.frequency * t);
          incomingFrames.push({ transform: `translateX(${direction * width * spring}px)`, offset: t });
          outgoingFrames.push({ transform: `translateX(${direction * width * (spring - 1)}px)`, offset: t });
        }
        const options = { duration: swipe.enterMs, easing: 'linear', fill: 'both' };
        const enter = main.animate(incomingFrames, options);
        const exit = outgoing.animate(outgoingFrames, options);
        await Promise.all([enter.finished, exit.finished]);
        enter.cancel();
      }
      outgoing.remove();
      leaving = false;
    } catch (_) {
      if (outgoing) outgoing.remove();
      location.assign(destination.href);
    }
  }
  // Browser Back/Forward restores the URL's complete static page.
  window.addEventListener('popstate', () => location.reload());
  document.querySelectorAll('.home-nav a').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
      const destination = new URL(link.href, location.href);
      const next = destination.pathname.split('/').pop();
      if (destination.origin !== location.origin || !pages.includes(next) || !pages.includes(current)) return;
      if (next === current) { event.preventDefault(); return; }
      if (reduced.matches || !main || typeof main.animate !== 'function') return;
      event.preventDefault();
      if (leaving) return;
      leaving = true;
      if (categories.includes(current) && categories.includes(next)) {
        switchCategory(destination, next);
        return;
      }
      const direction = pages.indexOf(next) > pages.indexOf(current) ? 1 : -1;
      const categorySwipe = categories.includes(current) && categories.includes(next);
      const distance = categorySwipe ? document.documentElement.clientWidth * swipe.exitFraction : 16;
      try { sessionStorage.setItem(key, JSON.stringify({ from: current, to: next, kind: categorySwipe ? 'category' : 'page', direction, time: Date.now() })); } catch (_) {}
      const animation = main.animate([
        { transform: 'translateX(0)', opacity: 1 },
        { transform: `translateX(${-direction * distance}px)`, opacity: 0 }
      ], { duration: categorySwipe ? swipe.exitMs : 130, easing: categorySwipe ? 'cubic-bezier(.55,0,.85,.45)' : 'ease-in', fill: 'forwards' });
      animation.finished.catch(() => {}).then(() => location.assign(destination.href));
    });
  });
  // Restore the outgoing page when returning through the browser's back/forward cache.
  window.addEventListener('pageshow', event => {
    if (event.persisted && main) { main.getAnimations().forEach(animation => animation.cancel()); leaving = false; }
  });
})();

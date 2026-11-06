(() => {
  const back = document.querySelector('.cs-side .back');
  if (!back) return;

  const categories = {
    'shop-all.html': 'All Work',
    'ux.html': 'UX',
    'creative.html': 'Creative',
    'ai.html': 'AI',
    'branding.html': 'Branding'
  };
  // Use this visit's source, so a previously visited category cannot affect direct visits.
  back.setAttribute('aria-label', 'Back to home');
  const from = new URL(location.href).searchParams.get('from');
  if (Object.prototype.hasOwnProperty.call(categories, from)) {
    back.href = new URL('../' + from, location.href).href;
    back.setAttribute('aria-label', 'Back to ' + categories[from]);
    return;
  }
  if (!document.referrer) return;
  try {
    const source = new URL(document.referrer);
    for (const [page, label] of Object.entries(categories)) {
      const category = new URL('../' + page, location.href);
      if (source.origin === category.origin && source.pathname === category.pathname) {
        back.href = source.href;
        back.setAttribute('aria-label', 'Back to ' + label);
        break;
      }
    }
  } catch (_) {
    // Keep the existing home link when the source is unavailable or invalid.
  }
})();

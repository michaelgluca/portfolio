// Runs before first paint so the resolved theme doesn't flash.
// Dark is the site's design; a saved choice of light overrides it.
(function () {
  var theme = 'dark';
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch (e) {}
  document.documentElement.dataset.theme = theme;
  var scheme = document.querySelector('meta[name="color-scheme"]');
  if (scheme) scheme.content = theme === 'light' ? 'light dark' : 'dark light';
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'light' ? '#ffffff' : '#0e1116';
})();

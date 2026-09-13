// Runs before first paint so the resolved theme doesn't flash.
// Order: saved choice → OS preference → dark.
(function () {
  var theme = 'dark';
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
    else if (window.matchMedia('(prefers-color-scheme: light)').matches) theme = 'light';
  } catch (e) {}
  document.documentElement.dataset.theme = theme;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'light' ? '#ffffff' : '#1c2229';
})();

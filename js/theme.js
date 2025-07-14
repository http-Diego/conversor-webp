// Controle de tema claro/escuro com persistência no localStorage
(function() {
  const switcher = document.getElementById('switcher');
  const htmlEl = document.documentElement;
  const moonMaskCircle = document.getElementById('moon-mask-circle');

  function setThemeBySwitch(checked) {
    htmlEl.setAttribute('data-theme', checked ? 'dark' : 'light');
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  }

  // Estado inicial: localStorage > sistema
  let savedTheme = localStorage.getItem('theme');
  let isDark = savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (switcher) switcher.checked = isDark;
  setThemeBySwitch(isDark);

  if (switcher) {
    switcher.addEventListener('change', () => {
      setThemeBySwitch(switcher.checked);
      animateMoonMask(switcher.checked);
    });
  }

  // Sun-moon mask animation para meia lua visível
  function animateMoonMask(toDark) {
    if (!moonMaskCircle) return;
    const start = parseFloat(moonMaskCircle.getAttribute('cx'));
    const end = toDark ? 17 : 24; // 17 = meia lua visível, 24 = sol
    const duration = 400;
    const startTime = performance.now();
    function animate(time) {
      const t = Math.min((time - startTime) / duration, 1);
      const value = start + (end - start) * t;
      moonMaskCircle.setAttribute('cx', value);
      if (t < 1) requestAnimationFrame(animate);
      else moonMaskCircle.setAttribute('cx', end);
    }
    requestAnimationFrame(animate);
  }
  if (moonMaskCircle && switcher) {
    moonMaskCircle.setAttribute('cx', switcher.checked ? 17 : 24);
  }
})();

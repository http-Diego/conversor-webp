// Menu dinâmico reutilizável para todas as páginas
// Chame renderMenu({ ...opções }) para inserir o menu no elemento com id 'main-menu-container'

function renderMenu(options = {}) {
  // Opções de exibição
  const {
    showConversor = true,
    showMeusArquivos = false,
    showSobre = true,
    showLogin = true,
    showLogout = false,
    userName = '',
    userPhoto = '',
    onLogin = null,
    onLogout = null
  } = options;

  const menuHtml = `
    <nav class="main-nav">
      <div class="nav-content">
        <div class="logo-area">
          <a href="index.html">
            <img src="https://www.teamkeepup.com.br/wp-content/uploads/2025/05/logo-teamkeepup@512x.png" alt="Logo TeamKeepUp" class="logo-img logo-light" />
            <img src="https://www.teamkeepup.com.br/wp-content/uploads/2025/05/logo-teamkeepup-Light.png" alt="Logo TeamKeepUp" class="logo-img logo-dark" />
          </a>
        </div>
        <div class="nav-icons">
          <div class="theme-toggle" id="theme-toggle">
            <input type="checkbox" id="switcher" class="check" aria-label="Alternar tema">
            <label for="switcher" class="theme-switch-label">
              <svg class="sun-and-moon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
                <mask class="moon" id="moon-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white"></rect>
                  <circle id="moon-mask-circle" cx="24" cy="10" r="7" fill="black"></circle>
                </mask>
                <circle class="sun" cx="12" cy="12" r="6" mask="url(#moon-mask)" fill="currentColor"></circle>
                <g class="sun-beams" stroke="currentColor">
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </g>
              </svg>
            </label>
          </div>
        </div>
        <ul class="nav-links" id="nav-links">
          ${showConversor ? '<li><a href="index.html">Conversor</a></li>' : ''}
          ${showMeusArquivos ? '<li><a href="meus-arquivos.html">Meus Arquivos</a></li>' : ''}
          ${showSobre ? '<li><a href="sobre.html">Sobre</a></li>' : ''}
        </ul>
        <div class="nav-actions">
          ${showLogin ? '<button id="login-btn-menu" class="login-btn">Entrar com Google</button>' : ''}
          ${showLogout ? `<div class="user-info"><img src="${userPhoto || 'assets/default-avatar.png'}" class="user-photo" alt="Foto do usuário"><span>${userName}</span><button id="logout-btn-menu" class="logout-btn">Sair</button></div>` : ''}
        </div>
      </div>
    </nav>
  `;

  const container = document.getElementById('main-menu-container');
  if (container) {
    container.innerHTML = menuHtml;
    // Controle de tema claro/escuro
    const switcher = document.getElementById('switcher');
    const htmlEl = document.documentElement;
    if (switcher) {
      // Estado inicial pelo sistema
      let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      switcher.checked = isDark;
      setThemeBySwitch(isDark);
      switcher.addEventListener('change', () => {
        setThemeBySwitch(switcher.checked);
        animateMoonMask(switcher.checked);
      });
      // Estado inicial sun-moon
      const moonMaskCircle = document.getElementById('moon-mask-circle');
      if (moonMaskCircle) moonMaskCircle.setAttribute('cx', switcher.checked ? 17 : 24);
    }
    function setThemeBySwitch(checked) {
      htmlEl.setAttribute('data-theme', checked ? 'dark' : 'light');
    }
    function animateMoonMask(toDark) {
      const moonMaskCircle = document.getElementById('moon-mask-circle');
      if (!moonMaskCircle) return;
      const start = parseFloat(moonMaskCircle.getAttribute('cx'));
      const end = toDark ? 17 : 24;
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
    // Login/Logout handlers
    if (showLogin && typeof onLogin === 'function') {
      const btn = document.getElementById('login-btn-menu');
      if (btn) btn.onclick = onLogin;
    }
    if (showLogout && typeof onLogout === 'function') {
      const btn = document.getElementById('logout-btn-menu');
      if (btn) btn.onclick = onLogout;
    }
  }
}

// Exemplo de uso:
// renderMenu({ showMeusArquivos: true, showLogout: true, userName: 'Diego', userPhoto: 'url', onLogout: () => alert('logout') });

window.renderMenu = renderMenu;

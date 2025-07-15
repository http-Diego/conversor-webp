// Gerenciamento de Autenticação Firebase

class AuthManager {
  constructor() {
    this.auth = window.firebaseAuth;
    this.googleProvider = window.googleProvider;
    this.currentUser = null;
    this.init();
  }

  init() {
    // Observar mudanças no estado de autenticação
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.updateUI(user);
    });

    // Adicionar event listeners aos botões
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Botões de login
    const loginBtns = document.querySelectorAll('#login-btn, #login-btn-desktop');
    loginBtns.forEach(btn => {
      btn.addEventListener('click', () => this.signInWithGoogle());
    });

    // Botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.signOut());
    }
  }

  async signInWithGoogle() {
    try {
      // Mostrar loading
      this.showLoading(true);
      
      // Fazer login com Google
      const result = await this.auth.signInWithPopup(this.googleProvider);
      
      console.log('Login realizado com sucesso:', result.user.displayName);
      
    } catch (error) {
      console.error('Erro no login:', error);
      this.showError('Erro ao fazer login. Tente novamente.');
    } finally {
      this.showLoading(false);
    }
  }

  async signOut() {
    try {
      await this.auth.signOut();
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
      this.showError('Erro ao fazer logout. Tente novamente.');
    }
  }

  updateUI(user) {
    const userInfo = document.getElementById('user-info');
    const userPhoto = document.getElementById('user-photo');
    const userName = document.getElementById('user-name');
    const loginBtns = document.querySelectorAll('#login-btn, #login-btn-desktop');
    const userImagesPanel = document.getElementById('user-files-panel');

    if (user) {
      // Usuário logado
      console.log('Usuário logado:', user.displayName);

      // Mostrar informações do usuário
      userInfo.classList.remove('hidden');
      userPhoto.src = user.photoURL || 'assets/default-avatar.png';
      if (userName) userName.textContent = user.displayName || user.email;

      // Ocultar botões de login
      loginBtns.forEach(btn => btn.classList.add('hidden'));

      // Mostrar painel de imagens do usuário
      if (userImagesPanel) {
        userImagesPanel.classList.remove('hidden');
        this.loadUserImages();
      }

    } else {
      // Usuário não logado
      console.log('Usuário não logado');

      // Ocultar informações do usuário
      userInfo.classList.add('hidden');

      // Mostrar botões de login
      loginBtns.forEach(btn => btn.classList.remove('hidden'));

      // Ocultar painel de imagens do usuário
      if (userImagesPanel) {
        userImagesPanel.classList.add('hidden');
      }
    }
  }

  showLoading(show) {
    const loginBtns = document.querySelectorAll('#login-btn, #login-btn-desktop');
    loginBtns.forEach(btn => {
      if (show) {
        btn.textContent = 'Carregando...';
        btn.disabled = true;
      } else {
        btn.textContent = 'Entrar com Google';
        btn.disabled = false;
      }
    });
  }

  showError(message) {
    // Criar notificação de erro
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  async loadUserImages() {
    if (!this.currentUser) return;
    
    try {
      const images = await window.storageManager.getUserImages(this.currentUser.uid);
      this.displayUserImages(images);
      
      // Mostrar estatísticas
      const stats = await window.storageManager.getStorageStats(this.currentUser.uid);
      this.displayStorageStats(stats);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    }
  }

  displayUserImages(images) {
    const userImagesList = document.getElementById('user-files-list');
    if (!userImagesList) return;

    if (images.length === 0) {
      userImagesList.innerHTML = `
        <div class="no-images">
          <span class="empty-icon">📁</span>
          <p>Nenhum arquivo convertido ainda.</p>
          <small>Converta um arquivo para WebP para vê-lo aqui!<br>Otimize seu site e economize espaço agora mesmo 🚀</small>
        </div>
      `;
      return;
    }

    userImagesList.innerHTML = images.map(image => `
      <div class="user-image-card" data-image-id="${image.id}">
        <img src="${image.webpImageBase64 || URL.createObjectURL(image.webpImage)}" 
             alt="${image.originalName}" 
             onclick="window.authManager.showImageDetails('${image.id}')" />
        <div class="card-actions">
          <button onclick="window.authManager.downloadImage('${image.id}')" class="download-btn">
            📥 Baixar
          </button>
          <button onclick="window.authManager.deleteImage('${image.id}')" class="delete-btn">
            🗑️ Excluir
          </button>
        </div>
        <div class="image-info">
          <span>${image.originalName}</span>
          <small>${(image.webpSize / 1024).toFixed(1)} KB (${image.quality * 100}% qualidade)</small>
        </div>
      </div>
    `).join('');
  }

  displayStorageStats(stats) {
    const userImagesPanel = document.getElementById('user-files-panel');
    if (!userImagesPanel) return;

    const statsElement = userImagesPanel.querySelector('.storage-stats');
    if (statsElement) {
      statsElement.innerHTML = `
        <div class="stats-grid">
          <div class="stat-item">
            <strong>${stats.imageCount}</strong>
            <span>Imagens</span>
          </div>
          <div class="stat-item">
            <strong>${(stats.totalSize / 1024).toFixed(1)} KB</strong>
            <span>Espaço usado</span>
          </div>
          <div class="stat-item">
            <strong>${stats.savedPercentage}%</strong>
            <span>Espaço economizado</span>
          </div>
        </div>
      `;
    }
  }

  async downloadImage(imageId) {
    try {
      const images = await window.storageManager.getUserImages(this.currentUser.uid);
      const image = images.find(img => img.id === imageId);
      
      if (!image) {
        this.showError('Imagem não encontrada');
        return;
      }

      const blob = await window.storageManager.getImageBlob(image);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.originalName.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showSuccess('Download iniciado!');
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
      this.showError('Erro ao baixar imagem');
    }
  }

  async deleteImage(imageId) {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      await window.storageManager.deleteImage(imageId);
      this.showSuccess('Imagem excluída com sucesso!');
      this.loadUserImages(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      this.showError('Erro ao excluir imagem');
    }
  }

  showImageDetails(imageId) {
    // Implementar modal com detalhes da imagem
    console.log('Mostrar detalhes da imagem:', imageId);
  }

  showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  // Verificar se o usuário está logado
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Obter usuário atual
  getCurrentUser() {
    return this.currentUser;
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Aguardar o Firebase estar carregado
  if (typeof firebase !== 'undefined') {
    window.authManager = new AuthManager();
  } else {
    console.error('Firebase não está carregado');
  }
}); 
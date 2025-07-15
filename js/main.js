// Modal de Login - TeamKeepUp
document.addEventListener('DOMContentLoaded', function() {
  const loginTrigger = document.getElementById('login-trigger');
  const loginModal = document.getElementById('login-modal');
  const loginOverlay = document.getElementById('login-modal-overlay');
  const closeModal = document.getElementById('close-modal');

  function openLoginModal() {
    loginModal.classList.remove('hidden');
    loginOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeLoginModal() {
    loginModal.classList.add('hidden');
    loginOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
  loginTrigger.addEventListener('click', openLoginModal);
  closeModal.addEventListener('click', closeLoginModal);
  loginOverlay.addEventListener('click', closeLoginModal);
  document.addEventListener('keydown', function(e) {
    if (!loginModal.classList.contains('hidden') && e.key === 'Escape') closeLoginModal();
  });

  // Ação do botão Google no modal
  const loginGoogleBtn = document.getElementById('login-google');
  if (loginGoogleBtn) {
    loginGoogleBtn.addEventListener('click', function() {
      if (window.firebase && window.firebase.auth) {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        window.firebase.auth().signInWithPopup(provider)
          .then(result => {
            closeLoginModal();
            // Dispara evento customizado para integração com outros scripts
            const user = result.user;
            const event = new CustomEvent('googleLoginSuccess', { detail: { user } });
            window.dispatchEvent(event);
            // Opcional: mostrar notificação de sucesso
          })
          .catch(error => {
            // Dispara evento de erro para integração
            const event = new CustomEvent('googleLoginError', { detail: { error } });
            window.dispatchEvent(event);
            alert('Erro ao autenticar com Google: ' + error.message);
          });
      } else {
        alert('Firebase Auth não está disponível.');
      }
    });
  }
});
// Seletores principais
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const selectBtn = document.getElementById('select-btn');
const dropMessage = document.getElementById('drop-message');
const preview = document.getElementById('preview');
const previewImg = document.getElementById('preview-img');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const convertBtn = document.getElementById('convert-btn');
const progress = document.getElementById('progress');
const progressBar = document.getElementById('progress-bar');
const download = document.getElementById('download');
const downloadLink = document.getElementById('download-link');
const resetBtn = document.getElementById('reset-btn');
const qualityControl = document.getElementById('quality-control');
const qualitySlider = document.getElementById('quality-slider');
const qualityValue = document.getElementById('quality-value');
const compressionResult = document.getElementById('compression-result');
const qualityPredict = document.getElementById('quality-predict');

let selectedFile = null;

// Drag & Drop
['dragenter', 'dragover'].forEach(evt => {
  uploadArea.addEventListener(evt, e => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('dragover');
  });
});
['dragleave', 'drop'].forEach(evt => {
  uploadArea.addEventListener(evt, e => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragover');
  });
});
uploadArea.addEventListener('drop', e => {
  const files = e.dataTransfer.files;
  if (files && files[0]) handleFile(files[0]);
});

// Botão de seleção
selectBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => {
  if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
    showError('Por favor, selecione uma imagem JPG ou PNG.');
    return;
  }
  selectedFile = file;
  previewImg.src = URL.createObjectURL(file);
  fileName.textContent = file.name;
  fileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';
  dropMessage.classList.add('hidden');
  preview.classList.remove('hidden');
  progress.classList.add('hidden');
  download.classList.add('hidden');
  qualityControl.style.display = '';
  compressionResult.classList.add('hidden');
  // Resetar previsão
  updateQualityPredict();
}

function showError(msg) {
  dropMessage.innerHTML = `<span style="color:#d32f2f">${msg}</span>`;
  setTimeout(() => {
    dropMessage.innerHTML = `<svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="12" fill="#FFA726"/><path d="M24 14v14m0 0l-6-6m6 6l6-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Arraste sua imagem aqui ou <button type='button' id='select-btn'>selecione um arquivo</button></span>`;
    document.getElementById('select-btn').addEventListener('click', () => fileInput.click());
  }, 2200);
}

qualitySlider.addEventListener('input', () => {
  qualityValue.textContent = qualitySlider.value;
  updateQualityPredict();
});

function updateQualityPredict() {
  if (!selectedFile) {
    qualityPredict.textContent = '';
    return;
  }
  const q = parseInt(qualitySlider.value, 10);
  const originalSize = selectedFile.size;
  // Estimativa baseada em qualidade: 100 = ~95% do original, 90 = ~80%, 80 = ~65%, 70 = ~50%, 50 = ~35%, 30 = ~20%, 10 = ~10%
  let factor = 1;
  if (q >= 95) factor = 0.95;
  else if (q >= 90) factor = 0.8;
  else if (q >= 80) factor = 0.65;
  else if (q >= 70) factor = 0.5;
  else if (q >= 50) factor = 0.35;
  else if (q >= 30) factor = 0.2;
  else factor = 0.1;
  const estimatedSize = (originalSize * factor) / 1024;
  qualityPredict.textContent = `Tamanho estimado: ~${estimatedSize.toFixed(1)} KB`;
}

convertBtn.addEventListener('click', () => {
  if (!selectedFile) return;
  preview.classList.add('hidden');
  progress.classList.remove('hidden');
  progressBar.style.width = '0%';
  qualityControl.style.display = 'none';
  // Simula progresso
  let prog = 0;
  const fakeProgress = setInterval(() => {
    prog += Math.random() * 30;
    if (prog >= 100) {
      prog = 100;
      clearInterval(fakeProgress);
      convertToWebP(selectedFile, parseInt(qualitySlider.value, 10) / 100);
    }
    progressBar.style.width = prog + '%';
  }, 180);
});

function convertToWebP(file, quality = 0.92) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(async blob => {
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        progress.classList.add('hidden');
        download.classList.remove('hidden');
        
        // Mostrar resultado da compressão
        const originalSize = file.size;
        const newSize = blob.size;
        const percent = ((1 - newSize / originalSize) * 100).toFixed(1);
        compressionResult.innerHTML = `Tamanho original: ${(originalSize/1024).toFixed(1)} KB<br>Tamanho WebP: ${(newSize/1024).toFixed(1)} KB<br>Redução: ${percent}%`;
        compressionResult.classList.remove('hidden');

        // Salvar automaticamente se o usuário estiver logado
        if (window.authManager && window.authManager.isLoggedIn()) {
          try {
            const user = window.authManager.getCurrentUser();
            await window.storageManager.saveImage(
              user.uid, 
              file, 
              file.name, 
              blob, 
              quality
            );
            
            // Atualizar painel de imagens do usuário
            window.authManager.loadUserImages();
            
            // Mostrar notificação de sucesso
            showSuccessNotification('Imagem salva automaticamente!');
          } catch (error) {
            console.error('Erro ao salvar imagem:', error);
            showErrorNotification('Erro ao salvar imagem');
          }
        }
      }, 'image/webp', quality);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function showSuccessNotification(message) {
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
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

function showErrorNotification(message) {
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
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

resetBtn.addEventListener('click', () => {
  selectedFile = null;
  fileInput.value = '';
  previewImg.src = '';
  fileName.textContent = '';
  fileSize.textContent = '';
  dropMessage.classList.remove('hidden');
  preview.classList.add('hidden');
  progress.classList.add('hidden');
  download.classList.add('hidden');
  qualityControl.style.display = 'none';
  compressionResult.classList.add('hidden');
  qualityPredict.textContent = '';
}); 

// Menu mobile toggle
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
const menuOverlay = document.getElementById('menu-overlay');
const menuIcon = document.getElementById('menu-icon');
const navActions = document.querySelector('.nav-actions');

function isMobile() {
  return window.innerWidth <= 900;
}

function moveNavActionsToMenu(open) {
  if (!navActions) return;
  if (open && isMobile()) {
    if (!navLinks.contains(navActions)) {
      navLinks.appendChild(navActions);
    }
  } else {
    const navContent = document.querySelector('.nav-content');
    if (navContent && !navContent.contains(navActions)) {
      navContent.appendChild(navActions);
    }
  }
}

// Garante que o menu começa fechado
navLinks.classList.remove('open');
menuOverlay.classList.remove('open');
menuToggle.classList.remove('open');
menuIcon.textContent = '☰';
moveNavActionsToMenu(false);

menuToggle.addEventListener('click', () => {
  const isOpen = !navLinks.classList.contains('open');
  navLinks.classList.toggle('open');
  menuOverlay.classList.toggle('open');
  menuToggle.classList.toggle('open');
  menuIcon.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  moveNavActionsToMenu(isOpen);
});

menuOverlay.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuOverlay.classList.remove('open');
  menuToggle.classList.remove('open');
  menuIcon.textContent = '☰';
  moveNavActionsToMenu(false);
});

// Fecha menu ao clicar em um link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuOverlay.classList.remove('open');
    menuToggle.classList.remove('open');
    menuIcon.textContent = '☰';
    moveNavActionsToMenu(false);
  });
});

window.addEventListener('resize', () => {
  // Garante que nav-actions volta ao topo ao redimensionar para desktop
  if (!isMobile()) {
    moveNavActionsToMenu(false);
  }
}); 
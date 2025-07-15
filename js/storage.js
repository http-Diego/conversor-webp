// Sistema de Armazenamento Local (substitui Firebase Storage)
// Usa IndexedDB para armazenar imagens no navegador do usuário

class LocalStorageManager {
  constructor() {
    this.dbName = 'WebPConverterDB';
    this.dbVersion = 1;
    this.storeName = 'userImages';
    this.maxImages = 15; // Limite de 15 imagens por usuário
    this.init();
  }

  async init() {
    try {
      this.db = await this.openDB();
      console.log('IndexedDB inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar IndexedDB:', error);
      this.fallbackToLocalStorage();
    }
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Criar object store se não existir
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  fallbackToLocalStorage() {
    console.log('Usando LocalStorage como fallback');
    this.useLocalStorage = true;
  }

  // Gerar ID único para a imagem
  generateId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Salvar imagem
  async saveImage(userId, imageBlob, originalName, webpBlob, quality) {
    try {
      const imageData = {
        id: this.generateId(),
        userId: userId,
        originalName: originalName,
        originalSize: imageBlob.size,
        webpSize: webpBlob.size,
        quality: quality,
        timestamp: Date.now(),
        originalImage: imageBlob,
        webpImage: webpBlob
      };

      if (this.useLocalStorage) {
        return this.saveToLocalStorage(userId, imageData);
      } else {
        return this.saveToIndexedDB(imageData);
      }
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      throw error;
    }
  }

  async saveToIndexedDB(imageData) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Verificar limite de imagens
      this.getUserImages(imageData.userId).then(images => {
        if (images.length >= this.maxImages) {
          // Remover imagem mais antiga
          const oldestImage = images.sort((a, b) => a.timestamp - b.timestamp)[0];
          this.deleteImage(oldestImage.id);
        }

        const request = store.add(imageData);
        request.onsuccess = () => resolve(imageData);
        request.onerror = () => reject(request.error);
      });
    });
  }

  saveToLocalStorage(userId, imageData) {
    return new Promise((resolve, reject) => {
      try {
        const key = `webp_images_${userId}`;
        let images = JSON.parse(localStorage.getItem(key) || '[]');

        // Verificar limite
        if (images.length >= this.maxImages) {
          // Remover imagem mais antiga
          images.sort((a, b) => a.timestamp - b.timestamp);
          images.shift();
        }

        // Converter blobs para base64
        const reader1 = new FileReader();
        const reader2 = new FileReader();

        reader1.onload = () => {
          imageData.originalImageBase64 = reader1.result;
          reader2.onload = () => {
            imageData.webpImageBase64 = reader2.result;
            images.push(imageData);
            localStorage.setItem(key, JSON.stringify(images));
            resolve(imageData);
          };
          reader2.readAsDataURL(imageData.webpImage);
        };
        reader1.readAsDataURL(imageData.originalImage);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Buscar imagens do usuário
  async getUserImages(userId) {
    try {
      if (this.useLocalStorage) {
        return this.getFromLocalStorage(userId);
      } else {
        return this.getFromIndexedDB(userId);
      }
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      return [];
    }
  }

  async getFromIndexedDB(userId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const images = request.result.sort((a, b) => b.timestamp - a.timestamp);
    console.log('Imagens recuperadas do IndexedDB:', images);
        resolve(images);
      };
      request.onerror = () => reject(request.error);
    });
  }

  getFromLocalStorage(userId) {
    return new Promise((resolve) => {
      try {
        const key = `webp_images_${userId}`;
        const images = JSON.parse(localStorage.getItem(key) || '[]');
    console.log('Imagens recuperadas do LocalStorage:', images);
        resolve(images.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Erro ao ler do LocalStorage:', error);
        resolve([]);
      }
    });
  }

  // Deletar imagem
  async deleteImage(imageId) {
    try {
      if (this.useLocalStorage) {
        return this.deleteFromLocalStorage(imageId);
      } else {
        return this.deleteFromIndexedDB(imageId);
      }
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      throw error;
    }
  }

  async deleteFromIndexedDB(imageId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(imageId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  deleteFromLocalStorage(imageId) {
    return new Promise((resolve) => {
      try {
        const userId = window.authManager.currentUser?.uid; // Obtenha o ID do usuário logado
        if (!userId) return resolve(); // Se não houver usuário logado, não há nada a deletar
        const key = `webp_images_${userId}`;
        let images = JSON.parse(localStorage.getItem(key) || '[]');
        images = images.filter(img => img.id !== imageId);
        localStorage.setItem(key, JSON.stringify(images));
        resolve();
      } catch (error) {
        console.error('Erro ao deletar do LocalStorage:', error);
        resolve();
      }
    });
  }

  // Converter base64 para blob
  base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // Obter blob da imagem (para download)
  async getImageBlob(imageData) {
    if (this.useLocalStorage) {
      return this.base64ToBlob(imageData.webpImageBase64, 'image/webp');
    } else {
      return imageData.webpImage;
    }
  }

  // Obter estatísticas de armazenamento
  async getStorageStats(userId) {
    const images = await this.getUserImages(userId);
    const totalSize = images.reduce((sum, img) => sum + img.webpSize, 0);
    const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
    
    return {
      imageCount: images.length,
      totalSize: totalSize,
      totalOriginalSize: totalOriginalSize,
      savedSpace: totalOriginalSize - totalSize,
      savedPercentage: totalOriginalSize > 0 ? ((totalOriginalSize - totalSize) / totalOriginalSize * 100).toFixed(1) : 0
    };
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.storageManager = new LocalStorageManager();
}); 
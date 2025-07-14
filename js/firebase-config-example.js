// EXEMPLO de configuração do Firebase
// Copie este arquivo para firebase-config.js e substitua pelos seus valores reais

const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz",
  authDomain: "meu-projeto-webp.firebaseapp.com",
  projectId: "meu-projeto-webp",
  storageBucket: "meu-projeto-webp.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar serviços
const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();

// Configurar provedor do Google
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Exportar para uso em outros arquivos
window.firebaseAuth = auth;
window.firebaseStorage = storage;
window.firebaseDB = db;
window.googleProvider = googleProvider; 
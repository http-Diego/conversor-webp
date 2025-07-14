// Configuração do Firebase
// Importe o SDK do Firebase (será adicionado via CDN no HTML)

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDEHm_HS8HaJTDu1KeHeVXSaU5l1zWWPIM",
  authDomain: "auth.teamkeepup.com.br", // <-- AQUI ESTÁ A MUDANÇA
  projectId: "teamkeepup-6f0e3",
  storageBucket: "teamkeepup-6f0e3.appspot.com",
  messagingSenderId: "158895484861",
  appId: "1:158895484861:web:b87644e7fc43e423e2cd4"
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
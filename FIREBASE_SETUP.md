# Configuração do Firebase - Guia Completo

## 1. Criar Projeto no Firebase Console

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em "Criar projeto"
3. Digite um nome para o projeto (ex: "converter-webp")
4. Aceite os termos e continue
5. Desative o Google Analytics (opcional) e clique em "Criar projeto"

## 2. Configurar Authentication

1. No console do Firebase, vá para "Authentication" no menu lateral
2. Clique em "Começar"
3. Vá para a aba "Sign-in method"
4. Clique em "Google" e habilite-o
5. Configure:
   - Nome do projeto público: "Conversor WebP"
   - Email de suporte: seu-email@gmail.com
6. Clique em "Salvar"

## 3. Configurar Storage

1. No console do Firebase, vá para "Storage" no menu lateral
2. Clique em "Começar"
3. Escolha "Regras de produção" e clique em "Próximo"
4. Escolha um local (ex: "us-central1") e clique em "Concluído"

### Configurar Regras do Storage

1. Na aba "Regras", substitua as regras por:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

2. Clique em "Publicar"

## 4. Obter Configuração do Projeto

1. No console do Firebase, clique na engrenagem (⚙️) ao lado de "Visão geral do projeto"
2. Selecione "Configurações do projeto"
3. Role até "Seus aplicativos" e clique em "Adicionar app"
4. Escolha o ícone da web (</>) 
5. Digite um nome para o app (ex: "converter-webp-web")
6. Clique em "Registrar app"
7. Copie a configuração que aparece

## 5. Atualizar Configuração no Código

1. Abra o arquivo `js/firebase-config.js`
2. Substitua a configuração `firebaseConfig` pela sua configuração real:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key-real",
  authDomain: "seu-projeto-real.firebaseapp.com",
  projectId: "seu-projeto-real-id",
  storageBucket: "seu-projeto-real.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## 6. Testar a Configuração

1. Abra o projeto no navegador
2. Abra o console do navegador (F12)
3. Tente fazer login com Google
4. Verifique se não há erros no console

## 7. Configurações Adicionais (Opcional)

### Domínios Autorizados
1. No console do Firebase, vá para Authentication > Settings
2. Na aba "Authorized domains", adicione seu domínio
3. Para desenvolvimento local, adicione: `localhost`

### Configurações de Storage
1. Em Storage > Rules, você pode ajustar as regras conforme necessário
2. Para desenvolvimento, pode usar regras mais permissivas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 8. Troubleshooting

### Erro: "Firebase não está carregado"
- Verifique se os SDKs do Firebase estão sendo carregados corretamente
- Verifique se não há bloqueadores de script no navegador

### Erro: "auth/unauthorized-domain"
- Adicione seu domínio aos domínios autorizados no Firebase Console

### Erro: "storage/unauthorized"
- Verifique se as regras do Storage estão configuradas corretamente
- Verifique se o usuário está autenticado

## 9. Próximos Passos

Após configurar o Firebase:
1. Teste o login/logout
2. Implemente o upload de imagens
3. Implemente a listagem de imagens
4. Configure o limite de 15 imagens por usuário

## Suporte

Se encontrar problemas:
1. Verifique o console do navegador para erros
2. Verifique o console do Firebase para logs
3. Consulte a [documentação do Firebase](https://firebase.google.com/docs) 
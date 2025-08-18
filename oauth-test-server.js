// Este arquivo é apenas para teste local do Google OAuth
// Você pode executá-lo com `node oauth-test-server.js` para testar o fluxo OAuth

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Middleware para parsing de JSON
app.use(express.json());
app.use(cors());

// Rota para troca de código por token
app.post('/api/auth/oauth/exchange', async (req, res) => {
  try {
    const { provider, code, redirectUri } = req.body;
    
    console.log(`Recebida solicitação de troca de código: ${provider}`);
    console.log(`Código: ${code}`);
    console.log(`Redirect URI: ${redirectUri}`);
    
    if (provider === 'google') {
      // Em um ambiente de produção, você faria uma chamada real ao Google
      // Mas para fins de teste, apenas simulamos uma resposta bem-sucedida
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({
        access_token: 'fake-access-token-' + Date.now(),
        refresh_token: 'fake-refresh-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 3600,
        id_token: 'fake-id-token',
        user: {
          id: '123456',
          email: 'usuario.teste@gmail.com',
          name: 'Usuário Teste',
          picture: 'https://via.placeholder.com/150'
        }
      });
    } else if (provider === 'github') {
      // Resposta simulada para GitHub
      res.json({
        access_token: 'fake-github-token-' + Date.now(),
        token_type: 'Bearer',
        user: {
          id: '789012',
          login: 'usuario_teste',
          name: 'Usuário Teste GitHub',
          email: 'usuario.teste@github.com',
          avatar_url: 'https://via.placeholder.com/150'
        }
      });
    } else {
      res.status(400).json({ error: 'Provedor não suportado' });
    }
  } catch (error) {
    console.error('Erro na troca de código:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para processar signin com Google
app.post('/api/auth/google/signin', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    console.log(`Recebido token ID do Google: ${idToken.substring(0, 20)}...`);
    
    // Em produção, você verificaria o token com o Google
    // https://developers.google.com/identity/sign-in/web/backend-auth
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({
      success: true,
      user: {
        id: '123456',
        email: 'usuario.teste@gmail.com',
        name: 'Usuário Teste',
        picture: 'https://via.placeholder.com/150'
      },
      token: 'fake-jwt-token-' + Date.now()
    });
  } catch (error) {
    console.error('Erro no login com Google:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de teste rodando em http://localhost:${PORT}`);
  console.log('Use este servidor apenas para testes locais!');
});

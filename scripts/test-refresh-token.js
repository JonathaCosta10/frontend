/**
 * Script de teste para refreshToken
 * Use este script para verificar se a URL do refreshToken está correta
 */

// Função para testar se a URL está sendo construída corretamente
function testRefreshTokenURL() {
  // Simular o ambiente
  const BACKEND_URL = '/services/api';
  const refreshTokenEndpoint = '/auth/token/refresh/';
  
  // Construção correta (após a correção)
  const correctURL = `${BACKEND_URL}${refreshTokenEndpoint}`;
  console.log('URL Correta (esperada):', correctURL);
  
  // Construção incorreta (antes da correção)
  const incorrectURL = `${BACKEND_URL}/api${refreshTokenEndpoint}`;
  console.log('URL Incorreta (anterior):', incorrectURL);
  
  // Verificar diferença
  console.log('\nAnálise:');
  console.log('---------------------------------------');
  console.log('URL correta deve ser:', '/services/api/auth/token/refresh/');
  console.log('URL incorreta era:   ', '/services/api/api/auth/token/refresh/');
  console.log('---------------------------------------\n');
  
  // Instruções para teste manual
  console.log('Instruções para teste manual:');
  console.log('1. Abra o DevTools (F12) no navegador');
  console.log('2. Vá para a aba Network/Rede');
  console.log('3. Busque por "refresh" ou "token"');
  console.log('4. Verifique se a URL da requisição está correta');
  console.log('5. Não deve conter duplicação como "/api/api/" ou "/services/api/api/"');
}

// Executar o teste
testRefreshTokenURL();

// Instruções para executar no console do navegador
console.log('\nPara testar no console do navegador:');
console.log('1. Abra o DevTools (F12)');
console.log('2. Cole o seguinte código no console:');
console.log(`
async function testRefreshInBrowser() {
  const token = localStorage.getItem('refreshToken');
  if (!token) {
    console.error('Refresh token não encontrado no localStorage');
    return;
  }
  
  console.log('Tentando refresh com token:', token.substring(0, 10) + '...');
  
  try {
    const response = await fetch('/services/api/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': localStorage.getItem('apiKey') || ''
      },
      body: JSON.stringify({ refresh: token })
    });
    
    const data = await response.json();
    console.log('Resposta:', data);
    return data;
  } catch (error) {
    console.error('Erro:', error);
  }
}

testRefreshInBrowser();
`);

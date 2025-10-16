import fetch from 'node-fetch';

async function testBackendConnection() {
  console.log('🔍 Iniciando teste de conexão...');
  
  // Testar diferentes formatos de API Key
  const API_KEYS = [
    "}$gQ7TlDEhJ88np]^n8[uFu{9f#;+8qjZ&?c[+Sj_CLhMO[Z(iM_)ZnW]j2M]+j+", // do vercel.json
    "organizesee-api-key-2025-secure", // fallback em apiKeyUtils.ts
    "" // vazio para ver mensagem de erro específica
  ];
  
  // Usar a primeira API Key
  const API_KEY = API_KEYS[0];
  console.log('🔑 Usando API Key:', API_KEY.substring(0, 10) + '...');
  
  // URLs a serem testadas
  const urls = [
    "https://restbackend-dc8667cf0950.herokuapp.com/health-check/",
    "https://restbackend-dc8667cf0950.herokuapp.com/auth/login/",
    "https://www.organizesee.com.br/services/api/health-check/",
    "https://www.organizesee.com.br/api/health-check/"
  ];
  
  for (const url of urls) {
    try {
      console.log(`🌐 Testando URL: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      });
      
      console.log(`✅ Status: ${response.status}, OK: ${response.ok}, StatusText: ${response.statusText}`);
      
      try {
        const data = await response.json();
        console.log('📊 Resposta:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('⚠️ Não foi possível converter para JSON');
      }
    } catch (error) {
      console.error(`❌ Erro ao acessar ${url}:`, error.message);
    }
    
    console.log('-----------------------------------');
  }
  
  // Testar POST para login
  try {
    console.log('🔑 Testando login diretamente no backend...');
    const loginResponse = await fetch("https://restbackend-dc8667cf0950.herokuapp.com/auth/login/", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        username: 'test@example.com',
        password: 'test123'
      })
    });
    
    console.log(`✅ Status: ${loginResponse.status}, OK: ${loginResponse.ok}, StatusText: ${loginResponse.statusText}`);
    
    try {
      const loginData = await loginResponse.json();
      console.log('🔑 Resposta de login:', JSON.stringify(loginData, null, 2));
    } catch (e) {
      console.log('⚠️ Não foi possível converter para JSON');
    }
  } catch (error) {
    console.error('❌ Erro ao testar login:', error.message);
  }
}

testBackendConnection().catch(console.error);

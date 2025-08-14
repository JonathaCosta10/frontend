// Este script testa as requisições à API para diagnóstico
import { login } from '../client/contexts/Rules';

// Debug de conexão
async function testConnection() {
  console.log('🔍 Iniciando teste de conexão...');
  
  // Verificar configuração
  const BACKEND_URL = process.env.VITE_BACKEND_URL || "/api";
  console.log('📌 Backend URL configurada:', BACKEND_URL);
  
  // Testar fetch diretamente para o endpoint de saúde
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/health-check/`);
    console.log('🏥 Resposta de saúde do backend:', {
      status: healthResponse.status,
      ok: healthResponse.ok,
      statusText: healthResponse.statusText
    });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('🏥 Dados de saúde:', healthData);
    }
  } catch (error) {
    console.error('❌ Erro ao testar saúde do backend:', error);
  }
  
  // Testar login com credenciais de teste
  try {
    console.log('🔑 Testando login...');
    const loginResult = await login('test@example.com', 'test123');
    console.log('🔑 Resultado do login:', loginResult);
  } catch (error) {
    console.error('❌ Erro ao testar login:', error);
  }
  
  // Testar com fetch nativo para comparar
  try {
    console.log('🧪 Testando fetch nativo para login...');
    const response = await fetch(`${BACKEND_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test@example.com',
        password: 'test123'
      })
    });
    
    console.log('🧪 Resposta do fetch nativo:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('🧪 Dados do fetch nativo:', data);
    }
  } catch (error) {
    console.error('❌ Erro com fetch nativo:', error);
  }
}

// Executar teste
testConnection().then(() => {
  console.log('✅ Teste concluído');
}).catch(err => {
  console.error('❌ Erro fatal no teste:', err);
});

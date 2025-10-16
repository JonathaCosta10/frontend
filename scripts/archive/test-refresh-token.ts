/**
 * Teste de Refresh Token
 * Este arquivo testa a funcionalidade de refresh token para garantir
 * que a URL esteja sendo construída corretamente sem duplicação.
 */

// Importar as dependências necessárias
import { refreshTokenApi } from '../client/contexts/Rules';
import { localStorageManager } from '../client/lib/localStorage';

// Configuração do ambiente
const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL || "/services/api";

// Simulação do token para teste
const mockRefreshToken = 'teste-refresh-token';

// Função para testar o refresh token
async function testRefreshToken() {
  console.log('🧪 Iniciando teste de refresh token...');
  console.log('URL Base:', BACKEND_URL);
  
  try {
    // Obter o refresh token do localStorage
    const storedRefreshToken = localStorageManager.getRefreshToken() || mockRefreshToken;
    
    // Tentar fazer o refresh do token
    console.log('Enviando requisição de refresh com token:', storedRefreshToken.substring(0, 10) + '...');
    
    // A função refreshTokenApi deve ser chamada corretamente sem duplicação de URL
    const result = await refreshTokenApi(storedRefreshToken);
    
    // Verificar o resultado
    if (result) {
      console.log('✅ Teste de refresh token bem-sucedido!');
      console.log('Resultado:', result);
    } else {
      console.error('❌ Teste de refresh token falhou - sem dados retornados');
    }
  } catch (error) {
    console.error('❌ Erro durante teste de refresh token:', error);
  }
}

// Exportar a função de teste
export { testRefreshToken };

// Se este arquivo for executado diretamente, rodar o teste
if (typeof window !== 'undefined') {
  testRefreshToken();
}

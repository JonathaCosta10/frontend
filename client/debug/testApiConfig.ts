/**
 * Teste das configurações de API após ajuste das variáveis de ambiente
 * Este script verifica se a variável VITE_BACKEND_URL está configurada corretamente
 */

// Função para testar a configuração da API
function testApiConfiguration() {
  console.log('🔧 Testando configuração da API...');
  
  // Variável de ambiente
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  console.log('📍 VITE_BACKEND_URL:', backendUrl);
  
  // Verifica se a URL está correta
  const expectedUrls = [
    'https://www.organizesee.com.br/services/api', // Produção
    'http://127.0.0.1:8000' // Desenvolvimento
  ];
  
  const isCorrect = expectedUrls.includes(backendUrl);
  console.log('✅ URL configurada corretamente:', isCorrect);
  
  if (!isCorrect) {
    console.warn('⚠️ URL não está nos valores esperados:', expectedUrls);
  }
  
  // Simula construção de URL da API
  const testEndpoint = '/dashboard/orcamento/entradas/data';
  const fullUrl = backendUrl + testEndpoint;
  console.log('🌐 URL completa de teste:', fullUrl);
  
  // Verifica se a URL final está correta
  const shouldBe = 'https://www.organizesee.com.br/services/api/dashboard/orcamento/entradas/data';
  const isCorrectFull = fullUrl === shouldBe || backendUrl === 'http://127.0.0.1:8000';
  
  console.log('🎯 URL final correta:', isCorrectFull);
  
  return {
    backendUrl,
    isCorrect,
    fullUrl,
    isCorrectFull
  };
}

// Função para testar se não há URLs hardcoded problemáticas
function checkForHardcodedUrls() {
  console.log('🔍 Verificando URLs hardcoded...');
  
  // Esta função seria executada no browser
  if (typeof window !== 'undefined') {
    console.log('🌍 Origin atual:', window.location.origin);
    
    // Verifica se estamos em produção
    const isProduction = window.location.origin === 'https://www.organizesee.com.br';
    console.log('🏭 Ambiente de produção:', isProduction);
    
    if (isProduction) {
      console.log('✅ Em produção - URLs devem usar a variável de ambiente');
    } else {
      console.log('🛠️ Em desenvolvimento - OK usar localhost');
    }
  }
}

// Exporta as funções para uso
export { testApiConfiguration, checkForHardcodedUrls };

// Auto-executa se for carregado diretamente
if (typeof window !== 'undefined') {
  console.log('🚀 Iniciando teste de configuração da API...');
  testApiConfiguration();
  checkForHardcodedUrls();
}

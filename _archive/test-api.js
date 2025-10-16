// Teste simples para verificar se a API está respondendo corretamente
// Execute no console do navegador na página http://localhost:3001

console.log('🧪 Iniciando teste da API...');

const testAPI = async () => {
  try {
    // Simular a mesma requisição que o hook está fazendo
    const response = await fetch('http://127.0.0.1:5000/api/distribuicao_gastos?ano=2025', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'dev-api-key-local',
        'X-Client-Version': '1.0.0',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers da resposta:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      console.log('✅ Campo hist_data:', data.hist_data);
    } else {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
};

testAPI();

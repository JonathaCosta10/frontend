// Módulo de configuração de desenvolvimento
// Usado para controlar comportamentos específicos durante o desenvolvimento

/**
 * Configurações para ambiente de desenvolvimento
 */
export const developmentConfig = {
  // Ativa o uso de dados mock em vez de requisições reais
  useMockData: false, // Alterado para false para usar dados reais da API
  
  // Exibe logs detalhados de API para depuração
  showApiLogs: true,
  
  // Ativa funcionalidades experimentais
  enableExperimentalFeatures: false,

  // Simulação de usuário premium para testes
  simulatePremiumUser: true,
  
  // Define um atraso mínimo em ms para requisições simuladas para melhorar experiência de desenvolvimento
  mockApiDelayMin: 300,
  
  // Define um atraso máximo em ms para requisições simuladas
  mockApiDelayMax: 800
};

/**
 * Simula um atraso nas chamadas de API para melhorar a experiência de desenvolvimento
 * 
 * @param fixedDelay - Se fornecido, usa esse valor de atraso fixo em ms
 * @returns Promise que resolve após o atraso
 */
export async function simulateApiDelay(fixedDelay?: number): Promise<void> {
  // Se não deve simular atraso, retorna imediatamente
  if (!developmentConfig.useMockData) {
    return Promise.resolve();
  }
  
  const minDelay = developmentConfig.mockApiDelayMin;
  const maxDelay = developmentConfig.mockApiDelayMax;
  
  // Usa o atraso fixo fornecido ou gera um aleatório entre min e max
  const delay = fixedDelay || Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
  
  return new Promise(resolve => setTimeout(resolve, delay));
}

// DataCache.ts
// Este é um cache global simples para dados cruciais do sistema
// Útil para manter estado entre componentes quando ocorrem erros

// Interface do cache global
interface GlobalDataCache {
  budgetData: {
    [key: string]: any; // Armazenado por ano como chave
    lastUpdate?: number;
  };
}

// Inicializa o cache global
const globalDataCache: GlobalDataCache = {
  budgetData: {}
};

// Funções de acesso ao cache
export const DataCache = {
  // Armazenar dados de orçamento
  setBudgetData: (ano: string, data: any): void => {
    console.log('💾 [GLOBAL CACHE] Salvando dados de orçamento para ano:', ano);
    globalDataCache.budgetData[ano] = data;
    globalDataCache.budgetData.lastUpdate = Date.now();
  },
  
  // Obter dados de orçamento
  getBudgetData: (ano: string): any | null => {
    const data = globalDataCache.budgetData[ano];
    if (data) {
      console.log('📂 [GLOBAL CACHE] Usando dados de orçamento em cache para ano:', ano);
    }
    return data || null;
  },
  
  // Verificar se há dados em cache
  hasBudgetData: (ano: string): boolean => {
    return !!globalDataCache.budgetData[ano];
  },
  
  // Limpar cache específico
  clearBudgetData: (ano: string): void => {
    delete globalDataCache.budgetData[ano];
  },
  
  // Limpar todo o cache
  clearAll: (): void => {
    globalDataCache.budgetData = {};
  }
};

export default DataCache;

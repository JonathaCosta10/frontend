/**
 * Armazenamento em cache para dados reais para uso em modo mockado
 * Este módulo armazena os últimos dados reais obtidos da API
 * para que os dados mockados sejam mais realistas
 */

import { 
  CoinGeckoCrypto, 
  CoinGeckoMarketChart, 
  CoinGeckoCoinData,
  CoinGeckoGlobalData,
  CoinGeckoExchange,
  CoinGeckoCategory,
  CoinGeckoTrending
} from './coinGeckoApi';

// Objeto que armazena os últimos dados reais
interface MockCache {
  markets: CoinGeckoCrypto[] | null;
  marketCharts: Record<string, CoinGeckoMarketChart>;
  coinData: Record<string, CoinGeckoCoinData>;
  globalData: CoinGeckoGlobalData | null;
  exchanges: CoinGeckoExchange[] | null;
  categories: CoinGeckoCategory[] | null;
  trending: CoinGeckoTrending | null;
  ohlc: Record<string, Array<[number, number, number, number, number]>>;
  lastUpdated: Record<string, number>;
  volumeByExchange: Record<string, number> | null;
  simplePrice: Record<string, Record<string, number>> | null;
}

// Inicializar o cache vazio
export const mockCache: MockCache = {
  markets: null,
  marketCharts: {},
  coinData: {},
  globalData: null,
  exchanges: null,
  categories: null,
  trending: null,
  ohlc: {},
  lastUpdated: {},
  volumeByExchange: null,
  simplePrice: null
};

// Função para atualizar o cache com dados reais
export function updateMockCache<T>(key: keyof MockCache, data: T, id?: string): void {
  // Para dados que têm ID (como marketCharts, coinData, etc.)
  if (id && typeof mockCache[key] === 'object' && !Array.isArray(mockCache[key])) {
    (mockCache[key] as Record<string, any>)[id] = data;
    mockCache.lastUpdated[`${key}-${id}`] = Date.now();
  } else {
    // Para dados sem ID (como markets, globalData, etc.)
    (mockCache[key] as any) = data;
    mockCache.lastUpdated[key as string] = Date.now();
  }
}

// Função para obter dados do cache
export function getMockData<T>(key: keyof MockCache, id?: string): T | null {
  // Para dados que têm ID
  if (id && typeof mockCache[key] === 'object' && !Array.isArray(mockCache[key])) {
    return ((mockCache[key] as Record<string, any>)[id] as T) || null;
  }
  // Para dados sem ID
  return (mockCache[key] as unknown as T) || null;
}

// Função para verificar se os dados no cache estão atualizados (menos de 24 horas)
export function isMockDataFresh(key: keyof MockCache, id?: string): boolean {
  const cacheKey = id ? `${key}-${id}` : key as string;
  const lastUpdate = mockCache.lastUpdated[cacheKey] || 0;
  const now = Date.now();
  // Considera dados frescos se tiverem menos de 24 horas
  return (now - lastUpdate) < (24 * 60 * 60 * 1000);
}

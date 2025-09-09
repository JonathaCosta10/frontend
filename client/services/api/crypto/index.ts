// Exporter de todas as APIs de criptomoedas

import { coinGeckoApi } from './coinGeckoApi';
import { checkCoinGeckoStatus, coinGeckoFetch } from './coinGeckoUtils';
import { backendCryptoApi } from './backendCryptoApi';

// Re-exportar todas as interfaces do CoinGecko
export type {
  CoinGeckoCrypto,
  CoinGeckoMarketChart,
  CoinGeckoCoinData,
  CoinGeckoGlobalData,
  CoinGeckoExchange,
  CoinGeckoCategory,
  CoinGeckoTrending,
  CoinGeckoOHLC
} from './coinGeckoApi';

// Re-exportar a base URL e função helper
export { COINGECKO_BASE_URL } from './coinGeckoApi';

// Exportar APIs
export {
  coinGeckoApi,
  checkCoinGeckoStatus,
  coinGeckoFetch,
  backendCryptoApi
};

// Configuração para escolher fonte dos dados
const API_CONFIG = {
  useBackendFirst: import.meta.env.VITE_USE_BACKEND_CRYPTO !== 'false', // Default true
  fallbackToCoinGecko: import.meta.env.VITE_CRYPTO_FALLBACK_TO_COINGECKO !== 'false', // Default true
};

// Função principal para buscar dados de mercado
async function getMarketsData(): Promise<import('./coinGeckoApi').CoinGeckoCrypto[]> {
  if (API_CONFIG.useBackendFirst) {
    try {
      console.log('🎯 Tentando backend primeiro...');
      const markets = await backendCryptoApi.getMarkets();
      console.log('✅ Sucesso com backend!', markets.length, 'moedas');
      return markets;
    } catch (error) {
      console.warn('⚠️ Backend falhou, tentando fallback:', error);
      
      if (API_CONFIG.fallbackToCoinGecko) {
        try {
          console.log('🔄 Usando CoinGecko como fallback...');
          const markets = await coinGeckoApi.getMarkets();
          console.log('✅ Fallback CoinGecko funcionou!', markets.length, 'moedas');
          return markets;
        } catch (fallbackError) {
          console.error('❌ Todos os métodos falharam:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  } else {
    // Usar CoinGecko diretamente se backend estiver desabilitado
    console.log('🔄 Backend desabilitado, usando CoinGecko diretamente...');
    return await coinGeckoApi.getMarkets();
  }
}

// Função principal para verificar status da API
async function checkApiStatusData() {
  if (API_CONFIG.useBackendFirst) {
    const backendStatus = await backendCryptoApi.checkApiStatus();
    
    if (backendStatus.status === 'operational') {
      return backendStatus;
    }
    
    // Se backend não estiver operacional, verificar CoinGecko
    if (API_CONFIG.fallbackToCoinGecko) {
      const coinGeckoStatus = await checkCoinGeckoStatus();
      return {
        status: coinGeckoStatus.status,
        message: `Backend indisponível. ${coinGeckoStatus.message}`
      };
    }
    
    return backendStatus;
  } else {
    // Apenas CoinGecko
    return await checkCoinGeckoStatus();
  }
}

// Exportar uma API unificada que escolhe automaticamente a melhor fonte
export const cryptoApi = {
  // Métodos principais com lógica de fallback
  getMarkets: getMarketsData,
  checkApiStatus: checkApiStatusData,
  
  // Re-exportar outras funções do CoinGecko para compatibilidade
  getMarketChart: coinGeckoApi.getMarketChart,
  getCoin: coinGeckoApi.getCoin,
  getGlobalData: coinGeckoApi.getGlobalData,
  getExchanges: coinGeckoApi.getExchanges,
  getCategories: coinGeckoApi.getCategories,
  getTrendingCoins: coinGeckoApi.getTrendingCoins,
  getOHLC: coinGeckoApi.getOHLC,
  getSimplePrice: coinGeckoApi.getSimplePrice,
  getPortfolioPrices: coinGeckoApi.getPortfolioPrices,
};

export default cryptoApi;

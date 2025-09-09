// Backend Crypto API - Integração com endpoint público do Django
import { CRYPTO_ROUTES } from "../../../contexts/Rotas";
import { cachedFetch } from "../../../lib/api-helpers";
import { CoinGeckoCrypto } from "./coinGeckoApi";

// Interface para resposta do backend
interface BackendCryptoResponse {
  status: "success" | "error";
  data?: {
    cryptocurrencies: CoinGeckoCrypto[];
    global_stats: {
      total_market_cap: number;
      total_volume_24h: number;
      btc_dominance: number;
      active_cryptocurrencies: number;
      market_cap_change_percentage_24h: number;
    };
    last_updated: string;
    source: string;
    cache_duration: number;
  };
  error?: {
    code: string;
    message: string;
    details: string;
  };
  fallback_data?: {
    cryptocurrencies: CoinGeckoCrypto[];
    cache_timestamp: string;
  };
}

// Configurações da API
const API_CONFIG = {
  useBackendCrypto: import.meta.env.VITE_USE_BACKEND_CRYPTO !== 'false', // Default true
  fallbackToCoinGecko: import.meta.env.VITE_CRYPTO_FALLBACK_TO_COINGECKO !== 'false', // Default true
  cacheDuration: parseInt(import.meta.env.VITE_CRYPTO_CACHE_DURATION) || 120000, // 2 minutes
  baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'
};

export const backendCryptoApi = {
  /**
   * Busca dados de criptomoedas do backend Django
   */
  async getMarkets(params?: {
    limit?: number;
    order?: string;
    vs_currency?: string;
  }): Promise<CoinGeckoCrypto[]> {
    try {
      console.log('🚀 Buscando dados de crypto do backend...');
      
      // Construir query parameters
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      if (params?.order) queryParams.set('order', params.order);
      if (params?.vs_currency) queryParams.set('vs_currency', params.vs_currency);
      
      const queryString = queryParams.toString();
      const url = `${CRYPTO_ROUTES.market}${queryString ? `?${queryString}` : ''}`;
      
      console.log('📍 URL da requisição:', url);
      
      // Construir URL usando variáveis de ambiente
      const baseUrl = import.meta.env.VITE_API_BASE_URL || API_CONFIG.baseUrl || 'https://www.organizesee.com.br';
      const fullUrl = `${baseUrl}/services/api/market/crypto/`;
      console.log('📍 URL completa da requisição:', fullUrl);
      
      const response = await cachedFetch<BackendCryptoResponse>(fullUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      console.log('📦 Resposta do backend:', response);

      if (response.status === 'success' && response.data?.cryptocurrencies) {
        console.log('✅ Dados obtidos com sucesso do backend:', response.data.cryptocurrencies.length, 'moedas');
        return response.data.cryptocurrencies;
      }

      // Usar fallback data se disponível
      if (response.fallback_data?.cryptocurrencies) {
        console.log('⚠️ Usando fallback data do backend');
        return response.fallback_data.cryptocurrencies;
      }

      throw new Error(response.error?.message || 'Backend API error');
    } catch (error) {
      console.error('❌ Erro na API do backend:', error);
      throw error;
    }
  },

  /**
   * Verifica status da API do backend
   */
  async checkApiStatus(): Promise<{
    status: 'operational' | 'limited' | 'down';
    message: string;
  }> {
    try {
      console.log('🔍 Verificando status da API do backend...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      // Construir URL usando variáveis de ambiente - /services/api/market/crypto/
      const baseUrl = import.meta.env.VITE_API_BASE_URL || API_CONFIG.baseUrl || 'https://www.organizesee.com.br';
      const apiUrl = `${baseUrl}/services/api/market/crypto/`;
      console.log('🔗 Tentando conectar a:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log('✅ Backend API operacional');
        return {
          status: 'operational',
          message: 'API backend funcionando normalmente'
        };
      } else if (response.status >= 400 && response.status < 500) {
        console.log('⚠️ Backend API com limitações');
        return {
          status: 'limited',
          message: 'API backend com limitações (erro 4xx)'
        };
      } else {
        console.log('🔴 Backend API com problemas');
        return {
          status: 'down',
          message: 'API backend indisponível (erro 5xx)'
        };
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status do backend:', error);
      return {
        status: 'down',
        message: 'Backend não acessível'
      };
    }
  },

  /**
   * Testa conectividade básica com o backend
   */
  async testConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

      const response = await fetch(`${API_CONFIG.baseUrl}/market/crypto/`, {
        method: 'HEAD',
        headers: {
          'X-API-Key': import.meta.env.VITE_API_KEY
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('❌ Erro ao testar conexão com backend:', error);
      return false;
    }
  }
};

export default backendCryptoApi;

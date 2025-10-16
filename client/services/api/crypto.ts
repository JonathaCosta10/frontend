/**
 * Crypto API Service
 * Serviço para comunicação com APIs de criptomoedas
 */

export interface CoinGeckoCrypto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h?: number;
  market_cap_change_percentage_24h?: number;
  circulating_supply: number;
  total_supply?: number;
  max_supply?: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi?: {
    times: number;
    currency: string;
    percentage: number;
  };
  last_updated: string;
}

export const cryptoApi = {
  /**
   * Verifica o status da API
   */
  checkApiStatus: async (): Promise<{ status: string }> => {
    try {
      // Mock implementation - replace with actual API call
      return { status: 'ok' };
    } catch (error) {
      console.error('Erro ao verificar status da API:', error);
      throw error;
    }
  },

  /**
   * Obtém dados do mercado de criptomoedas
   */
  getMarkets: async (limit: number = 100): Promise<CoinGeckoCrypto[]> => {
    try {
      // Mock implementation - replace with actual API call
      const mockData: CoinGeckoCrypto[] = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
          current_price: 45000,
          market_cap: 850000000000,
          market_cap_rank: 1,
          total_volume: 25000000000,
          high_24h: 46000,
          low_24h: 44000,
          price_change_24h: 1000,
          price_change_percentage_24h: 2.27,
          circulating_supply: 19000000,
          total_supply: 21000000,
          max_supply: 21000000,
          ath: 69000,
          ath_change_percentage: -34.78,
          ath_date: '2021-11-10T14:24:11.849Z',
          atl: 67.81,
          atl_change_percentage: 66245.08,
          atl_date: '2013-07-06T00:00:00.000Z',
          last_updated: new Date().toISOString()
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
          current_price: 3000,
          market_cap: 360000000000,
          market_cap_rank: 2,
          total_volume: 15000000000,
          high_24h: 3100,
          low_24h: 2950,
          price_change_24h: 50,
          price_change_percentage_24h: 1.69,
          circulating_supply: 120000000,
          ath: 4878,
          ath_change_percentage: -38.51,
          ath_date: '2021-11-10T14:24:19.604Z',
          atl: 0.432979,
          atl_change_percentage: 692845.88,
          atl_date: '2015-10-20T00:00:00.000Z',
          last_updated: new Date().toISOString()
        }
      ];
      
      return mockData.slice(0, limit);
    } catch (error) {
      console.error('Erro ao buscar dados do mercado:', error);
      throw error;
    }
  }
};

export default cryptoApi;
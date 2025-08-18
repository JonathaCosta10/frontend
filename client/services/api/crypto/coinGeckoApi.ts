// CoinGecko API Service
import { developmentConfig, simulateApiDelay } from "../../../config/development-mock";
import { cachedFetch } from "../../../lib/api-helpers";

// Base URL for CoinGecko API
export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Helper to create CoinGecko URLs
const coingeckoUrl = (endpoint: string): string => `${COINGECKO_BASE_URL}/${endpoint}`;

// Interface definitions
export interface CoinGeckoCrypto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  ath: number;
  ath_change_percentage: number;
}

export interface CoinGeckoMarketChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface CoinGeckoCoinData {
  id: string;
  symbol: string;
  name: string;
  market_data: {
    current_price: {
      brl: number;
      usd: number;
    };
    market_cap: {
      brl: number;
      usd: number;
    };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    total_volume: {
      brl: number;
      usd: number;
    };
    circulating_supply: number;
    total_supply: number;
  };
  description: {
    en: string;
  };
  image: {
    large: string;
    small: string;
    thumb: string;
  };
}

export interface CoinGeckoGlobalData {
  data: {
    active_cryptocurrencies: number;
    total_market_cap: {
      brl: number;
      usd: number;
    };
    total_volume: {
      brl: number;
      usd: number;
    };
    market_cap_percentage: {
      btc: number;
      eth: number;
    };
    market_cap_change_percentage_24h_usd: number;
  };
}

export interface CoinGeckoExchange {
  id: string;
  name: string;
  year_established: number;
  country: string;
  image: string;
  trade_volume_24h_btc: number;
  trust_score: number;
}

export interface CoinGeckoCategory {
  id: string;
  name: string;
  market_cap: number;
  market_cap_change_24h: number;
  content: string;
  top_3_coins: string[];
}

export interface CoinGeckoTrending {
  coins: Array<{
    item: {
      id: string;
      name: string;
      symbol: string;
      market_cap_rank: number;
      thumb: string;
      small: string;
      price_btc: number;
    }
  }>;
}

export interface CoinGeckoOHLC {
  // [time, open, high, low, close]
  ohlc: [number, number, number, number, number][];
}

// Importando o sistema de cache de dados mockados
import { mockCache, updateMockCache, getMockData, isMockDataFresh } from './mockDataCache';

// CoinGecko API client
export const coinGeckoApi = {
  // Get list of coins with market data
  async getMarkets(): Promise<CoinGeckoCrypto[]> {
    try {
      // Verificar se deve usar dados mockados
      const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
      
      // Se não estiver usando mock, buscar dados reais
      if (!useMock) {
        const data = await cachedFetch<CoinGeckoCrypto[]>(
          coingeckoUrl('coins/markets?vs_currency=brl&order=market_cap_desc&per_page=100&page=1&sparkline=false')
        );
        // Salvar os dados reais no cache de mock para uso futuro
        updateMockCache('markets', data);
        return data;
      }
      
      // Verificar se temos dados em cache
      const cachedData = getMockData<CoinGeckoCrypto[]>('markets');
      if (cachedData && isMockDataFresh('markets')) {
        await simulateApiDelay();
        return cachedData;
      }
      
      // Se não tiver dados no cache ou estiverem desatualizados, usar mock padrão
      await simulateApiDelay();
      return getMockCryptoMarkets();
    } catch (error) {
      console.error('Error fetching crypto markets:', error);
      
      // Em caso de erro, tentar usar o cache de mock
      const cachedData = getMockData<CoinGeckoCrypto[]>('markets');
      if (cachedData) return cachedData;
      
      // Se não tiver nada no cache, usar mock padrão
      return getMockCryptoMarkets();
    }
  },

  // Get historical market data for a specific coin
  async getMarketChart(id: string, days: number | string = 7): Promise<CoinGeckoMarketChart> {
    try {
      // Verificar se deve usar dados mockados
      const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
      
      // Se não estiver usando mock, buscar dados reais
      if (!useMock) {
        const data = await cachedFetch<CoinGeckoMarketChart>(
          coingeckoUrl(`coins/${id}/market_chart?vs_currency=brl&days=${days}`)
        );
        // Salvar os dados reais no cache de mock para uso futuro
        updateMockCache('marketCharts', data, `${id}-${days}`);
        return data;
      }
      
      // Verificar se temos dados em cache
      const cacheKey = `${id}-${days}`;
      const cachedData = getMockData<CoinGeckoMarketChart>('marketCharts', cacheKey);
      if (cachedData && isMockDataFresh('marketCharts', cacheKey)) {
        await simulateApiDelay();
        return cachedData;
      }
      
      // Se não tiver dados no cache ou estiverem desatualizados, usar mock padrão
      await simulateApiDelay();
      return getMockMarketChart(id, days);
    } catch (error) {
      console.error(`Error fetching market chart for ${id}:`, error);
      
      // Em caso de erro, tentar usar o cache de mock
      const cacheKey = `${id}-${days}`;
      const cachedData = getMockData<CoinGeckoMarketChart>('marketCharts', cacheKey);
      if (cachedData) return cachedData;
      
      // Se não tiver nada no cache, usar mock padrão
      return getMockMarketChart(id, days);
    }
  },

  // Get detailed data for a specific coin
  async getCoin(id: string): Promise<CoinGeckoCoinData> {
    try {
      // Verificar se deve usar dados mockados
      const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
      
      // Se não estiver usando mock, buscar dados reais
      if (!useMock) {
        const data = await cachedFetch<CoinGeckoCoinData>(
          coingeckoUrl(`coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
        );
        // Salvar os dados reais no cache de mock para uso futuro
        updateMockCache('coinData', data, id);
        return data;
      }
      
      // Verificar se temos dados em cache
      const cachedData = getMockData<CoinGeckoCoinData>('coinData', id);
      if (cachedData && isMockDataFresh('coinData', id)) {
        await simulateApiDelay();
        return cachedData;
      }
      
      // Se não tiver dados no cache ou estiverem desatualizados, usar mock padrão
      await simulateApiDelay();
      return getMockCoinData(id);
    } catch (error) {
      console.error(`Error fetching data for coin ${id}:`, error);
      
      // Em caso de erro, tentar usar o cache de mock
      const cachedData = getMockData<CoinGeckoCoinData>('coinData', id);
      if (cachedData) return cachedData;
      
      // Se não tiver nada no cache, usar mock padrão
      return getMockCoinData(id);
    }
  },

  // Get global crypto market data
  async getGlobalData(): Promise<CoinGeckoGlobalData> {
    try {
      // Uso de dados reais (desativando mock)
      const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
      if (useMock) {
        await simulateApiDelay();
        return getMockGlobalData();
      }

      return await cachedFetch(coingeckoUrl('global'));
    } catch (error) {
      console.error('Error fetching global crypto data:', error);
      return getMockGlobalData();
    }
  },

  // Get top exchanges
  async getExchanges(): Promise<CoinGeckoExchange[]> {
    try {
      // Uso de dados reais (desativando mock)
      const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
      if (useMock) {
        await simulateApiDelay();
        return getMockExchanges();
      }

      return await cachedFetch(coingeckoUrl('exchanges?per_page=10&page=1'));
    } catch (error) {
      console.error('Error fetching exchanges data:', error);
      return getMockExchanges();
    }
  },

  // Get cryptocurrency categories
  async getCategories(): Promise<CoinGeckoCategory[]> {
    try {
      // Uso de dados reais (desativando mock)
      const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
      if (useMock) {
        await simulateApiDelay();
        return getMockCategories();
      }

      return await cachedFetch(coingeckoUrl('coins/categories'));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return getMockCategories();
    }
  },

  // Get trending coins
  async getTrendingCoins(): Promise<CoinGeckoTrending> {
    try {
      // Uso de dados reais (desativando mock)
      const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
      if (useMock) {
        await simulateApiDelay();
        return getMockTrendingCoins();
      }

      return await cachedFetch(coingeckoUrl('search/trending'));
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      return getMockTrendingCoins();
    }
  },

  // Get OHLC data for a specific coin
  async getOHLC(id: string, days: number | string = 7): Promise<[number, number, number, number, number][]> {
    try {
      // Uso de dados reais (desativando mock)
      const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
      if (useMock) {
        await simulateApiDelay();
        return getMockOHLC(id, days);
      }

      const data = await cachedFetch(coingeckoUrl(`coins/${id}/ohlc?vs_currency=brl&days=${days}`));
      return data;
    } catch (error) {
      console.error(`Error fetching OHLC data for ${id}:`, error);
      return getMockOHLC(id, days);
    }
  },

  // Get price of specific coins
  async getSimplePrice(ids: string[], currencies: string[] = ['brl', 'usd']): Promise<Record<string, Record<string, number>>> {
    try {
      // If using mock data
      if (developmentConfig.useMockData) {
        await simulateApiDelay();
        return getMockSimplePrice(ids, currencies);
      }

      return await cachedFetch(
        coingeckoUrl(
          `simple/price?ids=${ids.join(',')}&vs_currencies=${currencies.join(',')}&include_24h_change=true`
        )
      );
    } catch (error) {
      console.error('Error fetching simple price:', error);
      return getMockSimplePrice(ids, currencies);
    }
  },

  // Search for coins, categories and markets
  async search(query: string): Promise<{
    coins: Array<{id: string, name: string, symbol: string, market_cap_rank: number}>,
    categories: Array<{id: string, name: string}>,
    exchanges: Array<{id: string, name: string, market_type: string}>
  }> {
    try {
      // Uso de dados reais (desativando mock)
      const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
      if (useMock) {
        await simulateApiDelay();
        return getMockSearchResults(query);
      }

      return await cachedFetch(coingeckoUrl(`search?query=${encodeURIComponent(query)}`));
    } catch (error) {
      console.error('Error performing search:', error);
      return getMockSearchResults(query);
    }
  },

  // Get coin prices for portfolio
  async getPortfolioPrices(coinIds: string[]): Promise<Record<string, {brl: number, usd: number, brl_24h_change: number}>> {
    if (!coinIds.length) return {};

    try {
      // Uso de dados reais (desativando mock)
      const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
      if (useMock) {
        await simulateApiDelay();
        return getMockPortfolioPrices(coinIds);
      }

      return await cachedFetch(
        coingeckoUrl(
          `simple/price?ids=${coinIds.join(',')}&vs_currencies=brl,usd&include_24h_change=true`
        )
      );
    } catch (error) {
      console.error('Error fetching portfolio prices:', error);
      return getMockPortfolioPrices(coinIds);
    }
  }
};

// Mock data helpers
function getMockCryptoMarkets(): CoinGeckoCrypto[] {
  return [
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      current_price: 293450.5,
      market_cap: 5750000000000,
      market_cap_rank: 1,
      total_volume: 15200000000,
      price_change_percentage_24h: 2.45,
      circulating_supply: 19500000,
      total_supply: 21000000,
      ath: 350000,
      ath_change_percentage: -16.3
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      current_price: 12250.75,
      market_cap: 1470000000000,
      market_cap_rank: 2,
      total_volume: 8900000000,
      price_change_percentage_24h: -1.23,
      circulating_supply: 120000000,
      total_supply: null,
      ath: 20000,
      ath_change_percentage: -38.75
    },
    {
      id: "solana",
      symbol: "sol",
      name: "Solana",
      image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
      current_price: 485.3,
      market_cap: 228000000000,
      market_cap_rank: 3,
      total_volume: 1200000000,
      price_change_percentage_24h: 5.67,
      circulating_supply: 470000000,
      total_supply: 535000000,
      ath: 880,
      ath_change_percentage: -44.85
    }
  ];
}

function getMockMarketChart(id: string, days: number | string): CoinGeckoMarketChart {
  const numDays = typeof days === 'string' ? parseInt(days) : days;
  const points = numDays * 24;
  const now = Date.now();
  const msPerPoint = (numDays * 86400000) / points;
  
  const basePrice = id === 'bitcoin' ? 290000 : id === 'ethereum' ? 12000 : 480;
  const baseCap = id === 'bitcoin' ? 5700000000000 : id === 'ethereum' ? 1450000000000 : 225000000000;
  const baseVolume = id === 'bitcoin' ? 15000000000 : id === 'ethereum' ? 8800000000 : 1100000000;
  
  const prices: [number, number][] = [];
  const market_caps: [number, number][] = [];
  const total_volumes: [number, number][] = [];
  
  for (let i = 0; i < points; i++) {
    const timestamp = now - (points - i) * msPerPoint;
    const randomFactor = 0.98 + Math.random() * 0.04; // Random factor between 0.98 and 1.02
    prices.push([timestamp, basePrice * randomFactor]);
    market_caps.push([timestamp, baseCap * randomFactor]);
    total_volumes.push([timestamp, baseVolume * (0.8 + Math.random() * 0.4)]);
  }
  
  return { prices, market_caps, total_volumes };
}

function getMockCoinData(id: string): CoinGeckoCoinData {
  const mockData: Record<string, CoinGeckoCoinData> = {
    bitcoin: {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      market_data: {
        current_price: { brl: 293450.5, usd: 59250.75 },
        market_cap: { brl: 5750000000000, usd: 1150000000000 },
        price_change_percentage_24h: 2.45,
        price_change_percentage_7d: 5.3,
        price_change_percentage_30d: 15.7,
        total_volume: { brl: 15200000000, usd: 3040000000 },
        circulating_supply: 19500000,
        total_supply: 21000000
      },
      description: {
        en: "Bitcoin is the first decentralized cryptocurrency. It was created in 2009 by an unknown person or group under the pseudonym Satoshi Nakamoto."
      },
      image: {
        large: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        small: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
        thumb: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png"
      }
    },
    ethereum: {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      market_data: {
        current_price: { brl: 12250.75, usd: 2450.15 },
        market_cap: { brl: 1470000000000, usd: 294000000000 },
        price_change_percentage_24h: -1.23,
        price_change_percentage_7d: -0.5,
        price_change_percentage_30d: 12.8,
        total_volume: { brl: 8900000000, usd: 1780000000 },
        circulating_supply: 120000000,
        total_supply: null
      },
      description: {
        en: "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform."
      },
      image: {
        large: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        small: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        thumb: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png"
      }
    }
  };
  
  return mockData[id] || {
    id: id,
    symbol: id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    market_data: {
      current_price: { brl: 500, usd: 100 },
      market_cap: { brl: 50000000000, usd: 10000000000 },
      price_change_percentage_24h: 1.5,
      price_change_percentage_7d: 3.2,
      price_change_percentage_30d: 8.7,
      total_volume: { brl: 1200000000, usd: 240000000 },
      circulating_supply: 50000000,
      total_supply: 100000000
    },
    description: {
      en: "Mock description for " + id
    },
    image: {
      large: "https://via.placeholder.com/200",
      small: "https://via.placeholder.com/100",
      thumb: "https://via.placeholder.com/50"
    }
  };
}

function getMockGlobalData(): CoinGeckoGlobalData {
  return {
    data: {
      active_cryptocurrencies: 10580,
      total_market_cap: {
        brl: 9850000000000,
        usd: 1970000000000
      },
      total_volume: {
        brl: 480000000000,
        usd: 96000000000
      },
      market_cap_percentage: {
        btc: 52.7,
        eth: 17.3
      },
      market_cap_change_percentage_24h_usd: 1.5
    }
  };
}

function getMockExchanges(): CoinGeckoExchange[] {
  return [
    {
      id: "binance",
      name: "Binance",
      year_established: 2017,
      country: "Cayman Islands",
      image: "https://assets.coingecko.com/markets/images/52/small/binance.jpg",
      trade_volume_24h_btc: 1250000,
      trust_score: 10
    },
    {
      id: "coinbase",
      name: "Coinbase Exchange",
      year_established: 2012,
      country: "United States",
      image: "https://assets.coingecko.com/markets/images/23/small/Coinbase.jpg",
      trade_volume_24h_btc: 850000,
      trust_score: 10
    },
    {
      id: "kraken",
      name: "Kraken",
      year_established: 2011,
      country: "United States",
      image: "https://assets.coingecko.com/markets/images/29/small/kraken.jpg",
      trade_volume_24h_btc: 450000,
      trust_score: 10
    }
  ];
}

function getMockCategories(): CoinGeckoCategory[] {
  return [
    {
      id: "smart-contract-platform",
      name: "Smart Contract Platform",
      market_cap: 2350000000000,
      market_cap_change_24h: 2.3,
      content: "Cryptocurrencies with smart contract functionality",
      top_3_coins: [
        "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        "https://assets.coingecko.com/coins/images/4128/small/solana.png",
        "https://assets.coingecko.com/coins/images/825/small/binance-coin-logo.png"
      ]
    },
    {
      id: "defi",
      name: "DeFi",
      market_cap: 780000000000,
      market_cap_change_24h: -1.2,
      content: "Decentralized financial technology",
      top_3_coins: [
        "https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png",
        "https://assets.coingecko.com/coins/images/9956/small/4943.png",
        "https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png"
      ]
    },
    {
      id: "metaverse",
      name: "Metaverse",
      market_cap: 350000000000,
      market_cap_change_24h: 5.7,
      content: "Platforms focused on virtual reality environments",
      top_3_coins: [
        "https://assets.coingecko.com/coins/images/878/small/decentraland-mana.png",
        "https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg",
        "https://assets.coingecko.com/coins/images/14001/small/axie_infinity_logo.png"
      ]
    }
  ];
}

function getMockTrendingCoins(): CoinGeckoTrending {
  return {
    coins: [
      {
        item: {
          id: "pepe",
          name: "Pepe",
          symbol: "PEPE",
          market_cap_rank: 36,
          thumb: "https://assets.coingecko.com/coins/images/29850/thumb/pepe-token.jpeg",
          small: "https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg",
          price_btc: 0.0000000342
        }
      },
      {
        item: {
          id: "injective-protocol",
          name: "Injective",
          symbol: "INJ",
          market_cap_rank: 39,
          thumb: "https://assets.coingecko.com/coins/images/12882/thumb/Secondary_Symbol.png",
          small: "https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png",
          price_btc: 0.00058
        }
      },
      {
        item: {
          id: "sui",
          name: "Sui",
          symbol: "SUI",
          market_cap_rank: 59,
          thumb: "https://assets.coingecko.com/coins/images/26375/thumb/sui_asset.jpeg",
          small: "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg",
          price_btc: 0.000051
        }
      }
    ]
  };
}

function getMockOHLC(id: string, days: number | string): [number, number, number, number, number][] {
  const numDays = typeof days === 'string' ? parseInt(days) : days;
  const points = Math.min(numDays * 2, 30); // Maximum 30 points for mock data
  const now = Date.now();
  const msPerPoint = (numDays * 86400000) / points;
  
  const basePrice = id === 'bitcoin' ? 290000 : id === 'ethereum' ? 12000 : 480;
  const result: [number, number, number, number, number][] = [];
  
  for (let i = 0; i < points; i++) {
    const timestamp = now - (points - i) * msPerPoint;
    const volatility = 0.02; // 2% volatility
    
    const open = basePrice * (1 + (Math.random() - 0.5) * volatility);
    const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
    const min = Math.min(open, close) * 0.99;
    const max = Math.max(open, close) * 1.01;
    
    result.push([timestamp, open, max, min, close]);
  }
  
  return result;
}

function getMockSimplePrice(ids: string[], currencies: string[]): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  
  ids.forEach(id => {
    result[id] = {};
    const basePrice = id === 'bitcoin' ? 59000 : id === 'ethereum' ? 2450 : id === 'solana' ? 98 : 50;
    
    currencies.forEach(currency => {
      const multiplier = currency === 'brl' ? 5 : 1;
      result[id][currency] = basePrice * multiplier;
      
      // Add 24h change if requested
      if (currencies.includes(`${currency}_24h_change`)) {
        result[id][`${currency}_24h_change`] = (Math.random() * 10) - 5; // Between -5% and +5%
      }
    });
  });
  
  return result;
}

function getMockSearchResults(query: string): {
  coins: Array<{id: string, name: string, symbol: string, market_cap_rank: number}>,
  categories: Array<{id: string, name: string}>,
  exchanges: Array<{id: string, name: string, market_type: string}>
} {
  // Simplified search results based on query
  return {
    coins: [
      { id: "bitcoin", name: "Bitcoin", symbol: "btc", market_cap_rank: 1 },
      { id: "ethereum", name: "Ethereum", symbol: "eth", market_cap_rank: 2 },
      { id: "solana", name: "Solana", symbol: "sol", market_cap_rank: 3 }
    ],
    categories: [
      { id: "smart-contract-platform", name: "Smart Contract Platform" },
      { id: "defi", name: "DeFi" }
    ],
    exchanges: [
      { id: "binance", name: "Binance", market_type: "spot" },
      { id: "coinbase", name: "Coinbase Exchange", market_type: "spot" }
    ]
  };
}

function getMockPortfolioPrices(coinIds: string[]): Record<string, {brl: number, usd: number, brl_24h_change: number}> {
  const result: Record<string, {brl: number, usd: number, brl_24h_change: number}> = {};
  
  coinIds.forEach(id => {
    const usdPrice = id === 'bitcoin' ? 59000 : id === 'ethereum' ? 2450 : id === 'solana' ? 98 : 
                    id === 'cardano' ? 1.2 : id === 'binancecoin' ? 320 : 10;
    
    result[id] = {
      brl: usdPrice * 5,
      usd: usdPrice,
      brl_24h_change: (Math.random() * 10) - 5 // Between -5% and +5%
    };
  });
  
  return result;
}

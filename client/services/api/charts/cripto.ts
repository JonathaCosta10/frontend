// Crypto Charts API Service
import { developmentConfig, simulateApiDelay } from "../../config/development";

export interface CryptoPrice {
  ticker: string;
  nome: string;
  preco: number;
  variacao24h: number;
  volume24h: number;
  marketCap: number;
}

export interface CryptoHolding {
  ticker: string;
  quantidade: number;
  precoMedio: number;
  valorAtual: number;
  percentualCarteira: number;
}

export interface CryptoHistorical {
  data: string;
  preco: number;
  volume: number;
}

// API endpoints for crypto charts
export const cryptoChartsApi = {
  // Preços de Criptomoedas em Tempo Real - /api/cripto/precos_tempo_real
  async getPrecosTempoRealData(): Promise<CryptoPrice[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return [
        { 
          ticker: "BTC", 
          nome: "Bitcoin", 
          preco: 43250.80, 
          variacao24h: 2.4, 
          volume24h: 15600000000, 
          marketCap: 847000000000 
        },
        { 
          ticker: "ETH", 
          nome: "Ethereum", 
          preco: 2650.45, 
          variacao24h: -1.2, 
          volume24h: 8500000000, 
          marketCap: 318000000000 
        },
        { 
          ticker: "BNB", 
          nome: "Binance Coin", 
          preco: 325.70, 
          variacao24h: 0.8, 
          volume24h: 1200000000, 
          marketCap: 50000000000 
        },
        { 
          ticker: "SOL", 
          nome: "Solana", 
          preco: 98.25, 
          variacao24h: 5.2, 
          volume24h: 2100000000, 
          marketCap: 42000000000 
        },
        { 
          ticker: "ADA", 
          nome: "Cardano", 
          preco: 0.485, 
          variacao24h: -0.5, 
          volume24h: 320000000, 
          marketCap: 17000000000 
        },
        { 
          ticker: "DOT", 
          nome: "Polkadot", 
          preco: 7.85, 
          variacao24h: 1.8, 
          volume24h: 180000000, 
          marketCap: 10000000000 
        },
        { 
          ticker: "MATIC", 
          nome: "Polygon", 
          preco: 0.92, 
          variacao24h: 3.1, 
          volume24h: 450000000, 
          marketCap: 9000000000 
        },
        { 
          ticker: "AVAX", 
          nome: "Avalanche", 
          preco: 36.80, 
          variacao24h: -2.1, 
          volume24h: 520000000, 
          marketCap: 14000000000 
        },
      ];
    }

    const response = await fetch('/api/cripto/precos_tempo_real');
    if (!response.ok) throw new Error('Failed to fetch crypto prices data');
    return response.json();
  },

  // Portfolio de Criptomoedas - /api/cripto/portfolio
  async getPortfolioData(): Promise<CryptoHolding[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return [
        { 
          ticker: "BTC", 
          quantidade: 0.15, 
          precoMedio: 38500, 
          valorAtual: 6487.62, 
          percentualCarteira: 45.2 
        },
        { 
          ticker: "ETH", 
          quantidade: 2.5, 
          precoMedio: 2400, 
          valorAtual: 6626.13, 
          percentualCarteira: 46.1 
        },
        { 
          ticker: "SOL", 
          quantidade: 12, 
          precoMedio: 85, 
          valorAtual: 1179, 
          percentualCarteira: 8.2 
        },
        { 
          ticker: "ADA", 
          quantidade: 150, 
          precoMedio: 0.52, 
          valorAtual: 72.75, 
          percentualCarteira: 0.5 
        },
      ];
    }

    const response = await fetch('/api/cripto/portfolio');
    if (!response.ok) throw new Error('Failed to fetch crypto portfolio data');
    return response.json();
  },

  // Histórico de Preços - /api/cripto/historico_precos
  async getHistoricoPrecosData(ticker: string, periodo: '24h' | '7d' | '30d' | '90d' | '1y'): Promise<CryptoHistorical[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      
      const basePrice = ticker === 'BTC' ? 43000 : ticker === 'ETH' ? 2600 : 100;
      const points = periodo === '24h' ? 24 : periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;
      
      return Array.from({ length: points }, (_, i) => ({
        data: new Date(Date.now() - (points - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        preco: basePrice + (Math.random() - 0.5) * basePrice * 0.1,
        volume: Math.random() * 1000000000,
      }));
    }

    const response = await fetch(`/api/cripto/historico_precos?ticker=${ticker}&periodo=${periodo}`);
    if (!response.ok) throw new Error('Failed to fetch crypto historical data');
    return response.json();
  },

  // Market Overview - /api/cripto/market_overview
  async getMarketOverviewData(): Promise<{
    marketCapTotal: number;
    volume24h: number;
    dominanciaBTC: number;
    medo_ganancia_index: number;
  }> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return {
        marketCapTotal: 1680000000000, // 1.68 trilhões
        volume24h: 45000000000, // 45 bilhões
        dominanciaBTC: 52.3,
        medo_ganancia_index: 65, // Ganância
      };
    }

    const response = await fetch('/api/cripto/market_overview');
    if (!response.ok) throw new Error('Failed to fetch crypto market overview data');
    return response.json();
  },

  // Top Gainers/Losers - /api/cripto/top_movers
  async getTopMoversData(): Promise<{
    gainers: CryptoPrice[];
    losers: CryptoPrice[];
  }> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return {
        gainers: [
          { ticker: "SOL", nome: "Solana", preco: 98.25, variacao24h: 5.2, volume24h: 2100000000, marketCap: 42000000000 },
          { ticker: "MATIC", nome: "Polygon", preco: 0.92, variacao24h: 3.1, volume24h: 450000000, marketCap: 9000000000 },
          { ticker: "BTC", nome: "Bitcoin", preco: 43250.80, variacao24h: 2.4, volume24h: 15600000000, marketCap: 847000000000 },
        ],
        losers: [
          { ticker: "AVAX", nome: "Avalanche", preco: 36.80, variacao24h: -2.1, volume24h: 520000000, marketCap: 14000000000 },
          { ticker: "ETH", nome: "Ethereum", preco: 2650.45, variacao24h: -1.2, volume24h: 8500000000, marketCap: 318000000000 },
          { ticker: "ADA", nome: "Cardano", preco: 0.485, variacao24h: -0.5, volume24h: 320000000, marketCap: 17000000000 },
        ],
      };
    }

    const response = await fetch('/api/cripto/top_movers');
    if (!response.ok) throw new Error('Failed to fetch crypto top movers data');
    return response.json();
  },
};

// Market Charts API Service
import { developmentConfig, simulateApiDelay } from "../../config/development";
import { authenticatedGet, authenticatedPost, authenticatedFetch } from '@/lib/authenticatedFetch';

export interface FIIData {
  ticker: string;
  nome: string;
  preco: number;
  variacao: number;
  dividendYield: number;
  pVP: number;
  setor: string;
  patrimonio: number;
}

export interface IndicadorEconomico {
  nome: string;
  valor: number;
  variacao: number;
  data: string;
  unidade: string;
}

export interface TickerAnalysis {
  ticker: string;
  nome: string;
  preco: number;
  fundamentalista: {
    pVP: number;
    dividendYield: number;
    roe: number;
    patrimonio: number;
    liquidez: number;
  };
  tecnica: {
    rsi: number;
    macd: number;
    bollingerBands: {
      superior: number;
      media: number;
      inferior: number;
    };
    suportes: number[];
    resistencias: number[];
  };
}

// API endpoints for market charts
export const marketChartsApi = {
  // Lista de FIIs - /api/mercado/fiis_lista
  async getFIIsListaData(setor?: string, orderBy?: string): Promise<FIIData[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return [
        { 
          ticker: "HGLG11", 
          nome: "Hedge Logística", 
          preco: 123.45, 
          variacao: 1.2, 
          dividendYield: 8.5, 
          pVP: 0.95, 
          setor: "Logística", 
          patrimonio: 2100000000 
        },
        { 
          ticker: "KNRI11", 
          nome: "Kinea Rendimentos Imobiliários", 
          preco: 110.22, 
          variacao: -0.5, 
          dividendYield: 9.2, 
          pVP: 1.02, 
          setor: "Corporativo", 
          patrimonio: 3200000000 
        },
        { 
          ticker: "MXRF11", 
          nome: "Maxi Renda", 
          preco: 10.01, 
          variacao: 0.8, 
          dividendYield: 7.8, 
          pVP: 0.89, 
          setor: "Híbrido", 
          patrimonio: 4100000000 
        },
        { 
          ticker: "XPLG11", 
          nome: "XP Log", 
          preco: 89.67, 
          variacao: 2.1, 
          dividendYield: 8.9, 
          pVP: 0.97, 
          setor: "Logística", 
          patrimonio: 1800000000 
        },
        { 
          ticker: "BTLG11", 
          nome: "BTG Pactual Logística", 
          preco: 95.33, 
          variacao: -1.3, 
          dividendYield: 8.1, 
          pVP: 1.05, 
          setor: "Logística", 
          patrimonio: 2700000000 
        },
      ];
    }

    const params = new URLSearchParams();
    if (setor) params.append('setor', setor);
    if (orderBy) params.append('orderBy', orderBy);

    const response = await authenticatedGet('/api/mercado/fiis_lista?${params.toString()}');
    if (!response.ok) throw new Error('Failed to fetch FIIs lista data');
    return response.json();
  },

  // Indicadores Econômicos - /api/mercado/indicadores_economicos
  async getIndicadoresEconomicosData(): Promise<IndicadorEconomico[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return [
        { nome: "SELIC", valor: 11.75, variacao: 0, data: "2024-01-17", unidade: "%" },
        { nome: "IPCA", valor: 4.62, variacao: -0.38, data: "2024-01-10", unidade: "%" },
        { nome: "CDI", valor: 11.65, variacao: 0, data: "2024-01-17", unidade: "%" },
        { nome: "DÓLAR", valor: 4.95, variacao: 1.2, data: "2024-01-17", unidade: "BRL" },
        { nome: "EURO", valor: 5.42, variacao: 0.8, data: "2024-01-17", unidade: "BRL" },
        { nome: "IBOVESPA", valor: 125430, variacao: 0.45, data: "2024-01-17", unidade: "pontos" },
        { nome: "IFIX", valor: 2890, variacao: -0.15, data: "2024-01-17", unidade: "pontos" },
      ];
    }

    const response = await authenticatedGet('/api/mercado/indicadores_economicos');
    if (!response.ok) throw new Error('Failed to fetch indicadores econômicos data');
    return response.json();
  },

  // Análise de Ticker - /api/mercado/analise_ticker
  async getAnaliseTickerData(ticker: string): Promise<TickerAnalysis> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return {
        ticker: ticker,
        nome: `Análise de ${ticker}`,
        preco: 123.45,
        fundamentalista: {
          pVP: 0.95,
          dividendYield: 8.5,
          roe: 12.3,
          patrimonio: 2100000000,
          liquidez: 850000,
        },
        tecnica: {
          rsi: 45.2,
          macd: 1.8,
          bollingerBands: {
            superior: 130.50,
            media: 123.45,
            inferior: 116.40,
          },
          suportes: [118.00, 115.50, 110.00],
          resistencias: [128.00, 135.00, 142.00],
        },
      };
    }

    const response = await authenticatedGet('/api/mercado/analise_ticker?ticker=${ticker}');
    if (!response.ok) throw new Error('Failed to fetch análise ticker data');
    return response.json();
  },

  // Lista de Desejos - /api/mercado/lista_desejos
  async getListaDesejosData(): Promise<FIIData[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return [
        { 
          ticker: "VILG11", 
          nome: "Vinci Log", 
          preco: 102.89, 
          variacao: 0.4, 
          dividendYield: 8.7, 
          pVP: 0.98, 
          setor: "Logística", 
          patrimonio: 3900000000 
        },
        { 
          ticker: "RBRR11", 
          nome: "RBR Rendimento Residencial", 
          preco: 78.92, 
          variacao: 1.8, 
          dividendYield: 9.5, 
          pVP: 0.92, 
          setor: "Residencial", 
          patrimonio: 1400000000 
        },
      ];
    }

    const response = await authenticatedGet('/api/mercado/lista_desejos');
    if (!response.ok) throw new Error('Failed to fetch lista desejos data');
    return response.json();
  },

  // Performance de Setor - /api/mercado/performance_setor
  async getPerformanceSetorData(periodo: '1d' | '7d' | '30d' | '90d' | '1y'): Promise<{
    setor: string;
    performance: number;
    fundos: number;
  }[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return [
        { setor: "Logística", performance: 2.1, fundos: 25 },
        { setor: "Corporativo", performance: 1.8, fundos: 18 },
        { setor: "Híbrido", performance: 1.2, fundos: 12 },
        { setor: "Residencial", performance: 0.9, fundos: 8 },
        { setor: "Varejo", performance: 0.5, fundos: 6 },
      ];
    }

    const response = await authenticatedGet('/api/mercado/performance_setor?periodo=${periodo}');
    if (!response.ok) throw new Error('Failed to fetch performance setor data');
    return response.json();
  },

  // Ranking de FIIs - /api/mercado/ranking_fiis
  async getRankingFIIsData(criterio: 'dividend_yield' | 'variacao' | 'liquidez' | 'pvp'): Promise<FIIData[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      const baseData = await this.getFIIsListaData();
      
      // Sort based on criteria
      switch (criterio) {
        case 'dividend_yield':
          return baseData.sort((a, b) => b.dividendYield - a.dividendYield);
        case 'variacao':
          return baseData.sort((a, b) => b.variacao - a.variacao);
        case 'pvp':
          return baseData.sort((a, b) => a.pVP - b.pVP);
        default:
          return baseData;
      }
    }

    const response = await authenticatedGet('/api/mercado/ranking_fiis?criterio=${criterio}');
    if (!response.ok) throw new Error('Failed to fetch ranking FIIs data');
    return response.json();
  },
};

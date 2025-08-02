/**
 * API service for Market - FII Market Chart
 * 
 * Este arquivo gerencia todas as chamadas de API relacionadas aos gráficos
 * de mercado de Fundos Imobiliários (FIIs).
 */

import { developmentConfig, simulateApiDelay } from "../../../config/development";

// ============= INTERFACES =============

export interface FIIData {
  ticker: string;
  nome: string;
  preco: number;
  variacao_diaria: number;
  variacao_percentual: number;
  dividend_yield: number;
  p_vp: number;
  liquidez_diaria: number;
  patrimonio_liquido: number;
  setor: string;
  ultimo_dividendo: {
    data: string;
    valor: number;
    rendimento: number;
  };
  cotacao_historica: Array<{
    data: string;
    abertura: number;
    maxima: number;
    minima: number;
    fechamento: number;
    volume: number;
  }>;
}

export interface FIIRanking {
  categoria: 'dividend_yield' | 'liquidez' | 'p_vp' | 'patrimonio';
  titulo: string;
  fiis: Array<{
    posicao: number;
    ticker: string;
    nome: string;
    valor: number;
    variacao: number;
    badge?: string;
  }>;
}

export interface FIIMarketOverview {
  total_fiis: number;
  volume_total: number;
  variacao_media: number;
  dividend_yield_medio: number;
  p_vp_medio: number;
  setores: Array<{
    nome: string;
    quantidade: number;
    valor_medio: number;
    performance: number;
  }>;
  rankings: FIIRanking[];
  destaques: {
    maior_alta: FIIData;
    maior_baixa: FIIData;
    maior_volume: FIIData;
    melhor_dividend_yield: FIIData;
  };
}

// ============= API SERVICE =============

class FIIMarketChartApi {
  
  /**
   * Busca dados gerais do mercado de FIIs
   * 
   * @param filtros - Filtros para personalizar os dados
   * @returns Promise com overview do mercado de FIIs
   */
  async getMarketOverview(filtros: {
    setor?: string;
    dividend_yield_min?: number;
    liquidez_min?: number;
    orderBy?: 'dividend_yield' | 'liquidez' | 'variacao' | 'p_vp';
  } = {}): Promise<FIIMarketOverview> {
    
    if (developmentConfig.useMockData) {
      if (developmentConfig.showApiLogs) {
        console.log("🔄 [FII-MARKET] Usando dados mock para overview do mercado");
      }
      await simulateApiDelay(500);
      return this.getMockMarketOverview(filtros);
    }

    try {
      const queryParams = new URLSearchParams();
      
      if (filtros.setor) queryParams.append('setor', filtros.setor);
      if (filtros.dividend_yield_min) queryParams.append('dividend_yield_min', filtros.dividend_yield_min.toString());
      if (filtros.liquidez_min) queryParams.append('liquidez_min', filtros.liquidez_min.toString());
      if (filtros.orderBy) queryParams.append('order_by', filtros.orderBy);

      const response = await fetch(
        `/api/market/fiis/overview?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      if (developmentConfig.showApiLogs) {
        console.log("✅ [FII-MARKET] Dados recebidos da API:", data);
      }

      return data;

    } catch (error) {
      console.error("❌ [FII-MARKET] Erro ao buscar overview do mercado:", error);
      
      if (developmentConfig.showApiLogs) {
        console.warn("⚠️ [FII-MARKET] Usando fallback para dados mock");
      }
      
      return this.getMockMarketOverview(filtros);
    }
  }

  /**
   * Busca dados específicos de um FII
   * 
   * @param ticker - Código do FII (ex: HGLG11)
   * @param periodo - Período para dados históricos
   * @returns Promise com dados detalhados do FII
   */
  async getFIIDetails(ticker: string, periodo: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<FIIData> {
    
    if (developmentConfig.useMockData) {
      await simulateApiDelay(300);
      return this.getMockFIIDetails(ticker, periodo);
    }

    try {
      const response = await fetch(
        `/api/market/fiis/${ticker.toUpperCase()}/details?periodo=${periodo}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error(`❌ [FII-MARKET] Erro ao buscar detalhes do FII ${ticker}:`, error);
      return this.getMockFIIDetails(ticker, periodo);
    }
  }

  /**
   * Busca FIIs por setor
   * 
   * @param setor - Nome do setor
   * @param limit - Número máximo de resultados
   * @returns Promise com lista de FIIs do setor
   */
  async getFIIsBySetor(setor: string, limit: number = 20): Promise<FIIData[]> {
    
    if (developmentConfig.useMockData) {
      await simulateApiDelay(250);
      return this.getMockFIIsBySetor(setor, limit);
    }

    try {
      const response = await fetch(
        `/api/market/fiis/setor/${encodeURIComponent(setor)}?limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error(`❌ [FII-MARKET] Erro ao buscar FIIs do setor ${setor}:`, error);
      return this.getMockFIIsBySetor(setor, limit);
    }
  }

  // ============= MOCK DATA METHODS =============

  private getMockMarketOverview(filtros: any): FIIMarketOverview {
    const rankings: FIIRanking[] = [
      {
        categoria: 'dividend_yield',
        titulo: 'Maiores Dividend Yields',
        fiis: [
          { posicao: 1, ticker: 'HGLG11', nome: 'Cshg Logística', valor: 11.2, variacao: 2.3 },
          { posicao: 2, ticker: 'KNRI11', nome: 'Kinea Renda', valor: 10.8, variacao: -0.5 },
          { posicao: 3, ticker: 'XPLG11', nome: 'XP Log', valor: 10.5, variacao: 1.8, badge: 'Hot' },
          { posicao: 4, ticker: 'IRDM11', nome: 'Iridium', valor: 10.1, variacao: 0.9 },
          { posicao: 5, ticker: 'MXRF11', nome: 'Maxi Renda', valor: 9.8, variacao: -1.2 }
        ]
      },
      {
        categoria: 'liquidez',
        titulo: 'Maior Liquidez',
        fiis: [
          { posicao: 1, ticker: 'KNRI11', nome: 'Kinea Renda', valor: 45000000, variacao: 5.2 },
          { posicao: 2, ticker: 'HGLG11', nome: 'Cshg Logística', valor: 38000000, variacao: 3.1 },
          { posicao: 3, ticker: 'XPML11', nome: 'XP Malls', valor: 32000000, variacao: -2.1 },
          { posicao: 4, ticker: 'BCFF11', nome: 'BC Ffii', valor: 28000000, variacao: 1.5 },
          { posicao: 5, ticker: 'VISC11', nome: 'Vinci Sc', valor: 25000000, variacao: 4.7 }
        ]
      }
    ];

    return {
      total_fiis: 287,
      volume_total: 1850000000,
      variacao_media: 1.45,
      dividend_yield_medio: 8.2,
      p_vp_medio: 0.94,
      setores: [
        { nome: 'Logística', quantidade: 45, valor_medio: 85.30, performance: 3.2 },
        { nome: 'Tijolo', quantidade: 38, valor_medio: 92.15, performance: -1.8 },
        { nome: 'Shoppings', quantidade: 32, valor_medio: 78.90, performance: 2.1 },
        { nome: 'Lajes Corporativas', quantidade: 28, valor_medio: 110.50, performance: 0.9 },
        { nome: 'Papel', quantidade: 25, valor_medio: 98.75, performance: 4.5 }
      ],
      rankings,
      destaques: {
        maior_alta: this.getMockFIIDetails('HGLG11', '7d'),
        maior_baixa: this.getMockFIIDetails('XPML11', '7d'),
        maior_volume: this.getMockFIIDetails('KNRI11', '7d'),
        melhor_dividend_yield: this.getMockFIIDetails('HGLG11', '7d')
      }
    };
  }

  private getMockFIIDetails(ticker: string, periodo: string): FIIData {
    const baseData = {
      ticker: ticker.toUpperCase(),
      nome: this.getFIIName(ticker),
      preco: 85.30 + (Math.random() - 0.5) * 20,
      variacao_diaria: (Math.random() - 0.5) * 6,
      variacao_percentual: (Math.random() - 0.5) * 8,
      dividend_yield: 8.5 + Math.random() * 4,
      p_vp: 0.90 + Math.random() * 0.20,
      liquidez_diaria: 1000000 + Math.random() * 5000000,
      patrimonio_liquido: 500000000 + Math.random() * 1000000000,
      setor: this.getFIISetor(ticker),
      ultimo_dividendo: {
        data: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        valor: 0.60 + Math.random() * 0.40,
        rendimento: 0.80 + Math.random() * 0.60
      },
      cotacao_historica: this.generateMockPriceHistory(this.getPeriodDays(periodo), baseData.preco)
    };

    return baseData;
  }

  private getMockFIIsBySetor(setor: string, limit: number): FIIData[] {
    const tickers = this.getFIITickersBySetor(setor);
    return tickers.slice(0, limit).map(ticker => this.getMockFIIDetails(ticker, '30d'));
  }

  private getFIIName(ticker: string): string {
    const names: { [key: string]: string } = {
      'HGLG11': 'Cshg Logística',
      'KNRI11': 'Kinea Renda Imobiliária',
      'XPLG11': 'XP Log',
      'XPML11': 'XP Malls',
      'IRDM11': 'Iridium Recebíveis',
      'MXRF11': 'Maxi Renda',
      'VISC11': 'Vinci Shopping Centers',
      'BCFF11': 'BC Ffii'
    };
    return names[ticker.toUpperCase()] || `FII ${ticker.toUpperCase()}`;
  }

  private getFIISetor(ticker: string): string {
    const setores: { [key: string]: string } = {
      'HGLG11': 'Logística',
      'KNRI11': 'Papel',
      'XPLG11': 'Logística',
      'XPML11': 'Shoppings',
      'IRDM11': 'Papel',
      'MXRF11': 'Tijolo',
      'VISC11': 'Shoppings',
      'BCFF11': 'Lajes Corporativas'
    };
    return setores[ticker.toUpperCase()] || 'Tijolo';
  }

  private getFIITickersBySetor(setor: string): string[] {
    const setores: { [key: string]: string[] } = {
      'Logística': ['HGLG11', 'XPLG11', 'LOGI11', 'LVBI11', 'RBRR11'],
      'Papel': ['KNRI11', 'IRDM11', 'KNCR11', 'FIIB11', 'RBRF11'],
      'Shoppings': ['XPML11', 'VISC11', 'MALL11', 'JRDM11', 'SHPH11'],
      'Tijolo': ['MXRF11', 'TGAR11', 'HGRE11', 'BTLG11', 'RECT11'],
      'Lajes Corporativas': ['BCFF11', 'ABCP11', 'CPTS11', 'FEXC11', 'JSRE11']
    };
    return setores[setor] || ['HGLG11', 'KNRI11', 'XPLG11'];
  }

  private getPeriodDays(periodo: string): number {
    const days: { [key: string]: number } = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    return days[periodo] || 30;
  }

  private generateMockPriceHistory(days: number, currentPrice: number) {
    const data = [];
    let price = currentPrice;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = (Math.random() - 0.5) * 4; // Variação de ±2
      const abertura = price;
      const variacao = variation / 100 * price;
      
      price = Math.max(price + variacao, 10); // Preço mínimo de 10
      
      const maxima = Math.max(abertura, price) + Math.random() * 2;
      const minima = Math.min(abertura, price) - Math.random() * 2;
      
      data.push({
        data: date.toISOString().split('T')[0],
        abertura: Number(abertura.toFixed(2)),
        maxima: Number(maxima.toFixed(2)),
        minima: Number(Math.max(minima, 10).toFixed(2)),
        fechamento: Number(price.toFixed(2)),
        volume: Math.floor(100000 + Math.random() * 500000)
      });
    }
    
    return data;
  }
}

// ============= EXPORT =============

export const fiiMarketChartApi = new FIIMarketChartApi();

// Re-export types for convenience
export type {
  FIIData,
  FIIRanking,
  FIIMarketOverview
};

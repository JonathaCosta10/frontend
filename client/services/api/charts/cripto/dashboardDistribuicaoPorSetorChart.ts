/**
 * API service for Crypto Dashboard - Distribuição por Setor Chart
 * 
 * Este arquivo gerencia todas as chamadas de API relacionadas ao gráfico de distribuição
 * por setor de criptomoedas no dashboard de crypto.
 */

import { developmentConfig, simulateApiDelay } from "../../../config/development";

// ============= INTERFACES =============

export interface CryptoSectorAllocation {
  setor: string;
  valor_total: number;
  percentual: number;
  criptomoedas: CryptoInSector[];
}

export interface CryptoInSector {
  ticker: string;
  nome: string;
  valor: number;
  percentual_do_setor: number;
  preco_atual: number;
  variacao_24h: number;
}

export interface CryptoSectorDistributionResponse {
  setores: CryptoSectorAllocation[];
  valor_total_portfolio: number;
  ultima_atualizacao: string;
  melhor_setor: {
    nome: string;
    percentual_ganho: number;
  };
  pior_setor: {
    nome: string;
    percentual_perda: number;
  };
}

// ============= API SERVICE =============

class CryptoDashboardDistribuicaoPorSetorApi {
  
  /**
   * Busca dados de distribuição por setor de criptomoedas
   * 
   * @param filtros - Opções de filtro (período, valor mínimo, etc.)
   * @returns Promise com dados de distribuição por setor
   */
  async getDistribuicaoPorSetor(filtros: {
    periodo?: '24h' | '7d' | '30d' | '1y';
    valor_minimo?: number;
    incluir_stablecoins?: boolean;
  } = {}): Promise<CryptoSectorDistributionResponse> {
    
    // Development mode - usar dados mock
    if (developmentConfig.useMockData) {
      if (developmentConfig.showApiLogs) {
        console.log("🔄 [CRYPTO-SETOR] Usando dados mock para distribuição por setor");
      }
      await simulateApiDelay(400);
      return this.getMockSectorDistribution(filtros);
    }

    try {
      const queryParams = new URLSearchParams({
        periodo: filtros.periodo || '30d',
        valor_minimo: (filtros.valor_minimo || 0).toString(),
        incluir_stablecoins: (filtros.incluir_stablecoins || true).toString(),
      });

      const response = await fetch(
        `/api/crypto/dashboard/distribuicao-setor?${queryParams}`,
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
        console.log("✅ [CRYPTO-SETOR] Dados recebidos da API:", data);
      }

      return data;

    } catch (error) {
      console.error("❌ [CRYPTO-SETOR] Erro ao buscar distribuição por setor:", error);
      
      // Fallback para dados mock em caso de erro
      if (developmentConfig.showApiLogs) {
        console.warn("⚠️ [CRYPTO-SETOR] Usando fallback para dados mock devido ao erro");
      }
      
      return this.getMockSectorDistribution(filtros);
    }
  }

  /**
   * Busca performance detalhada de um setor específico
   * 
   * @param setor - Nome do setor para análise detalhada
   * @param periodo - Período de análise
   * @returns Promise com dados detalhados do setor
   */
  async getDetalhesSetor(setor: string, periodo: string = '30d'): Promise<{
    setor: string;
    performance: {
      rendimento_periodo: number;
      melhor_crypto: CryptoInSector;
      pior_crypto: CryptoInSector;
      volume_total: number;
    };
    historico_preco: Array<{
      data: string;
      valor_setor: number;
    }>;
  }> {
    
    if (developmentConfig.useMockData) {
      await simulateApiDelay(300);
      return this.getMockSectorDetails(setor, periodo);
    }

    try {
      const response = await fetch(
        `/api/crypto/dashboard/setor/${encodeURIComponent(setor)}/detalhes?periodo=${periodo}`,
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
      console.error("❌ [CRYPTO-SETOR] Erro ao buscar detalhes do setor:", error);
      return this.getMockSectorDetails(setor, periodo);
    }
  }

  // ============= MOCK DATA METHODS =============

  private getMockSectorDistribution(filtros: any): CryptoSectorDistributionResponse {
    const setores: CryptoSectorAllocation[] = [
      {
        setor: "DeFi",
        valor_total: 15000.00,
        percentual: 35.2,
        criptomoedas: [
          {
            ticker: "UNI",
            nome: "Uniswap",
            valor: 8000.00,
            percentual_do_setor: 53.3,
            preco_atual: 6.45,
            variacao_24h: 3.2
          },
          {
            ticker: "AAVE",
            nome: "Aave",
            valor: 4500.00,
            percentual_do_setor: 30.0,
            preco_atual: 85.30,
            variacao_24h: -1.8
          },
          {
            ticker: "COMP",
            nome: "Compound",
            valor: 2500.00,
            percentual_do_setor: 16.7,
            preco_atual: 42.15,
            variacao_24h: 5.4
          }
        ]
      },
      {
        setor: "Layer 1",
        valor_total: 12000.00,
        percentual: 28.1,
        criptomoedas: [
          {
            ticker: "SOL",
            nome: "Solana",
            valor: 7000.00,
            percentual_do_setor: 58.3,
            preco_atual: 95.40,
            variacao_24h: 2.7
          },
          {
            ticker: "AVAX",
            nome: "Avalanche",
            valor: 3500.00,
            percentual_do_setor: 29.2,
            preco_atual: 28.50,
            variacao_24h: -0.5
          },
          {
            ticker: "NEAR",
            nome: "Near Protocol",
            valor: 1500.00,
            percentual_do_setor: 12.5,
            preco_atual: 1.85,
            variacao_24h: 4.1
          }
        ]
      },
      {
        setor: "Gaming & NFT",
        valor_total: 8000.00,
        percentual: 18.7,
        criptomoedas: [
          {
            ticker: "AXS",
            nome: "Axie Infinity",
            valor: 4000.00,
            percentual_do_setor: 50.0,
            preco_atual: 5.25,
            variacao_24h: -2.3
          },
          {
            ticker: "SAND",
            nome: "The Sandbox",
            valor: 2500.00,
            percentual_do_setor: 31.3,
            preco_atual: 0.42,
            variacao_24h: 1.8
          },
          {
            ticker: "MANA",
            nome: "Decentraland",
            valor: 1500.00,
            percentual_do_setor: 18.7,
            preco_atual: 0.38,
            variacao_24h: 0.9
          }
        ]
      },
      {
        setor: "Stablecoins",
        valor_total: 7800.00,
        percentual: 18.0,
        criptomoedas: [
          {
            ticker: "USDC",
            nome: "USD Coin",
            valor: 4000.00,
            percentual_do_setor: 51.3,
            preco_atual: 1.00,
            variacao_24h: 0.0
          },
          {
            ticker: "BUSD",
            nome: "Binance USD",
            valor: 2800.00,
            percentual_do_setor: 35.9,
            preco_atual: 1.00,
            variacao_24h: 0.1
          },
          {
            ticker: "DAI",
            nome: "Dai",
            valor: 1000.00,
            percentual_do_setor: 12.8,
            preco_atual: 1.00,
            variacao_24h: 0.0
          }
        ]
      }
    ];

    return {
      setores,
      valor_total_portfolio: 42800.00,
      ultima_atualizacao: new Date().toISOString(),
      melhor_setor: {
        nome: "DeFi",
        percentual_ganho: 15.3
      },
      pior_setor: {
        nome: "Gaming & NFT",
        percentual_perda: -8.2
      }
    };
  }

  private getMockSectorDetails(setor: string, periodo: string) {
    return {
      setor,
      performance: {
        rendimento_periodo: setor === "DeFi" ? 15.3 : -8.2,
        melhor_crypto: {
          ticker: "UNI",
          nome: "Uniswap",
          valor: 8000.00,
          percentual_do_setor: 53.3,
          preco_atual: 6.45,
          variacao_24h: 3.2
        },
        pior_crypto: {
          ticker: "COMP",
          nome: "Compound",
          valor: 2500.00,
          percentual_do_setor: 16.7,
          preco_atual: 42.15,
          variacao_24h: 5.4
        },
        volume_total: 2500000
      },
      historico_preco: this.generateMockPriceHistory(30)
    };
  }

  private generateMockPriceHistory(days: number) {
    const data = [];
    const baseValue = 15000;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = (Math.random() - 0.5) * 2000; // Variação de ±1000
      const valor_setor = baseValue + variation;
      
      data.push({
        data: date.toISOString().split('T')[0],
        valor_setor: Math.max(0, valor_setor)
      });
    }
    
    return data;
  }
}

// ============= EXPORT =============

export const cryptoDashboardDistribuicaoPorSetorApi = new CryptoDashboardDistribuicaoPorSetorApi();

// Re-export types for convenience
export type {
  CryptoSectorAllocation,
  CryptoInSector,
  CryptoSectorDistributionResponse
};

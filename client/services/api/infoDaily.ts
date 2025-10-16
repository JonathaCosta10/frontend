/**
 * InfoDaily API Service
 * Serviço para buscar dados de índices e insights de mercado
 */

import { api } from '@/lib/api';
import { isDevelopment } from "@/config/development";

// Helper para simular delay de API em desenvolvimento ou produção (para dados mock)
const simulateApiDelay = (delay = 50) => {
  // Permite uso em produção para dados de fallback
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Interfaces para dados do mercado
export interface MarketIndex {
  codigo: string;
  nome: string;
  icone: string;
  fechamento: string;
  variacao_semanal: {
    valor: string;
    cor: string;
    simbolo: string;
  };
}

export interface MarketInsightTicker {
  ticker: string;
  nome_companhia: string;
  volume_diario?: string;
  ultimo_preco: string;
  data: string;
  variacao: {
    valor: string;
    cor: string;
    simbolo: string;
  };
}

export interface MarketInsightsData {
  titulo: string;
  ultima_atualizacao: string;
  maiores_volumes_negociacao: {
    titulo: string;
    "1D": MarketInsightTicker[];
    "7D": MarketInsightTicker[];
    "1M": MarketInsightTicker[];
  };
  variacao_portfolio: {
    titulo: string;
    "1D": MarketInsightTicker[];
    "7D": MarketInsightTicker[];
    "1M": MarketInsightTicker[];
  };
  oportunidades_preco_medio: {
    titulo: string;
    "1D": MarketInsightTicker[];
    "7D": MarketInsightTicker[];
    "1M": MarketInsightTicker[];
  };
}

/**
 * Classe de serviço API para InfoDaily
 */
class InfoDailyApiService {
  /**
   * Busca índices de mercado
   * @returns {Promise} Promise com os dados dos índices
   */
  async getMarketIndices() {
    console.log("🔄 infoDailyApi - Iniciando chamada getMarketIndices...");
    
    // Detectar ambiente para logs adicionais
    const isProd = typeof window !== 'undefined' && window.location.hostname.includes('organizesee.com.br');
    const endpoint = "/api/infodaily/";
    
    console.log(`📍 Chamando endpoint ${endpoint} em ambiente ${isProd ? 'produção' : 'desenvolvimento'}`);
    
    try {
      // Forçar uso do caminho correto em produção
      const apiEndpoint = isProd ? "/api/infodaily/" : endpoint;
      const response = await api.get(apiEndpoint, true);
      console.log("✅ Resposta InfoDaily recebida:", response);
      
      if (!response) {
        throw new Error("Resposta vazia da API");
      }
      
      return response;
    } catch (error) {
      console.error("❌ infoDailyApi - Erro ao buscar índices:", error);
      
      // Tentar URL alternativa em produção
      if (isProd) {
        try {
          console.log("🔍 Tentando URL alternativa para produção");
          const altResponse = await api.get("https://www.organizesee.com.br/services/api/infodaily/", true);
          console.log("✅ Resposta alternativa recebida:", altResponse);
          return altResponse;
        } catch (altError) {
          console.error("❌ Erro também na URL alternativa:", altError);
        }
      }
      
      // Use mock data only in development or as fallback in production errors
      if (isDevelopment || isProd) {
        console.log(`⚠️ Usando dados mock para índices (${isProd ? 'produção-fallback' : 'desenvolvimento'})`);
        // Reduzindo o delay para melhorar a performance
        await simulateApiDelay(50);
        return this.getMockIndices();
      }
      
      throw error;
    }
  }

  /**
   * Busca insights de mercado
   * @returns {Promise} Promise com os dados dos insights
   */
  async getMarketInsights() {
    console.log("🔄 infoDailyApi - Iniciando chamada getMarketInsights...");
    
    // Detectar ambiente para logs adicionais
    const isProd = typeof window !== 'undefined' && window.location.hostname.includes('organizesee.com.br');
    const endpoint = "/api/insights-mercado/";
    
    console.log(`📍 Chamando endpoint ${endpoint} em ambiente ${isProd ? 'produção' : 'desenvolvimento'}`);
    
    try {
      // Forçar uso do caminho correto em produção
      const apiEndpoint = isProd ? "/api/insights-mercado/" : endpoint;
      const response = await api.get(apiEndpoint, true);
      console.log("✅ Resposta Insights recebida:", response);
      
      if (!response) {
        throw new Error("Resposta vazia da API");
      }
      
      return response;
    } catch (error) {
      console.error("❌ infoDailyApi - Erro ao buscar insights:", error);
      
      // Tentar URL alternativa em produção
      if (isProd) {
        try {
          console.log("🔍 Tentando URL alternativa para produção");
          const altResponse = await api.get("https://www.organizesee.com.br/services/api/insights-mercado/", true);
          console.log("✅ Resposta alternativa recebida:", altResponse);
          return altResponse;
        } catch (altError) {
          console.error("❌ Erro também na URL alternativa:", altError);
        }
      }
      
      // Use mock data in development or as fallback in production errors
      if (isDevelopment || isProd) {
        console.log(`⚠️ Usando dados mock para insights (${isProd ? 'produção-fallback' : 'desenvolvimento'})`);
        // Reduzindo o delay para melhorar a performance
        await simulateApiDelay(50);
        return this.getMockInsights();
      }
      
      throw error;
    }
  }
  
  /**
   * Dados mock para índices (fallback)
   * Agora público para permitir acesso de emergência
   */
  public getMockIndices() {
    return {
      indices_mercado: {
        titulo: "Índices de Mercado",
        ultima_atualizacao: "2025-08-27T10:30:00Z", // Data atualizada
        dados: [
          {
            codigo: "ibovespa",
            nome: "Ibovespa",
            icone: "📈",
            fechamento: "R$ 126.845,67",
            variacao_semanal: {
              valor: "+2,1%",
              cor: "green",
              simbolo: "+"
            },
            // Campos adicionados para compatibilidade com MarketIndex
            ticker: "IBOV",
            nome_companhia: "Índice Bovespa",
            ultimo_preco: "126.845,67",
            variacao: {
              valor: "+2,1%",
              cor: "green",
              simbolo: "+"
            },
            source: "fallback"
          },
          {
            codigo: "ifix",
            nome: "Ifix",
            icone: "🏢",
            fechamento: "R$ 2.756,32",
            variacao_semanal: {
              valor: "+1,2%",
              cor: "green",
              simbolo: "+"
            },
            // Campos adicionados para compatibilidade com MarketIndex
            ticker: "IFIX",
            nome_companhia: "Índice de Fundos Imobiliários",
            ultimo_preco: "2.756,32",
            variacao: {
              valor: "+1,2%",
              cor: "green",
              simbolo: "+"
            },
            source: "fallback"
          },
          {
            codigo: "sp500",
            nome: "S&P 500",
            icone: "🇺🇸",
            fechamento: "US$ 4.567,85",
            variacao_semanal: {
              valor: "+0,8%",
              cor: "green",
              simbolo: "+"
            },
            // Campos adicionados para compatibilidade com MarketIndex
            ticker: "SPX",
            nome_companhia: "Standard & Poor's 500",
            ultimo_preco: "4.567,85",
            variacao: {
              valor: "+0,8%",
              cor: "green",
              simbolo: "+"
            },
            source: "fallback"
          },
          {
            codigo: "nasdaq",
            nome: "Nasdaq",
            icone: "💻",
            fechamento: "US$ 14.258,30",
            variacao_semanal: {
              valor: "-0,3%",
              cor: "red",
              simbolo: "-"
            },
            // Campos adicionados para compatibilidade com MarketIndex
            ticker: "NDX",
            nome_companhia: "Nasdaq Composite",
            ultimo_preco: "14.258,30",
            variacao: {
              valor: "-0,3%",
              cor: "red",
              simbolo: "-"
            },
            source: "fallback"
          }
        ]
      }
    };
  }
  
  /**
   * Dados mock para insights (fallback)
   * Agora público para permitir acesso de emergência
   */
  public getMockInsights() {
    return {
      insights_mercado: {
        titulo: "Insights de Mercado",
        ultima_atualizacao: "2025-08-27T10:30:00Z", // Data atualizada
        maiores_volumes_negociacao: {
          titulo: "Maiores Volumes de Negociação",
          "1D": [
            {
              ticker: "MGLU3",
              nome_companhia: "Magazine Luiza ON",
              volume_diario: "18.5M",
              ultimo_preco: "R$ 12,45",
              data: "2025-08-07",
              variacao: { valor: "+8,5%", cor: "green", simbolo: "+" }
            },
            {
              ticker: "VALE3",
              nome_companhia: "Vale ON",
              volume_diario: "25.3M",
              ultimo_preco: "R$ 68,90",
              data: "2025-08-07",
              variacao: { valor: "+2,1%", cor: "green", simbolo: "+" }
            },
            {
              ticker: "PETR4",
              nome_companhia: "Petrobras PN",
              volume_diario: "45.8M",
              ultimo_preco: "R$ 32,45",
              data: "2025-08-07",
              variacao: { valor: "+2,69%", cor: "green", simbolo: "+" }
            }
          ],
          "7D": [
            {
              ticker: "MGLU3",
              nome_companhia: "Magazine Luiza ON",
              volume_semanal: "95.5M",
              ultimo_preco: "R$ 11,45",
              periodo: "31/07/2025 a 07/08/2025",
              variacao: { valor: "-4,5%", cor: "red", simbolo: "-" }
            },
            {
              ticker: "USIM5",
              nome_companhia: "Usiminas PNA",
              volume_diario: "19.8M",
              ultimo_preco: "R$ 5,67",
              data: "2025-08-07",
              variacao: { valor: "+15,3%", cor: "green", simbolo: "+" }
            }
          ],
          "1M": [
            {
              ticker: "BBAS3",
              nome_companhia: "Banco do Brasil ON",
              volume_diario: "22.1M",
              ultimo_preco: "R$ 24,15",
              data: "2025-08-07",
              variacao: { valor: "+6,1%", cor: "green", simbolo: "+" }
            }
          ]
        },
        variacao_portfolio: {
          titulo: "Variação de Portfólio",
          "1D": [
            {
              ticker: "WEGE3",
              nome_companhia: "WEG ON",
              volume_diario: "8.2M",
              ultimo_preco: "R$ 45,85",
              data: "07/08/2025",
              variacao: { valor: "+5,2%", cor: "green", simbolo: "+" }
            },
            {
              ticker: "SUZB3",
              nome_companhia: "Suzano ON",
              volume_diario: "12.4M",
              ultimo_preco: "R$ 52,30",
              data: "07/08/2025",
              variacao: { valor: "+4,1%", cor: "green", simbolo: "+" }
            },
            {
              ticker: "RENT3",
              nome_companhia: "Localiza ON",
              volume_diario: "6.8M",
              ultimo_preco: "R$ 58,75",
              data: "07/08/2025",
              variacao: { valor: "-2,8%", cor: "red", simbolo: "-" }
            }
          ],
          "7D": [
            {
              ticker: "RADL3",
              nome_companhia: "Raia Drogasil ON",
              volume_semanal: "45.6M",
              ultimo_preco: "R$ 24,90",
              periodo: "31/07/2025 a 07/08/2025",
              variacao: { valor: "+8,7%", cor: "green", simbolo: "+" }
            },
            {
              ticker: "LREN3",
              nome_companhia: "Lojas Renner ON",
              volume_semanal: "38.2M",
              ultimo_preco: "R$ 16,42",
              periodo: "31/07/2025 a 07/08/2025",
              variacao: { valor: "+6,3%", cor: "green", simbolo: "+" }
            }
          ],
          "1M": [
            {
              ticker: "JBSS3",
              nome_companhia: "JBS ON",
              volume_mensal: "220.8M",
              ultimo_preco: "R$ 32,15",
              periodo: "08/07/2025 a 07/08/2025",
              variacao: { valor: "+15,2%", cor: "green", simbolo: "+" }
            }
          ]
        },
        oportunidades_preco_medio: {
          titulo: "Oportunidades Preço Médio",
          "1D": [
            {
              ticker: "TIMS3",
              nome_companhia: "TIM ON",
              volume_diario: "15.7M",
              ultimo_preco: "R$ 12,80",
              data: "07/08/2025",
              variacao: { valor: "+3,8%", cor: "green", simbolo: "+" }
            },
            {
              ticker: "GGBR4",
              nome_companhia: "Gerdau PN",
              volume_diario: "22.1M",
              ultimo_preco: "R$ 20,45",
              data: "07/08/2025",
              variacao: { valor: "+2,9%", cor: "green", simbolo: "+" }
            }
          ],
          "7D": [
            {
              ticker: "CCRO3",
              nome_companhia: "CCR ON",
              volume_semanal: "52.4M",
              ultimo_preco: "R$ 11,25",
              periodo: "31/07/2025 a 07/08/2025",
              variacao: { valor: "+4,6%", cor: "green", simbolo: "+" }
            },
            {
              ticker: "EQTL3",
              nome_companhia: "Equatorial ON",
              volume_semanal: "34.8M",
              ultimo_preco: "R$ 28,90",
              periodo: "31/07/2025 a 07/08/2025",
              variacao: { valor: "+7,2%", cor: "green", simbolo: "+" }
            }
          ],
          "1M": [
            {
              ticker: "VIVT3",
              nome_companhia: "Vivo ON",
              volume_mensal: "125.9M",
              ultimo_preco: "R$ 42,35",
              periodo: "08/07/2025 a 07/08/2025",
              variacao: { valor: "+18,4%", cor: "green", simbolo: "+" }
            }
          ]
        }
      }
    };
  }
}

// Exportar instância singleton
export const infoDailyApi = new InfoDailyApiService();

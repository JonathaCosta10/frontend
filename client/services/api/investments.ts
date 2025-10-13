import { api } from "@/lib/api";
import { isDevelopment, secureLog } from "@/config/development";

// Helper para simular delay de API em desenvolvimento
const simulateApiDelay = (delay = 300) => {
  if (!isDevelopment) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export interface AlocacaoTipo {
  Acoes: number;
  "Fundos Imobiliários": number;
  "Renda Fixa": number;
}

// Nova interface para o formato da API
export interface AlocacaoTipoItem {
  tipo: string;
  valor_atual: number;
  percentual_alocacao: number;
  quantidade_ativos: number;
}

export interface AlocacaoTipoResponse {
  total_carteira: number;
  alocacao_por_tipo: AlocacaoTipoItem[];
  resumo: {
    tipos_diferentes: number;
    maior_alocacao: AlocacaoTipoItem;
    menor_alocacao: AlocacaoTipoItem;
  };
}

export interface SetorAcao {
  ticker: string;
  valor_total: number;
}

export interface SetorInfo {
  setor_atividade: string;
  valor_total_setor: number;
  percentual_do_total: number;
  acoes: SetorAcao[];
}

// Novas interfaces para o formato atual da API
export interface AtivoSetor {
  ticker: string;
  nome_empresarial: string;
  quantidade: string;
  preco_atual: number;
  valor_atual: number;
  valor_investido: number;
}

export interface SetorData {
  setor: string;
  valor_total: number;
  percentual_alocacao: number;
  quantidade_ativos: number;
  ativos: AtivoSetor[];
}

export interface SetorResponse {
  success: boolean;
  message: string;
  data: {
    tipo_analise: string;
    total_ativos: number;
    valor_total: number;
    setores: SetorData[];
    resumo: {
      quantidade_setores: number;
      maior_concentracao: {
        setor: string;
        percentual: number;
      };
      menor_concentracao: {
        setor: string;
        percentual: number;
      };
    };
  };
}

export interface DividendoMes {
  data_referencia: string;
  valor_total: number;
}

export interface DividendoTicker {
  ticker: string;
  dados: Array<{
    data_referencia: string;
    valor_dividendo: number;
  }>;
}

export interface DividendosResponse {
  dividendos_por_mes: DividendoMes[];
  dividendos_por_ticker: DividendoTicker[];
  valores_totais_por_mes: Array<{
    data_referencia: string;
    valor_total: number;
  }>;
  resumo: Array<{
    ticker: string;
    dados: Array<{
      data_referencia: string;
      valor_hoje: number;
    }>;
  }>;
}

// Interface para rentabilidade geral - estrutura real da API
export interface AtivoDetalhe {
  ticker: string;
  tipo: string;
  valor_mes: number;
  dividendos_mes: number;
}

export interface EvolucaoMensal {
  mes_periodo: string;
  mes_nome: string;
  patrimonio_total: number;
  valor_total_fii: number;
  valor_total_acao: number;
  valor_total_div_fii: number;
  valor_total_div_acao: number;
  dividendos_total: number;
  rentabilidade_total: number;
  quantidade_ativos_ativos: number;
  ativos_detalhes: AtivoDetalhe[];
  tem_dados_reais: boolean;
}

export interface MetricasPeriodo {
  tem_dados_suficientes: boolean;
  metricas_disponiveis: boolean;
  patrimonio_inicial: number;
  patrimonio_final: number;
  valorizacao_patrimonio: number;
  total_dividendos_periodo: number;
  total_dividendos_fii: number;
  total_dividendos_acao: number;
  rentabilidade_total_periodo: number;
  media_mensal_dividendos_fii: number;
  media_mensal_dividendos_acao: number;
  quantidade_meses: number;
  meses_com_dados_reais: number;
  meses_projetados: number;
  yield_fii_periodo: number;
  yield_acao_periodo: number;
  observacoes: {
    dados_reais_utilizados: number;
    projecoes_utilizadas: number;
    base_calculo: string;
  };
}

export interface RentabilidadeGeralResponse {
  success: boolean;
  data: {
    periodo_analise: {
      data_inicio: string;
      data_fim: string;
      data_mais_antiga_cadastro: string;
      meses_analisados: number;
      periodo_inicio: string;
      periodo_fim: string;
    };
    qualidade_dados: {
      tem_dados_suficientes: boolean;
      meses_com_dados_reais: number;
      meses_projetados: number;
      percentual_dados_reais: number;
      confiabilidade: string;
    };
    evolucao_mensal_consolidada: EvolucaoMensal[];
    metricas_periodo: MetricasPeriodo;
    filtros_aplicados: {
      data_inicio_original: string | null;
      data_fim_original: string | null;
      data_inicio_efetiva: string;
      data_fim_efetiva: string;
    };
    avisos: string[];
  };
}

class InvestmentApiService {
  // API para alocação por tipo
  async getAlocacaoTipo(): Promise<AlocacaoTipoResponse | { porcentagem_alocacao: AlocacaoTipo }> {
    try {
      secureLog("[INVESTMENTS] Fetching alocacao tipo");
      const response = await api.get("/api/alocacao_tipo");
      return response;
    } catch (error) {
      console.error("API Error - getAlocacaoTipo:", error);

      if (isDevelopment) {
        secureLog(
          "[INVESTMENTS] Using mock data for alocacao tipo (development)",
        );
        await simulateApiDelay(300);
        
        // Retornando um formato compatível com a nova API
        const mockData: AlocacaoTipoResponse = {
          total_carteira: 40381.8,
          alocacao_por_tipo: [
            {
              tipo: "Acoes",
              valor_atual: 18495.0,
              percentual_alocacao: 45.8,
              quantidade_ativos: 6
            },
            {
              tipo: "Fundos Imobiliários",
              valor_atual: 12962.5,
              percentual_alocacao: 32.1,
              quantidade_ativos: 8
            },
            {
              tipo: "Renda Fixa",
              valor_atual: 8924.3,
              percentual_alocacao: 22.1,
              quantidade_ativos: 3
            }
          ],
          resumo: {
            tipos_diferentes: 3,
            maior_alocacao: {
              tipo: "Acoes",
              valor_atual: 18495.0,
              percentual_alocacao: 45.8,
              quantidade_ativos: 6
            },
            menor_alocacao: {
              tipo: "Renda Fixa",
              valor_atual: 8924.3,
              percentual_alocacao: 22.1,
              quantidade_ativos: 3
            }
          }
        };
        
        return mockData;
      }

      throw error;
    }
  }

  // API para setores
  async getSetores(tipo: string = "Acoes"): Promise<SetorResponse | { setores: SetorInfo[] }> {
    try {
      secureLog("[INVESTMENTS] Fetching setores", { tipo });
      const response = await api.get(`/api/setores?tipo=${tipo}`);
      return response;
    } catch (error) {
      console.error("API Error - getSetores:", error);

      if (isDevelopment) {
        secureLog("[INVESTMENTS] Using mock data for setores (development)");
        await simulateApiDelay(300);
        return this.getMockSetoresData(tipo);
      }

      throw error;
    }
  }

  // API para dividendos de FII
  async getDividendosFII(
    tipo: string = "FII",
    dataReferencia: string = "2024-11",
  ): Promise<DividendosResponse> {
    try {
      secureLog("[INVESTMENTS] Fetching dividendos FII", {
        tipo,
        dataReferencia,
      });
      const response = await api.get(
        `/api/dividendos_fii?tipo=${tipo}&data_referencia=${dataReferencia}`,
      );
      return response;
    } catch (error) {
      console.error("API Error - getDividendosFII:", error);

      if (isDevelopment) {
        secureLog(
          "[INVESTMENTS] Using mock data for dividendos FII (development)",
        );
        await simulateApiDelay(300);
        return this.getMockDividendosData();
      }

      throw error;
    }
  }

  // API para rentabilidade geral
  async getRentabilidadeGeral(): Promise<RentabilidadeGeralResponse> {
    try {
      secureLog("[INVESTMENTS] Fetching rentabilidade geral");
      console.log("🚀 [DEBUG] Tentando acessar endpoint: /api/investimentos/rentabilidade-geral");
      console.log("🔧 [DEBUG] URL Base da API:", api);
      
      const response = await api.get("/api/investimentos/rentabilidade-geral");
      console.log("✅ [DEBUG] Resposta da API recebida com sucesso:", response);
      console.log("📊 [DEBUG] Estrutura dos dados:", {
        success: response?.success,
        hasData: !!response?.data,
        hasEvolucaoMensal: !!response?.data?.evolucao_mensal_consolidada,
        qtdMeses: response?.data?.evolucao_mensal_consolidada?.length
      });
      return response;
    } catch (error) {
      console.error("❌ [API Error] getRentabilidadeGeral falhou:", error);
      console.log("🔍 [DEBUG] Detalhes completos do erro:", { 
        message: error?.message, 
        status: error?.status, 
        name: error?.name,
        stack: error?.stack,
        endpoint: "/api/investimentos/rentabilidade-geral",
        timestamp: new Date().toISOString()
      });

      // Sempre usar mock como fallback em caso de erro
      console.log("🔄 [FALLBACK] Usando dados mock como fallback...");
      secureLog("[INVESTMENTS] Using mock data for rentabilidade geral (fallback)");
      await simulateApiDelay(300);
      return this.getMockRentabilidadeGeralData();
    }
  }

  // Mock data methods
  private getMockSetoresData(tipo: string): { setores: SetorInfo[] } {
    if (tipo === "FII") {
      return {
        setores: [
          {
            setor_atividade: "Logística",
            valor_total_setor: 12500.45,
            percentual_do_total: 42.3,
            acoes: [
              { ticker: "HGLG11", valor_total: 5200.3 },
              { ticker: "XPLG11", valor_total: 3850.75 },
              { ticker: "VILG11", valor_total: 3449.4 },
            ],
          },
          {
            setor_atividade: "Shoppings",
            valor_total_setor: 8750.2,
            percentual_do_total: 29.6,
            acoes: [
              { ticker: "VISC11", valor_total: 4320.1 },
              { ticker: "XPML11", valor_total: 2890.55 },
              { ticker: "BCFF11", valor_total: 1539.55 },
            ],
          },
          {
            setor_atividade: "Papel",
            valor_total_setor: 8310.85,
            percentual_do_total: 28.1,
            acoes: [
              { ticker: "KNRI11", valor_total: 4180.45 },
              { ticker: "IRDM11", valor_total: 4130.4 },
            ],
          },
        ],
      };
    }

    // Default to Ações
    return {
      setores: [
        {
          setor_atividade: "Bancos",
          valor_total_setor: 15420.75,
          percentual_do_total: 38.2,
          acoes: [
            { ticker: "ITUB4", valor_total: 8240.3 },
            { ticker: "BBDC4", valor_total: 4180.45 },
            { ticker: "BBAS3", valor_total: 3000.0 },
          ],
        },
        {
          setor_atividade: "Petróleo e Gás",
          valor_total_setor: 12850.2,
          percentual_do_total: 31.8,
          acoes: [
            { ticker: "PETR4", valor_total: 7320.1 },
            { ticker: "PETR3", valor_total: 5530.1 },
          ],
        },
        {
          setor_atividade: "Mineração",
          valor_total_setor: 12110.85,
          percentual_do_total: 30.0,
          acoes: [{ ticker: "VALE3", valor_total: 12110.85 }],
        },
      ],
    };
  }

  private getMockDividendosData(): DividendosResponse {
    return {
      dividendos_por_mes: [
        { data_referencia: "2024-06", valor_total: 485.75 },
        { data_referencia: "2024-07", valor_total: 512.3 },
        { data_referencia: "2024-08", valor_total: 498.9 },
        { data_referencia: "2024-09", valor_total: 535.4 },
        { data_referencia: "2024-10", valor_total: 523.15 },
        { data_referencia: "2024-11", valor_total: 548.8 },
      ],
      dividendos_por_ticker: [
        {
          ticker: "HGLG11",
          dados: [
            { data_referencia: "2024-06", valor_dividendo: 125.3 },
            { data_referencia: "2024-07", valor_dividendo: 128.75 },
            { data_referencia: "2024-08", valor_dividendo: 132.1 },
            { data_referencia: "2024-09", valor_dividendo: 135.45 },
            { data_referencia: "2024-10", valor_dividendo: 138.8 },
            { data_referencia: "2024-11", valor_dividendo: 142.15 },
          ],
        },
        {
          ticker: "XPLG11",
          dados: [
            { data_referencia: "2024-06", valor_dividendo: 95.2 },
            { data_referencia: "2024-07", valor_dividendo: 98.15 },
            { data_referencia: "2024-08", valor_dividendo: 94.8 },
            { data_referencia: "2024-09", valor_dividendo: 102.3 },
            { data_referencia: "2024-10", valor_dividendo: 99.75 },
            { data_referencia: "2024-11", valor_dividendo: 105.4 },
          ],
        },
        {
          ticker: "VISC11",
          dados: [
            { data_referencia: "2024-06", valor_dividendo: 85.45 },
            { data_referencia: "2024-07", valor_dividendo: 87.9 },
            { data_referencia: "2024-08", valor_dividendo: 84.2 },
            { data_referencia: "2024-09", valor_dividendo: 89.35 },
            { data_referencia: "2024-10", valor_dividendo: 86.8 },
            { data_referencia: "2024-11", valor_dividendo: 91.25 },
          ],
        },
        {
          ticker: "KNRI11",
          dados: [
            { data_referencia: "2024-06", valor_dividendo: 78.3 },
            { data_referencia: "2024-07", valor_dividendo: 81.15 },
            { data_referencia: "2024-08", valor_dividendo: 79.45 },
            { data_referencia: "2024-09", valor_dividendo: 83.2 },
            { data_referencia: "2024-10", valor_dividendo: 80.9 },
            { data_referencia: "2024-11", valor_dividendo: 85.75 },
          ],
        },
        {
          ticker: "XPML11",
          dados: [
            { data_referencia: "2024-06", valor_dividendo: 65.15 },
            { data_referencia: "2024-07", valor_dividendo: 67.8 },
            { data_referencia: "2024-08", valor_dividendo: 64.9 },
            { data_referencia: "2024-09", valor_dividendo: 70.25 },
            { data_referencia: "2024-10", valor_dividendo: 68.35 },
            { data_referencia: "2024-11", valor_dividendo: 72.1 },
          ],
        },
        {
          ticker: "VILG11",
          dados: [
            { data_referencia: "2024-06", valor_dividendo: 55.8 },
            { data_referencia: "2024-07", valor_dividendo: 58.25 },
            { data_referencia: "2024-08", valor_dividendo: 56.45 },
            { data_referencia: "2024-09", valor_dividendo: 60.15 },
            { data_referencia: "2024-10", valor_dividendo: 57.9 },
            { data_referencia: "2024-11", valor_dividendo: 61.85 },
          ],
        },
      ],
      valores_totais_por_mes: [
        { data_referencia: "2024-06", valor_total: 485.75 },
        { data_referencia: "2024-07", valor_total: 512.3 },
        { data_referencia: "2024-08", valor_total: 498.9 },
        { data_referencia: "2024-09", valor_total: 535.4 },
        { data_referencia: "2024-10", valor_total: 523.15 },
        { data_referencia: "2024-11", valor_total: 548.8 },
      ],
      resumo: [
        {
          ticker: "HGLG11",
          dados: [
            { data_referencia: "2024-06", valor_hoje: 125.3 },
            { data_referencia: "2024-07", valor_hoje: 128.75 },
            { data_referencia: "2024-08", valor_hoje: 132.1 },
            { data_referencia: "2024-09", valor_hoje: 135.45 },
            { data_referencia: "2024-10", valor_hoje: 138.8 },
            { data_referencia: "2024-11", valor_hoje: 142.15 },
          ],
        },
        {
          ticker: "XPLG11",
          dados: [
            { data_referencia: "2024-06", valor_hoje: 95.2 },
            { data_referencia: "2024-07", valor_hoje: 98.15 },
            { data_referencia: "2024-08", valor_hoje: 94.8 },
            { data_referencia: "2024-09", valor_hoje: 102.3 },
            { data_referencia: "2024-10", valor_hoje: 99.75 },
            { data_referencia: "2024-11", valor_hoje: 105.4 },
          ],
        },
      ],
    };
  }

  private getMockRentabilidadeGeralData(): RentabilidadeGeralResponse {
    return {
      success: true,
      data: {
        periodo_analise: {
          data_inicio: "2024-01-01",
          data_fim: "2024-11-30",
          data_mais_antiga_cadastro: "2024-01-01",
          meses_analisados: 11,
          periodo_inicio: "2024-01",
          periodo_fim: "2024-11"
        },
        qualidade_dados: {
          tem_dados_suficientes: true,
          meses_com_dados_reais: 11,
          meses_projetados: 0,
          percentual_dados_reais: 100.0,
          confiabilidade: "Alta"
        },
        evolucao_mensal_consolidada: [
          {
            mes_periodo: "2024-01",
            mes_nome: "January 2024",
            patrimonio_total: 45000,
            valor_total_fii: 22000,
            valor_total_acao: 23000,
            valor_total_div_fii: 850,
            valor_total_div_acao: 1200,
            dividendos_total: 2050,
            rentabilidade_total: 4.56,
            quantidade_ativos_ativos: 15,
            ativos_detalhes: [],
            tem_dados_reais: true
          },
          {
            mes_periodo: "2024-02",
            mes_nome: "February 2024",
            patrimonio_total: 46500,
            valor_total_fii: 23000,
            valor_total_acao: 23500,
            valor_total_div_fii: 920,
            valor_total_div_acao: 980,
            dividendos_total: 1900,
            rentabilidade_total: 4.09,
            quantidade_ativos_ativos: 15,
            ativos_detalhes: [],
            tem_dados_reais: true
          },
          {
            mes_periodo: "2024-03",
            mes_nome: "March 2024",
            patrimonio_total: 48200,
            valor_total_fii: 24000,
            valor_total_acao: 24200,
            valor_total_div_fii: 780,
            valor_total_div_acao: 1400,
            dividendos_total: 2180,
            rentabilidade_total: 4.52,
            quantidade_ativos_ativos: 16,
            ativos_detalhes: [],
            tem_dados_reais: true
          },
          {
            mes_periodo: "2024-04",
            mes_nome: "April 2024",
            patrimonio_total: 49800,
            valor_total_fii: 24500,
            valor_total_acao: 25300,
            valor_total_div_fii: 1100,
            valor_total_div_acao: 1050,
            dividendos_total: 2150,
            rentabilidade_total: 4.32,
            quantidade_ativos_ativos: 16,
            ativos_detalhes: [],
            tem_dados_reais: true
          },
          {
            mes_periodo: "2024-05",
            mes_nome: "May 2024",
            patrimonio_total: 51300,
            valor_total_fii: 25200,
            valor_total_acao: 26100,
            valor_total_div_fii: 890,
            valor_total_div_acao: 1300,
            dividendos_total: 2190,
            rentabilidade_total: 4.27,
            quantidade_ativos_ativos: 17,
            ativos_detalhes: [],
            tem_dados_reais: true
          },
          {
            mes_periodo: "2024-06",
            mes_nome: "June 2024",
            patrimonio_total: 52100,
            valor_total_fii: 25800,
            valor_total_acao: 26300,
            valor_total_div_fii: 950,
            valor_total_div_acao: 1150,
            dividendos_total: 2100,
            rentabilidade_total: 4.03,
            quantidade_ativos_ativos: 17,
            ativos_detalhes: [],
            tem_dados_reais: true
          },
          {
            mes_periodo: "2024-07",
            mes_nome: "July 2024",
            patrimonio_total: 54200,
            valor_total_fii: 26500,
            valor_total_acao: 27700,
            valor_total_div_fii: 1020,
            valor_total_div_acao: 1350,
            dividendos_total: 2370,
            rentabilidade_total: 4.37,
            quantidade_ativos_ativos: 18,
            ativos_detalhes: [],
            tem_dados_reais: true
          },
          {
            mes_periodo: "2024-08",
            mes_nome: "August 2024",
            patrimonio_total: 53800,
            valor_total_fii: 26200,
            valor_total_acao: 27600,
            valor_total_div_fii: 870,
            valor_total_div_acao: 1100,
            dividendos_total: 1970,
            rentabilidade_total: 3.66,
            quantidade_ativos_ativos: 18,
            ativos_detalhes: [],
            tem_dados_reais: true
          },
          {
            mes_periodo: "2024-09",
            mes_nome: "September 2024",
            patrimonio_total: 55600,
            valor_total_fii: 27200,
            valor_total_acao: 28400,
            valor_total_div_fii: 1050,
            valor_total_div_acao: 1250,
            dividendos_total: 2300,
            rentabilidade_total: 4.14,
            quantidade_ativos_ativos: 19,
            ativos_detalhes: [],
            tem_dados_reais: true
          },
          {
            mes_periodo: "2024-10",
            mes_nome: "October 2024",
            patrimonio_total: 57200,
            valor_total_fii: 28000,
            valor_total_acao: 29200,
            valor_total_div_fii: 1120,
            valor_total_div_acao: 1180,
            dividendos_total: 2300,
            rentabilidade_total: 4.02,
            quantidade_ativos_ativos: 19,
            ativos_detalhes: [],
            tem_dados_reais: true
          },
          {
            mes_periodo: "2024-11",
            mes_nome: "November 2024",
            patrimonio_total: 58500,
            valor_total_fii: 28500,
            valor_total_acao: 30000,
            valor_total_div_fii: 980,
            valor_total_div_acao: 1320,
            dividendos_total: 2300,
            rentabilidade_total: 3.93,
            quantidade_ativos_ativos: 20,
            ativos_detalhes: [],
            tem_dados_reais: true
          }
        ],
        metricas_periodo: {
          tem_dados_suficientes: true,
          metricas_disponiveis: true,
          patrimonio_inicial: 45000,
          patrimonio_final: 58500,
          valorizacao_patrimonio: 13500,
          total_dividendos_periodo: 23817,
          total_dividendos_fii: 10537,
          total_dividendos_acao: 13280,
          rentabilidade_total_periodo: 30.0,
          media_mensal_dividendos_fii: 958.0,
          media_mensal_dividendos_acao: 1207.3,
          quantidade_meses: 11,
          meses_com_dados_reais: 11,
          meses_projetados: 0,
          yield_fii_periodo: 3.85,
          yield_acao_periodo: 4.43,
          observacoes: {
            dados_reais_utilizados: 11,
            projecoes_utilizadas: 0,
            base_calculo: "Apenas dados reais"
          }
        },
        filtros_aplicados: {
          data_inicio_original: null,
          data_fim_original: null,
          data_inicio_efetiva: "2024-01-01",
          data_fim_efetiva: "2024-11-30"
        },
        avisos: []
      }
    };
  }
}

// Export singleton instance
export const investmentApiService = new InvestmentApiService();
export const investmentApi = investmentApiService; // Legacy export name
export const investmentsApi = investmentApiService; // Another legacy export name
export default investmentApiService;

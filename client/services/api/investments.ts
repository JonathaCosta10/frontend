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
        return {
          porcentagem_alocacao: {
            Acoes: 45.8,
            "Fundos Imobiliários": 32.1,
            "Renda Fixa": 22.1,
          },
        };
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
    };
  }
}

// Export singleton instance
export const investmentApiService = new InvestmentApiService();
export const investmentApi = investmentApiService; // Legacy export name
export const investmentsApi = investmentApiService; // Another legacy export name
export default investmentApiService;

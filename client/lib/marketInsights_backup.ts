/**
 * Lógica para tratamento dos insights de mercado
 * Adaptado para a nova estrutura de JSON com seleção de FIIs e Ações
 */

// Interfaces para a nova estrutura de dados
export interface MarketInsightItem {
  ticker: string;
  nome_companhia?: string; // Opcional pois pode não vir na API
  tipo: "ACAO" | "FII" | "ETF";
  ultimo_preco: string;
  data: string;
  fonte: string;
  volume_diario?: string;
  volume?: string; // Para compatibilidade com dados da API
  variacao?: {
    valor: string;
    cor: "green" | "red";
    simbolo: "+" | "";
  };
}

export interface VolumeData {
  titulo: string;
  "1D": MarketInsightItem[];
  "7D": MarketInsightItem[];
  "30D": MarketInsightItem[];
}

export interface VariacaoData {
  titulo: string;
  ACAO: {
    titulo: string;
    "1D": MarketInsightItem[];
    "7D": MarketInsightItem[];
    "30D": MarketInsightItem[];
  };
  FII: {
    titulo: string;
    "1D": MarketInsightItem[];
    "7D": MarketInsightItem[];
    "30D": MarketInsightItem[];
  };
}

export interface NewMarketInsightsData {
  titulo: string;
  ultima_atualizacao: string;
  maiores_volumes: VolumeData;
  maiores_variacoes_positivas: VariacaoData;
  maiores_variacoes_negativas: VariacaoData;
  estatisticas: {
    total_volumes_1d: number;
    total_acoes_positivas_1d: number;
    total_acoes_negativas_1d: number;
    total_fiis_positivos_1d: number;
    total_fiis_negativos_1d: number;
  };
}

export interface NewMarketInsightsResponse {
  insights_mercado: NewMarketInsightsData;
}

// Tipos para seleção de categoria
export type InsightCategory = "maiores_volumes" | "maiores_variacoes_positivas" | "maiores_variacoes_negativas";
export type AssetType = "ACAO" | "FII";
export type TimePeriod = "1D" | "7D" | "30D";

// Função para obter dados baseado na categoria e filtros
export function getInsightData(
  data: NewMarketInsightsData,
  category: InsightCategory,
  period: TimePeriod,
  assetType?: AssetType
): MarketInsightItem[] {
  if (!data) return [];

  switch (category) {
    case "maiores_volumes":
      return data.maiores_volumes?.[period] || [];
    
    case "maiores_variacoes_positivas":
      if (assetType && data.maiores_variacoes_positivas?.[assetType]) {
        return data.maiores_variacoes_positivas[assetType][period] || [];
      }
      // Se não especificar tipo, retorna ações por padrão
      return data.maiores_variacoes_positivas?.ACAO?.[period] || [];
    
    case "maiores_variacoes_negativas":
      if (assetType && data.maiores_variacoes_negativas?.[assetType]) {
        return data.maiores_variacoes_negativas[assetType][period] || [];
      }
      // Se não especificar tipo, retorna ações por padrão
      return data.maiores_variacoes_negativas?.ACAO?.[period] || [];
    
    default:
      return [];
  }
}

// Função para filtrar por tipo de ativo (ACAO, FII, ETF)
export function filterByAssetType(data: MarketInsightItem[], type: "ACAO" | "FII" | "ETF"): MarketInsightItem[] {
  return data.filter(item => item.tipo === type);
}

// Função para paginar dados
export function paginateData(data: MarketInsightItem[], page: number, itemsPerPage: number): MarketInsightItem[] {
  const startIndex = page * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
}

// Função para calcular total de páginas
export function getTotalPages(data: MarketInsightItem[], itemsPerPage: number): number {
  return Math.ceil(data.length / itemsPerPage);
}

// Função para formatar título da categoria
export function getCategoryTitle(category: InsightCategory): string {
  const titles = {
    maiores_volumes: "Maiores Volumes",
    maiores_variacoes_positivas: "Maiores Variações Positivas",
    maiores_variacoes_negativas: "Maiores Variações Negativas"
  };
  return titles[category];
}

// Função para formatar título do tipo de ativo
export function getAssetTypeTitle(assetType: AssetType): string {
  const titles = {
    ACAO: "Ações",
    FII: "FIIs"
  };
  return titles[assetType];
}

// Função para verificar se a categoria suporta filtro por tipo de ativo
export function categorySupportsAssetTypeFilter(category: InsightCategory): boolean {
  return category === "maiores_variacoes_positivas" || category === "maiores_variacoes_negativas";
}

// Função para obter cor do badge baseado na variação
export function getVariationColor(item: MarketInsightItem): string {
  if (!item.variacao) return "text-gray-600";
  return item.variacao.cor === "green" ? "text-emerald-600" : "text-red-600";
}

// Função para obter cor de fundo do badge baseado na variação
export function getVariationBgColor(item: MarketInsightItem): string {
  if (!item.variacao) return "bg-gray-100";
  return item.variacao.cor === "green" ? "bg-emerald-100" : "bg-red-100";
}

// Função para detectar se é mobile
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

// Mock data para fallback
export const mockNewMarketInsightsData: NewMarketInsightsData = {
  titulo: "Insights de Mercado",
  ultima_atualizacao: "11/08/2025 17:18",
  maiores_volumes: {
    titulo: "Maiores Volumes de Negociação",
    "1D": [
      {
        ticker: "PETR4",
        nome_companhia: "PETROBRAS PN",
        tipo: "ACAO",
        volume_diario: "3.3B",
        ultimo_preco: "R$ 30,53",
        data: "08/08/2025",
        fonte: "B3",
        variacao: {
          valor: "+2,15%",
          cor: "green",
          simbolo: "+"
        }
      },
      {
        ticker: "VALE3",
        nome_companhia: "VALE ON",
        tipo: "ACAO",
        volume_diario: "1.3B",
        ultimo_preco: "R$ 55,39",
        data: "08/08/2025",
        fonte: "B3",
        variacao: {
          valor: "+1,80%",
          cor: "green",
          simbolo: "+"
        }
      }
    ],
    "7D": [],
    "30D": []
  },
  maiores_variacoes_positivas: {
    titulo: "Maiores Variações Positivas",
    ACAO: {
      titulo: "Ações",
      "1D": [
        {
          ticker: "RVEE3",
          nome_companhia: "RV EDUCACAO ON",
          tipo: "ACAO",
          ultimo_preco: "R$ 20,00",
          data: "08/08/2025",
          fonte: "B3",
          variacao: {
            valor: "+25,00%",
            cor: "green",
            simbolo: "+"
          },
          volume_diario: "97.8K"
        }
      ],
      "7D": [],
      "30D": []
    },
    fiis: {
      titulo: "FIIs",
      "1D": [
        {
          ticker: "NEWU11",
          nome_companhia: "NEWCAPITAL REAL ESTATE",
          tipo: "FII",
          ultimo_preco: "R$ 83,01",
          data: "08/08/2025",
          fonte: "B3",
          variacao: {
            valor: "+3,76%",
            cor: "green",
            simbolo: "+"
          },
          volume_diario: "22.1K"
        }
      ],
      "7D": [],
      "30D": []
    }
  },
  maiores_variacoes_negativas: {
    titulo: "Maiores Variações Negativas",
    acoes: {
      titulo: "Ações",
      "1D": [
        {
          ticker: "CTSA4",
          nome_companhia: "CTSA PN",
          tipo: "ACAO",
          ultimo_preco: "R$ 2,49",
          data: "08/08/2025",
          fonte: "B3",
          variacao: {
            valor: "-11,07%",
            cor: "red",
            simbolo: ""
          },
          volume_diario: "3.0K"
        }
      ],
      "7D": [],
      "30D": []
    },
    fiis: {
      titulo: "FIIs",
      "1D": [
        {
          ticker: "FPAB11",
          nome_companhia: "FIP PACIFICO",
          tipo: "FII",
          ultimo_preco: "R$ 213,37",
          data: "08/08/2025",
          fonte: "B3",
          variacao: {
            valor: "-11,09%",
            cor: "red",
            simbolo: ""
          },
          volume_diario: "853"
        }
      ],
      "7D": [],
      "30D": []
    }
  },
  estatisticas: {
    total_volumes_1d: 20,
    total_acoes_positivas_1d: 20,
    total_acoes_negativas_1d: 20,
    total_fiis_positivos_1d: 20,
    total_fiis_negativos_1d: 20
  }
};

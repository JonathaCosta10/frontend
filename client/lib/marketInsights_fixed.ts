// Interfaces para a nova estrutura de dados de insights de mercado

export interface MarketInsightItem {
  ticker: string;
  nome_companhia: string;
  tipo: "ACAO" | "FII" | "ETF";
  ultimo_preco: string;
  data: string;
  fonte: string;
  variacao?: {
    valor: string;
    cor: "green" | "red";
    simbolo: "+" | "-" | "";
  };
  volume_diario?: string;
  pais?: string;
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
  maiores_volumes: VolumeData;
  maiores_variacoes_positivas: VariacaoData;
  maiores_variacoes_negativas: VariacaoData;
  resumo: {
    total_acoes_positivas_1d: number;
    total_acoes_negativas_1d: number;
    total_fiis_positivos_1d: number;
    total_fiis_negativos_1d: number;
    atualizacao: string;
  };
}

export interface NewMarketInsightsResponse {
  success: boolean;
  message: string;
  data: NewMarketInsightsData;
}

export type InsightCategory = "maiores_volumes" | "maiores_variacoes_positivas" | "maiores_variacoes_negativas";
export type AssetType = "ACAO" | "FII";
export type TimePeriod = "1D" | "7D" | "30D";

// Função principal para obter dados de insights
export function getInsightData(
  data: NewMarketInsightsData,
  category: InsightCategory,
  period: TimePeriod,
  assetType?: AssetType
): MarketInsightItem[] {
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
    maiores_volumes: "Maiores Volumes de Negociação",
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

// Função para determinar cor da variação
export function getVariationColor(variacao?: { cor: "green" | "red" }): string {
  if (!variacao) return "text-muted-foreground";
  return variacao.cor === "green" ? "text-green-600" : "text-red-600";
}

// Função para determinar cor de fundo da variação
export function getVariationBgColor(variacao?: { cor: "green" | "red" }): string {
  if (!variacao) return "bg-muted";
  return variacao.cor === "green" ? "bg-green-100" : "bg-red-100";
}

// Função para detectar dispositivo móvel
export function isMobileDevice(): boolean {
  return window.innerWidth < 768;
}

// Função para ordenar dados por país (Brasil primeiro)
export function sortMarketDataByCountry(data: MarketInsightItem[]): MarketInsightItem[] {
  return data.sort((a, b) => {
    if (a.pais === "BR" && b.pais !== "BR") return -1;
    if (a.pais !== "BR" && b.pais === "BR") return 1;
    return 0;
  });
}

// Função para determinar se deve mostrar indicador ao vivo
export function shouldShowLiveIndicator(ticker: string, type: string): boolean {
  // Mostrar ao vivo para cryptos
  if (type === "CRYPTO") return true;
  
  // Mostrar ao vivo para principais índices
  const liveIndices = ["BOVA11", "SMAL11", "IBOV", "IFIX"];
  return liveIndices.includes(ticker);
}

// Dados mock para desenvolvimento/testes
export const mockNewMarketInsightsData: NewMarketInsightsData = {
  maiores_volumes: {
    titulo: "Maiores Volumes de Negociação",
    "1D": [
      {
        ticker: "VALE3",
        nome_companhia: "VALE ON",
        tipo: "ACAO",
        ultimo_preco: "R$ 60,45",
        data: "08/08/2025",
        fonte: "B3",
        volume_diario: "R$ 1.250.000.000",
        pais: "BR"
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
            valor: "+45,45%",
            cor: "green",
            simbolo: "+"
          },
          volume_diario: "R$ 15.000.000",
          pais: "BR"
        }
      ],
      "7D": [],
      "30D": []
    },
    FII: {
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
          volume_diario: "R$ 2.500.000",
          pais: "BR"
        }
      ],
      "7D": [],
      "30D": []
    }
  },
  maiores_variacoes_negativas: {
    titulo: "Maiores Variações Negativas",
    ACAO: {
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
          volume_diario: "R$ 8.750.000",
          pais: "BR"
        }
      ],
      "7D": [],
      "30D": []
    },
    FII: {
      titulo: "FIIs",
      "1D": [
        {
          ticker: "BTLG11",
          nome_companhia: "BTG PACTUAL LOGISTICA",
          tipo: "FII",
          ultimo_preco: "R$ 98,50",
          data: "08/08/2025",
          fonte: "B3",
          variacao: {
            valor: "-2,15%",
            cor: "red",
            simbolo: ""
          },
          volume_diario: "R$ 1.800.000",
          pais: "BR"
        }
      ],
      "7D": [],
      "30D": []
    }
  },
  resumo: {
    total_acoes_positivas_1d: 156,
    total_acoes_negativas_1d: 98,
    total_fiis_positivos_1d: 45,
    total_fiis_negativos_1d: 32,
    atualizacao: "2025-01-08T14:30:00Z"
  }
};

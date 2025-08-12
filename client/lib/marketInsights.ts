// Interfaces para a nova estrutura de dados de insights de mercado

export interface MarketInsightItem {
  ticker: string;
  nome_companhia?: string;
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
  volume?: string; // Propriedade que vem da API real
  pais?: string;
}

// Função para validar se um item tem a estrutura mínima necessária
export function isValidMarketInsightItem(item: any): item is MarketInsightItem {
  if (!item || typeof item !== 'object') {
    return false;
  }
  
  // Verificações obrigatórias
  const hasRequiredFields = 
    typeof item.ticker === 'string' && item.ticker.trim() !== '' &&
    typeof item.tipo === 'string' && ['ACAO', 'FII', 'ETF'].includes(item.tipo) &&
    typeof item.ultimo_preco === 'string' && item.ultimo_preco.trim() !== '';
    
  if (!hasRequiredFields) {
    console.warn("⚠️ Item com campos obrigatórios inválidos:", item);
    return false;
  }
  
  // Verificações opcionais mas importantes
  if (item.variacao && typeof item.variacao === 'object') {
    const variacaoValida = 
      typeof item.variacao.valor === 'string' &&
      ['green', 'red'].includes(item.variacao.cor) &&
      ['', '+', '-'].includes(item.variacao.simbolo);
      
    if (!variacaoValida) {
      console.warn("⚠️ Item com variação inválida:", item);
      // Não rejeitamos o item, apenas limpamos a variação
      delete item.variacao;
    }
  }
  
  return true;
}

// Função para limpar e validar array de dados
export function sanitizeMarketData(data: any[]): MarketInsightItem[] {
  if (!Array.isArray(data)) {
    console.warn("⚠️ sanitizeMarketData - Dados não são um array:", data);
    return [];
  }
  
  const validItems = data.filter(isValidMarketInsightItem);
  
  if (validItems.length !== data.length) {
    console.warn(`⚠️ ${data.length - validItems.length} itens inválidos foram removidos dos dados`);
  }
  
  return validItems;
}

// Função auxiliar para obter volume (prioriza volume_diario, fallback para volume)
export function getVolumeValue(item: MarketInsightItem): string | undefined {
  if (!item) {
    console.warn("⚠️ getVolumeValue - Item não fornecido");
    return undefined;
  }
  
  // Verificar se tem volume_diario primeiro
  if (item.volume_diario && typeof item.volume_diario === 'string' && item.volume_diario.trim() !== '') {
    return item.volume_diario;
  }
  
  // Fallback para volume
  if (item.volume && typeof item.volume === 'string' && item.volume.trim() !== '') {
    return item.volume;
  }
  
  // Se não encontrar nenhum volume válido
  return undefined;
}

export interface VolumeData {
  titulo: string;
  acoes: {
    titulo: string;
    "1D": MarketInsightItem[];
    "7D": MarketInsightItem[];
    "30D": MarketInsightItem[];
  };
  fiis: {
    titulo: string;
    "1D": MarketInsightItem[];
    "7D": MarketInsightItem[];
    "30D": MarketInsightItem[];
  };
}

export interface VariacaoData {
  titulo: string;
  acoes: {
    titulo: string;
    "1D": MarketInsightItem[];
    "7D": MarketInsightItem[];
    "30D": MarketInsightItem[];
  };
  fiis: {
    titulo: string;
    "1D": MarketInsightItem[];
    "7D": MarketInsightItem[];
    "30D": MarketInsightItem[];
  };
}

export interface NewMarketInsightsData {
  maiores_volumes: VolumeData;
  maiores_altas: VariacaoData;
  maiores_baixas: VariacaoData;
  estatisticas: {
    total_volumes_acoes_1d: number;
    total_volumes_fiis_1d: number;
    total_altas_acoes_1d: number;
    total_altas_fiis_1d: number;
    total_baixas_acoes_1d: number;
    total_baixas_fiis_1d: number;
  };
}

// Interface para a resposta real da API
export interface ApiMarketInsightsResponse {
  insights_mercado: {
    titulo: string;
    ultima_atualizacao: string;
    maiores_volumes: VolumeData;
    maiores_altas: VariacaoData;
    maiores_baixas: VariacaoData;
    estatisticas: {
      total_volumes_acoes_1d: number;
      total_volumes_fiis_1d: number;
      total_altas_acoes_1d: number;
      total_altas_fiis_1d: number;
      total_baixas_acoes_1d: number;
      total_baixas_fiis_1d: number;
    };
  };
}

export interface NewMarketInsightsResponse {
  success: boolean;
  message: string;
  data: NewMarketInsightsData;
}

export type InsightCategory = "maiores_volumes" | "maiores_altas" | "maiores_baixas";
export type AssetType = "acoes" | "fiis";
export type TimePeriod = "1D" | "7D" | "30D";

// Função para converter resposta da API para formato interno
export function convertApiResponseToInsights(apiResponse: any): NewMarketInsightsData {
  console.log("🔄 convertApiResponseToInsights - Iniciando conversão...");
  console.log("📥 Dados recebidos:", apiResponse);
  
  // Verificar se a resposta tem a estrutura esperada
  if (apiResponse && apiResponse.insights_mercado) {
    const insights = apiResponse.insights_mercado;
    console.log("✅ Estrutura insights_mercado encontrada");
    console.log("📊 Dados disponíveis:", Object.keys(insights));
    
    // Função auxiliar para criar estrutura padrão se não existir
    const createEmptyPeriodData = () => ({ "1D": [], "7D": [], "30D": [] });
    const createEmptyAssetData = (titulo: string) => ({
      titulo,
      acoes: { titulo: "Ações", ...createEmptyPeriodData() },
      fiis: { titulo: "FIIs", ...createEmptyPeriodData() }
    });
    
    // Função auxiliar para processar e sanitizar dados de período
    const processPeriodData = (data: any) => {
      if (!data || typeof data !== 'object') return createEmptyPeriodData();
      
      return {
        "1D": sanitizeMarketData(data["1D"] || []),
        "7D": sanitizeMarketData(data["7D"] || []),
        "30D": sanitizeMarketData(data["30D"] || [])
      };
    };
    
    // Função auxiliar para processar dados de categoria
    const processCategoryData = (categoryData: any, titulo: string) => {
      if (!categoryData || typeof categoryData !== 'object') {
        console.warn(`⚠️ ${titulo} não encontrado, criando estrutura vazia`);
        return createEmptyAssetData(titulo);
      }
      
      const acoesPeriods = processPeriodData(categoryData.acoes);
      const fiisPeriods = processPeriodData(categoryData.fiis);
      
      console.log(`✅ ${titulo} processado:`, {
        acoes1D: acoesPeriods["1D"].length,
        acoes7D: acoesPeriods["7D"].length,
        acoes30D: acoesPeriods["30D"].length,
        fiis1D: fiisPeriods["1D"].length,
        fiis7D: fiisPeriods["7D"].length,
        fiis30D: fiisPeriods["30D"].length
      });
      
      return {
        titulo: categoryData.titulo || titulo,
        acoes: {
          titulo: categoryData.acoes?.titulo || "Ações",
          ...acoesPeriods
        },
        fiis: {
          titulo: categoryData.fiis?.titulo || "FIIs",
          ...fiisPeriods
        }
      };
    };
    
    const result = {
      maiores_volumes: processCategoryData(insights.maiores_volumes, "Maiores Volumes"),
      maiores_altas: processCategoryData(insights.maiores_altas, "Maiores Altas"),
      maiores_baixas: processCategoryData(insights.maiores_baixas, "Maiores Baixas"),
      estatisticas: insights.estatisticas || {
        total_volumes_acoes_1d: 0,
        total_volumes_fiis_1d: 0,
        total_altas_acoes_1d: 0,
        total_altas_fiis_1d: 0,
        total_baixas_acoes_1d: 0,
        total_baixas_fiis_1d: 0
      }
    };
    
    console.log("✅ Conversão concluída com sucesso:", result);
    return result;
  }
  
  // Fallback se a estrutura não for a esperada
  console.warn("⚠️ Estrutura da API não reconhecida, dados recebidos:", apiResponse);
  console.warn("⚠️ Usando estrutura vazia como fallback");
  
  const emptyPeriodData = { "1D": [], "7D": [], "30D": [] };
  const emptyAssetData = (titulo: string) => ({
    titulo,
    acoes: { titulo: "Ações", ...emptyPeriodData },
    fiis: { titulo: "FIIs", ...emptyPeriodData }
  });
  
  return {
    maiores_volumes: emptyAssetData("Maiores Volumes"),
    maiores_altas: emptyAssetData("Maiores Altas"),
    maiores_baixas: emptyAssetData("Maiores Baixas"),
    estatisticas: {
      total_volumes_acoes_1d: 0,
      total_volumes_fiis_1d: 0,
      total_altas_acoes_1d: 0,
      total_altas_fiis_1d: 0,
      total_baixas_acoes_1d: 0,
      total_baixas_fiis_1d: 0
    }
  };
}

// Função principal para obter dados de insights
export function getInsightData(
  data: NewMarketInsightsData,
  category: InsightCategory,
  period: TimePeriod,
  assetType?: AssetType
): MarketInsightItem[] {
  console.log("🔍 getInsightData - Buscando dados:", { category, period, assetType });
  
  if (!data) {
    console.warn("⚠️ getInsightData - Dados não fornecidos");
    return [];
  }
  
  try {
    let categoryData;
    let result: MarketInsightItem[] = [];
    
    switch (category) {
      case "maiores_volumes":
        categoryData = data.maiores_volumes;
        console.log("📊 Dados maiores_volumes:", categoryData);
        break;
      case "maiores_altas":
        categoryData = data.maiores_altas;
        console.log("📈 Dados maiores_altas:", categoryData);
        break;
      case "maiores_baixas":
        categoryData = data.maiores_baixas;
        console.log("📉 Dados maiores_baixas:", categoryData);
        break;
      default:
        console.warn("⚠️ Categoria não reconhecida:", category);
        return [];
    }
    
    if (!categoryData) {
      console.warn("⚠️ Dados da categoria não encontrados:", category);
      return [];
    }
    
    if (assetType) {
      // Tipo específico solicitado
      if (categoryData[assetType] && categoryData[assetType][period]) {
        result = categoryData[assetType][period];
        console.log(`✅ Dados encontrados para ${assetType} ${period}:`, result.length, "itens");
      } else {
        console.warn(`⚠️ Dados não encontrados para ${assetType} ${period}`);
        result = [];
      }
    } else {
      // Se não especificar tipo, retorna ações por padrão
      if (categoryData.acoes && categoryData.acoes[period]) {
        result = categoryData.acoes[period];
        console.log(`✅ Dados encontrados para ações ${period}:`, result.length, "itens");
      } else {
        console.warn(`⚠️ Dados de ações não encontrados para ${period}`);
        result = [];
      }
    }
    
    // Verificar se os itens têm a estrutura esperada
    if (result.length > 0) {
      const firstItem = result[0];
      console.log("🔍 Exemplo do primeiro item:", firstItem);
      
      // Verificar propriedades essenciais
      const hasRequiredProps = firstItem.ticker && firstItem.tipo && firstItem.ultimo_preco;
      if (!hasRequiredProps) {
        console.warn("⚠️ Item não tem propriedades essenciais:", firstItem);
      }
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao obter dados de insights:', error);
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
    maiores_altas: "Maiores Altas",
    maiores_baixas: "Maiores Baixas"
  };
  return titles[category];
}

// Função para formatar título do tipo de ativo
export function getAssetTypeTitle(assetType: AssetType): string {
  const titles = {
    acoes: "Ações",
    fiis: "FIIs"
  };
  return titles[assetType];
}

// Função para verificar se a categoria suporta filtro por tipo de ativo
export function categorySupportsAssetTypeFilter(category: InsightCategory): boolean {
  // Todas as categorias suportam filtro por tipo de ativo (acoes/fiis)
  return true;
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
    acoes: {
      titulo: "Ações",
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
    fiis: {
      titulo: "FIIs",
      "1D": [],
      "7D": [],
      "30D": []
    }
  },
  maiores_altas: {
    titulo: "Maiores Altas",
    acoes: {
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
    fiis: {
      titulo: "FIIs",
      "1D": [],
      "7D": [],
      "30D": []
    }
  },
  maiores_baixas: {
    titulo: "Maiores Baixas",
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
          volume_diario: "R$ 8.750.000",
          pais: "BR"
        }
      ],
      "7D": [],
      "30D": []
    },
    fiis: {
      titulo: "FIIs",
      "1D": [],
      "7D": [],
      "30D": []
    }
  },
  estatisticas: {
    total_volumes_acoes_1d: 20,
    total_volumes_fiis_1d: 20,
    total_altas_acoes_1d: 20,
    total_altas_fiis_1d: 20,
    total_baixas_acoes_1d: 20,
    total_baixas_fiis_1d: 20
  }
};

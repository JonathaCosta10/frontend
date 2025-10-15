/**
 * Ranking Service - Serviço para gerenciar ranking de investimentos
 * Integração com a API /api/investimentos/ranking
 */

import { localStorageManager } from "@/lib/localStorage";
import { createHeaders } from "@/lib/apiKeyUtils";

// Base URL da API
const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

// Interface completa para item do ranking baseada na resposta real da API
export interface RankingItem {
  setor: string;
  ticker: string;
  tipo: string;
  quantidade: number;
  preco_medio: number;
  preco_atual: number;
  valor_investido: number;
  valor_atual: number;
  rentabilidade_rs: number;
  rentabilidade_percentual: number;
  valorizacao_preco: number;
  valorizacao_percentual: number;
  data_compra: string;
  data_ultimo_preco: string;
  valor_mercado: number;
  preco_mercado_atual: number;
  volatilidade: number;
  
  // Dados pessoais do investidor
  dados_pessoais: {
    quantidade: number;
    preco_medio_compra: number;
    valor_investido: number;
    valor_atual_mercado: number;
    lucro_prejuizo_valor: number;
    rentabilidade_percentual: number;
  };
  
  // Dados de mercado do ativo
  dados_mercado: {
    preco_minimo: any;
    preco_maximo: any;
    volume_medio: any;
    preco_atual: number;
    volatilidade: number;
    tipo_ativo: string;
    setor: string;
    negociado_bolsa: boolean;
  };
  
  // Tendências de mercado
  tendencia_7_dias: {
    tendencia: string;
    variacao_7d: number;
  };
  tendencia_14_dias: {
    tendencia: string;
    variacao_14d: number;
  };
  tendencia_30_dias: {
    tendencia: string;
    variacao_30d: number;
  };
  
  // Campos de compatibilidade para o frontend
  tendencias?: {
    ultimos_7_dias?: {
      percentual_variacao: number;
    };
    ultimos_14_dias?: {
      percentual_variacao: number;
    };
    ultimos_30_dias?: {
      percentual_variacao: number;
    };
  };
  
  // Análise técnica
  minima_mensal: number;
  maxima_mensal: number;
  distancia_minima_valor: number;
  distancia_minima_percentual: number;
  distancia_maxima_valor: number;
  distancia_maxima_percentual: number;
  
  // Análise fundamentalista
  pvp: number;
  valor_patrimonial: number;
  pe_ratio?: number;
  roe?: number;
  data_fundamentals?: string;
  valor_mercado_estimado?: number;
  patrimonio_liquido_estimado?: number;
  preco_cota_atual?: number;
  categoria_fii?: string;
  fonte?: string;
  data_referencia?: string;
  // Porte da empresa
  porte: {
    codigo: string;
    descricao: string;
    valor_milhoes: number;
  };
  
  // Análise de oportunidades IA
  oportunidade: {
    total: number;
    principal: {
      tipo: string;
      descricao: string;
      score: number;
    };
    todas: Array<{
      tipo: string;
      descricao: string;
      score: number;
    }>;
  };
  
  // Dividendos
  dividend_yield: {
    valor_mensal_estimado: any;
    valor_anual_estimado: any;
    percentual_mensal: number;
    percentual_anual: number;
    fonte: string;
    data_referencia: string;
  };
  
  // Sistema de pontuação completo
  score: {
    score_total: number;
    score_maximo: number;
    percentual: number;
    classificacao: string;
    recomendacao: {
      acao: string;
      motivo: string;
      justificativa: string;
      insight: string;
      risco: string;
      sugestao?: string; // Campo legacy, pode não estar presente
    };
    detalhamento: {
      oportunidade_preco: {
        pontos: number;
        rentabilidade: number;
        nivel: string;
      };
      pvp_favoravel: {
        pontos: number;
        pvp: number;
        nivel: string;
      };
      diversificacao_setorial: {
        pontos: number;
        exposicao_atual: number;
        setor: string;
        nivel: string;
      };
      posicionamento_tecnico: {
        pontos: number;
        distancia_maxima: number;
        volatilidade: number;
        posicao: string;
      };
    };
    insights: string[];
    criterios_atendidos: {
      preco_favoravel: boolean;
      pvp_favoravel: boolean;
      diversificacao_ok: boolean;
      posicao_tecnica_ok: boolean;
    };
    recomendacao_legacy?: {
      acao: string;
      motivo: string;
      sugestao: string;
      insight: string;
    };
  };
  
  // Posição no ranking
  posicao: number;
  ranking: string;
  score_custo_beneficio?: number;
  exposicao_setor_carteira?: number;
  
  // Campos normalizados para compatibilidade com a UI
  codigo?: string;
  nome?: string;
  rentabilidade?: number;
  volume?: number;
  dividendYield?: number;
  precoAtual?: number;
  variacao?: number;
  pontuacao?: number;
}

// Interface para parâmetros de filtro
export interface RankingFilters {
  criterio?: 'rentabilidade' | 'dividendos' | 'volume' | 'pontuacao' | 'volatilidade';
  categoria?: 'todas' | 'acoes' | 'fiis' | 'etfs' | 'criptomoedas';
  periodo?: '1m' | '3m' | '6m' | '12m' | '24m';
  setor?: string;
  limite?: number;
  ordem?: 'asc' | 'desc';
}

// Interface para resposta da API baseada na estrutura real
export interface RankingResponse {
  success: boolean;
  data: {
    ranking_completo: RankingItem[];
    top_5_melhores: RankingItem[];
    top_5_piores: RankingItem[];
    insights: {
      total_ativos: number;
      melhor_rentabilidade: {
        ticker: string;
        percentual: number;
      };
      pior_rentabilidade: {
        ticker: string;
        percentual: number;
      };
      rentabilidade_media: number;
      ativos_positivos: number;
      ativos_negativos: number;
      oportunidades_total: number;
      distribuicao_porte: {
        GG: number;
        G: number;
        M: number;
        P: number;
        "N/A": number;
      };
      tendencia_geral: string;
    };
    metadata: {
      total_ativos: number;
      data_calculo: string;
      versao_api: string;
    };
  };
}

// Headers para requisições autenticadas
const getAuthHeaders = (endpoint?: string) => {
  const token = localStorageManager.getAuthToken();
  
  // Usar createHeaders para incluir automaticamente a API_KEY
  const baseHeaders = createHeaders(endpoint, {
    'X-Client-Version': '1.0.0',
    'X-Request-Source': 'ranking-service',
    'X-Requested-With': 'XMLHttpRequest',
  });

  // Adicionar token de autenticação se disponível
  if (token) {
    baseHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Adicionar session_id e device_fingerprint
  try {
    const sessionId = localStorageManager.getSessionId();
    if (sessionId) {
      baseHeaders['X-Session-ID'] = sessionId;
    }
    
    const fingerprint = localStorageManager.getDeviceFingerprint();
    if (fingerprint) {
      const fingerprintValue = typeof fingerprint === 'object' ? 
        (fingerprint.hash || JSON.stringify(fingerprint)) : 
        fingerprint;
      baseHeaders['X-Device-Fingerprint'] = fingerprintValue;
    }
  } catch (e) {
    console.error("❌ [RankingService] Erro ao adicionar dados de sessão:", e);
  }

  return baseHeaders;
};

// Função helper para tratar erros da API
const handleApiError = (error: any) => {
  console.error('❌ [RankingService] API Error:', error);
  
  if (error.response) {
    const { status, data } = error.response;
    console.error(`❌ [RankingService] Status: ${status}`, data);
    
    if (status === 401) {
      throw new Error('Não autorizado. Faça login novamente.');
    } else if (status === 403) {
      throw new Error('Acesso negado. Verifique suas permissões.');
    } else if (status === 404) {
      throw new Error('Endpoint não encontrado.');
    } else if (status >= 500) {
      throw new Error('Erro interno do servidor. Tente novamente.');
    }
    
    throw new Error(data?.message || data?.error || 'Erro desconhecido');
  } else if (error.request) {
    throw new Error('Erro de conexão. Verifique sua internet.');
  } else {
    throw new Error(error.message || 'Erro desconhecido');
  }
};

/**
 * Buscar ranking de investimentos - Endpoint: GET /api/investimentos/ranking
 * Retorna lista de ativos rankeados conforme critério selecionado
 */
export const getRanking = async (filters: RankingFilters = {}): Promise<RankingResponse> => {
  try {
    console.log("🏆 [RankingService] Buscando ranking com filtros:", filters);
    
    // Construir query string com filtros
    const queryParams = new URLSearchParams();
    
    if (filters.criterio) queryParams.append('criterio', filters.criterio);
    if (filters.categoria) queryParams.append('categoria', filters.categoria);
    if (filters.periodo) queryParams.append('periodo', filters.periodo);
    if (filters.setor) queryParams.append('setor', filters.setor);
    if (filters.limite) queryParams.append('limite', filters.limite.toString());
    if (filters.ordem) queryParams.append('ordem', filters.ordem);
    
    const url = `${API_BASE}/api/investimentos/ranking${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log("🌐 [RankingService] URL:", url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders('/api/investimentos/ranking'),
    });

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data: await response.json().catch(() => ({ message: 'Erro na resposta' }))
        }
      };
    }

    const data = await response.json();
    console.log("✅ [RankingService] Ranking recebido:", data);
    
    // Normalizar dados para compatibilidade com a UI
    if (data.success && data.data && data.data.ranking_completo) {
      data.data.ranking_completo = data.data.ranking_completo.map((item: any) => ({
        ...item,
        // Campos normalizados para a UI
        codigo: item.ticker,
        nome: item.ticker, // Pode ser expandido se houver nome completo
        rentabilidade: item.rentabilidade_percentual,
        volume: item.volume_medio,
        dividendYield: item.dividend_yield?.percentual_anual || 0,
        precoAtual: item.preco_atual,
        variacao: item.tendencia_7_dias?.variacao_7d || 0,
        pontuacao: Math.round((item.oportunidade?.principal?.score || 0) * 10), // Converte score para pontuação
      }));
    }
    
    return data as RankingResponse;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Buscar top performers - Retorna os melhores ativos do ranking (top 3-5)
 * Usa a mesma chamada getRanking mas limitado
 */
export const getTopPerformers = async (filters: RankingFilters = {}): Promise<RankingItem[]> => {
  try {
    console.log("🌟 [RankingService] Buscando top performers com filtros:", filters);
    
    const response = await getRanking(filters);
    return response.data?.top_5_melhores || [];
  } catch (error) {
    console.error("❌ [RankingService] Erro ao buscar top performers:", error);
    throw error;
  }
};

/**
 * Buscar insights do ranking - Extrai insights da resposta do getRanking
 * Os insights já vêm incluídos na resposta da API /api/investimentos/ranking
 */
export const getRankingInsights = async (filters: RankingFilters = {}): Promise<any> => {
  try {
    console.log("💡 [RankingService] Extraindo insights do ranking:", filters);
    
    const response = await getRanking(filters);
    
    // Os insights já vêm na resposta da API principal
    if (response.data?.insights) {
      console.log("✅ [RankingService] Insights extraídos da resposta:", response.data.insights);
      return response.data.insights;
    }
    
    // Se não houver insights na resposta, retornar insights padrão
    console.warn("⚠️ [RankingService] Nenhum insight encontrado na resposta, usando dados padrão");
    return {
      destaque_mes: "Análise baseada em dados de mercado atualizados",
      melhor_custo_beneficio: "Diversificação é fundamental para bons resultados",
      oportunidade: "Monitore oportunidades de entrada em ativos de qualidade"
    };
  } catch (error) {
    // Em caso de erro, retornar insights padrão
    console.warn("⚠️ [RankingService] Usando insights padrão devido a erro:", error);
    return {
      destaque_mes: "Análise baseada em dados de mercado atualizados",
      melhor_custo_beneficio: "Diversificação é fundamental para bons resultados",
      oportunidade: "Monitore oportunidades de entrada em ativos de qualidade"
    };
  }
};

// Export padrão do serviço
export const rankingService = {
  getRanking,
  getTopPerformers,
  getRankingInsights,
};

export default rankingService;
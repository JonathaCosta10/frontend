/**
 * Investment Service - Serviço para gerenciar investimentos pessoais
 * Integração com as APIs de investimentos pessoais conforme documentação
 */

import { localStorageManager } from "@/lib/localStorage";
import { INVESTMENT_ROUTES } from "@/contexts/Rotas";
import { createHeaders } from "@/lib/apiKeyUtils";

// Base URL da API
const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

// Interfaces baseadas na documentação da API
export interface TickerSearchResult {
  ticker: string;
  descricao: string; // conforme a documentação
  tipo_ativo: string; // conforme a documentação
  setor?: string;
}

export interface InvestmentAsset {
  id?: number;
  ticker: string;
  tipo?: string; // conforme resposta da API
  data_compra: string; // campo obrigatório conforme backend
  quantidade: number | string; // pode vir como string da API
  preco_medio?: number | string; // nome correto conforme API
  valor_unitario?: number; // para compatibilidade do form
  valor_investido?: number; // calculado
  preco_atual?: number | string; // vem da API como string
  valor_atual?: number | string; // calculado, vem como string
  valorizacao?: number | string; // campo da API (ganho/perda absoluto)
  percentual_valorizacao?: number | string; // campo da API (ganho/perda percentual)
  variacao_absoluta?: number | string; // campo da API
  variacao_percentual?: number | string; // calculado, vem como string
  ganho_perda?: number | string; // calculado, vem como string
  data_ultima_cotacao?: string; // campo da API
  tem_cotacao_atual?: boolean; // campo da API
  fonte_preco?: string; // campo da API
  data_criacao?: string; // campo da API
  data_atualizacao?: string; // campo da API
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Headers para requisições autenticadas
const getAuthHeaders = (endpoint?: string) => {
  const token = localStorageManager.getAuthToken();
  
  // Usar createHeaders para incluir automaticamente a API_KEY
  const baseHeaders = createHeaders(endpoint, {
    'X-Client-Version': '1.0.0',
    'X-Request-Source': 'investment-service',
    'X-Requested-With': 'XMLHttpRequest',
  });

  // Adicionar token de autenticação se disponível
  if (token) {
    baseHeaders['Authorization'] = `Bearer ${token}`;
  }

  // CORREÇÃO: Adicionar session_id e device_fingerprint para resolver erro de token malformado
  try {
    // Obter session_id do localStorage
    const sessionId = localStorageManager.getSessionId();
    if (sessionId) {
      console.log("🔑 [InvestmentService] Incluindo session_id:", sessionId);
      baseHeaders['X-Session-ID'] = sessionId;
    } else {
      console.warn("⚠️ [InvestmentService] session_id não encontrado!");
    }
    
    // Obter device_fingerprint do localStorage
    const fingerprint = localStorageManager.getDeviceFingerprint();
    if (fingerprint) {
      // Se for objeto, usar a propriedade hash, se for string usar diretamente
      const fingerprintValue = typeof fingerprint === 'object' ? 
        (fingerprint.hash || JSON.stringify(fingerprint)) : 
        fingerprint;
        
      console.log("👆 [InvestmentService] Incluindo device_fingerprint:", fingerprintValue);
      baseHeaders['X-Device-Fingerprint'] = fingerprintValue;
    } else {
      console.warn("⚠️ [InvestmentService] device_fingerprint não encontrado!");
    }
  } catch (e) {
    console.error("❌ [InvestmentService] Erro ao adicionar dados de sessão:", e);
  }

  return baseHeaders;
};

// Função helper para tratar erros da API
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  }
  throw new Error('Erro interno do servidor');
};

/**
 * Buscar tickers - Endpoint: GET /api/investimentos/buscar-tickers/
 * Query Parameter: q (string) - termo de busca
 */
export const buscarTickers = async (searchTerm: string): Promise<TickerSearchResult[]> => {
  try {
    const url = `${API_BASE}${INVESTMENT_ROUTES.buscarTickers}?q=${encodeURIComponent(searchTerm)}`;
    const headers = getAuthHeaders(INVESTMENT_ROUTES.buscarTickers);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// Buscar tickers específicos para FII
export const buscarTickersFII = async (searchTerm: string): Promise<TickerSearchResult[]> => {
  try {
    const url = `${API_BASE}${INVESTMENT_ROUTES.buscarTickersFII}?q=${encodeURIComponent(searchTerm)}`;
    const headers = getAuthHeaders(INVESTMENT_ROUTES.buscarTickersFII);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// Buscar tickers específicos para Ações
export const buscarTickersAcoes = async (searchTerm: string): Promise<TickerSearchResult[]> => {
  try {
    const url = `${API_BASE}${INVESTMENT_ROUTES.buscarTickersAcoes}?q=${encodeURIComponent(searchTerm)}`;
    const headers = getAuthHeaders(INVESTMENT_ROUTES.buscarTickersAcoes);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

/**
 * Buscar ativos pessoais - Endpoint: GET /api/investimentos/ativos-pessoais/
 * Retorna lista de investimentos do usuário
 */
export const buscarAtivosPessoais = async (): Promise<InvestmentAsset[]> => {
  try {
    const url = `${API_BASE}${INVESTMENT_ROUTES.ativosPessoais}`;
    const headers = getAuthHeaders(INVESTMENT_ROUTES.ativosPessoais);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    // Verificar se a resposta tem a estrutura esperada
    if (responseData.success && responseData.data && responseData.data.ativos) {
      return responseData.data.ativos;
    }
    
    // Fallback para outros formatos de resposta
    return responseData.data || responseData.ativos || responseData || [];
  } catch (error) {
    console.error('Erro ao buscar ativos pessoais:', error);
    handleApiError(error);
    return [];
  }
};

/**
 * Cadastrar novo ativo - Endpoint: POST /api/investimentos/ativos-pessoais/
 * Body: dados do investimento (sem o campo corretora)
 */
export const cadastrarAtivo = async (investment: Omit<InvestmentAsset, 'id' | 'valor_total' | 'rentabilidade' | 'percentage'>): Promise<InvestmentAsset> => {
  try {
    const url = `${API_BASE}${INVESTMENT_ROUTES.cadastrarAtivo}`;
    const headers = getAuthHeaders(INVESTMENT_ROUTES.cadastrarAtivo);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(investment),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Editar ativo existente - Endpoint: PUT /api/investimentos/ativos-pessoais/{id}/
 * Path Parameter: id (number) - ID do investimento
 * Body: dados atualizados do investimento
 */
export const editarAtivo = async (id: number, investment: Omit<InvestmentAsset, 'id' | 'valor_total' | 'rentabilidade' | 'percentage'>): Promise<InvestmentAsset> => {
  try {
    const url = `${API_BASE}${INVESTMENT_ROUTES.editarAtivo}${id}/`;
    const headers = getAuthHeaders(INVESTMENT_ROUTES.editarAtivo);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(investment),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Excluir ativo - Endpoint: DELETE /api/investimentos/ativos-pessoais/deletar/{id}/
 * Path Parameter: id (number) - ID do investimento
 */
export const excluirAtivo = async (id: number): Promise<void> => {
  try {
    const url = `${API_BASE}${INVESTMENT_ROUTES.excluirAtivo}${id}/`;
    const headers = getAuthHeaders(INVESTMENT_ROUTES.excluirAtivo);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Buscar resumo da carteira - Endpoint: GET /api/investimentos/resumo-carteira/
 * Retorna métricas consolidadas da carteira do usuário
 */
export const buscarResumoCarteira = async (): Promise<any> => {
  try {
    const url = `${API_BASE}${INVESTMENT_ROUTES.resumoCarteira}`;
    const headers = getAuthHeaders(INVESTMENT_ROUTES.resumoCarteira);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data || {};
  } catch (error) {
    handleApiError(error);
    return {
      total_investido: 0,
      valor_atual: 0,
      ganho_perda_total: 0,
      variacao_percentual_total: 0,
      quantidade_ativos: 0,
      melhor_ativo: null,
      pior_ativo: null
    };
  }
};

/**
 * Analisar ativo específico - Endpoint: GET /api/investimentos/analise-ativo/
 * Query Parameter: ticker (string) - código do ticker para análise
 * Retorna análise completa do ativo
 */
export const analisarAtivo = async (ticker: string): Promise<any> => {
  try {
    const url = `${API_BASE}${INVESTMENT_ROUTES.analiseAtivo}?ticker=${encodeURIComponent(ticker)}`;
    const headers = getAuthHeaders(INVESTMENT_ROUTES.analiseAtivo);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Export default do serviço
const investmentService = {
  buscarTickers,
  buscarTickersFII,
  buscarTickersAcoes,
  buscarAtivosPessoais,
  cadastrarAtivo,
  editarAtivo,
  excluirAtivo,
  buscarResumoCarteira,
  analisarAtivo,
};

export default investmentService;

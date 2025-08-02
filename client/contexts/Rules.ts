/**
 * Rules - Controlador central de requisições API
 * Design Pattern: Centralização de todas as chamadas de API
 */

import { getHeaders, HeaderModel } from "./Headers";
import { getRoute } from "./Rotas";
import { localStorageManager } from "../lib/localStorage";
import { responseParms, ApiResponse } from "./ResponseParms";

// Interface para dados de entrada
interface RequestData {
  body?: any;
  params?: Record<string, string | number>;
  chave: string;
  withAuth?: boolean;
}

// ApiResponse agora vem do ResponseParms

// Códigos de status considerados sucesso
const SUCCESS_CODES = [200, 201, 202, 203];

// Códigos de status considerados erro
const ERROR_CODES = [400, 401, 404, 422, 500];

/**
 * Classe Rules - Controlador central de requisições
 */
export class Rules {
  private static instance: Rules;

  static getInstance(): Rules {
    if (!Rules.instance) {
      Rules.instance = new Rules();
    }
    return Rules.instance;
  }

  /**
   * Monta os parâmetros da requisição conforme especificado
   * @param userData - Dados do usuário/requisição
   * @param chave - Chave para buscar endpoint e headers
   * @returns Parâmetros montados
   */
  private buildRequestParams(userData: RequestData): {
    endpoint: string;
    body: any;
    header: HeaderModel;
    hardCode: HeaderModel;
    fullHeaders: HeaderModel;
  } {
    // userData = userData (mantém como recebido)
    const { body, chave, withAuth = false, params } = userData;

    // hardCode = headers fixos
    const hardCode: HeaderModel = {
      "Content-Type": "application/json",
    };

    // endpoint = get(login.chave) - busca no arquivo Rotas
    let endpoint = getRoute(chave);

    // Adicionar BACKEND_URL ao endpoint
    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
    endpoint = `${BACKEND_URL}${endpoint}`;

    // Adicionar parâmetros à URL se fornecidos
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      endpoint = `${endpoint}?${queryParams.toString()}`;
    }

    // body = userData.body
    const requestBody = body;

    // header = get(headers.chave) + hardCode
    const baseHeaders = getHeaders(chave, withAuth);
    const fullHeaders = { ...baseHeaders, ...hardCode };

    // CORS Fix: Usar apenas headers permitidos pelo backend
    // Backend permite: accept, authorization, content-type, user-agent, x-csrftoken,
    // x-requested-with, x-api-key, x-request-source, x-client-version
    // Removidos: X-Session-ID, X-Device-ID que causam erro CORS

    // Se requer autenticação, adicionar token
    if (withAuth) {
      const token = localStorageManager.getAuthToken();
      if (token) {
        fullHeaders.Authorization = `Bearer ${token}`;
      }
    }

    return {
      endpoint,
      body: requestBody,
      header: baseHeaders,
      hardCode,
      fullHeaders,
    };
  }

  /**
   * Método POST centralizado
   * @param userData - Dados da requisição
   * @returns Resposta da API
   */
  async post(userData: RequestData): Promise<ApiResponse> {
    const { endpoint, body, fullHeaders } = this.buildRequestParams(userData);

    // Consultar o arquivo específico em services/api/PublicPages/ ou PrivatePages/
    const apiService = await this.getApiService(
      userData.chave,
      userData.withAuth,
    );

    const response = await apiService.post(endpoint, body, fullHeaders);

    // Processar resposta através do ResponseParms
    return responseParms.processResponse({
      response,
      chave: userData.chave,
      method: "POST",
      endpoint,
      withAuth: userData.withAuth || false,
    });
  }

  /**
   * Método GET centralizado
   * @param userData - Dados da requisição
   * @returns Resposta da API
   */
  async get(userData: RequestData): Promise<ApiResponse> {
    const { endpoint, fullHeaders } = this.buildRequestParams(userData);

    const apiService = await this.getApiService(
      userData.chave,
      userData.withAuth,
    );

    const response = await apiService.get(endpoint, fullHeaders);

    // Processar resposta através do ResponseParms
    return responseParms.processResponse({
      response,
      chave: userData.chave,
      method: "GET",
      endpoint,
      withAuth: userData.withAuth || false,
    });
  }

  /**
   * Método PUT centralizado
   * @param userData - Dados da requisição
   * @returns Resposta da API
   */
  async put(userData: RequestData): Promise<ApiResponse> {
    const { endpoint, body, fullHeaders } = this.buildRequestParams(userData);

    const apiService = await this.getApiService(
      userData.chave,
      userData.withAuth,
    );

    const response = await apiService.put(endpoint, body, fullHeaders);

    // Processar resposta através do ResponseParms
    return responseParms.processResponse({
      response,
      chave: userData.chave,
      method: "PUT",
      endpoint,
      withAuth: userData.withAuth || false,
    });
  }

  /**
   * Método DELETE centralizado
   * @param userData - Dados da requisição
   * @returns Resposta da API
   */
  async delete(userData: RequestData): Promise<ApiResponse> {
    const { endpoint, fullHeaders } = this.buildRequestParams(userData);

    const apiService = await this.getApiService(
      userData.chave,
      userData.withAuth,
    );

    const response = await apiService.delete(endpoint, fullHeaders);

    // Processar resposta através do ResponseParms
    return responseParms.processResponse({
      response,
      chave: userData.chave,
      method: "DELETE",
      endpoint,
      withAuth: userData.withAuth || false,
    });
  }

  /**
   * Obtém o serviço de API específico baseado na chave
   * @param chave - Chave da operação
   * @param withAuth - Se requer autenticação
   * @returns Serviço de API específico
   */
  private async getApiService(chave: string, withAuth: boolean = false) {
    // Determinar se é página pública ou privada
    const isPublicPage = this.isPublicPageKey(chave);
    const basePath = isPublicPage ? "PublicPages" : "PrivatePages";

    // Mapear chave para arquivo específico
    const serviceFile = this.getServiceFile(chave);

    try {
      // Importar dinamicamente o serviço específico
      const module = await import(
        `../services/api/${basePath}/${serviceFile}.js`
      );
      return module.default || module;
    } catch (error) {
      console.warn(
        `Serviço específico não encontrado para ${chave}, usando serviço genérico`,
      );
      // Fallback para serviço genérico
      return this.getGenericApiService();
    }
  }

  /**
   * Verifica se a chave é de página pública
   * @param chave - Chave da operação
   * @returns True se for página pública
   */
  private isPublicPageKey(chave: string): boolean {
    const publicKeys = [
      "login",
      "register",
      "refreshToken",
      "market",
      "ranking",
      "rankingPublic",
      "demo",
      "tickerAnalysis",
      "fiiMarket",
      "economicIndicators",
      "calculator",
      "wishlistPublic",
      "marketData",
      "marketOverview",
    ];
    return publicKeys.includes(chave);
  }

  /**
   * Mapeia chave para arquivo de serviço
   * @param chave - Chave da operação
   * @returns Nome do arquivo de serviço
   */
  private getServiceFile(chave: string): string {
    const serviceMap: Record<string, string> = {
      // Auth (públicas)
      login: "Login",
      register: "Register",
      refreshToken: "RefreshToken",

      // User (privada)
      user: "User",
      profile: "User",

      // Budget (privadas)
      custos: "Custos",
      maioresCustos: "Custos",
      dividas: "Dividas",
      maioresDividas: "Dividas",
      entradas: "Entradas",
      maioresEntradas: "Entradas",
      variacaoEntrada: "Entradas",
      metas: "Metas",
      metasProgresso: "Metas",

      // Dashboard (privadas)
      dashboard: "Dashboard",
      dashboardStats: "Dashboard",

      // Market (públicas)
      market: "Market",
      ranking: "Ranking",
      rankingPublic: "Ranking",
      tickerAnalysis: "Market",
      fiiMarket: "Market",
      economicIndicators: "Market",
      calculator: "Market",

      // Investment (privadas)
      portfolio: "Investments",
      investments: "Investments",
      alocacaoTipo: "Investments",
      setores: "Investments",
      dividendosFii: "Investments",

      // System (privadas)
      systemConfig: "Dashboard",
      userSettings: "Dashboard",

      // Default
      default: "Generic",
    };

    return serviceMap[chave] || "Generic";
  }

  /**
   * Serviço de API genérico para fallback
   * @returns Serviço genérico
   */
  private getGenericApiService() {
    return {
      async post(
        endpoint: string,
        body: any,
        headers: HeaderModel,
      ): Promise<ApiResponse> {
        return this.makeRequest("POST", endpoint, body, headers);
      },

      async get(endpoint: string, headers: HeaderModel): Promise<ApiResponse> {
        return this.makeRequest("GET", endpoint, null, headers);
      },

      async put(
        endpoint: string,
        body: any,
        headers: HeaderModel,
      ): Promise<ApiResponse> {
        return this.makeRequest("PUT", endpoint, body, headers);
      },

      async delete(
        endpoint: string,
        headers: HeaderModel,
      ): Promise<ApiResponse> {
        return this.makeRequest("DELETE", endpoint, null, headers);
      },

      async makeRequest(
        method: string,
        endpoint: string,
        body: any,
        headers: HeaderModel,
      ): Promise<ApiResponse> {
        try {
          const config: RequestInit = {
            method,
            headers,
          };

          if (body && method !== "GET") {
            config.body = JSON.stringify(body);
          }

          const response = await fetch(endpoint, config);
          const data = await response.json().catch(() => ({}));

          return {
            success: Rules.getInstance().isSuccessStatus(response.status),
            data,
            status: response.status,
            message: data.message || data.detail,
          };
        } catch (error) {
          return {
            success: false,
            status: 0,
            error,
            message: "Network error",
          };
        }
      },
    };
  }

  /**
   * Verifica se o status é considerado sucesso
   * @param status - Código de status HTTP
   * @returns True se for sucesso
   */
  isSuccessStatus(status: number): boolean {
    return SUCCESS_CODES.includes(status);
  }

  /**
   * Verifica se o status é considerado erro
   * @param status - Código de status HTTP
   * @returns True se for erro
   */
  isErrorStatus(status: number): boolean {
    return ERROR_CODES.includes(status);
  }

  /**
   * Obtém mensagem de status baseada no código
   * @param status - Código de status HTTP
   * @returns Mensagem de status
   */
  getStatusMessage(status: number): string {
    const statusMessages: Record<number, string> = {
      200: "Operação realizada com sucesso",
      201: "Recurso criado com sucesso",
      202: "Operação aceita para processamento",
      203: "Informação não-autoritativa",
      400: "Requisição inválida",
      401: "Não autorizado",
      404: "Recurso não encontrado",
      422: "Dados inválidos",
      500: "Erro interno do servidor",
    };

    return statusMessages[status] || `Status ${status}`;
  }
}

// Instância singleton
export const rulesInstance = Rules.getInstance();

// Funções de conveniência para uso direto
export const login = async (
  username: string,
  password: string,
  chave: string = "login",
): Promise<boolean> => {
  const response = await rulesInstance.post({
    chave,
    body: { username, password },
    withAuth: false,
  });

  return response.success;
};

export const register = async (
  userData: {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
  },
  chave: string = "register",
): Promise<boolean> => {
  const response = await rulesInstance.post({
    chave,
    body: userData,
    withAuth: false,
  });

  return response.success;
};

export const getDashboardData = async (
  chave: string = "dashboard",
): Promise<any> => {
  const response = await rulesInstance.get({
    chave,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

export const getBudgetData = async (
  tipo: string,
  chave: string,
): Promise<any> => {
  const response = await rulesInstance.get({
    chave,
    params: { tipo },
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para refresh de token
export const refreshTokenApi = async (
  refreshToken: string,
  chave: string = "refreshToken",
): Promise<any> => {
  const response = await rulesInstance.post({
    chave,
    body: { refresh: refreshToken },
    withAuth: false,
  });

  return response.success ? response.data : null;
};

// Função para buscar dados atualizados do usuário
export const getUserData = async (chave: string = "user"): Promise<any> => {
  const response = await rulesInstance.get({
    chave,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para dashboard
export const getDashboard = async (
  chave: string = "dashboard",
): Promise<any> => {
  const response = await rulesInstance.get({
    chave,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para investimentos
export const getInvestments = async (chave: string): Promise<any> => {
  const response = await rulesInstance.get({
    chave,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para market data
export const getMarketData = async (chave: string = "market"): Promise<any> => {
  const response = await rulesInstance.get({
    chave,
    withAuth: false,
  });

  return response.success ? response.data : null;
};

// Função para ranking
export const getRanking = async (
  tipo: string = "fiis",
  chave: string = "rankingPublic",
): Promise<any> => {
  const response = await rulesInstance.get({
    chave,
    params: { tipo },
    withAuth: false,
  });

  return response.success ? response.data : null;
};

// Função para custos
export const getCustos = async (
  categoria: string,
  mes: string,
  ano: string,
  chave: string = "maioresCustos",
): Promise<any> => {
  const response = await rulesInstance.get({
    chave,
    params: { categoria, mes, ano },
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para cadastrar custo
export const cadastrarCusto = async (
  custoData: any,
  chave: string = "cadastrarCusto",
): Promise<any> => {
  const response = await rulesInstance.post({
    chave,
    body: custoData,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para excluir custo
export const excluirCusto = async (
  id: number,
  chave: string = "excluirCusto",
): Promise<any> => {
  const response = await rulesInstance.delete({
    chave: `${chave}/${id}`,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para atualizar flag custo
export const atualizarFlagCusto = async (
  id: number,
  flagData: { flag: boolean },
  chave: string = "atualizarFlagCusto",
): Promise<any> => {
  const response = await rulesInstance.put({
    chave: `${chave}/${id}`,
    body: flagData,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para dívidas
export const getDividas = async (
  tipo: string,
  mes: string,
  ano: string,
  chave: string = "maioresDividas",
): Promise<any> => {
  const response = await rulesInstance.get({
    chave,
    params: { tipo, mes, ano },
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para cadastrar dívida
export const cadastrarDivida = async (
  dividaData: any,
  chave: string = "cadastrarDivida",
): Promise<any> => {
  const response = await rulesInstance.post({
    chave,
    body: dividaData,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para excluir dívida
export const excluirDivida = async (
  id: number,
  chave: string = "excluirDivida",
): Promise<any> => {
  const response = await rulesInstance.delete({
    chave: `${chave}/${id}`,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para atualizar flag dívida
export const atualizarFlagDivida = async (
  id: number,
  flagData: { flag: boolean },
  chave: string = "atualizarFlagDivida",
): Promise<any> => {
  const response = await rulesInstance.put({
    chave: `${chave}/${id}`,
    body: flagData,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para entradas
export const getEntradas = async (
  tipo: string,
  mes: string,
  ano: string,
  chave: string = "maioresEntradas",
): Promise<any> => {
  const response = await rulesInstance.get({
    chave,
    params: { tipo, mes, ano },
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para cadastrar entrada
export const cadastrarEntrada = async (
  entradaData: any,
  chave: string = "cadastrarEntrada",
): Promise<any> => {
  const response = await rulesInstance.post({
    chave,
    body: entradaData,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para excluir entrada
export const excluirEntrada = async (
  id: number,
  chave: string = "excluirEntrada",
): Promise<any> => {
  const response = await rulesInstance.delete({
    chave: `${chave}/${id}`,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para atualizar flag entrada
export const atualizarFlagEntrada = async (
  id: number,
  flagData: { flag: boolean },
  chave: string = "atualizarFlagEntrada",
): Promise<any> => {
  const response = await rulesInstance.put({
    chave: `${chave}/${id}`,
    body: flagData,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

// Função para metas
export const getMetas = async (chave: string = "metas"): Promise<any> => {
  const response = await rulesInstance.get({
    chave,
    withAuth: true,
  });

  return response.success ? response.data : null;
};

export default Rules;

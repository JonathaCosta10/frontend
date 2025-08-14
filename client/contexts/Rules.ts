import { getHeaders, HeaderModel } from "./Headers";
import { getRoute } from "./Rotas";
import { localStorageManager } from "../lib/localStorage";
import { responseParms, ApiResponse } from "./ResponseParms";

interface RequestData {
  body?: any;
  params?: Record<string, string | number>;
  chave: string;
  withAuth?: boolean;
}

export class Rules {
  private static instance: Rules;

  static getInstance(): Rules {
    if (!Rules.instance) {
      Rules.instance = new Rules();
    }
    return Rules.instance;
  }

  private buildRequestParams(userData: RequestData): {
    endpoint: string;
    body: any;
    header: HeaderModel;
    hardCode: HeaderModel;
    fullHeaders: HeaderModel;
  } {
    const { body, chave, withAuth = false, params } = userData;
    const hardCode: HeaderModel = {
      "Content-Type": "application/json",
    };
    
    let endpoint = getRoute(chave);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
    
    // Tratamento para evitar duplicação de URLs e garantir compatibilidade
    // com todos os padrões de endpoints do backend
    
    // 1. Se o endpoint já tiver o prefixo correto, não adicionar BACKEND_URL
    if (endpoint.startsWith('/services/api/')) {
      // Não adicionar nada, já está no formato correto
      console.log(`🔄 URL já no formato correto: ${endpoint}`);
    } 
    // 2. Se o BACKEND_URL for /services/api e o endpoint começar com /api/
    else if (endpoint.startsWith('/api/') && BACKEND_URL === '/services/api') {
      // Remover /api/ e adicionar o BACKEND_URL
      endpoint = endpoint.substring(4);  // Remove '/api'
      endpoint = `${BACKEND_URL}${endpoint}`;
    } 
    // 3. Caso especial para o refreshToken para evitar duplicação
    else if (chave === 'refreshToken') {
      // Garantir que o refreshToken use o caminho correto
      endpoint = `${BACKEND_URL}/auth/token/refresh/`;
    }
    // 4. Caso padrão: concatenar BACKEND_URL com endpoint
    else {
      endpoint = `${BACKEND_URL}${endpoint}`;
    }
    
    // Adicionar parâmetros de query, se houver
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      endpoint = `${endpoint}?${queryParams.toString()}`;
    }
    
    // Log para debug de URLs em ambiente de desenvolvimento
    if (import.meta.env.DEV || chave === 'refreshToken') {
      console.log(`🔗 API Request [${chave}]:`, {
        endpoint,
        method: body ? 'POST' : 'GET',
        withAuth
      });
    }
    const requestBody = body;
    const baseHeaders = getHeaders(chave, withAuth);
    const fullHeaders = { ...baseHeaders, ...hardCode };
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

  async post(userData: RequestData): Promise<ApiResponse> {
    const { endpoint, body, fullHeaders } = this.buildRequestParams(userData);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: fullHeaders,
        body: JSON.stringify(body),
      });
      const responseData = await response.json();
      return responseParms.processResponse({
        response: {
          success: response.ok,
          data: responseData,
          status: response.status,
          message: response.statusText,
        },
        chave: userData.chave,
        method: "POST",
        endpoint,
        withAuth: !!userData.withAuth,
      });
    } catch (error) {
      return { success: false, status: 500, message: "Network error" };
    }
  }

  async get(userData: RequestData): Promise<ApiResponse> {
    const { endpoint, fullHeaders } = this.buildRequestParams(userData);
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: fullHeaders,
      });
      const responseData = await response.json();
      return responseParms.processResponse({
        response: {
          success: response.ok,
          data: responseData,
          status: response.status,
          message: response.statusText,
        },
        chave: userData.chave,
        method: "GET",
        endpoint,
        withAuth: !!userData.withAuth,
      });
    } catch (error) {
      return { success: false, status: 500, message: "Network error" };
    }
  }
}

const rulesInstance = Rules.getInstance();

// Função de login
export const login = async (
  username: string,
  password: string,
  chave: string = "login",
): Promise<boolean> => {
  try {
    const response = await rulesInstance.post({
      chave,
      body: { username, password },
      withAuth: false,
    });
    return response.success;
  } catch (error) {
    return false;
  }
};

// Função de registro
export const register = async (userData: any, chave: string = "register"): Promise<{ success: boolean; error?: any }> => {
  try {
    const response = await rulesInstance.post({
      chave,
      body: userData,
      withAuth: false,
    });
    
    if (response.success) {
      return { success: true };
    } else {
      // Retornar o erro específico se disponível
      return { 
        success: false, 
        error: response.error || response.message || "Registration failed" 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Network error" 
    };
  }
};

// Exportar instância para uso direto
export { rulesInstance };
export default Rules;

// Função para refresh de token
export const refreshTokenApi = async (
  refreshToken: string,
  chave: string = "refreshToken",
): Promise<any> => {
  console.log("🔄 Refreshing token with chave:", chave);
  
  // Garantir que estamos usando o endpoint correto conforme listado no backend
  // Endpoint esperado: /services/api/auth/token/refresh/
  const response = await rulesInstance.post({
    chave,
    body: { refresh: refreshToken },
    withAuth: false,
  });

  if (response.success) {
    console.log("✅ Token refresh successful!");
    // Log do token para depuração (apenas primeiros caracteres por segurança)
    if (response.data && response.data.access) {
      console.log(`🔑 Novo token recebido: ${response.data.access.substring(0, 10)}...`);
    }
  } else {
    console.warn("❌ Token refresh failed:", response.message || "Unknown error");
  }

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
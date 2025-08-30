import { localStorageManager } from "./localStorage";

// Configuração centralizada para URLs da API
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const API_KEY = import.meta.env.VITE_API_KEY || "}$gQ7TlDEhJ88np]^n8[uFu{9f#;+8qjZ&?c[+Sj_CLhMO[Z(iM_)ZnW]j2M]+j+";

// Tratamento para consistência de URLs
const normalizeUrl = (url: string): string => {
  // Log para depuração de URLs em produção (ativo temporariamente)
  console.log("🔄 Normalizando URL:", { 
    url, 
    backendUrl: BACKEND_URL, 
    isProd: typeof window !== 'undefined' && window.location.hostname.includes('organizesee.com.br'),
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
  });

  // Se a URL já começa com o BACKEND_URL, não adicionar prefixo
  if (url.startsWith(BACKEND_URL) || url.startsWith('http')) {
    return url;
  }
  
  // Tratamento específico para produção - URLs /api devem usar /services/api no organizesee.com.br
  if (url.startsWith('/api/') && typeof window !== 'undefined' && window.location.hostname.includes('organizesee.com.br')) {
    const prodUrl = `https://backend.organizesee.com.br/services/api${url.substring(4)}`;
    console.log("📍 URL corrigida para produção:", prodUrl);
    return prodUrl;
  }
  
  // Para desenvolvimento local - URLs /api/ para usar endpoints completos
  if (url.startsWith('/api/') && BACKEND_URL.includes('127.0.0.1')) {
    const devUrl = `${BACKEND_URL}${url}`;
    console.log("📍 URL para desenvolvimento:", devUrl);
    return devUrl;
  }
  
  // Normalizar URLs que começam com /api/ para usar /services/api/ em ambiente não local
  if (url.startsWith('/api/') && !BACKEND_URL.includes('127.0.0.1') && !BACKEND_URL.includes('localhost')) {
    const servicePath = `/services/api${url.substring(4)}`;
    const fullUrl = `${BACKEND_URL}${servicePath}`;
    console.log("📍 URL normalizada com services:", fullUrl);
    return fullUrl;
  }
  
  // Caso padrão: concatenar BACKEND_URL com a URL
  const standardUrl = `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  console.log("📍 URL padrão:", standardUrl);
  return standardUrl;
};

interface ExtendedRequestInit extends RequestInit {
  authenticated?: boolean;
  skipRefresh?: boolean;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export class ApiService {
  private static instance: ApiService;
  private refreshPromise: Promise<boolean> | null = null;

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Construir headers com autenticação JWT
   */
  private buildHeaders(
    customHeaders: HeadersInit = {},
    includeAuth: boolean = false,
    skipCustomHeaders: boolean = false,
  ): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
      "X-Client-Version": localStorageManager.getAppVersion() || "1.0.0",
      "X-Requested-With": "XMLHttpRequest", // Header permitido pelo backend
      ...customHeaders,
    };

    // CORS Fix: Não adicionar headers problemáticos para refresh token
    if (!skipCustomHeaders) {
      // Comentado para evitar erro CORS no refresh token
      // const sessionId = localStorageManager.getSessionId();
      // if (sessionId) {
      //   headers["X-Session-ID"] = sessionId;
      // }
      // const fingerprint = localStorageManager.getDeviceFingerprint();
      // if (fingerprint) {
      //   headers["X-Device-ID"] = fingerprint.hash;
      // }
    }

    if (includeAuth) {
      const token = localStorageManager.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Validar token JWT antes de fazer requisição
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);

      // Verificar se token está prestes a expirar (em 1 minuto)
      if (payload.exp - now < 60) {
        return false;
      }

      // Validar campos obrigatórios
      if (!payload.user_id || !payload.email) {
        return false;
      }

      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Método principal para requisições com segurança JWT
   */
  async request(
    endpoint: string,
    options: ExtendedRequestInit = {},
  ): Promise<any> {
    const normalizedUrl = normalizeUrl(endpoint);
    const includeAuth = options.authenticated ?? false;

    // Log para debug da URL normalizada
    if (import.meta.env.DEV || endpoint.includes("login") || endpoint.includes("refresh")) {
      console.log(`🔗 Request: ${normalizedUrl}`, { 
        original: endpoint, 
        isAuth: includeAuth 
      });
    }

    // Validar token se autenticação necessária
    if (includeAuth) {
      const token = localStorageManager.getAuthToken();
      if (!token || !this.isTokenValid(token)) {
        console.log("Token inválido ou expirado detectado");

        if (!options.skipRefresh) {
          const refreshed = await this.refreshToken();
          if (!refreshed) {
            this.handleAuthFailure();
            const error = new Error("Authentication failed") as ApiError;
            error.status = 401;
            error.code = "AUTH_FAILED";
            throw error;
          }
        }
      }
    }

    // CORS Fix: Detectar refresh token para evitar headers problemáticos
    const isRefreshTokenRequest = endpoint.includes("/token/refresh/");
    const headers = this.buildHeaders(
      options.headers || {},
      includeAuth,
      isRefreshTokenRequest,
    );
    const { authenticated, skipRefresh, ...fetchOptions } = options;

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      signal: AbortSignal.timeout(15000), // 15 segundos timeout - reduzido para melhor performance
    };

    try {
      let response = await fetch(normalizedUrl, config);

      // Tratar 401 Unauthorized
      if (
        response.status === 401 &&
        includeAuth &&
        !options.skipRefresh &&
        this.hasRefreshToken() &&
        !this.isRefreshEndpoint(endpoint)
      ) {
        console.log("Recebido 401, tentando refresh do token");

        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Repetir com novo token usando a URL normalizada
          const newHeaders = this.buildHeaders(options.headers || {}, true);
          response = await fetch(normalizedUrl, { ...config, headers: newHeaders });
        } else {
          this.handleAuthFailure();
          const error = new Error(
            "Authentication failed after refresh",
          ) as ApiError;
          error.status = 401;
          error.code = "AUTH_REFRESH_FAILED";
          throw error;
        }
      }

      // Status 204 (No Content) é sucesso para DELETE, mas response.ok é false
      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.detail || errorData.message || `HTTP ${response.status}`,
        ) as ApiError;
        error.status = response.status;
        error.code = errorData.code || `HTTP_${response.status}`;
        error.details = errorData;

        console.error("API request failed", {
          endpoint,
          status: response.status,
          code: error.code,
        });

        throw error;
      }

      // Para status 204 (No Content), retornar objeto vazio
      if (response.status === 204) {
        return {};
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.error("Request timeout", { endpoint });
        const timeoutError = new Error("Request timeout") as ApiError;
        timeoutError.status = 408;
        timeoutError.code = "TIMEOUT";
        throw timeoutError;
      }

      // Re-lançar ApiErrors como estão
      if ((error as ApiError).status) {
        throw error;
      }

      // Erros de rede ou outros
      console.error("Network error", {
        endpoint,
        error: (error as Error).message,
      });
      const networkError = new Error("Network error occurred") as ApiError;
      networkError.status = 0;
      networkError.code = "NETWORK_ERROR";
      throw networkError;
    }
  }

  /**
   * Wrapper para requisições autenticadas
   */
  async authenticatedRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    return this.request(endpoint, { ...options, authenticated: true });
  }

  /**
   * Refresh de token com padrão singleton para prevenir múltiplos refreshes simultâneos
   */
  private async refreshToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;

    return result;
  }

  /**
   * Executar refresh real do token
   */
  private async performTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = localStorageManager.getRefreshToken();
      if (!refreshToken) {
        console.log("Nenhum refresh token disponível");
        return false;
      }

      console.log("Tentando refresh do token");

      const response = await this.request("/api/auth/token/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh: refreshToken }),
        skipRefresh: true, // Prevenir refresh recursivo
      });

      if (!response.access) {
        throw new Error("Resposta de refresh inválida");
      }

      // Processar resposta completa através do ResponseParms
      const { responseParms } = await import('../contexts/ResponseParms');
      console.log("🔄 Processando refresh token através do ResponseParms");
      console.log("🔍 Dados recebidos do refresh:", response);
      
      // Simular estrutura de resposta da API para processamento
      const apiResponse = {
        success: true,
        data: response,
        status: 200,
        message: "Refresh token bem-sucedido"
      };
      
      responseParms.processResponse({
        response: apiResponse,
        chave: "refreshToken",
        method: "POST",
        endpoint: "/api/auth/token/refresh/",
        withAuth: true
      });
      
      console.log("Refresh do token bem-sucedido");
      return true;
    } catch (error) {
      console.error("Refresh do token falhou", {
        error: (error as Error).message,
      });
      this.handleAuthFailure();
      return false;
    }
  }

  /**
   * Verificar se refresh token existe
   */
  private hasRefreshToken(): boolean {
    return !!localStorageManager.getRefreshToken();
  }

  /**
   * Verificar se endpoint é relacionado a refresh
   */
  private isRefreshEndpoint(endpoint: string): boolean {
    return (
      endpoint.includes("/token/refresh/") ||
      endpoint.includes("/logout/") ||
      endpoint.includes("/register/") ||
      endpoint.includes("/login/")
    );
  }

  /**
   * Tratar falha de autenticação
   */
  private handleAuthFailure(): void {
    console.log("Falha de autenticação - limpando dados de auth");

    localStorageManager.clearAuthData();

    // Redirecionar para login para rotas protegidas
    const publicPages = ["/", "/home", "/market", "/login", "/signup", "/demo"];
    const currentPath = window.location.pathname;

    if (
      !publicPages.includes(currentPath) &&
      !currentPath.startsWith("/public")
    ) {
      console.log("Redirecionando para login", { from: currentPath });
      window.location.href = "/login";
    }
  }

  /**
   * Métodos HTTP com flag de autenticação
   */

  async get(endpoint: string, authenticated = true): Promise<any> {
    return this.request(endpoint, {
      method: "GET",
      authenticated,
    });
  }

  async post(endpoint: string, data: any, authenticated = true): Promise<any> {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      authenticated,
    });
  }

  async put(endpoint: string, data: any, authenticated = true): Promise<any> {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      authenticated,
    });
  }

  async patch(endpoint: string, data: any, authenticated = true): Promise<any> {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
      authenticated,
    });
  }

  async delete(endpoint: string, authenticated = true): Promise<any> {
    return this.request(endpoint, {
      method: "DELETE",
      authenticated,
    });
  }

  /**
   * Upload de arquivo com rastreamento de progresso
   */
  async uploadFile(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      // Rastreamento de progresso
      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      // Definir headers
      const token = localStorageManager.getAuthToken();
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      xhr.setRequestHeader("X-API-Key", API_KEY);

      const fingerprint = localStorageManager.getDeviceFingerprint();
      if (fingerprint) {
        xhr.setRequestHeader("X-Device-ID", fingerprint.hash);
      }

      xhr.open("POST", `${BACKEND_URL}${endpoint}`);
      xhr.send(formData);
    });
  }

  /**
   * Requisições em lote com tratamento de erro
   */
  async batchRequest(
    requests: Array<{
      endpoint: string;
      options?: ExtendedRequestInit;
    }>,
  ): Promise<Array<{ success: boolean; data?: any; error?: string }>> {
    const results = await Promise.allSettled(
      requests.map(({ endpoint, options }) => this.request(endpoint, options)),
    );

    return results.map((result) => {
      if (result.status === "fulfilled") {
        return { success: true, data: result.value };
      } else {
        return {
          success: false,
          error:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
        };
      }
    });
  }
}

// Exportar instância singleton
export const api = ApiService.getInstance();

// Tipos para uso na aplicação
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T = any> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ErrorResponse {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
  code?: string;
}

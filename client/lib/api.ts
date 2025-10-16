import { localStorageManager } from "./localStorage";

// Configuração centralizada para URLs da API
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
                   import.meta.env.VITE_API_BASE_URL || 
                   import.meta.env.VITE_API_URL || 
                   "http://127.0.0.1:5000";
const API_KEY = import.meta.env.VITE_API_KEY || "}$gQ7TlDEhJ88np]^n8[uFu{9f#;+8qjZ&?c[+Sj_CLhMO[Z(iM_)ZnW]j2M]+j+";

console.log('🔧 Configuração da API:', {
  BACKEND_URL,
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_KEY: API_KEY?.substring(0, 10) + '...'
});

// Tratamento para consistência de URLs
const normalizeUrl = (url: string): string => {
  const isProd = typeof window !== 'undefined' && (
    window.location.hostname.includes('organizesee.com.br') || 
    window.location.hostname.includes('www.organizesee.com.br')
  );
  
  // Log para depuração de URLs
  console.log("🔄 Normalizando URL:", { 
    url, 
    backendUrl: BACKEND_URL, 
    isProd,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
  });

  // Se a URL já é absoluta com https, manter como está
  if (url.startsWith('https://')) {
    // Verificar se é uma URL para o backend sem /services/api/ em produção
    if (isProd && 
        url.startsWith('https://backend.organizesee.com.br/api/') && 
        !url.includes('/services/api/')) {
      // Converter de /api/ para /services/api/
      const correctedUrl = url.replace('/api/', '/services/api/');
      console.log("📍 URL absoluta corrigida para produção:", correctedUrl);
      return correctedUrl;
    }
    return url;
  }
  
  // URLs relativas começando com /api/ em ambiente de produção
  if (url.startsWith('/api/') && isProd) {
    const prodUrl = `https://www.organizesee.com.br/services/api${url.substring(4)}`;
    console.log("📍 URL corrigida para produção:", prodUrl);
    return prodUrl;
  }
  
  // Para desenvolvimento local - manter formato /api/
  if (url.startsWith('/api/') && (BACKEND_URL.includes('127.0.0.1') || BACKEND_URL.includes('localhost'))) {
    const devUrl = `${BACKEND_URL}${url}`;
    console.log("📍 URL para desenvolvimento:", devUrl);
    return devUrl;
  }
  
  // Para URLs que começam com /investimentos/ em produção
  if (url.startsWith('/investimentos/') && isProd) {
    const prodUrl = `https://www.organizesee.com.br/services/api${url}`;
    console.log("📍 URL de investimentos corrigida para produção:", prodUrl);
    return prodUrl;
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

// Extender interface Window global para incluir métodos personalizados
declare global {
  interface Window {
    handleTokenRefreshAndRetry?: () => boolean;
  }
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

    // IMPORTANTE: Sempre incluir session_id e device_fingerprint para resolver o erro de token malformado
    // A única exceção é para o endpoint de refresh token que pode ter restrições específicas de CORS
    if (!skipCustomHeaders) {
      try {
        // Obter session_id do localStorage
        const sessionId = localStorageManager.getSessionId();
        if (sessionId) {
          console.log("🔑 Incluindo session_id no cabeçalho:", sessionId);
          headers["X-Session-ID"] = sessionId;
        } else {
          console.warn("⚠️ session_id não encontrado no localStorage!");
        }
        
        // Obter device_fingerprint do localStorage
        const fingerprint = localStorageManager.getDeviceFingerprint();
        if (fingerprint) {
          // Se for objeto, usar a propriedade hash, se for string usar diretamente
          const fingerprintValue = typeof fingerprint === 'object' ? 
            (fingerprint.hash || JSON.stringify(fingerprint)) : 
            fingerprint;
            
          console.log("👆 Incluindo device_fingerprint no cabeçalho:", fingerprintValue);
          headers["X-Device-Fingerprint"] = fingerprintValue;
        } else {
          console.warn("⚠️ device_fingerprint não encontrado no localStorage!");
        }
      } catch (e) {
        console.error("❌ Erro ao adicionar dados de sessão aos headers:", e);
      }
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
      // Validar formato básico do JWT (deve ter três partes separadas por pontos)
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("⚠️ Token com formato inválido (não tem 3 partes):", {
          partes: parts.length,
          tokenLength: token.length
        });
        return false;
      }

      // Verificar se a segunda parte é decodificável como base64
      try {
        // Garantir que o base64 seja válido para decodificação
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        
        const now = Math.floor(Date.now() / 1000);
        
        // Log detalhado sobre o token para diagnóstico
        console.log("🔍 Validação detalhada do JWT:", {
          exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'ausente',
          iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'ausente',
          ttlSegundos: payload.exp ? (payload.exp - now) : 'desconhecido',
          agora: new Date(now * 1000).toISOString(),
          tempoRestante: payload.exp ? `${Math.floor((payload.exp - now) / 60)} minutos` : 'desconhecido',
          hasUserId: !!payload.user_id || !!payload.sub,
          hasEmail: !!payload.email
        });

        // Verificar se token está prestes a expirar (em 1 minuto)
        if (payload.exp && payload.exp - now < 60) {
          console.warn("⚠️ Token está prestes a expirar (menos de 1 minuto)");
          return false;
        }

        // Aceitar tokens com user_id/sub OU email (mais flexível para OAuth)
        const hasIdentifier = !!(payload.user_id || payload.sub);
        
        if (!hasIdentifier) {
          console.warn("⚠️ Token sem identificador de usuário");
          return false;
        }

        return payload.exp ? payload.exp > now : true;
      } catch (decodeError) {
        console.error("❌ Erro ao decodificar payload do JWT:", decodeError);
        return false;
      }
    } catch (error) {
      console.error("❌ Erro ao validar token JWT:", error);
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

    // Gerenciamento de timeout adaptativo - mais tempo para requisições importantes
    const timeoutDuration = isRefreshTokenRequest ? 30000 : 
                            endpoint.includes("/distribuicao_gastos") ? 25000 : 
                            endpoint.includes("/rentabilidade-geral") ? 45000 : // Aumentando timeout para rentabilidade
                            endpoint.includes("/auth/") ? 20000 : 
                            endpoint.includes("/login") ? 30000 : 15000;
    
    console.log(`⏱️ [REQUEST TIMEOUT] Configurando timeout para ${endpoint}:`, {
      duration: timeoutDuration,
      isRefresh: isRefreshTokenRequest,
      isAuth: includeAuth,
      endpoint
    });
    
    const config: RequestInit = {
      ...fetchOptions,
      headers
      // Não configuramos signal aqui - será feito via AbortController
    };

    try {
      let response;
      
      // Criando um novo AbortController para melhor gerenciamento de erros
      const requestController = new AbortController();
      const requestTimeout = setTimeout(() => {
        requestController.abort('timeout');
      }, timeoutDuration);
      
      // Sobrescrever o signal do config para usar o controller customizado
      const requestConfig = {
        ...config,
        signal: requestController.signal
      };
      
      try {
        response = await fetch(normalizedUrl, requestConfig);
        clearTimeout(requestTimeout); // Limpar timeout se a resposta for recebida
      
        // Tratar 401 Unauthorized
        if (response.status === 401) {
          // Log detalhado do erro 401 para diagnóstico
          console.warn("⚠️ [401 UNAUTHORIZED]", {
            endpoint,
            hasSessionId: headers["X-Session-ID"] ? "sim" : "não",
            hasDeviceFingerprint: headers["X-Device-Fingerprint"] ? "sim" : "não",
            hasAuthHeader: headers["Authorization"] ? "sim" : "não"
          });
          
          try {
            const errorData = await response.clone().json();
            console.error("🔴 Detalhes do erro 401:", errorData);
            
            // Verificar se é o erro específico de token malformado
            if (errorData.message && errorData.message.includes("Token malformado")) {
              console.error("🔴 Erro de token malformado detectado - dados de sessão:", {
                sessionId: localStorageManager.getSessionId(),
                deviceFingerprint: localStorageManager.getDeviceFingerprint()
              });
            }
          } catch (e) {
            console.log("Não foi possível extrair detalhes do erro 401");
          }
        }
        
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
            // Criar novo controller para nova tentativa
            const retryController = new AbortController();
            const retryTimeout = setTimeout(() => {
              retryController.abort('timeout');
            }, timeoutDuration);
            
            // Repetir com novo token usando a URL normalizada
            const newHeaders = this.buildHeaders(options.headers || {}, true);
            try {
              response = await fetch(normalizedUrl, { 
                ...requestConfig, 
                headers: newHeaders,
                signal: retryController.signal 
              });
              clearTimeout(retryTimeout);
            } catch (retryError) {
              clearTimeout(retryTimeout);
              throw retryError;
            }
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
      } catch (fetchError) {
        clearTimeout(requestTimeout);
        throw fetchError;
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
    console.log("🔄 Iniciando processo de refresh do token de autenticação");
    
    // Prevenir múltiplos refreshes em curto período de tempo - RELAXAR PARA LOGIN
    const lastRefreshKey = 'lastTokenRefreshAttempt';
    const lastRefreshTime = parseInt(localStorage.getItem(lastRefreshKey) || '0');
    const currentTime = Date.now();
    const minRefreshInterval = 1000; // Reduzido para 1 segundo para resolver fluxos de autenticação OAuth
    
    // Se um login acabou de ser realizado ou estamos no callback OAuth, não bloquear o refresh
    const recentLoginAttempt = localStorage.getItem('recentLoginAttempt');
    const isCallbackAuth = window.location.pathname.includes('/auth/callback');
    const isPostLogin = recentLoginAttempt && (currentTime - parseInt(recentLoginAttempt)) < 30000;
    
    if (currentTime - lastRefreshTime < minRefreshInterval && !isPostLogin && !isCallbackAuth) {
      console.log("⚠️ [TOKEN REFRESH] Tentativas muito frequentes, aguardando intervalo mínimo", {
        lastAttempt: new Date(lastRefreshTime).toISOString(),
        currentTime: new Date(currentTime).toISOString(),
        timeDiff: currentTime - lastRefreshTime,
        minInterval: minRefreshInterval,
        isPostLogin,
        isCallbackAuth
      });
      
      // Se estamos no fluxo de OAuth ou login recente, permitir sem atraso
      if (isCallbackAuth || isPostLogin) {
        console.log("🔑 Contexto de autenticação detectado, permitindo refresh imediato");
      } else {
        await new Promise(resolve => setTimeout(resolve, 200)); // Delay mínimo
      }
    }
    
    // Registrar tentativa atual
    localStorage.setItem(lastRefreshKey, currentTime.toString());
    
    // Sistema de controle de tentativas - Flexibilizar para autenticação OAuth
    const refreshCountKey = 'tokenRefreshAttemptCount';
    const maxAttempts = isCallbackAuth ? 5 : 3; // Mais tentativas para o fluxo de callback OAuth
    let currentAttempts = parseInt(localStorage.getItem(refreshCountKey) || '0');
    
    // Reset do contador se for um contexto de autenticação
    if (isCallbackAuth || isPostLogin) {
      console.log("🔑 Contexto de autenticação detectado, resetando contador de tentativas");
      currentAttempts = 0;
      localStorage.setItem(refreshCountKey, '0');
    }
    
    if (currentAttempts >= maxAttempts) {
      console.log("🛑 [TOKEN REFRESH] Máximo de tentativas atingido:", {
        currentAttempts,
        maxAttempts,
        isCallbackAuth,
        isPostLogin
      });
      
      // Reset do contador após 15 segundos para permitir novas tentativas
      setTimeout(() => {
        localStorage.setItem(refreshCountKey, '0');
      }, 15000);
      
      return false;
    }
    
    // Incrementar contador
    localStorage.setItem(refreshCountKey, (currentAttempts + 1).toString());
    console.log(`⚠️ [TOKEN REFRESH] Tentativa ${currentAttempts + 1}/${maxAttempts}`);

    try {
      const refreshToken = localStorageManager.getRefreshToken();
      if (!refreshToken) {
        console.log("❌ Nenhum refresh token disponível");
        return false;
      }

      // Log do refresh token para debug (apenas partes)
      console.log("🔑 Refresh token usado:", { 
        length: refreshToken.length,
        start: refreshToken.substring(0, 5) + '...',
        end: '...' + refreshToken.substring(refreshToken.length - 5)
      });

      // Criar controller para timeout mais longo para refresh
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort('timeout');
      }, 30000);
      
      // Construir headers específicos para refresh token
      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      };

      try {
        // Usar fetch direto para refresh para evitar loops, com três opções de endpoints
        let response, endpointUsed;
        let success = false;
        let errorDetails;
        
        // Preparar dados de sessão para incluir em todas tentativas de refresh
        const sessionId = localStorageManager.getSessionId();
        const deviceFingerprint = localStorageManager.getDeviceFingerprint();
        
        // Preparar corpo da requisição com dados de sessão que será usado em todos os endpoints
        const refreshBody = {
          refresh: refreshToken,
          session_id: sessionId,
          device_fingerprint: typeof deviceFingerprint === 'object' ? 
            (deviceFingerprint.hash || JSON.stringify(deviceFingerprint)) : 
            deviceFingerprint
        };
        
        console.log("� Dados de sessão para refresh token:", {
          hasSessionId: !!sessionId,
          hasDeviceFingerprint: !!deviceFingerprint,
          sessionIdTipo: typeof sessionId,
          deviceFingerprintTipo: typeof deviceFingerprint
        });
        
        // Tentar o endpoint principal primeiro
        try {
          const mainEndpoint = normalizeUrl("/api/auth/token/refresh/");
          console.log("🔄 Tentando refresh em endpoint principal:", mainEndpoint);
          
          console.log("📤 Enviando refresh token com dados de sessão:", {
            endpoint: mainEndpoint,
            bodyKeys: Object.keys(refreshBody)
          });
          
          response = await fetch(mainEndpoint, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(refreshBody),
            credentials: 'include', // Importante para CORS
            signal: controller.signal
          });
          
          if (response.ok) {
            endpointUsed = mainEndpoint;
            success = true;
            console.log("✅ Refresh bem-sucedido no endpoint principal");
          } else {
            const errorText = await response.text();
            errorDetails = { status: response.status, text: errorText, endpoint: mainEndpoint };
            console.warn("⚠️ Falha no endpoint principal:", errorDetails);
            throw new Error(`Falha no endpoint principal: ${response.status}`);
          }
        } catch (mainEndpointError) {
          // Se falhar, tentar o segundo endpoint
          console.log("🔄 Tentando segundo endpoint para refresh...");
          try {
            const secondEndpoint = normalizeUrl("/auth/token/refresh/");
            
            console.log("📤 Tentando segundo endpoint com dados de sessão:", {
              endpoint: secondEndpoint,
              bodyKeys: Object.keys(refreshBody)
            });
            
            response = await fetch(secondEndpoint, {
              method: "POST",
              headers: headers,
              body: JSON.stringify(refreshBody),
              credentials: 'include',
              signal: controller.signal
            });
            
            if (response.ok) {
              endpointUsed = secondEndpoint;
              success = true;
              console.log("✅ Refresh bem-sucedido no segundo endpoint");
            } else {
              const errorText = await response.text();
              errorDetails = { ...errorDetails, status2: response.status, text2: errorText, endpoint2: secondEndpoint };
              console.warn("⚠️ Falha também no segundo endpoint:", errorDetails);
              throw new Error(`Falha também no segundo endpoint: ${response.status}`);
            }
          } catch (secondEndpointError) {
            // Se ambos falharem, tentar endpoint de fallback direto para backend
            console.log("🔄 Tentando endpoint de fallback para refresh...");
            const fallbackEndpoint = import.meta.env.VITE_BACKEND_URL 
                ? `${import.meta.env.VITE_BACKEND_URL}/auth/token/refresh/` 
                : 'http://127.0.0.1:5000/auth/token/refresh/';
            
            console.log("📤 Tentando endpoint fallback com dados de sessão:", {
              endpoint: fallbackEndpoint,
              bodyKeys: Object.keys(refreshBody)
            });
            
            response = await fetch(fallbackEndpoint, {
              method: "POST",
              headers: headers,
              body: JSON.stringify(refreshBody),
              credentials: 'include',
              signal: controller.signal
            });
            
            if (response.ok) {
              endpointUsed = fallbackEndpoint;
              success = true;
              console.log("✅ Refresh bem-sucedido no endpoint de fallback");
            } else {
              errorDetails = { 
                ...errorDetails, 
                status3: response.status, 
                endpoint3: fallbackEndpoint 
              };
              throw new Error(`Todos os endpoints de refresh falharam`);
            }
          }
        }

        if (!success || !response.ok) {
          throw new Error(`Refresh falhou em todos os endpoints: ${JSON.stringify(errorDetails)}`);
        }

        const data = await response.json();
        clearTimeout(timeoutId);

        console.log("🔍 Resposta do refresh token:", {
          hasAccess: !!data.access,
          hasRefresh: !!data.refresh,
          hasUser: !!data.user,
          endpoint: endpointUsed
        });

        if (!data.access) {
          throw new Error("Resposta de refresh inválida: sem token de acesso");
        }

        // Processar resposta completa através do ResponseParms
        const { responseParms } = await import('@/contexts/ResponseParms');
        console.log("🔄 Processando refresh token através do ResponseParms");
        
        // Simular estrutura de resposta da API para processamento
        const apiResponse = {
          success: true,
          data: data,
          status: 200,
          message: "Refresh token bem-sucedido"
        };
        
        responseParms.processResponse({
          response: apiResponse,
          chave: "refreshToken",
          method: "POST",
          endpoint: endpointUsed,
          withAuth: true
        });
        
        // Reset do contador de tentativas após sucesso
        localStorage.setItem(refreshCountKey, '0');
        
        // CORREÇÃO CRÍTICA: Disparar eventos para notificar componentes do refresh
        console.log("✅ Refresh do token bem-sucedido - emitindo eventos");
        
        // Evento padrão
        const tokenRefreshEvent = new CustomEvent('tokenRefreshed', { 
          detail: { 
            timestamp: new Date().toISOString(),
            success: true 
          } 
        });
        window.dispatchEvent(tokenRefreshEvent);
        
        // Evento de autenticação
        const authEvent = new CustomEvent('authTokenRefreshed', { 
          detail: { 
            timestamp: new Date().toISOString()
          } 
        });
        window.dispatchEvent(authEvent);
        
        // Evento de compatibilidade com login
        const loginEvent = new CustomEvent('auth:login:success', { 
          detail: { 
            source: 'tokenRefresh',
            timestamp: new Date().toISOString()
          } 
        });
        window.dispatchEvent(loginEvent);
        
        console.log("📡 [TOKEN EVENT] Eventos de refresh disparados com sucesso");
        
        // Verificar se o token foi realmente armazenado
        const storedToken = localStorageManager.getAuthToken();
        if (storedToken) {
          console.log("✅ Token armazenado com sucesso após refresh");
          return true;
        } else {
          console.warn("⚠️ Token não foi armazenado corretamente após refresh");
          
          // Tentar armazenar novamente
          if (data.access) {
            console.log("� Tentando armazenar token novamente");
            const stored = localStorageManager.setAuthToken(data.access);
            return stored;
          }
          return false;
        }
      } catch (requestError) {
        clearTimeout(timeoutId);
        throw requestError;
      }
    } catch (error) {
      console.error("❌ Refresh do token falhou", {
        error: (error as Error).message,
        attempt: currentAttempts + 1,
        maxAttempts
      });
      
      // Emitir evento de falha para notificar componentes
      const failEvent = new CustomEvent('tokenRefreshFailed', { 
        detail: { 
          timestamp: new Date().toISOString(),
          error: (error as Error).message,
          attempt: currentAttempts
        } 
      });
      window.dispatchEvent(failEvent);
      
      // Verificar se estamos em contexto de OAuth para tratamento especial
      if (isCallbackAuth) {
        console.log("⚠️ Falha no refresh durante autenticação OAuth");
        // Em callback de autenticação, notificar componentes de autenticação
        const authFailEvent = new CustomEvent('auth:oauth:error', { 
          detail: { 
            timestamp: new Date().toISOString(),
            error: (error as Error).message
          } 
        });
        window.dispatchEvent(authFailEvent);
      }
      
      // Se for a última tentativa, disparar falha de autenticação
      if (currentAttempts + 1 >= maxAttempts) {
        this.handleAuthFailure();
      }
      
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

    // Não limpar tokens em caso de login ativo
    const recentLoginAttempt = localStorage.getItem('recentLoginAttempt');
    const currentTime = Date.now();
    const isPostLogin = recentLoginAttempt && (currentTime - parseInt(recentLoginAttempt)) < 10000;
    
    if (isPostLogin) {
      console.log("Falha de autenticação durante login - preservando tokens");
      return;
    }

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
    // Se o endpoint é login, registrar isso para o sistema de refresh
    if (endpoint.includes('/login')) {
      localStorage.setItem('recentLoginAttempt', Date.now().toString());
    }
    
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

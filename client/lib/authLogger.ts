/**
 * Utilitário de log para autenticação
 * Fornece funções para registrar eventos de autenticação e formatar as URLs corretamente
 */

// Constantes para URLs de autenticação
const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login/",
  REGISTER: "/auth/register/",
  REFRESH_TOKEN: "/auth/token/refresh/",
  RECUPERAR_SENHA: "/auth/recuperar-senha/",
  VALIDAR_REDEFINIR_SENHA: "/auth/validar-redefinir-senha/"
};

/**
 * Formata a URL completa para autenticação baseada no ambiente
 * @param endpoint - Endpoint relativo (ex: /auth/login/)
 * @returns URL completa para o endpoint
 */
export const formatAuthUrl = (endpoint: string): string => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "/services/api";
  
  // Evitar duplicação de /services/api/ no início do endpoint
  if (endpoint.startsWith("/services/api/")) {
    return endpoint;
  }
  
  // Garantir que o endpoint comece com /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Registra tentativas de login no console
 */
export const logAuthAttempt = (username: string, url: string): void => {
  console.log("🔐 Tentativa de login:", {
    username,
    url,
    timestamp: new Date().toISOString()
  });
};

/**
 * Registra eventos de refresh token no console
 */
export const logTokenRefresh = (success: boolean, url: string, errorMessage?: string): void => {
  if (success) {
    console.log("🔄 Refresh token bem-sucedido:", {
      url,
      timestamp: new Date().toISOString()
    });
  } else {
    console.error("❌ Falha no refresh token:", {
      url,
      error: errorMessage || "Erro desconhecido",
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Registra erros de autenticação no console
 */
export const logAuthError = (endpoint: string, error: any): void => {
  console.error(`❌ Erro de autenticação em ${endpoint}:`, {
    error: error?.message || error,
    stack: error?.stack,
    timestamp: new Date().toISOString()
  });
};

// Exportar constantes para uso externo
export { AUTH_ENDPOINTS };

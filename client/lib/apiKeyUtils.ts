/**
 * API Key Utilities - Gerenciamento inteligente de API_KEY
 * Determina automaticamente quando incluir a API_KEY nas requisições
 */

// Lista de páginas públicas que NÃO necessitam API_KEY
const PUBLIC_PAGES = [
  '/',
  '/home',
  '/market',
  '/login',
  '/signup',
  '/demo',
  '/public',
  '/forgot-password',
  '/reset-password',
  '/verify-reset-code',
  '/password-reset-sent',
  '/authentication-error',
  '/login-error',
  '/not-found'
];

// Lista de endpoints de API públicos que NÃO necessitam API_KEY
const PUBLIC_API_ENDPOINTS = [
  '/api/auth/login/',
  '/api/auth/register/',
  '/api/market/public/',
  '/api/market/ranking/public/',
  '/api/market/fii/public/',
  '/api/market/ticker/public/',
  '/api/public/',
  '/api/demo/',
  '/api/health/',
  '/api/version/'
];

/**
 * Verifica se a página atual é pública (não necessita API_KEY)
 * @param pathname - Caminho atual da página
 * @returns boolean - true se for página pública
 */
export const isPublicPage = (pathname: string): boolean => {
  // Verificar páginas exatas
  if (PUBLIC_PAGES.includes(pathname)) {
    return true;
  }

  // Verificar prefixos de páginas públicas
  return PUBLIC_PAGES.some(page => 
    pathname.startsWith(page) && page !== '/'
  );
};

/**
 * Verifica se o endpoint da API é público (não necessita API_KEY)
 * @param endpoint - Endpoint da API
 * @returns boolean - true se for endpoint público
 */
export const isPublicApiEndpoint = (endpoint: string): boolean => {
  // Remover parâmetros de query da URL
  const cleanEndpoint = endpoint.split('?')[0];
  
  // Verificar endpoints exatos
  if (PUBLIC_API_ENDPOINTS.includes(cleanEndpoint)) {
    return true;
  }

  // Verificar prefixos de endpoints públicos
  return PUBLIC_API_ENDPOINTS.some(publicEndpoint => 
    cleanEndpoint.startsWith(publicEndpoint)
  );
};

/**
 * Determina se deve incluir API_KEY na requisição
 * @param endpoint - Endpoint da API (opcional)
 * @param pathname - Caminho da página atual (opcional)
 * @returns boolean - true se deve incluir API_KEY
 */
export const shouldIncludeApiKey = (
  endpoint?: string, 
  pathname?: string
): boolean => {
  // Se fornecido endpoint, verificar se é público
  if (endpoint && isPublicApiEndpoint(endpoint)) {
    return false;
  }

  // Se fornecido pathname, verificar se é página pública
  if (pathname && isPublicPage(pathname)) {
    return false;
  }

  // Por padrão, incluir API_KEY para segurança
  return true;
};

/**
 * Obtém a API_KEY configurada do ambiente
 * @returns string - API_KEY atual
 */
export const getApiKey = (): string => {
  return import.meta.env.VITE_API_KEY || "organizesee-api-key-2025-secure";
};

/**
 * Cria headers automaticamente com API_KEY quando necessário
 * @param endpoint - Endpoint da API
 * @param additionalHeaders - Headers adicionais
 * @returns Headers object
 */
export const createHeaders = (
  endpoint?: string,
  additionalHeaders?: Record<string, string>
): Record<string, string> => {
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };

  // Adicionar API_KEY apenas se necessário
  if (shouldIncludeApiKey(endpoint)) {
    baseHeaders['X-API-Key'] = getApiKey();
  }

  return baseHeaders;
};

/**
 * Detecta o contexto atual da aplicação
 * @returns Objeto com informações do contexto
 */
export const getAppContext = () => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isPublic = isPublicPage(pathname);
  
  return {
    pathname,
    isPublic,
    shouldUseApiKey: !isPublic,
    apiKey: getApiKey(),
    environment: import.meta.env.MODE || 'development'
  };
};

/**
 * Log de debug para rastrear uso da API_KEY
 * @param context - Contexto da requisição
 * @param endpoint - Endpoint sendo chamado
 * @param includeApiKey - Se API_KEY foi incluída
 */
export const debugApiKeyUsage = (
  context: string,
  endpoint?: string,
  includeApiKey?: boolean
) => {
  if (import.meta.env.DEV) {
    console.log(`🔑 API_KEY Debug [${context}]:`, {
      endpoint,
      includeApiKey,
      currentPage: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
      apiKey: includeApiKey ? getApiKey().substring(0, 10) + '...' : 'not-included',
      timestamp: new Date().toISOString()
    });
  }
};

// Exportar constantes para uso externo
export { PUBLIC_PAGES, PUBLIC_API_ENDPOINTS };

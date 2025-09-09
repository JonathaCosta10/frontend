/**
 * Helper para cache de requisições HTTP
 * Implementa um cache simples para evitar requisições repetidas
 */

interface CacheEntry {
  timestamp: number;
  data: any;
}

// Cache em memória para os resultados das requisições
const requestCache: Record<string, CacheEntry> = {};

// Tempo padrão de expiração do cache (5 minutos)
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Realiza uma requisição HTTP com cache
 * 
 * @param url URL para fazer a requisição
 * @param options Opções do fetch (opcional)
 * @param ttl Tempo de vida do cache em ms (opcional, padrão: 5 minutos)
 * @returns Dados da resposta, possivelmente do cache
 */
export async function cachedFetch<T = any>(
  url: string, 
  options?: RequestInit, 
  ttl: number = DEFAULT_CACHE_TTL
): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(options || {})}`;
  const now = Date.now();
  
  // Desativar cache se estamos em modo de debug ou explicitamente solicitado
  const skipCache = url.includes('coingecko.com') && import.meta.env.VITE_USE_MOCK_DATA !== "true";

  // Verificar se tem no cache e se não expirou
  if (!skipCache && requestCache[cacheKey] && (now - requestCache[cacheKey].timestamp) < ttl) {
    return requestCache[cacheKey].data;
  }

  // Fazer a requisição
  const response = await fetch(url, options);
  
  // Checar por erros na resposta
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
  }

  // Obter os dados da resposta
  const data = await response.json();
  
  // Salvar no cache (exceto se estivermos pulando o cache)
  if (!skipCache) {
    requestCache[cacheKey] = {
      timestamp: now,
      data
    };
  }
  
  return data;
}

/**
 * Limpa entradas específicas ou todo o cache
 * 
 * @param urlPattern Padrão de URL opcional para limpar seletivamente
 */
export function clearCache(urlPattern?: string | RegExp): void {
  if (!urlPattern) {
    // Limpar todo o cache
    Object.keys(requestCache).forEach(key => delete requestCache[key]);
    return;
  }

  // Limpar apenas entradas que correspondem ao padrão
  Object.keys(requestCache).forEach(key => {
    const url = key.split(':')[0];
    if (typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url)) {
      delete requestCache[key];
    }
  });
}

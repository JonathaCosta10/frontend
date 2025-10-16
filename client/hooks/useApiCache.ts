import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface UseCacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh data
  key?: string; // Cache key override
}

/**
 * Hook para cache inteligente com CNR (Cache-and-Revalidate)
 * Evita requisições múltiplas e melhora performance
 */
export const useApiCache = <T>(
  apiCall: () => Promise<T>,
  cacheKey: string,
  options: UseCacheOptions = {}
) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutos por padrão
    staleWhileRevalidate = true,
    key: customKey
  } = options;

  const finalKey = customKey || cacheKey;
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const pendingRequests = useRef<Map<string, Promise<T>>>(new Map());

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);

  const isExpired = (entry: CacheEntry<T>): boolean => {
    return Date.now() > entry.expiry;
  };

  const isStaleData = (entry: CacheEntry<T>): boolean => {
    // Considera stale se passou de 70% do TTL
    const staleThreshold = entry.timestamp + (ttl * 0.7);
    return Date.now() > staleThreshold;
  };

  const getCachedData = (): CacheEntry<T> | null => {
    return cache.current.get(finalKey) || null;
  };

  const setCacheData = (newData: T) => {
    const entry: CacheEntry<T> = {
      data: newData,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    cache.current.set(finalKey, entry);
  };

  const executeRequest = useCallback(async (forceRefresh = false): Promise<T> => {
    const cachedEntry = getCachedData();

    // Se temos dados válidos em cache e não é refresh forçado
    if (cachedEntry && !isExpired(cachedEntry) && !forceRefresh) {
      setData(cachedEntry.data);
      setIsStale(isStaleData(cachedEntry));
      setLoading(false);
      setError(null);
      
      // Se stale e SWR habilitado, buscar em background
      if (staleWhileRevalidate && isStaleData(cachedEntry)) {
        console.log(`🔄 [CACHE] Dados stale para ${finalKey}, revalidando em background...`);
        executeRequest(true).catch(console.error);
      }
      
      return cachedEntry.data;
    }

    // Verificar se já existe uma requisição pendente
    const pendingRequest = pendingRequests.current.get(finalKey);
    if (pendingRequest) {
      console.log(`⏳ [CACHE] Requisição já pendente para ${finalKey}, aguardando...`);
      return pendingRequest;
    }

    // Criar nova requisição
    setLoading(true);
    setError(null);

    const requestPromise = apiCall().then(result => {
      console.log(`✅ [CACHE] Dados atualizados para ${finalKey}`);
      setCacheData(result);
      setData(result);
      setIsStale(false);
      setLoading(false);
      pendingRequests.current.delete(finalKey);
      return result;
    }).catch(err => {
      console.error(`❌ [CACHE] Erro na requisição ${finalKey}:`, err);
      
      // Se temos dados em cache (mesmo expirados), usar eles
      if (cachedEntry && staleWhileRevalidate) {
        console.log(`🚨 [CACHE] Usando dados expirados para ${finalKey} devido a erro`);
        setData(cachedEntry.data);
        setIsStale(true);
      } else {
        setData(null);
      }
      
      setError(err.message || 'Erro na requisição');
      setLoading(false);
      pendingRequests.current.delete(finalKey);
      throw err;
    });

    pendingRequests.current.set(finalKey, requestPromise);
    return requestPromise;
  }, [finalKey, apiCall, ttl, staleWhileRevalidate]);

  const refetch = useCallback(() => {
    return executeRequest(true);
  }, [executeRequest]);

  const invalidate = useCallback(() => {
    cache.current.delete(finalKey);
    pendingRequests.current.delete(finalKey);
    setData(null);
    setIsStale(false);
    setError(null);
  }, [finalKey]);

  // Verificar cache na inicialização
  useEffect(() => {
    const cachedEntry = getCachedData();
    
    if (cachedEntry && !isExpired(cachedEntry)) {
      console.log(`📦 [CACHE] Cache hit para ${finalKey}`);
      setData(cachedEntry.data);
      setIsStale(isStaleData(cachedEntry));
      setLoading(false);
      
      // Se stale, revalidar em background
      if (staleWhileRevalidate && isStaleData(cachedEntry)) {
        executeRequest(true).catch(console.error);
      }
    } else {
      console.log(`📥 [CACHE] Cache miss para ${finalKey}, executando requisição...`);
      executeRequest().catch(console.error);
    }
  }, [finalKey, executeRequest, staleWhileRevalidate]);

  return {
    data,
    loading,
    error,
    isStale,
    refetch,
    invalidate,
    isSuccess: data !== null && !loading && !error,
    isError: !!error,
    isEmpty: data === null && !loading && !error,
  };
};

/**
 * Hook específico para dados de orçamento com cache inteligente
 */
export const useBudgetCache = <T>(
  apiCall: (mes: number, ano: number) => Promise<T>,
  mes: number,
  ano: number,
  options: UseCacheOptions = {}
) => {
  const cacheKey = `budget_${mes}_${ano}`;
  
  return useApiCache(
    () => apiCall(mes, ano),
    cacheKey,
    {
      ttl: 2 * 60 * 1000, // 2 minutos para dados de orçamento
      ...options
    }
  );
};

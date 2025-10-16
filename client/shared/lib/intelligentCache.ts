/**
 * Sistema de Cache Inteligente com TTL e Invalidação
 * Otimiza performance reduzindo chamadas desnecessárias à API
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milliseconds
  key: string;
  userId?: string; // Para isolamento por usuário
}

interface CacheOptions {
  ttl?: number; // Default: 5 minutos
  maxSize?: number; // Default: 100 entradas
  persistToLocalStorage?: boolean; // Default: false
  userSpecific?: boolean; // Default: true
}

class IntelligentCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultOptions: Required<CacheOptions> = {
    ttl: 5 * 60 * 1000, // 5 minutos
    maxSize: 100,
    persistToLocalStorage: false,
    userSpecific: true
  };

  constructor(private userId?: string) {
    this.loadFromLocalStorage();
    this.startCleanupTimer();
  }

  /**
   * Gera chave de cache com isolamento por usuário
   */
  private generateKey(key: string, userSpecific: boolean): string {
    if (userSpecific && this.userId) {
      return `${this.userId}_${key}`;
    }
    return key;
  }

  /**
   * Verifica se uma entrada está válida
   */
  private isEntryValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Limpa entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Timer para limpeza automática
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Limpeza a cada 1 minuto
  }

  /**
   * Garante que o cache não exceda o tamanho máximo
   */
  private ensureMaxSize(maxSize: number): void {
    if (this.cache.size >= maxSize) {
      // Remove entradas mais antigas
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(maxSize * 0.2)); // Remove 20%
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Persiste cache no localStorage
   */
  private persistToStorage(): void {
    try {
      const serializable = Array.from(this.cache.entries())
        .filter(([, entry]) => this.isEntryValid(entry))
        .slice(0, 50); // Limita a 50 entradas mais recentes
      
      localStorage.setItem('intelligent_cache', JSON.stringify(serializable));
    } catch (error) {
      console.warn('Falha ao persistir cache:', error);
    }
  }

  /**
   * Carrega cache do localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('intelligent_cache');
      if (stored) {
        const entries: [string, CacheEntry<any>][] = JSON.parse(stored);
        entries.forEach(([key, entry]) => {
          if (this.isEntryValid(entry)) {
            this.cache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.warn('Falha ao carregar cache:', error);
    }
  }

  /**
   * Define um valor no cache
   */
  set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): void {
    const opts = { ...this.defaultOptions, ...options };
    const cacheKey = this.generateKey(key, opts.userSpecific);
    
    this.ensureMaxSize(opts.maxSize);

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: opts.ttl,
      key: cacheKey,
      userId: opts.userSpecific ? this.userId : undefined
    };

    this.cache.set(cacheKey, entry);

    if (opts.persistToLocalStorage) {
      this.persistToStorage();
    }
  }

  /**
   * Obtém um valor do cache
   */
  get<T>(
    key: string, 
    options: Pick<CacheOptions, 'userSpecific'> = {}
  ): T | null {
    const opts = { userSpecific: true, ...options };
    const cacheKey = this.generateKey(key, opts.userSpecific);
    
    const entry = this.cache.get(cacheKey);
    
    if (!entry || !this.isEntryValid(entry)) {
      if (entry) {
        this.cache.delete(cacheKey);
      }
      return null;
    }

    return entry.data;
  }

  /**
   * Remove uma entrada específica
   */
  delete(key: string, options: Pick<CacheOptions, 'userSpecific'> = {}): boolean {
    const opts = { userSpecific: true, ...options };
    const cacheKey = this.generateKey(key, opts.userSpecific);
    return this.cache.delete(cacheKey);
  }

  /**
   * Limpa cache do usuário atual ou todo cache
   */
  clear(userOnly: boolean = true): void {
    if (userOnly && this.userId) {
      const userPrefix = `${this.userId}_`;
      for (const key of this.cache.keys()) {
        if (key.startsWith(userPrefix)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Invalida cache baseado em padrão
   */
  invalidatePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): {
    size: number;
    validEntries: number;
    expiredEntries: number;
    hitRate: number;
    memoryUsage: string;
  } {
    const validEntries = Array.from(this.cache.values())
      .filter(entry => this.isEntryValid(entry)).length;
    
    const expiredEntries = this.cache.size - validEntries;
    
    // Estimativa de uso de memória
    const memoryBytes = JSON.stringify(Array.from(this.cache.entries())).length * 2;
    const memoryUsage = memoryBytes > 1024 * 1024 
      ? `${(memoryBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(memoryBytes / 1024).toFixed(2)} KB`;

    return {
      size: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: this.hitRate,
      memoryUsage
    };
  }

  // Métricas de hit rate
  private hits = 0;
  private misses = 0;

  private get hitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? (this.hits / total) * 100 : 0;
  }

  /**
   * Wrapper para operações com cache e métricas
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Tenta buscar do cache primeiro
    const cached = this.get<T>(key, options);
    
    if (cached !== null) {
      this.hits++;
      return cached;
    }

    // Cache miss - busca dados
    this.misses++;
    
    try {
      const data = await fetchFn();
      this.set(key, data, options);
      return data;
    } catch (error) {
      console.error(`Erro ao buscar dados para cache key "${key}":`, error);
      throw error;
    }
  }
}

/**
 * Instância global do cache
 */
let globalCache: IntelligentCache | null = null;

/**
 * Inicializa o cache com ID do usuário
 */
export function initializeCache(userId?: string): IntelligentCache {
  globalCache = new IntelligentCache(userId);
  return globalCache;
}

/**
 * Obtém instância do cache
 */
export function getCache(): IntelligentCache {
  if (!globalCache) {
    globalCache = new IntelligentCache();
  }
  return globalCache;
}

/**
 * Hook para usar cache em componentes React
 */
import { useCallback, useEffect, useState } from 'react';

export function useCache(userId?: string) {
  const [cache] = useState(() => {
    if (userId) {
      return new IntelligentCache(userId);
    }
    return getCache();
  });

  useEffect(() => {
    return () => {
      // Cleanup se necessário
    };
  }, []);

  const cacheGet = useCallback(<T>(key: string, options?: CacheOptions) => {
    return cache.get<T>(key, options);
  }, [cache]);

  const cacheSet = useCallback(<T>(key: string, data: T, options?: CacheOptions) => {
    cache.set(key, data, options);
  }, [cache]);

  const cacheDelete = useCallback((key: string, options?: CacheOptions) => {
    return cache.delete(key, options);
  }, [cache]);

  const cacheClear = useCallback((userOnly?: boolean) => {
    cache.clear(userOnly);
  }, [cache]);

  const getOrFetch = useCallback(<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: CacheOptions
  ) => {
    return cache.getOrFetch(key, fetchFn, options);
  }, [cache]);

  return {
    get: cacheGet,
    set: cacheSet,
    delete: cacheDelete,
    clear: cacheClear,
    getOrFetch,
    invalidatePattern: cache.invalidatePattern.bind(cache),
    getStats: cache.getStats.bind(cache)
  };
}

/**
 * Estratégias de cache pré-definidas
 */
export const CacheStrategies = {
  // Cache de curta duração para dados dinâmicos
  SHORT: { ttl: 1 * 60 * 1000, persistToLocalStorage: false }, // 1 minuto
  
  // Cache padrão para dados frequentemente acessados
  MEDIUM: { ttl: 5 * 60 * 1000, persistToLocalStorage: true }, // 5 minutos
  
  // Cache de longa duração para dados estáticos
  LONG: { ttl: 30 * 60 * 1000, persistToLocalStorage: true }, // 30 minutos
  
  // Cache para dados do usuário
  USER_DATA: { ttl: 10 * 60 * 1000, persistToLocalStorage: true, userSpecific: true }, // 10 minutos
  
  // Cache para dados públicos
  PUBLIC: { ttl: 15 * 60 * 1000, persistToLocalStorage: true, userSpecific: false }, // 15 minutos
};

export default IntelligentCache;
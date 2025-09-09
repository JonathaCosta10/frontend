/**
 * Sistema de cache em memória com TTL e isolamento por usuário
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
  userId?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  memoryUsage: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    entries: 0,
    memoryUsage: 0
  };

  // TTL padrão para diferentes tipos de dados (em milissegundos)
  private readonly DEFAULT_TTL = {
    USER_DATA: 5 * 60 * 1000,      // 5 minutos
    MARKET_DATA: 2 * 60 * 1000,    // 2 minutos  
    BUDGET_DATA: 10 * 60 * 1000,   // 10 minutos
    STATIC_DATA: 60 * 60 * 1000,   // 1 hora
    PREFERENCES: 24 * 60 * 60 * 1000, // 24 horas
  };

  /**
   * Gera chave única baseada no usuário
   */
  private getUserKey(key: string, userId?: string): string {
    return userId ? `${userId}:${key}` : `global:${key}`;
  }

  /**
   * Verifica se uma entrada está expirada
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Define um valor no cache
   */
  set<T>(key: string, data: T, ttl?: number, userId?: string): void {
    const userKey = this.getUserKey(key, userId);
    const defaultTtl = this.DEFAULT_TTL.USER_DATA;
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || defaultTtl,
      userId
    };

    this.cache.set(userKey, entry);
    this.updateStats();
  }

  /**
   * Obtém um valor do cache
   */
  get<T>(key: string, userId?: string): T | null {
    const userKey = this.getUserKey(key, userId);
    const entry = this.cache.get(userKey);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(userKey);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Remove uma entrada do cache
   */
  delete(key: string, userId?: string): boolean {
    const userKey = this.getUserKey(key, userId);
    const deleted = this.cache.delete(userKey);
    if (deleted) {
      this.updateStats();
    }
    return deleted;
  }

  /**
   * Verifica se uma chave existe no cache e não está expirada
   */
  has(key: string, userId?: string): boolean {
    const userKey = this.getUserKey(key, userId);
    const entry = this.cache.get(userKey);
    
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(userKey);
      this.updateStats();
      return false;
    }
    
    return true;
  }

  /**
   * Limpa todas as entradas de um usuário específico
   */
  clearUser(userId: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.userId === userId) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    this.updateStats();
  }

  /**
   * Limpa entradas expiradas
   */
  cleanup(): void {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    this.updateStats();
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      entries: 0,
      memoryUsage: 0
    };
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Obtém taxa de hit do cache
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Atualiza estatísticas
   */
  private updateStats(): void {
    this.stats.entries = this.cache.size;
    this.stats.memoryUsage = this.estimateMemoryUsage();
  }

  /**
   * Estima uso de memória (aproximado)
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // UTF-16
      size += JSON.stringify(entry).length * 2;
    }
    return size;
  }

  /**
   * Métodos específicos para diferentes tipos de dados
   */
  setUserData<T>(key: string, data: T, userId: string): void {
    this.set(key, data, this.DEFAULT_TTL.USER_DATA, userId);
  }

  setMarketData<T>(key: string, data: T, userId?: string): void {
    this.set(key, data, this.DEFAULT_TTL.MARKET_DATA, userId);
  }

  setBudgetData<T>(key: string, data: T, userId: string): void {
    this.set(key, data, this.DEFAULT_TTL.BUDGET_DATA, userId);
  }

  setStaticData<T>(key: string, data: T): void {
    this.set(key, data, this.DEFAULT_TTL.STATIC_DATA);
  }

  setPreferences<T>(key: string, data: T, userId?: string): void {
    this.set(key, data, this.DEFAULT_TTL.PREFERENCES, userId);
  }
}

// Instância singleton
export const cacheManager = new CacheManager();

// Auto-limpeza a cada 5 minutos
setInterval(() => {
  cacheManager.cleanup();
}, 5 * 60 * 1000);

// Chaves específicas para cache
export const CACHE_KEYS = {
  // Dados do usuário
  USER_PROFILE: 'user_profile',
  USER_SETTINGS: 'user_settings',
  
  // Dados de mercado
  MARKET_INSIGHTS: 'market_insights',
  MARKET_INDICES: 'market_indices',
  ECONOMIC_INDICATORS: 'economic_indicators',
  
  // Dados de orçamento
  BUDGET_OVERVIEW: 'budget_overview',
  BUDGET_ENTRIES: 'budget_entries',
  BUDGET_COSTS: 'budget_costs',
  
  // Dados de investimentos
  PORTFOLIO_DATA: 'portfolio_data',
  INVESTMENT_ANALYSIS: 'investment_analysis',
  
  // Dados estáticos
  MARKET_RANKINGS: 'market_rankings',
  CURRENCY_RATES: 'currency_rates',
} as const;

export default cacheManager;

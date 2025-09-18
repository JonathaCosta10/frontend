/**
 * Preload Manager - Gerencia carregamento inteligente de chunks
 * Carrega apenas os chunks necessários baseado na navegação do usuário
 */

interface PreloadConfig {
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
  route?: string;
}

const CHUNK_PRELOAD_MAP: Record<string, PreloadConfig> = {
  // Chunks críticos - sempre preload
  'react-vendor': { priority: 'high' },
  'ui-core': { priority: 'high' },
  'contexts': { priority: 'high' },
  
  // Chunks do dashboard principal
  'budget': { priority: 'medium', route: '/dashboard/orcamento' },
  'investimentos': { priority: 'medium', route: '/dashboard/investimentos' },
  'mercado': { priority: 'medium', route: '/dashboard/mercado' },
  
  // Páginas específicas - preload apenas quando necessário
  'calculadora-financeira': { 
    priority: 'low', 
    route: '/dashboard/mercado/calculadora-financeira',
    dependencies: ['charts-recharts', 'forms-core']
  },
  'info-diaria': { 
    priority: 'low', 
    route: '/dashboard/info-diaria',
    dependencies: ['data-query', 'ui-extended']
  },
  'DashboardCripto': { 
    priority: 'low', 
    route: '/dashboard/cripto',
    dependencies: ['charts-chartjs', 'crypto-libs']
  },
  
  // Training modules - preload sob demanda
  'fundos-investimentos': { priority: 'low', route: '/dashboard/treinamentos/fundos-investimentos' },
  'renda-fixa': { priority: 'low', route: '/dashboard/treinamentos/renda-fixa' },
  'acoes': { priority: 'low', route: '/dashboard/treinamentos/acoes' },
  'macroeconomia': { priority: 'low', route: '/dashboard/treinamentos/macroeconomia' },
};

class PreloadManager {
  private preloadedChunks = new Set<string>();
  private currentRoute = '';
  
  /**
   * Preload chunks críticos na inicialização
   */
  preloadCriticalChunks() {
    Object.entries(CHUNK_PRELOAD_MAP).forEach(([chunk, config]) => {
      if (config.priority === 'high' && !this.preloadedChunks.has(chunk)) {
        this.preloadChunk(chunk);
      }
    });
  }
  
  /**
   * Preload chunks baseado na rota atual
   */
  preloadForRoute(route: string) {
    this.currentRoute = route;
    
    // Preload chunks de prioridade média para a seção atual
    Object.entries(CHUNK_PRELOAD_MAP).forEach(([chunk, config]) => {
      if (config.priority === 'medium' && config.route && route.startsWith(config.route.split('/').slice(0, 3).join('/'))) {
        this.preloadChunk(chunk);
        
        // Preload dependências se existirem
        if (config.dependencies) {
          config.dependencies.forEach(dep => this.preloadChunk(dep));
        }
      }
    });
  }
  
  /**
   * Preload antecipado baseado na navegação do usuário
   */
  anticipateNavigation(targetRoute: string) {
    Object.entries(CHUNK_PRELOAD_MAP).forEach(([chunk, config]) => {
      if (config.route === targetRoute) {
        this.preloadChunk(chunk);
        
        // Preload dependências
        if (config.dependencies) {
          config.dependencies.forEach(dep => this.preloadChunk(dep));
        }
      }
    });
  }
  
  /**
   * Preload um chunk específico
   */
  private preloadChunk(chunkName: string) {
    if (this.preloadedChunks.has(chunkName)) return;
    
    try {
      // Criar link element para preload
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = `./assets/${chunkName}-*.js`; // Vite irá resolver o hash correto
      link.crossOrigin = 'anonymous';
      
      // Adicionar ao head
      document.head.appendChild(link);
      
      this.preloadedChunks.add(chunkName);
      console.log(`🚀 Preloaded chunk: ${chunkName}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload chunk: ${chunkName}`, error);
    }
  }
  
  /**
   * Limpar preloads desnecessários (garbage collection)
   */
  cleanupUnusedPreloads() {
    const preloadLinks = document.querySelectorAll('link[rel="modulepreload"]');
    const currentRouteChunks = this.getChunksForRoute(this.currentRoute);
    
    preloadLinks.forEach(link => {
      const href = (link as HTMLLinkElement).href;
      const isRelevant = currentRouteChunks.some(chunk => href.includes(chunk));
      
      if (!isRelevant) {
        link.remove();
        const chunkName = this.extractChunkName(href);
        if (chunkName) {
          this.preloadedChunks.delete(chunkName);
          console.log(`🗑️ Cleaned up chunk: ${chunkName}`);
        }
      }
    });
  }
  
  private getChunksForRoute(route: string): string[] {
    return Object.entries(CHUNK_PRELOAD_MAP)
      .filter(([_, config]) => config.route && route.startsWith(config.route))
      .map(([chunk]) => chunk);
  }
  
  private extractChunkName(href: string): string | null {
    const match = href.match(/assets\/([^-]+)-/);
    return match ? match[1] : null;
  }
}

// Instância singleton
export const preloadManager = new PreloadManager();

// Hook para usar com React Router
export const useChunkPreloader = () => {
  const preloadForRoute = (route: string) => preloadManager.preloadForRoute(route);
  const anticipateNavigation = (route: string) => preloadManager.anticipateNavigation(route);
  
  return { preloadForRoute, anticipateNavigation };
};

// Inicializar preloads críticos
if (typeof window !== 'undefined') {
  // Preload crítico imediato
  preloadManager.preloadCriticalChunks();
  
  // Preload baseado na rota atual após um pequeno delay
  setTimeout(() => {
    const currentPath = window.location.pathname;
    preloadManager.preloadForRoute(currentPath);
  }, 1000);
  
  // Cleanup periódico de preloads não utilizados
  setInterval(() => {
    preloadManager.cleanupUnusedPreloads();
  }, 30000); // A cada 30 segundos
}

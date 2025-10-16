import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Sistema de preload inteligente baseado em rotas
 * Precarrega componentes com base na navegação do usuário
 */

interface PreloadRule {
  currentRoute: string;
  preloadRoutes: string[];
  condition?: () => boolean;
  delay?: number;
}

const PRELOAD_RULES: PreloadRule[] = [
  // Dashboard principal -> preload orçamento e investimentos
  {
    currentRoute: '/sistema/dashboard',
    preloadRoutes: ['/sistema/dashboard/orcamento', '/sistema/dashboard/investimentos'],
    delay: 1000,
  },
  
  // Orçamento -> preload entradas, custos e dividas
  {
    currentRoute: '/sistema/dashboard/orcamento',
    preloadRoutes: [
      '/sistema/dashboard/orcamento/entradas',
      '/sistema/dashboard/orcamento/custos',
      '/sistema/dashboard/orcamento/dividas'
    ],
    delay: 500,
  },
  
  // Investimentos -> preload comparativos e ranking
  {
    currentRoute: '/sistema/dashboard/investimentos',
    preloadRoutes: [
      '/sistema/dashboard/investimentos/comparativos',
      '/sistema/dashboard/investimentos/ranking'
    ],
    delay: 500,
  },
  
  // Mercado -> preload indicadores e análise
  {
    currentRoute: '/sistema/dashboard/mercado',
    preloadRoutes: [
      '/sistema/dashboard/mercado/indicadores-economicos',
      '/sistema/dashboard/mercado/analise-ticker'
    ],
    delay: 800,
  },
  
  // Crypto -> preload portfolio e mercado
  {
    currentRoute: '/sistema/dashboard/cripto',
    preloadRoutes: [
      '/sistema/dashboard/cripto/portfolio',
      '/sistema/dashboard/cripto/mercado'
    ],
    delay: 600,
  },
];

const COMPONENT_IMPORTS: Record<string, () => Promise<any>> = {
  '/sistema/dashboard/orcamento': () => import('../pages/sistema/dashboard/orcamento/index'),
  '/sistema/dashboard/orcamento/entradas': () => import('../pages/sistema/dashboard/orcamento/entradas'),
  '/sistema/dashboard/orcamento/custos': () => import('../pages/sistema/dashboard/orcamento/custos'),
  '/sistema/dashboard/orcamento/dividas': () => import('../pages/sistema/dashboard/orcamento/dividas'),
  '/sistema/dashboard/orcamento/metas': () => import('../pages/sistema/dashboard/orcamento/metas'),
  
  '/sistema/dashboard/investimentos': () => import('../pages/sistema/dashboard/investimentos/index'),
  '/sistema/dashboard/investimentos/comparativos': () => import('../pages/sistema/dashboard/investimentos/comparativos'),
  '/sistema/dashboard/investimentos/cadastro': () => import('../pages/sistema/dashboard/investimentos/cadastro'),
  '/sistema/dashboard/investimentos/ranking': () => import('../pages/sistema/dashboard/investimentos/ranking'),
  '/sistema/dashboard/investimentos/patrimonio': () => import('../pages/sistema/dashboard/investimentos/patrimonio'),
  
  '/sistema/dashboard/mercado': () => import('../pages/sistema/dashboard/mercado/index'),
  '/sistema/dashboard/mercado/indicadores-economicos': () => import('../pages/sistema/dashboard/mercado/indicadores-economicos'),
  '/sistema/dashboard/mercado/lista-de-desejo': () => import('../pages/sistema/dashboard/mercado/lista-de-desejo'),
  '/sistema/dashboard/mercado/analise-ticker': () => import('../pages/sistema/dashboard/mercado/analise-ticker'),
  '/sistema/dashboard/mercado/calculadora-financeira': () => import('../pages/sistema/dashboard/mercado/calculadora-financeira'),
  
  '/sistema/dashboard/cripto': () => import('../pages/sistema/dashboard/cripto/index'),
  '/sistema/dashboard/cripto/mercado': () => import('../pages/sistema/dashboard/cripto/mercado'),
  '/sistema/dashboard/cripto/portfolio': () => import('../pages/sistema/dashboard/cripto/portfolio'),
  '/sistema/dashboard/cripto/cadastro': () => import('../pages/sistema/dashboard/cripto/cadastro'),
  
  '/sistema/dashboard/treinamentos': () => import('../pages/sistema/dashboard/treinamentos/Training'),
  '/sistema/dashboard/treinamentos/fundos-investimentos': () => import('../pages/sistema/dashboard/treinamentos/fundos-investimentos'),
  '/sistema/dashboard/treinamentos/renda-fixa': () => import('../pages/sistema/dashboard/treinamentos/renda-fixa'),
  '/sistema/dashboard/treinamentos/acoes': () => import('../pages/sistema/dashboard/treinamentos/acoes'),
  '/sistema/dashboard/treinamentos/macroeconomia': () => import('../pages/sistema/dashboard/treinamentos/macroeconomia'),
  
  '/sistema/dashboard/info-diaria': () => import('../pages/sistema/dashboard/info-diaria'),
  '/sistema/dashboard/perfil': () => import('../pages/sistema/dashboard/perfil'),
  '/sistema/dashboard/configuracoes': () => import('../pages/sistema/dashboard/configuracoes'),
  '/sistema/dashboard/suporte': () => import('../pages/sistema/dashboard/suporte'),
};

/**
 * Cache para componentes já precarregados
 */
const preloadCache = new Set<string>();

/**
 * Precarrega um componente específico
 */
const preloadComponent = async (route: string): Promise<void> => {
  if (preloadCache.has(route)) {
    return; // Já foi precarregado
  }

  const importFunction = COMPONENT_IMPORTS[route];
  if (!importFunction) {
    return; // Rota não encontrada
  }

  try {
    await importFunction();
    preloadCache.add(route);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Preloaded: ${route}`);
    }
  } catch (error) {
    console.warn(`❌ Failed to preload: ${route}`, error);
  }
};

/**
 * Executa preload com requestIdleCallback se disponível
 */
const schedulePreload = (routes: string[], delay: number = 0): void => {
  const executePreload = () => {
    routes.forEach(route => {
      preloadComponent(route);
    });
  };

  if (delay > 0) {
    setTimeout(executePreload, delay);
  } else if ('requestIdleCallback' in window) {
    requestIdleCallback(executePreload, { timeout: 2000 });
  } else {
    setTimeout(executePreload, 100);
  }
};

/**
 * Hook para preload inteligente baseado na rota atual
 */
export const useIntelligentPreload = (): void => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    // Encontrar regras aplicáveis
    const applicableRules = PRELOAD_RULES.filter(rule => {
      const matches = currentPath.startsWith(rule.currentRoute);
      const conditionMet = !rule.condition || rule.condition();
      return matches && conditionMet;
    });

    // Executar preload para cada regra aplicável
    applicableRules.forEach(rule => {
      schedulePreload(rule.preloadRoutes, rule.delay);
    });

    // Preload específico baseado na rota atual
    if (currentPath === '/sistema/dashboard') {
      // Na dashboard principal, preload das páginas mais acessadas
      schedulePreload([
        '/sistema/dashboard/orcamento',
        '/sistema/dashboard/investimentos',
        '/sistema/dashboard/info-diaria'
      ], 1000);
    }

  }, [location.pathname]);
};

/**
 * Hook para preload manual de rotas específicas
 */
export const useManualPreload = () => {
  return {
    preloadRoute: (route: string, delay?: number) => {
      schedulePreload([route], delay);
    },
    preloadRoutes: (routes: string[], delay?: number) => {
      schedulePreload(routes, delay);
    },
    isPreloaded: (route: string) => preloadCache.has(route),
    clearCache: () => preloadCache.clear(),
  };
};

/**
 * Preload crítico para componentes essenciais
 */
export const preloadCriticalComponents = (): void => {
  // Preload imediato de componentes críticos
  const criticalRoutes = [
    '/sistema/dashboard/orcamento',
    '/sistema/dashboard/investimentos',
  ];

  schedulePreload(criticalRoutes, 500);
};

/**
 * Sistema de preload baseado em interação do usuário
 */
export const useHoverPreload = () => {
  const handleMouseEnter = (route: string) => {
    if (!preloadCache.has(route)) {
      schedulePreload([route], 50); // Preload rápido no hover
    }
  };

  return { handleMouseEnter };
};

export default useIntelligentPreload;

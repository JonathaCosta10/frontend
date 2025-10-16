/**
 * Lazy Chart Components - Otimização para reduzir bundle de charts
 * Carrega componentes de gráfico apenas quando necessário
 */

import React from 'react';
import { withOptimizedLazy } from '@/components/OptimizedSuspense';

// Charts específicos da aplicação - lazy loading
export const LazyVariacaoEntradaChart = withOptimizedLazy(
  () => import('./charts/VariacaoEntradaChart'),
  { preload: false }
);

export const LazyDistribuicaoGastosChart = withOptimizedLazy(
  () => import('./charts/DistribuicaoGastosChart'),
  { preload: false }
);

export const LazyMetaRealidadeChart = withOptimizedLazy(
  () => import('./charts/MetaRealidadeChart'),
  { preload: false }
);

// Chart utilities - lazy loading
export const LazyChartContainer = withOptimizedLazy(
  () => import('./charts/ChartContainer'),
  { preload: false }
);

/**
 * Hook para preload seletivo de charts baseado no uso
 */
export const useChartPreload = (chartTypes: string[]) => {
  React.useEffect(() => {
    const preloadMap: Record<string, () => Promise<any>> = {
      'variacao': () => import('./charts/VariacaoEntradaChart'),
      'distribuicao': () => import('./charts/DistribuicaoGastosChart'),
      'meta': () => import('./charts/MetaRealidadeChart'),
    };

    // Preload apenas os charts necessários
    chartTypes.forEach(type => {
      const preloadFn = preloadMap[type];
      if (preloadFn) {
        // Delay para não bloquear o thread principal
        setTimeout(() => {
          preloadFn().catch(() => {
            // Silenciar erros de preload
          });
        }, 1000);
      }
    });
  }, [chartTypes]);
};

export default {
  LazyVariacaoEntradaChart,
  LazyDistribuicaoGastosChart,
  LazyMetaRealidadeChart,
  LazyChartContainer,
  useChartPreload
};

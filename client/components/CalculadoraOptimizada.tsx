/**
 * Wrapper otimizado para Calculadora Financeira
 * Implementa lazy loading para reduzir bundle inicial
 */

import React, { Suspense } from 'react';
import { withOptimizedMemo } from '@/components/OptimizedMemo';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy loading para calculadora completa
const LazyCalculadoraFinanceira = React.lazy(() => 
  import('../pages/sistema/dashboard/mercado/calculadora-financeira-optimized')
);

interface CalculadoraOptimizadaProps {
  [key: string]: any;
}

const CalculadoraOptimizada: React.FC<CalculadoraOptimizadaProps> = withOptimizedMemo(({ ...props }) => {
  const LoadingFallback = (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Carregando calculadora..." />
    </div>
  );

  return (
    <div className="calculadora-container">
      <Suspense fallback={LoadingFallback}>
        <LazyCalculadoraFinanceira {...props} />
      </Suspense>
    </div>
  );
}, {
  deepCompare: false,
  debugName: 'CalculadoraOptimizada'
});

/**
 * Hook para preload de calculadora baseado no uso
 */
export const useCalculadoraPreload = (shouldPreload: boolean = false) => {
  React.useEffect(() => {
    if (!shouldPreload) return;
    
    // Preload apenas após um delay para não bloquear carregamento inicial
    const timer = setTimeout(() => {
      import('../pages/sistema/dashboard/mercado/calculadora-financeira').catch(() => {
        // Silenciar erros de preload
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [shouldPreload]);
};

export default CalculadoraOptimizada;

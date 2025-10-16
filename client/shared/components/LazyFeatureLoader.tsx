import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AdvancedErrorBoundary from './AdvancedErrorBoundary';

interface LazyFeatureProps {
  featureName: string;
  fallback?: React.ReactNode;
  loadingMessage?: string;
  retryOnError?: boolean;
}

/**
 * HOC para lazy loading de features com error boundary integrado
 */
export function withLazyFeature<T extends {}>(
  lazyComponent: () => Promise<{ default: ComponentType<T> }>,
  options: LazyFeatureProps
) {
  const LazyComponent = React.lazy(lazyComponent);
  
  return React.forwardRef<any, T>((props, ref) => {
    const defaultFallback = (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-sm text-gray-600">
            {options.loadingMessage || `Carregando ${options.featureName}...`}
          </p>
        </div>
      </div>
    );

    return (
      <AdvancedErrorBoundary 
        featureName={options.featureName}
        fallback={options.fallback}
      >
        <Suspense fallback={options.fallback || defaultFallback}>
          <LazyComponent {...props} ref={ref} />
        </Suspense>
      </AdvancedErrorBoundary>
    );
  });
}

/**
 * Lazy loading para páginas principais do dashboard
 */
export const LazyDashboardPages = {
  // Budget pages
  Budget: withLazyFeature(
    () => import('@/features/budget/pages/orcamento'),
    { featureName: 'Orçamento', loadingMessage: 'Carregando seu orçamento...' }
  ),
  
  // Profile pages  
  Profile: withLazyFeature(
    () => import('@/features/dashboard/pages/perfil'),
    { featureName: 'Perfil', loadingMessage: 'Carregando seu perfil...' }
  ),
  
  // Info pages
  InfoDiaria: withLazyFeature(
    () => import('@/features/dashboard/pages/info-diaria'),
    { featureName: 'Informações Diárias', loadingMessage: 'Carregando informações do mercado...' }
  ),
  
  // Settings pages
  Configuracoes: withLazyFeature(
    () => import('@/features/dashboard/pages/configuracoes'),
    { featureName: 'Configurações', loadingMessage: 'Carregando configurações...' }
  )
};

/**
 * Lazy loading para páginas de mercado
 */
export const LazyMarketPages = {
  MarketPage: withLazyFeature(
    () => import('@/features/market/pages/MarketPage'),
    { featureName: 'Mercado', loadingMessage: 'Carregando dados do mercado...' }
  ),
  
  CriptoMarket: withLazyFeature(
    () => import('@/features/public/pages/HomePublicPages/CriptoMarket'),
    { featureName: 'Criptomoedas', loadingMessage: 'Carregando criptomoedas...' }
  ),
  
  // Análises específicas (verificar se existem)
  AnaliseAcoes: withLazyFeature(
    () => import('@/features/market/pages/mercado/analise-acoes-completa'),
    { featureName: 'Análise de Ações', loadingMessage: 'Carregando análise de ações...' }
  ),
  
  AnaliseFII: withLazyFeature(
    () => import('@/features/market/pages/mercado/analise-fii-completa'),
    { featureName: 'Análise de FIIs', loadingMessage: 'Carregando análise de FIIs...' }
  ),
  
  AnaliseTicker: withLazyFeature(
    () => import('@/features/market/pages/mercado/analise-ticker'),
    { featureName: 'Análise de Ticker', loadingMessage: 'Carregando análise...' }
  )
};

/**
 * Lazy loading para páginas públicas
 */
export const LazyPublicPages = {
  Home: withLazyFeature(
    () => import('@/features/public/pages/HomePublicPages/Home'),
    { featureName: 'Página Inicial', loadingMessage: 'Carregando página inicial...' }
  ),
  
  Login: withLazyFeature(
    () => import('@/features/public/pages/HomePublicPages/Login'),
    { featureName: 'Login', loadingMessage: 'Carregando login...' }
  ),
  
  Signup: withLazyFeature(
    () => import('@/features/public/pages/HomePublicPages/Signup'),
    { featureName: 'Cadastro', loadingMessage: 'Carregando cadastro...' }
  ),
  
  About: withLazyFeature(
    () => import('@/features/public/pages/HomePublicPages/About'),
    { featureName: 'Sobre', loadingMessage: 'Carregando sobre...' }
  ),
  
  Demo: withLazyFeature(
    () => import('@/features/public/pages/HomePublicPages/Demo'),
    { featureName: 'Demo', loadingMessage: 'Carregando demonstração...' }
  )
};

/**
 * Lazy loading para investments (verificar estrutura)
 */
export const LazyInvestmentPages = {
  Investment: withLazyFeature(
    () => import('@/features/investments/pages/investimentos/Investment'),
    { featureName: 'Investimentos', loadingMessage: 'Carregando investimentos...' }
  ),
  
  Cadastro: withLazyFeature(
    () => import('@/features/investments/pages/investimentos/cadastro'),
    { featureName: 'Cadastro de Investimentos', loadingMessage: 'Carregando cadastro...' }
  ),
  
  Comparativos: withLazyFeature(
    () => import('@/features/investments/pages/investimentos/comparativos'),
    { featureName: 'Comparativos', loadingMessage: 'Carregando comparativos...' }
  ),
  
  Ranking: withLazyFeature(
    () => import('@/features/investments/pages/investimentos/ranking'),
    { featureName: 'Ranking', loadingMessage: 'Carregando ranking...' }
  )
};

/**
 * Factory function para criar lazy components customizados
 */
export function createLazyComponent<T extends {}>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  featureName: string,
  options: Partial<LazyFeatureProps> = {}
): LazyExoticComponent<ComponentType<T>> {
  return withLazyFeature(importFn, {
    featureName,
    loadingMessage: `Carregando ${featureName}...`,
    retryOnError: true,
    ...options
  }) as any;
}

/**
 * Preload de features críticas
 */
export const preloadCriticalFeatures = () => {
  // Preload das features mais usadas
  import('@/features/dashboard/pages/info-diaria');
  import('@/features/market/pages/MarketPage');
  import('@/features/budget/pages/orcamento');
};

/**
 * Hook para preload sob demanda
 */
export const useFeaturePreload = () => {
  const preloadFeature = (featurePath: string) => {
    const moduleMap: Record<string, () => Promise<any>> = {
      'dashboard/profile': () => import('@/features/dashboard/pages/perfil'),
      'market/crypto': () => import('@/features/public/pages/HomePublicPages/CriptoMarket'),
      'market/ranking': () => import('@/features/investments/pages/investimentos/ranking'),
      'investments': () => import('@/features/investments/pages/investimentos/Investment'),
      // Adicionar mais conforme necessário
    };

    const moduleLoader = moduleMap[featurePath];
    if (moduleLoader) {
      moduleLoader().catch(error => {
        console.warn(`Failed to preload feature ${featurePath}:`, error);
      });
    }
  };

  return { preloadFeature };
};
/**
 * Lazy Component Optimizer - Wrapper para lazy loading otimizado de componentes pesados
 * Reduz o bundle size através de dynamic imports inteligentes
 */
import React, { Suspense, lazy, ComponentType } from "react";

// Fallback component melhorado
const ComponentLoader: React.FC<{ name?: string }> = ({ name }) => (
  <div className="flex items-center justify-center p-4">
    <div className="text-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
      <p className="text-sm text-muted-foreground">
        {name ? `Carregando ${name}...` : "Carregando..."}
      </p>
    </div>
  </div>
);

// Error boundary para lazy components
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("LazyErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      return Fallback ? <Fallback /> : <div>Erro ao carregar componente</div>;
    }

    return this.props.children;
  }
}

// HOC para criar lazy components otimizados
export const withOptimizedLazy = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    name?: string;
    fallback?: React.ComponentType;
    preload?: boolean;
  }
) => {
  const LazyComponent = lazy(importFn);
  
  // Preload opcional para componentes críticos
  if (options?.preload) {
    // Preload após um pequeno delay
    setTimeout(() => {
      importFn().catch(() => {});
    }, 100);
  }

  const WrappedComponent: React.FC<any> = (props) => (
    <LazyErrorBoundary fallback={options?.fallback}>
      <Suspense fallback={<ComponentLoader name={options?.name} />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  );

  WrappedComponent.displayName = `LazyOptimized(${options?.name || 'Component'})`;
  
  return WrappedComponent;
};

// Lazy loading para componentes específicos da UI que são pesados
// Estes serão criados conforme necessário

// Preloader para routes críticas
export const preloadCriticalRoutes = () => {
  // Preload das rotas mais acessadas após um delay
  setTimeout(() => {
    import("../pages/sistema/dashboard/orcamento/index").catch(() => {});
    import("../pages/sistema/dashboard/investimentos/index").catch(() => {});
    import("../pages/sistema/dashboard/mercado/index").catch(() => {});
  }, 2000);
};

export default withOptimizedLazy;

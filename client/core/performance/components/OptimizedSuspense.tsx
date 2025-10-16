import React, { Suspense, Component } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OptimizedSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  minDelay?: number;
  enableCache?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary para capturar erros de lazy loading
 */
class LazyLoadErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode; onRetry?: () => void },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyLoad Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="mx-auto my-8 max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Erro ao carregar componente</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ocorreu um erro inesperado. Tente recarregar a página.
              </p>
            </div>
            <Button
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onRetry?.();
              }}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Loading optimizado com delay mínimo para evitar flashing
 */
const OptimizedLoadingFallback: React.FC<{ minDelay?: number }> = ({ 
  minDelay = 200 
}) => {
  const [showSpinner, setShowSpinner] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(true);
    }, minDelay);

    return () => clearTimeout(timer);
  }, [minDelay]);

  if (!showSpinner) {
    return null; // Evita flash de loading para carregamentos rápidos
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      <LoadingSpinner size="lg" text="Carregando..." />
    </div>
  );
};

/**
 * Suspense otimizado com error boundary e cache
 */
export const OptimizedSuspense: React.FC<OptimizedSuspenseProps> = ({
  children,
  fallback,
  errorFallback,
  minDelay = 200,
  enableCache = true
}) => {
  const [retryKey, setRetryKey] = React.useState(0);

  const handleRetry = React.useCallback(() => {
    setRetryKey(prev => prev + 1);
  }, []);

  const defaultFallback = React.useMemo(
    () => fallback || <OptimizedLoadingFallback minDelay={minDelay} />,
    [fallback, minDelay]
  );

  return (
    <LazyLoadErrorBoundary 
      key={retryKey}
      fallback={errorFallback} 
      onRetry={handleRetry}
    >
      <Suspense fallback={defaultFallback}>
        {children}
      </Suspense>
    </LazyLoadErrorBoundary>
  );
};

/**
 * HOC para lazy loading otimizado de componentes
 */
export const withOptimizedLazy = <P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  options: {
    fallback?: React.ReactNode;
    preload?: boolean;
    retryAttempts?: number;
  } = {}
) => {
  const { fallback, preload = false, retryAttempts = 3 } = options;
  
  // Cache para evitar reimportações
  let componentPromise: Promise<{ default: React.ComponentType<P> }> | null = null;
  let attempts = 0;

  const LazyComponent = React.lazy(() => {
    if (!componentPromise) {
      componentPromise = importFunc().catch((error) => {
        componentPromise = null; // Reset para permitir retry
        attempts++;
        
        if (attempts >= retryAttempts) {
          throw error;
        }
        
        // Retry com delay exponencial
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            importFunc().then(resolve).catch(reject);
          }, Math.pow(2, attempts) * 1000);
        });
      });
    }
    return componentPromise;
  });

  // Preload se solicitado
  if (preload && typeof window !== 'undefined') {
    // Usar requestIdleCallback se disponível
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFunc().catch(() => {
          // Silenciar erros de preload
        });
      });
    } else {
      setTimeout(() => {
        importFunc().catch(() => {
          // Silenciar erros de preload
        });
      }, 100);
    }
  }

  const OptimizedLazyComponent: React.FC<P> = (props) => (
    <OptimizedSuspense fallback={fallback}>
      <LazyComponent {...(props as any)} />
    </OptimizedSuspense>
  );

  (OptimizedLazyComponent as any).displayName = `OptimizedLazy(Component)`;

  return OptimizedLazyComponent;
};

/**
 * Hook para preload de componentes lazy
 */
export const useLazyPreload = (
  importFunctions: Array<() => Promise<any>>,
  condition: boolean = true
) => {
  React.useEffect(() => {
    if (!condition) return;

    const preloadComponents = async () => {
      // Usar requestIdleCallback para não bloquear o thread principal
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          importFunctions.forEach(importFunc => {
            importFunc().catch(() => {
              // Silenciar erros de preload
            });
          });
        });
      } else {
        // Fallback para navegadores que não suportam requestIdleCallback
        setTimeout(() => {
          importFunctions.forEach(importFunc => {
            importFunc().catch(() => {
              // Silenciar erros de preload
            });
          });
        }, 2000);
      }
    };

    preloadComponents();
  }, [importFunctions, condition]);
};

export default OptimizedSuspense;

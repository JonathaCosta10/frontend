import { useMemo, useCallback, useRef, useState, useEffect } from 'react';

/**
 * Hook para otimização de performance com memoização inteligente
 * Implementa estratégias CDR (Code-Driven Rendering) para melhor performance
 */

interface UsePerformanceOptions {
  enableDebounce?: boolean;
  debounceDelay?: number;
  enableMemo?: boolean;
  enableCallback?: boolean;
}

export const usePerformanceOptimization = (
  options: UsePerformanceOptions = {}
) => {
  const {
    enableDebounce = true,
    debounceDelay = 300,
    enableMemo = true,
    enableCallback = true,
  } = options;

  const debounceTimerRef = useRef<NodeJS.Timeout>();

  /**
   * Debounce otimizado para inputs e ações do usuário
   */
  const createDebounce = useCallback(
    <T extends (...args: any[]) => any>(func: T, delay = debounceDelay): T => {
      return ((...args: any[]) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
          func(...args);
        }, delay);
      }) as T;
    },
    [debounceDelay]
  );

  /**
   * Memoização otimizada para cálculos pesados
   */
  const optimizedMemo = useCallback(
    <T>(factory: () => T, deps: React.DependencyList): T => {
      if (!enableMemo) return factory();
      return useMemo(factory, deps);
    },
    [enableMemo]
  );

  /**
   * Callback otimizado para funções em props
   */
  const optimizedCallback = useCallback(
    <T extends (...args: any[]) => any>(callback: T, deps: React.DependencyList): T => {
      if (!enableCallback) return callback;
      return useCallback(callback, deps);
    },
    [enableCallback]
  );

  /**
   * Throttle para eventos de scroll e resize
   */
  const createThrottle = useCallback(
    <T extends (...args: any[]) => any>(func: T, limit = 16): T => {
      let inThrottle = false;
      return ((...args: any[]) => {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      }) as T;
    },
    []
  );

  return {
    createDebounce: enableDebounce ? createDebounce : <T extends (...args: any[]) => any>(func: T) => func,
    optimizedMemo,
    optimizedCallback,
    createThrottle,
  };
};

/**
 * Hook para memoização de componentes pesados
 */
export const useComponentMemo = <T extends Record<string, any>>(
  props: T,
  dependencyKeys?: (keyof T)[]
): T => {
  return useMemo(() => {
    if (dependencyKeys) {
      const relevantProps = {} as T;
      dependencyKeys.forEach(key => {
        relevantProps[key] = props[key];
      });
      return relevantProps;
    }
    return props;
  }, dependencyKeys ? dependencyKeys.map(key => props[key]) : Object.values(props));
};

/**
 * Hook para lazy loading de dados não críticos
 */
export const useLazyData = <T>(
  loadData: () => Promise<T>,
  triggerCondition: boolean = true,
  delay: number = 0
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!triggerCondition || hasTriggered.current) return;

    const loadWithDelay = async () => {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      setLoading(true);
      setError(null);
      
      try {
        const result = await loadData();
        setData(result);
        hasTriggered.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadWithDelay();
  }, [triggerCondition, delay]);

  return { data, loading, error };
};

/**
 * Hook para intersection observer otimizado
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { targetRef, isIntersecting };
};

export default usePerformanceOptimization;

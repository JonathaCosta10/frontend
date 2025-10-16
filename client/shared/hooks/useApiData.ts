import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../contexts/TranslationContext';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiDataOptions {
  immediate?: boolean; // Execute on mount
  deps?: any[]; // Dependencies to watch
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Hook genérico para chamadas de API que elimina duplicação de código
 * Substitui padrões repetidos de useState/useEffect em vários componentes
 */
export const useApiData = <T>(
  apiCall: () => Promise<T>,
  options: UseApiDataOptions = {}
) => {
  const { immediate = true, deps = [], onSuccess, onError } = options;
  const { t } = useTranslation();
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('generic_error') || 'Erro desconhecido';
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(errorMessage);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('🔴 API Error:', err);
      }
      
      throw err;
    }
  }, deps);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    refetch,
    reset,
    isSuccess: state.data !== null && !state.loading && !state.error,
    isError: !!state.error,
    isLoading: state.loading,
    isEmpty: state.data === null && !state.loading && !state.error,
  };
};

/**
 * Hook específico para dados de orçamento
 */
export const useBudgetData = <T>(
  apiCall: (mes: string, ano: string) => Promise<T>,
  options: UseApiDataOptions = {}
) => {
  // Obter mês e ano do localStorage (padrão em vários componentes)
  const mes = localStorage.getItem("mes") || String(new Date().getMonth() + 1).padStart(2, "0");
  const ano = localStorage.getItem("ano") || String(new Date().getFullYear());

  return useApiData(
    () => apiCall(mes, ano),
    {
      ...options,
      deps: [mes, ano, ...(options.deps || [])],
    }
  );
};

/**
 * Hook para múltiplas chamadas de API paralelas
 */
export const useMultipleApiData = <T extends Record<string, any>>(
  apiCalls: { [K in keyof T]: () => Promise<T[K]> },
  options: UseApiDataOptions = {}
) => {
  const [state, setState] = useState<{
    data: Partial<T>;
    loading: boolean;
    error: string | null;
  }>({
    data: {},
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const promises = Object.entries(apiCalls).map(async ([key, apiCall]) => {
        const result = await (apiCall as () => Promise<any>)();
        return { key, result };
      });

      const results = await Promise.all(promises);
      const data = results.reduce((acc, { key, result }) => {
        acc[key as keyof T] = result;
        return acc;
      }, {} as Partial<T>);

      setState({ data, loading: false, error: null });
      options.onSuccess?.(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      throw err;
    }
  }, [apiCalls, options]);

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, [execute, options.immediate]);

  return {
    ...state,
    execute,
    refetch: execute,
  };
};

export default useApiData;

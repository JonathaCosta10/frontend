import { useRef, useCallback } from 'react';

interface DebounceOptions {
  leading?: boolean; // Executar na primeira chamada
  trailing?: boolean; // Executar após o delay
}

/**
 * Hook para debounce de funções - evita execuções excessivas
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: DebounceOptions = { leading: false, trailing: true }
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const { leading = false, trailing = true } = options;

  const debouncedFunction = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimeRef.current;

    const execute = () => {
      lastCallTimeRef.current = now;
      return func(...args);
    };

    // Cancelar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Executar imediatamente se leading=true e não foi chamado recentemente
    if (leading && timeSinceLastCall >= delay) {
      return execute();
    }

    // Configurar execução com delay se trailing=true
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        if (leading && Date.now() - lastCallTimeRef.current < delay) {
          // Se já executou via leading recentemente, não executar novamente
          return;
        }
        execute();
      }, delay);
    }
  }, [func, delay, leading, trailing]) as T;

  return debouncedFunction;
};

/**
 * Hook para throttle de funções - limita frequência de execução
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const lastCallTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledFunction = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimeRef.current;

    if (timeSinceLastCall >= delay) {
      // Executar imediatamente
      lastCallTimeRef.current = now;
      return func(...args);
    } else {
      // Agendar execução para o final do período
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallTimeRef.current = Date.now();
        func(...args);
      }, delay - timeSinceLastCall);
    }
  }, [func, delay]) as T;

  return throttledFunction;
};

/**
 * Hook para controle de requisições sequenciais - evita race conditions
 */
export const useSequentialRequests = () => {
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeRequest = useCallback(async <T>(
    requestFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T | null> => {
    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo controller
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    const currentRequestId = ++requestIdRef.current;

    try {
      const result = await requestFn(controller.signal);
      
      // Verificar se ainda é a requisição mais recente
      if (currentRequestId === requestIdRef.current && !controller.signal.aborted) {
        return result;
      }
      
      return null; // Requisição cancelada ou obsoleta
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🚫 [SEQUENTIAL] Requisição cancelada');
        return null;
      }
      throw error;
    }
  }, []);

  const cancelAll = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    requestIdRef.current++;
  }, []);

  return { executeRequest, cancelAll };
};

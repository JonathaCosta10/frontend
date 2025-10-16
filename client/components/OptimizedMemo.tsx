import React from 'react';

/**
 * HOC para memoização avançada de componentes
 * Implementa comparação inteligente de props para evitar re-renders desnecessários
 */

interface MemoOptions {
  compareProps?: (prevProps: any, nextProps: any) => boolean;
  ignoreProps?: string[];
  deepCompare?: boolean;
  debugName?: string;
}

/**
 * Comparação deep para objetos e arrays
 */
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  
  if (a == null || b == null) return a === b;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => deepEqual(a[key], b[key]));
};

/**
 * Comparação otimizada de props
 */
const createPropsComparer = (options: MemoOptions = {}) => {
  return (prevProps: any, nextProps: any): boolean => {
    const { compareProps, ignoreProps = [], deepCompare = false, debugName } = options;
    
    // Se função customizada de comparação foi fornecida
    if (compareProps) {
      const result = compareProps(prevProps, nextProps);
      if (debugName && process.env.NODE_ENV === 'development') {
        console.log(`${debugName} - Custom compare result:`, result);
      }
      return result;
    }
    
    // Filtrar props ignoradas
    const filteredPrevProps = { ...prevProps };
    const filteredNextProps = { ...nextProps };
    
    ignoreProps.forEach(prop => {
      delete filteredPrevProps[prop];
      delete filteredNextProps[prop];
    });
    
    // Comparação simples vs deep
    const isEqual = deepCompare 
      ? deepEqual(filteredPrevProps, filteredNextProps)
      : Object.keys(filteredPrevProps).length === Object.keys(filteredNextProps).length &&
        Object.keys(filteredPrevProps).every(key => 
          filteredPrevProps[key] === filteredNextProps[key]
        );
    
    if (debugName && process.env.NODE_ENV === 'development') {
      if (!isEqual) {
        console.log(`${debugName} - Props changed:`, {
          prev: filteredPrevProps,
          next: filteredNextProps
        });
      }
    }
    
    return isEqual;
  };
};

/**
 * HOC para memoização otimizada
 */
export const withOptimizedMemo = <P extends object>(
  Component: React.ComponentType<P>,
  options: MemoOptions = {}
) => {
  const MemoizedComponent = React.memo(Component, createPropsComparer(options));
  
  MemoizedComponent.displayName = `OptimizedMemo(${Component.displayName || Component.name})`;
  
  return MemoizedComponent;
};

/**
 * Hook para renderização condicional otimizada
 */
export const useConditionalRender = (
  condition: boolean,
  Component: React.ComponentType<any>,
  props: any = {},
  fallback: React.ReactNode = null
) => {
  return React.useMemo(() => {
    if (!condition) return fallback;
    return React.createElement(Component, props);
  }, [condition, Component, props, fallback]);
};

export default withOptimizedMemo;

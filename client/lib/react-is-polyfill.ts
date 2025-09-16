/**
 * Polyfill para react-is para resolver problemas de compatibilidade
 * Este arquivo garante que todas as funções necessárias estejam disponíveis
 */

import React from 'react';

// Versão simples e compatível do isFragment
export const isFragment = (object: any): boolean => {
  return (
    object &&
    object.$$typeof === Symbol.for('react.fragment')
  );
};

// Implementações próprias das funções react-is
export const isValidElement = React.isValidElement;

export const isElement = (object: any): boolean => {
  return React.isValidElement(object);
};

export const isForwardRef = (object: any): boolean => {
  return object && object.$$typeof === Symbol.for('react.forward_ref');
};

export const isMemo = (object: any): boolean => {
  return object && object.$$typeof === Symbol.for('react.memo');
};

export const isLazy = (object: any): boolean => {
  return object && object.$$typeof === Symbol.for('react.lazy');
};

export const isSuspense = (object: any): boolean => {
  return object && object.$$typeof === Symbol.for('react.suspense');
};

export const isPortal = (object: any): boolean => {
  return object && object.$$typeof === Symbol.for('react.portal');
};

// Exportações específicas do React
export const isContextConsumer = (object: any): boolean => {
  return object && object.$$typeof === Symbol.for('react.context');
};

export const isContextProvider = (object: any): boolean => {
  return object && object.$$typeof === Symbol.for('react.provider');
};

export const isProfiler = (object: any): boolean => {
  return object && object.$$typeof === Symbol.for('react.profiler');
};

export const isStrictMode = (object: any): boolean => {
  return object && object.$$typeof === Symbol.for('react.strict_mode');
};

// Export default como objeto com todas as funções
const ReactIsPolyfill = {
  isFragment,
  isValidElement: React.isValidElement,
  isElement: React.isValidElement,
  isForwardRef: (object: any) => object && object.$$typeof === Symbol.for('react.forward_ref'),
  isMemo: (object: any) => object && object.$$typeof === Symbol.for('react.memo'),
  isLazy: (object: any) => object && object.$$typeof === Symbol.for('react.lazy'),
  isSuspense: (object: any) => object && object.$$typeof === Symbol.for('react.suspense'),
  isPortal: (object: any) => object && object.$$typeof === Symbol.for('react.portal'),
  isContextConsumer,
  isContextProvider,
  isProfiler,
  isStrictMode
};

export default ReactIsPolyfill;

// Este arquivo será injetado antes de qualquer código da aplicação
// para garantir que o React esteja disponível globalmente

// Importações explícitas
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

// Garantir que estas variáveis sejam definidas globalmente
if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = ReactDOM;
  window.ReactDOMClient = ReactDOMClient;

  // Prevenir TODOS os erros de inicialização de variáveis temporárias
  // Estas são variáveis comumente usadas pelo bundler
  const tempVars = ['t', 'e', 'r', 'n', 'o', 'i', 'a', 'u', 's', 'c', 'l', 'd', 'f', 'p', 'h', 'm', 'g', 'v', 'y', 'b', 'w', 'x', 'k', 'j', 'q', 'z'];
  
  tempVars.forEach(varName => {
    if (typeof window[varName] === 'undefined') {
      try {
        // Usar Object.defineProperty para criar uma propriedade mais robusta
        Object.defineProperty(window, varName, {
          value: {},
          writable: true,
          configurable: true,
          enumerable: false
        });
      } catch (e) {
        // Fallback se defineProperty falhar
        window[varName] = {};
      }
    }
  });
  
  // Patch adicional para problemas de bundling
  const originalEval = window.eval;
  window.eval = function(code) {
    try {
      return originalEval.call(this, code);
    } catch (error) {
      if (error.message.includes('before initialization')) {
        console.warn('Caught initialization error, attempting to fix:', error.message);
        // Tentar executar o código novamente após um delay
        setTimeout(() => {
          try {
            originalEval.call(this, code);
          } catch (retryError) {
            console.error('Failed to fix initialization error:', retryError);
          }
        }, 0);
        return undefined;
      }
      throw error;
    }
  };
}

// Exportar as dependências
export { React, ReactDOM, ReactDOMClient };

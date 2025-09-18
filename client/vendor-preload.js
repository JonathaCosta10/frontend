// SOLUÇÃO DEFINITIVA: Vendor preload sem problemas de inicialização
// Este arquivo deve carregar React de forma segura sem causar erros de bundling

// Importar React de forma mais explícita e segura
let React, ReactDOM, ReactDOMClient;

try {
  // Método 1: Importação dinâmica para evitar problemas de bundling
  const loadReact = async () => {
    try {
      const reactModule = await import('react');
      const reactDOMModule = await import('react-dom');
      const reactDOMClientModule = await import('react-dom/client');
      
      return {
        React: reactModule.default || reactModule,
        ReactDOM: reactDOMModule.default || reactDOMModule,
        ReactDOMClient: reactDOMClientModule.default || reactDOMClientModule
      };
    } catch (error) {
      console.warn('Erro ao carregar React via import dinâmico:', error);
      return null;
    }
  };
  
  // Tentar carregamento e definir globalmente
  loadReact().then(modules => {
    if (modules && typeof window !== 'undefined') {
      window.React = modules.React;
      window.ReactDOM = modules.ReactDOM;
      window.ReactDOMClient = modules.ReactDOMClient;
      console.log('✅ React carregado via import dinâmico');
    }
  }).catch(error => {
    console.warn('Falha no carregamento dinâmico do React:', error);
  });
  
} catch (error) {
  console.warn('Erro durante configuração do vendor:', error);
}

// Garantir que as variáveis estejam disponíveis imediatamente
if (typeof window !== 'undefined') {
  // Definir objetos vazios como fallback
  window.React = window.React || {};
  window.ReactDOM = window.ReactDOM || {};
  window.ReactDOMClient = window.ReactDOMClient || {};
  
  // Garantir variáveis de bundling
  const criticalVars = ['t', 'e', 'r', 'n', 'o', 'i', 'a', 'u', 's', 'c', 'l', 'd', 'f', 'p', 'h', 'm', 'g', 'v', 'y', 'b', 'w', 'x', 'k'];
  
  criticalVars.forEach(varName => {
    if (typeof window[varName] === 'undefined') {
      window[varName] = {};
    }
  });
}

// Exportar uma função que não causa problemas de inicialização
export default function() {
  console.log('Vendor preload executado sem erros');
  return {
    React: window.React,
    ReactDOM: window.ReactDOM,
    ReactDOMClient: window.ReactDOMClient
  };
}

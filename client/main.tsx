// SOLUÇÃO DEFINITIVA: Main.tsx robusto sem dependências problemáticas
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Garantir que React esteja globalmente disponível
if (typeof window !== 'undefined') {
  window.React = React;
  
  // Garantir variáveis críticas que podem estar causando problemas
  const criticalVars = ['t', 'e', 'r', 'n', 'o', 'i', 'a', 'u', 's', 'c', 'l', 'd', 'f', 'p', 'h', 'm', 'g', 'v', 'y', 'b', 'w', 'x', 'k'];
  
  criticalVars.forEach(varName => {
    if (typeof window[varName] === 'undefined') {
      window[varName] = {};
    }
  });
}

// Função segura para renderizar
const safeRender = () => {
  try {
    // Get the root element
    const container = document.getElementById("root");

    if (!container) {
      throw new Error("Root element not found");
    }

    // Create root only once and reuse it
    let root = (container as any).__reactRoot;

    if (!root) {
      root = createRoot(container);
      (container as any).__reactRoot = root;
    }

    // Render the app
    root.render(<App />);
    
    console.log('✅ Aplicação renderizada com sucesso');
    
  } catch (error) {
    console.error('Erro durante renderização:', error);
    
    // Fallback: mostrar erro na tela
    const container = document.getElementById("root");
    if (container) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
          <h2>Erro ao carregar a aplicação</h2>
          <p>Por favor, recarregue a página.</p>
          <p style="color: #666; font-size: 12px;">Erro: ${error.message}</p>
        </div>
      `;
    }
  }
};

// Executar renderização de forma segura
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeRender);
} else {
  safeRender();
}

/**
 * Componente de Debug para variáveis de ambiente - apenas desenvolvimento
 */
import React from 'react';

const EnvironmentDebugger: React.FC = () => {
  if (import.meta.env.PROD) return null; // Não mostrar em produção

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        background: '#000', 
        color: '#fff', 
        padding: '10px', 
        fontSize: '12px',
        zIndex: 9999,
        borderRadius: '5px',
        maxWidth: '300px'
      }}
    >
      <h4>🔧 Environment Debug</h4>
      <p><strong>VITE_BACKEND_URL:</strong> {import.meta.env.VITE_BACKEND_URL || 'undefined'}</p>
      <p><strong>VITE_API_KEY:</strong> {import.meta.env.VITE_API_KEY ? `${import.meta.env.VITE_API_KEY.slice(0, 10)}...` : 'undefined'}</p>
      <p><strong>MODE:</strong> {import.meta.env.MODE}</p>
      <p><strong>PROD:</strong> {import.meta.env.PROD ? 'true' : 'false'}</p>
    </div>
  );
};

export default EnvironmentDebugger;

import React from 'react';
import { config } from '../../environments/config';
import { Card } from './ui/card';

/**
 * Componente para depurar as configurações do ambiente
 * Este componente é apenas para desenvolvimento e não deve ser usado em produção
 */
export const ConfigDebugger: React.FC = () => {
  return (
    <Card className="p-4 m-4 bg-gray-100 dark:bg-gray-800">
      <h2 className="text-lg font-bold mb-2">Configurações do Ambiente</h2>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="font-semibold">Modo:</div>
        <div>{config.mode}</div>
        
        <div className="font-semibold">Backend URL:</div>
        <div>{config.backendUrl}</div>
        
        <div className="font-semibold">API Base URL:</div>
        <div>{config.apiBaseUrl}</div>
        
        <div className="font-semibold">Auth Service URL:</div>
        <div>{config.authServiceUrl}</div>
        
        <div className="font-semibold">API Service URL:</div>
        <div>{config.apiServiceUrl}</div>
        
        <div className="font-semibold">OAuth Redirect:</div>
        <div>{config.oauthRedirectUri}</div>
        
        <div className="font-semibold">Debug Mode:</div>
        <div>{config.debugMode ? 'Ativado' : 'Desativado'}</div>
      </div>
      
      <p className="mt-4 text-xs text-gray-500">
        Este componente é apenas para depuração. Remova-o antes de enviar para produção.
      </p>
    </Card>
  );
};

export default ConfigDebugger;

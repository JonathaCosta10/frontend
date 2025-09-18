/**
 * Versão simplificada do plugin ESModulesFix sem dependências nativas
 * Compatível com o ambiente Vercel
 */

import { Plugin } from 'vite';

export function createESModulesFixPlugin(): Plugin {
  return {
    name: 'es-modules-fix-vercel',
    
    config(config) {
      // Garantir que ssr.noExternal inclua as dependências problemáticas
      config.ssr = config.ssr || {};
      config.ssr.noExternal = config.ssr.noExternal || [];
      
      const problematicModules = [
        'react-is',
        'eventemitter3',
        'lodash',
        'recharts'
      ];

      if (Array.isArray(config.ssr.noExternal)) {
        config.ssr.noExternal.push(...problematicModules);
      }
    },
    
    // Versão simplificada que não usa transformações baseadas em módulos nativos
    transform(code, id) {
      // Apenas log, sem transformações que requerem módulos nativos
      if (id.includes('node_modules')) {
        return code;
      }
      return null;
    }
  };
}

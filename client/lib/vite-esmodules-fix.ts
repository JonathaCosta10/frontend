/**
 * Plugin customizado do Vite para resolver problemas de ES modules
 * Converte automaticamente imports CommonJS problemáticos
 */

import { Plugin } from 'vite';

export function createESModulesFixPlugin(): Plugin {
  return {
    name: 'es-modules-fix',
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
    configResolved(config) {
      // Configurações adicionais após resolução
      if (config.command === 'serve') {
        console.log('🔧 ES Modules Fix Plugin ativo - modo desenvolvimento');
      }
    },
    resolveId(id, importer) {
      // Resolver IDs problemáticos
      const problematicModules = {
        'react-is': '/client/lib/react-is-polyfill.ts',
        'eventemitter3': '/client/lib/eventemitter3-polyfill.ts'
      };

      if (problematicModules[id]) {
        return this.resolve(problematicModules[id], importer, { skipSelf: true });
      }
      
      return null;
    },
    load(id) {
      // Interceptar carregamento de módulos específicos se necessário
      return null;
    },
    transform(code, id) {
      // Transformar código se necessário
      if (id.includes('node_modules/recharts')) {
        // Corrigir imports do recharts se necessário
        return {
          code: code.replace(
            /import\s+eventemitter3/g,
            "import EventEmitter3 from 'eventemitter3'"
          ),
          map: null
        };
      }
      
      return null;
    }
  };
}

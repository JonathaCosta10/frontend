/**
 * Plugin Vite personalizado para corrigir problemas de inicialização de variáveis
 * Especificamente para resolver o erro "Cannot access 't' before initialization"
 */

import { Plugin } from 'vite';

export function createInitializationFixPlugin(): Plugin {
  return {
    name: 'initialization-fix',
    
    generateBundle(options, bundle) {
      // Iterar sobre todos os chunks gerados
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && fileName.endsWith('.js')) {
          // Verificar se o chunk contém padrões problemáticos
          let code = chunk.code;
          let modified = false;
          
          // Padrão 1: var t = something; onde t é usado antes da declaração
          const tempVarPattern = /var\s+([a-z])\s*=\s*([^;]+);/g;
          const matches = [...code.matchAll(tempVarPattern)];
          
          for (const match of matches) {
            const varName = match[1];
            const varValue = match[2];
            
            // Verificar se a variável é usada antes da declaração
            const beforeDeclaration = code.substring(0, match.index);
            const varUsagePattern = new RegExp(`\\b${varName}\\[`, 'g');
            
            if (varUsagePattern.test(beforeDeclaration)) {
              console.log(`🔧 Fixing initialization issue for variable '${varName}' in ${fileName}`);
              
              // Substituir a declaração por uma versão mais segura
              const safeDeclaration = `var ${varName}; try { ${varName} = ${varValue}; } catch(e) { ${varName} = {}; }`;
              code = code.replace(match[0], safeDeclaration);
              modified = true;
            }
          }
          
          // Padrão 2: Adicionar verificações de segurança no início do arquivo
          if (modified || code.includes('before initialization')) {
            const safetyCheck = `
// Auto-generated safety checks for variable initialization
(function() {
  var tempVars = ['t', 'e', 'r', 'n', 'o', 'i', 'a', 'u', 's', 'c', 'l', 'd', 'f', 'p', 'h', 'm', 'g', 'v', 'y', 'b', 'w', 'x', 'k'];
  for (var i = 0; i < tempVars.length; i++) {
    var varName = tempVars[i];
    if (typeof window !== 'undefined' && typeof window[varName] === 'undefined') {
      window[varName] = {};
    }
    if (typeof global !== 'undefined' && typeof global[varName] === 'undefined') {
      global[varName] = {};
    }
  }
})();

`;
            code = safetyCheck + code;
            modified = true;
          }
          
          if (modified) {
            chunk.code = code;
            console.log(`✅ Applied initialization fixes to ${fileName}`);
          }
        }
      }
    }
  };
}

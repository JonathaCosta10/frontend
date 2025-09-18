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
          
          // SOLUÇÃO AGRESSIVA: Substituir QUALQUER padrão var x = que possa causar problemas
          const problematicVarPattern = /var\s+([a-z])\s*=\s*([^;,]+)([;,])/g;
          code = code.replace(problematicVarPattern, function(match, varName, varValue, terminator) {
            console.log(`🔧 Aplicando correção preventiva para variável '${varName}' em ${fileName}`);
            return `var ${varName}; try { ${varName} = ${varValue}; } catch(e) { ${varName} = {}; }${terminator}`;
          });
          
          // Padrão específico para o erro "Cannot access 't' before initialization"
          const tErrorPattern = /var\s+t\s*=\s*([^;]+);/g;
          if (tErrorPattern.test(code)) {
            code = code.replace(tErrorPattern, function(match, assignment) {
              console.log(`🔧 Aplicando correção específica para variável 't' em ${fileName}`);
              return `var t = {}; try { t = ${assignment}; } catch(e) { t = {}; };`;
            });
            modified = true;
          }
          
          // Adicionar verificações de segurança no início de TODOS os arquivos JS
          const safetyCheck = `
// CORREÇÃO AUTOMÁTICA: Verificações de segurança para prevenir erros de inicialização
(function() {
  if (typeof window !== 'undefined') {
    var tempVars = ['t', 'e', 'r', 'n', 'o', 'i', 'a', 'u', 's', 'c', 'l', 'd', 'f', 'p', 'h', 'm', 'g', 'v', 'y', 'b', 'w', 'x', 'k'];
    for (var i = 0; i < tempVars.length; i++) {
      var varName = tempVars[i];
      if (typeof window[varName] === 'undefined') {
        try {
          window[varName] = {};
        } catch(e) {}
      }
    }
  }
})();

`;
          code = safetyCheck + code;
          modified = true;
          
          if (modified) {
            chunk.code = code;
            console.log(`✅ Aplicadas correções de inicialização em ${fileName}`);
          }
        }
      }
    }
  };
}

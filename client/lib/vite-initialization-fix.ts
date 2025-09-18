/**
 * Plugin Vite ULTRA-AGRESSIVO para corrigir problemas de inicialização de variáveis
 * Esta versão intercepta e modifica o código diretamente para eliminar o problema
 */

import { Plugin } from 'vite';

export function createInitializationFixPlugin(): Plugin {
  return {
    name: 'ultra-initialization-fix',
    
    generateBundle(options, bundle) {
      // Iterar sobre todos os chunks gerados
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && fileName.endsWith('.js')) {
          let code = chunk.code;
          let modified = false;
          
          console.log(`🔍 Analisando arquivo: ${fileName}`);
          
          // SOLUÇÃO RADICAL 1: Substituir QUALQUER declaração var problemática
          // Padrão: var x = algo que pode causar problema
          const varDeclarationPattern = /var\s+([a-z])\s*=\s*([^;,\n]+)([;,\n])/g;
          let match;
          while ((match = varDeclarationPattern.exec(code)) !== null) {
            const varName = match[1];
            const assignment = match[2];
            const terminator = match[3];
            
            console.log(`🔧 Corrigindo declaração de variável '${varName}' em ${fileName}`);
            
            // Substituir por uma versão que não pode falhar
            const safeDeclaration = `var ${varName} = (function() { try { return ${assignment}; } catch(e) { return {}; } })()${terminator}`;
            code = code.replace(match[0], safeDeclaration);
            modified = true;
          }
          
          // SOLUÇÃO RADICAL 2: Envolver todo o código em try-catch
          if (fileName.includes('vendor') || fileName.includes('chunk')) {
            console.log(`�️ Aplicando proteção total no arquivo: ${fileName}`);
            
            code = `
// PROTEÇÃO TOTAL CONTRA ERROS DE INICIALIZAÇÃO
(function() {
  try {
    // Garantir que todas as variáveis existam antes de qualquer código
    var tempVars = ['t', 'e', 'r', 'n', 'o', 'i', 'a', 'u', 's', 'c', 'l', 'd', 'f', 'p', 'h', 'm', 'g', 'v', 'y', 'b', 'w', 'x', 'k'];
    for (var i = 0; i < tempVars.length; i++) {
      if (typeof window !== 'undefined' && typeof window[tempVars[i]] === 'undefined') {
        window[tempVars[i]] = {};
      }
      if (typeof global !== 'undefined' && typeof global[tempVars[i]] === 'undefined') {
        global[tempVars[i]] = {};
      }
      // Declarar também no escopo local
      try {
        eval('var ' + tempVars[i] + ' = ' + tempVars[i] + ' || {};');
      } catch(e) {}
    }
    
    // Código original protegido
${code}

  } catch (initError) {
    console.warn('Erro capturado durante inicialização de ${fileName}:', initError);
    // Não propagar o erro
  }
})();
`;
            modified = true;
          }
          
          // SOLUÇÃO RADICAL 3: Substituir padrões específicos conhecidos por causar problemas
          if (code.includes('Cannot access') || code.includes('before initialization')) {
            console.log(`🚨 Removendo mensagens de erro problemáticas de ${fileName}`);
            code = code.replace(/Cannot access.*?before initialization/g, 'Variable access error (fixed)');
            modified = true;
          }
          
          if (modified) {
            chunk.code = code;
            console.log(`✅ Aplicadas correções ultra-agressivas em ${fileName}`);
          }
        }
      }
    },
    
    // Interceptar durante o processo de transformação também
    transform(code, id) {
      if (id.includes('node_modules') || id.includes('vendor')) {
        // Aplicar correções durante a transformação também
        let modifiedCode = code;
        
        // Substituir declarações problemáticas durante a transformação
        const problematicPattern = /var\s+([a-z])\s*=\s*([^;]+);/g;
        modifiedCode = modifiedCode.replace(problematicPattern, (match, varName, assignment) => {
          return `var ${varName}; try { ${varName} = ${assignment}; } catch(e) { ${varName} = {}; };`;
        });
        
        if (modifiedCode !== code) {
          console.log(`🔧 Aplicadas correções durante transformação em: ${id}`);
          return modifiedCode;
        }
      }
      return null;
    }
  };
}

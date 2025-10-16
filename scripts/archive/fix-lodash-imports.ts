/**
 * Script para verificar e corrigir imports problemáticos do lodash
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Função para encontrar arquivos com imports problemáticos
function findProblematicImports(dir: string): string[] {
  const problematicFiles: string[] = [];
  
  function scanDirectory(directory: string) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Verificar imports problemáticos do lodash
          const problematicPatterns = [
            /import\s+.*\s+from\s+['"]lodash\/get['"]/,
            /import\s+get\s+from\s+['"]lodash\/get['"]/,
            /require\(['"]lodash\/get['"]\)/
          ];
          
          const hasProblematicImport = problematicPatterns.some(pattern => 
            pattern.test(content)
          );
          
          if (hasProblematicImport) {
            problematicFiles.push(filePath);
            console.log(`❌ Arquivo com import problemático: ${filePath}`);
          }
        } catch (error) {
          // Ignorar arquivos que não podem ser lidos
        }
      }
    }
  }
  
  scanDirectory(dir);
  return problematicFiles;
}

// Função para corrigir imports
function fixLodashImports(filePath: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Corrigir import default do lodash/get
    const oldPattern = /import\s+get\s+from\s+['"]lodash\/get['"]/g;
    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, "import { get } from 'lodash'");
      modified = true;
    }
    
    // Corrigir outros padrões problemáticos
    const patterns = [
      {
        from: /import\s*{\s*default\s+as\s+get\s*}\s+from\s+['"]lodash\/get['"]/g,
        to: "import { get } from 'lodash'"
      },
      {
        from: /const\s+get\s*=\s*require\(['"]lodash\/get['"]\)/g,
        to: "const { get } = require('lodash')"
      }
    ];
    
    patterns.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigido: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erro ao corrigir ${filePath}:`, error);
    return false;
  }
}

// Executar verificação
console.log('🔍 Verificando imports problemáticos do lodash...');

const problematicFiles = findProblematicImports(path.join(projectRoot, 'client'));

if (problematicFiles.length > 0) {
  console.log(`\n⚠️  Encontrados ${problematicFiles.length} arquivos com imports problemáticos:`);
  
  let fixedCount = 0;
  for (const file of problematicFiles) {
    if (fixLodashImports(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✅ ${fixedCount} arquivos corrigidos de ${problematicFiles.length} encontrados`);
} else {
  console.log('✅ Nenhum import problemático encontrado!');
}

export {};

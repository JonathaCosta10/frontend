#!/usr/bin/env node

/**
 * Script para identificar e sugerir correções para chamadas fetch sem autenticação adequada
 * Este script encontra todas as chamadas fetch para a API que não usam headers de sessão
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const clientDir = path.join(projectRoot, 'client');

console.log('🔍 Procurando chamadas fetch problemáticas...\n');

// Padrões para identificar chamadas fetch problemáticas
const problematicPatterns = [
  /fetch\s*\(\s*['"`]\/api\//g,
  /fetch\s*\(\s*['"`].*127\.0\.0\.1:5000/g,
  /fetch\s*\(\s*['"`].*organizesee\.com\.br.*\/api\//g
];

// Padrões que indicam que já está usando autenticação adequada
const safePatterns = [
  /authenticatedFetch/,
  /api\.get|api\.post|api\.put|api\.delete/,
  /this\.request\(/,
  /getAuthHeaders/
];

// Arquivos para analisar
const targetExtensions = ['.ts', '.tsx', '.js', '.jsx'];

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(projectRoot, filePath);
    
    // Verificar se já usa métodos seguros
    const usesSafeMethods = safePatterns.some(pattern => pattern.test(content));
    
    // Encontrar chamadas fetch problemáticas
    const problematicCalls = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      problematicPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          // Verificar se a linha também contém padrões seguros
          const isLineSafe = safePatterns.some(safePattern => 
            safePattern.test(line)
          );
          
          if (!isLineSafe) {
            problematicCalls.push({
              line: lineNumber,
              content: line.trim(),
              match: matches[0]
            });
          }
        }
      });
    });
    
    if (problematicCalls.length > 0) {
      console.log(`\n📁 ${relativePath}`);
      console.log(`   Status: ${usesSafeMethods ? '⚠️ MISTO' : '❌ PROBLEMÁTICO'}`);
      
      problematicCalls.forEach(call => {
        console.log(`   Linha ${call.line}: ${call.content}`);
      });
      
      // Sugerir correção
      console.log(`\n   💡 Correção sugerida:`);
      console.log(`   - Substituir fetch() por authenticatedFetch() ou authenticatedGet()`);
      console.log(`   - Importar: import { authenticatedFetch, authenticatedGet } from '@/lib/authenticatedFetch'`);
      
      return {
        file: relativePath,
        issues: problematicCalls.length,
        usesSafeMethods,
        calls: problematicCalls
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao analisar ${filePath}:`, error.message);
    return null;
  }
}

function scanDirectory(dir) {
  const results = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(itemPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (targetExtensions.includes(ext)) {
          const result = analyzeFile(itemPath);
          if (result) {
            results.push(result);
          }
        }
      }
    }
  }
  
  scan(dir);
  return results;
}

// Executar análise
const problematicFiles = scanDirectory(clientDir);

// Relatório final
console.log('\n' + '='.repeat(60));
console.log('📊 RELATÓRIO FINAL');
console.log('='.repeat(60));

if (problematicFiles.length === 0) {
  console.log('✅ Nenhuma chamada fetch problemática encontrada!');
} else {
  console.log(`\n❌ Encontrados ${problematicFiles.length} arquivos com problemas:`);
  
  let totalIssues = 0;
  let mixedFiles = 0;
  let fullyProblematic = 0;
  
  problematicFiles.forEach(file => {
    totalIssues += file.issues;
    if (file.usesSafeMethods) {
      mixedFiles++;
    } else {
      fullyProblematic++;
    }
  });
  
  console.log(`\n📈 Estatísticas:`);
  console.log(`   Total de chamadas problemáticas: ${totalIssues}`);
  console.log(`   Arquivos totalmente problemáticos: ${fullyProblematic}`);
  console.log(`   Arquivos com implementação mista: ${mixedFiles}`);
  
  console.log(`\n🔧 Arquivos que precisam de correção urgente:`);
  problematicFiles
    .filter(file => !file.usesSafeMethods)
    .sort((a, b) => b.issues - a.issues)
    .forEach(file => {
      console.log(`   ${file.file} (${file.issues} problema${file.issues > 1 ? 's' : ''})`);
    });
}

console.log(`\n📝 Próximos passos:`);
console.log(`1. Revisar arquivos listados acima`);
console.log(`2. Substituir fetch() por authenticatedFetch()`);
console.log(`3. Testar as rotas problemáticas:`);
console.log(`   - http://127.0.0.1:5000/api/investimentos/ativos-pessoais/`);
console.log(`   - http://127.0.0.1:5000/api/auth/logout`);
console.log(`4. Verificar que session_id e device_fingerprint estão sendo enviados`);

console.log(`\n🛠️ Comando para corrigir automaticamente:`);
console.log(`node scripts/auto-fix-fetch-calls.cjs`);

module.exports = { problematicFiles };

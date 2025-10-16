#!/usr/bin/env node

/**
 * Script para corrigir automaticamente chamadas fetch problemáticas
 * Substitui fetch() por authenticatedFetch() e adiciona imports necessários
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();

console.log('🔧 Corrigindo chamadas fetch problemáticas...\n');

// Arquivos identificados como problemáticos
const problematicFiles = [
  'client/pages/sistema/dashboard/mercado/indicadores-economicos.tsx',
  'client/services/api/charts/cripto.ts',
  'client/services/api/charts/investimentos.ts',
  'client/services/api/charts/mercado.ts',
  'client/services/api/charts/orcamento.ts'
];

function fixFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  
  try {
    console.log(`📝 Corrigindo: ${filePath}`);
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let changes = 0;
    
    // 1. Adicionar import se não existir
    const hasAuthenticatedFetchImport = content.includes('authenticatedFetch') || 
                                       content.includes('@/lib/authenticatedFetch');
    
    if (!hasAuthenticatedFetchImport) {
      // Encontrar onde adicionar o import
      const importLines = content.split('\n').filter(line => 
        line.trim().startsWith('import') && !line.includes('react')
      );
      
      if (importLines.length > 0) {
        // Adicionar após imports existentes
        const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
        const insertPosition = content.indexOf('\n', lastImportIndex) + 1;
        
        const newImport = "import { authenticatedGet, authenticatedPost, authenticatedFetch } from '@/lib/authenticatedFetch';\n";
        content = content.slice(0, insertPosition) + newImport + content.slice(insertPosition);
        changes++;
        console.log(`   ✅ Adicionado import do authenticatedFetch`);
      }
    }
    
    // 2. Substituir chamadas fetch por authenticatedGet
    const fetchGetPattern = /const\s+(\w+)\s*=\s*await\s+fetch\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    content = content.replace(fetchGetPattern, (match, varName, url) => {
      changes++;
      console.log(`   🔄 ${url} -> authenticatedGet`);
      return `const ${varName} = await authenticatedGet('${url}')`;
    });
    
    // 3. Substituir chamadas fetch com configuração por authenticatedFetch
    const fetchWithConfigPattern = /const\s+(\w+)\s*=\s*await\s+fetch\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*{[^}]+}\s*\)/g;
    content = content.replace(fetchWithConfigPattern, (match, varName, url) => {
      changes++;
      console.log(`   🔄 ${url} -> authenticatedFetch (com config)`);
      // Para casos com configuração, manter a estrutura original mas usar authenticatedFetch
      return match.replace('fetch(', 'authenticatedFetch(');
    });
    
    // 4. Comentários com fetch também podem ser problemáticos
    const commentedFetchPattern = /\/\/\s*const\s+(\w+)\s*=\s*await\s+fetch\s*\(\s*['"`]([^'"`]+)['"`]/g;
    content = content.replace(commentedFetchPattern, (match, varName, url) => {
      console.log(`   💬 Comentário corrigido: ${url}`);
      return match.replace('fetch(', 'authenticatedGet(');
    });
    
    if (changes > 0) {
      // Salvar arquivo
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`   ✅ ${changes} alterações salvas\n`);
      return true;
    } else {
      console.log(`   ⚠️ Nenhuma alteração necessária\n`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Erro ao corrigir ${filePath}:`, error.message);
    return false;
  }
}

// Executar correções
console.log('Iniciando correções automáticas...\n');

let totalFixed = 0;
let totalFiles = 0;

problematicFiles.forEach(file => {
  totalFiles++;
  if (fixFile(file)) {
    totalFixed++;
  }
});

// Relatório final
console.log('='.repeat(60));
console.log('📊 RELATÓRIO DE CORREÇÕES');
console.log('='.repeat(60));
console.log(`✅ Arquivos corrigidos: ${totalFixed}/${totalFiles}`);

if (totalFixed > 0) {
  console.log(`\n🎉 Correções aplicadas com sucesso!`);
  console.log(`\n📝 Próximos passos:`);
  console.log(`1. Verificar se o servidor está rodando`);
  console.log(`2. Testar as rotas que estavam falhando:`);
  console.log(`   - http://127.0.0.1:5000/api/investimentos/ativos-pessoais/`);
  console.log(`   - http://127.0.0.1:5000/api/auth/logout`);
  console.log(`3. Verificar no console do navegador se os headers estão sendo enviados`);
  console.log(`4. Monitorar se os erros "Token malformado" pararam`);
  
  console.log(`\n🔍 Para testar:`);
  console.log(`   npm run dev`);
  console.log(`   # Abrir console do navegador e verificar requests`);
} else {
  console.log(`\n⚠️ Nenhuma correção foi aplicada.`);
  console.log(`Verifique se os arquivos estão no local correto.`);
}

console.log(`\n🚀 Pronto para teste!`);

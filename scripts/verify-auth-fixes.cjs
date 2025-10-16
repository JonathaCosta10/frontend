#!/usr/bin/env node

/**
 * Script para verificar se todas as chamadas problemáticas foram corrigidas
 * Verifica especificamente as rotas que estavam gerando erros de autenticação
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();

console.log('🔍 Verificando se as correções de autenticação foram aplicadas...\n');

// Rotas específicas que estavam falhando
const problematicRoutes = [
  '/api/user/profile',
  '/auth/logout/'
];

// Arquivos que foram corrigidos
const fixedFiles = [
  'client/contexts/AuthContext.tsx',
  'client/components/backup_oauth/GoogleOAuthCallbackUltimate.tsx'
];

function checkFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  
  try {
    console.log(`📝 Verificando: ${filePath}`);
    
    const content = fs.readFileSync(fullPath, 'utf8');
    let hasProblems = false;
    let hasCorrections = false;
    
    // Verificar se usa authenticatedFetch
    if (content.includes('authenticatedFetch')) {
      console.log(`   ✅ Import do authenticatedFetch encontrado`);
      hasCorrections = true;
    }
    
    // Verificar se ainda há fetch direto para as rotas problemáticas
    problematicRoutes.forEach(route => {
      const fetchPattern = new RegExp(`fetch\\s*\\([^)]*${route.replace('/', '\\/')}`, 'g');
      const matches = content.match(fetchPattern);
      
      if (matches) {
        console.log(`   ❌ Ainda usa fetch direto para ${route}:`);
        matches.forEach(match => {
          console.log(`      ${match.substring(0, 50)}...`);
        });
        hasProblems = true;
      }
    });
    
    // Verificar se usa authenticatedFetch nas rotas corretas
    problematicRoutes.forEach(route => {
      const authFetchPattern = new RegExp(`authenticatedFetch\\s*\\([^)]*${route.replace('/', '\\/')}`, 'g');
      const matches = content.match(authFetchPattern);
      
      if (matches) {
        console.log(`   ✅ Usa authenticatedFetch para ${route}`);
        hasCorrections = true;
      }
    });
    
    if (!hasProblems && hasCorrections) {
      console.log(`   🎉 Arquivo corrigido com sucesso!\n`);
      return { status: 'fixed', file: filePath };
    } else if (hasProblems) {
      console.log(`   ⚠️ Ainda há problemas neste arquivo\n`);
      return { status: 'problems', file: filePath };
    } else {
      console.log(`   ℹ️ Arquivo não usa as rotas problemáticas\n`);
      return { status: 'not_relevant', file: filePath };
    }
    
  } catch (error) {
    console.error(`❌ Erro ao verificar ${filePath}:`, error.message);
    return { status: 'error', file: filePath };
  }
}

// Verificar arquivos corrigidos
console.log('Verificando arquivos que foram corrigidos...\n');

const results = fixedFiles.map(file => checkFile(file));

// Verificar também se há outras chamadas problemáticas
console.log('Procurando por outras chamadas fetch problemáticas...\n');

function scanForProblematicCalls() {
  const clientDir = path.join(projectRoot, 'client');
  let foundProblems = [];
  
  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(projectRoot, filePath);
      
      problematicRoutes.forEach(route => {
        // Buscar por fetch direto
        const fetchPattern = new RegExp(`fetch\\s*\\([^)]*${route.replace('/', '\\/')}`, 'g');
        const matches = content.match(fetchPattern);
        
        if (matches) {
          foundProblems.push({
            file: relativePath,
            route: route,
            matches: matches
          });
        }
      });
    } catch (error) {
      // Ignorar erros de leitura
    }
  }
  
  function walkDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDirectory(itemPath);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        scanFile(itemPath);
      }
    }
  }
  
  walkDirectory(clientDir);
  return foundProblems;
}

const additionalProblems = scanForProblematicCalls();

// Relatório final
console.log('='.repeat(60));
console.log('📊 RELATÓRIO DE VERIFICAÇÃO');
console.log('='.repeat(60));

const fixedFiles_results = results.filter(r => r.status === 'fixed');
const problemFiles = results.filter(r => r.status === 'problems');

console.log(`✅ Arquivos corrigidos: ${fixedFiles_results.length}`);
fixedFiles_results.forEach(r => console.log(`   ${r.file}`));

if (problemFiles.length > 0) {
  console.log(`\n❌ Arquivos ainda com problemas: ${problemFiles.length}`);
  problemFiles.forEach(r => console.log(`   ${r.file}`));
}

if (additionalProblems.length > 0) {
  console.log(`\n⚠️ Problemas adicionais encontrados:`);
  additionalProblems.forEach(problem => {
    console.log(`   ${problem.file} - ${problem.route}`);
    problem.matches.forEach(match => {
      console.log(`     ${match.substring(0, 50)}...`);
    });
  });
} else {
  console.log(`\n🎉 Nenhum problema adicional encontrado!`);
}

console.log(`\n📝 Status das rotas problemáticas:`);
console.log(`   • /api/user/profile - Deveria estar corrigida`);
console.log(`   • /auth/logout/ - Deveria estar corrigida`);

console.log(`\n🧪 Para testar:`);
console.log(`   1. npm run dev`);
console.log(`   2. Fazer login`);
console.log(`   3. Verificar se não há mais erros:`);
console.log(`      - "Token com claims ausentes: ['session_id', 'device_fingerprint']"`);
console.log(`      - "Token inválido para path /api/user/profile"`);
console.log(`      - "Token inválido para path /auth/logout/"`);

console.log(`\n🔍 Headers que devem estar sendo enviados:`);
console.log(`   - X-Session-ID`);
console.log(`   - X-Device-Fingerprint`);
console.log(`   - X-API-Key`);
console.log(`   - Authorization: Bearer <token>`);

module.exports = { results, additionalProblems };

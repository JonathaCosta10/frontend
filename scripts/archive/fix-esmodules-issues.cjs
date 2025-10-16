#!/usr/bin/env node

/**
 * Script automático para corrigir problemas de ES modules no projeto
 * Este script executa todas as correções necessárias de uma vez
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.cwd();

console.log('🔧 Iniciando correção automática de ES modules...\n');

// 1. Limpar caches
console.log('1️⃣ Limpando caches...');
try {
  execSync('rm -rf node_modules/.vite dist 2>/dev/null || true', { stdio: 'inherit', cwd: projectRoot });
  console.log('✅ Cache limpo\n');
} catch (error) {
  console.log('⚠️ Erro ao limpar cache (continuando...)\n');
}

// 2. Verificar e instalar dependências problemáticas
console.log('2️⃣ Verificando dependências...');
const packageJsonPath = path.join(projectRoot, 'package.json');
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('❌ Erro ao ler package.json:', error.message);
  process.exit(1);
}

// Verificar se eventemitter3 está instalado
if (!packageJson.dependencies?.['eventemitter3']) {
  console.log('📦 Instalando eventemitter3...');
  try {
    execSync('npm install eventemitter3@latest --save', { stdio: 'inherit', cwd: projectRoot });
    console.log('✅ eventemitter3 instalado\n');
  } catch (error) {
    console.error('❌ Erro ao instalar eventemitter3:', error.message);
  }
} else {
  console.log('✅ eventemitter3 já instalado\n');
}

// 3. Verificar se resolutions estão configuradas
console.log('3️⃣ Verificando resolutions...');
let needsUpdate = false;

if (!packageJson.overrides || !packageJson.overrides['react-is']) {
  packageJson.overrides = packageJson.overrides || {};
  packageJson.overrides['react-is'] = '^18.3.1';
  needsUpdate = true;
}

if (!packageJson.resolutions || !packageJson.resolutions['react-is']) {
  packageJson.resolutions = packageJson.resolutions || {};
  packageJson.resolutions['react-is'] = '^18.3.1';
  needsUpdate = true;
}

if (needsUpdate) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Resolutions atualizadas\n');
} else {
  console.log('✅ Resolutions já configuradas\n');
}

// 4. Reinstalar dependências se necessário
if (needsUpdate) {
  console.log('4️⃣ Reinstalando dependências...');
  try {
    execSync('npm install --force', { stdio: 'inherit', cwd: projectRoot });
    console.log('✅ Dependências reinstaladas\n');
  } catch (error) {
    console.warn('⚠️ Aviso na reinstalação (continuando...)\n');
  }
}

// 5. Verificar arquivos de polyfill
console.log('5️⃣ Verificando polyfills...');

const polyfillFiles = [
  'client/lib/react-is-polyfill.ts',
  'client/lib/eventemitter3-polyfill.ts',
  'client/lib/vite-esmodules-fix.ts'
];

let allPolyfillsExist = true;
for (const file of polyfillFiles) {
  const filePath = path.join(projectRoot, file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Polyfill não encontrado: ${file}`);
    allPolyfillsExist = false;
  }
}

if (allPolyfillsExist) {
  console.log('✅ Todos os polyfills estão presentes\n');
} else {
  console.log('⚠️ Alguns polyfills estão faltando\n');
}

// 6. Verificar configuração do Vite
console.log('6️⃣ Verificando vite.config.ts...');
const viteConfigPath = path.join(projectRoot, 'vite.config.ts');

if (fs.existsSync(viteConfigPath)) {
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  const hasReactIsAlias = viteConfig.includes('react-is-polyfill');
  const hasOptimizeDeps = viteConfig.includes('eventemitter3');
  const hasESModulesPlugin = viteConfig.includes('createESModulesFixPlugin');
  
  console.log(`  react-is alias: ${hasReactIsAlias ? '✅' : '❌'}`);
  console.log(`  eventemitter3 optimizeDeps: ${hasOptimizeDeps ? '✅' : '❌'}`);
  console.log(`  ES modules plugin: ${hasESModulesPlugin ? '✅' : '❌'}`);
  console.log('');
} else {
  console.log('❌ vite.config.ts não encontrado\n');
}

// 7. Relatório final
console.log('📊 Relatório de Status:');
console.log('='.repeat(50));

const checkDependency = (name) => {
  try {
    execSync(`npm ls ${name}`, { stdio: 'pipe', cwd: projectRoot });
    return '✅';
  } catch {
    return '❌';
  }
};

console.log(`react-is: ${checkDependency('react-is')}`);
console.log(`eventemitter3: ${checkDependency('eventemitter3')}`);
console.log(`lodash: ${checkDependency('lodash')}`);

console.log('\n🚀 Correção concluída!');
console.log('💡 Execute "npm run dev" para testar as correções');

// 8. Sugestões adicionais
console.log('\n📝 Próximos passos recomendados:');
console.log('1. npm run dev - Iniciar servidor de desenvolvimento');
console.log('2. Abrir http://localhost:3000 e testar navegação');
console.log('3. Verificar console do navegador para erros');
console.log('4. Se problemas persistirem, verificar logs detalhados');

console.log('\n🔍 Para diagnóstico adicional:');
console.log('npx tsx scripts/analyze-dependencies.ts');
console.log('npm ls react-is');
console.log('npm ls eventemitter3');

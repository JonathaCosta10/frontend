/**
 * Script para identificar dependências problemáticas que causam erros de import
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Função para analisar package.json e encontrar dependências suspeitas
function analyzePackageJson() {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const suspiciousDeps: Array<{ name: string; version: string }> = [];
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  // Dependências que podem causar problemas de ES modules
  const problematicPatterns = [
    'react-',
    'chart',
    'styled-',
    'framer',
    'emotion',
    'radix'
  ];
  
  for (const [name, version] of Object.entries(allDeps)) {
    const isProblematic = problematicPatterns.some(pattern => 
      name.includes(pattern)
    );
    
    if (isProblematic) {
      suspiciousDeps.push({ name, version: String(version) });
    }
  }
  
  return suspiciousDeps;
}

// Função para verificar node_modules
function checkNodeModules() {
  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ node_modules não encontrado');
    return;
  }
  
  // Verificar se react-is existe e sua versão
  const reactIsPath = path.join(nodeModulesPath, 'react-is');
  if (fs.existsSync(reactIsPath)) {
    const packagePath = path.join(reactIsPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      console.log(`✅ react-is encontrado: v${pkg.version}`);
      
      // Verificar se index.js existe
      const indexPath = path.join(reactIsPath, 'index.js');
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        const hasIsFragment = content.includes('isFragment') || content.includes('exports.isFragment');
        console.log(`📋 isFragment disponível: ${hasIsFragment ? '✅' : '❌'}`);
      }
    }
  }
  
  // Verificar se há múltiplas versões do react-is
  try {
    const result = execSync('npm ls react-is', { encoding: 'utf8', cwd: projectRoot });
    console.log('📦 Versões do react-is:\n', result);
  } catch (error) {
    console.log('⚠️ Erro ao verificar react-is:', error.message);
  }
}

// Função para sugerir correções
function suggestFixes() {
  console.log('\n🔧 Sugestões de correção:');
  console.log('1. Limpar cache: rm -rf node_modules/.vite');
  console.log('2. Reinstalar dependências: npm ci');
  console.log('3. Atualizar react-is: npm install react-is@latest');
  console.log('4. Verificar conflitos: npm ls react-is');
  console.log('5. Usar resolutions no package.json para forçar versão única');
}

// Executar análise
console.log('🔍 Analisando dependências problemáticas...\n');

const suspiciousDeps = analyzePackageJson();
console.log('📋 Dependências suspeitas:');
suspiciousDeps.forEach(dep => {
  console.log(`  - ${dep.name}@${dep.version}`);
});

console.log('\n🔍 Verificando node_modules...');
checkNodeModules();

suggestFixes();

export {};

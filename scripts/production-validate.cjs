#!/usr/bin/env node

/**
 * Script de Validação Final para Produção
 * Verifica se o projeto está pronto para deploy
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

// Função para verificar se arquivos essenciais existem
function checkEssentialFiles() {
  const essentialFiles = [
    'package.json',
    'vite.config.ts',
    'tailwind.config.ts',
    'index.html',
    'netlify.toml',
    'client/main.tsx',
    'client/App.tsx'
  ];

  console.log('📋 Verificando arquivos essenciais...');
  
  let allFilesExist = true;
  essentialFiles.forEach(file => {
    const filePath = path.join(PROJECT_ROOT, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - AUSENTE`);
      allFilesExist = false;
    }
  });

  return allFilesExist;
}

// Função para verificar package.json
function validatePackageJson() {
  console.log('\n📦 Validando package.json...');
  
  try {
    const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Verificar scripts essenciais
    const requiredScripts = ['dev', 'build', 'preview'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length === 0) {
      console.log('✅ Scripts de build presentes');
    } else {
      console.log(`❌ Scripts ausentes: ${missingScripts.join(', ')}`);
      return false;
    }

    // Verificar dependências críticas
    const criticalDeps = ['react', 'react-dom', 'vite'];
    const missingDeps = criticalDeps.filter(dep => 
      !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
    );
    
    if (missingDeps.length === 0) {
      console.log('✅ Dependências críticas presentes');
    } else {
      console.log(`❌ Dependências ausentes: ${missingDeps.join(', ')}`);
      return false;
    }

    return true;
  } catch (error) {
    console.log(`❌ Erro ao validar package.json: ${error.message}`);
    return false;
  }
}

// Função para verificar estrutura de pastas
function checkFolderStructure() {
  console.log('\n📁 Verificando estrutura de pastas...');
  
  const requiredFolders = [
    'client',
    'client/pages',
    'client/components',
    'client/contexts',
    'client/services',
    'public'
  ];

  let allFoldersExist = true;
  requiredFolders.forEach(folder => {
    const folderPath = path.join(PROJECT_ROOT, folder);
    if (fs.existsSync(folderPath)) {
      console.log(`✅ ${folder}/`);
    } else {
      console.log(`❌ ${folder}/ - AUSENTE`);
      allFoldersExist = false;
    }
  });

  return allFoldersExist;
}

// Função para verificar variáveis de ambiente
function checkEnvironmentConfig() {
  console.log('\n🔧 Verificando configuração de ambiente...');
  
  const envPath = path.join(PROJECT_ROOT, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ Arquivo .env presente');
    
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const requiredVars = ['VITE_API_BASE_URL', 'VITE_APP_NAME'];
      const envLines = envContent.split('\n');
      
      const definedVars = envLines
        .filter(line => line.includes('=') && !line.startsWith('#'))
        .map(line => line.split('=')[0].trim());
      
      const missingVars = requiredVars.filter(varName => !definedVars.includes(varName));
      
      if (missingVars.length === 0) {
        console.log('✅ Variáveis de ambiente essenciais definidas');
        return true;
      } else {
        console.log(`⚠️  Variáveis ausentes (podem ser opcionais): ${missingVars.join(', ')}`);
        return true; // Não bloquear deploy por isso
      }
    } catch (error) {
      console.log(`⚠️  Erro ao ler .env: ${error.message}`);
      return true;
    }
  } else {
    console.log('⚠️  Arquivo .env não encontrado (pode ser opcional)');
    return true;
  }
}

// Função para verificar configurações de build
function checkBuildConfig() {
  console.log('\n⚙️  Verificando configurações de build...');
  
  // Verificar vite.config.ts
  const viteConfigPath = path.join(PROJECT_ROOT, 'vite.config.ts');
  if (fs.existsSync(viteConfigPath)) {
    console.log('✅ vite.config.ts presente');
  } else {
    console.log('❌ vite.config.ts ausente');
    return false;
  }

  // Verificar netlify.toml
  const netlifyConfigPath = path.join(PROJECT_ROOT, 'netlify.toml');
  if (fs.existsSync(netlifyConfigPath)) {
    console.log('✅ netlify.toml presente');
  } else {
    console.log('❌ netlify.toml ausente');
    return false;
  }

  return true;
}

// Função para gerar relatório final
function generateReport(results) {
  console.log('\n📊 RELATÓRIO FINAL DE VALIDAÇÃO');
  console.log('================================');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('🎉 PROJETO PRONTO PARA PRODUÇÃO!');
    console.log('\n✅ Todas as verificações passaram');
    console.log('\n🚀 Próximos passos:');
    console.log('1. npm run build        - Gerar build de produção');
    console.log('2. npm run preview      - Testar build localmente');
    console.log('3. git push             - Fazer deploy automático');
    
    return true;
  } else {
    console.log('⚠️  PROJETO PRECISA DE AJUSTES');
    console.log('\n❌ Verificações falharam:');
    
    Object.entries(results).forEach(([check, passed]) => {
      if (!passed) {
        console.log(`   - ${check}`);
      }
    });
    
    console.log('\n🔧 Corrija os problemas antes do deploy');
    return false;
  }
}

// Função principal
function runValidation() {
  console.log('🔍 Iniciando validação final para produção...\n');

  const results = {
    'Arquivos essenciais': checkEssentialFiles(),
    'package.json': validatePackageJson(),
    'Estrutura de pastas': checkFolderStructure(),
    'Configuração de ambiente': checkEnvironmentConfig(),
    'Configurações de build': checkBuildConfig()
  };

  const isReady = generateReport(results);
  
  process.exit(isReady ? 0 : 1);
}

// Executar se chamado diretamente
if (require.main === module) {
  runValidation();
}

module.exports = { runValidation };

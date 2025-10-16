#!/usr/bin/env node

/**
 * Script para atualizar imports após reorganização da arquitetura
 * Este script atualiza todos os caminhos de import para refletir a nova estrutura feature-based
 */

const fs = require('fs');
const path = require('path');

// Mapeamento de caminhos antigos para novos
const importMappings = {
  // Auth components
  '../components/GoogleAuthButton': '@/core/auth/components/GoogleAuthButton',
  './components/GoogleAuthButton': '@/core/auth/components/GoogleAuthButton',
  '../GoogleAuthButton': '@/core/auth/components/GoogleAuthButton',
  '../components/GoogleOAuthCallback': '@/core/auth/components/GoogleOAuthCallback',
  './components/GoogleOAuthCallback': '@/core/auth/components/GoogleOAuthCallback',
  '../components/AuthDebugger': '@/core/auth/components/AuthDebugger',
  '../components/OAuthErrorHandler': '@/core/auth/components/OAuthErrorHandler',
  
  // Auth services
  '../services/oauth': '@/core/auth/services/oauth',
  './services/oauth': '@/core/auth/services/oauth',
  '../oauth': '@/core/auth/services/oauth',
  
  // Auth context
  '../contexts/AuthContext': '@/core/auth/AuthContext',
  './contexts/AuthContext': '@/core/auth/AuthContext',
  '../AuthContext': '@/core/auth/AuthContext',
  
  // Security guards
  '../components/PremiumGuard': '@/core/security/guards/PremiumGuard',
  './components/PremiumGuard': '@/core/security/guards/PremiumGuard',
  '../guards/': '@/core/security/guards/',
  
  // Performance components
  '../components/OptimizedMemo': '@/core/performance/components/OptimizedMemo',
  '../components/OptimizedSuspense': '@/core/performance/components/OptimizedSuspense',
  '../components/LazyCharts': '@/core/performance/components/LazyCharts',
  
  // Dashboard components
  '../components/DashboardLayout': '@/features/dashboard/components/DashboardLayout',
  './components/DashboardLayout': '@/features/dashboard/components/DashboardLayout',
  '../components/DashboardSidebar': '@/features/dashboard/components/DashboardSidebar',
  
  // Budget components
  '../components/BudgetLayout': '@/features/budget/components/BudgetLayout',
  './components/BudgetLayout': '@/features/budget/components/BudgetLayout',
  
  // Investment components
  '../components/InvestmentLayout': '@/features/investments/components/InvestmentLayout',
  
  // Crypto components
  '../components/CoinGeckoTester': '@/features/crypto/components/CoinGeckoTester',
  '../components/CryptoErrorHandler': '@/features/crypto/components/CryptoErrorHandler',
  
  // Public components
  '../components/CalculadoraOptimizada': '@/features/public/components/CalculadoraOptimizada',
  '../components/NewUserGuidance': '@/features/public/components/NewUserGuidance',
  '../components/Onboarding': '@/features/public/components/Onboarding',
  
  // Shared UI components
  '../components/ui/': '@/shared/components/ui/',
  './components/ui/': '@/shared/components/ui/',
  '../ui/': '@/shared/components/ui/',
  '../components/Button': '@/shared/components/ui/button',
  '../components/Modal': '@/shared/components/ui/dialog',
  '../components/Navigation': '@/shared/components/ui/Navigation',
  '../components/Footer': '@/shared/components/ui/Footer',
  '../components/FinanceLogo': '@/shared/components/ui/FinanceLogo',
  
  // Shared charts
  '../components/charts/': '@/shared/components/charts/',
  './components/charts/': '@/shared/components/charts/',
  '../charts/': '@/shared/components/charts/',
  
  // Shared forms
  '../components/forms/': '@/shared/components/forms/',
  './components/forms/': '@/shared/components/forms/',
  '../forms/': '@/shared/components/forms/',
  
  // Shared tables
  '../components/tables/': '@/shared/components/tables/',
  './components/tables/': '@/shared/components/tables/',
  '../tables/': '@/shared/components/tables/',
  
  // Shared hooks
  '../hooks/': '@/shared/hooks/',
  './hooks/': '@/shared/hooks/',
  
  // Shared utils
  '../utils/': '@/shared/utils/',
  './utils/': '@/shared/utils/',
  
  // Pages mappings
  '../pages/sistema/dashboard/orcamento/': '@/features/budget/pages/orcamento/',
  './pages/sistema/dashboard/orcamento/': '@/features/budget/pages/orcamento/',
  '../pages/orcamento/': '@/features/budget/pages/orcamento/',
  
  '../pages/sistema/dashboard/investimentos/': '@/features/investments/pages/investimentos/',
  './pages/sistema/dashboard/investimentos/': '@/features/investments/pages/investimentos/',
  '../pages/investimentos/': '@/features/investments/pages/investimentos/',
  
  '../pages/sistema/dashboard/cripto/': '@/features/crypto/pages/cripto/',
  './pages/sistema/dashboard/cripto/': '@/features/crypto/pages/cripto/',
  '../pages/cripto/': '@/features/crypto/pages/cripto/',
  
  '../pages/sistema/dashboard/mercado/': '@/features/market/pages/mercado/',
  './pages/sistema/dashboard/mercado/': '@/features/market/pages/mercado/',
  '../pages/mercado/': '@/features/market/pages/mercado/',
  
  '../pages/HomePublicPages/': '@/features/public/pages/HomePublicPages/',
  './pages/HomePublicPages/': '@/features/public/pages/HomePublicPages/',
  
  '../pages/DadosPessoais/': '@/features/profile/pages/DadosPessoais/',
  './pages/DadosPessoais/': '@/features/profile/pages/DadosPessoais/',
  
  '../pages/Pagamento': '@/features/payments/pages/Pagamento',
  './pages/Pagamento': '@/features/payments/pages/Pagamento',
  
  '../pages/ErrosTratamento/': '@/features/errors/pages/ErrosTratamento/',
  './pages/ErrosTratamento/': '@/features/errors/pages/ErrosTratamento/',
  
  // Debug components
  '../components/ConfigDebugger': '@/testing/debug/ConfigDebugger',
  '../components/EnvironmentDebugger': '@/testing/debug/EnvironmentDebugger',
  '../debug/': '@/testing/debug/',
  './debug/': '@/testing/debug/',
};

function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Atualizar imports
    for (const [oldPath, newPath] of Object.entries(importMappings)) {
      const oldImportRegex = new RegExp(`(['"])${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
      if (content.match(oldImportRegex)) {
        content = content.replace(oldImportRegex, `$1${newPath}`);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Atualizado: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

function findTsxFiles(dir) {
  let results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      // Pular pastas de node_modules, .git, dist, build, _archive
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', '_archive'].includes(file)) {
          results = results.concat(findTsxFiles(fullPath));
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Erro ao ler diretório ${dir}:`, error.message);
  }
  
  return results;
}

function main() {
  console.log('🔄 Iniciando atualização de imports...\n');
  
  const projectRoot = process.cwd();
  const clientPath = path.join(projectRoot, 'client');
  
  if (!fs.existsSync(clientPath)) {
    console.error('❌ Pasta client não encontrada!');
    process.exit(1);
  }
  
  const tsxFiles = findTsxFiles(clientPath);
  let updatedCount = 0;
  
  console.log(`📁 Encontrados ${tsxFiles.length} arquivos TypeScript/React\n`);
  
  for (const file of tsxFiles) {
    if (updateImportsInFile(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n🎉 Atualização concluída!`);
  console.log(`📊 ${updatedCount} de ${tsxFiles.length} arquivos foram atualizados`);
  
  if (updatedCount === 0) {
    console.log('ℹ️  Nenhuma atualização necessária ou todos os imports já estão corretos');
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateImportsInFile, findTsxFiles, importMappings };
#!/usr/bin/env node

/**
 * Script de Limpeza para Produção
 * Remove arquivos de desenvolvimento, testes e documentação desnecessária
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

// Lista de arquivos e pastas para remover
const CLEANUP_ITEMS = {
  // Documentos de desenvolvimento
  developmentDocs: [
    'API_CALL_DEBUGGING_FINAL.md',
    'API_KEY_CORRECTION_REPORT.md',
    'BUILD_FIXES_REQUIRED.md',
    'BUNDLE_OPTIMIZATION_REPORT.md',
    'CLEANUP_REPORT.md',
    'CORRECAO_GRAFICO_PIZZA_INVESTIMENTOS.md',
    'CORRECAO_MAPEAMENTO_CAMPOS.md',
    'CORRECOES_API_INVESTIMENTOS.md',
    'ENV_VARIABLES.md',
    'FINAL_OPTIMIZATION_SUMMARY.md',
    'FINAL_SIDEBAR_RESPONSIVE_FIX.md',
    'IMPLEMENTACAO_API_PAGINAS.md',
    'IMPLEMENTACAO_INVESTIMENTOS_API.md',
    'INFO_DIARIA_ANALYSIS.md',
    'INFO_DIARIA_CORRECTIONS.md',
    'INFO_DIARIA_DIAGNOSIS.md',
    'MELHORIAS_INTERFACE_INVESTIMENTOS.md',
    'PAYMENT_PAGE_IMPROVEMENTS.md',
    'PREMIUM_STATUS_UPDATE_FIX.md',
    'PREMIUM_STATUS_UPDATE_FIX_FINAL.md',
    'REDESIGN_GRAFICO_ALOCACAO_MODERNA.md',
    'REDESIGN_GRAFICO_SETORIAL_MODERNO.md',
    'SIDEBAR_FIX_REPORT.md',
    'SIDEBAR_MOBILE_RESPONSIVENESS_FIX.md',
    'STATUS_EMAIL_ONLY_FINAL.md',
    'TRAINING_PREMIUM_RESTRICTION.md',
    'TRAINING_PREMIUM_RESTRICTION_FIX.md',
    'URL_HARDCODE_CORRECTIONS.md',
    'USER_ONBOARDING_SYSTEM_COMPLETE.md'
  ],

  // Arquivos de teste
  testFiles: [
    'test-advanced-codes.html',
    'test-password-recovery.html',
    'nova-api-redefinicao-senha.html',
    'client/scripts/test-email-endpoints.js'
  ],

  // Arquivos antigos/duplicados
  oldFiles: [
    'client/pages/sistema/dashboard/investimentos/cadastro-old.tsx',
    'client/pages/sistema/dashboard/info-diaria-new.tsx',
    'client/pages/sistema/dashboard/info-diaria.tsx.new',
    'translation-updates.ts'
  ],

  // Arquivos de desenvolvimento server-side
  devServerFiles: [
    'vite.config.server.ts',
    'scripts/test-auth.js'
  ],

  // Pasta de documentos de estudo
  studyDocs: [
    'DocumentosEstudo/'
  ]
};

// Função para remover arquivo ou pasta
function removeItem(itemPath) {
  const fullPath = path.join(PROJECT_ROOT, itemPath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Removida pasta: ${itemPath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`✅ Removido arquivo: ${itemPath}`);
      }
    } else {
      console.log(`⚠️  Não encontrado: ${itemPath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao remover ${itemPath}:`, error.message);
  }
}

// Função para criar .gitignore de produção
function createProductionGitignore() {
  const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Production build
/dist
/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Cache
.cache/
.parcel-cache/

# Netlify
.netlify/
`;

  try {
    fs.writeFileSync(path.join(PROJECT_ROOT, '.gitignore'), gitignoreContent);
    console.log('✅ .gitignore atualizado para produção');
  } catch (error) {
    console.error('❌ Erro ao atualizar .gitignore:', error.message);
  }
}

// Função para limpar package.json de dependências desnecessárias
function cleanPackageJson() {
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Remover scripts de desenvolvimento desnecessários
    const devScriptsToRemove = ['test:auth', 'cleanup', 'analyze'];
    devScriptsToRemove.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        delete packageJson.scripts[script];
        console.log(`✅ Removido script: ${script}`);
      }
    });

    // Adicionar script de produção se não existir
    if (!packageJson.scripts.build) {
      packageJson.scripts.build = 'vite build';
    }
    if (!packageJson.scripts.preview) {
      packageJson.scripts.preview = 'vite preview';
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json limpo para produção');
  } catch (error) {
    console.error('❌ Erro ao limpar package.json:', error.message);
  }
}

// Função para criar README de produção
function createProductionReadme() {
  const readmeContent = `# Organizesee - Frontend

## 🚀 Aplicação de Gestão Financeira

Sistema completo de gestão financeira com funcionalidades premium para acompanhamento de investimentos, orçamento pessoal e análises de mercado.

### 📋 Funcionalidades

- **Dashboard Financeiro**: Visão geral completa dos investimentos
- **Gestão de Investimentos**: Cadastro e acompanhamento de carteira
- **Análise de Mercado**: Insights e dados em tempo real (Premium)
- **Orçamento Pessoal**: Controle de receitas e despesas
- **Sistema Premium**: Funcionalidades avançadas para assinantes

### 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI/UX**: Tailwind CSS + shadcn/ui
- **Gerenciamento de Estado**: Context API
- **Autenticação**: JWT + API Keys
- **Internacionalização**: Sistema próprio de traduções

### 🏁 Quick Start

\`\`\`bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
\`\`\`

### 🌐 Deploy

O projeto está configurado para deploy no Netlify com:
- Build automático via Git
- Redirects para SPA
- Headers de segurança
- Otimizações de performance

### 📝 Licença

Proprietary - Todos os direitos reservados

---

**Desenvolvido com ❤️ para Organizesee**
`;

  try {
    fs.writeFileSync(path.join(PROJECT_ROOT, 'README.md'), readmeContent);
    console.log('✅ README.md atualizado para produção');
  } catch (error) {
    console.error('❌ Erro ao criar README.md:', error.message);
  }
}

// Função principal
function runCleanup() {
  console.log('🧹 Iniciando limpeza para produção...\n');

  // Remover documentos de desenvolvimento
  console.log('📝 Removendo documentação de desenvolvimento...');
  CLEANUP_ITEMS.developmentDocs.forEach(removeItem);

  console.log('\n🧪 Removendo arquivos de teste...');
  CLEANUP_ITEMS.testFiles.forEach(removeItem);

  console.log('\n🗑️  Removendo arquivos antigos/duplicados...');
  CLEANUP_ITEMS.oldFiles.forEach(removeItem);

  console.log('\n⚙️  Removendo arquivos de desenvolvimento server...');
  CLEANUP_ITEMS.devServerFiles.forEach(removeItem);

  console.log('\n📚 Removendo documentação de estudo...');
  CLEANUP_ITEMS.studyDocs.forEach(removeItem);

  console.log('\n🔧 Configurando arquivos de produção...');
  createProductionGitignore();
  cleanPackageJson();
  createProductionReadme();

  console.log('\n✨ Limpeza concluída! Projeto pronto para produção.');
  console.log('\n📊 Resumo:');
  console.log(`- ${CLEANUP_ITEMS.developmentDocs.length} documentos de desenvolvimento removidos`);
  console.log(`- ${CLEANUP_ITEMS.testFiles.length} arquivos de teste removidos`);
  console.log(`- ${CLEANUP_ITEMS.oldFiles.length} arquivos antigos removidos`);
  console.log('- Arquivos de configuração otimizados');
  console.log('\n🚀 Execute "npm run build" para gerar a build de produção.');
}

// Executar se chamado diretamente
if (require.main === module) {
  runCleanup();
}

module.exports = { runCleanup };

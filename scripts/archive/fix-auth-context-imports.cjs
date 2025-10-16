const fs = require('fs');
const path = require('path');

// Lista de arquivos que precisam ser corrigidos
const filesToFix = [
  'features/budget/pages/orcamento/custos.tsx',
  'core/auth/components/DirectGoogleAuthButton.tsx',
  'features/budget/pages/orcamento/dividas.tsx',
  'features/budget/pages/orcamento/entradas.tsx',
  'core/auth/components/GoogleAuthButton.tsx',
  'core/auth/components/GoogleAuthButtonUltimate.tsx',
  'features/public/pages/HomePublicPages/Login.tsx',
  'features/budget/pages/orcamento/metas.tsx',
  'features/public/pages/HomePublicPages/PublicMarket.tsx',
  'features/public/pages/HomePublicPages/Signup.tsx',
  'features/dashboard/pages/suporte.tsx'
];

console.log('🔄 Corrigindo imports malformados de AuthContext...');

const clientDir = path.join(__dirname, '..', 'client');
let updatedCount = 0;

filesToFix.forEach(relativeFilePath => {
  const filePath = path.join(clientDir, relativeFilePath);
  
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Corrigir import malformado de AuthContext
      content = content.replace(/from\s+['"][^'"]*contextsAuthContext['"];?/g, 'from "@/core/auth/AuthContext";');
      content = content.replace(/contextsAuthContext/g, '@/core/auth/AuthContext');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        updatedCount++;
        console.log(`✅ Corrigido: ${relativeFilePath}`);
      }
    } else {
      console.log(`⚠️  Arquivo não encontrado: ${relativeFilePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${relativeFilePath}:`, error.message);
  }
});

console.log(`\n🎉 Correção de AuthContext concluída!`);
console.log(`📊 ${updatedCount} arquivos foram corrigidos`);

if (updatedCount === 0) {
  console.log('ℹ️  Nenhuma correção necessária');
}
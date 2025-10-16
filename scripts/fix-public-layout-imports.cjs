const fs = require('fs');
const path = require('path');

console.log('🔄 Corrigindo imports de PublicLayout...');

const clientDir = path.join(__dirname, '..', 'client');
const publicPagesDir = path.join(clientDir, 'features', 'public', 'pages', 'HomePublicPages');

// Lista de arquivos que precisam ser corrigidos
const filesToFix = [
  'About.tsx',
  'CriptoMarket.tsx', 
  'Demo.tsx',
  'Home.tsx',
  'Market.tsx',
  'Privacy.tsx',
  'PrivacyPolicy.tsx'
];

// Também incluir o arquivo na subpasta Documents
const documentsFile = path.join(publicPagesDir, 'Documents', 'Whitepaper.tsx');

let updatedCount = 0;

// Corrigir arquivos na pasta principal
filesToFix.forEach(fileName => {
  const filePath = path.join(publicPagesDir, fileName);
  
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Corrigir import de PublicLayout
      content = content.replace(/@\/components\/PublicLayout/g, '@/features/public/components/PublicLayout');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        updatedCount++;
        console.log(`✅ Corrigido: ${fileName}`);
      }
    } else {
      console.log(`⚠️  Arquivo não encontrado: ${fileName}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${fileName}:`, error.message);
  }
});

// Corrigir arquivo na subpasta Documents
try {
  if (fs.existsSync(documentsFile)) {
    let content = fs.readFileSync(documentsFile, 'utf8');
    let originalContent = content;
    
    // Corrigir import de PublicLayout
    content = content.replace(/@\/components\/PublicLayout/g, '@/features/public/components/PublicLayout');
    
    if (content !== originalContent) {
      fs.writeFileSync(documentsFile, content, 'utf8');
      updatedCount++;
      console.log(`✅ Corrigido: Documents/Whitepaper.tsx`);
    }
  } else {
    console.log(`⚠️  Arquivo não encontrado: Documents/Whitepaper.tsx`);
  }
} catch (error) {
  console.error(`❌ Erro ao processar Documents/Whitepaper.tsx:`, error.message);
}

console.log(`\n🎉 Correção de PublicLayout concluída!`);
console.log(`📊 ${updatedCount} arquivos foram corrigidos`);

if (updatedCount === 0) {
  console.log('ℹ️  Nenhuma correção necessária');
}
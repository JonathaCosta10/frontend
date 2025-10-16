const fs = require('fs');
const path = require('path');

// Função para encontrar todos os arquivos .tsx e .ts
function findAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Pular certas pastas
      if (!['node_modules', '.git', 'dist', 'build', '_archive'].includes(file)) {
        findAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

console.log('🔄 Corrigindo imports malformados...');

const clientDir = path.join(__dirname, '..', 'client');
const allFiles = findAllFiles(clientDir);

let updatedCount = 0;

allFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Corrigir imports malformados
    content = content.replace(/contextsTranslationContext/g, 'contexts/TranslationContext');
    content = content.replace(/contextsPrivacyContext/g, 'contexts/PrivacyContext');
    content = content.replace(/contextsThemeContext/g, 'contexts/ThemeContext');
    content = content.replace(/contexts\/(\w+)Context'/g, 'contexts/$1Context');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedCount++;
      console.log(`✅ Corrigido: ${path.relative(clientDir, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Correção concluída!`);
console.log(`📊 ${updatedCount} de ${allFiles.length} arquivos foram corrigidos`);

if (updatedCount === 0) {
  console.log('ℹ️  Nenhuma correção necessária');
}
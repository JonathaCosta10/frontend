const fs = require('fs');
const path = require('path');

console.log('🔄 Corrigindo TODOS os imports de investmentService...');

const clientDir = path.join(__dirname, '..', 'client');
let updatedCount = 0;

// Função recursiva para encontrar todos os arquivos
function findAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', '_archive'].includes(file)) {
        findAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const allFiles = findAllFiles(clientDir);

allFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Corrigir import de investmentService
    content = content.replace(/@\/services\/investmentService/g, '@/features/investments/services/investmentService');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedCount++;
      console.log(`✅ Corrigido: ${path.relative(clientDir, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Correção de investmentService concluída!`);
console.log(`📊 ${updatedCount} arquivos foram corrigidos`);

if (updatedCount === 0) {
  console.log('ℹ️  Nenhuma correção necessária');
}
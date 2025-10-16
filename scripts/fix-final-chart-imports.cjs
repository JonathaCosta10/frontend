const fs = require('fs');
const path = require('path');

console.log('🔄 Corrigindo TODOS os imports de charts restantes...');

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
    
    // Corrigir todos os imports de charts
    content = content.replace(/@\/components\/charts\//g, '@/shared/components/charts/');
    
    // Corrigir outros imports de components que podem ter ficado para trás
    content = content.replace(/@\/components\/([^\/]+)/g, '@/shared/components/$1');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedCount++;
      console.log(`✅ Corrigido: ${path.relative(clientDir, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Correção FINAL de charts concluída!`);
console.log(`📊 ${updatedCount} arquivos foram corrigidos`);

if (updatedCount === 0) {
  console.log('ℹ️  Nenhuma correção necessária');
}
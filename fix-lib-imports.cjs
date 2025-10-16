const fs = require('fs');
const path = require('path');

// Função para encontrar todos os arquivos .tsx e .ts
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Função para corrigir imports @/lib
function fixLibImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Corrige imports para lib/utils
    let updatedContent = content.replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]@\/lib\/utils['"];?/g, 
      "import { $1 } from '@/lib/utils';");
    
    // Outras correções de lib
    updatedContent = updatedContent.replace(/from\s+['"]@\/lib\/([^'"]+)['"];?/g, 
      "from '@/lib/$1';");
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Corrigido: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
  return false;
}

// Executar correções
const projectRoot = 'c:\\Users\\Jonat\\OneDrive\\Área de Trabalho\\Organizesee\\AAAAAAAAAAAA\\Nova pasta\\frontend\\client';
const files = findTsFiles(projectRoot);

console.log(`🔍 Encontrados ${files.length} arquivos TypeScript/React`);

let corrected = 0;
files.forEach(file => {
  if (fixLibImports(file)) {
    corrected++;
  }
});

console.log(`\n✅ Processo concluído! ${corrected} arquivos corrigidos.`);
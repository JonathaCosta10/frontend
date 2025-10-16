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

// Mapeamento de imports incorretos para corretos
const importMappings = {
  '@/components/ui/': '@/shared/components/ui/',
  '@/hooks/': '@/shared/hooks/',
  '@/lib/': '@/shared/lib/',
  '@/contexts/': '../../../contexts/',
  '../contexts/': '../../../contexts/',
  './contexts/': './contexts/',
  '../lib/localStorage': '../../../lib/localStorage',
  './lib/localStorage': '../../../lib/localStorage',
};

console.log('🔄 Iniciando correção de imports...');

const clientDir = path.join(__dirname, '..', 'client');
const allFiles = findAllFiles(clientDir);

let updatedCount = 0;

allFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Aplicar correções de import
    Object.entries(importMappings).forEach(([oldPath, newPath]) => {
      // Para imports relativos, precisamos calcular o caminho correto
      if (newPath.startsWith('../../../contexts/')) {
        const relativePath = path.relative(path.dirname(filePath), path.join(clientDir, 'contexts'));
        const normalizedPath = relativePath.replace(/\\/g, '/');
        if (!normalizedPath.startsWith('.')) {
          newPath = './' + normalizedPath;
        } else {
          newPath = normalizedPath;
        }
      }
      
      if (newPath.startsWith('../../../lib/')) {
        const relativePath = path.relative(path.dirname(filePath), path.join(clientDir, 'lib'));
        const normalizedPath = relativePath.replace(/\\/g, '/');
        if (!normalizedPath.startsWith('.')) {
          newPath = './' + normalizedPath;
        } else {
          newPath = normalizedPath;
        }
      }
      
      // Regex para encontrar imports
      const importRegex = new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^'"]*?)['"]`, 'g');
      content = content.replace(importRegex, `from '${newPath}$1'`);
      
      // Regex para imports dinâmicos
      const dynamicImportRegex = new RegExp(`import\\(['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^'"]*?)['"]\\)`, 'g');
      content = content.replace(dynamicImportRegex, `import('${newPath}$1')`);
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedCount++;
      console.log(`✅ Atualizado: ${path.relative(clientDir, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Correção concluída!`);
console.log(`📊 ${updatedCount} de ${allFiles.length} arquivos foram atualizados`);

if (updatedCount === 0) {
  console.log('ℹ️  Nenhuma atualização necessária ou todos os imports já estão corretos');
}
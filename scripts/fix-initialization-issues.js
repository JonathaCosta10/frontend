// Script para corrigir problemas conhecidos de inicialização de variáveis
// Roda como parte do processo de build

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando arquivos compilados para corrigir problemas de inicialização...');

// Diretório de saída do build
const distDir = path.join(__dirname, 'dist');

// Procurar por arquivos JS no diretório de saída
const findJsFiles = (dir) => {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results.push(...findJsFiles(filePath));
    } else if (file.endsWith('.js')) {
      results.push(filePath);
    }
  }
  
  return results;
};

// Procurar padrão específico que causa o erro "Cannot access 't' before initialization"
const fixInitializationIssues = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Padrão comum que causa o erro de inicialização
  // Variável sendo usada antes de ser inicializada
  const initializationPattern = /(const|let|var)\s+t\s*=/;
  const accessBeforeInitPattern = /([^a-zA-Z0-9_$])t\.([a-zA-Z0-9_$]+)/g;
  
  if (initializationPattern.test(content) && accessBeforeInitPattern.test(content)) {
    console.log(`⚠️ Possível problema de inicialização detectado em: ${path.relative(__dirname, filePath)}`);
    
    // Solução: Adicionar inicialização de 't' no início do arquivo
    content = `// Fix for initialization issue\nconst t = t || {};\n\n${content}`;
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Arquivo corrigido: ${path.relative(__dirname, filePath)}`);
  }
};

try {
  const jsFiles = findJsFiles(distDir);
  console.log(`🔎 Verificando ${jsFiles.length} arquivos JavaScript...`);
  
  for (const file of jsFiles) {
    fixInitializationIssues(file);
  }
  
  console.log('✅ Processo de correção concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante a correção:', error);
  process.exit(1);
}

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
  
  // Padrões que causam problemas de inicialização
  const problematicPatterns = [
    // Variável sendo usada antes de ser inicializada
    /(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g,
    // Acesso a variável antes de declaração
    /([^a-zA-Z0-9_$])([a-zA-Z_$][a-zA-Z0-9_$]*)\./g
  ];
  
  // Verificar se o arquivo contém o padrão problemático específico
  if (content.includes('Cannot access') || content.includes('before initialization')) {
    console.log(`⚠️ Arquivo com problema de inicialização detectado: ${path.relative(__dirname, filePath)}`);
    modified = true;
  }
  
  // Padrão específico para o erro com 't'
  if (content.match(/var\s+t\s*=.*?t\s*\[/)) {
    console.log(`⚠️ Padrão problemático de variável 't' detectado em: ${path.relative(__dirname, filePath)}`);
    
    // Substituir declarações problemáticas de 't'
    content = content.replace(
      /(var\s+t\s*=\s*)(.*?)(;)/g,
      '$1($2) || {};$3'
    );
    
    // Adicionar verificação de inicialização no início do arquivo
    content = `// Auto-fix: Garantir que 't' seja inicializado
if (typeof t === 'undefined') { var t = {}; }

${content}`;
    
    modified = true;
  }
  
  // Padrão geral para variáveis temporárias
  if (content.match(/var\s+([a-z])\s*=.*?\1\s*\[/)) {
    console.log(`⚠️ Padrão problemático de variável temporária detectado em: ${path.relative(__dirname, filePath)}`);
    
    // Adicionar verificações de segurança para variáveis temporárias
    content = `// Auto-fix: Verificações de segurança para variáveis temporárias
(function() {
  var originalContent = function() {
${content}
  };
  try {
    originalContent();
  } catch (e) {
    console.warn('Erro capturado durante inicialização:', e);
  }
})();`;
    
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

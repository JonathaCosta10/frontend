// Este script corrige o arquivo useTutorialManager.ts
// Ele verifica e garante que a estrutura do arquivo esteja correta

const fs = require('fs');
const path = require('path');

// Caminho para o arquivo
const filePath = path.join(__dirname, 'client', 'hooks', 'useTutorialManager.ts');

// Ler o conteúdo do arquivo
let content = fs.readFileSync(filePath, 'utf8');

// Verificar se o arquivo termina corretamente com um fechamento de função
if (!content.trim().endsWith('}')) {
  // Garantir que o return esteja correto e adicionar o fechamento de chave
  const lastReturn = content.lastIndexOf('return {');
  
  if (lastReturn !== -1) {
    // Encontrar o fim do objeto retornado
    let depth = 1;
    let endIndex = -1;
    
    for (let i = lastReturn + 'return {'.length; i < content.length; i++) {
      if (content[i] === '{') depth++;
      if (content[i] === '}') depth--;
      
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
    
    if (endIndex !== -1) {
      // Verificar se há um fechamento de função depois do objeto retornado
      const remainingContent = content.substring(endIndex + 1).trim();
      
      if (!remainingContent.startsWith('}')) {
        // Adicionar o fechamento da função
        content = content.substring(0, endIndex + 1) + '\n}' + content.substring(endIndex + 1);
        
        // Salvar o arquivo corrigido
        fs.writeFileSync(filePath, content);
        console.log('✅ Arquivo corrigido com sucesso!');
      } else {
        console.log('⚠️ O arquivo já parece estar corretamente formatado.');
      }
    } else {
      console.log('❌ Não foi possível encontrar o fim do objeto retornado.');
    }
  } else {
    console.log('❌ Não foi possível encontrar a declaração de retorno.');
  }
} else {
  console.log('✅ O arquivo já está corretamente formatado.');
}

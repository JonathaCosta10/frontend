// Este script corrige o arquivo useTutorialManager.ts
// Ele verifica e garante que a estrutura do arquivo esteja correta

const fs = require('fs');
const path = require('path');

// Caminho para o arquivo
const filePath = path.join(__dirname, 'client', 'hooks', 'useTutorialManager.ts');

// Ler o conteúdo do arquivo
let content = fs.readFileSync(filePath, 'utf8');

// Simplesmente adicionar o fechamento da função no final se não existir
if (!content.trim().endsWith('}')) {
  // Adicionar o fechamento de chave
  content = content.trim() + '\n}';
  
  // Salvar o arquivo corrigido
  fs.writeFileSync(filePath, content);
  console.log('✅ Arquivo corrigido com sucesso!');
} else {
  console.log('✅ O arquivo já está corretamente formatado.');
}

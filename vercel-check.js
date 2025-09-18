#!/usr/bin/env node

/**
 * Script de verificação para instalação no Vercel
 */
console.log('📦 Verificando dependências necessárias para o Vercel...');

try {
  // Tentar importar vite para verificar se está instalado
  require.resolve('vite');
  console.log('✅ Vite encontrado!');
} catch (err) {
  console.error('❌ Vite não encontrado! Instalando...');
  // Instalar vite explicitamente
  require('child_process').execSync('npm install vite --no-save', {
    stdio: 'inherit'
  });
}

try {
  // Tentar importar plugin react
  require.resolve('@vitejs/plugin-react');
  console.log('✅ Plugin React encontrado!');
} catch (err) {
  console.error('❌ Plugin React não encontrado! Instalando...');
  // Instalar plugin react explicitamente
  require('child_process').execSync('npm install @vitejs/plugin-react --no-save', {
    stdio: 'inherit'
  });
}

console.log('🚀 Tudo pronto para o build!');

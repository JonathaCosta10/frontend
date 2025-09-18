#!/usr/bin/env node

// Script simples para preparar o ambiente de build no Vercel

console.log('🔧 Preparando ambiente para build no Vercel...');

// Forçar definição de NODE_ENV para produção
process.env.NODE_ENV = 'production';

// Definir variáveis de ambiente para evitar uso de módulos nativos
process.env.ESBUILD_BINARY_PATH = 'false';
process.env.DISABLE_SWC = 'true';
process.env.DISABLE_BABEL = 'true';

console.log('✅ Ambiente preparado para build!');

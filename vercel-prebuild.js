#!/usr/bin/env node

/**
 * Script executado antes do build no ambiente Vercel
 * Configura variáveis de ambiente e dependências necessárias
 */

console.log('🔧 Preparando ambiente para build no Vercel...');

// Forçar definição de NODE_ENV para produção
process.env.NODE_ENV = 'production';

// Definir variáveis de ambiente para evitar uso de módulos nativos
process.env.ESBUILD_BINARY_PATH = 'false';
process.env.DISABLE_SWC = 'true';
process.env.DISABLE_BABEL = 'false'; // Habilitamos Babel pois vamos usá-lo em vez de SWC

// Garantir compatibilidade com React
process.env.VITE_USE_PROD_API = 'true';
process.env.VITE_FORCE_COMMONJS = 'true'; // Forçar CommonJS para módulos problemáticos
process.env.VITE_DEFINE_REACT = 'true'; // Sinalizador para definir React globalmente

console.log('✅ Ambiente preparado para build no Vercel!');

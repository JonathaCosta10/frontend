#!/bin/bash

# Script de build específico para o Vercel
echo "🔧 Iniciando build para Vercel..."

# Limpar cache npm
echo "🧹 Limpando cache npm..."
npm cache clean --force

# Remover node_modules e package-lock.json
echo "🗑️  Removendo node_modules..."
rm -rf node_modules package-lock.json

# Reinstalar dependências
echo "📦 Reinstalando dependências..."
npm install --legacy-peer-deps --no-optional

# Verificar se rollup está instalado corretamente
echo "🔍 Verificando Rollup..."
if [ ! -d "node_modules/rollup" ]; then
    echo "❌ Rollup não encontrado, instalando..."
    npm install rollup --save-dev --legacy-peer-deps
fi

# Build do projeto
echo "🏗️  Fazendo build do projeto..."
npm run build

echo "✅ Build concluído com sucesso!"

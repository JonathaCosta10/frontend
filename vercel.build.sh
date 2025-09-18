#!/bin/bash

# Script de build para Vercel
echo "📦 Iniciando processo de build para Vercel..."

# Garantir que o NPM está usando as últimas versões
npm install -g npm@latest

# Instalar dependências - forçando dependências opcionais
npm install --no-optional=false

# Verificar se Vite está disponível
if ! command -v ./node_modules/.bin/vite &> /dev/null
then
    echo "🔄 Vite não encontrado. Instalando globalmente..."
    npm install -g vite
    npm install vite --no-save
fi

# Executar o build
echo "🚀 Executando build..."
npx vite build --config vite.config.simple.ts

# Verificar resultado
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Erro no build!"
    exit 1
fi

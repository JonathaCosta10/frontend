#!/bin/bash

# Script de Gerenciamento de Ambientes (Unix/Linux/macOS)
# ======================================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Função para copiar arquivo de ambiente
copy_environment_file() {
    local environment=$1
    local source_file="environments/$environment/.env.$environment"
    local target_file=".env"
    
    if [ -f "$source_file" ]; then
        cp "$source_file" "$target_file"
        echo -e "${GREEN}✅ Ambiente $environment configurado!${NC}"
        echo -e "${CYAN}📁 Arquivo $source_file copiado para $target_file${NC}"
    else
        echo -e "${RED}❌ Arquivo $source_file não encontrado!${NC}"
        exit 1
    fi
}

# Função para validar ambiente
validate_environment() {
    local environment=$1
    local valid_environments=("development" "production")
    
    if [[ ! " ${valid_environments[@]} " =~ " ${environment} " ]]; then
        echo -e "${RED}❌ Ambiente inválido: $environment${NC}"
        echo -e "${YELLOW}✅ Ambientes válidos: ${valid_environments[*]}${NC}"
        exit 1
    fi
}

# Função para mostrar status atual
show_environment_status() {
    echo -e "\n${BLUE}🌍 Status dos Ambientes OrganizeSee${NC}"
    echo -e "${BLUE}=================================${NC}"
    
    # Verificar arquivo .env atual
    if [ -f ".env" ]; then
        local current_env=$(grep "VITE_ENV=" .env | cut -d'=' -f2)
        echo -e "${CYAN}📍 Ambiente atual: $current_env${NC}"
    else
        echo -e "${YELLOW}📍 Nenhum ambiente configurado (.env não encontrado)${NC}"
    fi
    
    # Verificar arquivos disponíveis
    echo -e "\n${WHITE}📂 Ambientes disponíveis:${NC}"
    
    if [ -f "environments/dev/.env.development" ]; then
        echo -e "  ${GREEN}✅ Development (localhost)${NC}"
    else
        echo -e "  ${RED}❌ Development (não configurado)${NC}"
    fi
    
    if [ -f "environments/prod/.env.production" ]; then
        echo -e "  ${GREEN}✅ Production (organizesee.com.br)${NC}"
    else
        echo -e "  ${RED}❌ Production (não configurado)${NC}"
    fi
    
    echo -e "\n${WHITE}💡 Como usar:${NC}"
    echo -e "  ${GRAY}./scripts/set-environment.sh development  # Para desenvolvimento local${NC}"
    echo -e "  ${GRAY}./scripts/set-environment.sh production   # Para produção${NC}"
    echo ""
}

# Verificar se foi passado um parâmetro
if [ $# -eq 0 ]; then
    show_environment_status
    exit 0
fi

environment=$(echo "$1" | tr '[:upper:]' '[:lower:]')

# Validar ambiente
validate_environment "$environment"

# Mostrar configuração atual
echo -e "\n${BLUE}🔧 Configurando ambiente: $environment${NC}"

# Copiar arquivo de ambiente
copy_environment_file "$environment"

# Mostrar próximos passos
echo -e "\n${YELLOW}🚀 Próximos passos:${NC}"
if [ "$environment" = "development" ]; then
    echo -e "  ${WHITE}1. npm run dev    # Iniciar servidor de desenvolvimento${NC}"
    echo -e "  ${WHITE}2. Acessar: http://localhost:5173${NC}"
else
    echo -e "  ${WHITE}1. npm run build  # Gerar build de produção${NC}"
    echo -e "  ${WHITE}2. npm run preview # Testar build localmente${NC}"
fi

echo -e "\n${GREEN}✨ Ambiente $environment configurado com sucesso!${NC}"

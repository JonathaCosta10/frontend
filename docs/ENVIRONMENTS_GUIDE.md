# Sistema de Gerenciamento de Ambientes - OrganizeSee Frontend

## 📋 Visão Geral

Este documento descreve o sistema completo de gerenciamento de ambientes implementado para separar as configurações de **desenvolvimento (localhost)** e **produção (organizesee.com.br)** no projeto OrganizeSee.

## 🏗️ Estrutura do Sistema

### Diretórios Criados

```
environments/
├── config.ts              # Configurador central
├── dev/
│   └── .env.development   # Configurações de desenvolvimento
└── prod/
    └── .env.production    # Configurações de produção

scripts/
├── set-environment.ps1    # Script PowerShell para Windows
└── set-environment.sh     # Script Bash para Unix/Linux/macOS
```

### Arquivos Atualizados

- `package.json` - Novos scripts npm para gerenciar ambientes
- `client/config/development.ts` - Sistema integrado com configurador central

## 🔧 Como Usar

### 1. Scripts NPM (Recomendado)

```bash
# Ver status atual dos ambientes
npm run env

# Configurar ambiente de desenvolvimento
npm run env:dev

# Configurar ambiente de produção
npm run env:prod

# Desenvolvimento completo (configurar + executar)
npm run dev:local

# Build de produção (configurar + build)
npm run build:prod
```

### 2. Scripts Diretos

#### Windows (PowerShell)
```powershell
# Ver status
.\scripts\set-environment.ps1

# Configurar desenvolvimento
.\scripts\set-environment.ps1 development

# Configurar produção
.\scripts\set-environment.ps1 production
```

#### Unix/Linux/macOS (Bash)
```bash
# Ver status
./scripts/set-environment.sh

# Configurar desenvolvimento
./scripts/set-environment.sh development

# Configurar produção
./scripts/set-environment.sh production
```

## ⚙️ Configurações por Ambiente

### Desenvolvimento (localhost)

- **API Base URL**: `http://localhost:5000`
- **Frontend**: `http://localhost:5173`
- **Debug**: Habilitado
- **Console Logs**: Habilitado
- **Mock Data**: Habilitado
- **Hot Reload**: Habilitado
- **Source Maps**: Habilitado
- **Secure Cookies**: Desabilitado
- **HTTPS Only**: Desabilitado

### Produção (organizesee.com.br)

- **API Base URL**: `https://backend.organizesee.com.br`
- **Frontend**: `https://organizesee.com.br`
- **Debug**: Desabilitado
- **Console Logs**: Desabilitado
- **Mock Data**: Desabilitado
- **Hot Reload**: Desabilitado
- **Source Maps**: Desabilitado
- **Secure Cookies**: Habilitado
- **HTTPS Only**: Habilitado
- **Compressão**: Habilitada
- **Cache**: Habilitado

## 🤖 Sistema Inteligente

### Detecção Automática de Ambiente

O sistema detecta automaticamente o ambiente baseado em:

1. **Variáveis de ambiente** (`VITE_ENV`, `NODE_ENV`, `MODE`)
2. **URL do navegador** (localhost vs organizesee.com.br)
3. **Fallback seguro** para produção

### Configurador Central

O arquivo `environments/config.ts` centraliza todas as configurações:

- **Detecção automática** de ambiente
- **Configurações específicas** por ambiente
- **Helpers para URLs** com validação
- **Logging inteligente** baseado no ambiente

### Validação Automática

- Verifica URLs válidas
- Valida configurações obrigatórias
- Alerta sobre configurações incorretas
- Log detalhado em desenvolvimento

## 🔍 API de Configuração

### Importação Principal

```typescript
import { config, UrlBuilder } from '@/environments/config';

// Usar configuração atual
console.log(config.mode); // 'development' ou 'production'
console.log(config.apiBaseUrl); // URL automática baseada no ambiente
```

### Helpers de URL

```typescript
import { UrlBuilder } from '@/environments/config';

// Construir URLs automaticamente
const apiUrl = UrlBuilder.api('/budget/entries');
const authUrl = UrlBuilder.auth('/login');
const backendUrl = UrlBuilder.backend('/health');

// Validar URLs
const isValid = UrlBuilder.validate('https://example.com');
```

### Configuração Modernizada

```typescript
import { 
  isDevelopment, 
  isProduction, 
  secureLog, 
  debugLog, 
  urlHelpers 
} from '@/config/development';

// Logs inteligentes baseados no ambiente
secureLog('Aplicação iniciada');
debugLog('Dados de debug', { userId: 123 });

// URLs automáticas
const apiEndpoint = urlHelpers.api('/users');
```

## 🚀 Fluxo de Trabalho

### Para Desenvolvimento Local

```bash
# 1. Configurar ambiente de desenvolvimento
npm run env:dev

# 2. Iniciar servidor
npm run dev

# Acesso: http://localhost:5173
# API: http://localhost:5000
```

### Para Produção

```bash
# 1. Configurar ambiente de produção
npm run env:prod

# 2. Gerar build
npm run build

# 3. Testar localmente (opcional)
npm run preview

# Deploy: https://organizesee.com.br
# API: https://backend.organizesee.com.br
```

### Para Deploy Automático

```bash
# Build completo com configuração automática
npm run build:prod
```

## ✅ Benefícios

### Organização
- ✅ Separação clara entre dev e produção
- ✅ Configurações centralizadas
- ✅ Fácil alternância entre ambientes

### Segurança
- ✅ URLs específicas por ambiente
- ✅ Configurações de segurança adaptadas
- ✅ Validação automática

### Produtividade
- ✅ Scripts automatizados
- ✅ Detecção inteligente
- ✅ Debug facilitado

### Manutenibilidade
- ✅ Código limpo e organizado
- ✅ Sistema extensível
- ✅ Documentação completa

## 🔧 Customização

### Adicionar Nova Configuração

1. **Editar** `environments/config.ts`
2. **Adicionar** nova propriedade nas interfaces
3. **Definir** valores para dev e prod
4. **Usar** na aplicação

### Adicionar Novo Ambiente

1. **Criar** pasta `environments/staging/`
2. **Adicionar** `.env.staging`
3. **Atualizar** configurador central
4. **Adicionar** scripts

### Customizar Detecção

Editar função `detectEnvironment()` em `environments/config.ts`:

```typescript
export function detectEnvironment(): Environment {
  // Sua lógica personalizada aqui
  if (customCondition) {
    return 'development';
  }
  return 'production';
}
```

## 🐛 Troubleshooting

### Problema: Ambiente não detectado corretamente

**Solução**: Executar script manualmente
```bash
npm run env:dev  # ou npm run env:prod
```

### Problema: URLs incorretas

**Solução**: Verificar arquivo `.env` na raiz do projeto
```bash
# Ver status atual
npm run env

# Reconfigurar
npm run env:dev
```

### Problema: Configurações não carregando

**Solução**: Limpar cache e reiniciar
```bash
# Limpar cache
npm run dev -- --force

# Ou restart completo
Ctrl+C e npm run dev
```

## 📚 Referência Rápida

### Status do Sistema
```bash
npm run env
```

### Ambiente de Desenvolvimento
```bash
npm run env:dev && npm run dev
```

### Ambiente de Produção
```bash
npm run env:prod && npm run build
```

### Validar Configuração
```typescript
import { validateConfiguration } from '@/config/development';
const isValid = validateConfiguration();
```

---

**✨ Sistema implementado com sucesso!** 

O projeto agora tem separação completa entre ambientes de desenvolvimento e produção, com detecção automática, scripts facilitados e configurações centralizadas.

# 🔧 Variáveis de Ambiente - Organizesee Frontend

> **Guia completo para configuração das variáveis de ambiente do projeto Organizesee**

## 📋 Índice

- [Configuração Obrigatória](#-configuração-obrigatória)
- [Configuração de Imagens](#-configuração-de-imagens)
- [Ambientes de Deploy](#-ambientes-de-deploy)
- [Validação e Segurança](#-validação-e-segurança)
- [Arquivos de Referência](#-arquivos-de-referência)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Configuração Obrigatória

### Backend e API

**Estas variáveis são essenciais para o funcionamento da aplicação:**

```bash
# URL do backend Django/FastAPI
VITE_BACKEND_URL=http://127.0.0.1:8000

# Chave de autenticação da API (deve coincidir com o backend)
VITE_API_KEY=organizesee-api-key-2025-secure
```

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `VITE_BACKEND_URL` | ✅ Sim | URL base da API backend | `https://api.organizesee.com` |
| `VITE_API_KEY` | ✅ Sim | Chave de autenticação da API | `organizesee-prod-key-2025` |

### Builder.io (CMS - Opcional)

```bash
# Chave pública do Builder.io para gerenciamento de conteúdo
VITE_PUBLIC_BUILDER_KEY=__BUILDER_PUBLIC_KEY__
```

| Variável | Obrigatória | Descrição | Uso |
|----------|-------------|-----------|-----|
| `VITE_PUBLIC_BUILDER_KEY` | ❌ Não | CMS Builder.io | Conteúdo dinâmico |

---

## 🖼️ Configuração de Imagens

### URLs de Imagens Externas

**Para desenvolvimento e demonstração:**

```bash
# Imagem principal para páginas de demonstração
VITE_DEMO_IMAGE_URL=https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80

# Avatares de usuários para mock data e demonstrações
VITE_AVATAR_IMAGE_1=https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face
VITE_AVATAR_IMAGE_2=https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face
VITE_AVATAR_IMAGE_3=https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face
VITE_AVATAR_IMAGE_4=https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face
```

| Variável | Onde é Usada | Propósito |
|----------|--------------|-----------|
| `VITE_DEMO_IMAGE_URL` | Página Demo | Imagem hero da demonstração |
| `VITE_AVATAR_IMAGE_*` | Dashboard, Mocks | Avatares de usuários fictícios |

---

## 🌐 Ambientes de Deploy

### 🔧 Desenvolvimento (`.env.local`)

```bash
# Desenvolvimento local
VITE_BACKEND_URL=http://127.0.0.1:8000
VITE_API_KEY=organizesee-dev-key-2025-secure
VITE_PUBLIC_BUILDER_KEY=__BUILDER_PUBLIC_KEY__

# URLs de imagem de desenvolvimento (Unsplash)
VITE_DEMO_IMAGE_URL=https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80
VITE_AVATAR_IMAGE_1=https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face
VITE_AVATAR_IMAGE_2=https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face
VITE_AVATAR_IMAGE_3=https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face
VITE_AVATAR_IMAGE_4=https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face
```

### 🧪 Homologação (`.env.staging`)

```bash
# Backend de homologação
VITE_BACKEND_URL=https://staging-api.organizesee.com
VITE_API_KEY=organizesee-staging-key-2025-secure
VITE_PUBLIC_BUILDER_KEY=your-staging-builder-key

# URLs de imagem de homologação
VITE_DEMO_IMAGE_URL=https://staging-cdn.organizesee.com/demo.jpg
VITE_AVATAR_IMAGE_1=https://staging-cdn.organizesee.com/avatar1.jpg
VITE_AVATAR_IMAGE_2=https://staging-cdn.organizesee.com/avatar2.jpg
VITE_AVATAR_IMAGE_3=https://staging-cdn.organizesee.com/avatar3.jpg
VITE_AVATAR_IMAGE_4=https://staging-cdn.organizesee.com/avatar4.jpg
```

### 🚀 Produção (`.env.production`)

```bash
# Backend de produção (HTTPS obrigatório)
VITE_BACKEND_URL=https://api.organizesee.com
VITE_API_KEY=organizesee-prod-key-2025-secure
VITE_PUBLIC_BUILDER_KEY=your-production-builder-key

# URLs de imagens otimizadas para produção (CDN)
VITE_DEMO_IMAGE_URL=https://cdn.organizesee.com/images/demo.webp
VITE_AVATAR_IMAGE_1=https://cdn.organizesee.com/avatars/user1.webp
VITE_AVATAR_IMAGE_2=https://cdn.organizesee.com/avatars/user2.webp
VITE_AVATAR_IMAGE_3=https://cdn.organizesee.com/avatars/user3.webp
VITE_AVATAR_IMAGE_4=https://cdn.organizesee.com/avatars/user4.webp
```

---

## 🔒 Validação e Segurança

### Validações Automáticas

O sistema valida automaticamente as configurações:

| Validação | Ambiente | Descrição |
|-----------|----------|-----------|
| ✅ **HTTPS** | Produção | `VITE_BACKEND_URL` deve usar HTTPS |
| ✅ **API Key** | Produção | Não deve usar valor padrão |
| ✅ **URLs válidas** | Todos | Formato correto das URLs |
| ✅ **Carregamento** | Inicialização | Configurações carregadas corretamente |

### ⚠️ Regras de Segurança

#### Obrigatórias:
- **Nunca** commitar valores reais de produção no git
- **Sempre** usar HTTPS em produção
- **Rotacionar** API keys periodicamente
- **Validar** URLs antes de usar

#### Recomendadas:
- Use GitHub Secrets ou similar para CI/CD
- Monitore uso das APIs externas
- Configure rate limiting
- Use CDN para assets em produção

### 🔐 Exemplo de .gitignore

```gitignore
# Environment files
.env.local
.env.staging  
.env.production
.env.*.local

# Nunca commitar estes arquivos
*.key
*.secret
.secrets/
```

---

## 📁 Arquivos de Referência

### 🔧 Configuração Principal

| Arquivo | Responsabilidade | Usa Variáveis |
|---------|------------------|---------------|
| `client/config/development.ts` | Config desenvolvimento | ✅ |
| `client/lib/api.ts` | Cliente API principal | ✅ |
| `client/lib/apiUtils.ts` | Utilitários da API | ✅ |
| `client/contexts/AuthContext.tsx` | Autenticação | ✅ |
| `client/lib/apiKeyUtils.ts` | Gerenciamento de chaves | ✅ |

### 🎨 Componentes com Imagens

| Arquivo | Usa Imagens | Variáveis Usadas |
|---------|-------------|------------------|
| `client/pages/HomePublicPages/Demo.tsx` | ✅ | `VITE_DEMO_IMAGE_URL` |
| `client/pages/sistema/dashboard/info-diaria.tsx` | ✅ | `VITE_AVATAR_IMAGE_*` |
| `client/mocks/database.ts` | ✅ | `VITE_AVATAR_IMAGE_*` |

---

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. **API Connection Failed**
```bash
# Verifique se o backend está rodando
curl http://127.0.0.1:8000/health

# Verifique a variável
echo $VITE_BACKEND_URL
```

#### 2. **Imagens Não Carregam**
```bash
# Teste se a URL está acessível
curl -I https://images.unsplash.com/photo-1551288049-bebda4e38f71

# Verifique as variáveis de imagem
echo $VITE_DEMO_IMAGE_URL
```

#### 3. **Variáveis Não Reconhecidas**
```bash
# Reinicie o servidor de desenvolvimento
npm run dev

# Verifique se está usando prefixo VITE_
# ❌ Errado: API_KEY=123
# ✅ Correto: VITE_API_KEY=123
```

### Comandos de Debug

```bash
# Verificar todas as variáveis VITE_
env | grep VITE_

# Testar build
npm run build

# Verificar conexão com backend
npm run test:api
```

### � Suporte

Se os problemas persistirem:

1. **Verifique** se todas as variáveis obrigatórias estão definidas
2. **Confirme** que o backend está acessível
3. **Teste** as URLs de imagem manualmente
4. **Consulte** os logs do navegador (F12 → Console)

---

## 📝 Notas da Versão

**Última atualização:** Agosto 2025  
**Versão:** 2.0  
**Compatibilidade:** Vite 6.x, React 18.x

### Changelog

- ✅ **v2.0** - Adicionadas variáveis de imagem e documentação completa
- ✅ **v1.1** - Configurações de ambiente para staging
- ✅ **v1.0** - Configuração inicial com backend e API

---

> 💡 **Dica:** Mantenha este arquivo atualizado sempre que adicionar novas variáveis de ambiente!

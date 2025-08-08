# Relatório de Correções - URLs Hardcode

## Resumo
Foram corrigidas todas as chamadas de API hardcode que não estavam usando a variável de ambiente `VITE_BACKEND_URL` corretamente.

## Variável de Ambiente Configurada
```env
VITE_BACKEND_URL=http://127.0.0.1:8000
```

## Arquivos Corrigidos

### 1. `client/components/AuthDebugger.tsx`
**Problema:** URL hardcode `"http://127.0.0.1:8000/api/auth/token/refresh/"`
**Correção:** Agora usa `BACKEND_URL` da variável de ambiente
```typescript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const response = await fetch(`${BACKEND_URL}/api/auth/token/refresh/`, {
```

### 2. `client/services/api/base.ts`
**Problema:** Usava `process.env.REACT_APP_API_URL` (React)
**Correção:** Mudou para `import.meta.env.VITE_BACKEND_URL` (Vite)
```typescript
baseURL: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000',
```
**Observação:** Também corrigidos conflitos de exportação da interface ApiError

### 3. `client/services/api/entities/economicIndicatorsApi.ts`
**Problema:** URL hardcode `"http://localhost:8000/api"`
**Correção:** Usa variável de ambiente com caminho /api
```typescript
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}/api`;
```

### 4. `client/services/api/entities/financialCalculatorApi.ts`
**Problema:** URL hardcode `"http://localhost:8000/api"`
**Correção:** Usa variável de ambiente com caminho /api
```typescript
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}/api`;
```

### 5. `client/services/api/entities/wishlistApi.ts`
**Problema:** URL hardcode `"http://localhost:8000/api"`
**Correção:** Usa variável de ambiente com caminho /api
```typescript
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}/api`;
```

### 6. `scripts/test-auth.js`
**Problema:** URL hardcode `"http://127.0.0.1:8000"`
**Correção:** Usa variável de ambiente Node.js
```javascript
const baseURL = process.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const apiKey = process.env.VITE_API_KEY || "organizesee-api-key-2025-secure";
```

### 7. `test-password-recovery.html`
**Problema:** URL hardcode `'http://127.0.0.1:8000'`
**Correção:** Usa variável de ambiente do browser
```javascript
const BACKEND_URL = window.ENV?.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
const API_KEY = window.ENV?.VITE_API_KEY || 'organizesee-api-key-2025-secure';
```

## Arquivos Já Corretos (Verificados)
Os seguintes arquivos já estavam usando a variável de ambiente corretamente:

- `client/contexts/Rules.ts` ✅
- `client/contexts/Rotas.ts` ✅
- `client/contexts/AuthContext.tsx` ✅
- `client/config/development.ts` ✅
- `client/lib/api.ts` ✅
- `client/lib/apiUtils.ts` ✅
- Todos os arquivos em `client/services/api/PublicPages/` ✅
- Todos os arquivos em `client/services/api/PrivatePages/` ✅

## Padrão Implementado
Todos os arquivos agora seguem o padrão:
```typescript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
```

## Benefícios das Correções
1. **Flexibilidade:** Agora é possível mudar a URL do backend apenas alterando a variável de ambiente
2. **Ambiente-específico:** Diferentes URLs para desenvolvimento, teste e produção
3. **Manutenibilidade:** Centralização da configuração de URL
4. **Consistência:** Todos os arquivos seguem o mesmo padrão

## Como Alterar a URL do Backend
Para usar uma URL diferente, basta alterar no arquivo `.env`:
```env
VITE_BACKEND_URL=https://sua-api.exemplo.com
```

Ou definir a variável de ambiente no sistema:
```bash
export VITE_BACKEND_URL=https://sua-api.exemplo.com
```

## Status
✅ **Todas as correções aplicadas com sucesso**
✅ **Padrão consistente implementado**
✅ **Sistema pronto para diferentes ambientes**

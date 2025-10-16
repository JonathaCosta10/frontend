# Correções para Problemas de URL na API

## Problema Resolvido: Duplicação na URL do refreshToken

### Sintomas
- A URL de refreshToken estava sendo construída incorretamente como `/services/api/api/auth/token/refresh/`
- Isso causava erros na API como "Chave de API inválida ou ausente" 
- O refreshToken não funcionava, gerando desconexão dos usuários

### Causa Raiz
- O `BACKEND_URL` está configurado como `/services/api` no `vercel.json`
- As rotas em `Rotas.ts` usavam caminhos que começavam com `/api` ou `/auth`
- O método `buildRequestParams` em `Rules.ts` concatenava essas duas partes sem verificação

### Solução Implementada
1. Modificamos a função `buildRequestParams` em `Rules.ts` para detectar e evitar duplicação de URLs
2. Adicionamos lógica específica para tratar o caso do refreshToken
3. Implementamos logs detalhados para facilitar o diagnóstico
4. Criamos um script de teste específico para o refreshToken

### Regras de Construção de URL

Para manter a consistência, todas as URLs são construídas seguindo estas regras:

1. **URLs para API Pública**: 
   - Em dev: `http://127.0.0.1:8000/rota`
   - Em prod: `/services/api/rota`

2. **URLs para Auth**:
   - Em dev: `http://127.0.0.1:8000/auth/...` 
   - Em prod: `/services/api/auth/...`

3. **RefreshToken**:
   - Em dev: `http://127.0.0.1:8000/auth/token/refresh/`
   - Em prod: `/services/api/auth/token/refresh/`

### Configuração em vercel.json

```json
"rewrites": [
  {
    "source": "/services/api/(.*)",
    "destination": "https://restbackend-dc8667cf0950.herokuapp.com/$1"
  },
  {
    "source": "/api/(.*)",
    "destination": "https://restbackend-dc8667cf0950.herokuapp.com/$1"
  }
]
```

### Variáveis de Ambiente

```
VITE_BACKEND_URL="/services/api"
VITE_API_KEY="...chave API..."
```

## Como Testar
Para verificar se as correções estão funcionando:

1. Faça login na aplicação
2. Espere alguns minutos para o token expirar (ou limpe o token local)
3. Realize uma ação que exija autenticação
4. Observe nos logs se o refreshToken está sendo chamado com a URL correta
5. Verifique se o usuário permanece conectado

## Próximos Passos
- Monitorar logs em produção para verificar se o refreshToken funciona corretamente
- Considerar a implementação de um mecanismo de retry para falhas de refreshToken
- Revisar outras APIs para garantir que não haja duplicação de URL

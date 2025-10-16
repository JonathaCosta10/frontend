# Padronização de URLs da API

## Estrutura correta de URLs para backend

O backend está configurado para aceitar requisições em vários formatos de URL para garantir compatibilidade e facilitar a transição. Este documento explica as convenções que devem ser seguidas para garantir que as requisições sejam roteadas corretamente.

## Formato de URL Principal

O formato principal para todas as requisições de API é:

```
/services/api/{endpoint}
```

Por exemplo:
- `/services/api/auth/login/`
- `/services/api/auth/token/refresh/`
- `/services/api/infodaily/`

## URLs Configuradas no Frontend

Para garantir compatibilidade, o frontend deve usar o seguinte padrão em todos os lugares:

1. **Variável de ambiente**:
   ```
   VITE_BACKEND_URL="/services/api"
   ```

2. **Em chamadas diretas**:
   ```typescript
   const url = `${BACKEND_URL}/auth/login/`; // Resulta em: /services/api/auth/login/
   ```

## Implementação das Correções

As seguintes correções foram implementadas para garantir consistência:

1. **Normalização de URLs**: Uma função `normalizeUrl()` foi adicionada ao arquivo `api.ts` para evitar duplicações como `/services/api/api/`.

2. **Correção de endpoints em arquivos chave**:
   - `Rotas.ts`: Atualizado para usar caminhos consistentes
   - `Rules.ts`: Melhorado para evitar duplicação de URLs
   - `api.ts`: Agora usa a função `normalizeUrl` em todas as requisições

3. **Configuração do Vercel**: O arquivo `vercel.json` foi atualizado para redirecionar corretamente as requisições:
   ```json
   "rewrites": [
     {
       "source": "/services/api/(.*)",
       "destination": "https://restbackend-dc8667cf0950.herokuapp.com/$1"
     },
     {
       "source": "/auth/(.*)",
       "destination": "https://restbackend-dc8667cf0950.herokuapp.com/auth/$1"
     }
   ]
   ```

## Testes Recomendados

Para verificar se as correções estão funcionando:

1. **Login**: Teste o login em https://www.organizesee.com.br/login
2. **Refresh Token**: Verifique se o token é renovado automaticamente após expirar
3. **Recuperação de Senha**: Teste o fluxo de recuperação de senha

## Endpoints Compatíveis

O backend suporta várias formas de URL para facilitar a transição:

```
# Endpoints principais
/services/api/auth/login/
/services/api/auth/register/
/services/api/auth/token/refresh/

# Endpoints de compatibilidade
/auth/login/
/auth/register/
/auth/token/refresh/

# Recuperação de senha
/services/api/auth/recuperar-senha/
/services/api/auth/validar-redefinir-senha/
```

## Depuração

Se ocorrerem problemas com as URLs, verifique:

1. Console do navegador para ver as URLs exatas sendo chamadas
2. Logs do servidor para confirmar que as requisições chegam ao backend
3. Verifique se todas as chamadas da API estão usando a função `normalizeUrl`

---

Esta documentação foi criada em 14/08/2025 após a padronização das URLs no frontend.

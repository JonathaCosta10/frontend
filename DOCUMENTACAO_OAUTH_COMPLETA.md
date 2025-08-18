# Documentação Completa de Integração OAuth Google

Este documento fornece uma descrição detalhada da integração entre o frontend React e o backend Django para autenticação via Google OAuth 2.0, incluindo o fluxo completo, requisitos, tratamento de erros e recomendações de segurança.

## 1. Visão Geral do Fluxo OAuth

### 1.1 Diagrama de Sequência

```
┌────────────┐           ┌────────────┐          ┌─────────┐          ┌───────────┐
│  Frontend  │           │  Google    │          │ Backend │          │ Database  │
└─────┬──────┘           └─────┬──────┘          └────┬────┘          └─────┬─────┘
      │                        │                      │                     │
      │                        │                      │                     │
      │  1. Clicar em "Login with Google"            │                     │
      ├───────────────────────>│                      │                     │
      │                        │                      │                     │
      │  2. Tela de autorização Google               │                     │
      │<───────────────────────┤                      │                     │
      │                        │                      │                     │
      │  3. Usuário autoriza   │                      │                     │
      ├───────────────────────>│                      │                     │
      │                        │                      │                     │
      │                        │  4. Redireciona com código                 │
      │                        ├─────────────────────>│                     │
      │                        │                      │                     │
      │                        │                      │  5. Verifica/cria usuário
      │                        │                      ├────────────────────>│
      │                        │                      │                     │
      │                        │                      │<────────────────────┤
      │                        │                      │                     │
      │                        │                      │  6. Gera tokens JWT │
      │                        │                      ├─────────────────────┤
      │                        │                      │                     │
      │                        │                      │<─────────────────────
      │                        │                      │                     │
      │                    7. Redireciona com tokens  │                     │
      │<─────────────────────────────────────────────┤                     │
      │                        │                      │                     │
      │  8. Salva tokens e atualiza UI               │                     │
      │───┐                    │                      │                     │
      │   │                    │                      │                     │
      │<──┘                    │                      │                     │
      │                        │                      │                     │
```

### 1.2 Fluxo Detalhado

1. **Iniciação do Fluxo:**
   - Usuário clica no botão "Login with Google" no frontend
   - Frontend gera um estado único (state) para segurança CSRF
   - Frontend redireciona o usuário para a URL de autenticação do Google

2. **Autorização do Usuário:**
   - Google apresenta tela de autorização para o usuário
   - Usuário concede ou nega permissões

3. **Redirecionamento para Backend:**
   - Google redireciona para a URL de callback no backend com código de autorização
   - Backend recebe o código e o state

4. **Processamento no Backend:**
   - Backend valida o state para prevenir CSRF
   - Backend troca o código por tokens OAuth do Google
   - Backend obtém informações do usuário via API Google

5. **Gerenciamento de Usuário:**
   - Backend verifica se o usuário já existe no sistema
   - Se não existir, cria um novo usuário com as informações do Google
   - Se existir, atualiza o perfil com as informações mais recentes

6. **Geração de Tokens JWT:**
   - Backend gera access_token e refresh_token JWT
   - Backend associa os tokens ao usuário

7. **Retorno para Frontend:**
   - Backend redireciona para o frontend com tokens JWT
   - Frontend recebe e processa os tokens

8. **Finalização:**
   - Frontend armazena tokens de forma segura
   - Frontend atualiza a interface para mostrar o usuário autenticado

## 2. Especificação Técnica

### 2.1 Endpoints Frontend

| Rota | Função | Descrição |
|------|--------|-----------|
| `/login` | Página de login | Apresenta o botão de login com Google |
| `/signup` | Página de cadastro | Apresenta o botão de cadastro com Google |
| `/auth/error` | OAuthErrorHandler | Trata erros no processo de autenticação |

### 2.2 Componentes Frontend

| Componente | Propósito |
|------------|-----------|
| `DirectGoogleAuthButton` | Botão que inicia fluxo de autenticação Google |
| `GoogleOAuthCallbackUltimate` | Processa retorno da autenticação |
| `OAuthErrorHandler` | Exibe e trata erros de autenticação |
| `AuthContext` | Gerencia estado global de autenticação |

### 2.3 Endpoints Backend

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/auth/google/callback` | GET | Recebe código de autorização do Google |
| `/api/auth/token/` | POST | Gera tokens JWT a partir do código OAuth |
| `/api/user/profile/` | GET | Retorna perfil do usuário autenticado |
| `/api/auth/refresh/` | POST | Renova access_token usando refresh_token |
| `/api/auth/logout/` | POST | Revoga tokens de autenticação |

## 3. Parâmetros e Payloads

### 3.1 Requisição de Autenticação Google (Frontend para Google)

```typescript
const params = new URLSearchParams({
  client_id: clientId,
  redirect_uri: 'http://127.0.0.1:8000/auth/google/callback',
  response_type: 'code',
  scope: 'openid email profile',
  state: state,
  access_type: 'offline',
  prompt: 'consent',
  return_to: returnUrl,
  error_callback: `${window.location.origin}/auth/error`,
  client_version: '2.0.1',
  device_id: `${navigator.platform}-${Math.random().toString(36).substring(2, 10)}`.substring(0, 40),
  login_context: context,
  app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  locale: navigator.language
});

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
```

### 3.2 Callback do Google para Backend

```
GET /auth/google/callback?code=[AUTH_CODE]&state=[STATE]
```

### 3.3 Requisição de Token JWT (Frontend para Backend)

```json
// POST /api/auth/token/
{
  "code": "4/0AdQt8qirwPhcEs2uO_vzF7AJi4Au1...",
  "state": "google_auth_abcdefghijk_1629283845",
  "provider": "google",
  "from_callback": true,
  "redirect_uri": "http://127.0.0.1:8000/auth/google/callback"
}
```

### 3.4 Resposta de Token JWT (Backend para Frontend)

```json
// 200 OK
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_verified": true,
    "profile_picture": "https://..."
  }
}
```

### 3.5 Resposta de Erro (Backend para Frontend)

```
GET /auth/error?error=invalid_grant&message=Code%20was%20already%20redeemed
```

## 4. Tratamento de Erros

### 4.1 Códigos de Erro Suportados

| Código | Descrição | Tratamento |
|--------|-----------|------------|
| `expired_code` | Código expirou antes do uso | Retry automático |
| `invalid_grant` | Código já usado ou inválido | Retry automático |
| `access_denied` | Usuário negou permissões | Mostrar mensagem e opção de tentar novamente |
| `server_error` | Erro no servidor | Mostrar mensagem e opção de tentar novamente |
| `invalid_request` | Parâmetros da requisição inválidos | Mostrar erro e link para login |
| `redirect_uri_mismatch` | URI de redirecionamento não coincide | Erro técnico, contatar suporte |
| `unauthorized_client` | Cliente não autorizado | Erro técnico, contatar suporte |
| `invalid_scope` | Escopo solicitado inválido | Retry com escopos reduzidos |

### 4.2 Fluxo de Tratamento de Erros

1. **Frontend detecta erro:**
   - Redireciona para `/auth/error` com parâmetros de erro

2. **OAuthErrorHandler processa o erro:**
   - Identifica o tipo de erro
   - Determina se é recuperável (pode fazer retry)
   - Exibe mensagem apropriada para o usuário

3. **Para erros recuperáveis:**
   - Oferece retry automático ou manual
   - Em caso de retry, reinicia o fluxo de autenticação

4. **Para erros críticos:**
   - Exibe mensagem detalhada
   - Oferece opção de voltar à página de login
   - Registra o erro para análise

### 4.3 Exemplo de Tratamento de Erro de Código Expirado

```typescript
// No componente OAuthErrorHandler
if (errorCode === 'expired_code' && newAuthUrl) {
  // Iniciar countdown para retry automático
  setCountdown(5);
  setTimeout(() => {
    window.location.href = newAuthUrl;
  }, 5000);
}
```

## 5. Requisitos de Segurança

### 5.1 Prevenção de CSRF

1. **Geração de State:**
   - Frontend gera token state aleatório para cada tentativa
   - State é armazenado no localStorage com timestamp

2. **Validação de State:**
   - Backend valida que o state retornado corresponde ao enviado
   - Backend verifica se o state não expirou (max 10 minutos)

### 5.2 Armazenamento Seguro de Tokens

1. **No Frontend:**
   - Tokens JWT armazenados em localStorage (access_token) e localStorage criptografado (refresh_token)
   - Tokens têm expiração limitada (20 minutos para access_token)

2. **No Backend:**
   - Refresh tokens armazenados no banco de dados com hashing
   - Implementação de rotação de refresh tokens

### 5.3 Validação de Tokens

1. **No Frontend:**
   - Verificação da validade do token antes de fazer requisições
   - Uso de refresh automático para tokens expirados

2. **No Backend:**
   - Validação de assinatura JWT
   - Verificação de claims (exp, iat, iss, etc.)
   - Verificação em blacklist para tokens revogados

## 6. Recomendações de Implementação

### 6.1 Frontend

1. **Tratamento de Estado:**
   - Implementar gerenciamento global de estado de autenticação
   - Atualizar UI imediatamente após login/logout

2. **Renovação de Tokens:**
   - Implementar interceptor para renovação automática de tokens expirados
   - Lidar com falhas de renovação redirecionando para login

3. **Feedback ao Usuário:**
   - Mostrar indicadores de carregamento durante autenticação
   - Fornecer mensagens claras em caso de erros

### 6.2 Backend

1. **Validação Rigorosa:**
   - Validar todos os parâmetros recebidos do frontend e do Google
   - Implementar rate limiting para prevenir abuso

2. **Logging e Monitoramento:**
   - Registrar tentativas de autenticação (sucesso e falha)
   - Implementar alertas para padrões suspeitos

3. **Configuração de Ambiente:**
   - Separar configurações por ambiente (dev, staging, prod)
   - Usar variáveis de ambiente para credenciais sensíveis

## 7. Testes Recomendados

### 7.1 Testes de Fluxo Feliz

1. **Login Completo:**
   - Usuário novo fazendo login pela primeira vez
   - Usuário existente fazendo login
   - Verificar se tokens e perfil são salvos corretamente

2. **Persistência:**
   - Recarregar página após login bem-sucedido
   - Verificar se a autenticação persiste

### 7.2 Testes de Fluxo de Erro

1. **Erros do Usuário:**
   - Usuário nega permissões no Google
   - Usuário fecha a janela durante autenticação

2. **Erros Técnicos:**
   - Código expirado
   - State inválido
   - Tokens inválidos ou expirados

3. **Cenários de Segurança:**
   - Tentativa de replay de código de autorização
   - Tentativa de uso de token expirado
   - Tentativa de CSRF

## 8. Logs para Depuração

### 8.1 Frontend

```typescript
// Início da autenticação
console.log("🚀 Iniciando autenticação Google - Método DIRETO...");
console.log("🔗 URL de autenticação:", authUrl);
console.log("🎯 Redirect URI:", redirectUri);
console.log("🔙 Return URL:", returnUrl);
console.log("🔑 State:", state);

// Callback de autenticação
console.log("🎯 Google OAuth Callback (Ultimate):", { 
  code: code ? `${code.substring(0, 10)}...` : null, 
  state, 
  error,
  message: message ? decodeURIComponent(message) : null
});

// Tratamento de erro
console.log("🚨 OAuth Error Handler:", { 
  errorCode, 
  errorMessage: errorMessage ? decodeURIComponent(errorMessage) : null,
  newAuthUrl: newAuthUrl ? decodeURIComponent(newAuthUrl) : null,
  errorDetails: errorDetails ? decodeURIComponent(errorDetails) : null
});
```

### 8.2 Backend

```python
# Callback OAuth
logger.info(f"OAuth callback received - state: {state[:10]}...")
logger.debug(f"Processing OAuth code: {code[:10]}...")

# Erro no processamento
logger.error(f"OAuth error: {error_type} - {error_message}")

# Sucesso na autenticação
logger.info(f"User authenticated: {user.email} (id: {user.id})")
```

## 9. FAQ e Solução de Problemas

### 9.1 Problemas Comuns

1. **"redirect_uri_mismatch"**
   - **Problema:** A URI de redirecionamento não corresponde às URIs configuradas no console do Google.
   - **Solução:** Verificar se a URI no código (`http://127.0.0.1:8000/auth/google/callback`) corresponde exatamente à URI configurada no console Google.

2. **"Invalid parameter value for device_id"**
   - **Problema:** O parâmetro device_id excede o limite de 64 caracteres.
   - **Solução:** Limitar o comprimento do device_id como feito na correção.

3. **"invalid_grant"**
   - **Problema:** O código foi usado mais de uma vez ou expirou.
   - **Solução:** Implementar retry automático ou redirecionar o usuário para iniciar novo fluxo de autenticação.

4. **Tokens não persistem após login**
   - **Problema:** Os tokens JWT não são salvos corretamente no frontend.
   - **Solução:** Verificar o armazenamento no localStorage e o processamento no AuthContext.

### 9.2 Perguntas Frequentes

1. **O que fazer quando o usuário bloqueia cookies de terceiros?**
   - Usar modo popup ou redirecionamento direto
   - Implementar fallback para autenticação sem cookies

2. **Como lidar com usuários sem email verificado no Google?**
   - Verificar is_verified no backend
   - Implementar fluxo de verificação adicional se necessário

3. **Como funciona a renovação de tokens?**
   - Frontend detecta token expirado
   - Usa refresh_token para obter novo access_token
   - Se refresh falhar, redireciona para login

## 10. Regras e Padrões de Integração

### 10.1 Regras do Frontend

1. **Formato do State:**
   - Formato: `google_auth_[random]_[timestamp]`
   - Exemplo: `google_auth_a1b2c3d4e5_1629283845`
   - Armazenamento: localStorage com chave `google_auth_state`

2. **Parâmetros Obrigatórios:**
   - `client_id`: ID do cliente Google
   - `redirect_uri`: URI de callback no backend
   - `response_type`: sempre "code"
   - `scope`: pelo menos "openid email profile"
   - `state`: token único
   - `return_to`: URL de retorno após autenticação
   - `error_callback`: URL para redirecionamento em caso de erro

3. **Tratamento de Callback:**
   - Frontend espera redirecionamento do backend após processamento
   - Frontend deve processar parâmetros na URL (tokens ou erros)
   - Frontend deve atualizar estado global de autenticação

### 10.2 Regras do Backend

1. **Processamento de Callback:**
   - Validar state para prevenir CSRF
   - Trocar código por tokens OAuth
   - Criar/atualizar usuário com informações do Google
   - Gerar tokens JWT (access_token e refresh_token)
   - Redirecionar para frontend com tokens ou erros

2. **Formato de Retorno para Sucesso:**
   - Redirecionamento para URL em `return_to`
   - Parâmetros: `access_token`, `refresh_token`, `user_data` (codificados)

3. **Formato de Retorno para Erro:**
   - Redirecionamento para URL em `error_callback`
   - Parâmetros: `error`, `message`, `new_auth_url` (opcional)

## 11. Conclusão

Esta documentação fornece uma visão abrangente da integração OAuth entre o frontend React e o backend Django. Seguindo estas especificações, a autenticação via Google será robusta, segura e oferecerá uma boa experiência ao usuário, mesmo em cenários de erro.

O sistema foi projetado para ser resiliente, com múltiplos mecanismos de fallback, retry automático para erros recuperáveis e feedback claro para o usuário em todos os estágios do processo.

---

**Data da Documentação:** 17 de agosto de 2025  
**Autores:** GitHub Copilot

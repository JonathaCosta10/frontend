# Implementação da Autenticação Google OAuth

Este documento detalha a implementação da autenticação Google OAuth na aplicação, explicando o fluxo de autenticação, componentes relevantes e como o sistema gerencia o estado de autenticação.

## Visão Geral do Fluxo de Autenticação

O fluxo de autenticação OAuth implementado segue estas etapas:

1. **Início do Login:**
   - Usuário clica no botão "Login com Google"
   - Aplicação redireciona para a página de autenticação do Google

2. **Autenticação no Google:**
   - Usuário autentica-se na plataforma Google
   - Google redireciona para URL de callback da aplicação com código de autorização

3. **Processamento do Callback:**
   - Componente `GoogleOAuthCallback` recebe e processa o código de autorização
   - Backend troca o código por tokens de acesso/refresh
   - Tokens e dados do usuário são armazenados no `localStorage`

4. **Atualização do Estado:**
   - Eventos de autenticação são disparados (`window.CustomEvent` e `eventEmitter`)
   - `AuthContext` detecta eventos e atualiza seu estado
   - Componentes que usam `useAuth()` são atualizados com o novo estado

5. **Redirecionamento:**
   - Usuário é redirecionado para o dashboard ou página solicitada
   - A URL de redirecionamento é capturada do parâmetro `return_to` ou usa `/dashboard` como padrão

## Componentes Principais

### 1. GoogleOAuthCallback

O componente `GoogleOAuthCallback` é responsável por processar o redirecionamento do Google após autenticação bem-sucedida:

- **Localização:** `client/components/GoogleOAuthCallback.tsx`
- **Função:** Troca o código de autorização por tokens JWT e dados do usuário
- **Características:**
  - Processa URLs de callback mesmo com formatos malformados
  - Armazena tokens no localStorage
  - Emite eventos para notificar o sistema sobre a autenticação bem-sucedida
  - Lida com diferentes formatos de hostname (localhost vs 127.0.0.1)

### 2. AuthContext

O contexto `AuthContext` gerencia o estado global de autenticação:

- **Localização:** `client/contexts/AuthContext.tsx`
- **Função:** Centralizar o gerenciamento do estado de autenticação
- **Características:**
  - Fornece hooks `useAuth()` para componentes acessarem o estado de autenticação
  - Escuta eventos de autenticação de várias fontes
  - Implementa revalidação de tokens
  - Gerencia refresh automático de tokens expirados

### 3. ProtectedRoute

O componente `ProtectedRoute` protege rotas que exigem autenticação:

- **Localização:** `client/components/ProtectedRoute.tsx`
- **Função:** Verificar o estado de autenticação antes de renderizar conteúdo protegido
- **Características:**
  - Mostra loader durante verificação de autenticação
  - Implementa verificação em múltiplas camadas
  - Redireciona para login quando necessário
  - Detecta e corrige estados inconsistentes

## Sistema de Eventos

A aplicação utiliza dois sistemas de eventos complementares:

### 1. CustomEvent (Browser)

```javascript
// Emissão
window.dispatchEvent(new CustomEvent('auth:login:success', { 
  detail: { user: userData } 
}));

// Recepção
window.addEventListener('auth:login:success', handleLoginSuccess);
```

### 2. eventEmitter (Custom)

```javascript
// Emissão
eventEmitter.emit('auth:login:success', { user: userData });

// Recepção
eventEmitter.on('auth:login:success', handleEventEmitterLogin);
```

## Armazenamento Local

Os dados de autenticação são gerenciados pelo `localStorageManager`:

- **Localização:** `client/lib/localStorage.ts`
- **Dados Armazenados:**
  - `authToken`: Token de acesso JWT
  - `refreshToken`: Token para renovar a autenticação
  - `userData`: Dados do usuário autenticado
  - `isPaidUser`: Status premium do usuário

Os tokens são criptografados antes de serem armazenados para segurança adicional.

## Revalidação de Autenticação

O sistema implementa revalidação robusta para garantir que o estado de autenticação esteja sempre correto:

1. **Verificação Local:**
   - Verifica a presença de tokens e dados no localStorage
   - Valida a expiração do token JWT

2. **Verificação Remota:**
   - Faz requisição ao endpoint `/api/user/profile`
   - Verifica se o token é aceito pelo backend

3. **Refresh Automático:**
   - Tenta automaticamente renovar tokens expirados
   - Atualiza estado com dados mais recentes do usuário

## Troubleshooting

Para solucionar problemas comuns de autenticação:

1. **Verificar Estado no Console:**
   ```javascript
   const token = localStorage.getItem('authToken');
   const userData = localStorage.getItem('userData');
   console.log({token: !!token, userData: !!userData});
   ```

2. **Forçar Revalidação:**
   ```javascript
   // Disparar evento para solicitar revalidação
   window.dispatchEvent(new CustomEvent('auth:request:revalidation', {
     detail: { source: 'console' }
   }));
   ```

3. **Verificar Eventos:**
   ```javascript
   // Adicionar listener temporário para debug
   window.addEventListener('auth:login:success', e => console.log('Auth event:', e));
   ```

## Considerações de Segurança

A implementação inclui várias medidas de segurança:

- **Criptografia:** Tokens armazenados no localStorage são criptografados
- **Verificação CSRF:** Estado OAuth é validado para evitar ataques CSRF
- **Tokens Expiráveis:** Tokens JWT têm tempo de vida limitado
- **Renovação Segura:** Processo de refresh token implementado de forma segura

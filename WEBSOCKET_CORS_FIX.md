# Solução para erros de WebSocket e CORS no Google OAuth

## Problemas Identificados e Solucionados

### 1. Erro WebSocket para 'ws://localhost:3000/'

```
WebSocket connection to 'ws://localhost:3000/' failed
```

**Causa**: O frontend estava tentando se conectar à porta 3000 para WebSocket, mas o backend estava rodando na porta 8000.

**Solução**:
- Adicionado `VITE_WS_URL=ws://localhost:8000` ao arquivo .env
- Criado novo módulo `wsConfig.ts` que intercepta e redireciona conexões WebSocket
- Essa configuração garante que WebSockets usados para HMR (Hot Module Replacement) e outras funcionalidades funcionem corretamente

### 2. Erro CORS e 403 Forbidden no Google OAuth

```
The fetch of the id assertion endpoint resulted in a network error: ERR_FAILED
Server did not send the correct CORS headers.
[GSI_LOGGER]: FedCM get() rejects with IdentityCredentialError: Error retrieving a token.
```

**Causa**: O Google OAuth estava usando FedCM (Federation Credential Management) que estava resultando em erro 403 Forbidden.

**Soluções**:
- Implementado um mecanismo de fallback para o método tradicional OAuth2 do Google
- Adicionada nova variável de ambiente `VITE_USE_ALTERNATIVE_GOOGLE_AUTH` que permite alternar entre os métodos
- Adicionado detector de erros que automaticamente muda para o método alternativo em caso de falhas
- Corrigido redirecionamento para o endpoint correto do backend (porta 8000 em vez de 3000)

### 3. Problemas de Content Security Policy

**Causa**: CSP restritivo estava bloqueando algumas requisições necessárias para o Google OAuth.

**Solução**:
- Expandida a lista de domínios permitidos no CSP para incluir todos os necessários para o Google OAuth
- Adicionados cabeçalhos CORS adequados às requisições para o backend

## Como usar o fluxo alternativo de autenticação

Se você continuar enfrentando problemas com o Google Identity Services (FedCM), você pode ativar o fluxo OAuth2 alternativo:

1. No arquivo `.env`, mude a configuração:
```
VITE_USE_ALTERNATIVE_GOOGLE_AUTH=true
```

2. Este método usará o fluxo de autenticação OAuth2 padrão do Google que:
   - Redireciona para a página de login do Google
   - Solicita permissões ao usuário
   - Redireciona de volta para o aplicativo com um código de autorização
   - Troca o código por tokens no backend

## Notas sobre WebSockets

O novo módulo `wsConfig.ts` soluciona automaticamente problemas de WebSocket em desenvolvimento redirecionando conexões para a porta correta. Isto ajuda especialmente com:

- Hot Module Replacement (HMR) do Vite
- Comunicação em tempo real com o backend
- Prevenção de erros de conexão no console

Esta solução é aplicada apenas em ambiente de desenvolvimento e não afeta a produção.

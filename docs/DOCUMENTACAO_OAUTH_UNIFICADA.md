# Documentação Unificada • Google OAuth (Frontend + Backend)

Este documento unifica as regras, fluxos, endpoints e tratamentos de erro da integração Google OAuth entre o Frontend (React + Vite) e o Backend (Django). Substitui guias e notas anteriores para evitar duplicidade.

## 1) Visão geral do fluxo

1. Usuário clica em “Entrar com Google”.
2. Frontend gera state único e redireciona para a URL oficial do Google, informando redirect_uri do backend.
3. Google autentica e redireciona para o backend em `/auth/google/callback?code&state`.
4. Backend valida state, troca code por tokens Google, cria/atualiza usuário e emite JWT (access/refresh).
5. Backend redireciona para o Frontend (return_to) ou disponibiliza endpoints para o Frontend consumir tokens/perfil.
6. Frontend salva tokens com segurança e atualiza a UI/logon.

## 2) Regras do Frontend

- Botões de autenticação:
  - Preferenciais: `DirectGoogleAuthButton` (redirect) e `GoogleAuthButtonUltimate` (popup/fallback via GSI), ambos iniciando via endpoint unificado do backend (`/auth/unified/google/signin/`) para garantir paridade de parâmetros.
  - Removidos/obsoletos: callbacks alternativos/antigos não utilizados.
- Início do fluxo (100% server-driven):
  - Frontend SEMPRE chama `GET /auth/unified/google/signin/?login_context={signin|signup}&return_to=<frontend>/dashboard&error_callback=<frontend>/auth/error&device_id=<<=64>&app_version=<ver>&locale=<pt-BR|...>&access_type=offline&prompt=consent&state=<state>`.
  - O backend redireciona para o Google com todos os parâmetros. Não construímos mais a URL Google no frontend.
- Limite do device_id: máximo 64 chars. Implementado: `${navigator.platform}-${random}` truncado para 40.
- Rotas Frontend:
  - `/auth/google/callback` e `/auth/callback` -> `GoogleOAuthCallbackUltimate`.
  - `/auth/error` -> `OAuthErrorHandler` (tratamento de erros e auto-retry quando aplicável).
  - Observação: backend pode expor alias `/auth/unified/google/callback`; o frontend permanece ouvindo em `/auth/google/callback`.
- Armazenamento e sessão:
  - Tokens em localStorage e cookies (quando aplicável); refresh automático pelo contexto de auth.

## 3) Regras do Backend (expectativas do Frontend)

- Endpoints principais:
  - `GET /auth/google/callback`: valida state, troca code por tokens Google, cria/atualiza usuário, emite JWT/define cookies e pode redirecionar.
  - `POST /api/auth/token/`: aceita `{ code, state, provider:"google", from_callback, redirect_uri }` e retorna `{ access_token, refresh_token, user }`.
  - `GET /api/user/profile/`: retorna dados do usuário autenticado (usa Authorization Bearer e/ou cookies).
  - `POST /api/auth/refresh/`: renova access token usando refresh token.
  - `POST /api/auth/logout/`: revoga tokens/sessão.
- Segurança:
  - Validação rigorosa do state (CSRF) e expiração.
  - JWT com expiração curta (ex.: 20 minutos) e refresh tokens com rotação e blacklist.
  - CORS liberando o domínio do Frontend.

## 4) Tratamento de erros

- Códigos comuns suportados no Frontend (`OAuthErrorHandler`):
  - expired_code, invalid_grant (retry automático quando possível).
  - access_denied, invalid_request, redirect_uri_mismatch, unauthorized_client, invalid_scope, server_error.
- Comportamento:
  - Erros recuperáveis: countdown e retry automático/ação de tentar novamente.
  - Erros críticos: mensagem clara, voltar ao login, logging/telemetria opcional (gtag).
  - Backend pode incluir `new_auth_url` para retry guiado.

## 5) Checklists essenciais

Frontend (.env):
- [x] `VITE_GOOGLE_CLIENT_ID` definido.
- [x] `VITE_GOOGLE_UX_MODE=popup` (fallback via GSI) e flags auxiliares.
- [x] `VITE_BACKEND_URL=http://127.0.0.1:8000` (dev) e uso de 127.0.0.1 em vez de localhost.

Frontend (rotas e componentes):
- [x] `DirectGoogleAuthButton` em Login/Signup.
- [x] `OAuthErrorHandler` mapeado em `/auth/error`.
- [x] `GoogleOAuthCallbackUltimate` mapeado em `/auth/google/callback`.
- [x] `device_id` limitado (<= 40 chars implementado).

Backend (Django):
- [x] `GOOGLE_CLIENT_ID/SECRET`, `FRONTEND_URL`, CORS e JWT configurados.
- [x] Callback `/auth/google/callback` implementado e seguro.
- [x] Troca de code por tokens, criação/associação de usuário e emissão de JWT.
- [x] Redirecionamentos e respostas de erro padronizados.

## 6) Exemplos de payloads

Autenticação Google (Frontend -> Google):
```
GET https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=http://127.0.0.1:8000/auth/google/callback&response_type=code&scope=openid%20email%20profile&state=...&access_type=offline&prompt=consent&return_to=https://app.../dashboard&error_callback=https://app.../auth/error&device_id=WIN-abc12345&login_context=signin&app_version=1.0.0&locale=pt-BR
```

Troca por JWT (Frontend -> Backend):
```json
{
  "code": "4/0AdQt8q...",
  "state": "google_auth_xxx_173447...",
  "provider": "google",
  "from_callback": true,
  "redirect_uri": "http://127.0.0.1:8000/auth/google/callback"
}
```

Resposta de sucesso (Backend -> Frontend):
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "user": { "id": 1, "email": "user@example.com", "first_name": "...", "is_verified": true }
}
```

Erro (Backend -> Frontend -> rota `/auth/error`):
```
/auth/error?error=invalid_grant&message=Code%20already%20redeemed&new_auth_url=...&login_context=signin&device_id=...&app_version=...&locale=pt-BR
```

## 7) Segurança e boas práticas

- Sempre usar 127.0.0.1 no dev (alinhado com registros no Google Cloud).
- Validar state e expiração no backend; gerar state único no frontend.
- JWT curtos + refresh tokens com rotação/blacklist.
- Telemetria opcional de erros (gtag) e logs claros nos dois lados.

## 8) Estados de implementação

- Frontend: implementado e validado (build OK). `device_id` corrigido.
- Backend: checklist de verificação concluído (vide relatório no backend).

---

Documento unificado que substitui: GOOGLE_OAUTH_FIX.md, GOOGLE_OAUTH_TROUBLESHOOTING.md, GOOGLE_OAUTH_IMPROVEMENTS.md, GOOGLE_OAUTH_IMPLEMENTATION_GUIDE.md, OAUTH_INTEGRATION_GUIDE.md, OAUTH_BACKEND_REQUIREMENTS.md e VERIFICACAO_OAUTH_FRONTEND.md.

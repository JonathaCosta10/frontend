# Correção de Autenticação - Token Malformado

## Problema
Tokens de autenticação estavam sendo rejeitados pelo backend com o erro:
```
"message": "Token malformado: faltam campos session_id, device_fingerprint"
```

Este erro estava ocorrendo em várias chamadas de API, incluindo:
- `http://127.0.0.1:5000/api/distribuicao_gastos`
- `http://127.0.0.1:5000/api/user/profile/`
- `http://127.0.0.1:5000/api/dadospessoais/`
- `http://127.0.0.1:5000/auth/logout/`

## Análise
O backend exige que todas as requisições autenticadas incluam `session_id` e `device_fingerprint` como parte da validação do token. Esses dados são fornecidos na resposta de autenticação dentro de um objeto `session`, porém não estavam sendo armazenados e enviados corretamente nas requisições subsequentes.

## Nova Estrutura de Resposta do Backend
```json
{
  "success": true,
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "id": 1,
    "username": "Jonatha",
    "email": "jonatha.costa.oliveira@gmail.com"
  },
  "session": {
    "session_id": "sess_a1b2c3d4e5f6",
    "device_fingerprint": "dev_9a8b7c6d5e4f"
  },
  "auth_type": "google_login"
}
```

## Soluções Implementadas

### 1. Captura de Dados de Sessão (AuthCallback.tsx)
- Implementada captura e armazenamento dos campos `session_id` e `device_fingerprint` do objeto `session` na resposta de autenticação.
- Adicionados logs detalhados para diagnóstico.
- Criado um alerta para caso os dados de sessão não estejam presentes na resposta.

### 2. Inclusão dos Dados em Cabeçalhos HTTP (api.ts)
- Modificado o método `buildHeaders` para incluir os dados de sessão em todas as requisições autenticadas.
- Adicionados os cabeçalhos:
  - `X-Session-ID` com o valor do `session_id`
  - `X-Device-Fingerprint` com o valor do `device_fingerprint`
- Implementada lógica para extrair esses valores mesmo quando armazenados em formatos diferentes.

### 3. Inclusão dos Dados no Refresh Token (api.ts)
- Atualizada a lógica do refresh de token para incluir os dados de sessão no corpo da requisição:
  ```json
  {
    "refresh": "token_de_refresh",
    "session_id": "sess_a1b2c3d4e5f6",
    "device_fingerprint": "dev_9a8b7c6d5e4f"
  }
  ```
- Garantido que esses dados sejam enviados em todas as tentativas de refresh, nos três endpoints disponíveis.

### 4. Melhorias no Armazenamento e Recuperação (localStorage.ts)
- Aprimorados os métodos `setSessionId` e `getSessionId` para lidar com diferentes formatos de dados.
- Aprimorados os métodos `setDeviceFingerprint` e `getDeviceFingerprint` para normalização de valores.
- Implementado sistema de backup para garantir que esses dados críticos estejam sempre disponíveis.
- Adicionada lógica de recuperação em caso de falhas.

## Como Testar
1. Fazer login via Google OAuth
2. Verificar no console do navegador se os dados de sessão foram armazenados corretamente
3. Monitorar as chamadas de API no DevTools > Network para confirmar que:
   - Os headers `X-Session-ID` e `X-Device-Fingerprint` estão presentes
   - As chamadas para endpoints autenticados retornam com sucesso (código 200)
   - O endpoint de refresh de token inclui os dados de sessão no corpo da requisição

## Logs para Diagnóstico
Adicionados vários logs detalhados que ajudarão a identificar problemas relacionados aos dados de sessão:
- Logs de armazenamento dos dados de sessão no callback de autenticação
- Logs de inclusão dos dados nos headers das requisições
- Logs detalhados durante o processo de refresh do token
- Alertas quando os dados de sessão não são encontrados

Esta implementação deve resolver o problema de "Token malformado" garantindo que todas as requisições incluam os dados de sessão necessários para validação pelo backend.

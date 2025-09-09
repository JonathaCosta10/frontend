# 🔧 Configurações URGENTES do Backend para Corrigir

## ❗ PROBLEMA IDENTIFICADO
O backend está recusando requisições porque `restbackend-dc8667cf0950.herokuapp.com` não está em `ALLOWED_HOSTS`.

**Logs mostram:**
```
DisallowedHost: Invalid HTTP_HOST header: 'restbackend-dc8667cf0950.herokuapp.com'. You may need to add 'restbackend-dc8667cf0950.herokuapp.com' to ALLOWED_HOSTS.
```

## 🚨 CORREÇÃO IMEDIATA NO BACKEND

### 1. Atualizar ALLOWED_HOSTS no settings.py

**SUBSTITUIR:**
```python
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='127.0.0.1,localhost,organizesee.com.br,front-teal-beta-95.vercel.app,restbackend.herokuapp.com,organizeseefrontend-git-versa-011530-jonathas-projects-1a4227bc.vercel.app/home', cast=Csv())
```

**POR:**
```python
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='127.0.0.1,localhost,organizesee.com.br,www.organizesee.com.br,front-teal-beta-95.vercel.app,restbackend-dc8667cf0950.herokuapp.com,organizeseefrontend-git-versa-011530-jonathas-projects-1a4227bc.vercel.app', cast=Csv())
```

### 2. Atualizar CORS_ALLOWED_ORIGINS

**SUBSTITUIR:**
```python
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,https://organizesee.com.br,https://front-teal-beta-95.vercel.app',
    cast=Csv()
)
```

**POR:**
```python
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,https://organizesee.com.br,https://www.organizesee.com.br,https://front-teal-beta-95.vercel.app',
    cast=Csv()
)
```

## � COMANDOS VIA HEROKU CLI (ALTERNATIVA RÁPIDA)

Se você não conseguir editar o código agora, use estes comandos:

```bash
# Atualizar ALLOWED_HOSTS via CLI
heroku config:set ALLOWED_HOSTS="127.0.0.1,localhost,organizesee.com.br,www.organizesee.com.br,front-teal-beta-95.vercel.app,restbackend-dc8667cf0950.herokuapp.com,organizeseefrontend-git-versa-011530-jonathas-projects-1a4227bc.vercel.app" --app restbackend-dc8667cf0950

# Atualizar CORS_ALLOWED_ORIGINS via CLI  
heroku config:set CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,https://organizesee.com.br,https://www.organizesee.com.br,https://front-teal-beta-95.vercel.app" --app restbackend-dc8667cf0950

# Restart do Heroku
heroku restart --app restbackend-dc8667cf0950
```

## ✅ TESTE APÓS CORREÇÃO

Depois de aplicar as correções, teste:

```bash
# Teste direto no backend
curl -H "Origin: https://www.organizesee.com.br" \
     -H "x-api-key: }$gQ7TlDEhJ88np]^n8[uFu{9f#;+8qjZ&?c[+Sj_CLhMO[Z(iM_)ZnW]j2M]+j+" \
     "https://restbackend-dc8667cf0950.herokuapp.com/auth/register/"

# Teste via proxy do Vercel
curl "https://organizesee.com.br/api/auth/register/"
```

## 📋 RESUMO DAS MUDANÇAS

1. ✅ **Frontend**: URLs corrigidas (removido `/api` duplicado)
2. ⏳ **Backend**: ALLOWED_HOSTS precisa incluir `restbackend-dc8667cf0950.herokuapp.com`
3. ⏳ **Backend**: CORS_ALLOWED_ORIGINS precisa incluir `https://www.organizesee.com.br`

## 🎯 RESULTADO ESPERADO

Após a correção, as requisições devem fluir assim:

```
Frontend: organizesee.com.br/auth/register/
    ↓ (Vercel proxy)
Backend: restbackend-dc8667cf0950.herokuapp.com/auth/register/ ✅
```

**URGENTE**: A correção do backend é crítica para o funcionamento do login/registro!

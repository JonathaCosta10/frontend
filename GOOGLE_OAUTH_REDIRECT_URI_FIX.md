Google OAuth redirect_uri_mismatch — How to fix

Checklist (do these exactly)

1) Choose ONE host and path and use it everywhere (backend + Google Console)
   - Recommended for local dev:
     - Authorized JavaScript origins: http://localhost:3000
     - Authorized redirect URIs: 
       - http://localhost:3000/auth/callback
       - http://localhost:3000/auth/google/callback
   - If you prefer 127.0.0.1, then use it consistently everywhere.
   
   ⚠️ IMPORTANTE: Remova entradas incorretas como "http://localhost:3000/auth/callbackflowName=GeneralOAuthFlow"
   O parâmetro flowName deve ser passado como query param, não como parte do caminho.

2) Update Google Cloud Console (OAuth 2.0 Client)
   - Go to APIs & Services > Credentials > Your OAuth client.
   - In Authorized JavaScript origins, keep only: http://localhost:3000 (or http://127.0.0.1:3000 if you chose that).
   - In Authorized redirect URIs, add exactly the redirect(s) you use. No query params, no suffixes. Example:
     - http://localhost:3000/auth/callback
   - Remove malformed entries (like …/auth/callbackflowName=GeneralOAuthFlow).

3) Ensure backend uses the same redirect_uri
   - Your backend unified signin should pass redirect_uri that matches exactly one entry in Google Console.
   - If logs show http://localhost:3000/auth/callback, then keep Google Console aligned to that value.
   - Avoid mixing 127.0.0.1 and localhost.

4) Frontend routes are ready
   - App routes already include /auth/callback and /auth/google/callback.
   - Our flows are 100% server-driven; frontend doesn’t send redirect_uri to Google directly.

5) Clear caches and retry
   - Sign out; close popups; clear site data for localhost:3000; retry login.

Notes
- If you deploy, add the exact production URLs (https origins) to Authorized origins and redirect URIs, and ensure the backend uses those in production.
- For multi-environment: keep separate OAuth clients (one for dev, one for prod) to avoid cross-env conflicts.

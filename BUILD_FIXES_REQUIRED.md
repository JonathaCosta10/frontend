## CORREÇÕES NECESSÁRIAS PARA COMPILAÇÃO

### Arquivo: client/pages/sistema/dashboard/configuracoes.tsx

**PROBLEMA**: O arquivo tem referências a SMS que precisam ser removidas para o build funcionar.

**CORREÇÕES NECESSÁRIAS**:

1. **Remover import Smartphone:**
   ```typescript
   // LINHA ~21 - Remover:
   Smartphone,
   
   // Manter apenas:
   Mail,
   ```

2. **Atualizar twoFactorStatus (linha ~65):**
   ```typescript
   // TROCAR:
   const [twoFactorStatus, setTwoFactorStatus] = useState({
     email: false,
     sms: true,
     app: false,
   });
   
   // POR:
   const [twoFactorStatus, setTwoFactorStatus] = useState({
     email: true,
     app: false,
   });
   ```

3. **Atualizar UI do 2FA (linha ~416):**
   ```typescript
   // TROCAR todas as ocorrências:
   twoFactorStatus.sms → twoFactorStatus.email
   <Smartphone /> → <Mail />
   t('2fa_by_sms') → t('2fa_by_email')
   ```

### Arquivo: client/pages/DadosPessoais/Configuracoes.tsx

**MESMO PROBLEMA** - Aplicar correções similares.

### SOLUÇÃO RÁPIDA:

Execute as correções manuais nos arquivos ou use o seguinte comando para aplicar via PowerShell:

```powershell
# Substitui SMS por email nas referências principais
(Get-Content "client\pages\sistema\dashboard\configuracoes.tsx") -replace 'twoFactorStatus\.sms', 'twoFactorStatus.email' -replace 'Smartphone', 'Mail' -replace '2fa_by_sms', '2fa_by_email' | Set-Content "client\pages\sistema\dashboard\configuracoes.tsx"
```

**APÓS AS CORREÇÕES**: Execute `npm run build` novamente.

# OrganizeSee Environment Manager
# ==============================

param([string]$Environment)

function Show-Status {
    Write-Host "`n🌍 Status dos Ambientes OrganizeSee" -ForegroundColor Blue
    Write-Host "=================================" -ForegroundColor Blue
    
    if (Test-Path ".env") {
        $CurrentEnv = Get-Content ".env" | Select-String "VITE_ENV=" | ForEach-Object { $_.ToString().Split('=')[1] }
        if ($CurrentEnv) {
            Write-Host "📍 Ambiente atual: $CurrentEnv" -ForegroundColor Cyan
        } else {
            Write-Host "📍 Arquivo .env existe mas VITE_ENV não definido" -ForegroundColor Yellow
        }
    } else {
        Write-Host "📍 Nenhum ambiente configurado (.env não encontrado)" -ForegroundColor Yellow
    }
    
    Write-Host "`n📂 Ambientes disponíveis:" -ForegroundColor White
    
    if (Test-Path "environments\dev\.env.development") {
        Write-Host "  ✅ Development (localhost)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Development (não configurado)" -ForegroundColor Red
    }
    
    if (Test-Path "environments\prod\.env.production") {
        Write-Host "  ✅ Production (organizesee.com.br)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Production (não configurado)" -ForegroundColor Red
    }
    
    Write-Host "`n💡 Como usar:" -ForegroundColor White
    Write-Host "  npm run env:dev     # Para desenvolvimento local" -ForegroundColor Gray
    Write-Host "  npm run env:prod    # Para produção" -ForegroundColor Gray
    Write-Host "  npm run dev:local   # Configurar + executar desenvolvimento" -ForegroundColor Gray
    Write-Host "  npm run build:prod  # Configurar + build produção" -ForegroundColor Gray
    Write-Host ""
}

function Set-Environment {
    param([string]$Env)
    
    if ($Env -ne "development" -and $Env -ne "production") {
        Write-Host "❌ Ambiente inválido: $Env" -ForegroundColor Red
        Write-Host "✅ Ambientes válidos: development, production" -ForegroundColor Yellow
        exit 1
    }
    
    $SourceFile = "environments\$Env\.env.$Env"
    
    if (-not (Test-Path $SourceFile)) {
        Write-Host "❌ Arquivo $SourceFile não encontrado!" -ForegroundColor Red
        exit 1
    }
    
    Copy-Item $SourceFile ".env" -Force
    Write-Host "✅ Ambiente $Env configurado!" -ForegroundColor Green
    Write-Host "📁 Arquivo copiado: $SourceFile → .env" -ForegroundColor Cyan
    
    Write-Host "`n🚀 Próximos passos:" -ForegroundColor Yellow
    
    if ($Env -eq "development") {
        Write-Host "  1. npm run dev    # Iniciar servidor de desenvolvimento" -ForegroundColor White
        Write-Host "  2. Acessar: http://localhost:5173" -ForegroundColor White
    } else {
        Write-Host "  1. npm run build  # Gerar build de produção" -ForegroundColor White
        Write-Host "  2. npm run preview # Testar build localmente" -ForegroundColor White
    }
    
    Write-Host "`n✨ Ambiente $Env configurado com sucesso!" -ForegroundColor Green
}

# Executar
if (-not $Environment) {
    Show-Status
} else {
    Set-Environment -Env $Environment.ToLower()
}

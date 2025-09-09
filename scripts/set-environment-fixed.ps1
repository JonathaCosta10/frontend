# Script de Gerenciamento de Ambientes
# ====================================

param(
    [string]$Environment
)

# Função para copiar arquivo de ambiente
function Copy-EnvironmentFile {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Environment
    )
    
    $SourceFile = "environments\$Environment\.env.$Environment"
    $TargetFile = ".env"
    
    if (Test-Path $SourceFile) {
        Copy-Item $SourceFile $TargetFile -Force
        Write-Host "✅ Ambiente $Environment configurado!" -ForegroundColor Green
        Write-Host "📁 Arquivo $SourceFile copiado para $TargetFile" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Arquivo $SourceFile não encontrado!" -ForegroundColor Red
        exit 1
    }
}

# Função para validar ambiente
function Test-Environment {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Environment
    )
    
    $ValidEnvironments = @("development", "production")
    
    if ($Environment -notin $ValidEnvironments) {
        Write-Host "❌ Ambiente inválido: $Environment" -ForegroundColor Red
        Write-Host "✅ Ambientes válidos: $($ValidEnvironments -join ', ')" -ForegroundColor Yellow
        exit 1
    }
}

# Função para mostrar status atual
function Show-EnvironmentStatus {
    Write-Host "`n🌍 Status dos Ambientes OrganizeSee" -ForegroundColor Blue
    Write-Host "=================================" -ForegroundColor Blue
    
    # Verificar arquivo .env atual
    if (Test-Path ".env") {
        $CurrentEnv = Get-Content ".env" | Select-String "VITE_ENV=" | ForEach-Object { $_.ToString().Split('=')[1] }
        Write-Host "📍 Ambiente atual: $CurrentEnv" -ForegroundColor Cyan
    } else {
        Write-Host "📍 Nenhum ambiente configurado (.env não encontrado)" -ForegroundColor Yellow
    }
    
    # Verificar arquivos disponíveis
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

# Verificar se foi passado um parâmetro
if (-not $Environment) {
    Show-EnvironmentStatus
    exit 0
}

$Environment = $Environment.ToLower()

# Validar ambiente
Test-Environment -Environment $Environment

# Mostrar configuração atual
Write-Host "`n🔧 Configurando ambiente: $Environment" -ForegroundColor Blue

# Copiar arquivo de ambiente
Copy-EnvironmentFile -Environment $Environment

# Mostrar próximos passos
Write-Host "`n🚀 Próximos passos:" -ForegroundColor Yellow

if ($Environment -eq "development") {
    Write-Host "  1. npm run dev    # Iniciar servidor de desenvolvimento" -ForegroundColor White
    Write-Host "  2. Acessar: http://localhost:5173" -ForegroundColor White
} 
elseif ($Environment -eq "production") {
    Write-Host "  1. npm run build  # Gerar build de produção" -ForegroundColor White
    Write-Host "  2. npm run preview # Testar build localmente" -ForegroundColor White
}

Write-Host "`n✨ Ambiente $Environment configurado com sucesso!" -ForegroundColor Green

# OrganizeSee Environment Manager
param([string]$Environment)

function Show-Status {
    Write-Host ""
    Write-Host "OrganizeSee Environment Status" -ForegroundColor Blue
    Write-Host "==============================" -ForegroundColor Blue
    
    if (Test-Path ".env") {
        $CurrentEnv = Get-Content ".env" | Select-String "VITE_ENV=" | ForEach-Object { $_.ToString().Split('=')[1] }
        if ($CurrentEnv) {
            Write-Host "Current Environment: $CurrentEnv" -ForegroundColor Cyan
        } else {
            Write-Host ".env exists but VITE_ENV not defined" -ForegroundColor Yellow
        }
    } else {
        Write-Host "No environment configured (.env not found)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Available Environments:" -ForegroundColor White
    
    if (Test-Path "environments\dev\.env.development") {
        Write-Host "  - Development (localhost)" -ForegroundColor Green
    } else {
        Write-Host "  - Development (not configured)" -ForegroundColor Red
    }
    
    if (Test-Path "environments\prod\.env.production") {
        Write-Host "  - Production (organizesee.com.br)" -ForegroundColor Green
    } else {
        Write-Host "  - Production (not configured)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  npm run env:dev     # Development" -ForegroundColor Gray
    Write-Host "  npm run env:prod    # Production" -ForegroundColor Gray
    Write-Host ""
}

function Set-Environment {
    param([string]$Env)
    
    if ($Env -ne "development" -and $Env -ne "production") {
        Write-Host "Invalid environment: $Env" -ForegroundColor Red
        Write-Host "Valid environments: development, production" -ForegroundColor Yellow
        exit 1
    }
    
    # Map environment names to folder names
    $FolderMap = @{
        "development" = "dev"
        "production" = "prod"
    }
    
    $Folder = $FolderMap[$Env]
    $SourceFile = "environments\$Folder\.env.$Env"
    
    if (-not (Test-Path $SourceFile)) {
        Write-Host "File not found: $SourceFile" -ForegroundColor Red
        exit 1
    }
    
    Copy-Item $SourceFile ".env" -Force
    Write-Host "Environment $Env configured!" -ForegroundColor Green
    Write-Host "File copied: $SourceFile to .env" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    
    if ($Env -eq "development") {
        Write-Host "  1. npm run dev" -ForegroundColor White
        Write-Host "  2. Access: http://localhost:5173" -ForegroundColor White
    } else {
        Write-Host "  1. npm run build" -ForegroundColor White
        Write-Host "  2. npm run preview" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Environment $Env configured successfully!" -ForegroundColor Green
}

if (-not $Environment) {
    Show-Status
} else {
    Set-Environment -Env $Environment.ToLower()
}

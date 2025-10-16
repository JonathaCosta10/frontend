# Script para verificar e instalar dependências ausentes
# Execute este script se houver erros de dependências no build

Write-Host "🔍 Verificando e instalando dependências ausentes..."

# Dependências do Radix UI
$radixPackages = @(
    "@radix-ui/react-radio-group",
    "@radix-ui/react-checkbox", 
    "@radix-ui/react-separator",
    "@radix-ui/react-accordion",
    "@radix-ui/react-hover-card",
    "@radix-ui/react-scroll-area",
    "@radix-ui/react-menubar",
    "@radix-ui/react-context-menu",
    "@radix-ui/react-navigation-menu",
    "@radix-ui/react-collapsible"
)

# Dependências de UI e gráficos
$uiPackages = @(
    "sonner",
    "next-themes",
    "react-chartjs-2",
    "chart.js",
    "lodash",
    "react-hot-toast",
    "embla-carousel-react"
)

# Dependências do Vercel
$vercelPackages = @(
    "@vercel/speed-insights",
    "@vercel/analytics"
)

Write-Host "📦 Instalando pacotes Radix UI..."
foreach ($package in $radixPackages) {
    npm i $package
}

Write-Host "🎨 Instalando pacotes UI..."
foreach ($package in $uiPackages) {
    npm i $package
}

Write-Host "📊 Instalando pacotes Vercel..."
foreach ($package in $vercelPackages) {
    npm i $package
}

Write-Host "✅ Todas as dependências foram instaladas!"
Write-Host "🚀 Execute 'npm run build:react-simple' para testar o build"
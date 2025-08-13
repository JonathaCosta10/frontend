#!/usr/bin/env node

/**
 * Script de Otimização de Build para Produção
 * Configura otimizações específicas para build de produção
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

// Função para otimizar Vite config para produção
function optimizeViteConfig() {
  const viteConfigPath = path.join(PROJECT_ROOT, 'vite.config.ts');
  
  const optimizedConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
  },
  build: {
    // Otimizações para produção
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    
    // Configurações de chunking para melhor cache
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          router: ['react-router-dom'],
          utils: ['clsx', 'tailwind-merge']
        }
      }
    },
    
    // Configurações de performance
    chunkSizeWarningLimit: 1000,
    
    // Otimizar assets
    assetsInlineLimit: 4096
  },
  
  // Otimizações de desenvolvimento (apenas local)
  server: {
    port: 3000,
    host: true
  },
  
  // Preview para testes de produção
  preview: {
    port: 4173,
    host: true
  }
})`;

  try {
    fs.writeFileSync(viteConfigPath, optimizedConfig);
    console.log('✅ vite.config.ts otimizado para produção');
  } catch (error) {
    console.error('❌ Erro ao otimizar vite.config.ts:', error.message);
  }
}

// Função para otimizar Tailwind config
function optimizeTailwindConfig() {
  const tailwindConfigPath = path.join(PROJECT_ROOT, 'tailwind.config.ts');
  
  const optimizedConfig = `import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './client/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config`;

  try {
    fs.writeFileSync(tailwindConfigPath, optimizedConfig);
    console.log('✅ tailwind.config.ts otimizado');
  } catch (error) {
    console.error('❌ Erro ao otimizar tailwind.config.ts:', error.message);
  }
}

// Função para criar netlify.toml otimizado
function optimizeNetlifyConfig() {
  const netlifyConfigPath = path.join(PROJECT_ROOT, 'netlify.toml');
  
  const optimizedConfig = `[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.woff2"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"`;

  try {
    fs.writeFileSync(netlifyConfigPath, optimizedConfig);
    console.log('✅ netlify.toml otimizado');
  } catch (error) {
    console.error('❌ Erro ao otimizar netlify.toml:', error.message);
  }
}

// Função para criar um index.html otimizado
function optimizeIndexHtml() {
  const indexHtmlPath = path.join(PROJECT_ROOT, 'index.html');
  
  const optimizedHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- SEO Meta Tags -->
    <title>Curry Oasis - Gestão Financeira Inteligente</title>
    <meta name="description" content="Plataforma completa de gestão financeira com acompanhamento de investimentos, análise de mercado e controle orçamentário." />
    <meta name="keywords" content="gestão financeira, investimentos, orçamento, análise mercado" />
    <meta name="author" content="Organizesee" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="Curry Oasis - Gestão Financeira" />
    <meta property="og:description" content="Plataforma completa de gestão financeira" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://curry-oasis.netlify.app" />
    
    <!-- Security Headers -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';" />
    
    <!-- Preconnect to external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    
    <!-- Critical CSS será injetado pelo Vite -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/client/main.tsx"></script>
  </body>
</html>`;

  try {
    fs.writeFileSync(indexHtmlPath, optimizedHtml);
    console.log('✅ index.html otimizado');
  } catch (error) {
    console.error('❌ Erro ao otimizar index.html:', error.message);
  }
}

// Função principal de otimização
function runOptimization() {
  console.log('⚡ Iniciando otimizações para produção...\n');

  optimizeViteConfig();
  optimizeTailwindConfig();
  optimizeNetlifyConfig();
  optimizeIndexHtml();

  console.log('\n✨ Otimizações concluídas!');
  console.log('\n📈 Melhorias aplicadas:');
  console.log('- Build otimizada com chunking inteligente');
  console.log('- Cache strategies configuradas');
  console.log('- Security headers aplicados');
  console.log('- SEO meta tags adicionadas');
  console.log('- Performance optimizations habilitadas');
}

// Executar se chamado diretamente
if (require.main === module) {
  runOptimization();
}

module.exports = { runOptimization };

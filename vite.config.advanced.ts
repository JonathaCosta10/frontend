import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { createESModulesFixPlugin } from './client/lib/vite-esmodules-fix'

// Configuração avançada de bundle splitting
const createManualChunks = () => {
  return {
    // Core React - chunk fundamental
    'react-core': ['react', 'react-dom'],
    
    // Routing - separado para lazy loading
    'react-router': ['react-router-dom'],
    
    // UI Framework - dividido por funcionalidade
    'ui-core': [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-tooltip'
    ],
    'ui-forms': [
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-radio-group'
    ],
    'ui-extended': [
      '@radix-ui/react-accordion',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-sheet',
      'lucide-react'
    ],
    
    // Charts - separados por biblioteca
    'charts-chartjs-core': ['chart.js'],
    'charts-react-charts': ['react-chartjs-2'],
    'charts-recharts': ['recharts'],
    
    // Forms e Validação
    'forms-core': ['react-hook-form'],
    'forms-validation': ['zod', '@hookform/resolvers'],
    
    // Data Management
    'data-query': ['@tanstack/react-query'],
    'data-http': ['axios'],
    
    // Utilities
    'utils-date': ['date-fns'],
    'utils-ui': ['clsx', 'tailwind-merge'],
    'utils-lodash': ['lodash'],
    
    // Crypto & Financial
    'crypto-libs': ['crypto-js', 'bitcoin-core'],
    
    // Vendors by size - pequenos vendors juntos
    'vendor-small': [
      'react-is',
      'scheduler',
      'eventemitter3'
    ],
    'vendor-medium': [
      'react-country-flag',
      'react-loading-skeleton'
    ]
  };
};

// Função para chunks dinâmicos baseados em ID
const getDynamicChunk = (id: string): string | undefined => {
  // Features específicas - lazy loading por feature
  if (id.includes('/features/dashboard/')) return 'feature-dashboard';
  if (id.includes('/features/market/')) return 'feature-market';
  if (id.includes('/features/investments/')) return 'feature-investments';
  if (id.includes('/features/budget/')) return 'feature-budget';
  if (id.includes('/features/public/')) return 'feature-public';
  
  // Páginas específicas grandes
  if (id.includes('analise-acoes-completa')) return 'page-analise-acoes';
  if (id.includes('analise-fii-completa')) return 'page-analise-fii';
  if (id.includes('info-diaria')) return 'page-info-diaria';
  if (id.includes('ranking')) return 'page-ranking';
  
  // Vendors restantes por alfabeto (para chunks menores)
  if (id.includes('node_modules')) {
    const match = id.match(/node_modules\/([^\/]+)/);
    if (match) {
      const packageName = match[1];
      const firstChar = packageName.charAt(0).toLowerCase();
      
      // Agrupar por primeiras letras para chunks menores
      if (['a', 'b', 'c'].includes(firstChar)) return 'vendor-abc';
      if (['d', 'e', 'f'].includes(firstChar)) return 'vendor-def';
      if (['g', 'h', 'i'].includes(firstChar)) return 'vendor-ghi';
      if (['j', 'k', 'l'].includes(firstChar)) return 'vendor-jkl';
      if (['m', 'n', 'o'].includes(firstChar)) return 'vendor-mno';
      if (['p', 'q', 'r'].includes(firstChar)) return 'vendor-pqr';
      if (['s', 't', 'u'].includes(firstChar)) return 'vendor-stu';
      if (['v', 'w', 'x', 'y', 'z'].includes(firstChar)) return 'vendor-vwxyz';
    }
  }
  
  return undefined;
};

export default defineConfig({
  plugins: [
    react(),
    createESModulesFixPlugin(),
    // Bundle analyzer
    process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap' // Melhor visualização
    })
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      'lodash': path.resolve(__dirname, 'node_modules/lodash'),
      'lodash/get': path.resolve(__dirname, 'node_modules/lodash/get.js'),
      'lodash/set': path.resolve(__dirname, 'node_modules/lodash/set.js'),
      'lodash/has': path.resolve(__dirname, 'node_modules/lodash/has.js'),
      'lodash/merge': path.resolve(__dirname, 'node_modules/lodash/merge.js'),
      'react-is': path.resolve(__dirname, 'client/lib/react-is-polyfill.ts')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    dedupe: ['react', 'react-dom', 'react-is', 'eventemitter3']
  },
  
  build: {
    // Otimizações avançadas
    minify: 'terser',
    sourcemap: process.env.NODE_ENV === 'development',
    cssCodeSplit: true,
    target: ['es2020', 'chrome80', 'firefox78', 'safari13'], // Melhor suporte cross-browser
    chunkSizeWarningLimit: 500, // Reduzido para chunks menores
    
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      mangle: {
        safari10: true // Compatibilidade Safari
      }
    },
    
    rollupOptions: {
      onwarn(warning, warn) {
        // Suprimir avisos conhecidos
        if (warning.code === 'CIRCULAR_DEPENDENCY' && 
            warning.message?.includes('recharts')) {
          return;
        }
        if (warning.code === 'THIS_IS_UNDEFINED') {
          return;
        }
        warn(warning);
      },
      
      output: {
        // Estratégia híbrida: manual + dinâmica
        manualChunks: (id) => {
          // Primeiro, tentar chunks manuais
          const manualChunks = createManualChunks();
          for (const [chunkName, modules] of Object.entries(manualChunks)) {
            if (modules.some(module => id.includes(module))) {
              return chunkName;
            }
          }
          
          // Depois, chunks dinâmicos
          return getDynamicChunk(id);
        },
        
        // Configurações avançadas de saída
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/styles-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        
        // Configurações para melhor cache
        format: 'es',
        exports: 'named'
      },
      
      // Otimizações de entrada
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      
      // External dependencies (se necessário)
      external: (id) => {
        // Externalize CDN dependencies em produção se desejado
        return false;
      }
    }
  },
  
  // Configurações de desenvolvimento
  server: {
    port: 3000,
    host: true,
    open: true,
    hmr: {
      overlay: true
    }
  },
  
  // Preview (build preview)
  preview: {
    port: 4173,
    host: true,
    open: true
  },
  
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      'lucide-react'
    ],
    exclude: [
      // Excluir dependências que devem ser lazy loaded
    ]
  },
  
  // CSS otimizations
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [
        // Adicionar plugins PostCSS se necessário
      ]
    }
  },
  
  // Environment variables
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  }
});
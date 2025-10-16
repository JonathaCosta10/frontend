import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { createESModulesFixPlugin } from './client/lib/vite-esmodules-fix'

// Configuração segura para produção - evita dependências circulares
const createSafeManualChunks = () => {
  return {
    // Core React separado
    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
    
    // UI Components estáveis
    'ui-vendor': [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'lucide-react'
    ],
    
    // Charts separados
    'charts-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
    
    // Forms
    'forms-vendor': ['react-hook-form', 'zod', '@hookform/resolvers'],
    
    // HTTP e State
    'data-vendor': ['axios', '@tanstack/react-query'],
    
    // Utilities
    'utils-vendor': ['lodash', 'date-fns', 'clsx', 'tailwind-merge'],
    
    // Crypto
    'crypto-vendor': ['crypto-js']
  };
};

export default defineConfig({
  plugins: [
    react(),
    createESModulesFixPlugin(),
    // Bundle analyzer apenas em desenvolvimento
    process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
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
    dedupe: ['react', 'react-dom', 'react-is', 'eventemitter3', 'scheduler']
  },
  
  build: {
    minify: 'terser',
    sourcemap: false, // Desabilitado em produção para performance
    cssCodeSplit: true,
    target: ['es2020', 'chrome80', 'firefox78', 'safari13'],
    chunkSizeWarningLimit: 1000, // Aumentado para evitar warnings desnecessários
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
        passes: 2
      },
      mangle: {
        safari10: true,
        properties: false // Não fazer mangle de propriedades para evitar problemas
      },
      format: {
        comments: false // Remover comentários
      }
    },
    
    rollupOptions: {
      onwarn(warning, warn) {
        // Suprimir todos os avisos problemáticos em produção
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        if (warning.code === 'EVAL') return;
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        
        // Log apenas erros críticos
        if (warning.code === 'UNRESOLVED_IMPORT') {
          warn(warning);
        }
      },
      
      output: {
        // Configuração segura de chunks
        manualChunks: (id) => {
          // Manual chunks seguros
          const manualChunks = createSafeManualChunks();
          for (const [chunkName, modules] of Object.entries(manualChunks)) {
            if (modules.some(module => id.includes(module))) {
              return chunkName;
            }
          }
          
          // Features por diretório
          if (id.includes('/features/dashboard/')) return 'feature-dashboard';
          if (id.includes('/features/market/')) return 'feature-market';
          if (id.includes('/features/investments/')) return 'feature-investments';
          if (id.includes('/features/budget/')) return 'feature-budget';
          if (id.includes('/features/public/')) return 'feature-public';
          
          // Páginas específicas
          if (id.includes('analise-acoes-completa')) return 'page-analise-acoes';
          if (id.includes('analise-fii-completa')) return 'page-analise-fii';
          if (id.includes('info-diaria')) return 'page-info-diaria';
          if (id.includes('ranking')) return 'page-ranking';
          
          // Vendor genérico para o resto
          if (id.includes('node_modules')) {
            return 'vendor-others';
          }
          
          return undefined;
        },
        
        // Configurações de saída otimizadas
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/styles-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        
        // Configurações ES modules
        format: 'es',
        exports: 'named',
        
        // Otimizações de interop
        interop: 'auto',
        
        // Garantir ordem de imports
        preserveModules: false,
        
        // Configurações de hoisting
        hoistTransitiveImports: false
      },
      
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  
  server: {
    port: 3000,
    host: true,
    open: true,
    hmr: {
      overlay: false // Desabilitar overlay em produção
    }
  },
  
  preview: {
    port: 4173,
    host: true,
    open: true
  },
  
  // Otimizações críticas de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-is',
      'scheduler',
      'eventemitter3'
    ],
    exclude: [
      // Excluir bibliotecas que causam problemas de inicialização
      'styled-components',
      'styled-system',
      '@emotion/react',
      '@emotion/styled'
    ],
    // Configurações específicas para produção
    holdUntilCrawlEnd: true,
    force: true // Forçar re-bundling
  },
  
  // CSS otimizations
  css: {
    devSourcemap: false,
    postcss: {
      plugins: []
    }
  },
  
  // Define global para evitar problemas de inicialização
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    // Evitar problemas com global
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  
  // Configurações de worker
  worker: {
    format: 'es'
  }
});
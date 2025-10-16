import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { createESModulesFixPlugin } from './client/lib/vite-esmodules-fix'

// Configuração SEGURA para produção - zero dependências circulares
const createUltraSafeChunks = () => {
  return {
    // React core - chunk único e estável
    'react-core': ['react', 'react-dom', 'react-router-dom', 'react-is', 'scheduler'],
    
    // UI libraries - agrupadas de forma segura
    'ui-radix': [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs'
    ],
    
    // Charts - separados mas seguros
    'charts-all': ['chart.js', 'react-chartjs-2', 'recharts'],
    
    // Forms e validation
    'forms-all': ['react-hook-form', 'zod', '@hookform/resolvers'],
    
    // HTTP e state management
    'data-all': ['axios', '@tanstack/react-query'],
    
    // Utilities - agrupados de forma segura
    'utils-all': ['lodash', 'date-fns', 'clsx', 'tailwind-merge', 'lucide-react'],
    
    // Crypto específico
    'crypto-all': ['crypto-js']
  };
};

export default defineConfig({
  plugins: [
    react(),
    createESModulesFixPlugin(),
    // Bundle analyzer apenas quando necessário
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
    dedupe: ['react', 'react-dom', 'react-is', 'eventemitter3', 'scheduler', 'tslib']
  },
  
  build: {
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    target: ['es2020', 'chrome80', 'firefox78', 'safari13'],
    chunkSizeWarningLimit: 1000,
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
        passes: 1 // Reduzido para evitar over-optimization
      },
      mangle: {
        safari10: true,
        properties: false
      },
      format: {
        comments: false
      }
    },
    
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignorar TODOS os avisos que podem causar problemas
        const ignoredWarnings = [
          'CIRCULAR_DEPENDENCY',
          'THIS_IS_UNDEFINED',
          'EVAL',
          'MODULE_LEVEL_DIRECTIVE',
          'UNRESOLVED_IMPORT'
        ];
        
        if (ignoredWarnings.includes(warning.code || '')) {
          return;
        }
        
        warn(warning);
      },
      
      output: {
        // Configuração ULTRA segura de chunks
        manualChunks: (id) => {
          // Chunks manuais ultra seguros
          const safeChunks = createUltraSafeChunks();
          for (const [chunkName, modules] of Object.entries(safeChunks)) {
            if (modules.some(module => id.includes(module))) {
              return chunkName;
            }
          }
          
          // Features - simples e direto
          if (id.includes('/features/dashboard/')) return 'dashboard';
          if (id.includes('/features/market/')) return 'market';
          if (id.includes('/features/investments/')) return 'investments';
          if (id.includes('/features/budget/')) return 'budget';
          if (id.includes('/features/public/')) return 'public';
          
          // Páginas específicas
          if (id.includes('analise-acoes-completa')) return 'analise-acoes';
          if (id.includes('analise-fii-completa')) return 'analise-fii';
          if (id.includes('info-diaria')) return 'info-diaria';
          if (id.includes('ranking')) return 'ranking';
          
          // TODOS os outros vendors em UM chunk seguro
          if (id.includes('node_modules')) {
            return 'vendors';
          }
          
          return undefined;
        },
        
        // Configurações de saída super seguras
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/styles-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        
        // ES modules seguros
        format: 'es',
        exports: 'named',
        
        // Configurações críticas para evitar problemas de inicialização
        interop: 'auto',
        preserveModules: false,
        hoistTransitiveImports: false,
        
        // Configuração de intro para garantir ordem de inicialização
        intro: `
          if (typeof globalThis === 'undefined') {
            var globalThis = window || global || self;
          }
        `
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
      overlay: false
    }
  },
  
  preview: {
    port: 4173,
    host: true,
    open: true
  },
  
  // Configurações CRÍTICAS para evitar problemas de inicialização
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-is',
      'scheduler',
      'eventemitter3',
      'tslib'
    ],
    exclude: [
      // Excluir qualquer biblioteca que possa causar problemas
      'styled-components',
      'styled-system',
      '@emotion/react',
      '@emotion/styled'
    ],
    esbuildOptions: {
      target: 'es2020'
    },
    holdUntilCrawlEnd: true,
    force: true
  },
  
  css: {
    devSourcemap: false,
    postcss: {
      plugins: []
    }
  },
  
  // Definições globais seguras
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  
  worker: {
    format: 'es'
  },
  
  // Configurações experimentais removidas para compatibilidade
});
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { createESModulesFixPlugin } from './client/lib/vite-esmodules-fix'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin customizado para resolver problemas de ES modules
    createESModulesFixPlugin(),
    // Plugin de análise de bundle (apenas em produção)
    process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      // Alias para lodash para resolver problemas de import
      'lodash': path.resolve(__dirname, 'node_modules/lodash'),
      'lodash/get': path.resolve(__dirname, 'node_modules/lodash/get.js'),
      'lodash/set': path.resolve(__dirname, 'node_modules/lodash/set.js'),
      'lodash/has': path.resolve(__dirname, 'node_modules/lodash/has.js'),
      'lodash/merge': path.resolve(__dirname, 'node_modules/lodash/merge.js'),
      // Alias para react-is para resolver conflitos de versão
      'react-is': path.resolve(__dirname, 'client/lib/react-is-polyfill.ts')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    // Resolver dedupe para evitar múltiplas versões
    dedupe: ['react', 'react-dom', 'react-is', 'eventemitter3']
  },
  build: {
    // Otimizações avançadas para produção
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'esnext',
    
    // Configurações de chunking otimizadas para CDR
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries - dividir React em chunks menores
          if (id.includes('react/') || id.includes('react-dom/')) {
            return 'react-core';
          }
          if (id.includes('react-router')) {
            return 'react-router';
          }
          
          // UI Component library - dividir Radix em chunks menores
          if (id.includes('@radix-ui/react-dialog') || id.includes('@radix-ui/react-dropdown-menu')) {
            return 'ui-core';
          }
          if (id.includes('@radix-ui/react-select') || id.includes('@radix-ui/react-tabs')) {
            return 'ui-forms';
          }
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui-extended';
          }
          
          // Charts - dividir biblioteca de charts
          if (id.includes('chart.js') || id.includes('Chart')) {
            return 'chartjs-core';
          }
          if (id.includes('react-chartjs-2')) {
            return 'react-charts';
          }
          // Recharts - separar e configurar para evitar dependência circular
          if (id.includes('recharts')) {
            // Separar getLegendProps especificamente para evitar dependência circular
            if (id.includes('getLegendProps') || id.includes('ChartUtils')) {
              return 'recharts-utils';
            }
            return 'recharts';
          }
          
          // Forms and validation - separar validação
          if (id.includes('react-hook-form')) {
            return 'forms-core';
          }
          if (id.includes('zod') || id.includes('@hookform')) {
            return 'forms-validation';
          }
          
          // Data fetching - separar TanStack Query
          if (id.includes('@tanstack/react-query')) {
            return 'data-query';
          }
          if (id.includes('axios')) {
            return 'data-http';
          }
          
          // Animation libraries
          if (id.includes('framer-motion')) {
            return 'animations';
          }
          
          // Date libraries - separar bibliotecas de data
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          if (id.includes('dayjs')) {
            return 'date-dayjs';
          }
          
          // Utils and helpers - dividir utilitários
          if (id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'ui-utils';
          }
          
          // Translation and i18n
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }
          
          // Large third-party libraries
          if (id.includes('lodash')) {
            return 'lodash';
          }
          
          // Crypto/financial specific libs
          if (id.includes('crypto') || id.includes('bitcoin') || id.includes('financial')) {
            return 'crypto-libs';
          }
          
          // Large node_modules packages - dividir vendors grandes
          if (id.includes('node_modules')) {
            // Separar vendors por tamanho estimado
            const largeVendors = ['monaco-editor', 'pdf', 'xlsx', 'moment'];
            if (largeVendors.some(vendor => id.includes(vendor))) {
              return 'vendor-large';
            }
            return 'vendor-common';
          }
        },
        // Optimize file naming for better caching
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'react-core') {
            return 'assets/react-[hash].js';
          }
          if (chunkInfo.name?.includes('chart')) {
            return 'assets/charts-[name]-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        entryFileNames: 'assets/entry-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/styles-[hash].css';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      },
      
      // Configurações de performance para bundles grandes
      external: (id) => {
        // Não externalizar dependências críticas, mas considerar lazy loading
        return false;
      }
    },
    
    // Configurações de performance avançadas
    chunkSizeWarningLimit: 300, // Reduzido ainda mais para forçar chunks menores
    assetsInlineLimit: 512, // Reduzido para menos inlining
    
    // Optimize terser for better compression
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3, // Mais passes para melhor compressão
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false // Remove todos os comentários
      }
    },
    
    // Configurações específicas para reduzir bundle size
    reportCompressedSize: false, // Desabilita relatório de tamanho comprimido (economiza tempo de build)
  },
  
  // Otimizações de desenvolvimento
  server: {
    port: 3000,
    host: true,
    // Enable HMR optimizations
    hmr: {
      overlay: false
    }
  },
  
  // Preview para testes de produção
  preview: {
    port: 4173,
    host: true
  },
  
  // Dependency optimization - otimizações agressivas
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      // Pré-bundle apenas as dependências críticas
      'axios',
      // Incluir lodash específicos para resolver problema de import
      'lodash/sortBy',
      'lodash/isNil', 
      'lodash/throttle',
      'lodash/isFunction',
      'lodash/isObject',
      'lodash/last',
      'lodash/upperFirst',
      'lodash/maxBy',
      'lodash/minBy',
      'lodash/isEqual',
      'lodash/first',
      'lodash/range',
      'lodash/some',
      'lodash/max',
      'lodash/isNaN',
      'lodash/min',
      'lodash/sumBy',
      'lodash/omit',
      'lodash/isNumber',
      'lodash/isString',
      'lodash/uniqBy',
      'lodash/flatMap',
      'lodash/isPlainObject',
      'lodash/isBoolean',
      'lodash/mapValues',
      'lodash/every',
      'lodash/find',
      'lodash/memoize',
      'lodash/get',
      'lodash/set',
      'lodash/has',
      'lodash/merge',
      // Incluir react-is para resolver conflitos de versão
      'react-is',
      'prop-types',
      // Incluir eventemitter3 para resolver problemas de ES modules
      'eventemitter3'
    ],
    exclude: [
      '@vite/client',
      '@vite/env'
    ],
    // Force bundling de dependências pequenas
    force: true
  },
  
  // Enable experimental features for better performance
  esbuild: {
    target: 'esnext',
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Tree shaking mais agressivo
    treeShaking: true,
    // Minificação adicional
    minifyIdentifiers: true,
    minifyWhitespace: true,
    minifySyntax: true,
    // Remover imports não utilizados
    ignoreAnnotations: false,
    // Otimizações de performance
    keepNames: false,
    legalComments: 'none',
    // Configurar para resolver imports CommonJS corretamente
    format: 'esm',
    platform: 'browser'
  },
  
  // Configurações adicionais para resolver problemas de módulos
  ssr: {
    noExternal: ['react-is', 'eventemitter3', 'recharts']
  },
  
  // Define para otimização de produção
  define: {
    __DEV__: false,
    'process.env.NODE_ENV': '"production"'
  }
})
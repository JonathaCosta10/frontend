import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// Configuração específica para produção com otimizações agressivas
export default defineConfig({
  plugins: [
    react({
      // Otimizações do SWC
      jsxImportSource: '@emotion/react',
      plugins: [
        // Plugin para remover console.log em produção
        ['@swc/plugin-remove-console', { exclude: ['error'] }]
      ]
    }),
    // Análise de bundle apenas se solicitado
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
      // Alias otimizados para produção
      'lodash': 'lodash-es', // Usar versão ES modules para melhor tree shaking
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    dedupe: ['react', 'react-dom', 'react-is', 'eventemitter3', 'lodash-es']
  },
  
  build: {
    // Configurações otimizadas para produção
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'esnext',
    
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // UI libraries
          'ui-core': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'ui-extended': ['@radix-ui/react-tabs', 'lucide-react'],
          
          // Charts separados por biblioteca
          'charts-chartjs': ['chart.js', 'react-chartjs-2'],
          'charts-recharts': ['recharts'],
          
          // Forms
          'forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
          
          // Data fetching
          'data-query': ['@tanstack/react-query'],
          'data-http': ['axios'],
          
          // Utilities
          'lodash': ['lodash-es'],
          'date-utils': ['date-fns', 'dayjs'],
          'ui-utils': ['clsx', 'tailwind-merge'],
          
          // Translations
          'i18n': ['i18next', 'react-i18next'],
          
          // Outros vendors
          'vendor': ['framer-motion', 'eventemitter3']
        },
        
        // Nomeação otimizada
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/entry-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      
      // Configurações para external
      external: (id) => {
        // Não externalizar nada para garantir que tudo seja bundleado corretamente
        return false;
      },
      
      // Otimizações de input
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    
    // Configurações de performance
    chunkSizeWarningLimit: 250, // Ainda mais restritivo
    assetsInlineLimit: 256, // Inline apenas assets muito pequenos
    
    // Terser otimizado para máxima compressão
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 5, // Mais passes para melhor compressão
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        reduce_vars: true,
        reduce_funcs: true,
        collapse_vars: true,
        inline: true,
        join_vars: true,
        negate_iife: true,
        properties: true,
        sequences: true,
        side_effects: true,
        switches: true,
        typeofs: true,
        unused: true
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false,
        ascii_only: true
      }
    },
    
    // Configurações CSS
    cssMinify: 'lightningcss',
    
    // Configurações experimentais
    reportCompressedSize: false
  },
  
  // Pré-build de dependências otimizado
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      // Lodash específicos
      'lodash-es/get',
      'lodash-es/set',
      'lodash-es/has',
      'lodash-es/merge',
      'lodash-es/isNil',
      'lodash-es/throttle',
      'lodash-es/isFunction',
      'lodash-es/maxBy',
      'lodash-es/minBy',
      'lodash-es/sumBy',
      'lodash-es/sortBy',
      'lodash-es/uniqBy',
      'lodash-es/flatMap',
      'lodash-es/find',
      'lodash-es/every',
      'lodash-es/some',
      'lodash-es/memoize',
      // React ecosystem
      'react-is',
      'prop-types'
    ],
    exclude: [
      '@vite/client',
      '@vite/env'
    ],
    force: true,
    
    // Configurações ESBuild para deps
    esbuildOptions: {
      target: 'esnext',
      treeShaking: true,
      minifyIdentifiers: true,
      minifyWhitespace: true,
      minifySyntax: true
    }
  },
  
  // ESBuild configuration
  esbuild: {
    target: 'esnext',
    platform: 'browser',
    format: 'esm',
    treeShaking: true,
    minifyIdentifiers: true,
    minifyWhitespace: true,
    minifySyntax: true,
    keepNames: false,
    legalComments: 'none',
    logOverride: { 
      'this-is-undefined-in-esm': 'silent',
      'empty-import-meta': 'silent'
    }
  },
  
  // SSR configuration
  ssr: {
    noExternal: ['react-is', 'eventemitter3', 'recharts', 'lodash-es']
  },
  
  // Define globals
  define: {
    __DEV__: false,
    'process.env.NODE_ENV': '"production"',
    'import.meta.hot': false
  },
  
  // Worker configuration
  worker: {
    format: 'es'
  }
})

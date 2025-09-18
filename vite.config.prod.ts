import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { createESModulesFixPlugin } from './client/lib/vite-esmodules-fix'

// Configuração específica para produção com otimizações agressivas
export default defineConfig({
  plugins: [
    react({
      // Otimizações do SWC para produção
      tsDecorators: true,
    }),
    // Plugin customizado para resolver problemas de ES modules
    createESModulesFixPlugin(),
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
      // Alias otimizados para produção - usar lodash padrão
      'lodash': path.resolve(__dirname, 'node_modules/lodash'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    dedupe: ['react', 'react-dom', 'react-is', 'eventemitter3', 'lodash']
  },
  
  build: {
    // Configurações otimizadas para produção
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'esnext',
    
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor libraries - separar por funcionalidade específica
          if (id.includes('node_modules')) {
            // React core - manter pequeno
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            
            // React Router - separar
            if (id.includes('react-router')) {
              return 'react-router';
            }
            
            // Charts - separar cada biblioteca de charts
            if (id.includes('chart.js')) return 'charts-chartjs';
            if (id.includes('react-chartjs-2')) return 'charts-react';
            if (id.includes('recharts')) {
              // Separar ainda mais o recharts para evitar dependência circular
              if (id.includes('getLegendProps') || id.includes('ChartUtils')) {
                return 'recharts-utils';
              }
              return 'charts-recharts';
            }
            
            // UI Libraries - dividir Radix em chunks menores
            if (id.includes('@radix-ui/react-dialog') || 
                id.includes('@radix-ui/react-dropdown-menu') ||
                id.includes('@radix-ui/react-popover')) {
              return 'ui-core';
            }
            if (id.includes('@radix-ui/react-select') || 
                id.includes('@radix-ui/react-tabs') ||
                id.includes('@radix-ui/react-form')) {
              return 'ui-forms';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-extended';
            }
            if (id.includes('lucide-react')) {
              return 'ui-icons';
            }
            
            // Forms and validation
            if (id.includes('react-hook-form')) return 'forms-core';
            if (id.includes('zod') || id.includes('@hookform')) return 'forms-validation';
            
            // Data fetching
            if (id.includes('@tanstack/react-query')) return 'data-query';
            if (id.includes('axios')) return 'data-http';
            
            // Date utilities
            if (id.includes('date-fns')) return 'date-utils';
            if (id.includes('dayjs')) return 'date-dayjs';
            
            // Utils
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'ui-utils';
            }
            
            // Lodash - grupo único para todas as funções
            if (id.includes('lodash')) return 'lodash';
            
            // Translation
            if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n';
            
            // Crypto/financial libs
            if (id.includes('crypto') || id.includes('bitcoin') || id.includes('financial')) {
              return 'crypto-libs';
            }
            
            // Animations
            if (id.includes('framer-motion')) return 'animations';
            
            // Outras libs menores
            if (id.includes('react-country-flag') || id.includes('react-is') || id.includes('prop-types')) {
              return 'vendor';
            }
            
            // Default vendor chunk
            return 'vendor-common';
          }
          
          // Application code - separar por funcionalidade
          
          // Budget pages
          if (id.includes('orcamento') || id.includes('budget')) {
            if (id.includes('entradas')) return 'entradas';
            if (id.includes('custos')) return 'custos';
            if (id.includes('dividas')) return 'dividas';
            if (id.includes('metas')) return 'metas';
            return 'budget';
          }
          
          // Investment pages
          if (id.includes('investimentos') || id.includes('investment')) {
            if (id.includes('comparativos')) return 'comparativos';
            if (id.includes('cadastro') && id.includes('investimento')) return 'cadastro';
            if (id.includes('ranking')) return 'ranking';
            if (id.includes('patrimonio')) return 'patrimonio';
            return 'investimentos';
          }
          
          // Market pages
          if (id.includes('mercado') || id.includes('market')) {
            if (id.includes('indicadores-economicos')) return 'indicadores-economicos';
            if (id.includes('lista-de-desejo')) return 'lista-de-desejo';
            if (id.includes('analise-ticker')) return 'analise-ticker';
            if (id.includes('calculadora-financeira')) return 'calculadora-financeira';
            return 'mercado';
          }
          
          // Training pages
          if (id.includes('treinamentos') || id.includes('training')) {
            if (id.includes('fundos-investimentos')) return 'fundos-investimentos';
            if (id.includes('renda-fixa')) return 'renda-fixa';
            if (id.includes('acoes')) return 'acoes';
            if (id.includes('macroeconomia')) return 'macroeconomia';
            return 'training';
          }
          
          // Crypto pages
          if (id.includes('cripto') || id.includes('crypto')) {
            if (id.includes('DashboardCripto')) return 'DashboardCripto';
            if (id.includes('portfolio')) return 'crypto-portfolio';
            if (id.includes('cadastro') && id.includes('cripto')) return 'crypto-cadastro';
            return 'crypto';
          }
          
          // Special pages que são grandes
          if (id.includes('info-diaria')) return 'info-diaria';
          if (id.includes('perfil')) return 'perfil';
          if (id.includes('configuracoes')) return 'configuracoes';
          if (id.includes('suporte')) return 'suporte';
          if (id.includes('risk-assessment')) return 'risk-assessment';
          if (id.includes('change-password')) return 'change-password';
          if (id.includes('payment-options')) return 'payment-options';
          
          // Services e utilities
          if (id.includes('services/api')) return 'api-services';
          if (id.includes('hooks/')) return 'hooks';
          if (id.includes('contexts/')) return 'contexts';
          if (id.includes('components/ui')) return 'ui-components';
          if (id.includes('lib/')) return 'utils';
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
    chunkSizeWarningLimit: 150, // Ainda mais restritivo para forçar chunks menores
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
      'lodash/get',
      'lodash/set',
      'lodash/has',
      'lodash/merge',
      'lodash/isNil',
      'lodash/throttle',
      'lodash/isFunction',
      'lodash/maxBy',
      'lodash/minBy',
      'lodash/sumBy',
      'lodash/sortBy',
      'lodash/uniqBy',
      'lodash/flatMap',
      'lodash/find',
      'lodash/every',
      'lodash/some',
      'lodash/memoize',
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
    noExternal: ['react-is', 'eventemitter3', 'recharts', 'lodash']
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

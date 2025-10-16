import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// Configuração ultra-otimizada para chunks menores
export default defineConfig({
  plugins: [
    react({
      tsDecorators: true,
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
      'lodash': path.resolve(__dirname, 'node_modules/lodash'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    dedupe: ['react', 'react-dom', 'react-is', 'eventemitter3', 'lodash']
  },
  
  build: {
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'esnext',
    
    // Terser específico para reduzir entry chunk
    terserOptions: {
      compress: {
        dead_code: true,
        drop_console: true,
        drop_debugger: true,
        passes: 5,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
        module: true, // ES module optimizations
        toplevel: true, // Top-level optimizations
      },
      mangle: {
        safari10: true,
        toplevel: true,
        module: true,
      },
      format: {
        comments: false,
      },
    },
    
    rollupOptions: {
      // Otimizações para reduzir entry chunk
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
      
      output: {
        manualChunks: (id) => {
          // ===== ESTRATÉGIA FOCO: Reduzir entry chunk =====
          
          // FORÇAR separação de TUDO que não é essencial no entry
          if (id.includes('node_modules')) {
            
            // 1. REACT ECOSYSTEM - Separar completamente do entry
            if (id.includes('react/') && !id.includes('react-dom') && !id.includes('react-router')) {
              return 'react-core';
            }
            if (id.includes('react-dom/client')) return 'react-dom-client';
            if (id.includes('react-dom/') && !id.includes('client')) return 'react-dom-core';
            if (id.includes('scheduler/')) return 'react-scheduler';
            if (id.includes('react-router-dom')) return 'react-router-dom';
            if (id.includes('react-router') && !id.includes('dom')) return 'react-router-core';
            if (id.includes('react-is')) return 'react-is';
            
            // 2. QUERY CLIENT - Separar completamente
            if (id.includes('@tanstack/react-query')) return 'query-core';
            
            // 3. UI LIBRARIES - Micro-separação para reduzir entry
            if (id.includes('@radix-ui/react-tooltip')) return 'radix-tooltip';
            if (id.includes('@radix-ui/react-toast')) return 'radix-toast'; 
            if (id.includes('@radix-ui/react-dialog')) return 'radix-dialog';
            if (id.includes('@radix-ui/react-dropdown')) return 'radix-dropdown';
            if (id.includes('@radix-ui/react-select')) return 'radix-select';
            if (id.includes('@radix-ui/react-accordion')) return 'radix-accordion';
            if (id.includes('@radix-ui/react-tabs')) return 'radix-tabs';
            if (id.includes('@radix-ui/react-checkbox')) return 'radix-checkbox';
            if (id.includes('@radix-ui/react-switch')) return 'radix-switch';
            if (id.includes('@radix-ui/react-progress')) return 'radix-progress';
            if (id.includes('@radix-ui/react-separator')) return 'radix-separator';
            if (id.includes('@radix-ui/react-label')) return 'radix-label';
            if (id.includes('@radix-ui')) return 'radix-misc';
            
            // 2. CHARTS - Separação ultra-granular
            if (id.includes('chart.js/dist/chart.esm.js')) return 'chartjs-main';
            if (id.includes('chart.js/dist/helpers.esm.js')) return 'chartjs-helpers';
            if (id.includes('chart.js/') && !id.includes('dist/chart.esm') && !id.includes('dist/helpers')) {
              return 'chartjs-plugins';
            }
            if (id.includes('react-chartjs-2')) return 'react-chartjs';
            
            // Recharts - Separação extrema para resolver dependências circulares
            if (id.includes('recharts/es6/chart/LineChart')) return 'recharts-line';
            if (id.includes('recharts/es6/chart/PieChart')) return 'recharts-pie';
            if (id.includes('recharts/es6/chart/BarChart')) return 'recharts-bar';
            if (id.includes('recharts/es6/chart/') && !id.includes('LineChart') && !id.includes('PieChart') && !id.includes('BarChart')) {
              return 'recharts-charts-misc';
            }
            if (id.includes('recharts/es6/component/Legend')) return 'recharts-legend';
            if (id.includes('recharts/es6/component/Tooltip')) return 'recharts-tooltip';
            if (id.includes('recharts/es6/component/') && !id.includes('Legend') && !id.includes('Tooltip')) {
              return 'recharts-components';
            }
            if (id.includes('recharts/es6/util/getLegendProps')) return 'recharts-legend-props';
            if (id.includes('recharts/es6/util/ChartUtils')) return 'recharts-chart-utils';
            if (id.includes('recharts/es6/util/') && !id.includes('getLegendProps') && !id.includes('ChartUtils')) {
              return 'recharts-utils';
            }
            if (id.includes('recharts/es6/shape/')) return 'recharts-shapes';
            if (id.includes('recharts/es6/container/')) return 'recharts-containers';
            if (id.includes('recharts/')) return 'recharts-core';
            
            // 3. UI LIBRARIES - Cada componente em seu chunk
            if (id.includes('@radix-ui/react-dialog')) return 'radix-dialog';
            if (id.includes('@radix-ui/react-dropdown-menu')) return 'radix-dropdown';
            if (id.includes('@radix-ui/react-select')) return 'radix-select';
            if (id.includes('@radix-ui/react-tabs')) return 'radix-tabs';
            if (id.includes('@radix-ui/react-form')) return 'radix-form';
            if (id.includes('@radix-ui/react-label')) return 'radix-label';
            if (id.includes('@radix-ui/react-toast')) return 'radix-toast';
            if (id.includes('@radix-ui/react-tooltip')) return 'radix-tooltip';
            if (id.includes('@radix-ui/react-popover')) return 'radix-popover';
            if (id.includes('@radix-ui/react-switch')) return 'radix-switch';
            if (id.includes('@radix-ui/react-progress')) return 'radix-progress';
            if (id.includes('@radix-ui/react-accordion')) return 'radix-accordion';
            if (id.includes('@radix-ui/react-alert-dialog')) return 'radix-alert';
            if (id.includes('@radix-ui/react-avatar')) return 'radix-avatar';
            if (id.includes('@radix-ui/react-badge')) return 'radix-badge';
            if (id.includes('@radix-ui/react-button')) return 'radix-button';
            if (id.includes('@radix-ui/react-card')) return 'radix-card';
            if (id.includes('@radix-ui/react-checkbox')) return 'radix-checkbox';
            if (id.includes('@radix-ui/react-input')) return 'radix-input';
            if (id.includes('@radix-ui/react-textarea')) return 'radix-textarea';
            if (id.includes('@radix-ui/react-separator')) return 'radix-separator';
            if (id.includes('@radix-ui/react-sheet')) return 'radix-sheet';
            if (id.includes('@radix-ui/react-table')) return 'radix-table';
            if (id.includes('@radix-ui/')) return 'radix-misc';
            
            if (id.includes('lucide-react')) return 'lucide-icons';
            
            // 4. FORMS - Ultra granular
            if (id.includes('react-hook-form/dist/index.esm.js')) return 'rhf-core';
            if (id.includes('react-hook-form/dist/') && !id.includes('index.esm.js')) return 'rhf-utils';
            if (id.includes('react-hook-form/')) return 'rhf-misc';
            if (id.includes('zod/lib/types.js')) return 'zod-types';
            if (id.includes('zod/lib/ZodError.js')) return 'zod-error';
            if (id.includes('zod/lib/') && !id.includes('types.js') && !id.includes('ZodError.js')) return 'zod-core';
            if (id.includes('zod/')) return 'zod-misc';
            if (id.includes('@hookform/resolvers/zod')) return 'hookform-zod';
            if (id.includes('@hookform/resolvers')) return 'hookform-resolvers';
            
            // 5. DATA FETCHING
            if (id.includes('@tanstack/react-query/build/lib/QueryClient')) return 'react-query-client';
            if (id.includes('@tanstack/react-query/build/lib/') && !id.includes('QueryClient')) return 'react-query-core';
            if (id.includes('@tanstack/react-query/')) return 'react-query-misc';
            if (id.includes('@tanstack/query-core')) return 'query-core';
            if (id.includes('axios/dist/esm/axios.js')) return 'axios-main';
            if (id.includes('axios/dist/esm/') && !id.includes('axios.js')) return 'axios-core';
            if (id.includes('axios/')) return 'axios-utils';
            
            // 6. DATE LIBRARIES
            if (id.includes('date-fns/esm/format/')) return 'date-fns-format';
            if (id.includes('date-fns/esm/parse/')) return 'date-fns-parse';
            if (id.includes('date-fns/esm/') && !id.includes('format/') && !id.includes('parse/')) return 'date-fns-core';
            if (id.includes('date-fns/')) return 'date-fns-misc';
            if (id.includes('dayjs/esm/index.js')) return 'dayjs-main';
            if (id.includes('dayjs/plugin/')) return 'dayjs-plugins';
            if (id.includes('dayjs/locale/')) return 'dayjs-locales';
            if (id.includes('dayjs/')) return 'dayjs-misc';
            
            // 7. LODASH - Separação por categoria funcional
            if (id.includes('lodash/_') || id.includes('lodash/.internal')) return 'lodash-internal';
            if (id.includes('lodash/get') || id.includes('lodash/set') || id.includes('lodash/has') || id.includes('lodash/merge') || id.includes('lodash/omit') || id.includes('lodash/pick')) {
              return 'lodash-object';
            }
            if (id.includes('lodash/sort') || id.includes('lodash/uniq') || id.includes('lodash/find') || id.includes('lodash/filter') || id.includes('lodash/map') || id.includes('lodash/forEach') || id.includes('lodash/flatMap')) {
              return 'lodash-collection';
            }
            if (id.includes('lodash/sum') || id.includes('lodash/max') || id.includes('lodash/min') || id.includes('lodash/mean') || id.includes('lodash/maxBy') || id.includes('lodash/minBy') || id.includes('lodash/sumBy')) {
              return 'lodash-math';
            }
            if (id.includes('lodash/throttle') || id.includes('lodash/debounce') || id.includes('lodash/memoize') || id.includes('lodash/once')) {
              return 'lodash-function';
            }
            if (id.includes('lodash/is') || id.includes('lodash/type')) return 'lodash-validation';
            if (id.includes('lodash/string') || id.includes('lodash/case') || id.includes('lodash/upperFirst')) return 'lodash-string';
            if (id.includes('lodash/')) return 'lodash-misc';
            
            // 8. STYLE UTILITIES
            if (id.includes('clsx')) return 'clsx';
            if (id.includes('tailwind-merge')) return 'tailwind-merge';
            if (id.includes('class-variance-authority')) return 'cva';
            
            // 9. I18N
            if (id.includes('i18next/dist/esm/i18next.js')) return 'i18next-main';
            if (id.includes('i18next/dist/esm/') && !id.includes('i18next.js')) return 'i18next-core';
            if (id.includes('i18next/')) return 'i18next-misc';
            if (id.includes('react-i18next/dist/es/')) return 'react-i18next';
            
            // 10. ANIMATION
            if (id.includes('framer-motion/dist/es/render/')) return 'framer-render';
            if (id.includes('framer-motion/dist/es/animation/')) return 'framer-animation';
            if (id.includes('framer-motion/dist/es/') && !id.includes('render/') && !id.includes('animation/')) return 'framer-core';
            if (id.includes('framer-motion/')) return 'framer-misc';
            
            // 11. CRYPTO/FINANCIAL LIBS
            if (id.includes('crypto-js')) return 'crypto-js';
            if (id.includes('bitcoin') || id.includes('ethereum')) return 'crypto-currencies';
            if (id.includes('financial') || id.includes('trading')) return 'financial-utils';
            
            // 12. SMALL UTILITIES
            if (id.includes('react-is')) return 'react-is';
            if (id.includes('prop-types')) return 'prop-types';
            if (id.includes('eventemitter3')) return 'event-emitter';
            if (id.includes('use-sync-external-store')) return 'use-sync-external-store';
            
            // 13. POLYFILLS E PONYFILLS
            if (id.includes('es6-promise') || id.includes('core-js') || id.includes('polyfill')) return 'polyfills';
            
            // 14. DEFAULT VENDOR - Deve ser muito pequeno agora
            return 'vendor-misc';
          }
          
          // ===== CÓDIGO DA APLICAÇÃO - Cada página/funcionalidade isolada =====
          
          // 15. PÁGINAS GRANDES - Isolamento total
          if (id.includes('calculadora-financeira')) return 'page-calc-financeira';
          if (id.includes('info-diaria')) return 'page-info-diaria';
          if (id.includes('DashboardCripto')) return 'page-crypto-dashboard';
          if (id.includes('configuracoes') && id.includes('pages/')) return 'page-configuracoes';
          if (id.includes('perfil') && id.includes('pages/')) return 'page-perfil';
          if (id.includes('metas') && id.includes('pages/')) return 'page-metas';
          if (id.includes('analise-ticker')) return 'page-analise-ticker';
          if (id.includes('lista-de-desejo')) return 'page-lista-desejo';
          if (id.includes('suporte')) return 'page-suporte';
          
          // 16. BUDGET - Cada página separada
          if (id.includes('orcamento') || id.includes('budget')) {
            if (id.includes('entradas')) return 'budget-entradas';
            if (id.includes('custos')) return 'budget-custos';
            if (id.includes('dividas')) return 'budget-dividas';
            return 'budget-overview';
          }
          
          // 17. INVESTIMENTOS - Separação total
          if (id.includes('investimentos') || id.includes('investment')) {
            if (id.includes('comparativos')) return 'inv-comparativos';
            if (id.includes('ranking')) return 'inv-ranking';
            if (id.includes('patrimonio')) return 'inv-patrimonio';
            if (id.includes('portfolio')) return 'inv-portfolio';
            if (id.includes('cadastro')) return 'inv-cadastro';
            return 'inv-core';
          }
          
          // 18. MERCADO - Páginas isoladas
          if (id.includes('mercado') || id.includes('market')) {
            if (id.includes('indicadores-economicos')) return 'market-indicators';
            if (id.includes('fundos-investimentos')) return 'market-fundos';
            return 'market-core';
          }
          
          // 19. EDUCATION/TRAINING - Por categoria
          if (id.includes('treinamentos') || id.includes('training')) {
            if (id.includes('renda-fixa')) return 'edu-renda-fixa';
            if (id.includes('acoes')) return 'edu-acoes';
            if (id.includes('macroeconomia')) return 'edu-macro';
            return 'edu-core';
          }
          
          // 20. CRYPTO - Separação por funcionalidade
          if (id.includes('cripto') || id.includes('crypto')) {
            if (id.includes('cadastro')) return 'crypto-cadastro';
            if (id.includes('portfolio')) return 'crypto-portfolio';
            return 'crypto-core';
          }
          
          // 21. AUTH & USER
          if (id.includes('auth') || id.includes('login') || id.includes('change-password')) {
            return 'auth-pages';
          }
          
          // 22. CONTEXTS - Separação por responsabilidade
          if (id.includes('contexts/')) {
            if (id.includes('TranslationContext')) return 'context-translation'; // 102KB isolado
            if (id.includes('AuthContext')) return 'context-auth'; // 32KB isolado
            if (id.includes('LazyContexts')) return 'context-lazy-providers';
            if (id.includes('Rules')) return 'context-api-rules';
            if (id.includes('Headers')) return 'context-api-headers'; 
            if (id.includes('Rotas')) return 'context-api-routes';
            if (id.includes('ResponseParms')) return 'context-api-response';
            if (id.includes('Theme') || id.includes('UI')) return 'context-ui';
            return 'context-misc';
          }
          
          // 23. SERVICES - Separação por domínio
          if (id.includes('services/')) {
            if (id.includes('api/auth') || id.includes('api/user')) return 'api-auth';
            if (id.includes('api/budget') || id.includes('api/orcamento')) return 'api-budget';
            if (id.includes('api/investment') || id.includes('api/investimento')) return 'api-investment';
            if (id.includes('api/crypto') || id.includes('api/cripto')) return 'api-crypto';
            if (id.includes('api/market') || id.includes('api/mercado')) return 'api-market';
            return 'api-misc';
          }
          
          // 24. HOOKS - Por categoria
          if (id.includes('hooks/')) {
            if (id.includes('useAuth') || id.includes('useUser')) return 'hooks-auth';
            if (id.includes('useTranslation') || id.includes('useLanguage')) return 'hooks-i18n';
            if (id.includes('useQuery') || id.includes('useAPI')) return 'hooks-data';
            return 'hooks-misc';
          }
          
          // 25. COMPONENTS - Separação ultra-granular
          if (id.includes('components/')) {
            
            // Componentes pesados isolados
            if (id.includes('NewUserGuidance')) return 'component-guidance'; // 29KB
            if (id.includes('ui/sidebar')) return 'component-sidebar'; // 24KB  
            if (id.includes('Onboarding')) return 'component-onboarding'; // 15KB
            if (id.includes('OAuthErrorHandler')) return 'component-oauth-error'; // 15KB
            if (id.includes('DashboardSidebar')) return 'component-dashboard-sidebar'; // 13KB
            if (id.includes('SubscriptionGuard')) return 'component-subscription'; // 11KB
            if (id.includes('AuthCallback')) return 'component-auth-callback'; // 11KB
            if (id.includes('TermsAndPrivacyModal')) return 'component-terms-modal'; // 9KB
            if (id.includes('ReplicateDataComponent')) return 'component-replicate'; // 9KB
            
            // Charts - separação granular  
            if (id.includes('GraficoSetorialAcao')) return 'chart-setor-acao'; // 19KB
            if (id.includes('GraficoAlocacaoTipo')) return 'chart-alocacao-tipo'; // 17KB
            if (id.includes('MetaRealidadeChart')) return 'chart-meta-realidade'; // 13KB
            if (id.includes('charts/') && id.includes('Grafico')) return 'charts-grafico-misc';
            if (id.includes('charts/') && id.includes('Chart')) return 'charts-chart-misc';
            if (id.includes('charts/')) return 'components-charts';
            
            // OAuth/Auth components
            if (id.includes('GoogleOAuth') || id.includes('GoogleAuth')) return 'component-google-auth';
            if (id.includes('oauth') || id.includes('OAuth')) return 'component-oauth-misc';
            
            // UI Core - separação por tipo
            if (id.includes('ui/chart')) return 'ui-chart'; // 11KB isolado
            if (id.includes('ui/form') || id.includes('ui/input') || id.includes('ui/select') || id.includes('ui/textarea')) {
              return 'components-forms';
            }
            if (id.includes('ui/dialog') || id.includes('ui/modal') || id.includes('ui/sheet') || id.includes('ui/toast')) {
              return 'components-overlays';
            }
            if (id.includes('ui/table') || id.includes('ui/tabs') || id.includes('ui/accordion')) {
              return 'components-layout';
            }
            if (id.includes('ui/button') || id.includes('ui/card') || id.includes('ui/badge')) {
              return 'components-basic';
            }
            if (id.includes('ui/')) return 'components-ui-misc';
            
            // Layout components
            if (id.includes('layout/DashboardLayout')) return 'layout-dashboard';
            if (id.includes('layout/')) return 'components-layout-misc';
            if (id.includes('ProtectedRoute')) return 'component-protected-route';
            if (id.includes('LanguageSelector')) return 'component-language-selector';
            if (id.includes('FinanceLogo')) return 'component-finance-logo';
            
            return 'components-misc';
          }
          
          // 26. UTILS & LIB - Por funcionalidade
          if (id.includes('utils/') || id.includes('lib/')) {
            if (id.includes('validation') || id.includes('schema')) return 'utils-validation';
            if (id.includes('format') || id.includes('currency') || id.includes('date')) return 'utils-format';
            if (id.includes('api') || id.includes('request') || id.includes('http')) return 'utils-api';
            if (id.includes('storage') || id.includes('cache')) return 'utils-storage';
            return 'utils-misc';
          }
          
          // 27. TYPES & INTERFACES
          if (id.includes('types/') || id.includes('interfaces/')) {
            return 'app-types';
          }
          
          // 28. CATCH-ALL - Deve ser minúsculo agora
          return 'app-misc';
        },
        
        // Nomes otimizados para cache
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/entry-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      
      // Tree shaking máximo
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    
    // Configurações ultra-agressivas
    chunkSizeWarningLimit: 100, // Alerta para chunks > 100KB
    assetsInlineLimit: 256, // Inline apenas assets muito pequenos
    
    // Terser com compressão máxima
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 5, // Máximo de passes
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        reduce_vars: true,
        reduce_funcs: true,
        collapse_vars: true,
        inline: 2,
        join_vars: true,
        negate_iife: true,
        properties: true,
        sequences: true,
        side_effects: true,
        switches: true,
        typeofs: true,
        unused: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        keep_fargs: false,
        keep_infinity: true
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
    
    reportCompressedSize: false
  },
  
  // Otimização de dependências ultra-específica
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      // Lodash específicos para pré-bundling
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
      'lodash/upperFirst',
      'lodash/isEqual',
      'lodash/first',
      'lodash/last',
      'lodash/range',
      'lodash/max',
      'lodash/min',
      'lodash/isNumber',
      'lodash/isString',
      'lodash/isBoolean',
      'lodash/isObject',
      'lodash/isPlainObject',
      'lodash/mapValues',
      'lodash/omit',
      'lodash/isNaN',
      // React ecosystem
      'react-is',
      'prop-types'
    ],
    exclude: [
      '@vite/client',
      '@vite/env'
    ],
    force: true,
    
    esbuildOptions: {
      target: 'esnext',
      treeShaking: true,
      minifyIdentifiers: true,
      minifyWhitespace: true,
      minifySyntax: true
    }
  },
  
  // ESBuild otimizado
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

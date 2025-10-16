import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// Configuração EXTREMA - Maximum Code Splitting
export default defineConfig({
  plugins: [
    react({
      tsDecorators: true,
    }),
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    dedupe: ['react', 'react-dom']
  },
  
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 50, // Reduzir limite para 50KB
    
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
      },
      mangle: {
        safari10: true,
        toplevel: true,
      },
      format: {
        comments: false,
      },
    },
    
    rollupOptions: {
      output: {
        // ESTRATÉGIA MÁXIMA: Separar TUDO em chunks micro
        manualChunks(id) {
          // ===== REACT CORE - Separação total =====
          if (id.includes('react/index') || id.includes('react/jsx')) return 'react-core';
          if (id.includes('react-dom/client')) return 'react-dom-client';
          if (id.includes('react-dom') && !id.includes('client')) return 'react-dom-core';
          if (id.includes('react-is')) return 'react-is';
          if (id.includes('react-router-dom')) return 'react-router-dom';
          if (id.includes('react-router') && !id.includes('dom')) return 'react-router-core';
          
          // ===== QUERY CLIENT - Separação =====
          if (id.includes('@tanstack/react-query')) return 'react-query-core';
          if (id.includes('query-core')) return 'query-core';
          
          // ===== RADIX UI - Micro separação =====
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
          
          // ===== CHARTS - Separação ultra específica =====
          if (id.includes('recharts') && id.includes('Bar')) return 'recharts-bar';
          if (id.includes('recharts') && id.includes('Line')) return 'recharts-line';
          if (id.includes('recharts') && id.includes('Pie')) return 'recharts-pie';
          if (id.includes('recharts') && id.includes('Area')) return 'recharts-area';
          if (id.includes('recharts') && id.includes('Scatter')) return 'recharts-scatter';
          if (id.includes('recharts') && id.includes('Tooltip')) return 'recharts-tooltip';
          if (id.includes('recharts') && id.includes('Legend')) return 'recharts-legend';
          if (id.includes('recharts') && id.includes('ResponsiveContainer')) return 'recharts-containers';
          if (id.includes('recharts') && id.includes('getLegendProps')) return 'recharts-legend-props';
          if (id.includes('recharts') && id.includes('ChartUtils')) return 'recharts-chart-utils';
          if (id.includes('recharts') && id.includes('util')) return 'recharts-utils';
          if (id.includes('recharts') && id.includes('component')) return 'recharts-components';
          if (id.includes('recharts') && id.includes('shape')) return 'recharts-shapes';
          if (id.includes('recharts')) return 'recharts-core';
          
          if (id.includes('chart.js') && id.includes('plugin')) return 'chartjs-plugins';
          if (id.includes('chart.js')) return 'chartjs-core';
          if (id.includes('react-chartjs')) return 'react-chartjs';
          
          // ===== LODASH - Micro separação por categoria =====
          if (id.includes('lodash') && id.includes('debounce')) return 'lodash-function';
          if (id.includes('lodash') && id.includes('throttle')) return 'lodash-function';
          if (id.includes('lodash') && id.includes('isEqual')) return 'lodash-comparison';
          if (id.includes('lodash') && id.includes('cloneDeep')) return 'lodash-object';
          if (id.includes('lodash') && id.includes('merge')) return 'lodash-object';
          if (id.includes('lodash') && id.includes('pick')) return 'lodash-object';
          if (id.includes('lodash') && id.includes('omit')) return 'lodash-object';
          if (id.includes('lodash') && id.includes('get')) return 'lodash-object';
          if (id.includes('lodash') && id.includes('set')) return 'lodash-object';
          if (id.includes('lodash') && id.includes('map')) return 'lodash-collection';
          if (id.includes('lodash') && id.includes('filter')) return 'lodash-collection';
          if (id.includes('lodash') && id.includes('reduce')) return 'lodash-collection';
          if (id.includes('lodash') && id.includes('find')) return 'lodash-collection';
          if (id.includes('lodash') && id.includes('forEach')) return 'lodash-collection';
          if (id.includes('lodash') && id.includes('groupBy')) return 'lodash-collection';
          if (id.includes('lodash') && id.includes('sortBy')) return 'lodash-collection';
          if (id.includes('lodash') && id.includes('sum')) return 'lodash-math';
          if (id.includes('lodash') && id.includes('max')) return 'lodash-math';
          if (id.includes('lodash') && id.includes('min')) return 'lodash-math';
          if (id.includes('lodash') && id.includes('round')) return 'lodash-math';
          if (id.includes('lodash') && id.includes('ceil')) return 'lodash-math';
          if (id.includes('lodash') && id.includes('floor')) return 'lodash-math';
          if (id.includes('lodash') && id.includes('startsWith')) return 'lodash-string';
          if (id.includes('lodash') && id.includes('endsWith')) return 'lodash-string';
          if (id.includes('lodash') && id.includes('capitalize')) return 'lodash-string';
          if (id.includes('lodash') && id.includes('upperCase')) return 'lodash-string';
          if (id.includes('lodash') && id.includes('lowerCase')) return 'lodash-string';
          if (id.includes('lodash') && id.includes('trim')) return 'lodash-string';
          if (id.includes('lodash') && id.includes('isEmpty')) return 'lodash-validation';
          if (id.includes('lodash') && id.includes('isArray')) return 'lodash-validation';
          if (id.includes('lodash') && id.includes('isObject')) return 'lodash-validation';
          if (id.includes('lodash') && id.includes('isString')) return 'lodash-validation';
          if (id.includes('lodash') && id.includes('isNumber')) return 'lodash-validation';
          if (id.includes('lodash') && id.includes('isFunction')) return 'lodash-validation';
          if (id.includes('lodash') && id.includes('isUndefined')) return 'lodash-validation';
          if (id.includes('lodash') && id.includes('isNull')) return 'lodash-validation';
          if (id.includes('lodash') && id.includes('_base')) return 'lodash-internal';
          if (id.includes('lodash')) return 'lodash-misc';
          
          // ===== UTILITIES - Separação específica =====
          if (id.includes('clsx') || id.includes('class-variance-authority')) return 'cva';
          if (id.includes('tailwind-merge')) return 'tailwind-merge';
          if (id.includes('prop-types')) return 'prop-types';
          
          // ===== CONTEXTS - Forçar separação =====
          if (id.includes('contexts/AuthContext')) return 'context-auth';
          if (id.includes('contexts/TranslationContext')) return 'context-translation';
          if (id.includes('contexts/Rules')) return 'context-api-rules';
          if (id.includes('contexts/Headers')) return 'context-api-headers';
          if (id.includes('contexts/Routes')) return 'context-api-routes';
          if (id.includes('contexts/ResponseParms')) return 'context-api-response';
          if (id.includes('contexts/')) return 'context-misc';
          
          // ===== COMPONENTS - Separação por tamanho e tipo =====
          if (id.includes('components/DashboardLayout')) return 'component-dashboard-layout';
          if (id.includes('components/DashboardSidebar')) return 'component-dashboard-sidebar';
          if (id.includes('components/ProtectedRoute')) return 'component-protected-route';
          if (id.includes('components/AuthCallback')) return 'component-auth-callback';
          if (id.includes('components/OptimizedSuspense')) return 'component-optimized-suspense';
          if (id.includes('components/GoogleAuth')) return 'component-google-auth';
          if (id.includes('components/LanguageSelector')) return 'component-language-selector';
          if (id.includes('components/SubscriptionGuard')) return 'component-subscription';
          if (id.includes('components/OnboardingTutorial')) return 'component-onboarding';
          if (id.includes('components/TermsModal')) return 'component-terms-modal';
          if (id.includes('components/GuidanceMessage')) return 'component-guidance';
          
          // UI Components por categoria
          if (id.includes('components/ui/form')) return 'components-forms';
          if (id.includes('components/ui/button')) return 'components-basic';
          if (id.includes('components/ui/input')) return 'components-basic';
          if (id.includes('components/ui/label')) return 'components-basic';
          if (id.includes('components/ui/card')) return 'components-layout';
          if (id.includes('components/ui/sheet')) return 'components-layout';
          if (id.includes('components/ui/dialog')) return 'components-overlays';
          if (id.includes('components/ui/popover')) return 'components-overlays';
          if (id.includes('components/ui/dropdown')) return 'components-overlays';
          if (id.includes('components/ui')) return 'components-ui-misc';
          if (id.includes('components/')) return 'components-misc';
          
          // ===== PAGES - Route-based splitting =====
          // Budget pages
          if (id.includes('pages/sistema/dashboard/orcamento/entradas')) return 'budget-entradas';
          if (id.includes('pages/sistema/dashboard/orcamento/custos')) return 'budget-custos';
          if (id.includes('pages/sistema/dashboard/orcamento/dividas')) return 'budget-dividas';
          if (id.includes('pages/sistema/dashboard/orcamento/metas')) return 'page-metas';
          if (id.includes('pages/sistema/dashboard/orcamento/index')) return 'budget-overview';
          if (id.includes('pages/sistema/dashboard/orcamento/')) return 'budget-misc';
          
          // Investment pages  
          if (id.includes('pages/sistema/dashboard/investimentos/cadastro')) return 'inv-cadastro';
          if (id.includes('pages/sistema/dashboard/investimentos/comparativos')) return 'inv-comparativos';
          if (id.includes('pages/sistema/dashboard/investimentos/ranking')) return 'inv-ranking';
          if (id.includes('pages/sistema/dashboard/investimentos/patrimonio')) return 'inv-patrimonio';
          if (id.includes('pages/sistema/dashboard/investimentos/index')) return 'inv-dashboard';
          if (id.includes('pages/sistema/dashboard/investimentos/')) return 'inv-core';
          
          // Crypto pages
          if (id.includes('pages/sistema/dashboard/cripto/cadastro')) return 'crypto-cadastro';
          if (id.includes('pages/sistema/dashboard/cripto/portfolio')) return 'crypto-portfolio';
          if (id.includes('pages/sistema/dashboard/cripto/mercado')) return 'crypto-market';
          if (id.includes('pages/sistema/dashboard/cripto/index')) return 'page-crypto-dashboard';
          if (id.includes('pages/sistema/dashboard/cripto/')) return 'crypto-core';
          
          // Market pages
          if (id.includes('pages/sistema/dashboard/mercado/analise-ticker')) return 'page-analise-ticker';
          if (id.includes('pages/sistema/dashboard/mercado/lista-de-desejo')) return 'page-lista-desejo';
          if (id.includes('pages/sistema/dashboard/mercado/calculadora-financeira')) return 'page-calc-financeira';
          if (id.includes('pages/sistema/dashboard/mercado/indicadores-economicos')) return 'market-indicators';
          if (id.includes('pages/sistema/dashboard/mercado/')) return 'market-core';
          
          // Training pages
          if (id.includes('pages/sistema/dashboard/treinamentos/acoes')) return 'edu-acoes';
          if (id.includes('pages/sistema/dashboard/treinamentos/renda-fixa')) return 'edu-renda-fixa';
          if (id.includes('pages/sistema/dashboard/treinamentos/macroeconomia')) return 'edu-macro';
          if (id.includes('pages/sistema/dashboard/treinamentos/fundos-investimentos')) return 'edu-fundos';
          if (id.includes('pages/sistema/dashboard/treinamentos/')) return 'edu-core';
          
          // Special pages
          if (id.includes('pages/sistema/dashboard/info-diaria')) return 'page-info-diaria';
          if (id.includes('pages/sistema/dashboard/perfil')) return 'page-perfil';
          if (id.includes('pages/sistema/dashboard/configuracoes')) return 'page-configuracoes';
          if (id.includes('pages/sistema/dashboard/suporte')) return 'page-suporte';
          
          // Auth pages
          if (id.includes('pages/PagesAuth/')) return 'auth-pages';
          if (id.includes('pages/HomePublicPages/')) return 'public-pages';
          if (id.includes('pages/ErrosTratamento/')) return 'error-pages';
          
          // ===== API & SERVICES - Separação por domínio =====
          if (id.includes('services/oauth')) return 'service-oauth';
          if (id.includes('services/api')) return 'api-core';
          if (id.includes('services/')) return 'services-misc';
          if (id.includes('lib/api')) return 'utils-api';
          if (id.includes('lib/storage')) return 'utils-storage';
          if (id.includes('lib/format')) return 'utils-format';
          if (id.includes('lib/eventEmitter')) return 'event-emitter';
          if (id.includes('lib/')) return 'utils-misc';
          
          // ===== HOOKS =====
          if (id.includes('hooks/')) return 'hooks-misc';
          
          // ===== EXTERNAL VENDORS - Separação específica =====
          if (id.includes('dayjs')) return 'dayjs-misc';
          if (id.includes('react-scheduler')) return 'react-scheduler';
          if (id.includes('react-hook-form')) return 'rhf-utils';
          
          // Charts específicos
          if (id.includes('charts/') && id.includes('GraficoMeta')) return 'charts-grafico-misc';
          if (id.includes('charts/') && id.includes('SetorAcao')) return 'chart-setor-acao';
          if (id.includes('charts/') && id.includes('MetaRealidade')) return 'chart-meta-realidade';
          if (id.includes('charts/')) return 'charts-chart-misc';
          
          // Vendor catch-all - separar vendors grandes
          if (id.includes('node_modules')) {
            // Forçar vendor pequenos
            const packageName = id.split('node_modules/')[1]?.split('/')[0];
            if (packageName && ['clsx', 'class-variance-authority', 'prop-types'].includes(packageName)) {
              return packageName;
            }
            return 'vendor-misc';
          }
          
          return null; // Entry chunk - manter mínimo
        },
        
        chunkFileNames: 'assets/[name]-[hash:8].js',
        entryFileNames: 'assets/entry-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]',
      },
    },
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@tanstack/react-query', '@radix-ui', 'recharts', 'chart.js', 'lodash']
  },
  
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    cors: true,
  },
})

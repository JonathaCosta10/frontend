import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { createESModulesFixPlugin } from './client/lib/vite-esmodules-fix'

// Configuração específica para Vercel sem dependências nativas do Rollup
export default defineConfig({
  plugins: [
    react({
      tsDecorators: true,
    }),
    // Plugin customizado para resolver problemas de ES modules
    createESModulesFixPlugin(),
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      'lodash': path.resolve(__dirname, 'node_modules/lodash'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    dedupe: ['react', 'react-dom', 'react-is', 'eventemitter3', 'lodash']
  },
  
  build: {
    // Configurações básicas para evitar problemas com módulos nativos
    sourcemap: false,
    cssCodeSplit: true,
    // Desativando o uso do Terser para evitar problemas com módulos nativos
    minify: 'esbuild',
    
    rollupOptions: {
      // Desativando options que podem causar problemas
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react/') || id.includes('react-dom/')) {
            return 'react-core';
          }
          if (id.includes('react-router')) {
            return 'react-router';
          }
          
          // UI Components
          if (id.includes('@radix-ui')) {
            return 'ui-components';
          }
          
          // Charts
          if (id.includes('chart.js') || id.includes('Chart')) {
            return 'charts-chartjs';
          }
          if (id.includes('recharts')) {
            return 'charts-recharts';
          }
          
          // Forms
          if (id.includes('react-hook-form') || id.includes('zod')) {
            return 'forms';
          }
          
          // Date libraries
          if (id.includes('date-fns') || id.includes('dayjs')) {
            return 'date-libs';
          }
          
          // Utils
          if (id.includes('lodash') || id.includes('utility')) {
            return 'utils';
          }
        }
      }
    },
  },
  
  // Define globals
  define: {
    __DEV__: false,
    'process.env.NODE_ENV': '"production"',
  }
})

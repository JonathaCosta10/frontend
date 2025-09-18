import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { createInitializationFixPlugin } from './client/lib/vite-initialization-fix'

// Configuração simplificada para produção
export default defineConfig({
  plugins: [
    // Plugin de correção de inicialização (DEVE vir primeiro)
    createInitializationFixPlugin(),
    
    // Usar o plugin React padrão
    react({
      // Configurações do React plugin
      babel: {
        plugins: [
          // Plugins Babel necessários
          '@babel/plugin-transform-react-jsx'
        ]
      },
      // Usar JSX Runtime clássico
      jsxRuntime: 'classic'
    })
  ],
  
  // Resolução de módulos
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
      '@components': path.resolve(__dirname, './client/components'),
      '@contexts': path.resolve(__dirname, './client/contexts'),
      '@hooks': path.resolve(__dirname, './client/hooks'),
      '@lib': path.resolve(__dirname, './client/lib'),
      '@utils': path.resolve(__dirname, './client/utils')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  
  build: {
    // Configurações básicas
    minify: 'terser',
    sourcemap: true,
    cssCodeSplit: true,
    target: 'es2015',
    
    // Configurações do Terser simplificadas
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
        passes: 1,
        toplevel: false
      },
      format: {
        comments: false
      }
    },
    
    // Configurações do Rollup
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'), // Usar o arquivo HTML principal corrigido
        vendor: path.resolve(__dirname, 'client/vendor-preload.js')
      },
      output: {
        // Evitar problemas de inicialização
        hoistTransitiveImports: false,
        // Chunks para melhor carregamento
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-vendor';
            }
            // Separar recharts em seu próprio chunk para evitar dependências circulares
            if (id.includes('recharts')) {
              return 'recharts-vendor';
            }
            return 'vendor';
          }
        }
      },
      // Configurações para resolver dependências circulares
      external: [],
      onwarn(warning, warn) {
        // Suprimir avisos sobre dependências circulares do recharts
        if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('recharts')) {
          return;
        }
        // Suprimir avisos sobre reexportações
        if (warning.code === 'CYCLIC_CROSS_CHUNK_REEXPORT') {
          return;
        }
        warn(warning);
      }
    },
    
    // Outras configurações de build
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false
  },
  
  // Otimização de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios'
    ],
    exclude: [
      'recharts' // Excluir recharts da otimização para evitar dependências circulares
    ]
  },
  
  // Configurações do esbuild
  esbuild: {
    // Usar configurações compatíveis
    target: 'es2015',
    legalComments: 'none'
  }
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { createInitializationFixPlugin } from './client/lib/vite-initialization-fix'

// Configuração para evitar problemas de inicialização
export default defineConfig({
  // IMPORTANTE: Usar mode development para evitar otimizações agressivas
  mode: 'production', // Mas com configurações conservadoras
  
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
    // SOLUÇÃO RADICAL: Desabilitar minificação para evitar problemas de inicialização
    minify: false, // Desabilitando minificação completamente
    sourcemap: true,
    cssCodeSplit: true,
    target: 'es2015',
    
    // Terser desabilitado para evitar problemas de inicialização
    /*
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
        passes: 1,
        toplevel: false,
        // CRÍTICO: Desabilitar otimizações que causam problemas de inicialização
        collapse_vars: false,
        reduce_vars: false,
        inline: false,
        hoist_vars: false,
        join_vars: false,
        sequences: false,
        // Manter estrutura original das variáveis
        keep_fargs: true,
        keep_fnames: true
      },
      mangle: {
        // Desabilitar mangling que pode causar problemas
        toplevel: false,
        keep_fnames: true
      },
      format: {
        comments: false
      }
    },
    */
    
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
  
  // Configurações do esbuild - conservadoras para evitar problemas
  esbuild: {
    // Usar configurações que não causam problemas de inicialização
    target: 'es2015',
    legalComments: 'none',
    // CRÍTICO: Desabilitar otimizações que podem causar problemas
    minifyIdentifiers: false,
    minifyWhitespace: false,
    minifySyntax: false,
    keepNames: true,
    treeShaking: false
  }
});

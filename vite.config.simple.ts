import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Usando plugin React padrão em vez de SWC
import path from 'path'
import { injectReactGlobalPlugin } from './client/lib/inject-react-plugin'
// Removendo dependência do ESModulesFix que pode usar módulos nativos

/**
 * Configuração ultra-simplificada para builds no Vercel
 * Evita problemas com módulos nativos (SWC, ESBuild e Rollup)
 */
export default defineConfig({
  plugins: [
    react({
      // Configurando para garantir que React seja definido globalmente
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    injectReactGlobalPlugin(), // Adicionar nosso plugin personalizado
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
  },
  
  build: {
    // Desabilitar TODAS as otimizações para evitar dependências nativas
    minify: false,
    sourcemap: false,
    cssCodeSplit: true,
    cssMinify: false,
    target: 'es2015', // Target mais compatível
    
    // Configuração ultra simplificada do Rollup
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        // Sem chunks manuais
        manualChunks: undefined,
        // Formato mais compatível
        format: 'es',
        // Sem compressão
        compact: false
      },
      // Desativar plugins que podem usar esbuild
      treeshake: false,
    },
  },
  
  // Define globals
  define: {
    __DEV__: false,
    'process.env.NODE_ENV': '"production"',
    'global': 'window', // Garantir que global esteja disponível
  },
  
  // Resolver problema de React não definido
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})

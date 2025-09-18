import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Usando plugin React padrão em vez de SWC
import path from 'path'
// Removendo dependência do ESModulesFix que pode usar módulos nativos

/**
 * Configuração ultra-simplificada para builds no Vercel
 * Evita problemas com módulos nativos (SWC, ESBuild e Rollup)
 */
export default defineConfig({
  plugins: [
    react({
      // Desativando JSX runtime para evitar dependências de SWC/esbuild
      jsxRuntime: 'classic',
    }),
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
    
    // Evitar completamente uso de esbuild
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    
    // Configuração ultra simplificada do Rollup
    rollupOptions: {
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
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Usando plugin React padrão em vez de SWC
import path from 'path'
import { createESModulesFixPlugin } from './client/lib/vite-esmodules-fix'

/**
 * Configuração ultra-simplificada para builds no Vercel
 * Evita problemas com módulos nativos (SWC e Rollup)
 */
export default defineConfig({
  plugins: [
    react(), // Plugin React vanilla sem SWC
    createESModulesFixPlugin(),
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
  },
  
  build: {
    minify: false, // Desabilitar minificação para evitar problemas com módulos nativos
    sourcemap: false,
    cssCodeSplit: true,
    cssMinify: false, // Desabilitar minificação CSS também
    
    // Configuração ultra simplificada do Rollup para evitar erros
    rollupOptions: {
      output: {
        // Desabilitar manualChunks completamente
        manualChunks: undefined,
        // Garantir que os módulos sejam criados de forma compatível
        format: 'es',
      },
    },
  },
  
  // Define globals
  define: {
    __DEV__: false,
    'process.env.NODE_ENV': '"production"',
  },
})

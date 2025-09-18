import { defineConfig } from 'vite';
import path from 'path';

/**
 * Configuração extremamente básica sem módulos nativos
 * ou plugins complexos para compatibilidade máxima com Vercel
 */
export default defineConfig({
  // Sem plugins que dependem de módulos nativos
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
  },
  
  // Configuração básica de build
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false, // Sem minificação para evitar dependências nativas
    sourcemap: false,
    cssCodeSplit: true,
    cssMinify: false,
    
    // Configuração básica para Rollup
    rollupOptions: {
      input: 'index.html',
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        compact: false,
        manualChunks: undefined
      }
    },
  },
  
  // Define globals
  define: {
    __DEV__: false,
    'process.env.NODE_ENV': '"production"',
  },
  
  // Otimizações desabilitadas
  optimizeDeps: {
    disabled: true
  },
  
  // Evitar uso de ESBuild
  esbuild: false
});

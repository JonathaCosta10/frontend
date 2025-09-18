import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// Configuração específica para Vercel para evitar problemas com Rollup native dependencies
export default defineConfig({
  plugins: [
    react({
      // Configurações otimizadas para Vercel
      jsxImportSource: 'react',
      plugins: []
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    dedupe: ['react', 'react-dom']
  },
  build: {
    // Configuração simplificada para evitar problemas de dependências nativas
    minify: 'esbuild', // Usar esbuild em vez de terser para melhor compatibilidade
    sourcemap: false,
    target: 'es2020', // Target mais conservador
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      // Configuração mínima para evitar problemas com dependências nativas
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  esbuild: {
    // Configurações do esbuild para melhor compatibilidade
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

/**
 * Configuração simplificada para builds no Vercel
 * Evita problemas com o Rollup e modules
 */
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
  },
  
  build: {
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    
    // Configuração simplificada do Rollup para evitar erros
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react', 
            'react-dom',
            'react-router-dom',
            'recharts',
            'chart.js',
          ]
        },
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

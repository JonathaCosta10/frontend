import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
  },
  build: {
    // Otimizações para produção
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    
    // Configurações de chunking para melhor cache
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          router: ['react-router-dom'],
          utils: ['clsx', 'tailwind-merge']
        }
      }
    },
    
    // Configurações de performance
    chunkSizeWarningLimit: 1000,
    
    // Otimizar assets
    assetsInlineLimit: 4096
  },
  
  // Otimizações de desenvolvimento (apenas local)
  server: {
    port: 3000,
    host: true
  },
  
  // Preview para testes de produção
  preview: {
    port: 4173,
    host: true
  }
})
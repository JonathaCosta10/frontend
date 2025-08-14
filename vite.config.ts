import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
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
    host: true,
    // Configurar CORS e proxy para backend
    cors: {
      origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"],
      credentials: true
    },
    // Proxy para requisições de API (opcional)
    proxy: {
      '/api': {
        target: 'https://restbackend-dc8667cf0950.herokuapp.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  
  // Preview para testes de produção
  preview: {
    port: 4173,
    host: true
  }
})
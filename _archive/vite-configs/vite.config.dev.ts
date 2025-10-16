import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './client')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://restbackend-dc8667cf0950.herokuapp.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', function(proxyReq, _req, _res) {
            // Adicionar cabeçalho de API Key a todas as requisições
            proxyReq.setHeader('X-API-Key', '}$gQ7TlDEhJ88np]^n8[uFu{9f#;+8qjZ&?c[+Sj_CLhMO[Z(iM_)ZnW]j2M]+j+');
            console.log('🔄 Proxy Request Headers:', proxyReq.getHeaders());
          });
          
          proxy.on('error', (err, _req, _res) => {
            console.log('🚨 Proxy Error:', err);
          });
        }
      },
      '/services/api': {
        target: 'https://restbackend-dc8667cf0950.herokuapp.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/services\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', function(proxyReq, _req, _res) {
            // Adicionar cabeçalho de API Key a todas as requisições
            proxyReq.setHeader('X-API-Key', '}$gQ7TlDEhJ88np]^n8[uFu{9f#;+8qjZ&?c[+Sj_CLhMO[Z(iM_)ZnW]j2M]+j+');
          });
        }
      }
    }
  }
});

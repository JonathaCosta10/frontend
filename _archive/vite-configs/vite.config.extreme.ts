import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// Configuração EXTREMA - Entry chunk mínimo absoluto
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
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    dedupe: ['react', 'react-dom']
  },
  
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 100,
    
    terserOptions: {
      compress: {
        dead_code: true,
        drop_console: true,
        drop_debugger: true,
        passes: 5,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
      },
      mangle: {
        safari10: true,
        toplevel: true,
      },
      format: {
        comments: false,
      },
    },
    
    rollupOptions: {
      output: {
        // ESTRATÉGIA EXTREMA: Fazer um chunk por dependência
        manualChunks(id) {
          // React core - separar cada pedaço
          if (id.includes('react/index')) return 'react-core';
          if (id.includes('react-dom/client')) return 'react-dom-client';
          if (id.includes('react-dom') && id.includes('index')) return 'react-dom-core';
          if (id.includes('react') && !id.includes('node_modules')) return 'react-app';
          
          // ESTRATÉGIA: Nem router no entry
          if (id.includes('react-router-dom')) return 'react-router-dom';
          if (id.includes('react-router') && !id.includes('dom')) return 'react-router-core';
          
          // Suspense lazy loading system
          if (id.includes('OptimizedSuspense')) return 'component-lazy-system';
          
          // CSS em chunk separado (embora já seja separado)
          if (id.includes('.css')) return 'styles';
          
          // Tudo mais vai para vendor
          if (id.includes('node_modules')) {
            return 'vendor-minimal';
          }
          
          // App files go to app chunk (exceto entry)
          if (id.includes('client/') && !id.includes('main.tsx') && !id.includes('App.tsx')) {
            return 'app-core';
          }
          
          return null; // Entry chunk apenas para main.tsx + App.tsx
        },
        
        chunkFileNames: 'assets/[name]-[hash:8].js',
        entryFileNames: 'assets/entry-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]',
      },
    },
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['react-router-dom', '@tanstack/react-query', '@radix-ui']
  },
  
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    cors: true,
  },
})

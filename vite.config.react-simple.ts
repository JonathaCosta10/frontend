import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Plugin para corrigir problemas de ES Modules e React global
function esModulesFix() {
  return {
    name: 'es-modules-fix',
    config() {
      console.log('🔧 ES Modules Fix Plugin ativo - REACT SIMPLE PRODUCTION');
    },
    transformIndexHtml(html) {
      // Injetar React globalmente no HTML
      return html.replace(
        '<head>',
        '<head>\n  <script>window.React = {};</script>'
      );
    }
  };
}

// Plugin para garantir que React esteja disponível globalmente
function reactGlobalPlugin() {
  return {
    name: 'react-global',
    generateBundle(options, bundle) {
      // Adicionar React como global no início do bundle principal
      Object.keys(bundle).forEach(fileName => {
        if (fileName.includes('index') && fileName.endsWith('.js')) {
          const chunk = bundle[fileName];
          if (chunk.type === 'chunk') {
            chunk.code = `import * as React from 'react';\nwindow.React = React;\n${chunk.code}`;
          }
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
      include: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
      exclude: ['node_modules/**']
    }),
    esModulesFix(),
    reactGlobalPlugin()
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
      '~': path.resolve(__dirname, './'),
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'date-fns']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000
  },

  server: {
    port: 3000,
    host: true,
    open: false,
  },

  preview: {
    port: 4173,
    host: true,
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    __DEV__: false,
  },

  optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true
  }
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Plugin para corrigir problemas de ES Modules e React global
function esModulesFix() {
  return {
    name: 'es-modules-fix',
    config() {
      console.log('🔧 ES Modules Fix Plugin ativo - REACT GLOBAL');
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
      '@components': path.resolve(__dirname, './client/components'),
      '@pages': path.resolve(__dirname, './client/pages'),
      '@utils': path.resolve(__dirname, './client/utils'),
      '@hooks': path.resolve(__dirname, './client/hooks'),
      '@contexts': path.resolve(__dirname, './client/contexts'),
      '@services': path.resolve(__dirname, './client/services'),
      '@types': path.resolve(__dirname, './client/types'),
      '@config': path.resolve(__dirname, './client/config'),
      '@lib': path.resolve(__dirname, './client/lib')
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json']
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
    
    rollupOptions: {
      output: {
        // Manual chunks para controlar React
        manualChunks: {
          'react-bundle': ['react', 'react-dom', 'react-dom/client']
        },
        chunkFileNames: '[name].[hash].js',
        entryFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]'
      }
    },
    
    chunkSizeWarningLimit: 5000,
    assetsInlineLimit: 0,
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      mangle: {
        keep_fnames: false,
        keep_classnames: false,
        // Preservar React para evitar problemas
        reserved: ['React', 'ReactDOM', 'createElement', 'Fragment']
      }
    }
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'axios',
      'date-fns',
      'lucide-react',
      'recharts',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'clsx',
      'tailwind-merge',
      '@tanstack/react-query'
    ],
    force: true
  },
  
  server: {
    port: 5173,
    host: true
  },
  
  preview: {
    port: 4173,
    host: true
  },
  
  define: {
    __DEV__: false,
    'process.env.NODE_ENV': '"production"',
    'process.env.NODE_DEBUG': 'false',
    // Definir React globalmente
    'global.React': 'React'
  },
  
  esbuild: {
    target: 'es2015',
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    drop: ['console', 'debugger']
  },
  
  mode: 'production'
});
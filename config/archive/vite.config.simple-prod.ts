import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Plugin para corrigir problemas de ES Modules
function esModulesFix() {
  return {
    name: 'es-modules-fix',
    config() {
      console.log('🔧 ES Modules Fix Plugin ativo - PRODUÇÃO SIMPLES');
    }
  };
}

export default defineConfig({
  plugins: [
    react({
      // Usar configuração mais simples sem Babel customizado
      jsxRuntime: 'classic',
      include: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
      exclude: ['node_modules/**']
    }),
    esModulesFix()
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
    
    // Vamos tentar com apenas um grande chunk principal
    rollupOptions: {
      output: {
        manualChunks: undefined, // Sem chunking manual
        chunkFileNames: '[name].[hash].js',
        entryFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]'
      }
    },
    
    chunkSizeWarningLimit: 5000, // Aumentar limite
    assetsInlineLimit: 0,
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      mangle: {
        keep_fnames: false,
        keep_classnames: false
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
    'process.env.NODE_DEBUG': 'false'
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
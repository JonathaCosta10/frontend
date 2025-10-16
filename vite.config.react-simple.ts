import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  mode: 'production',
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    })
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
      onwarn(warning, warn) {
        // Suprimir avisos de dependências externas
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        warn(warning);
      },
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
    chunkSizeWarningLimit: 1000,
    target: 'es2015',
    cssCodeSplit: true
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
    'process.env.NODE_ENV': '"production"',
    __DEV__: false,
    'global': 'globalThis',
    'import.meta.env.DEV': false,
    'import.meta.env.PROD': true,
    'import.meta.env.MODE': '"production"'
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    force: true,
    esbuildOptions: {
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    }
  },
  
  esbuild: {
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  }
});
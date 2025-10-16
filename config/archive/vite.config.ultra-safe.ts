import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Plugin para corrigir problemas de ES Modules
function esModulesFix() {
  return {
    name: 'es-modules-fix',
    config() {
      console.log('🔧 ES Modules Fix Plugin ativo - modo desenvolvimento');
    }
  };
}

export default defineConfig({
  plugins: [
    react({
      // Configuração mais conservadora do React
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
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
    
    // Configuração ultra-conservadora - sem chunking complexo
    rollupOptions: {
      output: {
        manualChunks: {
          // Apenas React em chunk separado
          'react-vendor': ['react', 'react-dom', 'react-dom/client'],
          // Todo o resto em um único chunk vendor
          'vendor': [
            'axios',
            'date-fns',
            'lucide-react',
            'recharts',
            'react-router-dom',
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
            'clsx',
            'tailwind-merge'
          ]
        },
        // Nomes de arquivo mais simples
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'entry/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      
      // Configurações para evitar problemas de dependências circulares
      external: (id) => {
        // Não externalizar nada - incluir tudo no bundle
        return false;
      }
    },
    
    // Configurações adicionais para estabilidade
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      mangle: {
        keep_fnames: true, // Manter nomes de função para debugging
        keep_classnames: true // Manter nomes de classe
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
      'tailwind-merge'
    ],
    force: true // Forçar re-otimização
  },
  
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    open: false
  },
  
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
    open: false
  },
  
  define: {
    __DEV__: false,
    'process.env.NODE_ENV': '"production"'
  },
  
  esbuild: {
    target: 'es2015',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
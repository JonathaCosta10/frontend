import { resolve } from 'path';

export default {
  mode: 'production',
  plugins: [],
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './client'),
      '~': resolve(process.cwd(), './'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis',
    '__DEV__': false,
    'import.meta.env.DEV': false,
    'import.meta.env.PROD': true
  },
  css: {
    postcss: {
      plugins: []
    }
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
      input: './index.html'
    }
  },
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    drop: ['console', 'debugger'],
    define: {
      'process.env.NODE_ENV': '"production"',
      '__DEV__': 'false'
    }
  }
};
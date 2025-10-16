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
    'global': 'globalThis'
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
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  }
};
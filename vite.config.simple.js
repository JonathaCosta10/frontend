import path from 'path';

// Plugin React SWC inline para evitar dependências
const reactSWCPlugin = {
  name: 'react-swc-production',
  transform(code, id) {
    if (id.endsWith('.tsx') || id.endsWith('.jsx')) {
      // Force production replacements
      let transformedCode = code
        .replace(/import\.meta\.env\.DEV/g, 'false')
        .replace(/import\.meta\.env\.PROD/g, 'true')
        .replace(/__DEV__/g, 'false')
        .replace(/process\.env\.NODE_ENV/g, '"production"');
      
      // Transform JSX manually for production
      if (transformedCode.includes('jsxDEV')) {
        transformedCode = transformedCode.replace(/jsxDEV/g, 'jsx');
      }
      
      return {
        code: transformedCode,
        map: null
      };
    }
  }
};

export default {
  mode: 'production',
  plugins: [reactSWCPlugin],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './client'),
      '~': path.resolve(process.cwd(), './'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env': '{"NODE_ENV": "production"}',
    __DEV__: 'false',
    'global': 'globalThis',
    'import.meta.env.DEV': 'false',
    'import.meta.env.PROD': 'true',
    'import.meta.env.MODE': '"production"',
    'import.meta.env.SSR': 'false'
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
    define: {
      'process.env.NODE_ENV': '"production"',
      __DEV__: 'false'
    },
    minifyIdentifiers: true,
    pure: ['console.log', 'console.warn', 'console.error'],
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
};
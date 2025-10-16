import { resolve } from 'path';

// Plugin para forçar React em todos os JSX
const forceReactPlugin = {
  name: 'force-react-import',
  transform(code, id) {
    if (id.endsWith('.tsx') || id.endsWith('.jsx')) {
      // Se o arquivo usa JSX mas não tem qualquer import de React
      const hasReactImport = code.includes('import React') || code.includes('import * as React') || code.includes('from "react"') || code.includes('from \'react\'');
      const hasJSX = code.includes('<') && code.includes('>') && !code.includes('</style>') && !code.includes('</script>');
      
      if (hasJSX && !hasReactImport) {
        return `import React from 'react';\n${code}`;
      }
    }
    return null;
  }
};

export default {
  mode: 'production',
  plugins: [forceReactPlugin],
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
  }
};
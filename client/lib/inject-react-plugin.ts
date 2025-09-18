// Plugin para injetar React globalmente
import type { Plugin } from 'vite'

export function injectReactGlobalPlugin(): Plugin {
  return {
    name: 'inject-react-global',
    transformIndexHtml(html) {
      // Injeta um script no cabeçalho do HTML para definir React globalmente
      return html.replace(
        /<head>/,
        `<head>
          <script>
            window.process = window.process || { env: { NODE_ENV: 'production' } };
            window.global = window;
          </script>`
      )
    },
    config(config) {
      // Configura o vite para resolver React corretamente
      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.include = [...(config.optimizeDeps.include || []), 'react', 'react-dom']
      
      config.resolve = config.resolve || {}
      config.resolve.dedupe = [...(config.resolve.dedupe || []), 'react', 'react-dom']
      
      return config
    }
  }
}

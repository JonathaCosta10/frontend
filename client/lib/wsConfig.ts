/**
 * Configuração de WebSockets para desenvolvimento
 * Ajusta automaticamente a porta do WebSocket com base no ambiente
 */

/**
 * Configurar o WebSocket para uso no ambiente de desenvolvimento
 * Isso resolve problemas onde o frontend tenta conectar à porta errada
 */
export function configureWebsocket() {
  // Verificar se estamos em ambiente de desenvolvimento
  if (import.meta.env.DEV) {
    // Configuração para o HMR do Vite
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    
    // Sobrescrever a URL padrão do WebSocket quando tentativas falharem
    const originalWebSocket = window.WebSocket;
    
    class PatchedWebSocket extends WebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        // Se a URL contém localhost:3000, substituir pela URL correta
        const urlString = url.toString();
        if (urlString.includes('localhost:3000') && wsUrl) {
          const newUrl = urlString.replace('localhost:3000', new URL(wsUrl).host);
          console.log(`WebSocket: redirecionando ${urlString} para ${newUrl}`);
          super(newUrl, protocols);
        } else {
          super(url, protocols);
        }
      }
    }
    
    // Substituir o construtor WebSocket global apenas em desenvolvimento
    // @ts-ignore - Substituição intencional do WebSocket
    window.WebSocket = PatchedWebSocket;
    
    console.log('WebSocket configurado com redirecionamento de porta');
  }
}

/**
 * Inicializar a configuração de WebSocket ao carregar
 */
export function initWebSocketConfig() {
  if (typeof window !== 'undefined') {
    configureWebsocket();
  }
}

export default { configureWebsocket, initWebSocketConfig };

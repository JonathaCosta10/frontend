import { cachedFetch } from "../../../lib/api-helpers";

/**
 * Helper para verificar se a API do CoinGecko está funcionando
 * e se não atingiu o limite de requisições
 */
export async function checkCoinGeckoStatus(): Promise<{
  status: 'operational' | 'limited' | 'down';
  message: string;
}> {
  // Verificar se estamos usando dados mockados
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
  
  // Se estiver usando dados mockados, simula que a API está ok
  if (useMock) {
    return {
      status: 'operational',
      message: 'Usando dados simulados (mock)'
    };
  }

  try {
    const response = await fetch('https://api.coingecko.com/api/v3/ping');
    
    // Verifica o status da resposta
    if (response.status === 200) {
      return {
        status: 'operational',
        message: 'API do CoinGecko está operacional'
      };
    } 
    // Limite de requisições atingido (status 429)
    else if (response.status === 429) {
      console.warn('CoinGecko API: Limite de requisições atingido');
      return {
        status: 'limited',
        message: 'Limite de requisições da API do CoinGecko foi atingido. Tente novamente em alguns minutos.'
      };
    } 
    // Outros erros
    else {
      console.error(`CoinGecko API: Erro com status ${response.status}`);
      return {
        status: 'down',
        message: `API do CoinGecko retornou status ${response.status}`
      };
    }
  } catch (error) {
    console.error('Erro ao verificar status da API CoinGecko:', error);
    return {
      status: 'down',
      message: 'Não foi possível conectar à API do CoinGecko'
    };
  }
}

/**
 * Função que limita o número de requisições por minuto
 * para evitar bloquear a API gratuita do CoinGecko
 */
class RateLimit {
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private resetTime: number = 0;
  
  // Configuração padrão: 10 requisições por minuto para a API gratuita
  constructor(
    private maxRequests: number = 10,
    private timeWindow: number = 60000 // 1 minuto em ms
  ) {}
  
  async waitIfNeeded(): Promise<boolean> {
    const now = Date.now();
    
    // Resetar contador se passou o intervalo de tempo
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + this.timeWindow;
    }
    
    // Verificar se atingiu o limite
    if (this.requestCount >= this.maxRequests) {
      const waitTime = this.resetTime - now;
      
      if (waitTime > 0) {
        console.warn(`CoinGecko rate limit: aguardando ${Math.ceil(waitTime/1000)}s`);
        
        // Esperar até poder fazer uma nova requisição
        return new Promise(resolve => {
          setTimeout(() => {
            this.requestCount = 0;
            this.resetTime = Date.now() + this.timeWindow;
            resolve(true);
          }, waitTime);
        });
      }
    }
    
    // Atualizar contador
    this.requestCount++;
    this.lastRequestTime = now;
    
    return Promise.resolve(true);
  }
}

// Instância global do limitador de requisições
const rateLimit = new RateLimit();

/**
 * Fetch específico para o CoinGecko com rate limit
 */
export async function coinGeckoFetch<T = any>(url: string, options?: RequestInit): Promise<T> {
  // Aguardar se for necessário por causa do rate limit
  await rateLimit.waitIfNeeded();
  
  // Fazer a requisição com cache
  return cachedFetch<T>(url, {
    ...options,
    // Adicionar cabeçalhos específicos para CoinGecko se necessário
    headers: {
      ...options?.headers,
      'Accept': 'application/json',
    }
  });
}

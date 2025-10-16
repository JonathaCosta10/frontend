/**
 * Configurador Central de Ambientes
 * =================================
 * 
 * Sistema inteligente para gerenciamento de configurações
 * entre desenvolvimento e produção
 */

// Definição dos tipos de ambiente
export type Environment = 'development' | 'production';

// Interface das configurações do ambiente
export interface EnvironmentConfig {
  mode: Environment;
  
  // API Configuration
  apiBaseUrl: string;
  apiRoot: string;
  apiUrl: string;
  
  // Backend Services
  backendUrl: string;
  authServiceUrl: string;
  apiServiceUrl: string;
  
  // OAuth Configuration
  googleClientId: string;
  oauthRedirectUri: string;
  
  // Debug & Development
  debugMode: boolean;
  consoleLogs: boolean;
  errorLogging: boolean;
  mockData: boolean;
  hotReload: boolean;
  sourceMaps: boolean;
  
  // Security
  secureCookies: boolean;
  httpsOnly: boolean;
  
  // Performance
  cacheEnabled: boolean;
  compression: boolean;
  buildOptimization: boolean;
  minify: boolean;
  treeshake: boolean;
  
  // Database
  dbMode: string;
  
  // Ports (Development only)
  devPort?: number;
  previewPort?: number;
  backendPort?: number;
}

/**
 * Configurações de Desenvolvimento
 */
export const developmentConfig: EnvironmentConfig = {
  mode: 'development',
  
  // API Configuration
  apiBaseUrl: 'http://127.0.0.1:5000',
  apiRoot: 'http://127.0.0.1:5000',
  apiUrl: 'http://127.0.0.1:5000',
  
  // Backend Services
  backendUrl: 'http://127.0.0.1:5000',
  authServiceUrl: 'http://127.0.0.1:5000/auth',
  apiServiceUrl: 'http://127.0.0.1:5000/services/api',
  
  // OAuth Configuration
  googleClientId: (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || 'your-dev-google-client-id',
  oauthRedirectUri: 'http://localhost:3000/auth/callback?flowName=GeneralOAuthFlow',
  
  // Debug & Development
  debugMode: true,
  consoleLogs: true,
  errorLogging: true,
  mockData: true,
  hotReload: true,
  sourceMaps: true,
  
  // Security
  secureCookies: false,
  httpsOnly: false,
  
  // Performance
  cacheEnabled: false,
  compression: false,
  buildOptimization: false,
  minify: false,
  treeshake: false,
  
  // Database
  dbMode: 'development',
  
  // Ports
  devPort: 5173,
  previewPort: 4173,
  backendPort: 5000,
};

/**
 * Configurações de Produção
 */
export const productionConfig: EnvironmentConfig = {
  mode: 'production',
  
  // API Configuration
  apiBaseUrl: 'https://backend.organizesee.com.br',
  apiRoot: 'https://backend.organizesee.com.br',
  apiUrl: 'https://backend.organizesee.com.br',
  
  // Backend Services
  backendUrl: 'https://backend.organizesee.com.br',
  authServiceUrl: 'https://backend.organizesee.com.br/auth',
  apiServiceUrl: 'https://backend.organizesee.com.br/services/api',
  
  // OAuth Configuration
  googleClientId: (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || 'your-prod-google-client-id',
  oauthRedirectUri: 'https://organizesee.com.br/oauth/callback',
  
  // Debug & Development
  debugMode: false,
  consoleLogs: false,
  errorLogging: true,
  mockData: false,
  hotReload: false,
  sourceMaps: false,
  
  // Security
  secureCookies: true,
  httpsOnly: true,
  
  // Performance
  cacheEnabled: true,
  compression: true,
  buildOptimization: true,
  minify: true,
  treeshake: true,
  
  // Database
  dbMode: 'production',
};

/**
 * Detector automático de ambiente
 */
export function detectEnvironment(): Environment {
  // Prioridade para variáveis de ambiente explícitas
  const viteEnv = (import.meta as any).env?.VITE_ENV;
  if (viteEnv === 'development' || viteEnv === 'production') {
    return viteEnv;
  }
  
  const nodeEnv = (import.meta as any).env?.NODE_ENV;
  if (nodeEnv === 'development' || nodeEnv === 'production') {
    return nodeEnv;
  }
  
  const mode = (import.meta as any).env?.MODE;
  if (mode === 'development' || mode === 'dev') {
    return 'development';
  }
  if (mode === 'production' || mode === 'prod') {
    return 'production';
  }
  
  // Detecção baseada na URL
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      return 'development';
    }
    if (hostname.includes('organizesee.com.br')) {
      return 'production';
    }
  }
  
  // Fallback para production por segurança
  return 'production';
}

/**
 * Carregador de configuração baseado no ambiente
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const environment = detectEnvironment();
  
  const config = environment === 'development' 
    ? developmentConfig 
    : productionConfig;
  
  // Log apenas em development
  if (config.consoleLogs) {
    console.log(`🌍 Ambiente detectado: ${environment}`);
    console.log(`🔧 Configuração carregada:`, {
      apiBaseUrl: config.apiBaseUrl,
      debugMode: config.debugMode,
      mode: config.mode
    });
  }
  
  return config;
}

/**
 * Instância global de configuração
 */
export const config = getEnvironmentConfig();

/**
 * Helpers para construção de URLs
 */
export class UrlBuilder {
  private static config = getEnvironmentConfig();
  
  /**
   * Constrói URL da API
   */
  static api(endpoint: string): string {
    const baseUrl = this.config.apiServiceUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${baseUrl}/${cleanEndpoint}`;
  }
  
  /**
   * Constrói URL de autenticação
   */
  static auth(endpoint: string): string {
    const baseUrl = this.config.authServiceUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${baseUrl}/${cleanEndpoint}`;
  }
  
  /**
   * Constrói URL do backend
   */
  static backend(endpoint: string): string {
    const baseUrl = this.config.backendUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${baseUrl}/${cleanEndpoint}`;
  }
  
  /**
   * Valida se uma URL está configurada corretamente
   */
  static validate(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      if (this.config.consoleLogs) {
        console.warn(`⚠️ URL inválida: ${url}`);
      }
      return false;
    }
  }
}

/**
 * Exportação da configuração atual
 */
export default config;

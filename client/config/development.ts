/**
 * Configurações Modernizadas com Sistema de Ambientes
 * ==================================================
 * 
 * Sistema integrado que usa o configurador central de ambientes
 * para definir comportamentos específicos de desenvolvimento e produção
 */

// Importar configuração centralizada
import { config, UrlBuilder } from '../../config/environments/config';

// Re-exportar detecções de ambiente usando o sistema central e detecção de URL
export const isDevelopment = config.mode === 'development' && 
  !(typeof window !== 'undefined' && window.location.hostname.includes('organizesee.com.br'));
export const isProduction = config.mode === 'production' || 
  (typeof window !== 'undefined' && window.location.hostname.includes('organizesee.com.br'));

// Configurações de backend usando o sistema central
export const BACKEND_URL = config.backendUrl;
export const API_BASE_URL = config.apiBaseUrl;
export const API_SERVICE_URL = config.apiServiceUrl;
export const AUTH_SERVICE_URL = config.authServiceUrl;

// API Key (mantém compatibilidade)
export const API_KEY = (import.meta as any).env?.VITE_API_KEY || "dev-api-key-local";

// Configurações JWT adaptadas ao ambiente
export const JWT_CONFIG = {
  // Sempre requerer autenticação JWT real
  requireJWTAuthentication: true,

  // Nunca permitir bypass de autenticação
  allowBypass: false,

  // Validação rigorosa de tokens JWT
  strictJWTValidation: true,

  // Timeouts adaptados ao ambiente
  tokenValidationTimeout: config.mode === 'production' ? 5000 : 10000, // Mais generoso em dev
  apiRequestTimeout: config.mode === 'production' ? 30000 : 60000, // Mais generoso em dev
};

// Configurações de segurança adaptadas
export const securityConfig = {
  // Criptografia obrigatória para localStorage
  encryptLocalStorage: config.secureCookies,

  // Rotação automática de tokens
  enableTokenRotation: true,

  // Headers de segurança obrigatórios
  requiredSecurityHeaders: [
    "X-API-Key",
    "Authorization",
    "X-Client-Version",
    "X-Session-ID",
  ],

  // Rate limiting adaptado ao ambiente
  rateLimit: {
    enabled: true,
    maxRequests: config.mode === 'production' ? 60 : 200, // Mais restritivo em produção
    windowMs: 60 * 1000, // 1 minuto
  },

  // Device fingerprinting para sessões
  enableDeviceFingerprinting: config.mode === 'production',

  // HTTPS obrigatório baseado no ambiente
  requireHTTPS: config.httpsOnly,

  // Secure cookies baseado no ambiente
  secureCookies: config.secureCookies,
};

// Configurações de debug e logging
export const debugConfig = {
  // Logs no console baseado no ambiente
  enableConsoleLogging: config.consoleLogs,

  // Debug mode baseado no ambiente
  debugMode: config.debugMode,

  // Error logging sempre ativo
  errorLogging: config.errorLogging || true, // Sempre ativo para diagnóstico

  // Mock data permitido para fallback mesmo em produção temporariamente
  useMockData: true, // Forçado para permitir fallback

  // Source maps baseado no ambiente
  enableSourceMaps: config.sourceMaps,
};

// Configurações de performance
export const performanceConfig = {
  // Cache baseado no ambiente
  enableCaching: config.cacheEnabled,

  // Compressão baseada no ambiente
  enableCompression: config.compression,

  // Hot reload baseado no ambiente
  enableHotReload: config.hotReload,

  // Build optimization baseado no ambiente
  buildOptimization: config.buildOptimization,
};

// OAuth configuration usando sistema central
export const oauthConfig = {
  googleClientId: config.googleClientId,
  redirectUri: config.oauthRedirectUri,
};

// Funções de logging seguro baseadas no ambiente
export function secureLog(message: string, data?: any) {
  if (config.consoleLogs) {
    console.log(`🔒 [${config.mode.toUpperCase()}] ${message}`, data || '');
  }
}

export function debugLog(message: string, data?: any) {
  if (config.debugMode) {
    console.debug(`🐛 [DEBUG] ${message}`, data || '');
  }
}

export function errorLog(message: string, error?: any) {
  if (config.errorLogging) {
    console.error(`❌ [ERROR] ${message}`, error || '');
  }
}

// Helpers para construção de URLs usando o sistema central
export const urlHelpers = {
  // Construir URL da API
  api: (endpoint: string) => UrlBuilder.api(endpoint),
  
  // Construir URL de autenticação
  auth: (endpoint: string) => UrlBuilder.auth(endpoint),
  
  // Construir URL do backend
  backend: (endpoint: string) => UrlBuilder.backend(endpoint),
  
  // Validar URL
  validate: (url: string) => UrlBuilder.validate(url),
};

// Configurações de desenvolvimento mockadas (para compatibilidade)
export const developmentConfig = {
  useMockData: config.mockData,
  apiDelay: config.mode === 'development' ? 500 : 0,
  mockApiDelayMin: 200,
  mockApiDelayMax: 800,
  enableHotReload: config.hotReload,
  verboseLogging: config.debugMode,
};

// Função de delay simulado (para compatibilidade com APIs mockadas)
export async function simulateApiDelay() {
  if (config.mockData && config.mode === 'development') {
    const minDelay = developmentConfig.mockApiDelayMin;
    const maxDelay = developmentConfig.mockApiDelayMax;
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Validação de configuração na inicialização
export function validateConfiguration() {
  const validations = [
    { test: () => UrlBuilder.validate(config.apiBaseUrl), message: 'API Base URL inválida' },
    { test: () => UrlBuilder.validate(config.backendUrl), message: 'Backend URL inválida' },
    { test: () => config.googleClientId !== 'your-dev-google-client-id' && config.googleClientId !== 'your-prod-google-client-id', message: 'Google Client ID deve ser configurado' },
  ];

  const errors = validations
    .filter(validation => !validation.test())
    .map(validation => validation.message);

  if (errors.length > 0) {
    console.error('❌ Erros de configuração encontrados:', errors);
    if (config.debugMode) {
      console.log('🔧 Configuração atual:', {
        mode: config.mode,
        apiBaseUrl: config.apiBaseUrl,
        backendUrl: config.backendUrl,
        debugMode: config.debugMode,
      });
    }
  } else if (config.consoleLogs) {
    console.log(`✅ Configuração do ambiente ${config.mode} validada com sucesso!`);
  }

  return errors.length === 0;
}

// Auto-validação na inicialização
if (typeof window !== 'undefined') {
  validateConfiguration();
}

// Exportações para compatibilidade com código existente
export default {
  isDevelopment,
  isProduction,
  BACKEND_URL,
  API_BASE_URL,
  API_KEY,
  JWT_CONFIG,
  securityConfig,
  debugConfig,
  performanceConfig,
  oauthConfig,
  developmentConfig,
  secureLog,
  debugLog,
  errorLog,
  urlHelpers,
  simulateApiDelay,
  validateConfiguration,
};

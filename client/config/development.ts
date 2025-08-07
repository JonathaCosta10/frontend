// Production-Ready JWT Configuration - Organizesee
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Backend configuration
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
export const API_KEY = import.meta.env.VITE_API_KEY || "organizesee-api-key-2025-secure";

// JWT Authentication Only - No Bypasses
export const JWT_CONFIG = {
  // Sempre requerer autenticação JWT real
  requireJWTAuthentication: true,

  // Nunca permitir bypass de autenticação
  allowBypass: false,

  // Validação rigorosa de tokens JWT
  strictJWTValidation: true,

  // Timeouts para produção
  tokenValidationTimeout: 5000, // 5 segundos
  apiRequestTimeout: 30000, // 30 segundos
};

// Configurações de segurança JWT
export const securityConfig = {
  // Criptografia obrigatória para localStorage
  encryptLocalStorage: true,

  // Rotação automática de tokens
  enableTokenRotation: true,

  // Headers de segurança obrigatórios
  requiredSecurityHeaders: [
    "X-API-Key",
    "Authorization",
    "X-Client-Version",
    "X-Session-ID",
  ],

  // Rate limiting para segurança
  rateLimit: {
    enabled: true,
    maxRequests: isProduction ? 60 : 200, // Mais restritivo em produção
    windowMs: 60 * 1000, // 1 minuto
  },

  // Device fingerprinting para sessões
  enableDeviceFingerprinting: true,
};

// Configurações de token JWT
export const jwtConfig = {
  // Duração de tokens baseado no ambiente
  tokenExpiry: {
    access: isProduction ? 15 * 60 : 60 * 60, // 15min prod, 1h dev
    refresh: isProduction ? 7 * 24 * 60 * 60 : 30 * 24 * 60 * 60, // 7 dias prod, 30 dias dev
  },

  // Validação de payload JWT
  requiredClaims: ["user_id", "email", "exp", "iat"],

  // Margem de segurança para expiração (segundos)
  expirationMargin: 60, // Renovar 1 minuto antes de expirar
};

// Configurações de API
export const apiConfig = {
  // Timeout baseado no ambiente
  timeout: isProduction ? 10000 : 30000, // 10s prod, 30s dev

  // Retry automático para falhas de rede
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
    exponentialBackoff: true,
  },

  // Headers obrigatórios
  defaultHeaders: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
};

// Configuração ativa (sem bypasses)
export const activeConfig = {
  // Autenticação JWT obrigatória
  requireAuthentication: true,

  // Sem bypass em nenhum ambiente
  enableBypass: false,

  // Logs de segurança
  enableSecurityLogs: true,

  // Performance em desenvolvimento
  enablePerformanceLogs: isDevelopment,

  // Rate limiting ativo
  rateLimit: securityConfig.rateLimit,

  // Timeout de API
  apiTimeout: apiConfig.timeout,

  // Validação rigorosa de tokens
  strictTokenValidation: true,
};

// Helper para logs seguros (sem expor dados sensíveis)
export const secureLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();

  if (isProduction) {
    // Em produção, log apenas com informações básicas
    console.log(`[${timestamp}] ${message}`);
  } else {
    // Em desenvolvimento, log detalhado mas sem dados sensíveis
    const safeData = data ? sanitizeLogData(data) : undefined;
    console.log(`[DEV ${timestamp}] ${message}`, safeData);
  }
};

// Sanitizar dados para logs (remover tokens e senhas)
const sanitizeLogData = (data: any): any => {
  if (typeof data !== "object" || data === null) return data;

  const sensitiveKeys = ["token", "password", "auth", "secret", "key"];
  const sanitized = { ...data };

  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = "***REDACTED***";
    }
  });

  return sanitized;
};

// Validação suave de configuração (sem quebrar aplicação)
export const validateConfig = () => {
  const warnings: string[] = [];

  // Apenas avisos, sem erros que quebram a aplicação
  if (!BACKEND_URL) {
    warnings.push("BACKEND_URL não configurado, usando fallback");
  }

  if (!API_KEY || API_KEY === "organizesee-api-key-2025-secure") {
    if (isProduction) {
      warnings.push("Considere configurar uma API_KEY personalizada");
    }
  }

  if (isProduction && BACKEND_URL.includes("localhost")) {
    warnings.push("BACKEND_URL localhost detectado em produção");
  }

  if (isProduction && !BACKEND_URL.startsWith("https://")) {
    warnings.push("HTTPS é recomendado em produção");
  }

  // Log apenas avisos, sem quebrar aplicação
  if (warnings.length > 0 && !isProduction) {
    console.warn("⚠️ Avisos de configuração:", warnings);
  }

  // Sempre considerar configuração válida
  secureLog("✅ Configuração carregada");
};

// Debug da configuração apenas em desenvolvimento
if (isDevelopment && typeof window !== "undefined") {
  secureLog("🔧 JWT Configuration:", {
    environment: isDevelopment ? "development" : "production",
    backendUrl: BACKEND_URL,
    jwtAuthRequired: activeConfig.requireAuthentication,
    bypassEnabled: activeConfig.enableBypass,
    strictValidation: activeConfig.strictTokenValidation,
  });
}

// Executar validação suave automaticamente
if (typeof window !== "undefined") {
  try {
    validateConfig();
  } catch (error) {
    // Capturar qualquer erro e não quebrar aplicação
    console.warn("Configuration validation warning:", error);
  }
}

// Tipos TypeScript para configuração JWT
export interface JWTConfig {
  requireJWTAuthentication: boolean;
  allowBypass: boolean;
  strictJWTValidation: boolean;
  tokenValidationTimeout: number;
  apiRequestTimeout: number;
}

export interface SecurityConfig {
  encryptLocalStorage: boolean;
  enableTokenRotation: boolean;
  requiredSecurityHeaders: string[];
  rateLimit: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  enableDeviceFingerprinting: boolean;
}

export interface TokenConfig {
  tokenExpiry: {
    access: number;
    refresh: number;
  };
  requiredClaims: string[];
  expirationMargin: number;
}

import { AxiosError } from 'axios';

/**
 * Sistema robusto de tratamento de erros de API
 * Fornece fallbacks e mensagens amigáveis para usuários
 */

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

/**
 * Mapeamento de códigos de erro para mensagens amigáveis
 */
const ERROR_MESSAGES: Record<string, { message: string; severity: ApiError['severity']; retryable: boolean }> = {
  // Erros de rede
  'NETWORK_ERROR': {
    message: 'Problemas de conexão. Verifique sua internet e tente novamente.',
    severity: 'medium',
    retryable: true
  },
  'TIMEOUT_ERROR': {
    message: 'A solicitação demorou muito para responder. Tente novamente.',
    severity: 'medium',
    retryable: true
  },
  
  // Erros de autenticação
  'UNAUTHORIZED': {
    message: 'Sua sessão expirou. Faça login novamente.',
    severity: 'high',
    retryable: false
  },
  'FORBIDDEN': {
    message: 'Você não tem permissão para acessar este recurso.',
    severity: 'high',
    retryable: false
  },
  
  // Erros de servidor
  'SERVER_ERROR': {
    message: 'Nossos servidores estão temporariamente indisponíveis. Tente novamente em alguns minutos.',
    severity: 'critical',
    retryable: true
  },
  'SERVICE_UNAVAILABLE': {
    message: 'Serviço temporariamente indisponível. Nossa equipe foi notificada.',
    severity: 'critical',
    retryable: true
  },
  
  // Erros de dados
  'VALIDATION_ERROR': {
    message: 'Alguns dados fornecidos são inválidos. Verifique e tente novamente.',
    severity: 'low',
    retryable: false
  },
  'NOT_FOUND': {
    message: 'As informações solicitadas não foram encontradas.',
    severity: 'medium',
    retryable: false
  },
  
  // Erros de limite
  'RATE_LIMIT': {
    message: 'Muitas solicitações. Aguarde alguns momentos antes de tentar novamente.',
    severity: 'medium',
    retryable: true
  },
  'QUOTA_EXCEEDED': {
    message: 'Limite de uso excedido. Considere fazer upgrade do seu plano.',
    severity: 'medium',
    retryable: false
  },
  
  // Erro genérico
  'UNKNOWN_ERROR': {
    message: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
    severity: 'medium',
    retryable: true
  }
};

/**
 * Processa erros de API e retorna informações estruturadas
 */
export function processApiError(error: any): ApiError {
  console.error('🚨 API Error:', error);

  // Erro de axios
  if (error.isAxiosError) {
    const axiosError = error as AxiosError;
    
    // Erro de rede
    if (!axiosError.response) {
      return {
        code: 'NETWORK_ERROR',
        ...ERROR_MESSAGES.NETWORK_ERROR,
        details: { message: axiosError.message }
      };
    }

    // Mapear códigos de status HTTP
    const status = axiosError.response.status;
    const responseData = axiosError.response.data as any;

    switch (status) {
      case 400:
        return {
          code: 'VALIDATION_ERROR',
          ...ERROR_MESSAGES.VALIDATION_ERROR,
          details: responseData
        };
      
      case 401:
        return {
          code: 'UNAUTHORIZED',
          ...ERROR_MESSAGES.UNAUTHORIZED,
          details: responseData
        };
      
      case 403:
        return {
          code: 'FORBIDDEN',
          ...ERROR_MESSAGES.FORBIDDEN,
          details: responseData
        };
      
      case 404:
        return {
          code: 'NOT_FOUND',
          ...ERROR_MESSAGES.NOT_FOUND,
          details: responseData
        };
      
      case 429:
        return {
          code: 'RATE_LIMIT',
          ...ERROR_MESSAGES.RATE_LIMIT,
          details: responseData
        };
      
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          code: 'SERVER_ERROR',
          ...ERROR_MESSAGES.SERVER_ERROR,
          details: responseData
        };
      
      default:
        return {
          code: 'UNKNOWN_ERROR',
          ...ERROR_MESSAGES.UNKNOWN_ERROR,
          details: responseData
        };
    }
  }

  // Erro customizado
  if (error.code && ERROR_MESSAGES[error.code]) {
    return {
      code: error.code,
      ...ERROR_MESSAGES[error.code],
      details: error.details
    };
  }

  // Erro desconhecido
  return {
    code: 'UNKNOWN_ERROR',
    ...ERROR_MESSAGES.UNKNOWN_ERROR,
    details: { originalError: error.message || error }
  };
}

/**
 * Wrapper para chamadas de API com tratamento robusto de erros
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallbackData?: T
): Promise<ApiResponse<T>> {
  try {
    const data = await apiCall();
    return {
      data,
      success: true
    };
  } catch (error) {
    const apiError = processApiError(error);
    
    return {
      data: fallbackData,
      error: apiError,
      success: false
    };
  }
}

/**
 * Retry logic para operações que podem ser repetidas
 */
export async function apiCallWithRetry<T>(
  apiCall: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
    fallbackData?: T;
  } = {}
): Promise<ApiResponse<T>> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    fallbackData
  } = options;

  let lastError: ApiError | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const data = await apiCall();
      return {
        data,
        success: true
      };
    } catch (error) {
      lastError = processApiError(error);
      
      // Se não é retryable, falha imediatamente
      if (!lastError.retryable) {
        break;
      }
      
      // Se é a última tentativa, falha
      if (attempt === maxRetries) {
        break;
      }
      
      // Aguardar antes da próxima tentativa
      const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      console.warn(`🔄 Tentativa ${attempt + 1}/${maxRetries} em ${currentDelay}ms...`);
    }
  }

  return {
    data: fallbackData,
    error: lastError,
    success: false
  };
}

/**
 * Hook para tratamento de erros de API em componentes
 */
import { useState, useCallback } from 'react';

export function useApiErrorHandler() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const executeApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: {
      retry?: boolean;
      maxRetries?: number;
      fallbackData?: T;
      onSuccess?: (data: T) => void;
      onError?: (error: ApiError) => void;
    } = {}
  ): Promise<T | undefined> => {
    const {
      retry = false,
      maxRetries = 3,
      fallbackData,
      onSuccess,
      onError
    } = options;

    setLoading(true);
    setError(null);

    try {
      const response = retry 
        ? await apiCallWithRetry(apiCall, { maxRetries, fallbackData })
        : await safeApiCall(apiCall, fallbackData);

      if (response.success && response.data) {
        onSuccess?.(response.data);
        return response.data;
      } else if (response.error) {
        setError(response.error);
        onError?.(response.error);
        return fallbackData;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    executeApiCall,
    clearError
  };
}

/**
 * Utilidades para logs de erro estruturados
 */
export const errorLogger = {
  logError: (error: ApiError, context?: any) => {
    const logData = {
      timestamp: new Date().toISOString(),
      error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log no console (desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 API Error Log:', logData);
    }

    // Salvar no localStorage para debugging
    try {
      const errors = JSON.parse(localStorage.getItem('api_errors') || '[]');
      errors.push(logData);
      
      // Manter apenas os últimos 50 erros
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('api_errors', JSON.stringify(errors));
    } catch (e) {
      console.warn('Falha ao salvar erro no localStorage:', e);
    }

    // TODO: Enviar para serviço de monitoramento (Sentry, etc.)
  },

  getStoredErrors: () => {
    try {
      return JSON.parse(localStorage.getItem('api_errors') || '[]');
    } catch (e) {
      return [];
    }
  },

  clearStoredErrors: () => {
    localStorage.removeItem('api_errors');
  }
};
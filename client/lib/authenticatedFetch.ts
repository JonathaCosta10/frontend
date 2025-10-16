/**
 * Utilitário para fetch autenticado que inclui automaticamente session_id e device_fingerprint
 * Esta função garante que todas as requisições tenham os headers necessários para evitar
 * o erro "Token malformado: faltam campos session_id, device_fingerprint"
 */

import { localStorageManager } from "@/lib/localStorage";
import { createHeaders } from "@/lib/apiKeyUtils";

interface AuthenticatedFetchOptions extends RequestInit {
  includeAuth?: boolean;
  skipSessionHeaders?: boolean;
}

/**
 * Fetch autenticado que inclui automaticamente todos os headers necessários
 * @param url - URL da requisição
 * @param options - Opções da requisição
 * @returns Promise com Response
 */
export const authenticatedFetch = async (
  url: string, 
  options: AuthenticatedFetchOptions = {}
): Promise<Response> => {
  const { 
    includeAuth = true, 
    skipSessionHeaders = false, 
    headers: customHeaders = {},
    ...restOptions 
  } = options;

  // Criar headers base com API key
  const baseHeaders = createHeaders(url, {
    'X-Client-Version': '1.0.0',
    'X-Request-Source': 'authenticated-fetch',
    'X-Requested-With': 'XMLHttpRequest',
    ...(customHeaders as Record<string, string>)
  });

  // Adicionar token de autenticação se solicitado
  if (includeAuth) {
    const token = localStorageManager.getAuthToken();
    if (token) {
      baseHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Adicionar session_id e device_fingerprint se não for para pular
  if (!skipSessionHeaders) {
    try {
      // Obter session_id do localStorage
      const sessionId = localStorageManager.getSessionId();
      if (sessionId) {
        console.log("🔑 [AuthenticatedFetch] Incluindo session_id:", sessionId);
        baseHeaders['X-Session-ID'] = sessionId;
      } else {
        console.warn("⚠️ [AuthenticatedFetch] session_id não encontrado!");
      }
      
      // Obter device_fingerprint do localStorage
      const fingerprint = localStorageManager.getDeviceFingerprint();
      if (fingerprint) {
        // Se for objeto, usar a propriedade hash, se for string usar diretamente
        const fingerprintValue = typeof fingerprint === 'object' ? 
          (fingerprint.hash || JSON.stringify(fingerprint)) : 
          fingerprint;
          
        console.log("👆 [AuthenticatedFetch] Incluindo device_fingerprint:", fingerprintValue);
        baseHeaders['X-Device-Fingerprint'] = fingerprintValue;
      } else {
        console.warn("⚠️ [AuthenticatedFetch] device_fingerprint não encontrado!");
      }
    } catch (e) {
      console.error("❌ [AuthenticatedFetch] Erro ao adicionar dados de sessão:", e);
    }
  }

  // Executar fetch com headers completos
  return fetch(url, {
    ...restOptions,
    headers: baseHeaders
  });
};

/**
 * Wrapper conveniente para GET requests autenticados
 * @param url - URL da requisição
 * @param options - Opções adicionais
 * @returns Promise com dados JSON ou erro
 */
export const authenticatedGet = async (
  url: string, 
  options: Omit<AuthenticatedFetchOptions, 'method'> = {}
): Promise<any> => {
  const response = await authenticatedFetch(url, {
    ...options,
    method: 'GET'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || 
      errorData.error || 
      `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
};

/**
 * Wrapper conveniente para POST requests autenticados
 * @param url - URL da requisição
 * @param data - Dados para enviar no body
 * @param options - Opções adicionais
 * @returns Promise com dados JSON ou erro
 */
export const authenticatedPost = async (
  url: string, 
  data: any = {}, 
  options: Omit<AuthenticatedFetchOptions, 'method' | 'body'> = {}
): Promise<any> => {
  const response = await authenticatedFetch(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || 
      errorData.error || 
      `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
};

/**
 * Verificar se dados de sessão estão disponíveis
 * @returns boolean indicando se session_id e device_fingerprint estão presentes
 */
export const hasSessionData = (): boolean => {
  const sessionId = localStorageManager.getSessionId();
  const fingerprint = localStorageManager.getDeviceFingerprint();
  
  return !!(sessionId && fingerprint);
};

/**
 * Log de debug para verificar estado da sessão
 */
export const debugSessionState = (): void => {
  console.log("🔍 [SessionDebug] Estado atual da sessão:", {
    hasToken: !!localStorageManager.getAuthToken(),
    hasSessionId: !!localStorageManager.getSessionId(),
    hasFingerprint: !!localStorageManager.getDeviceFingerprint(),
    sessionId: localStorageManager.getSessionId(),
    fingerprint: localStorageManager.getDeviceFingerprint()
  });
};

// API Utilities - JWT Authentication Only
import { localStorageManager } from "./localStorage";

// Configuração do ambiente
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";
const API_KEY = import.meta.env.VITE_API_KEY || "}$gQ7TlDEhJ88np]^n8[uFu{9f#;+8qjZ&?c[+Sj_CLhMO[Z(iM_)ZnW]j2M]+j+";

/**
 * Utilitário para fazer chamadas API com autenticação JWT
 */
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BACKEND_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
      ...options.headers,
    },
    // Timeout de 30 segundos para produção
    signal: AbortSignal.timeout(30000),
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || errorData.message || `HTTP ${response.status}`,
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return response;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      endpoint,
    });

    throw error;
  }
};

/**
 * Utilitário para chamadas API autenticadas com token JWT
 */
export const authenticatedApiCall = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = localStorageManager.getAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  // Validar token JWT antes de fazer a requisição
  if (!isTokenValid(token)) {
    throw new Error("Token is expired or invalid");
  }

  return apiCall(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-API-Key": API_KEY,
      ...options.headers,
    },
  });
};

/**
 * Validador de token JWT
 */
const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
};

export { BACKEND_URL };

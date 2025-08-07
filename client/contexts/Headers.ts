/**
 * Headers - Modelos de headers mapeados para requisições API
 * Design Pattern: Centralização de headers por tipo de página/requisição
 */

import { createHeaders, shouldIncludeApiKey, getApiKey } from "@/lib/apiKeyUtils";

export interface HeaderModel {
  [key: string]: string;
}

// Headers base para todas as requisições
const BASE_HEADERS: HeaderModel = {
  "Content-Type": "application/json",
  "X-API-Key": getApiKey(), // Sempre incluir por padrão
};

// Headers para páginas públicas (sem autenticação)
export const PUBLIC_PAGE_HEADERS: HeaderModel = {
  ...BASE_HEADERS,
  "X-Client-Version": "1.0.0",
  "X-Request-Source": "public-page",
  "X-Requested-With": "XMLHttpRequest", // Header permitido pelo backend
};

// Headers para páginas privadas (com autenticação)
export const PRIVATE_PAGE_HEADERS: HeaderModel = {
  ...BASE_HEADERS,
  "X-Client-Version": "1.0.0",
  "X-Request-Source": "private-page",
  "X-Requested-With": "XMLHttpRequest", // Header permitido pelo backend
  // Authorization será adicionado dinamicamente via Rules
};

// Headers específicos por funcionalidade
export const HEADERS_MAP = {
  // Autenticação
  login: PUBLIC_PAGE_HEADERS,
  register: PUBLIC_PAGE_HEADERS,
  refreshToken: PUBLIC_PAGE_HEADERS,

  // Páginas públicas
  market: PUBLIC_PAGE_HEADERS,
  ranking: PUBLIC_PAGE_HEADERS,
  rankingPublic: PUBLIC_PAGE_HEADERS,
  demo: PUBLIC_PAGE_HEADERS,

  // Dashboard (privado)
  dashboard: PRIVATE_PAGE_HEADERS,
  dashboardStats: PRIVATE_PAGE_HEADERS,
  profile: PRIVATE_PAGE_HEADERS,
  logout: PRIVATE_PAGE_HEADERS,
  user: PRIVATE_PAGE_HEADERS,
  budget: PRIVATE_PAGE_HEADERS,

  // Orçamento
  custos: PRIVATE_PAGE_HEADERS,
  maioresCustos: PRIVATE_PAGE_HEADERS,
  custosCategoria: PRIVATE_PAGE_HEADERS,
  dividas: PRIVATE_PAGE_HEADERS,
  maioresDividas: PRIVATE_PAGE_HEADERS,
  dividasTipo: PRIVATE_PAGE_HEADERS,
  entradas: PRIVATE_PAGE_HEADERS,
  maioresEntradas: PRIVATE_PAGE_HEADERS,
  entradasTipo: PRIVATE_PAGE_HEADERS,
  variacaoEntrada: PRIVATE_PAGE_HEADERS,
  metas: PRIVATE_PAGE_HEADERS,
  metasProgresso: PRIVATE_PAGE_HEADERS,
  budgetOverview: PRIVATE_PAGE_HEADERS,
  distribuicaoGastos: PRIVATE_PAGE_HEADERS,

  // Investimentos
  investments: PRIVATE_PAGE_HEADERS,
  portfolio: PRIVATE_PAGE_HEADERS,
  alocacaoTipo: PRIVATE_PAGE_HEADERS,
  setores: PRIVATE_PAGE_HEADERS,
  dividendosFii: PRIVATE_PAGE_HEADERS,
  analytics: PRIVATE_PAGE_HEADERS,
  reports: PRIVATE_PAGE_HEADERS,

  // Market específico
  marketData: PUBLIC_PAGE_HEADERS,
  marketAnalysis: PUBLIC_PAGE_HEADERS,
  tickerAnalysis: PUBLIC_PAGE_HEADERS,
  fiiMarket: PUBLIC_PAGE_HEADERS,
  economicIndicators: PUBLIC_PAGE_HEADERS,
  calculator: PUBLIC_PAGE_HEADERS,
  wishlist: PUBLIC_PAGE_HEADERS,

  // Crypto
  crypto: PRIVATE_PAGE_HEADERS,
  cryptoPortfolio: PRIVATE_PAGE_HEADERS,
  cryptoMarket: PUBLIC_PAGE_HEADERS,

  // Sistema
  systemConfig: PRIVATE_PAGE_HEADERS,
  userSettings: PRIVATE_PAGE_HEADERS,
  notifications: PRIVATE_PAGE_HEADERS,
};

/**
 * Função para obter headers por chave
 * @param chave - Chave do header no mapa
 * @param withAuth - Se deve incluir token de autenticação
 * @param endpoint - Endpoint para verificar se necessita API_KEY
 * @returns Headers mapeados
 */
export const getHeaders = (
  chave: string,
  withAuth: boolean = false,
  endpoint?: string,
): HeaderModel => {
  const baseHeaders = HEADERS_MAP[chave] || PUBLIC_PAGE_HEADERS;

  // Criar headers inteligentes baseado no endpoint
  if (endpoint) {
    const smartHeaders = createHeaders(endpoint, baseHeaders);
    
    if (withAuth) {
      // Token será adicionado dinamicamente via Rules
      return {
        ...smartHeaders,
        // Placeholder para Authorization que será preenchido pelo Rules
      };
    }
    
    return smartHeaders;
  }

  if (withAuth) {
    // Token será adicionado dinamicamente via Rules
    return {
      ...baseHeaders,
      // Placeholder para Authorization que será preenchido pelo Rules
    };
  }

  return baseHeaders;
};

/**
 * Headers para upload de arquivos
 */
export const FILE_UPLOAD_HEADERS: HeaderModel = {
  "X-API-Key": getApiKey(),
  // Content-Type será definido automaticamente pelo FormData
};

/**
 * Headers para requisições de streaming
 */
export const STREAMING_HEADERS: HeaderModel = {
  ...BASE_HEADERS,
  Accept: "text/event-stream",
  "Cache-Control": "no-cache",
};

export default HEADERS_MAP;

/**
 * API Response Dictionary - Centralizador de todas as respostas de API do projeto
 * 
 * Este arquivo consolida todos os tipos de resposta e códigos de status das APIs
 * servindo como um dicionário unificado para tratamento de respostas.
 */

// ============= TIPOS BASE DE RESPOSTA =============

export interface BaseApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[] | Record<string, string[]>;
  timestamp?: string;
  status_code?: number;
}

export interface PaginatedResponse<T = any> extends BaseApiResponse<T[]> {
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[] | Record<string, string[]>;
  error_code?: string;
  status_code: number;
  timestamp: string;
}

// ============= CÓDIGOS DE STATUS HTTP =============

export const HTTP_STATUS = {
  // Success 2xx
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Client Error 4xx
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Error 5xx
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// ============= CÓDIGOS DE ERRO PERSONALIZADOS =============

export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'AUTH_001',
  TOKEN_EXPIRED: 'AUTH_002',
  TOKEN_INVALID: 'AUTH_003',
  ACCOUNT_LOCKED: 'AUTH_004',
  TWO_FACTOR_REQUIRED: 'AUTH_005',
  
  // Validation
  VALIDATION_ERROR: 'VAL_001',
  MISSING_REQUIRED_FIELD: 'VAL_002',
  INVALID_FORMAT: 'VAL_003',
  DUPLICATE_ENTRY: 'VAL_004',
  
  // Business Logic
  INSUFFICIENT_FUNDS: 'BIZ_001',
  OPERATION_NOT_ALLOWED: 'BIZ_002',
  LIMIT_EXCEEDED: 'BIZ_003',
  DATA_CONFLICT: 'BIZ_004',
  
  // System
  DATABASE_ERROR: 'SYS_001',
  EXTERNAL_SERVICE_ERROR: 'SYS_002',
  FILE_PROCESSING_ERROR: 'SYS_003',
  RATE_LIMIT_EXCEEDED: 'SYS_004',
} as const;

// ============= RESPOSTAS DE AUTENTICAÇÃO =============

export interface LoginResponse extends BaseApiResponse {
  data: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      email: string;
      name: string;
      is_verified: boolean;
      two_factor_enabled: boolean;
      profile_picture?: string;
    };
    expires_in: number;
  };
}

export interface RefreshTokenResponse extends BaseApiResponse {
  data: {
    access_token: string;
    expires_in: number;
  };
}

export interface TwoFactorSetupResponse extends BaseApiResponse {
  data: {
    qr_code: string;
    secret_key: string;
    backup_codes: string[];
  };
}

export interface TwoFactorVerifyResponse extends BaseApiResponse {
  data: {
    backup_codes: string[];
    is_enabled: boolean;
  };
}

// ============= RESPOSTAS DE ORÇAMENTO =============

export interface BudgetListResponse extends PaginatedResponse {
  data: Array<{
    id: number;
    tipo: string;
    categoria: string;
    descricao: string;
    valor: number;
    valor_mensal: number;
    mes: number;
    ano: number;
    data?: string;
    data_vencimento?: string;
    status?: 'pendente' | 'pago' | 'vencido';
    recorrente?: boolean;
    juros?: number;
  }>;
}

export interface BudgetCreateResponse extends BaseApiResponse {
  data: {
    id: number;
    tipo: string;
    categoria: string;
    descricao: string;
    valor: number;
    created_at: string;
  };
}

export interface BudgetOverviewResponse extends BaseApiResponse {
  data: {
    variacao_entrada: Array<{
      mes: number;
      ano: number;
      valor_total: number;
      variacao_percentual?: number;
    }>;
    distribuicao_gastos: Array<{
      categoria: string;
      valor: number;
      percentual: number;
    }>;
    total_entrada: number;
    total_gastos: number;
    saldo_atual: number;
    meta_mensal?: number;
  };
}

// ============= RESPOSTAS DE INVESTIMENTOS =============

export interface InvestmentAllocationResponse extends BaseApiResponse {
  data: {
    porcentagem_alocacao: {
      Acoes: number;
      "Fundos Imobiliários": number;
      "Renda Fixa": number;
      "Criptomoedas"?: number;
      "Outros"?: number;
    };
    valor_total_portfolio: number;
    ultima_atualizacao: string;
  };
}

export interface SectorAllocationResponse extends BaseApiResponse {
  data: {
    setores: Array<{
      setor_atividade: string;
      valor_total_setor: number;
      percentual_do_total: number;
      acoes: Array<{
        ticker: string;
        valor_total: number;
        quantidade: number;
        preco_medio: number;
      }>;
    }>;
  };
}

export interface DividendsResponse extends BaseApiResponse {
  data: {
    valores_totais_por_mes: Array<{
      data_referencia: string;
      valor_total: number;
    }>;
    resumo: Array<{
      ticker: string;
      dados: Array<{
        data_referencia: string;
        valor_hoje: number;
        yield_on_cost?: number;
      }>;
    }>;
    total_ano: number;
    media_mensal: number;
  };
}

// ============= RESPOSTAS DE CRIPTO =============

export interface CryptoPriceResponse extends BaseApiResponse {
  data: Array<{
    symbol: string;
    name: string;
    price_usd: number;
    price_brl: number;
    change_24h: number;
    change_7d: number;
    market_cap: number;
    volume_24h: number;
    last_updated: string;
  }>;
}

export interface CryptoPortfolioResponse extends BaseApiResponse {
  data: {
    holdings: Array<{
      symbol: string;
      name: string;
      amount: number;
      average_price: number;
      current_price: number;
      total_value: number;
      profit_loss: number;
      profit_loss_percentage: number;
    }>;
    total_portfolio_value: number;
    total_profit_loss: number;
    total_profit_loss_percentage: number;
  };
}

// ============= RESPOSTAS DE MERCADO =============

export interface FIIListResponse extends PaginatedResponse {
  data: Array<{
    ticker: string;
    name: string;
    price: number;
    change_percentage: number;
    dividend_yield: number;
    p_vp: number;
    liquidity: number;
    sector: string;
    last_dividend: {
      date: string;
      value: number;
    };
  }>;
}

export interface EconomicIndicatorsResponse extends BaseApiResponse {
  data: {
    selic: {
      current: number;
      previous: number;
      change: number;
      last_update: string;
    };
    ipca: {
      current: number;
      accumulated_12m: number;
      target: number;
      last_update: string;
    };
    usd_brl: {
      current: number;
      change_percentage: number;
      last_update: string;
    };
    bovespa: {
      current: number;
      change_percentage: number;
      last_update: string;
    };
  };
}

export interface TickerAnalysisResponse extends BaseApiResponse {
  data: {
    ticker: string;
    company_name: string;
    sector: string;
    current_price: number;
    target_price: number;
    recommendation: 'COMPRA' | 'VENDA' | 'NEUTRO';
    fundamentals: {
      p_e: number;
      p_vp: number;
      roe: number;
      roa: number;
      dividend_yield: number;
      debt_to_equity: number;
    };
    technical_analysis: {
      trend: 'ALTA' | 'BAIXA' | 'LATERAL';
      support_levels: number[];
      resistance_levels: number[];
      rsi: number;
      moving_averages: {
        ma_20: number;
        ma_50: number;
        ma_200: number;
      };
    };
    price_history: Array<{
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
  };
}

// ============= MENSAGENS DE ERRO PADRONIZADAS =============

export const ERROR_MESSAGES = {
  // Authentication
  [ERROR_CODES.INVALID_CREDENTIALS]: 'E-mail ou senha incorretos',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Sua sessão expirou. Faça login novamente',
  [ERROR_CODES.TOKEN_INVALID]: 'Token de autenticação inválido',
  [ERROR_CODES.ACCOUNT_LOCKED]: 'Conta bloqueada. Entre em contato com o suporte',
  [ERROR_CODES.TWO_FACTOR_REQUIRED]: 'Autenticação de dois fatores requerida',
  
  // Validation
  [ERROR_CODES.VALIDATION_ERROR]: 'Dados inválidos fornecidos',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Campos obrigatórios não preenchidos',
  [ERROR_CODES.INVALID_FORMAT]: 'Formato de dados inválido',
  [ERROR_CODES.DUPLICATE_ENTRY]: 'Registro já existe',
  
  // Business Logic
  [ERROR_CODES.INSUFFICIENT_FUNDS]: 'Saldo insuficiente para realizar a operação',
  [ERROR_CODES.OPERATION_NOT_ALLOWED]: 'Operação não permitida',
  [ERROR_CODES.LIMIT_EXCEEDED]: 'Limite excedido',
  [ERROR_CODES.DATA_CONFLICT]: 'Conflito de dados. Tente novamente',
  
  // System
  [ERROR_CODES.DATABASE_ERROR]: 'Erro interno. Tente novamente mais tarde',
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'Serviço temporariamente indisponível',
  [ERROR_CODES.FILE_PROCESSING_ERROR]: 'Erro ao processar arquivo',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Muitas tentativas. Tente novamente em alguns minutos',
  
  // Generic
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
  UNKNOWN_ERROR: 'Erro inesperado. Tente novamente',
  MAINTENANCE: 'Sistema em manutenção. Tente novamente mais tarde',
} as const;

// ============= MENSAGENS DE SUCESSO PADRONIZADAS =============

export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login realizado com sucesso',
  LOGOUT_SUCCESS: 'Logout realizado com sucesso',
  REGISTRATION_SUCCESS: 'Conta criada com sucesso',
  PASSWORD_RESET_SENT: 'E-mail de recuperação enviado',
  PASSWORD_RESET_SUCCESS: 'Senha alterada com sucesso',
  TWO_FACTOR_ENABLED: 'Autenticação de dois fatores ativada',
  TWO_FACTOR_DISABLED: 'Autenticação de dois fatores desativada',
  
  // CRUD Operations
  CREATE_SUCCESS: 'Registro criado com sucesso',
  UPDATE_SUCCESS: 'Registro atualizado com sucesso',
  DELETE_SUCCESS: 'Registro excluído com sucesso',
  
  // Budget
  BUDGET_CREATED: 'Orçamento criado com sucesso',
  EXPENSE_ADDED: 'Gasto adicionado com sucesso',
  INCOME_ADDED: 'Entrada adicionada com sucesso',
  GOAL_UPDATED: 'Meta atualizada com sucesso',
  
  // Investments
  INVESTMENT_ADDED: 'Investimento adicionado com sucesso',
  PORTFOLIO_UPDATED: 'Portfólio atualizado com sucesso',
  
  // Profile
  PROFILE_UPDATED: 'Perfil atualizado com sucesso',
  PREFERENCES_SAVED: 'Preferências salvas com sucesso',
} as const;

// ============= FUNÇÕES UTILITÁRIAS =============

/**
 * Verifica se uma resposta é de sucesso
 */
export function isSuccessResponse<T>(response: BaseApiResponse<T>): response is BaseApiResponse<T> & { success: true } {
  return response.success === true;
}

/**
 * Verifica se uma resposta é de erro
 */
export function isErrorResponse(response: BaseApiResponse): response is ErrorResponse {
  return response.success === false;
}

/**
 * Extrai mensagem de erro de uma resposta
 */
export function getErrorMessage(response: BaseApiResponse | Error, fallback: string = ERROR_MESSAGES.UNKNOWN_ERROR): string {
  if (response instanceof Error) {
    return response.message || fallback;
  }
  
  if (isErrorResponse(response)) {
    // Verifica se existe mensagem para o código de erro
    const errorCode = response.error_code as keyof typeof ERROR_MESSAGES;
    if (errorCode && ERROR_MESSAGES[errorCode]) {
      return ERROR_MESSAGES[errorCode];
    }
    
    return response.message || fallback;
  }
  
  return fallback;
}

/**
 * Formata resposta de erro para exibição
 */
export function formatErrorForDisplay(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  // Network errors
  if (error?.code === 'NETWORK_ERROR' || error?.name === 'NetworkError') {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Cria resposta de erro padrão
 */
export function createErrorResponse(
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errorCode?: string,
  errors?: string[] | Record<string, string[]>
): ErrorResponse {
  return {
    success: false,
    message,
    status_code: statusCode,
    error_code: errorCode,
    errors,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Cria resposta de sucesso padrão
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): BaseApiResponse<T> {
  return {
    success: true,
    data,
    message,
    status_code: statusCode,
    timestamp: new Date().toISOString(),
  };
}

// ============= TIPOS DE EXPORTAÇÃO =============

export type ApiResponse<T = any> = BaseApiResponse<T> | ErrorResponse;
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
export type SuccessMessage = typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES];

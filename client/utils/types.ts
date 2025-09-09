/**
 * Definições de tipos comuns utilizados em toda a aplicação
 * Centraliza os tipos para facilitar a manutenção e consistência
 */

// Tipo para Locale do date-fns
export type Locale = {
  code?: string;
  formatLong?: {
    date: (options?: { width?: string }) => string;
    time: (options?: { width?: string }) => string;
    dateTime: (options?: { width?: string }) => string;
  };
  [key: string]: any;
};

// Tipos de entradas financeiras
export type IncomeType = 
  | 'salario'
  | 'freelance'
  | 'rendimentos'
  | 'aluguel'
  | 'dividendos'
  | 'outros';

// Tipos de custos/despesas
export type CostType = 
  | 'moradia'
  | 'alimentacao'
  | 'transporte'
  | 'lazer'
  | 'saude'
  | 'educacao'
  | 'vestuario'
  | 'assinaturas'
  | 'impostos'
  | 'outros';

// Tipos de dívidas
export type DebtType = 
  | 'cartao'
  | 'emprestimo'
  | 'financiamento'
  | 'pessoal'
  | 'outro';

// Status de dívidas
export type DebtStatus = 
  | 'aberto'
  | 'atrasado'
  | 'quitado'
  | 'renegociado'
  | 'parcelado';

// Tipos de investimentos
export type InvestmentType = 
  | 'acoes'
  | 'fiis'
  | 'fundos'
  | 'tesouro'
  | 'poupanca'
  | 'cdb'
  | 'debentures'
  | 'cripto'
  | 'previdencia'
  | 'exterior'
  | 'outros';

// Modelo para entrada de receita
export interface Income {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: IncomeType;
  date: string; // ISO format
  recurring: boolean;
  recurrenceInfo?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: string;
  };
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Modelo para despesa/custo
export interface Cost {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: CostType;
  date: string; // ISO format
  recurring: boolean;
  paid: boolean;
  recurrenceInfo?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: string;
  };
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Modelo para dívida
export interface Debt {
  id: string;
  userId: string;
  description: string;
  amount: number;
  remainingAmount: number;
  type: DebtType;
  status: DebtStatus;
  startDate: string; // ISO format
  dueDate: string; // ISO format
  installments?: number;
  installmentAmount?: number;
  interestRate?: number;
  creditor?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Modelo para investimento
export interface Investment {
  id: string;
  userId: string;
  name: string;
  ticker?: string;
  type: InvestmentType;
  institution?: string;
  initialAmount: number;
  currentAmount: number;
  acquisitionDate: string; // ISO format
  maturityDate?: string; // ISO format
  profitability?: number; // percentage
  fixedIncome: boolean;
  risk?: 'low' | 'medium' | 'high';
  notes?: string;
  tags?: string[];
  lastUpdate: string;
  createdAt: string;
  updatedAt: string;
}

// Modelo para meta financeira
export interface Goal {
  id: string;
  userId: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string; // ISO format
  targetDate: string; // ISO format
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipo para dados de série temporal
export interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

// Tipo para dados de gráfico de pizza/donut
export interface PieChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

// Interface para filtros comuns
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
}

// Interface para paginação
export interface PaginationParams {
  page: number;
  pageSize: number;
  totalItems?: number;
  totalPages?: number;
}

// Interface para resultado paginado
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Interface para ordenação
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Interface para resposta de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

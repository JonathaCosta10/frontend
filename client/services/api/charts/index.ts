// Charts API Index - Central export for all chart-related APIs
// This file organizes all chart APIs by module, similar to pages structure

// Budget Charts (Orçamento)
export { budgetChartsApi } from './orcamento';
export { custosChartsApi } from './custos';
export type { ChartDataPoint, MonthlyData } from './orcamento';

// Investment Charts (Investimentos)
export { investmentChartsApi } from './investimentos';
export type { 
  InvestmentAllocation, 
  SectorAllocation, 
  DividendData 
} from './investimentos';

// Crypto Charts (Cripto)
export { cryptoChartsApi } from './cripto';
export type { 
  CryptoPrice, 
  CryptoHolding, 
  CryptoHistorical 
} from './cripto';

// Market Charts (Mercado)
export { marketChartsApi } from './mercado';
export type { 
  FIIData, 
  IndicadorEconomico, 
  TickerAnalysis 
} from './mercado';

// Chart API Registry - Maps routes to their respective APIs
export const chartApiRegistry = {
  // Budget routes
  '/dashboard/orcamento': budgetChartsApi,
  '/dashboard/orcamento/entradas': budgetChartsApi,
  '/dashboard/orcamento/custos': custosChartsApi,
  '/dashboard/orcamento/dividas': budgetChartsApi,
  '/dashboard/orcamento/metas': budgetChartsApi,

  // Investment routes
  '/dashboard/investimentos': investmentChartsApi,
  '/dashboard/investimentos/comparativos': investmentChartsApi,
  '/dashboard/investimentos/cadastro': investmentChartsApi,
  '/dashboard/investimentos/ranking': investmentChartsApi,
  '/dashboard/investimentos/patrimonio': investmentChartsApi,

  // Crypto routes
  '/dashboard/cripto': cryptoChartsApi,
  '/dashboard/cripto/analise': cryptoChartsApi,
  '/dashboard/cripto/lista-desejos': cryptoChartsApi,
  '/dashboard/cripto/informacoes': cryptoChartsApi,

  // Market routes
  '/dashboard/mercado': marketChartsApi,
  '/dashboard/mercado/indicadores-economicos': marketChartsApi,
  '/dashboard/mercado/lista-de-desejo': marketChartsApi,
  '/dashboard/mercado/analise-ticker': marketChartsApi,
  '/dashboard/mercado/calculadora-financeira': marketChartsApi,
};

// Helper function to get API for current route
export const getChartApiForRoute = (pathname: string) => {
  return chartApiRegistry[pathname as keyof typeof chartApiRegistry];
};

// API Endpoints Documentation
export const API_ENDPOINTS = {
  BUDGET: {
    VARIACAO_ENTRADA: '/api/orcamento/grafico_variacao_entrada',
    META_MES_MES: '/api/orcamento/grafico_meta_mes_mes',
    DISTRIBUICAO_GASTOS: '/api/orcamento/grafico_distribuicao_gastos',
    DASHBOARD_OVERVIEW: '/api/orcamento/dashboard_overview',
  },
  INVESTMENTS: {
    ALOCACAO_TIPO: '/api/investimentos/grafico_alocacao_tipo',
    SETORIAL_ACOES: '/api/investimentos/grafico_setorial_acoes',
    DIVIDENDOS_FII: '/api/investimentos/grafico_dividendos_fii',
    DASHBOARD_OVERVIEW: '/api/investimentos/dashboard_overview',
    PERFORMANCE_PERIODO: '/api/investimentos/performance_periodo',
  },
  CRYPTO: {
    PRECOS_TEMPO_REAL: '/api/cripto/precos_tempo_real',
    PORTFOLIO: '/api/cripto/portfolio',
    HISTORICO_PRECOS: '/api/cripto/historico_precos',
    MARKET_OVERVIEW: '/api/cripto/market_overview',
    TOP_MOVERS: '/api/cripto/top_movers',
  },
  MARKET: {
    FIIS_LISTA: '/api/mercado/fiis_lista',
    INDICADORES_ECONOMICOS: '/api/mercado/indicadores_economicos',
    ANALISE_TICKER: '/api/mercado/analise_ticker',
    LISTA_DESEJOS: '/api/mercado/lista_desejos',
    PERFORMANCE_SETOR: '/api/mercado/performance_setor',
    RANKING_FIIS: '/api/mercado/ranking_fiis',
  },
} as const;

// Import APIs for registry usage
import { budgetChartsApi } from './orcamento';
import { custosChartsApi } from './custos';
import { investmentChartsApi } from './investimentos';
import { cryptoChartsApi } from './cripto';
import { marketChartsApi } from './mercado';

/**
 * Rotas - Todas as URLs da API organizadas e importáveis
 * Design Pattern: Centralização de endpoints com acesso via import
 */

// Base URL da API
const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

// Rotas de Autenticação
export const AUTH_ROUTES = {
  login: "/api/auth/login/",
  register: "/api/auth/register/",
  refreshToken: "/api/auth/token/refresh/",
  logout: "/api/auth/logout/",
  user: "/api/auth/user/",
  profile: "/api/auth/profile/",
  changePassword: "/api/auth/change-password/",
  resetPassword: "/api/auth/reset-password/",
  confirmEmail: "/api/auth/confirm-email/",
};

// Rotas de Dashboard
export const DASHBOARD_ROUTES = {
  overview: "/api/dashboard/overview/",
  stats: "/api/dashboard/stats/",
  recent: "/api/dashboard/recent/",
  notifications: "/api/dashboard/notifications/",
};

// Rotas de Orçamento
export const BUDGET_ROUTES = {
  // Custos
  custos: "/api/budget/custos/",
  maioresCustos: "/api/maiores_custos",
  custosCategoria: "/api/budget/custos/categoria/",
  cadastrarCusto: "/api/cadastrar_custo/",
  excluirCusto: "/api/excluir_custo/",
  atualizarFlagCusto: "/api/atualizar_flag_custo/",

  // Dívidas
  dividas: "/api/budget/dividas/",
  maioresDividas: "/api/maiores_dividas",
  dividasTipo: "/api/budget/dividas/tipo/",
  cadastrarDivida: "/api/cadastrar_divida/",
  excluirDivida: "/api/excluir_divida/",
  atualizarFlagDivida: "/api/atualizar_flag_divida/",

  // Entradas
  entradas: "/api/budget/entradas/",
  maioresEntradas: "/api/maiores_entradas",
  entradasTipo: "/api/budget/entradas/tipo/",
  variacao_entrada: "/api/variacao_entrada",
  cadastrarEntrada: "/api/cadastrar_entrada/",
  excluirEntrada: "/api/excluir_entrada/",
  atualizarFlagEntrada: "/api/atualizar_flag_entrada/",

  // Metas
  metas: "/api/budget/metas/",
  metasProgresso: "/api/budget/metas/progresso/",
  metasCategoria: "/api/budget/metas/categoria/",

  // Overview
  overview: "/api/budget_overview",
  distribuicao_gastos: "/api/distribuicao_gastos",
  summary: "/api/budget/summary/",
};

// Rotas de Investimentos
export const INVESTMENT_ROUTES = {
  // Portfolio
  portfolio: "/api/investments/portfolio/",
  alocacao_tipo: "/api/alocacao_tipo",
  setores: "/api/setores",

  // Ações
  acoes: "/api/investments/acoes/",
  acoesSetores: "/api/investments/acoes/setores/",
  acoesRanking: "/api/investments/acoes/ranking/",

  // FIIs
  fiis: "/api/investments/fiis/",
  dividendos_fii: "/api/dividendos_fii",
  fiisRanking: "/api/investments/fiis/ranking/",

  // Análises
  analysis: "/api/investments/analysis/",
  comparatives: "/api/investments/comparatives/",
  performance: "/api/investments/performance/",

  // Reports
  reports: "/api/investments/reports/",
  exportData: "/api/investments/export/",
};

// Rotas de Market (Públicas)
export const MARKET_ROUTES = {
  // Dados de mercado
  marketData: "/api/market/data/",
  marketOverview: "/api/market/overview/",

  // Ranking público
  rankingPublic: "/api/rankingPublic/",
  ranking: "/api/market/ranking/",

  // Análises de ticker
  tickerAnalysis: "/api/market/ticker/analysis/",
  tickerData: "/api/market/ticker/",

  // FII Market
  fiiMarket: "/api/market/fii/",
  fiiData: "/api/market/fii/data/",

  // Indicadores econômicos
  economicIndicators: "/api/market/economic-indicators/",
  indicators: "/api/market/indicators/",

  // Calculadora financeira
  calculator: "/api/market/calculator/",
  financialCalculator: "/api/market/financial-calculator/",

  // Lista de desejos
  wishlist: "/api/market/wishlist/",
  wishlistPublic: "/api/market/wishlist/public/",
};

// Rotas de Crypto
export const CRYPTO_ROUTES = {
  overview: "/api/crypto/overview/",
  portfolio: "/api/crypto/portfolio/",
  market: "/api/crypto/market/",
  analysis: "/api/crypto/analysis/",
  wishlist: "/api/crypto/wishlist/",
  trading: "/api/crypto/trading/",
};

// Rotas do Sistema
export const SYSTEM_ROUTES = {
  config: "/api/system/config/",
  settings: "/api/system/settings/",
  logs: "/api/system/logs/",
  health: "/api/system/health/",
  version: "/api/system/version/",
};

// Rotas de Upload
export const UPLOAD_ROUTES = {
  avatar: "/api/upload/avatar/",
  documents: "/api/upload/documents/",
  reports: "/api/upload/reports/",
  import: "/api/upload/import/",
};

// Mapa principal de rotas
export const ROUTES_MAP: Record<string, string> = {
  // Auth
  login: AUTH_ROUTES.login,
  register: AUTH_ROUTES.register,
  refreshToken: AUTH_ROUTES.refreshToken,
  logout: AUTH_ROUTES.logout,
  user: AUTH_ROUTES.user,
  profile: AUTH_ROUTES.profile,

  // Dashboard
  dashboard: DASHBOARD_ROUTES.overview,
  dashboardStats: DASHBOARD_ROUTES.stats,

  // Budget - Custos
  custos: BUDGET_ROUTES.custos,
  maioresCustos: BUDGET_ROUTES.maioresCustos,
  custosCategoria: BUDGET_ROUTES.custosCategoria,
  cadastrarCusto: BUDGET_ROUTES.cadastrarCusto,
  excluirCusto: BUDGET_ROUTES.excluirCusto,
  atualizarFlagCusto: BUDGET_ROUTES.atualizarFlagCusto,

  // Budget - Dívidas
  dividas: BUDGET_ROUTES.dividas,
  maioresDividas: BUDGET_ROUTES.maioresDividas,
  dividasTipo: BUDGET_ROUTES.dividasTipo,
  cadastrarDivida: BUDGET_ROUTES.cadastrarDivida,
  excluirDivida: BUDGET_ROUTES.excluirDivida,
  atualizarFlagDivida: BUDGET_ROUTES.atualizarFlagDivida,

  // Budget - Entradas
  entradas: BUDGET_ROUTES.entradas,
  maioresEntradas: BUDGET_ROUTES.maioresEntradas,
  entradasTipo: BUDGET_ROUTES.entradasTipo,
  variacaoEntrada: BUDGET_ROUTES.variacao_entrada,
  cadastrarEntrada: BUDGET_ROUTES.cadastrarEntrada,
  excluirEntrada: BUDGET_ROUTES.excluirEntrada,
  atualizarFlagEntrada: BUDGET_ROUTES.atualizarFlagEntrada,

  // Budget - Metas
  metas: BUDGET_ROUTES.metas,
  metasProgresso: BUDGET_ROUTES.metasProgresso,

  // Budget - Overview
  budgetOverview: BUDGET_ROUTES.overview,
  distribuicaoGastos: BUDGET_ROUTES.distribuicao_gastos,

  // Investments
  investments: INVESTMENT_ROUTES.portfolio,
  portfolio: INVESTMENT_ROUTES.portfolio,
  alocacaoTipo: INVESTMENT_ROUTES.alocacao_tipo,
  setores: INVESTMENT_ROUTES.setores,
  dividendosFii: INVESTMENT_ROUTES.dividendos_fii,

  // Market
  market: MARKET_ROUTES.marketData,
  ranking: MARKET_ROUTES.ranking,
  rankingPublic: MARKET_ROUTES.rankingPublic,
  tickerAnalysis: MARKET_ROUTES.tickerAnalysis,
  fiiMarket: MARKET_ROUTES.fiiMarket,
  economicIndicators: MARKET_ROUTES.economicIndicators,
  calculator: MARKET_ROUTES.calculator,
  wishlist: MARKET_ROUTES.wishlist,

  // Crypto
  crypto: CRYPTO_ROUTES.overview,
  cryptoPortfolio: CRYPTO_ROUTES.portfolio,
  cryptoMarket: CRYPTO_ROUTES.market,

  // System
  systemConfig: SYSTEM_ROUTES.config,
  userSettings: SYSTEM_ROUTES.settings,
};

/**
 * Função para obter rota por chave
 * @param chave - Chave da rota no mapa
 * @returns URL completa da rota
 */
export const getRoute = (chave: string): string => {
  const route = ROUTES_MAP[chave];
  if (!route) {
    console.warn(
      `Rota não encontrada para chave: ${chave}. Rotas disponíveis:`,
      Object.keys(ROUTES_MAP),
    );
    return "";
  }
  return route;
};

/**
 * Fun��ão para obter URL completa
 * @param chave - Chave da rota
 * @returns URL completa com base
 */
export const getFullUrl = (chave: string): string => {
  const route = getRoute(chave);
  return route ? `${API_BASE}${route}` : "";
};

export default ROUTES_MAP;

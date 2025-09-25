/**
 * Rotas - Todas as URLs da API organizadas e importáveis
 * Design Pattern: Centralização de endpoints com acesso via import
 */

// Base URL da API
const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

// Rotas de Autenticação
export const AUTH_ROUTES = {
  // Rotas principais (compatíveis com todos os endpoints listados)
  login: "/auth/login/",
  register: "/auth/register/",
  refreshToken: "/auth/token/refresh/",
  logout: "/auth/logout/",
  user: "/auth/user/",
  profile: "/auth/profile/",
  changePassword: "/auth/change-password/",
  resetPassword: "/auth/recuperar-senha/",
  validarRedefinirSenha: "/auth/validar-redefinir-senha/",
  confirmEmail: "/auth/confirm-email/",
  // Google OAuth (canonical paths – backend aceita variações)
  googleSignin: "/auth/google/signin/",
  googleStatus: "/auth/google/status/",
  googleDisconnect: "/auth/google/disconnect/",
};

// Rotas de Dashboard
export const DASHBOARD_ROUTES = {
  overview: "/dashboard/overview/",
  stats: "/dashboard/stats/",
  recent: "/dashboard/recent/",
  notifications: "/dashboard/notifications/",
  infodaily: "/infodaily/",
  marketIndices: "/infodaily/",
  marketInsights: "/insights-mercado/",
};

// Rotas de Orçamento
export const BUDGET_ROUTES = {
  // Custos
  custos: "/budget/custos/",
  maioresCustos: "/maiores_custos",
  custosCategoria: "/budget/custos/categoria/",
  cadastrarCusto: "/cadastrar_custo/",
  excluirCusto: "/excluir_custo/",
  atualizarFlagCusto: "/atualizar_flag_custo/",

  // Dívidas
  dividas: "/budget/dividas/",
  maioresDividas: "/maiores_dividas",
  dividasTipo: "/budget/dividas/tipo/",
  cadastrarDivida: "/cadastrar_divida/",
  excluirDivida: "/excluir_divida/",
  atualizarFlagDivida: "/atualizar_flag_divida/",

  // Entradas
  entradas: "/budget/entradas/",
  maioresEntradas: "/maiores_entradas",
  entradasTipo: "/budget/entradas/tipo/",
  variacao_entrada: "/variacao_entrada",
  cadastrarEntrada: "/cadastrar_entrada/",
  excluirEntrada: "/excluir_entrada/",
  atualizarFlagEntrada: "/atualizar_flag_entrada/",

  // Metas
  metas: "/budget/metas/",
  metasProgresso: "/budget/metas/progresso/",
  metasCategoria: "/budget/metas/categoria/",

  // Overview
  overview: "/budget_overview",
  distribuicao_gastos: "/distribuicao_gastos",
  summary: "/budget/summary/",
};

// Rotas de Investimentos
export const INVESTMENT_ROUTES = {
  // Portfolio
  portfolio: "/investments/portfolio/",
  alocacao_tipo: "/api/alocacao_tipo",
  setores: "/api/setores",

  // Ações
  acoes: "/investments/acoes/",
  acoesSetores: "/investments/acoes/setores/",
  acoesRanking: "/investments/acoes/ranking/",

  // FIIs
  fiis: "/investments/fiis/",
  dividendos_fii: "/api/dividendos_fii",
  fiisRanking: "/investments/fiis/ranking/",

  // Análises
  analysis: "/investments/analysis/",
  comparatives: "/investments/comparatives/",
  performance: "/investments/performance/",

  // Reports
  reports: "/investments/reports/",
  exportData: "/investments/export/",

  // Investimentos Pessoais - NOVAS APIs (URLs corrigidas conforme backend)
  buscarTickers: "/api/investimentos/buscar-tickers/",
  buscarTickersFII: "/api/investimentos/buscar-tickers/fii/",
  buscarTickersAcoes: "/api/investimentos/buscar-tickers/acoes/",
  ativosPessoais: "/api/investimentos/ativos-pessoais/",
  cadastrarAtivo: "/api/investimentos/ativos-pessoais/",
  editarAtivo: "/api/investimentos/ativos-pessoais/",
  excluirAtivo: "/api/investimentos/ativos-pessoais/deletar/",
  resumoCarteira: "/api/investimentos/resumo-carteira/",
  analiseAtivo: "/api/investimentos/analise-ativo/",
};

// Rotas de Market (Públicas)
export const MARKET_ROUTES = {
  // Dados de mercado
  marketData: "/market/data/",
  marketOverview: "/market/overview/",

  // Ranking público
  rankingPublic: "/rankingPublic/",
  ranking: "/market/ranking/",

  // Análises de ticker
  tickerAnalysis: "/market/ticker/analysis/",
  tickerData: "/market/ticker/",

  // FII Market
  fiiMarket: "/market/fii/",
  fiiData: "/market/fii/data/",

  // Indicadores econômicos
  economicIndicators: "/market/economic-indicators/",
  indicators: "/market/indicators/",

  // Calculadora financeira
  calculator: "/market/calculator/",
  financialCalculator: "/market/financial-calculator/",

  // Lista de desejos
  wishlist: "/market/wishlist/",
  wishlistPublic: "/market/wishlist/public/",
};

// Rotas de Crypto
export const CRYPTO_ROUTES = {
  overview: "/crypto/overview/",
  portfolio: "/crypto/portfolio/",
  market: "/market/crypto/",
  analysis: "/crypto/analysis/",
  wishlist: "/crypto/wishlist/",
  trading: "/crypto/trading/",
};

// Rotas do Sistema
export const SYSTEM_ROUTES = {
  config: "/system/config/",
  settings: "/system/settings/",
  logs: "/system/logs/",
  health: "/system/health/",
  version: "/system/version/",
};

// Rotas de Upload
export const UPLOAD_ROUTES = {
  avatar: "/upload/avatar/",
  documents: "/upload/documents/",
  reports: "/upload/reports/",
  import: "/upload/import/",
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
  // Google OAuth
  googleSignin: AUTH_ROUTES.googleSignin,
  googleStatus: AUTH_ROUTES.googleStatus,
  googleDisconnect: AUTH_ROUTES.googleDisconnect,

  // Dashboard
  dashboard: DASHBOARD_ROUTES.overview,
  dashboardStats: DASHBOARD_ROUTES.stats,
  infodaily: DASHBOARD_ROUTES.infodaily,
  marketIndices: DASHBOARD_ROUTES.marketIndices,
  marketInsights: DASHBOARD_ROUTES.marketInsights,

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

  // Investimentos Pessoais - NOVAS APIs
  buscarTickers: INVESTMENT_ROUTES.buscarTickers,
  buscarTickersFII: INVESTMENT_ROUTES.buscarTickersFII,
  buscarTickersAcoes: INVESTMENT_ROUTES.buscarTickersAcoes,
  ativosPessoais: INVESTMENT_ROUTES.ativosPessoais,
  cadastrarAtivo: INVESTMENT_ROUTES.cadastrarAtivo,
  editarAtivo: INVESTMENT_ROUTES.editarAtivo,
  excluirAtivo: INVESTMENT_ROUTES.excluirAtivo,
  resumoCarteira: INVESTMENT_ROUTES.resumoCarteira,
  analiseAtivo: INVESTMENT_ROUTES.analiseAtivo,

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

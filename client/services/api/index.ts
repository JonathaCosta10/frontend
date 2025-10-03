                                  // API Services - Centralized exports
export { budgetApi } from './budget';
export { investmentsApi } from './investments';
export { authApi } from './auth';
export { cadastroApi } from './cadastro';
export { marketApi } from './market';

// Response Dictionary - Centralized response types and utilities
export * from './response-dictionary';

// Charts APIs - Organized by module (similar to pages structure)
export {
  budgetChartsApi,
  investmentChartsApi,
  cryptoChartsApi,
  marketChartsApi,
  chartApiRegistry,
  getChartApiForRoute,
  API_ENDPOINTS
} from './charts';

// Types exports
export type {
  VariacaoEntrada,
  DistribuicaoGastos,
  BudgetResponse
} from './budget';

export type {
  AlocacaoTipo,
  SetorInfo,
  DividendosResponse
} from './investments';

export type {
  TwoFactorSetupResponse,
  TwoFactorVerifyResponse
} from './auth';

export type {
  BaseCadastroItem,
  CadastroResponse,
  CadastroListResponse,
  InvestmentCadastro,
  BudgetCadastro,
  GoalCadastro,
  WatchlistCadastro
} from './cadastro';

export type {
  TickerData,
  SetorData,
  AcoesPerenes,
  FiisPerenes,
  ResumoData,
  DestaquesGeraisData,
  DestaquesGeraisResponse
} from './market';

// Charts types
export type {
  ChartDataPoint,
  MonthlyData,
  InvestmentAllocation,
  SectorAllocation,
  DividendData,
  CryptoPrice,
  CryptoHolding,
  CryptoHistorical,
  FIIData,
  IndicadorEconomico,
  TickerAnalysis
} from './charts';

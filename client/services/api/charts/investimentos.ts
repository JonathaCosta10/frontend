// Investments Charts API Service
import { developmentConfig, simulateApiDelay } from "../../config/development";

export interface InvestmentAllocation {
  tipo: string;
  valor: number;
  percentual: number;
  color: string;
}

export interface SectorAllocation {
  setor: string;
  valor: number;
  percentual: number;
  acoes: string[];
}

export interface DividendData {
  ticker: string;
  valor: number;
  data: string;
  yieldOnCost: number;
}

// API endpoints for investment charts
export const investmentChartsApi = {
  // Gráfico de Alocação por Tipo - /api/investimentos/grafico_alocacao_tipo
  async getAlocacaoTipoData(): Promise<InvestmentAllocation[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return [
        { tipo: "Ações", valor: 45000, percentual: 45, color: "#8884d8" },
        { tipo: "FIIs", valor: 25000, percentual: 25, color: "#82ca9d" },
        { tipo: "Renda Fixa", valor: 20000, percentual: 20, color: "#ffc658" },
        { tipo: "Criptomoedas", valor: 8000, percentual: 8, color: "#ff7300" },
        { tipo: "Tesouro Direto", valor: 2000, percentual: 2, color: "#00ff7f" },
      ];
    }

    const response = await fetch('/api/investimentos/grafico_alocacao_tipo');
    if (!response.ok) throw new Error('Failed to fetch alocação tipo data');
    return response.json();
  },

  // Gráfico Setorial de Ações - /api/investimentos/grafico_setorial_acoes
  async getSetorialAcoesData(): Promise<SectorAllocation[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return [
        { 
          setor: "Tecnologia", 
          valor: 15000, 
          percentual: 33.3, 
          acoes: ["PETR4", "VALE3", "ITUB4"] 
        },
        { 
          setor: "Financeiro", 
          valor: 12000, 
          percentual: 26.7, 
          acoes: ["BBDC4", "SANB11", "BPAC11"] 
        },
        { 
          setor: "Consumo", 
          valor: 10000, 
          percentual: 22.2, 
          acoes: ["MGLU3", "LREN3", "AMER3"] 
        },
        { 
          setor: "Energia", 
          valor: 8000, 
          percentual: 17.8, 
          acoes: ["PETR4", "ELET3", "CPFE3"] 
        },
      ];
    }

    const response = await fetch('/api/investimentos/grafico_setorial_acoes');
    if (!response.ok) throw new Error('Failed to fetch setorial ações data');
    return response.json();
  },

  // Gráfico de Dividendos FII - /api/investimentos/grafico_dividendos_fii
  async getDividendosFIIData(mes: number, ano: number): Promise<DividendData[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return [
        { ticker: "HGLG11", valor: 125.50, data: "2024-01-15", yieldOnCost: 8.2 },
        { ticker: "KNRI11", valor: 98.75, data: "2024-01-20", yieldOnCost: 7.8 },
        { ticker: "MXRF11", valor: 45.30, data: "2024-01-25", yieldOnCost: 9.1 },
        { ticker: "XPLG11", valor: 78.90, data: "2024-02-10", yieldOnCost: 8.5 },
        { ticker: "BTLG11", valor: 112.40, data: "2024-02-15", yieldOnCost: 7.9 },
        { ticker: "VILG11", valor: 89.20, data: "2024-02-20", yieldOnCost: 8.7 },
      ];
    }

    const response = await fetch(`/api/investimentos/grafico_dividendos_fii?mes=${mes}&ano=${ano}`);
    if (!response.ok) throw new Error('Failed to fetch dividendos FII data');
    return response.json();
  },

  // Dashboard de Investimentos - /api/investimentos/dashboard_overview
  async getDashboardOverviewData(): Promise<{
    patrimonioTotal: number;
    rendimentoMensal: number;
    yieldMedio: number;
    numeroAtivos: number;
    performance12m: number;
  }> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return {
        patrimonioTotal: 100000,
        rendimentoMensal: 850,
        yieldMedio: 8.5,
        numeroAtivos: 25,
        performance12m: 12.3,
      };
    }

    const response = await fetch('/api/investimentos/dashboard_overview');
    if (!response.ok) throw new Error('Failed to fetch investments dashboard data');
    return response.json();
  },

  // Performance por Período - /api/investimentos/performance_periodo
  async getPerformancePeriodoData(periodo: '1m' | '3m' | '6m' | '1y' | 'all'): Promise<{
    labels: string[];
    valores: number[];
    benchmark: number[];
  }> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      const mockData = {
        '1m': {
          labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
          valores: [95000, 97000, 98500, 100000],
          benchmark: [95200, 96800, 98000, 99500],
        },
        '3m': {
          labels: ['Jan', 'Fev', 'Mar'],
          valores: [90000, 95000, 100000],
          benchmark: [91000, 94500, 99000],
        },
        '6m': {
          labels: ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'],
          valores: [85000, 87000, 89000, 92000, 95000, 100000],
          benchmark: [85500, 87500, 89500, 91500, 94000, 98500],
        },
        '1y': {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
          valores: [75000, 77000, 79000, 81000, 83000, 85000, 87000, 89000, 92000, 95000, 98000, 100000],
          benchmark: [75200, 77200, 79100, 80800, 82500, 84200, 86000, 88500, 91000, 93500, 96000, 98000],
        },
        'all': {
          labels: ['2022', '2023', '2024'],
          valores: [50000, 75000, 100000],
          benchmark: [51000, 74000, 98000],
        },
      };
      
      return mockData[periodo];
    }

    const response = await fetch(`/api/investimentos/performance_periodo?periodo=${periodo}`);
    if (!response.ok) throw new Error('Failed to fetch performance período data');
    return response.json();
  },
};

// Budget Charts API Service
import { developmentConfig, simulateApiDelay } from "../../config/development";

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  month?: string;
  year?: number;
}

export interface MonthlyData {
  month: number;
  value: number;
  planned?: number;
  actual?: number;
}

// API endpoints for budget charts
export const budgetChartsApi = {
  // Variação de Entrada Chart - /api/orcamento/grafico_variacao_entrada
  async getVariacaoEntradaData(mes: number, ano: number): Promise<MonthlyData[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return [
        { month: 1, value: 4500 },
        { month: 2, value: 4800 },
        { month: 3, value: 5200 },
        { month: 4, value: 4900 },
        { month: 5, value: 5300 },
        { month: 6, value: 5100 },
        { month: 7, value: 5400 },
        { month: 8, value: 5200 },
        { month: 9, value: 5600 },
        { month: 10, value: 5300 },
        { month: 11, value: 5700 },
        { month: 12, value: 5800 },
      ];
    }

    const response = await fetch(`/api/orcamento/grafico_variacao_entrada?mes=${mes}&ano=${ano}`);
    if (!response.ok) throw new Error('Failed to fetch variação entrada data');
    return response.json();
  },

  // Meta Mês a Mês Chart - /api/orcamento/grafico_meta_mes_mes
  async getMetaMesMesData(mes: number, ano: number): Promise<MonthlyData[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return [
        { month: 1, planned: 3000, actual: 2800 },
        { month: 2, planned: 3200, actual: 3100 },
        { month: 3, planned: 3100, actual: 3300 },
        { month: 4, planned: 3000, actual: 2900 },
        { month: 5, planned: 3300, actual: 3200 },
        { month: 6, planned: 3200, actual: 3100 },
        { month: 7, planned: 3400, actual: 3500 },
        { month: 8, planned: 3300, actual: 3200 },
        { month: 9, planned: 3500, actual: 3600 },
        { month: 10, planned: 3400, actual: 3300 },
        { month: 11, planned: 3600, actual: 3700 },
        { month: 12, planned: 3500, actual: 3400 },
      ];
    }

    const response = await fetch(`/api/orcamento/grafico_meta_mes_mes?mes=${mes}&ano=${ano}`);
    if (!response.ok) throw new Error('Failed to fetch meta mês a mês data');
    return response.json();
  },

  // Distribuição de Gastos Chart - /api/orcamento/grafico_distribuicao_gastos
  async getDistribuicaoGastosData(mes: number, ano: number): Promise<ChartDataPoint[]> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return [
        { label: "Alimentação", value: 800, color: "#8884d8" },
        { label: "Transporte", value: 450, color: "#82ca9d" },
        { label: "Moradia", value: 1200, color: "#ffc658" },
        { label: "Lazer", value: 300, color: "#ff7300" },
        { label: "Saúde", value: 200, color: "#00ff7f" },
        { label: "Educação", value: 350, color: "#ff6b6b" },
        { label: "Outros", value: 180, color: "#4ecdc4" },
      ];
    }

    const response = await fetch(`/api/orcamento/grafico_distribuicao_gastos?mes=${mes}&ano=${ano}`);
    if (!response.ok) throw new Error('Failed to fetch distribuição gastos data');
    return response.json();
  },

  // Dashboard Overview Charts - /api/orcamento/dashboard_overview
  async getDashboardOverviewData(mes: number, ano: number): Promise<{
    totalEntradas: number;
    totalGastos: number;
    totalEconomizado: number;
    metasAlcancadas: number;
  }> {
    if (developmentConfig.useMockData) {
      await simulateApiDelay();
      return {
        totalEntradas: 5500,
        totalGastos: 3400,
        totalEconomizado: 2100,
        metasAlcancadas: 3,
      };
    }

    const response = await fetch(`/api/orcamento/dashboard_overview?mes=${mes}&ano=${ano}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard overview data');
    return response.json();
  },
};

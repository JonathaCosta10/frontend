import { fetchCustosCharts, fetchCustosEvolutionChart } from '../dashboard/orcamento/custos/charts';

export const custosChartsApi = {
  fetchCharts: fetchCustosCharts,
  fetchEvolutionChart: fetchCustosEvolutionChart,
};

export default custosChartsApi;

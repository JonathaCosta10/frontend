import { apiService as baseApi } from '../../../base';

export const fetchCustosCharts = async (period: string = '12m') => {
  return baseApi.get(`/api/dashboard/orcamento/custos/charts?period=${period}`);
};

export const fetchCustosEvolutionChart = async (filters: any) => {
  return baseApi.post('/api/dashboard/orcamento/custos/charts/evolution', filters);
};

export default {
  fetchCustosCharts,
  fetchCustosEvolutionChart,
};

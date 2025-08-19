import { apiService as baseApi } from '../../../base';

export const fetchEntradasCharts = async (period: string = '12m') => {
  return baseApi.get(`/api/dashboard/orcamento/entradas/charts?period=${period}`);
};

export const fetchEntradasEvolutionChart = async (filters: any) => {
  return baseApi.post('/api/dashboard/orcamento/entradas/charts/evolution', filters);
};

export default {
  fetchEntradasCharts,
  fetchEntradasEvolutionChart,
};

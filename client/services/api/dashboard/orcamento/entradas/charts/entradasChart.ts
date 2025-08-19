import { apiService as baseApi } from '../../../../base';

export const fetchEntradasChart = async (period: string = '12m') => {
  return baseApi.get(`/services/api/api/dashboard/orcamento/entradas/charts?period=${period}`);
};

export default {
  fetchEntradasChart,
};

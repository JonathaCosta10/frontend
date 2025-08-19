import { apiService as baseApi } from '../../../base';

export const fetchEntradasTable = async (filters: any) => {
  return baseApi.post('/services/api/api/dashboard/orcamento/entradas/tables', filters);
};

export const fetchEntradasSummaryTable = async (period: string) => {
  return baseApi.get(`/services/api/api/dashboard/orcamento/entradas/tables/summary?period=${period}`);
};

export default {
  fetchEntradasTable,
  fetchEntradasSummaryTable,
};

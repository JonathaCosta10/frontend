import { apiService as baseApi } from '../../../base';

export const fetchCustosTable = async (filters: any) => {
  return baseApi.post('/api/dashboard/orcamento/custos/tables', filters);
};

export const fetchCustosSummaryTable = async (period: string) => {
  return baseApi.get(`/api/dashboard/orcamento/custos/tables/summary?period=${period}`);
};

export default {
  fetchCustosTable,
  fetchCustosSummaryTable,
};

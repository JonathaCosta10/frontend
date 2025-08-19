import { apiService as baseApi } from '../../../base';

export const fetchCustosTable = async (filters: any) => {
  return baseApi.post('/services/api/api/dashboard/orcamento/custos/tables', filters);
};

export const fetchCustosSummaryTable = async (period: string) => {
  return baseApi.get(`/services/api/api/dashboard/orcamento/custos/tables/summary?period=${period}`);
};

export default {
  fetchCustosTable,
  fetchCustosSummaryTable,
};

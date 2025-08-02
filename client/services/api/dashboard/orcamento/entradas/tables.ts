import { baseApi } from '../../base';

export const fetchEntradasTable = async (filters: any) => {
  return baseApi.post('/dashboard/orcamento/entradas/tables', filters);
};

export const fetchEntradasSummaryTable = async (period: string) => {
  return baseApi.get(`/dashboard/orcamento/entradas/tables/summary?period=${period}`);
};

export default {
  fetchEntradasTable,
  fetchEntradasSummaryTable,
};

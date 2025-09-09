import { apiService as baseApi } from '../../../base';

export const fetchCustosData = async () => {
  return baseApi.get('/api/dashboard/orcamento/custos/data');
};

export const createCusto = async (custo: any) => {
  return baseApi.post('/api/dashboard/orcamento/custos/data', custo);
};

export const updateCusto = async (id: string, custo: any) => {
  return baseApi.put(`/api/dashboard/orcamento/custos/data/${id}`, custo);
};

export const deleteCusto = async (id: string) => {
  return baseApi.delete(`/api/dashboard/orcamento/custos/data/${id}`);
};

export default {
  fetchCustosData,
  createCusto,
  updateCusto,
  deleteCusto,
};

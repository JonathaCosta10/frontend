import { apiService as baseApi } from '../../../base';

export const fetchEntradasData = async () => {
  return baseApi.get('/services/api/api/dashboard/orcamento/entradas/data');
};

export const createEntrada = async (entrada: any) => {
  return baseApi.post('/services/api/api/dashboard/orcamento/entradas/data', entrada);
};

export const updateEntrada = async (id: string, entrada: any) => {
  return baseApi.put(`/services/api/api/dashboard/orcamento/entradas/data/${id}`, entrada);
};

export const deleteEntrada = async (id: string) => {
  return baseApi.delete(`/services/api/api/dashboard/orcamento/entradas/data/${id}`);
};

export default {
  fetchEntradasData,
  createEntrada,
  updateEntrada,
  deleteEntrada,
};

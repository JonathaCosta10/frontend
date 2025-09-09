import { apiService as baseApi } from '../../../base';

export const fetchEntradasData = async () => {
  return baseApi.get('/api/dashboard/orcamento/entradas/data');
};

export const createEntrada = async (entrada: any) => {
  return baseApi.post('/api/dashboard/orcamento/entradas/data', entrada);
};

export const updateEntrada = async (id: string, entrada: any) => {
  return baseApi.put(`/api/dashboard/orcamento/entradas/data/${id}`, entrada);
};

export const deleteEntrada = async (id: string) => {
  return baseApi.delete(`/api/dashboard/orcamento/entradas/data/${id}`);
};

export default {
  fetchEntradasData,
  createEntrada,
  updateEntrada,
  deleteEntrada,
};

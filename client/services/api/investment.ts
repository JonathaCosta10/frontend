import api from "../api";

export const InvestmentApi = {
  // Carteiras
  getCarteiras: () => api.get("/investimentos/carteiras"),
  getCarteiraById: (id: number) => api.get(`/investimentos/carteiras/${id}`),
  criarCarteira: (data: any) => api.post("/investimentos/carteiras", data),
  atualizarCarteira: (id: number, data: any) => api.put(`/investimentos/carteiras/${id}`, data),
  excluirCarteira: (id: number) => api.delete(`/investimentos/carteiras/${id}`),

  // Ativos
  getAtivos: (carteiraId: number) => api.get(`/investimentos/carteiras/${carteiraId}/ativos`),
  getAtivoById: (carteiraId: number, ativoId: number) => api.get(`/investimentos/carteiras/${carteiraId}/ativos/${ativoId}`),
  criarAtivo: (carteiraId: number, data: any) => api.post(`/investimentos/carteiras/${carteiraId}/ativos`, data),
  atualizarAtivo: (carteiraId: number, ativoId: number, data: any) => api.put(`/investimentos/carteiras/${carteiraId}/ativos/${ativoId}`, data),
  excluirAtivo: (carteiraId: number, ativoId: number) => api.delete(`/investimentos/carteiras/${carteiraId}/ativos/${ativoId}`),

  // Transações
  getTransacoes: (carteiraId: number, ativoId: number) => api.get(`/investimentos/carteiras/${carteiraId}/ativos/${ativoId}/transacoes`),
  criarTransacao: (carteiraId: number, ativoId: number, data: any) => api.post(`/investimentos/carteiras/${carteiraId}/ativos/${ativoId}/transacoes`, data),
  atualizarTransacao: (carteiraId: number, ativoId: number, transacaoId: number, data: any) => api.put(`/investimentos/carteiras/${carteiraId}/ativos/${ativoId}/transacoes/${transacaoId}`, data),
  excluirTransacao: (carteiraId: number, ativoId: number, transacaoId: number) => api.delete(`/investimentos/carteiras/${carteiraId}/ativos/${ativoId}/transacoes/${transacaoId}`),

  // Dividendos
  getDividendos: (carteiraId: number, ativoId: number) => api.get(`/investimentos/carteiras/${carteiraId}/ativos/${ativoId}/dividendos`),
  criarDividendo: (carteiraId: number, ativoId: number, data: any) => api.post(`/investimentos/carteiras/${carteiraId}/ativos/${ativoId}/dividendos`, data),
  atualizarDividendo: (carteiraId: number, ativoId: number, dividendoId: number, data: any) => api.put(`/investimentos/carteiras/${carteiraId}/ativos/${ativoId}/dividendos/${dividendoId}`, data),
  excluirDividendo: (carteiraId: number, ativoId: number, dividendoId: number) => api.delete(`/investimentos/carteiras/${carteiraId}/ativos/${ativoId}/dividendos/${dividendoId}`),

  // Análise e Relatórios
  getAnaliseCarteira: (carteiraId: number) => api.get(`/investimentos/carteiras/${carteiraId}/analise`),
  getRelatorioRentabilidade: (carteiraId: number, periodo: string) => api.get(`/investimentos/carteiras/${carteiraId}/relatorios/rentabilidade?periodo=${periodo}`),
  getRelatorioAlocacao: (carteiraId: number) => api.get(`/investimentos/carteiras/${carteiraId}/relatorios/alocacao`),
  getRelatorioDividendos: (carteiraId: number, periodo: string) => api.get(`/investimentos/carteiras/${carteiraId}/relatorios/dividendos?periodo=${periodo}`),
};

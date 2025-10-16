/**
 * Dados mocados para desenvolvimento local da página de mercado
 * Este arquivo simula a resposta da API /api/mercado/destaques/gerais
 */

import { DestaquesGeraisResponse } from '@/services/api/market';

export const mockMarketData: DestaquesGeraisResponse = {
  success: true,
  acoes: {
    setores: [
      {
        nome: "Financeiro",
        tickers: [
          {
            ticker: "ITUB4",
            nome: "Itaú Unibanco",
            preco: 38.89,
            pvp: 1.78,
            variacao: 0.57,
            setor: "Financeiro",
            tipo: "acao"
          },
          {
            ticker: "BBDC4",
            nome: "Bradesco",
            preco: 15.42,
            pvp: 1.32,
            variacao: -0.23,
            setor: "Financeiro",
            tipo: "acao"
          },
          {
            ticker: "BBAS3",
            nome: "Banco do Brasil",
            preco: 26.85,
            pvp: 1.15,
            variacao: 1.12,
            setor: "Financeiro",
            tipo: "acao"
          }
        ]
      },
      {
        nome: "Energia Elétrica",
        tickers: [
          {
            ticker: "EGIE3",
            nome: "Engie Brasil",
            preco: 43.21,
            pvp: 2.05,
            variacao: 0.89,
            setor: "Energia Elétrica",
            tipo: "acao"
          },
          {
            ticker: "TAEE11",
            nome: "Taesa",
            preco: 35.67,
            pvp: 1.89,
            variacao: -0.45,
            setor: "Energia Elétrica",
            tipo: "acao"
          },
          {
            ticker: "CPFE3",
            nome: "CPFL Energia",
            preco: 28.94,
            pvp: 1.67,
            variacao: 0.34,
            setor: "Energia Elétrica",
            tipo: "acao"
          }
        ]
      },
      {
        nome: "Materiais Básicos",
        tickers: [
          {
            ticker: "VALE3",
            nome: "Vale S.A.",
            preco: 55.12,
            pvp: 1.52,
            variacao: 1.20,
            setor: "Materiais Básicos",
            tipo: "acao"
          },
          {
            ticker: "GGBR4",
            nome: "Gerdau",
            preco: 12.73,
            pvp: 0.89,
            variacao: -1.45,
            setor: "Materiais Básicos",
            tipo: "acao"
          }
        ]
      },
      {
        nome: "Consumo Não-Cíclico",
        tickers: [
          {
            ticker: "ABEV3",
            nome: "Ambev",
            preco: 11.85,
            pvp: 2.34,
            variacao: 0.67,
            setor: "Consumo Não-Cíclico",
            tipo: "acao"
          },
          {
            ticker: "RADL3",
            nome: "Raia Drogasil",
            preco: 23.45,
            pvp: 1.78,
            variacao: -0.89,
            setor: "Consumo Não-Cíclico",
            tipo: "acao"
          }
        ]
      },
      {
        nome: "Industrial",
        tickers: [
          {
            ticker: "WEGE3",
            nome: "WEG S.A.",
            preco: 45.33,
            pvp: 2.15,
            variacao: -0.85,
            setor: "Industrial",
            tipo: "acao"
          },
          {
            ticker: "EMBR3",
            nome: "Embraer",
            preco: 78.92,
            pvp: 1.45,
            variacao: 2.34,
            setor: "Industrial",
            tipo: "acao"
          }
        ]
      }
    ]
  },
  fiis: {
    setores: [
      {
        nome: "Logística",
        tickers: [
          {
            ticker: "HGLG11",
            nome: "CSHG LOGÍSTICA",
            preco: 161.02,
            dy: 9.02,
            variacao: 0.54,
            setor: "Logística",
            tipo: "fii"
          },
          {
            ticker: "XPLG11",
            nome: "XP LOG",
            preco: 89.45,
            dy: 8.75,
            variacao: 1.23,
            setor: "Logística",
            tipo: "fii"
          }
        ]
      },
      {
        nome: "Shoppings",
        tickers: [
          {
            ticker: "HSML11",
            nome: "HSI MALLS",
            preco: 78.34,
            dy: 7.89,
            variacao: -0.45,
            setor: "Shoppings",
            tipo: "fii"
          },
          {
            ticker: "XPML11",
            nome: "XP MALLS",
            preco: 105.10,
            dy: 9.10,
            variacao: -0.69,
            setor: "Shoppings",
            tipo: "fii"
          }
        ]
      },
      {
        nome: "Lajes Corporativas",
        tickers: [
          {
            ticker: "HGRE11",
            nome: "CSHG REAL ESTATE",
            preco: 134.78,
            dy: 8.45,
            variacao: 0.78,
            setor: "Lajes Corporativas",
            tipo: "fii"
          },
          {
            ticker: "BRCR11",
            nome: "BTG PACTUAL CORP",
            preco: 98.23,
            dy: 9.34,
            variacao: -0.23,
            setor: "Lajes Corporativas",
            tipo: "fii"
          }
        ]
      },
      {
        nome: "FOFs",
        tickers: [
          {
            ticker: "BCFF11",
            nome: "BTG PACTUAL FUNDO DE FUNDOS",
            preco: 87.45,
            dy: 8.78,
            variacao: -0.90,
            setor: "FOFs",
            tipo: "fii"
          },
          {
            ticker: "KFOF11",
            nome: "KINEA FUNDO DE FUNDOS",
            preco: 92.15,
            dy: 9.12,
            variacao: 0.45,
            setor: "FOFs",
            tipo: "fii"
          }
        ]
      },
      {
        nome: "Papel High Grade",
        tickers: [
          {
            ticker: "KNCR11",
            nome: "KINEA RENDIMENTOS",
            preco: 104.94,
            dy: 8.94,
            variacao: 0.13,
            setor: "Papel High Grade",
            tipo: "fii"
          },
          {
            ticker: "VRTA11",
            nome: "VERTA RENDA FIXA",
            preco: 98.67,
            dy: 9.23,
            variacao: 0.34,
            setor: "Papel High Grade",
            tipo: "fii"
          }
        ]
      }
    ]
  }
};

/**
 * Hook para simular dados de mercado em desenvolvimento
 * Remove este hook quando a API estiver funcionando
 */
export const useMockMarketData = () => {
  return {
    data: mockMarketData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => Promise.resolve()
  };
};
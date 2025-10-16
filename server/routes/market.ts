import { Request, Response } from "express";

// Mock data baseado na resposta da API que o usuário forneceu
const mockMarketData = {
  "success": true,
  "message": "Destaques gerais do mercado obtidos com sucesso (versão ULTRA otimizada)",
  "timestamp": "2025-10-05T02:07:30.613195",
  "data": {
    "tabelas_para_graficos": {
      "tabela_acoes": [
        {
          "setor": "Financeiro",
          "valor_milhoes": 973400.6,
          "valor_patrimonial_milhoes": 400743.9,
          "p_vp_medio": 2.43,
          "variacao_diaria": 0.54,
          "variacao_semanal": 1.57,
          "percentual_total": 32.44,
          "percentual_categoria": 32.44,
          "total_ativos": 8,
          "fonte_calculo": "market_cap_real",
          "ativos_com_market_cap_real": 8
        },
        {
          "setor": "Materiais Básicos",
          "valor_milhoes": 936665.7,
          "valor_patrimonial_milhoes": 329572.7,
          "p_vp_medio": 2.84,
          "variacao_diaria": -0.65,
          "variacao_semanal": -1.47,
          "percentual_total": 31.21,
          "percentual_categoria": 31.21,
          "total_ativos": 7,
          "fonte_calculo": "market_cap_real",
          "ativos_com_market_cap_real": 7
        },
        {
          "setor": "Industrial",
          "valor_milhoes": 438812.4,
          "valor_patrimonial_milhoes": 24871.2,
          "p_vp_medio": 17.64,
          "variacao_diaria": 1.93,
          "variacao_semanal": 3.11,
          "percentual_total": 14.62,
          "percentual_categoria": 14.62,
          "total_ativos": 5,
          "fonte_calculo": "market_cap_real",
          "ativos_com_market_cap_real": 5
        },
        {
          "setor": "Energia Elétrica",
          "valor_milhoes": 359686.9,
          "valor_patrimonial_milhoes": 124903.3,
          "p_vp_medio": 2.88,
          "variacao_diaria": 2.19,
          "variacao_semanal": 2.38,
          "percentual_total": 11.99,
          "percentual_categoria": 11.99,
          "total_ativos": 8,
          "fonte_calculo": "market_cap_real",
          "ativos_com_market_cap_real": 8
        },
        {
          "setor": "Consumo Não-Cíclico",
          "valor_milhoes": 292298.0,
          "valor_patrimonial_milhoes": 12786.1,
          "p_vp_medio": 22.86,
          "variacao_diaria": -0.13,
          "variacao_semanal": 0.07,
          "percentual_total": 9.74,
          "percentual_categoria": 9.74,
          "total_ativos": 6,
          "fonte_calculo": "market_cap_real",
          "ativos_com_market_cap_real": 6
        }
      ],
      "tabela_fiis": [
        {
          "segmento": "Shoppings",
          "valor_milhoes": 29.4,
          "variacao_diaria": -0.33,
          "variacao_semanal": 0.04,
          "percentual_total": 0.0,
          "percentual_categoria": 36.66,
          "total_ativos": 6
        },
        {
          "segmento": "Logística",
          "valor_milhoes": 27.8,
          "variacao_diaria": 0.27,
          "variacao_semanal": 0.22,
          "percentual_total": 0.0,
          "percentual_categoria": 34.66,
          "total_ativos": 6
        },
        {
          "segmento": "Lajes Corporativas",
          "valor_milhoes": 13.3,
          "variacao_diaria": -0.28,
          "variacao_semanal": -0.14,
          "percentual_total": 0.0,
          "percentual_categoria": 16.58,
          "total_ativos": 8
        },
        {
          "segmento": "FOFs",
          "valor_milhoes": 8.5,
          "variacao_diaria": 0.17,
          "variacao_semanal": 0.26,
          "percentual_total": 0.0,
          "percentual_categoria": 10.6,
          "total_ativos": 4
        },
        {
          "segmento": "Saúde/Hospitais",
          "valor_milhoes": 1.2,
          "variacao_diaria": -0.23,
          "variacao_semanal": 0.61,
          "percentual_total": 0.0,
          "percentual_categoria": 1.5,
          "total_ativos": 4
        }
      ]
    }
  }
};

export function handleDestaquesGerais(req: Request, res: Response) {
  console.log('📈 Market API - Destaques Gerais solicitados');
  
  // Simular um pequeno delay para simular uma API real
  setTimeout(() => {
    res.json(mockMarketData);
  }, 100);
}
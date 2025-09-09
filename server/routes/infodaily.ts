import { Request, Response } from "express";

/**
 * Mock data para índices de mercado
 */
const mockMarketIndicesData = {
  indices_mercado: {
    titulo: "Índices de Mercado",
    ultima_atualizacao: "2025-01-27T10:30:00Z",
    dados: [
      {
        id: "ibov",
        nome: "IBOVESPA",
        valor_atual: 132456.78,
        variacao_pontos: 1234.56,
        variacao_percentual: 0.94,
        fechamento_anterior: 131222.22,
        abertura: 131500.00,
        maxima: 132800.45,
        minima: 131200.00,
        volume: "R$ 18.5 bi",
        status: "fechado",
        horario_atualizacao: "17:30",
        cor_variacao: "green"
      },
      {
        id: "ifix",
        nome: "IFIX",
        valor_atual: 3245.67,
        variacao_pontos: -15.23,
        variacao_percentual: -0.47,
        fechamento_anterior: 3260.90,
        abertura: 3250.00,
        maxima: 3265.45,
        minima: 3240.12,
        volume: "R$ 145.3 mi",
        status: "fechado",
        horario_atualizacao: "17:30",
        cor_variacao: "red"
      },
      {
        id: "ibrx",
        nome: "IBRX 100",
        valor_atual: 15678.90,
        variacao_pontos: 45.12,
        variacao_percentual: 0.29,
        fechamento_anterior: 15633.78,
        abertura: 15650.00,
        maxima: 15720.45,
        minima: 15620.30,
        volume: "R$ 8.2 bi",
        status: "fechado",
        horario_atualizacao: "17:30",
        cor_variacao: "green"
      },
      {
        id: "small",
        nome: "SMALL CAP",
        valor_atual: 3456.78,
        variacao_pontos: -8.45,
        variacao_percentual: -0.24,
        fechamento_anterior: 3465.23,
        abertura: 3460.00,
        maxima: 3470.12,
        minima: 3450.34,
        volume: "R$ 567.8 mi",
        status: "fechado",
        horario_atualizacao: "17:30",
        cor_variacao: "red"
      },
      {
        id: "dolar",
        nome: "USD/BRL",
        valor_atual: 5.1234,
        variacao_pontos: 0.0345,
        variacao_percentual: 0.68,
        fechamento_anterior: 5.0889,
        abertura: 5.0950,
        maxima: 5.1350,
        minima: 5.0850,
        volume: "US$ 2.1 bi",
        status: "aberto",
        horario_atualizacao: "15:45",
        cor_variacao: "green"
      },
      {
        id: "euro",
        nome: "EUR/BRL",
        valor_atual: 5.4567,
        variacao_pontos: -0.0234,
        variacao_percentual: -0.43,
        fechamento_anterior: 5.4801,
        abertura: 5.4750,
        maxima: 5.4850,
        minima: 5.4450,
        volume: "€ 890.5 mi",
        status: "aberto",
        horario_atualizacao: "15:45",
        cor_variacao: "red"
      }
    ]
  }
};

/**
 * Mock data para insights de mercado
 */
const mockMarketInsightsData = {
  insights_mercado: {
    titulo: "Insights de Mercado",
    ultima_atualizacao: "2025-01-27T10:30:00Z",
    maiores_volumes_negociacao: {
      titulo: "Maiores Volumes de Negociação",
      "1D": [
        {
          ticker: "MGLU3",
          nome_companhia: "Magazine Luiza ON",
          volume_diario: "18.5M",
          ultimo_preco: "R$ 12,45",
          data: "2025-01-27",
          variacao: { valor: "+8,5%", cor: "green", simbolo: "+" }
        },
        {
          ticker: "PETR4",
          nome_companhia: "Petrobras PN",
          volume_diario: "45.8M",
          ultimo_preco: "R$ 32,45",
          data: "2025-01-27",
          variacao: { valor: "+2,69%", cor: "green", simbolo: "+" }
        },
        {
          ticker: "VALE3",
          nome_companhia: "Vale ON",
          volume_diario: "32.1M",
          ultimo_preco: "R$ 68,90",
          data: "2025-01-27",
          variacao: { valor: "-1,71%", cor: "red", simbolo: "-" }
        },
        {
          ticker: "ITUB4",
          nome_companhia: "Itaú Unibanco PN",
          volume_diario: "28.9M",
          ultimo_preco: "R$ 28,76",
          data: "2025-01-27",
          variacao: { valor: "+1,59%", cor: "green", simbolo: "+" }
        },
        {
          ticker: "BBDC4",
          nome_companhia: "Bradesco PN",
          volume_diario: "22.1M",
          ultimo_preco: "R$ 15,83",
          data: "2025-01-27",
          variacao: { valor: "+0,76%", cor: "green", simbolo: "+" }
        }
      ],
      "7D": [
        {
          ticker: "USIM5",
          nome_companhia: "Usiminas PNA",
          volume_diario: "19.8M",
          ultimo_preco: "R$ 5,67",
          data: "2025-01-27",
          variacao: { valor: "+15,3%", cor: "green", simbolo: "+" }
        },
        {
          ticker: "CSNA3",
          nome_companhia: "CSN ON",
          volume_diario: "18.2M",
          ultimo_preco: "R$ 13,24",
          data: "2025-01-27",
          variacao: { valor: "+12,8%", cor: "green", simbolo: "+" }
        },
        {
          ticker: "GOLL4",
          nome_companhia: "Gol PN",
          volume_diario: "15.3M",
          ultimo_preco: "R$ 1,89",
          data: "2025-01-27",
          variacao: { valor: "+28,6%", cor: "green", simbolo: "+" }
        }
      ],
      "1M": [
        {
          ticker: "RADL3",
          nome_companhia: "Raia Drogasil ON",
          volume_diario: "8.4M",
          ultimo_preco: "R$ 29,34",
          data: "2025-01-27",
          variacao: { valor: "+18,7%", cor: "green", simbolo: "+" }
        }
      ]
    },
    variacao_portfolio: {
      titulo: "Variação Portfolio",
      "1D": [
        {
          ticker: "WEGE3",
          nome_companhia: "WEG ON",
          volume_diario: "12.3M",
          ultimo_preco: "R$ 42,18",
          data: "2025-01-27",
          variacao: { valor: "+4,2%", cor: "green", simbolo: "+" }
        },
        {
          ticker: "RENT3",
          nome_companhia: "Localiza ON",
          volume_diario: "8.7M",
          ultimo_preco: "R$ 67,89",
          data: "2025-01-27",
          variacao: { valor: "+3,8%", cor: "green", simbolo: "+" }
        }
      ],
      "7D": [
        {
          ticker: "GGBR4",
          nome_companhia: "Gerdau PN",
          volume_diario: "15.6M",
          ultimo_preco: "R$ 18,45",
          data: "2025-01-27",
          variacao: { valor: "+8,9%", cor: "green", simbolo: "+" }
        }
      ],
      "1M": []
    },
    oportunidades_preco_medio: {
      titulo: "Oportunidades Preço Médio",
      "1D": [
        {
          ticker: "BBAS3",
          nome_companhia: "Banco do Brasil ON",
          volume_diario: "16.2M",
          ultimo_preco: "R$ 26,45",
          data: "2025-01-27",
          variacao: { valor: "-2,1%", cor: "red", simbolo: "-" }
        },
        {
          ticker: "ABEV3",
          nome_companhia: "Ambev ON",
          volume_diario: "24.8M",
          ultimo_preco: "R$ 11,67",
          data: "2025-01-27",
          variacao: { valor: "-1,8%", cor: "red", simbolo: "-" }
        }
      ],
      "7D": [
        {
          ticker: "LREN3",
          nome_companhia: "Lojas Renner ON",
          volume_diario: "9.3M",
          ultimo_preco: "R$ 16,78",
          data: "2025-01-27",
          variacao: { valor: "-5,4%", cor: "red", simbolo: "-" }
        }
      ],
      "1M": []
    }
  }
};

/**
 * Handler para /api/infodaily/ - Índices de mercado
 */
export const handleInfoDaily = (_req: Request, res: Response) => {
  try {
    console.log("📊 API Mock - Enviando dados dos índices de mercado");
    
    res.status(200).json(mockMarketIndicesData);
    
  } catch (error) {
    console.error("❌ Erro no endpoint /api/infodaily/:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: "Falha ao buscar dados dos índices"
    });
  }
};

/**
 * Handler para /api/insights-mercado/ - Insights de mercado
 */
export const handleMarketInsights = (_req: Request, res: Response) => {
  try {
    console.log("💡 API Mock - Enviando dados dos insights de mercado");
    
    res.status(200).json(mockMarketInsightsData);
    
  } catch (error) {
    console.error("❌ Erro no endpoint /api/insights-mercado/:", error);
    res.status(500).json({
      error: "Erro interno do servidor", 
      message: "Falha ao buscar dados dos insights"
    });
  }
};

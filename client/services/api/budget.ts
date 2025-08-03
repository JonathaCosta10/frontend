import { api } from "@/lib/api";
import { isDevelopment, secureLog } from "@/config/development";

// Helper para simular delay de API em desenvolvimento
const simulateApiDelay = (delay = 200) => {
  if (!isDevelopment) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export interface VariacaoEntrada {
  mes: number;
  ano: number;
  valor_total: number;
  variacao_percentual?: number;
}

export interface DistribuicaoGastos {
  categoria: string;
  valor: number;
  percentual: number;
}

export interface BudgetResponse {
  variacao_entrada: VariacaoEntrada[];
  distribuicao_gastos: DistribuicaoGastos[];
  total_entrada: number;
  total_gastos: number;
}

export interface DadosMensais {
  mes: string;
  resumo_financeiro: {
    total_entradas: number;
    total_gastos: number;
    total_dividas: number;
    total_dividas_mensais: number;
    total_juros_mensais: number;
    saldo_liquido_mensal: number;
    total_custos: number;
  };
  entradas: {
    resumo: {
      total_entradas: number;
      total_com_replicacao: number;
      total_sem_replicacao: number;
    };
    por_categoria: Array<{
      categoria: string;
      total: number;
      percentual: number;
    }>;
  };
  gastos: {
    resumo: {
      total_gastos: number;
      total_com_replicacao: number;
      total_sem_replicacao: number;
    };
    por_categoria: Array<{
      categoria: string;
      total: number;
      percentual: number;
    }>;
  };
  dividas: {
    resumo: {
      total_dividas: number;
      total_juros_mensais: number;
      total_com_replicacao: number;
      total_sem_replicacao: number;
    };
    por_categoria: Array<{
      categoria: string;
      total_divida: number;
      total_juros: number;
      percentual: number;
    }>;
  };
  orcamento_domestico?: {
    resumo: {
      total_planejado: number;
      data_configuracao: string;
    };
    por_categoria: Array<{
      categoria: string;
      valor: number;
      percentual: number;
    }>;
    detalhes: {
      custos_fixos: number;
      prazer: number;
      conforto: number;
      metas: number;
      liberdade_financeira: number;
      conhecimento: number;
      data: string;
    };
  };
}

export interface DistribuicaoGastosResponse {
  ano: string;
  meses_disponeis: string[];
  dados_mensais: {
    [mes: string]: DadosMensais;
  };
  metas_personalizadas: {
    total_economizado: number;
    total_metas: number;
    metas_concluidas: number;
    metas_ativas: number;
    progresso_geral: number;
  };
}

class BudgetApiService {
  // ===== APIs DE METAS =====
  async getMetasPersonalizadas() {
    try {
      secureLog("[BUDGET] Fetching metas personalizadas");
      const response = await api.get("/api/metaspersonalizadas/");
      return response;
    } catch (error) {
      console.error("API Error - getMetasPersonalizadas:", error);

      // Use mock data only in development
      if (isDevelopment) {
        secureLog(
          "[BUDGET] Using mock data for getMetasPersonalizadas (development)",
        );
        await simulateApiDelay(200);
        return this.getMockMetasData();
      }

      throw error;
    }
  }

  async cadastrarMeta(data: any) {
    try {
      const response = await api.post("/api/cadastrar_meta/", data);
      return response;
    } catch (error) {
      console.error("API Error - cadastrarMeta:", error);
      throw error;
    }
  }

  async atualizarMeta(id: number, data: any) {
    try {
      const response = await api.put(`/api/atualizar_dados_meta/${id}/`, data);
      return response;
    } catch (error) {
      console.error("API Error - atualizarMeta:", error);
      throw error;
    }
  }

  async atualizarValorMeta(id: number, operationType: string, valorHoje: number) {
    try {
      const response = await api.put(`/api/atualizar_valor_meta/${id}/`, {
        operation_type: operationType,
        valor_hoje: valorHoje
      });
      return response;
    } catch (error) {
      console.error("API Error - atualizarValorMeta:", error);
      throw error;
    }
  }

  async excluirMeta(id: number) {
    try {
      const response = await api.delete(`/api/atualizar_dados_meta/${id}/`);
      return response;
    } catch (error) {
      console.error("API Error - excluirMeta:", error);
      throw error;
    }
  }

  private getMockMetasData() {
    const mockMetas = [
      {
        id: 1,
        titulo_da_meta: "Reserva de Emergência",
        descricao: "Economizar 6 meses de gastos",
        valor_hoje: 12500.0,
        valor_alvo: 18000.0,
        data_limite: "2024-12-31",
        categoria: "Emergência",
      },
      {
        id: 2,
        titulo_da_meta: "Viagem para Europa",
        descricao: "Economizar para férias",
        valor_hoje: 3200.0,
        valor_alvo: 8000.0,
        data_limite: "2024-06-30",
        categoria: "Lazer",
      },
      {
        id: 3,
        titulo_da_meta: "Curso de Especialização",
        descricao: "MBA em Finanças",
        valor_hoje: 15000.0,
        valor_alvo: 15000.0,
        data_limite: "2024-01-31",
        categoria: "Educação",
      },
      {
        id: 4,
        titulo_da_meta: "Entrada do Apartamento",
        descricao: "20% do valor do imóvel",
        valor_hoje: 25000.0,
        valor_alvo: 50000.0,
        data_limite: "2025-03-31",
        categoria: "Moradia",
      },
    ];

    // Calcular resumo
    const total_economizado = mockMetas.reduce((sum, meta) => sum + meta.valor_hoje, 0);
    const metas_totais = mockMetas.length;
    const metas_ativas = mockMetas.filter(meta => {
      const progresso = (meta.valor_hoje / meta.valor_alvo) * 100;
      return progresso < 100;
    }).length;
    const metas_concluidas = mockMetas.filter(meta => {
      const progresso = (meta.valor_hoje / meta.valor_alvo) * 100;
      return progresso >= 100;
    }).length;
    const progresso_geral = metas_totais > 0 ? (metas_concluidas / metas_totais) * 100 : 0;

    return {
      cadastros: mockMetas,
      resumo: {
        total_economizado,
        metas_totais,
        metas_ativas,
        metas_concluidas,
        progresso_geral,
      }
    };
  }

  // ===== APIs DE DÍVIDAS =====
  async getMaioresDividas(tipo: string, mes: string, ano: string) {
    try {
      secureLog("[BUDGET] Fetching maiores dividas", { tipo, mes, ano });
      const response = await api.get(
        `/api/maiores_dividas?tipo=${tipo}&mes=${mes}&ano=${ano}`,
      );
      return response;
    } catch (error) {
      console.error("API Error - getMaioresDividas:", error);

      // Use mock data only in development
      if (isDevelopment) {
        secureLog(
          "[BUDGET] Using mock data for getMaioresDividas (development)",
        );
        await simulateApiDelay(200);
        return this.getMockDividasData(tipo, mes, ano);
      }

      throw error;
    }
  }

  private getMockDividasData(tipo: string, mes: string, ano: string) {
    const mockDividas = [
      {
        id: 1,
        tipo: "Cartao",
        categoria: "Cartão de Crédito",
        descricao: "Fatura cartão principal",
        valor: 2400.0,
        valor_mensal: 2400.0,
        valor_hoje: 2400.0,
        divida_total: 2400.0,
        quantidade_parcelas: 1,
        taxa_juros: 12.5,
        juros_mensais: 25.0,
        flag: true,
        mes: parseInt(mes),
        ano: parseInt(ano),
        data_vencimento: `${ano}-${mes.padStart(2, "0")}-15`,
        status: "pendente",
      },
      {
        id: 2,
        tipo: "Financiamento",
        categoria: "Financiamento Veículo",
        descricao: "Parcela carro",
        valor: 890.0,
        valor_mensal: 890.0,
        valor_hoje: 25000.0,
        divida_total: 32000.0,
        quantidade_parcelas: 36,
        taxa_juros: 1.8,
        juros_mensais: 15.0,
        flag: true,
        mes: parseInt(mes),
        ano: parseInt(ano),
        data_vencimento: `${ano}-${mes.padStart(2, "0")}-20`,
        status: "pendente",
      },
      {
        id: 3,
        tipo: "Emprestimo",
        categoria: "Empréstimo Pessoal",
        descricao: "Empréstimo banco XYZ",
        valor: 550.0,
        valor_mensal: 550.0,
        valor_hoje: 10000.0,
        divida_total: 12000.0,
        quantidade_parcelas: 24,
        taxa_juros: 8.5,
        juros_mensais: 70.0,
        flag: false,
        mes: parseInt(mes),
        ano: parseInt(ano),
        data_vencimento: `${ano}-${mes.padStart(2, "0")}-10`,
        status: "pago",
      },
    ];

    // Filter by type if specified
    let filteredDividas = mockDividas;
    if (tipo && tipo !== "Todos") {
      filteredDividas = mockDividas.filter((divida) => divida.tipo === tipo);
    }

    // Calculate totals by category
    const totaisPorCategoria = [
      {
        categoria: "Cartão de Crédito",
        total: filteredDividas.filter(d => d.tipo === "Cartao").reduce((sum, d) => sum + d.valor, 0),
        percentual: 40.5
      },
      {
        categoria: "Financiamento",
        total: filteredDividas.filter(d => d.tipo === "Financiamento").reduce((sum, d) => sum + d.valor, 0),
        percentual: 35.2
      },
      {
        categoria: "Empréstimo",
        total: filteredDividas.filter(d => d.tipo === "Emprestimo").reduce((sum, d) => sum + d.valor, 0),
        percentual: 24.3
      }
    ];

    return {
      maiores_dividas: filteredDividas,
      totais_por_categoria: totaisPorCategoria
    };
  }

  // ===== APIs DE GASTOS =====
  async getMaioresGastos(categoria: string, mes: string, ano: string) {
    try {
      secureLog("[BUDGET] Fetching maiores gastos", { categoria, mes, ano });
      const response = await api.get(
        `/api/maiores_gastos?categoria=${categoria}&mes=${mes}&ano=${ano}`,
      );
      return response;
    } catch (error) {
      console.error("API Error - getMaioresGastos:", error);

      // Use mock data only in development
      if (isDevelopment) {
        secureLog(
          "[BUDGET] Using mock data for getMaioresGastos (development)",
        );
        await simulateApiDelay(200);
        return this.getMockGastosData(categoria, mes, ano);
      }

      throw error;
    }
  }

  private getMockGastosData(categoria: string, mes: string, ano: string) {
    const mockGastos = [
      {
        id: 1,
        categoria: "Alimentacao",
        descricao: "Supermercado Extra",
        valor: 450.75,
        valor_mensal: 450.75,
        flag: false,
        data: `${ano}-${mes.padStart(2, "0")}-05`,
        tipo: "gasto",
        mes: parseInt(mes),
        ano: parseInt(ano),
      },
      {
        id: 2,
        categoria: "Transporte",
        descricao: "Combustível posto Shell",
        valor: 280.0,
        valor_mensal: 280.0,
        flag: true,
        data: `${ano}-${mes.padStart(2, "0")}-08`,
        tipo: "gasto",
        mes: parseInt(mes),
        ano: parseInt(ano),
      },
      {
        id: 3,
        categoria: "Lazer",
        descricao: "Cinema shopping",
        valor: 65.5,
        valor_mensal: 65.5,
        flag: false,
        data: `${ano}-${mes.padStart(2, "0")}-12`,
        tipo: "gasto",
        mes: parseInt(mes),
        ano: parseInt(ano),
      },
      {
        id: 4,
        categoria: "Saude",
        descricao: "Farmácia consulta",
        valor: 120.0,
        valor_mensal: 120.0,
        flag: true,
        data: `${ano}-${mes.padStart(2, "0")}-18`,
        tipo: "gasto",
        mes: parseInt(mes),
        ano: parseInt(ano),
      },
      {
        id: 5,
        categoria: "Educacao",
        descricao: "Curso online Udemy",
        valor: 89.9,
        valor_mensal: 89.9,
        flag: false,
        data: `${ano}-${mes.padStart(2, "0")}-22`,
        tipo: "gasto",
        mes: parseInt(mes),
        ano: parseInt(ano),
      },
    ];

    // Filter by category if specified
    let filteredGastos = mockGastos;
    if (categoria && categoria !== "Todas") {
      filteredGastos = mockGastos.filter((gasto) => gasto.categoria === categoria);
    }

    // Calculate totals by category
    const totaisPorCategoria = [
      {
        categoria: "Alimentação",
        total: filteredGastos.filter(g => g.categoria === "Alimentacao").reduce((sum, g) => sum + g.valor, 0),
        percentual: 31.2
      },
      {
        categoria: "Transporte",
        total: filteredGastos.filter(g => g.categoria === "Transporte").reduce((sum, g) => sum + g.valor, 0),
        percentual: 22.1
      },
      {
        categoria: "Lazer",
        total: filteredGastos.filter(g => g.categoria === "Lazer").reduce((sum, g) => sum + g.valor, 0),
        percentual: 15.4
      },
      {
        categoria: "Saúde",
        total: filteredGastos.filter(g => g.categoria === "Saude").reduce((sum, g) => sum + g.valor, 0),
        percentual: 18.7
      },
      {
        categoria: "Educação",
        total: filteredGastos.filter(g => g.categoria === "Educacao").reduce((sum, g) => sum + g.valor, 0),
        percentual: 12.6
      }
    ];

    return {
      maiores_gastos: filteredGastos,
      totais_por_categoria: totaisPorCategoria
    };
  }

  // ===== APIs DE ENTRADAS =====
  async getMaioresEntradas(categoria: string, mes: string, ano: string) {
    try {
      const response = await api.get(
        `/api/maiores_entradas?categoria=${categoria}&mes=${mes}&ano=${ano}`,
      );
      return response;
    } catch (error) {
      console.error("API Error - getMaioresEntradas:", error);

      // Use mock data only in development
      if (isDevelopment) {
        await simulateApiDelay(200);
        return this.getMockEntradasData(categoria, mes, ano);
      }

      throw error;
    }
  }

  async getEntradas(ano: string) {
    try {
      const response = await api.get(`/api/entradas/${ano}/`);
      return response;
    } catch (error) {
      console.error("API Error - getEntradas:", error);
      throw error;
    }
  }

  async cadastrarEntrada(data: any) {
    try {
      const response = await api.post("/api/cadastrar_entrada/", data);
      return response;
    } catch (error) {
      console.error("API Error - cadastrarEntrada:", error);
      throw error;
    }
  }

  async excluirEntrada(id: number) {
    try {
      const response = await api.delete(`/api/excluir_entrada/${id}/`);
      return response;
    } catch (error) {
      console.error("API Error - excluirEntrada:", error);
      throw error;
    }
  }

  async atualizarFlagEntrada(id: number, data: { flag: boolean }) {
    try {
      const response = await api.put(`/api/atualizar_flag_entrada/${id}/`, data);
      return response;
    } catch (error) {
      console.error("API Error - atualizarFlagEntrada:", error);
      throw error;
    }
  }

  async atualizarFlagCusto(id: number, data: { flag: boolean }) {
    try {
      const response = await api.put(`/api/atualizar_flag/${id}/`, data);
      return response;
    } catch (error) {
      console.error("API Error - atualizarFlagCusto:", error);
      throw error;
    }
  }

  async atualizarFlagDivida(id: number, data: { flag: boolean }) {
    try {
      const response = await api.put(`/api/atualizar_flag_divida/${id}/`, data);
      return response;
    } catch (error) {
      console.error("API Error - atualizarFlagDivida:", error);
      throw error;
    }
  }

  private getMockEntradasData(categoria: string, mes: string, ano: string) {
    const mockEntradas = [
      {
        id: 1,
        categoria: "Salario",
        descricao: "Salário principal",
        valor_mensal: 5500.0,
        mes: parseInt(mes),
        ano: parseInt(ano),
        flag: true,
      },
      {
        id: 2,
        categoria: "Freelance",
        descricao: "Projeto desenvolvimento web",
        valor_mensal: 1200.0,
        mes: parseInt(mes),
        ano: parseInt(ano),
        flag: false,
      },
      {
        id: 3,
        categoria: "Investimentos",
        descricao: "Dividendos ações",
        valor_mensal: 350.75,
        mes: parseInt(mes),
        ano: parseInt(ano),
        flag: true,
      },
      {
        id: 4,
        categoria: "Bonus",
        descricao: "Bônus performance Q1",
        valor_mensal: 800.0,
        mes: parseInt(mes),
        ano: parseInt(ano),
        flag: false,
      },
    ];

    // Filter by category if specified
    let filteredEntradas = mockEntradas;
    if (categoria && categoria !== "Todas") {
      filteredEntradas = mockEntradas.filter((entrada) => entrada.categoria === categoria);
    }

    // Calculate totals by category
    const totaisPorCategoria = [
      {
        categoria: "Salário",
        total: filteredEntradas.filter(e => e.categoria === "Salario").reduce((sum, e) => sum + e.valor_mensal, 0),
        percentual: 45.2
      },
      {
        categoria: "Freelance",
        total: filteredEntradas.filter(e => e.categoria === "Freelance").reduce((sum, e) => sum + e.valor_mensal, 0),
        percentual: 28.1
      },
      {
        categoria: "Investimentos",
        total: filteredEntradas.filter(e => e.categoria === "Investimentos").reduce((sum, e) => sum + e.valor_mensal, 0),
        percentual: 15.3
      },
      {
        categoria: "Bônus",
        total: filteredEntradas.filter(e => e.categoria === "Bonus").reduce((sum, e) => sum + e.valor_mensal, 0),
        percentual: 11.4
      }
    ];

    return {
      maiores_entradas: filteredEntradas,
      totais_por_categoria: totaisPorCategoria
    };
  }

  // ===== APIs DE CHARTS =====
  async getVariacaoEntrada(
    mes: number,
    ano: number,
  ): Promise<VariacaoEntrada[]> {
    try {
      secureLog("[BUDGET] Fetching variacao entrada", { mes, ano });
      
      // Buscar dados completos do ano
      const response = await this.getDistribuicaoGastosCompleta(mes, ano);
      
      // Transformar dados em formato de variação mensal
      const variacaoEntrada: VariacaoEntrada[] = [];
      
      if (response.dados_mensais) {
        Object.entries(response.dados_mensais).forEach(([mesKey, dadosMes]) => {
          variacaoEntrada.push({
            mes: parseInt(mesKey),
            ano: parseInt(response.ano),
            valor_total: dadosMes.resumo_financeiro.total_entradas
          });
        });
      }
      
      // Ordenar por mês
      variacaoEntrada.sort((a, b) => a.mes - b.mes);
      
      return variacaoEntrada;
    } catch (error) {
      console.error("API Error - getVariacaoEntrada:", error);

      // Use mock data only in development
      if (isDevelopment) {
        secureLog(
          "[BUDGET] Using mock data for variacao entrada (development)",
        );
        await simulateApiDelay(200);
        return this.getMockVariacaoEntrada();
      }

      throw error;
    }
  }

  async getDistribuicaoGastos(
    mes: number,
    ano: number,
  ): Promise<DistribuicaoGastos[]> {
    try {
      secureLog("[BUDGET] Fetching distribuicao gastos", { mes, ano });
      
      // Buscar dados completos
      const response = await this.getDistribuicaoGastosCompleta(mes, ano);
      
      // Agregar dados de TODOS os meses disponíveis
      const agregacaoCategorias: { [categoria: string]: number } = {};
      let totalGeral = 0;
      
      if (response.dados_mensais) {
        Object.values(response.dados_mensais).forEach(dadosMes => {
          dadosMes.gastos.por_categoria.forEach(categoria => {
            if (!agregacaoCategorias[categoria.categoria]) {
              agregacaoCategorias[categoria.categoria] = 0;
            }
            agregacaoCategorias[categoria.categoria] += categoria.total;
            totalGeral += categoria.total;
          });
        });
      }
      
      // Transformar em formato do gráfico com percentuais recalculados
      const distribuicaoGastos: DistribuicaoGastos[] = Object.entries(agregacaoCategorias).map(([categoria, total]) => ({
        categoria,
        valor: total,
        percentual: totalGeral > 0 ? (total / totalGeral) * 100 : 0
      }));
      
      // Ordenar por valor decrescente
      distribuicaoGastos.sort((a, b) => b.valor - a.valor);
      
      return distribuicaoGastos;
    } catch (error) {
      console.error("API Error - getDistribuicaoGastos:", error);

      // Use mock data only in development
      if (isDevelopment) {
        secureLog(
          "[BUDGET] Using mock data for distribuicao gastos (development)",
        );
        await simulateApiDelay(200);
        return this.getMockDistribuicaoGastos();
      }

      throw error;
    }
  }

  async getDistribuicaoGastosCompleta(
    mes: number,
    ano: number,
  ): Promise<DistribuicaoGastosResponse> {
    try {
      secureLog("[BUDGET] Fetching distribuicao gastos completa", { mes, ano });
      const response = await api.get(
        `/api/distribuicao_gastos?ano=${ano}`,
      );
      return response;
    } catch (error) {
      console.error("API Error - getDistribuicaoGastosCompleta:", error);

      // Use mock data only in development
      if (isDevelopment) {
        secureLog(
          "[BUDGET] Using mock data for distribuicao gastos completa (development)",
        );
        await simulateApiDelay(200);
        return this.getMockDistribuicaoGastosCompleta(mes, ano);
      }

      throw error;
    }
  }

  async getBudgetOverview(mes: number, ano: number): Promise<BudgetResponse> {
    try {
      secureLog("[BUDGET] Fetching budget overview", { mes, ano });
      const response = await api.get(
        `/api/budget_overview?mes=${mes}&ano=${ano}`,
      );
      return response;
    } catch (error) {
      console.error("API Error - getBudgetOverview:", error);

      // Use mock data only in development
      if (isDevelopment) {
        secureLog("[BUDGET] Using mock data for budget overview (development)");
        await simulateApiDelay(200);
        const [variacao_entrada, distribuicao_gastos] = await Promise.all([
          this.getMockVariacaoEntrada(),
          this.getMockDistribuicaoGastos(),
        ]);

        return {
          variacao_entrada,
          distribuicao_gastos,
          total_entrada: 7850.75,
          total_gastos: 3840.0,
        };
      }

      throw error;
    }
  }

  private getMockVariacaoEntrada(): VariacaoEntrada[] {
    return [
      { mes: 1, ano: 2024, valor_total: 6500.0, variacao_percentual: 0 },
      { mes: 2, ano: 2024, valor_total: 6800.0, variacao_percentual: 4.6 },
      { mes: 3, ano: 2024, valor_total: 7200.0, variacao_percentual: 5.9 },
      { mes: 4, ano: 2024, valor_total: 6900.0, variacao_percentual: -4.2 },
      { mes: 5, ano: 2024, valor_total: 7500.0, variacao_percentual: 8.7 },
      { mes: 6, ano: 2024, valor_total: 7850.75, variacao_percentual: 4.7 },
    ];
  }

  private getMockDistribuicaoGastos(): DistribuicaoGastos[] {
    return [
      { categoria: "Alimentação", valor: 1200.0, percentual: 31.2 },
      { categoria: "Transporte", valor: 850.0, percentual: 22.1 },
      { categoria: "Moradia", valor: 950.0, percentual: 24.7 },
      { categoria: "Lazer", valor: 400.0, percentual: 10.4 },
      { categoria: "Saúde", valor: 280.0, percentual: 7.3 },
      { categoria: "Outros", valor: 160.0, percentual: 4.2 },
    ];
  }

  private getMockDistribuicaoGastosCompleta(mes: number, ano: number): DistribuicaoGastosResponse {
    const mesStr = mes.toString();
    const anoStr = ano.toString();
    
    return {
      ano: anoStr,
      meses_disponeis: ["7", "8"],
      dados_mensais: {
        "8": {
          mes: "8",
          resumo_financeiro: {
            total_entradas: 1400.0,
            total_gastos: 1552.0,
            total_dividas: 8580.0,
            total_dividas_mensais: 602.0,
            total_juros_mensais: 1435.1,
            saldo_liquido_mensal: -754.0,
            total_custos: 2154.0
          },
          entradas: {
            resumo: {
              total_entradas: 1400.0,
              total_com_replicacao: 0.0,
              total_sem_replicacao: 1400.0
            },
            por_categoria: [
              {
                categoria: "Salario",
                total: 1200.0,
                percentual: 85.71
              },
              {
                categoria: "Freelance",
                total: 200.0,
                percentual: 14.29
              }
            ]
          },
          gastos: {
            resumo: {
              total_gastos: 1552.0,
              total_com_replicacao: 1000.0,
              total_sem_replicacao: 552.0
            },
            por_categoria: [
              {
                categoria: "Custo Fixo",
                total: 1000.0,
                percentual: 64.43
              },
              {
                categoria: "Conforto",
                total: 500.0,
                percentual: 32.22
              },
              {
                categoria: "Outros",
                total: 52.0,
                percentual: 3.35
              }
            ]
          },
          dividas: {
            resumo: {
              total_dividas: 8580.0,
              total_juros_mensais: 1435.1,
              total_com_replicacao: 0.0,
              total_sem_replicacao: 8580.0
            },
            por_categoria: [
              {
                categoria: "Financiamento",
                total_divida: 6780.0,
                total_juros: 1435.1,
                percentual: 79.02
              },
              {
                categoria: "CartaoDeCredito",
                total_divida: 1800.0,
                total_juros: 0.0,
                percentual: 20.98
              }
            ]
          },
          orcamento_domestico: {
            resumo: {
              total_planejado: 0.75,
              data_configuracao: "2025-08-02T18:11:30.193185+00:00"
            },
            por_categoria: [
              {
                categoria: "Conhecimento",
                valor: 0.44,
                percentual: 44.0
              },
              {
                categoria: "Metas",
                valor: 0.16,
                percentual: 16.0
              },
              {
                categoria: "Conforto",
                valor: 0.1,
                percentual: 10.0
              },
              {
                categoria: "Custos Fixos",
                valor: 0.05,
                percentual: 5.0
              },
              {
                categoria: "Prazer",
                valor: 0.0,
                percentual: 0.0
              },
              {
                categoria: "Liberdade Financeira",
                valor: 0.0,
                percentual: 0.0
              }
            ],
            detalhes: {
              custos_fixos: 0.05,
              prazer: 0.0,
              conforto: 0.1,
              metas: 0.16,
              liberdade_financeira: 0.0,
              conhecimento: 0.44,
              data: "2025-08-02T18:11:30.193185+00:00"
            }
          }
        },
        "7": {
          mes: "7",
          resumo_financeiro: {
            total_entradas: 7946.0,
            total_gastos: 1946.0,
            total_dividas: 1608.0,
            total_dividas_mensais: 86.0,
            total_juros_mensais: 5.4,
            saldo_liquido_mensal: 5914.0,
            total_custos: 2032.0
          },
          entradas: {
            resumo: {
              total_entradas: 7946.0,
              total_com_replicacao: 4400.0,
              total_sem_replicacao: 3546.0
            },
            por_categoria: [
              {
                categoria: "Salario",
                total: 4400.0,
                percentual: 55.37
              },
              {
                categoria: "Freelance",
                total: 3546.0,
                percentual: 44.63
              }
            ]
          },
          gastos: {
            resumo: {
              total_gastos: 1946.0,
              total_com_replicacao: 1289.0,
              total_sem_replicacao: 657.0
            },
            por_categoria: [
              {
                categoria: "Custo Fixo",
                total: 845.0,
                percentual: 43.42
              },
              {
                categoria: "Conhecimento",
                total: 657.0,
                percentual: 33.76
              },
              {
                categoria: "Conforto",
                total: 444.0,
                percentual: 22.82
              }
            ]
          },
          dividas: {
            resumo: {
              total_dividas: 1608.0,
              total_juros_mensais: 5.4,
              total_com_replicacao: 0.0,
              total_sem_replicacao: 1608.0
            },
            por_categoria: [
              {
                categoria: "CartaoDeCredito",
                total_divida: 960.0,
                total_juros: 0.0,
                percentual: 59.7
              },
              {
                categoria: "Outros",
                total_divida: 648.0,
                total_juros: 5.4,
                percentual: 40.3
              }
            ]
          },
          orcamento_domestico: {
            resumo: {
              total_planejado: 0.75,
              data_configuracao: "2025-08-02T18:11:30.193185+00:00"
            },
            por_categoria: [
              {
                categoria: "Conhecimento",
                valor: 0.44,
                percentual: 44.0
              },
              {
                categoria: "Metas",
                valor: 0.16,
                percentual: 16.0
              },
              {
                categoria: "Conforto",
                valor: 0.1,
                percentual: 10.0
              },
              {
                categoria: "Custos Fixos",
                valor: 0.05,
                percentual: 5.0
              },
              {
                categoria: "Prazer",
                valor: 0.0,
                percentual: 0.0
              },
              {
                categoria: "Liberdade Financeira",
                valor: 0.0,
                percentual: 0.0
              }
            ],
            detalhes: {
              custos_fixos: 0.05,
              prazer: 0.0,
              conforto: 0.1,
              metas: 0.16,
              liberdade_financeira: 0.0,
              conhecimento: 0.44,
              data: "2025-08-02T18:11:30.193185+00:00"
            }
          }
        }
      },
      metas_personalizadas: {
        total_economizado: 6501.0,
        total_metas: 6515.0,
        metas_concluidas: 1,
        metas_ativas: 1,
        progresso_geral: 50.0
      }
    };
  }

  // ===== APIs DE CADASTRO =====
  async cadastrarGasto(data: any) {
    try {
      const response = await api.post("/api/cadastrar_gasto/", data);
      return response;
    } catch (error) {
      console.error("API Error - cadastrarGasto:", error);
      throw error;
    }
  }

  async cadastrarDivida(data: any) {
    try {
      const response = await api.post("/api/cadastrar_divida/", data);
      return response;
    } catch (error) {
      console.error("API Error - cadastrarDivida:", error);
      throw error;
    }
  }

  async getOrcamentoDomestico() {
    try {
      const response = await api.get("/api/orcamentodomestico/");
      return response;
    } catch (error) {
      console.error("API Error - getOrcamentoDomestico:", error);

      // Use mock data only in development
      if (isDevelopment) {
        await simulateApiDelay(200);
        return this.getMockOrcamentoDomestico();
      }

      throw error;
    }
  }

  async cadastrarOrcamentoDomestico(data: any) {
    try {
      const response = await api.post("/api/orcamentodomestico/", data);
      return response;
    } catch (error) {
      console.error("API Error - cadastrarOrcamentoDomestico:", error);
      throw error;
    }
  }

  private getMockOrcamentoDomestico() {
    return {
      custos_fixos: 0.40,
      prazer: 0.15,
      conforto: 0.10,
      metas: 0.20,
      liberdade_financeira: 0.10,
      conhecimento: 0.05,
    };
  }

  // ===== APIs DE EXCLUSÃO =====
  async excluirGasto(id: number) {
    try {
      const response = await api.delete(`/api/excluir_gasto/${id}/`);
      return response;
    } catch (error) {
      console.error("API Error - excluirGasto:", error);
      throw error;
    }
  }

  async excluirDivida(id: number) {
    try {
      const response = await api.delete(`/api/excluir_divida/${id}/`);
      return response;
    } catch (error) {
      console.error("API Error - excluirDivida:", error);
      throw error;
    }
  }

  // ===== APIs DE ATUALIZAÇÃO =====
  async atualizarFlag(id: number, data: any) {
    try {
      secureLog("[BUDGET] Atualizando flag", { id });
      const response = await api.put(`/api/atualizar_flag/${id}/`, data);
      return response;
    } catch (error) {
      console.error("API Error - atualizarFlag:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const budgetApiService = new BudgetApiService();
export const budgetApi = budgetApiService; // Legacy export name
export default budgetApiService;

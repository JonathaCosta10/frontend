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

class BudgetApiService {
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
      const response = await api.get(
        `/api/variacao_entrada?mes=${mes}&ano=${ano}`,
      );
      return response.variacao_entrada || [];
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
      const response = await api.get(
        `/api/distribuicao_gastos?mes=${mes}&ano=${ano}`,
      );
      return response.distribuicao_gastos || [];
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

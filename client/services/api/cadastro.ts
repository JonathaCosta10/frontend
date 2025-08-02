/**
 * Cadastro API Service - Sistema Unificado de Cadastros
 * 
 * Este arquivo centraliza todas as operações de cadastro do sistema,
 * fornecendo uma interface consistente para criação, atualização,
 * listagem e exclusão de registros.
 */

import { api } from "@/lib/api";
import { developmentConfig, simulateApiDelay } from "@/config/development";

// ============= INTERFACES BASE =============

export interface BaseCadastroItem {
  id?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface CadastroResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface CadastroListResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// ============= TIPOS ESPECÍFICOS DE CADASTRO =============

export interface InvestmentCadastro extends BaseCadastroItem {
  ticker: string;
  tipo: 'acao' | 'fii' | 'renda_fixa' | 'cripto';
  quantidade: number;
  preco_medio: number;
  data_compra: string;
  corretora: string;
  observacoes?: string;
  setor?: string;
  categoria?: string;
}

export interface BudgetCadastro extends BaseCadastroItem {
  tipo: 'entrada' | 'gasto' | 'divida';
  categoria: string;
  subcategoria?: string;
  descricao: string;
  valor: number;
  data: string;
  recorrente: boolean;
  frequencia?: 'mensal' | 'quinzenal' | 'semanal' | 'anual';
  data_vencimento?: string;
  status?: 'pendente' | 'pago' | 'vencido';
  tags?: string[];
}

export interface GoalCadastro extends BaseCadastroItem {
  titulo: string;
  descricao: string;
  valor_meta: number;
  valor_atual: number;
  prazo: string;
  tipo: 'financeiro' | 'investimento' | 'economia';
  prioridade: 'baixa' | 'media' | 'alta';
  status: 'ativo' | 'pausado' | 'concluido' | 'cancelado';
}

export interface WatchlistCadastro extends BaseCadastroItem {
  ticker: string;
  tipo: 'acao' | 'fii' | 'cripto';
  preco_alvo_compra?: number;
  preco_alvo_venda?: number;
  observacoes?: string;
  notificar_preco: boolean;
  data_adicao: string;
}

// ============= CLASSE PRINCIPAL =============

class CadastroApiService {

  // ============= MÉTODOS GENÉRICOS =============

  /**
   * Cria um novo registro de qualquer tipo
   * 
   * @param tipo - Tipo de cadastro ('investment', 'budget', 'goal', 'watchlist')
   * @param data - Dados do registro a ser criado
   * @returns Promise com resultado da operação
   */
  async create<T extends BaseCadastroItem>(
    tipo: string, 
    data: Omit<T, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CadastroResponse<T>> {
    
    if (developmentConfig.useMockData) {
      if (developmentConfig.showApiLogs) {
        console.log(`🔄 [CADASTRO-${tipo.toUpperCase()}] Criando registro (mock)`, data);
      }
      await simulateApiDelay(300);
      return this.getMockCreateResponse(tipo, data);
    }

    try {
      const response = await api.post(`/api/cadastro/${tipo}/`, data);
      
      if (developmentConfig.showApiLogs) {
        console.log(`✅ [CADASTRO-${tipo.toUpperCase()}] Registro criado com sucesso`);
      }

      return {
        success: true,
        message: 'Registro criado com sucesso',
        data: response.data
      };

    } catch (error: any) {
      console.error(`❌ [CADASTRO-${tipo.toUpperCase()}] Erro ao criar registro:`, error);
      
      return {
        success: false,
        message: 'Erro ao criar registro',
        errors: error.response?.data?.errors || { general: ['Erro interno do servidor'] }
      };
    }
  }

  /**
   * Lista registros com filtros e paginação
   * 
   * @param tipo - Tipo de cadastro
   * @param filters - Filtros para a consulta
   * @param pagination - Opções de paginação
   * @returns Promise com lista paginada
   */
  async list<T extends BaseCadastroItem>(
    tipo: string,
    filters: Record<string, any> = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<CadastroListResponse<T>> {
    
    if (developmentConfig.useMockData) {
      if (developmentConfig.showApiLogs) {
        console.log(`🔄 [CADASTRO-${tipo.toUpperCase()}] Listando registros (mock)`, { filters, pagination });
      }
      await simulateApiDelay(250);
      return this.getMockListResponse(tipo, filters, pagination);
    }

    try {
      const queryParams = new URLSearchParams({
        page: (pagination.page || 1).toString(),
        limit: (pagination.limit || 20).toString(),
        ...filters
      });

      const response = await api.get(`/api/cadastro/${tipo}/?${queryParams}`);
      
      if (developmentConfig.showApiLogs) {
        console.log(`✅ [CADASTRO-${tipo.toUpperCase()}] Registros listados com sucesso`);
      }

      return {
        success: true,
        data: response.data.results || response.data,
        pagination: response.data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_items: response.data.length || 0,
          items_per_page: response.data.length || 0
        }
      };

    } catch (error: any) {
      console.error(`❌ [CADASTRO-${tipo.toUpperCase()}] Erro ao listar registros:`, error);
      
      return {
        success: false,
        data: [],
        pagination: {
          current_page: 1,
          total_pages: 0,
          total_items: 0,
          items_per_page: 0
        }
      };
    }
  }

  /**
   * Atualiza um registro existente
   * 
   * @param tipo - Tipo de cadastro
   * @param id - ID do registro
   * @param data - Dados atualizados
   * @returns Promise com resultado da operação
   */
  async update<T extends BaseCadastroItem>(
    tipo: string,
    id: number,
    data: Partial<T>
  ): Promise<CadastroResponse<T>> {
    
    if (developmentConfig.useMockData) {
      if (developmentConfig.showApiLogs) {
        console.log(`🔄 [CADASTRO-${tipo.toUpperCase()}] Atualizando registro ${id} (mock)`, data);
      }
      await simulateApiDelay(250);
      return this.getMockUpdateResponse(tipo, id, data);
    }

    try {
      const response = await api.patch(`/api/cadastro/${tipo}/${id}/`, data);
      
      if (developmentConfig.showApiLogs) {
        console.log(`✅ [CADASTRO-${tipo.toUpperCase()}] Registro ${id} atualizado com sucesso`);
      }

      return {
        success: true,
        message: 'Registro atualizado com sucesso',
        data: response.data
      };

    } catch (error: any) {
      console.error(`❌ [CADASTRO-${tipo.toUpperCase()}] Erro ao atualizar registro ${id}:`, error);
      
      return {
        success: false,
        message: 'Erro ao atualizar registro',
        errors: error.response?.data?.errors || { general: ['Erro interno do servidor'] }
      };
    }
  }

  /**
   * Exclui um registro
   * 
   * @param tipo - Tipo de cadastro
   * @param id - ID do registro
   * @returns Promise com resultado da operação
   */
  async delete(tipo: string, id: number): Promise<CadastroResponse> {
    
    if (developmentConfig.useMockData) {
      if (developmentConfig.showApiLogs) {
        console.log(`🔄 [CADASTRO-${tipo.toUpperCase()}] Excluindo registro ${id} (mock)`);
      }
      await simulateApiDelay(200);
      return {
        success: true,
        message: 'Registro excluído com sucesso (modo desenvolvimento)'
      };
    }

    try {
      await api.delete(`/api/cadastro/${tipo}/${id}/`);
      
      if (developmentConfig.showApiLogs) {
        console.log(`✅ [CADASTRO-${tipo.toUpperCase()}] Registro ${id} excluído com sucesso`);
      }

      return {
        success: true,
        message: 'Registro excluído com sucesso'
      };

    } catch (error: any) {
      console.error(`❌ [CADASTRO-${tipo.toUpperCase()}] Erro ao excluir registro ${id}:`, error);
      
      return {
        success: false,
        message: 'Erro ao excluir registro',
        errors: error.response?.data?.errors || { general: ['Erro interno do servidor'] }
      };
    }
  }

  // ============= MÉTODOS ESPECÍFICOS =============

  /**
   * Cadastro de investimento
   */
  async createInvestment(data: Omit<InvestmentCadastro, 'id' | 'created_at' | 'updated_at'>) {
    return this.create<InvestmentCadastro>('investment', data);
  }

  async listInvestments(filters: {
    tipo?: string;
    ticker?: string;
    corretora?: string;
    setor?: string;
  } = {}, pagination?: { page?: number; limit?: number }) {
    return this.list<InvestmentCadastro>('investment', filters, pagination);
  }

  /**
   * Cadastro de orçamento (receitas, gastos, dívidas)
   */
  async createBudgetItem(data: Omit<BudgetCadastro, 'id' | 'created_at' | 'updated_at'>) {
    return this.create<BudgetCadastro>('budget', data);
  }

  async listBudgetItems(filters: {
    tipo?: string;
    categoria?: string;
    mes?: number;
    ano?: number;
    status?: string;
  } = {}, pagination?: { page?: number; limit?: number }) {
    return this.list<BudgetCadastro>('budget', filters, pagination);
  }

  /**
   * Cadastro de metas
   */
  async createGoal(data: Omit<GoalCadastro, 'id' | 'created_at' | 'updated_at'>) {
    return this.create<GoalCadastro>('goal', data);
  }

  async listGoals(filters: {
    tipo?: string;
    status?: string;
    prioridade?: string;
  } = {}, pagination?: { page?: number; limit?: number }) {
    return this.list<GoalCadastro>('goal', filters, pagination);
  }

  /**
   * Cadastro de watchlist
   */
  async createWatchlistItem(data: Omit<WatchlistCadastro, 'id' | 'created_at' | 'updated_at'>) {
    return this.create<WatchlistCadastro>('watchlist', data);
  }

  async listWatchlistItems(filters: {
    tipo?: string;
    ticker?: string;
  } = {}, pagination?: { page?: number; limit?: number }) {
    return this.list<WatchlistCadastro>('watchlist', filters, pagination);
  }

  // ============= MÉTODOS MOCK =============

  private getMockCreateResponse<T>(tipo: string, data: any): CadastroResponse<T> {
    return {
      success: true,
      message: `${tipo} criado com sucesso (modo desenvolvimento)`,
      data: {
        ...data,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as T
    };
  }

  private getMockListResponse<T>(tipo: string, filters: any, pagination: any): CadastroListResponse<T> {
    // Dados mock baseados no tipo
    const mockData = this.generateMockData(tipo, pagination.limit || 10);
    
    return {
      success: true,
      data: mockData as T[],
      pagination: {
        current_page: pagination.page || 1,
        total_pages: 3,
        total_items: 25,
        items_per_page: pagination.limit || 10
      }
    };
  }

  private getMockUpdateResponse<T>(tipo: string, id: number, data: any): CadastroResponse<T> {
    return {
      success: true,
      message: `${tipo} ${id} atualizado com sucesso (modo desenvolvimento)`,
      data: {
        ...data,
        id,
        updated_at: new Date().toISOString()
      } as T
    };
  }

  private generateMockData(tipo: string, count: number): any[] {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const baseItem = {
        id: 1000 + i,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'mock-user-001'
      };

      switch (tipo) {
        case 'investment':
          data.push({
            ...baseItem,
            ticker: ['PETR4', 'VALE3', 'ITUB4', 'HGLG11', 'KNRI11'][i % 5],
            tipo: ['acao', 'fii'][i % 2],
            quantidade: 100 + i * 10,
            preco_medio: 20.50 + i * 2.5,
            data_compra: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            corretora: ['XP', 'Rico', 'Clear', 'BTG'][i % 4],
            setor: ['Tecnologia', 'Bancos', 'Petróleo'][i % 3]
          });
          break;

        case 'budget':
          data.push({
            ...baseItem,
            tipo: ['entrada', 'gasto', 'divida'][i % 3],
            categoria: ['Salário', 'Alimentação', 'Transporte', 'Lazer'][i % 4],
            descricao: `Item de orçamento ${i + 1}`,
            valor: 500 + i * 100,
            data: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            recorrente: i % 2 === 0,
            status: ['pendente', 'pago'][i % 2]
          });
          break;

        case 'goal':
          data.push({
            ...baseItem,
            titulo: `Meta ${i + 1}`,
            descricao: `Descrição da meta ${i + 1}`,
            valor_meta: 10000 + i * 5000,
            valor_atual: 2000 + i * 1000,
            prazo: new Date(Date.now() + (365 - i * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            tipo: ['financeiro', 'investimento', 'economia'][i % 3],
            prioridade: ['baixa', 'media', 'alta'][i % 3],
            status: ['ativo', 'pausado', 'concluido'][i % 3]
          });
          break;

        case 'watchlist':
          data.push({
            ...baseItem,
            ticker: ['PETR4', 'VALE3', 'MGLU3', 'HGLG11'][i % 4],
            tipo: ['acao', 'fii'][i % 2],
            preco_alvo_compra: 20.00 + i,
            preco_alvo_venda: 30.00 + i,
            notificar_preco: i % 2 === 0,
            data_adicao: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
          break;
      }
    }
    
    return data;
  }
}

// ============= EXPORT =============

export const cadastroApi = new CadastroApiService();

// Re-export types for convenience
export type {
  BaseCadastroItem,
  CadastroResponse,
  CadastroListResponse,
  InvestmentCadastro,
  BudgetCadastro,
  GoalCadastro,
  WatchlistCadastro
};

/**
 * Market API Service
 * Serviço para comunicação com a API de mercado
 */

import { api } from '@/lib/api';

// Tipos baseados na resposta real da API
export interface TickerData {
  ticker: string;
  nome: string;
  preco: number; // Campo correto conforme API
  variacao_diaria: number;
  variacao_semanal: number;
  tamanho_milhoes: number;
  volume: number;
  data_preco: string;
  p_vp?: number;
  vpa?: number;
  dy_anualizado?: number;
  tipo: 'acao' | 'fii';
}

export interface SetorData {
  ativos: TickerData[];
  total_ativos: number;
}

export interface AcoesPerenes {
  [setor: string]: SetorData;
}

export interface FiisPerenes {
  [segmento: string]: SetorData;
}

export interface ResumoData {
  total_setores_acoes: number;
  total_segmentos_fiis: number;
  total_acoes: number;
  total_fiis: number;
  tempo_processamento_segundos: number;
  versao: string;
  observacao: string;
}

export interface TotaisConsolidados {
  valor_total_acoes_milhoes: number;
  valor_total_fiis_milhoes: number;
  valor_total_geral_milhoes: number;
  percentual_acoes: number;
  percentual_fiis: number;
}

export interface TabelaSetorData {
  setor: string;
  valor_milhoes: number;
  valor_patrimonial_milhoes: number;
  p_vp_medio: number;
  variacao_diaria: number;
  variacao_semanal: number;
  percentual_total: number;
  percentual_categoria: number;
  total_ativos: number;
  fonte_calculo: string;
  ativos_com_market_cap_real: number;
}

export interface TabelaSegmentoData {
  segmento: string;
  valor_milhoes: number;
  variacao_diaria: number;
  variacao_semanal: number;
  percentual_total: number;
  percentual_categoria: number;
  total_ativos: number;
}

export interface TabelasParaGraficos {
  tabela_acoes: TabelaSetorData[];
  tabela_fiis: TabelaSegmentoData[];
}

export interface DestaquesGeraisData {
  acoes_perenes: AcoesPerenes;
  fiis_perenes: FiisPerenes;
  resumo: ResumoData;
  totais_consolidados: TotaisConsolidados;
  tabelas_para_graficos: TabelasParaGraficos;
}

export interface DestaquesGeraisResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: DestaquesGeraisData;
}

/**
 * Serviço de Market API
 */
export const marketApi = {
  /**
   * Busca dados gerais de destaques do mercado
   * @returns {Promise<DestaquesGeraisResponse>} Dados de mercado
   */
  async getDestaquesGerais(): Promise<DestaquesGeraisResponse> {
    try {
      console.log('📈 MarketAPI - Buscando destaques gerais');
      
      const response = await api.get('/api/mercado/destaques/gerais');
      
      console.log('📨 MarketAPI - Dados recebidos:', response);
      
      return response as DestaquesGeraisResponse;
    } catch (error) {
      console.error('❌ MarketAPI - Erro na requisição:', error);
      
      throw error;
    }
  },

  /**
   * Busca dados específicos de um setor
   * @param {string} tipo - Tipo do ativo ('acao' | 'fii')
   * @param {string} setor - Nome do setor
   * @returns {Promise<SetorData>} Dados do setor
   */
  async getDadosSetor(tipo: 'acao' | 'fii', setor: string): Promise<SetorData> {
    try {
      console.log(`📈 MarketAPI - Buscando dados do setor ${setor} (${tipo})`);
      
      const response = await api.get(`/api/mercado/setor/${tipo}/${encodeURIComponent(setor)}`);
      
      console.log('📨 MarketAPI - Dados do setor recebidos:', response);
      
      return response as SetorData;
    } catch (error) {
      console.error('❌ MarketAPI - Erro ao buscar dados do setor:', error);
      
      return {
        ativos: [],
        total_ativos: 0
      };
    }
  }
};

export default marketApi;
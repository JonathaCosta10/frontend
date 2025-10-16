/**
 * Interfaces para análise de FII - baseadas na resposta da API
 * http://127.0.0.1:5000/api/investimentos/analise-ativo/?ticker=
 */

// Interface principal da resposta da API
export interface FIIAnalysisResponse {
  ticker: string;
  cnpj: string;
  razao_social: string;
  qt_de_cotas: number;
  qt_aumento_de_cotas: number;
  mes_ultima_emicao_de_cotas: string | null;
  inicio_fundo: string;
  segmento: string;
  nome_adiministrador: string;
  prazo_duracao: string;
  data_prazo_duracao: string | null;
  nome_fundo: string;
  ultima_entrega_anual: string;
  data_entrega_consolidacao: string;
  data_inicio: string;
  objetivo: string;
  gestao: string;
  negociado_bolsa: boolean;
  administrador: string;
  site_administrador: string;
  cotistas_pf: number | null;
  cotistas_pj: number | null;
  qt_bacos_cotistas: number | null;
  qt_investidores_internacionais: number | null;
  valor_ativos: number;
  patrimonio_liquido: number;
  valor_patrimonial_cotas: number;
  caixa: number;
  total_investido: number;
  custo_mensal_administracao: number;
  dividendo: number;
  valores_a_receber: number;
  custos_fixos: number;
  ultimo_dividendo: number;
  quantidade_ativos_fundo: number;
  last_price: number;
  volume: number;
  min_mes: number;
  max_mes: number;
  ultima_semana: PriceHistory[];
  p_vp: number;
  valor_patrimonial: number;
  rentab_mensal: number;
  data_analise: string;
  status: string;
  liquidez: LiquidezData;
  composicao_ativo: ComposicaoAtivoData;
  recebiveis: RecebiveisData;
  passivo: PassivoData;
  rentabilidade_imobiliaria: RentabilidadeImobiliariaData;
  historico_mensal: HistoricoMensalItem[];
}

// Histórico de preços
export interface PriceHistory {
  preco: number;
  data: string;
}

// Dados de liquidez
export interface LiquidezData {
  raw: {
    total_necessidades_liquidez: number;
    disponibilidades: number;
    titulos_publicos: number;
    titulos_privados: number;
    fundos_renda_fixa: number;
  };
  metrics: {
    gap_liquidez: number;
    disponibilidade_sobre_total: number;
  };
}

// Composição do ativo
export interface ComposicaoAtivoData {
  raw: {
    total_investido: number;
    direitos_bens_imoveis: number;
    terrenos: number;
    imoveis_renda_acabados: number;
    imoveis_renda_construcao: number;
    fii: number;
    acoes_sociedades_atividades_fii: number;
  };
  metrics: {
    percent_imobiliario: number;
    percent_financeiro: number;
  };
}

// Dados de recebíveis
export interface RecebiveisData {
  raw: {
    valores_receber: number;
    contas_receber_aluguel: number;
    contas_receber_venda_imoveis: number;
    outros_valores_receber: number;
  };
  metrics: {
    percent_aluguel: number;
    percent_venda: number;
    percent_outros: number;
  };
}

// Dados do passivo
export interface PassivoData {
  raw: {
    total_passivo: number;
    taxa_administracao_pagar: number;
    adiantamento_alugueis: number;
    obrigacoes_securitizacao_recebiveis: number;
    outros_valores_pagar: number;
  };
  metrics: {
    alavancagem: number;
  };
}

// Rentabilidade imobiliária
export interface RentabilidadeImobiliariaData {
  metrics: {
    imoveis_renda_percentual: number;
    ultimo_dividendo_calculado: number;
  };
}

// Item do histórico mensal
export interface HistoricoMensalItem {
  data_referencia: string;
  gap_liquidez: number;
  alavancagem: number;
  percent_imobiliario: number;
  valores_receber: number;
  disponibilidades: number;
  total_investido: number;
  total_passivo: number;
  percent_aluguel: number;
  percent_venda: number;
  percent_outros: number;
  dividendo_periodo: number;
  imoveis_renda_percentual: number;
}

// Interfaces para componentes
export interface MetricCard {
  title: string;
  value: string | number;
  tooltip?: string;
  icon?: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'neutral';
  formatType?: 'currency' | 'percentage' | 'number' | 'custom';
}

export interface ChartConfig {
  title: string;
  data: any;
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  options?: any;
}

// Enums para tipos de dados
export enum IndicatorType {
  PRICE = 'price',
  P_VP = 'p_vp',
  DIVIDEND_YIELD = 'dividend_yield',
  ULTIMO_DIVIDENDO = 'ultimo_dividendo',
  VOLUME = 'volume',
  CAP_RATE = 'cap_rate',
  ALAVANCAGEM = 'alavancagem'
}

// Interface para tooltips dos indicadores
export interface IndicatorTooltip {
  [IndicatorType.PRICE]: string;
  [IndicatorType.P_VP]: string;
  [IndicatorType.DIVIDEND_YIELD]: string;
  [IndicatorType.ULTIMO_DIVIDENDO]: string;
  [IndicatorType.VOLUME]: string;
  [IndicatorType.CAP_RATE]: string;
  [IndicatorType.ALAVANCAGEM]: string;
}

// Constantes para tooltips
export const INDICATOR_TOOLTIPS: IndicatorTooltip = {
  [IndicatorType.PRICE]: 'Último preço de fechamento.',
  [IndicatorType.P_VP]: 'Relação Preço ÷ Valor Patrimonial por cota.',
  [IndicatorType.DIVIDEND_YIELD]: 'Dividendos dos últimos 12 meses ÷ preço atual.',
  [IndicatorType.ULTIMO_DIVIDENDO]: 'Última distribuição por cota.',
  [IndicatorType.VOLUME]: 'Volume de negociação diário.',
  [IndicatorType.CAP_RATE]: '(Receita operacional líquida ÷ Valor de mercado dos imóveis)',
  [IndicatorType.ALAVANCAGEM]: '(Dívida ÷ Patrimônio Líquido)'
};

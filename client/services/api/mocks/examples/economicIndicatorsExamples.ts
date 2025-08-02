import { 
  EconomicIndicator, 
  IndicatorGroup, 
  MarketSentiment, 
  IndicatorFilter,
  IndicatorCategory 
} from '../../../entities/EconomicIndicators';

// Mock Economic Indicators Data
export const mockEconomicIndicators: EconomicIndicator[] = [
  // Interest Rates
  {
    id: '1',
    name: 'Taxa Selic',
    code: 'SELIC',
    value: 11.75,
    previousValue: 12.25,
    change: -0.50,
    changePercent: -4.08,
    unit: '% a.a.',
    frequency: 'monthly',
    lastUpdate: '2024-01-17T14:00:00Z',
    category: 'interest_rates',
    description: 'Taxa básica de juros da economia brasileira',
    source: 'Banco Central do Brasil',
    historicalData: [
      { date: '2023-10-01', value: 13.75, change: 0.50, changePercent: 3.77 },
      { date: '2023-11-01', value: 13.25, change: -0.50, changePercent: -3.64 },
      { date: '2023-12-01', value: 12.25, change: -1.00, changePercent: -7.55 },
      { date: '2024-01-01', value: 11.75, change: -0.50, changePercent: -4.08 },
    ]
  },
  {
    id: '2',
    name: 'CDI',
    code: 'CDI',
    value: 11.65,
    previousValue: 12.15,
    change: -0.50,
    changePercent: -4.12,
    unit: '% a.a.',
    frequency: 'daily',
    lastUpdate: '2024-01-20T17:00:00Z',
    category: 'interest_rates',
    description: 'Certificado de Depósito Interbancário',
    source: 'B3',
    historicalData: [
      { date: '2024-01-15', value: 12.15, change: 0.00, changePercent: 0.00 },
      { date: '2024-01-16', value: 12.10, change: -0.05, changePercent: -0.41 },
      { date: '2024-01-17', value: 11.85, change: -0.25, changePercent: -2.07 },
      { date: '2024-01-18', value: 11.65, change: -0.20, changePercent: -1.69 },
    ]
  },
  
  // Inflation
  {
    id: '3',
    name: 'IPCA',
    code: 'IPCA',
    value: 4.62,
    previousValue: 4.68,
    change: -0.06,
    changePercent: -1.28,
    unit: '% a.a.',
    frequency: 'monthly',
    lastUpdate: '2024-01-10T09:00:00Z',
    category: 'inflation',
    description: 'Índice Nacional de Preços ao Consumidor Amplo',
    source: 'IBGE',
    historicalData: [
      { date: '2023-10-01', value: 4.82, change: 0.15, changePercent: 3.21 },
      { date: '2023-11-01', value: 4.68, change: -0.14, changePercent: -2.90 },
      { date: '2023-12-01', value: 4.62, change: -0.06, changePercent: -1.28 },
    ]
  },
  {
    id: '4',
    name: 'IGP-M',
    code: 'IGP_M',
    value: 3.15,
    previousValue: 3.42,
    change: -0.27,
    changePercent: -7.89,
    unit: '% a.a.',
    frequency: 'monthly',
    lastUpdate: '2024-01-10T09:00:00Z',
    category: 'inflation',
    description: 'Índice Geral de Preços do Mercado',
    source: 'FGV',
    historicalData: [
      { date: '2023-10-01', value: 3.89, change: 0.32, changePercent: 8.97 },
      { date: '2023-11-01', value: 3.42, change: -0.47, changePercent: -12.08 },
      { date: '2023-12-01', value: 3.15, change: -0.27, changePercent: -7.89 },
    ]
  },
  
  // Employment
  {
    id: '5',
    name: 'Taxa de Desemprego',
    code: 'UNEMPLOYMENT',
    value: 8.2,
    previousValue: 8.5,
    change: -0.3,
    changePercent: -3.53,
    unit: '%',
    frequency: 'monthly',
    lastUpdate: '2024-01-18T10:00:00Z',
    category: 'employment',
    description: 'Taxa de desocupação no trimestre',
    source: 'IBGE',
    historicalData: [
      { date: '2023-09-01', value: 9.1, change: -0.2, changePercent: -2.15 },
      { date: '2023-10-01', value: 8.8, change: -0.3, changePercent: -3.30 },
      { date: '2023-11-01', value: 8.5, change: -0.3, changePercent: -3.41 },
      { date: '2023-12-01', value: 8.2, change: -0.3, changePercent: -3.53 },
    ]
  },
  
  // GDP
  {
    id: '6',
    name: 'PIB',
    code: 'GDP',
    value: 2.9,
    previousValue: 3.2,
    change: -0.3,
    changePercent: -9.38,
    unit: '% a.a.',
    frequency: 'quarterly',
    lastUpdate: '2024-01-05T11:00:00Z',
    category: 'gdp',
    description: 'Produto Interno Bruto - variação anual',
    source: 'IBGE',
    historicalData: [
      { date: '2023-Q1', value: 4.2, change: 0.5, changePercent: 13.51 },
      { date: '2023-Q2', value: 3.8, change: -0.4, changePercent: -9.52 },
      { date: '2023-Q3', value: 3.2, change: -0.6, changePercent: -15.79 },
      { date: '2023-Q4', value: 2.9, change: -0.3, changePercent: -9.38 },
    ]
  },
  
  // Currency
  {
    id: '7',
    name: 'USD/BRL',
    code: 'USDBRL',
    value: 4.95,
    previousValue: 5.02,
    change: -0.07,
    changePercent: -1.39,
    unit: 'BRL',
    frequency: 'daily',
    lastUpdate: '2024-01-20T17:30:00Z',
    category: 'currency',
    description: 'Cotação do Dólar Americano em Reais',
    source: 'Banco Central do Brasil',
    historicalData: [
      { date: '2024-01-15', value: 5.08, change: 0.03, changePercent: 0.59 },
      { date: '2024-01-16', value: 5.05, change: -0.03, changePercent: -0.59 },
      { date: '2024-01-17', value: 5.02, change: -0.03, changePercent: -0.59 },
      { date: '2024-01-18', value: 4.95, change: -0.07, changePercent: -1.39 },
    ]
  },
  
  // Stock Indices
  {
    id: '8',
    name: 'Ibovespa',
    code: 'IBOV',
    value: 125420,
    previousValue: 123890,
    change: 1530,
    changePercent: 1.23,
    unit: 'pontos',
    frequency: 'daily',
    lastUpdate: '2024-01-20T18:00:00Z',
    category: 'stock_indices',
    description: 'Índice Bovespa',
    source: 'B3',
    historicalData: [
      { date: '2024-01-15', value: 122340, change: -850, changePercent: -0.69 },
      { date: '2024-01-16', value: 123190, change: 850, changePercent: 0.69 },
      { date: '2024-01-17', value: 123890, change: 700, changePercent: 0.57 },
      { date: '2024-01-18', value: 125420, change: 1530, changePercent: 1.23 },
    ]
  }
];

export const mockIndicatorGroups: IndicatorGroup[] = [
  {
    category: 'interest_rates',
    title: 'Taxas de Juros',
    description: 'Principais taxas de juros da economia',
    indicators: mockEconomicIndicators.filter(i => i.category === 'interest_rates')
  },
  {
    category: 'inflation',
    title: 'Inflação',
    description: 'Índices de inflação e preços',
    indicators: mockEconomicIndicators.filter(i => i.category === 'inflation')
  },
  {
    category: 'employment',
    title: 'Emprego',
    description: 'Indicadores do mercado de trabalho',
    indicators: mockEconomicIndicators.filter(i => i.category === 'employment')
  },
  {
    category: 'gdp',
    title: 'PIB',
    description: 'Produto Interno Bruto e crescimento econômico',
    indicators: mockEconomicIndicators.filter(i => i.category === 'gdp')
  },
  {
    category: 'currency',
    title: 'Câmbio',
    description: 'Cotações de moedas estrangeiras',
    indicators: mockEconomicIndicators.filter(i => i.category === 'currency')
  },
  {
    category: 'stock_indices',
    title: 'Índices Acionários',
    description: 'Principais índices do mercado de ações',
    indicators: mockEconomicIndicators.filter(i => i.category === 'stock_indices')
  }
];

export const mockMarketSentiment: MarketSentiment = {
  overall: 'neutral',
  score: 15,
  factors: {
    interestRates: -10, // Negative due to high rates
    inflation: 5,       // Slightly positive due to cooling inflation
    employment: 20,     // Positive due to decreasing unemployment
    gdpGrowth: 10,      // Moderately positive growth
    marketVolatility: -10 // Negative due to market uncertainty
  },
  lastUpdate: '2024-01-20T18:00:00Z'
};

// Mock API functions
export const getEconomicIndicatorsMock = async (filter?: IndicatorFilter): Promise<EconomicIndicator[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let filteredIndicators = [...mockEconomicIndicators];
  
  if (filter?.category) {
    filteredIndicators = filteredIndicators.filter(indicator => 
      indicator.category === filter.category
    );
  }
  
  if (filter?.frequency) {
    filteredIndicators = filteredIndicators.filter(indicator => 
      indicator.frequency === filter.frequency
    );
  }
  
  // Apply sorting
  if (filter?.sortBy) {
    filteredIndicators.sort((a, b) => {
      let aValue: any = a[filter.sortBy as keyof EconomicIndicator];
      let bValue: any = b[filter.sortBy as keyof EconomicIndicator];
      
      if (filter.sortBy === 'lastUpdate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (filter.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
  }
  
  return filteredIndicators;
};

export const getIndicatorGroupsMock = async (): Promise<IndicatorGroup[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockIndicatorGroups;
};

export const getMarketSentimentMock = async (): Promise<MarketSentiment> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockMarketSentiment;
};

export const getIndicatorByIdMock = async (id: string): Promise<EconomicIndicator | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockEconomicIndicators.find(indicator => indicator.id === id) || null;
};

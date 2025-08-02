/**
 * Sistema centralizado de mock data que substitui dados espalhados pelo projeto
 * Elimina inconsistências entre mokado/, lib/mock-data.ts e inline mocks
 */

export interface MockUser {
  id: number;
  nome: string;
  email: string;
  plano: "free" | "premium";
}

export interface MockEntrada {
  id: number;
  descricao: string;
  valor_mensal: number;
  categoria: string;
  mes: number;
  ano: number;
  created_at?: string;
}

export interface MockCusto {
  id: number;
  descricao: string;
  valor_mensal: number;
  categoria: string;
  flag: boolean;
  mes: number;
  ano: number;
  created_at?: string;
}

export interface MockDivida {
  id: number;
  descricao: string;
  valor_mensal: number;
  valor_hoje: number;
  divida_total: number;
  quantidade_parcelas: number;
  taxa_juros: number;
  juros_mensais: number;
  categoria: string;
  mes: number;
  ano: number;
}

export interface MockMeta {
  id: number;
  titulo: string;
  descricao: string;
  valorAlvo: number;
  valorAtual: number;
  prazo: string;
  categoria: string;
  status: "ativa" | "pausada" | "concluida";
}

export interface MockInvestimento {
  id: number;
  codigo: string;
  tipo: string;
  quantidade: number;
  precoMedio: number;
  valorTotal: number;
  dataCompra: string;
  corretora: string;
}

export interface MockAssetData {
  ticker: string;
  preco: number;
  variacao: number;
  marketCap: string;
  setor: string;
  volume?: string;
}

export interface MockEconomicIndicator {
  id: string;
  name: string;
  code: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  unit: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  lastUpdate: string;
  category:
    | "interest_rates"
    | "inflation"
    | "employment"
    | "gdp"
    | "currency"
    | "stock_indices";
  description: string;
  source: string;
}

export interface MockCryptocurrency {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume24h: number;
  rank: number;
}

export interface MockWishlistItem {
  id: string;
  userId: number;
  symbol: string;
  assetName: string;
  targetPrice: number;
  currentPrice: number;
  assetType: "stock" | "fii" | "crypto";
  priceAlert: boolean;
  observations?: string;
  addedDate: string;
}

export interface MockFinancialCalculation {
  id: string;
  type:
    | "compound_interest"
    | "financing"
    | "investment_goal"
    | "financial_independence";
  inputs: Record<string, any>;
  results: Record<string, any>;
  createdAt: string;
}

export interface MockInfluencer {
  id: string;
  name: string;
  expertise: string;
  avatar: string;
  imageUrl: string;
  youtube?: string;
  tiktok?: string;
  instagram?: string;
  description: string;
  followers: string;
}

// Base de dados mock centralizada
export class MockDatabase {
  private static instance: MockDatabase;
  private data: {
    users: MockUser[];
    entradas: MockEntrada[];
    custos: MockCusto[];
    dividas: MockDivida[];
    metas: MockMeta[];
    investimentos: MockInvestimento[];
    marketData: MockAssetData[];
    economicIndicators: MockEconomicIndicator[];
    cryptocurrencies: MockCryptocurrency[];
    wishlistItems: MockWishlistItem[];
    financialCalculations: MockFinancialCalculation[];
    influencers: MockInfluencer[];
  };

  private constructor() {
    this.data = this.initializeData();
  }

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  private initializeData() {
    return {
      users: [
        {
          id: 1,
          nome: "João Silva",
          email: "joao@email.com",
          plano: "premium" as const,
        },
      ],

      entradas: [
        {
          id: 1,
          descricao: "Salário CLT",
          valor_mensal: 5000,
          categoria: "Salário",
          mes: 12,
          ano: 2024,
          created_at: "2024-01-15T10:00:00Z",
        },
        {
          id: 2,
          descricao: "Freelance",
          valor_mensal: 1500,
          categoria: "Freelance",
          mes: 12,
          ano: 2024,
          created_at: "2024-01-20T14:30:00Z",
        },
        {
          id: 3,
          descricao: "Dividendos FII",
          valor_mensal: 800,
          categoria: "Outros",
          mes: 12,
          ano: 2024,
          created_at: "2024-01-25T09:15:00Z",
        },
      ],

      custos: [
        {
          id: 1,
          descricao: "Aluguel",
          valor_mensal: 1200,
          categoria: "Custo fixo",
          flag: true,
          mes: 12,
          ano: 2024,
          created_at: "2024-01-15T10:00:00Z",
        },
        {
          id: 2,
          descricao: "Supermercado",
          valor_mensal: 600,
          categoria: "Conforto",
          flag: false,
          mes: 12,
          ano: 2024,
          created_at: "2024-01-16T11:30:00Z",
        },
        {
          id: 3,
          descricao: "Academia",
          valor_mensal: 100,
          categoria: "Conforto",
          flag: true,
          mes: 12,
          ano: 2024,
          created_at: "2024-01-17T15:45:00Z",
        },
        {
          id: 4,
          descricao: "Curso Online",
          valor_mensal: 200,
          categoria: "Conhecimento",
          flag: true,
          mes: 12,
          ano: 2024,
          created_at: "2024-01-18T09:20:00Z",
        },
      ],

      dividas: [
        {
          id: 1,
          descricao: "Cartão de Crédito Nubank",
          valor_mensal: 450,
          valor_hoje: 4500,
          divida_total: 4500,
          quantidade_parcelas: 10,
          taxa_juros: 15.5,
          juros_mensais: 58.13,
          categoria: "CartaoDeCredito",
          mes: 12,
          ano: 2024,
        },
        {
          id: 2,
          descricao: "Financiamento Carro",
          valor_mensal: 800,
          valor_hoje: 25000,
          divida_total: 28000,
          quantidade_parcelas: 36,
          taxa_juros: 12.5,
          juros_mensais: 260.42,
          categoria: "Financiamento",
          mes: 12,
          ano: 2024,
        },
      ],

      metas: [
        {
          id: 1,
          titulo: "Reserva de Emergência",
          descricao: "Economizar 6 meses de despesas",
          valorAlvo: 18000,
          valorAtual: 12500,
          prazo: "2024-12-31",
          categoria: "Emergência",
          status: "ativa",
        },
        {
          id: 2,
          titulo: "Viagem para Europa",
          descricao: "Juntar dinheiro para viagem de férias",
          valorAlvo: 8000,
          valorAtual: 3200,
          prazo: "2024-06-30",
          categoria: "Lazer",
          status: "ativa",
        },
        {
          id: 3,
          titulo: "Curso de Especialização",
          descricao: "MBA em Finanças",
          valorAlvo: 15000,
          valorAtual: 15000,
          prazo: "2024-01-31",
          categoria: "Educação",
          status: "concluida",
        },
      ],

      investimentos: [
        {
          id: 1,
          codigo: "HGLG11",
          tipo: "FII",
          quantidade: 100,
          precoMedio: 125.5,
          valorTotal: 12550,
          dataCompra: "2024-01-15",
          corretora: "XP Investimentos",
        },
        {
          id: 2,
          codigo: "VALE3",
          tipo: "Ação",
          quantidade: 50,
          precoMedio: 68.2,
          valorTotal: 3410,
          dataCompra: "2024-02-10",
          corretora: "Rico",
        },
        {
          id: 3,
          codigo: "BTOW3",
          tipo: "Ação",
          quantidade: 200,
          precoMedio: 15.8,
          valorTotal: 3160,
          dataCompra: "2024-03-05",
          corretora: "Clear",
        },
      ],

      marketData: [
        {
          ticker: "HGLG11",
          preco: 123.45,
          variacao: 1.2,
          marketCap: "2.1B",
          setor: "Logística",
          volume: "1.2M",
        },
        {
          ticker: "KNRI11",
          preco: 110.22,
          variacao: -0.5,
          marketCap: "3.2B",
          setor: "Corporativo",
          volume: "856K",
        },
        {
          ticker: "MXRF11",
          preco: 10.01,
          variacao: 0.8,
          marketCap: "4.1B",
          setor: "Híbrido",
          volume: "2.1M",
        },
        {
          ticker: "VALE3",
          preco: 72.45,
          variacao: 2.8,
          marketCap: "350B",
          setor: "Mineração",
          volume: "50M",
        },
        {
          ticker: "PETR4",
          preco: 38.92,
          variacao: -1.2,
          marketCap: "300B",
          setor: "Petróleo",
          volume: "80M",
        },
      ],

      economicIndicators: [
        {
          id: "1",
          name: "Taxa Selic",
          code: "SELIC",
          value: 11.75,
          previousValue: 12.25,
          change: -0.5,
          changePercent: -4.08,
          unit: "% a.a.",
          frequency: "monthly",
          lastUpdate: "2024-01-17T14:00:00Z",
          category: "interest_rates",
          description: "Taxa básica de juros da economia brasileira",
          source: "Banco Central do Brasil",
        },
        {
          id: "2",
          name: "IPCA",
          code: "IPCA",
          value: 4.62,
          previousValue: 4.68,
          change: -0.06,
          changePercent: -1.28,
          unit: "% a.a.",
          frequency: "monthly",
          lastUpdate: "2024-01-10T09:00:00Z",
          category: "inflation",
          description: "Índice Nacional de Preços ao Consumidor Amplo",
          source: "IBGE",
        },
        {
          id: "3",
          name: "USD/BRL",
          code: "USDBRL",
          value: 4.95,
          previousValue: 5.02,
          change: -0.07,
          changePercent: -1.39,
          unit: "BRL",
          frequency: "daily",
          lastUpdate: "2024-01-20T17:30:00Z",
          category: "currency",
          description: "Cotação do Dólar Americano em Reais",
          source: "Banco Central do Brasil",
        },
        {
          id: "4",
          name: "Ibovespa",
          code: "IBOV",
          value: 125420,
          previousValue: 123890,
          change: 1530,
          changePercent: 1.23,
          unit: "pontos",
          frequency: "daily",
          lastUpdate: "2024-01-20T18:00:00Z",
          category: "stock_indices",
          description: "Índice Bovespa",
          source: "B3",
        },
      ],

      cryptocurrencies: [
        {
          id: "bitcoin",
          symbol: "BTC",
          name: "Bitcoin",
          price: 42350.75,
          change24h: 850.25,
          changePercent24h: 2.05,
          marketCap: 831234567890,
          volume24h: 15432109876,
          rank: 1,
        },
        {
          id: "ethereum",
          symbol: "ETH",
          name: "Ethereum",
          price: 2589.45,
          change24h: -45.23,
          changePercent24h: -1.72,
          marketCap: 311234567890,
          volume24h: 8765432109,
          rank: 2,
        },
        {
          id: "cardano",
          symbol: "ADA",
          name: "Cardano",
          price: 0.48,
          change24h: 0.03,
          changePercent24h: 6.67,
          marketCap: 17234567890,
          volume24h: 432109876,
          rank: 8,
        },
      ],

      wishlistItems: [
        {
          id: "1",
          userId: 1,
          symbol: "PETR4",
          assetName: "Petrobras",
          targetPrice: 35.0,
          currentPrice: 38.92,
          assetType: "stock",
          priceAlert: true,
          observations: "Aguardando queda para comprar mais",
          addedDate: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          userId: 1,
          symbol: "HGLG11",
          assetName: "Cshg Logística",
          targetPrice: 120.0,
          currentPrice: 123.45,
          assetType: "fii",
          priceAlert: false,
          observations: "FII de logística com bons dividendos",
          addedDate: "2024-01-18T14:30:00Z",
        },
        {
          id: "3",
          userId: 1,
          symbol: "BTC",
          assetName: "Bitcoin",
          targetPrice: 40000.0,
          currentPrice: 42350.75,
          assetType: "crypto",
          priceAlert: true,
          addedDate: "2024-01-20T09:15:00Z",
        },
      ],

      financialCalculations: [
        {
          id: "1",
          type: "compound_interest",
          inputs: {
            initialAmount: 10000,
            monthlyDeposit: 500,
            annualRate: 12,
            years: 10,
          },
          results: {
            finalAmount: 145678.92,
            totalInvested: 70000,
            totalInterest: 75678.92,
            monthlyEvolution: [], // Array with month-by-month data
          },
          createdAt: "2024-01-20T16:00:00Z",
        },
      ],

      influencers: [
        {
          id: "1",
          name: "Carlos Investidor",
          expertise: "Análise Técnica",
          avatar: "CI",
          imageUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          youtube: "https://youtube.com/@carlosinvestidor",
          tiktok: "https://tiktok.com/@carlosinvest",
          instagram: "https://instagram.com/carlosinvestidor",
          description:
            "Especialista em análise técnica com foco em day trade e swing trade",
          followers: "120k",
        },
        {
          id: "2",
          name: "Ana Market",
          expertise: "Fundos Imobiliários",
          avatar: "AM",
          imageUrl:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          youtube: "https://youtube.com/@anamarket",
          tiktok: "https://tiktok.com/@anamarket",
          instagram: "https://instagram.com/anamarket",
          description: "Focada em FIIs e estratégias de renda passiva",
          followers: "85k",
        },
        {
          id: "3",
          name: "Pedro Cripto",
          expertise: "Criptomoedas",
          avatar: "PC",
          imageUrl:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          youtube: "https://youtube.com/@pedrocripto",
          tiktok: "https://tiktok.com/@pedrocripto",
          instagram: "https://instagram.com/pedrocripto",
          description:
            "Análise de criptomoedas, DeFi e mercado descentralizado",
          followers: "95k",
        },
        {
          id: "4",
          name: "Marina Stocks",
          expertise: "Ações Americanas",
          avatar: "MS",
          imageUrl:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
          youtube: "https://youtube.com/@marinastocks",
          tiktok: "https://tiktok.com/@marinastocks",
          instagram: "https://instagram.com/marinastocks",
          description:
            "Especialista em mercado americano e ações de tecnologia",
          followers: "110k",
        },
      ],
    };
  }

  // Métodos para simular operações de API
  private delay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  // Budget APIs
  async getEntradas(mes: string, ano: string): Promise<MockEntrada[]> {
    await this.delay();
    return this.data.entradas.filter(
      (item) => item.mes === parseInt(mes) && item.ano === parseInt(ano),
    );
  }

  async createEntrada(
    data: Omit<MockEntrada, "id" | "created_at">,
  ): Promise<MockEntrada> {
    await this.delay();
    const newEntrada: MockEntrada = {
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString(),
    };
    this.data.entradas.push(newEntrada);
    return newEntrada;
  }

  async deleteEntrada(id: number): Promise<void> {
    await this.delay();
    this.data.entradas = this.data.entradas.filter((item) => item.id !== id);
  }

  async getCustos(
    categoria: string,
    mes: string,
    ano: string,
  ): Promise<MockCusto[]> {
    await this.delay();
    return this.data.custos.filter(
      (item) =>
        (categoria === "Todos" || item.categoria === categoria) &&
        item.mes === parseInt(mes) &&
        item.ano === parseInt(ano),
    );
  }

  async createCusto(
    data: Omit<MockCusto, "id" | "created_at">,
  ): Promise<MockCusto> {
    await this.delay();
    const newCusto: MockCusto = {
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString(),
    };
    this.data.custos.push(newCusto);
    return newCusto;
  }

  async updateCustoFlag(id: number, flag: boolean): Promise<void> {
    await this.delay();
    const custo = this.data.custos.find((item) => item.id === id);
    if (custo) {
      custo.flag = flag;
    }
  }

  async deleteCusto(id: number): Promise<void> {
    await this.delay();
    this.data.custos = this.data.custos.filter((item) => item.id !== id);
  }

  // Investment APIs
  async getInvestimentos(): Promise<MockInvestimento[]> {
    await this.delay();
    return this.data.investimentos;
  }

  async createInvestimento(
    data: Omit<MockInvestimento, "id">,
  ): Promise<MockInvestimento> {
    await this.delay();
    const newInvestimento: MockInvestimento = {
      ...data,
      id: this.generateId(),
    };
    this.data.investimentos.push(newInvestimento);
    return newInvestimento;
  }

  // Market APIs
  async getMarketData(): Promise<MockAssetData[]> {
    await this.delay();
    return this.data.marketData;
  }

  // Economic Indicators APIs
  async getEconomicIndicators(
    category?: string,
  ): Promise<MockEconomicIndicator[]> {
    await this.delay();
    if (category && category !== "all") {
      return this.data.economicIndicators.filter(
        (indicator) => indicator.category === category,
      );
    }
    return this.data.economicIndicators;
  }

  async getEconomicIndicatorById(
    id: string,
  ): Promise<MockEconomicIndicator | null> {
    await this.delay();
    return (
      this.data.economicIndicators.find((indicator) => indicator.id === id) ||
      null
    );
  }

  // Cryptocurrency APIs
  async getCryptocurrencies(
    sortBy: string = "rank",
  ): Promise<MockCryptocurrency[]> {
    await this.delay();
    const sorted = [...this.data.cryptocurrencies];
    if (sortBy === "rank") {
      sorted.sort((a, b) => a.rank - b.rank);
    } else if (sortBy === "price") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === "change24h") {
      sorted.sort((a, b) => b.changePercent24h - a.changePercent24h);
    }
    return sorted;
  }

  // Wishlist APIs
  async getWishlistItems(userId: number): Promise<MockWishlistItem[]> {
    await this.delay();
    return this.data.wishlistItems.filter((item) => item.userId === userId);
  }

  async createWishlistItem(
    data: Omit<MockWishlistItem, "id" | "addedDate">,
  ): Promise<MockWishlistItem> {
    await this.delay();
    const newItem: MockWishlistItem = {
      ...data,
      id: this.generateId().toString(),
      addedDate: new Date().toISOString(),
    };
    this.data.wishlistItems.push(newItem);
    return newItem;
  }

  async deleteWishlistItem(id: string): Promise<void> {
    await this.delay();
    this.data.wishlistItems = this.data.wishlistItems.filter(
      (item) => item.id !== id,
    );
  }

  async updateWishlistItem(
    id: string,
    updates: Partial<MockWishlistItem>,
  ): Promise<MockWishlistItem | null> {
    await this.delay();
    const item = this.data.wishlistItems.find((item) => item.id === id);
    if (item) {
      Object.assign(item, updates);
      return item;
    }
    return null;
  }

  // Financial Calculator APIs
  async saveCalculation(
    data: Omit<MockFinancialCalculation, "id" | "createdAt">,
  ): Promise<MockFinancialCalculation> {
    await this.delay();
    const newCalculation: MockFinancialCalculation = {
      ...data,
      id: this.generateId().toString(),
      createdAt: new Date().toISOString(),
    };
    this.data.financialCalculations.push(newCalculation);
    return newCalculation;
  }

  async getCalculationHistory(
    type?: string,
  ): Promise<MockFinancialCalculation[]> {
    await this.delay();
    if (type) {
      return this.data.financialCalculations.filter(
        (calc) => calc.type === type,
      );
    }
    return this.data.financialCalculations;
  }

  // Influencer APIs
  async getInfluencers(): Promise<MockInfluencer[]> {
    await this.delay();
    return this.data.influencers;
  }

  async createInfluencer(
    data: Omit<MockInfluencer, "id">,
  ): Promise<MockInfluencer> {
    await this.delay();
    const newInfluencer: MockInfluencer = {
      ...data,
      id: this.generateId().toString(),
    };
    this.data.influencers.push(newInfluencer);
    return newInfluencer;
  }

  async updateInfluencer(
    id: string,
    updates: Partial<MockInfluencer>,
  ): Promise<MockInfluencer | null> {
    await this.delay();
    const influencer = this.data.influencers.find((inf) => inf.id === id);
    if (influencer) {
      Object.assign(influencer, updates);
      return influencer;
    }
    return null;
  }

  async deleteInfluencer(id: string): Promise<void> {
    await this.delay();
    this.data.influencers = this.data.influencers.filter(
      (inf) => inf.id !== id,
    );
  }

  // Utilities
  reset(): void {
    this.data = this.initializeData();
  }

  export(): string {
    return JSON.stringify(this.data, null, 2);
  }

  import(jsonData: string): void {
    try {
      this.data = JSON.parse(jsonData);
    } catch (error) {
      console.error("Failed to import mock data:", error);
    }
  }
}

// Singleton instance
export const mockDb = MockDatabase.getInstance();

export default mockDb;

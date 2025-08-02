# Arquitetura do Projeto - Organizesee

## 📁 Estrutura de Pastas Organizada

O projeto foi reorganizado seguindo as melhores práticas de design patterns e arquitetura de software, com separação clara de responsabilidades:

```
client/
├── src/                              # Código fonte organizado
│   ├── entities/                     # Modelos de entidades
│   │   ├── FinancialCalculator.ts    # Entidades da calculadora financeira
│   │   ├── Wishlist.ts              # Entidades da lista de desejos
│   │   ├── EconomicIndicators.ts    # Entidades dos indicadores econômicos
│   │   ├── Budget.ts                # Entidades de orçamento
│   │   └── Investment.ts            # Entidades de investimentos
│   │
│   ├── services/                     # Camada de serviços
│   │   └── api/                     # Serviços de API
│   │       ├── examples/            # Dados mockados por entidade
│   │       │   ├── financialCalculatorExamples.ts
│   │       │   ├── wishlistExamples.ts
│   │       │   └── economicIndicatorsExamples.ts
│   │       ├── financialCalculatorApi.ts
│   │       ├── wishlistApi.ts
│   │       └── economicIndicatorsApi.ts
│   │
│   ├── utils/                       # Utilitários compartilhados
│   ├── hooks/                       # Custom hooks
│   └── contexts/                    # Contextos React
│
├── pages/                           # Páginas organizadas por domínio
│   ├── PagesAuth/                   # Páginas de autenticação
│   │   ├── TwoFactorEmailSetup.tsx
│   │   └── TwoFactorSMSSetup.tsx
│   │
│   ├── HomePublicPages/             # Páginas públicas
│   │   ├── Index.tsx
│   │   ├── Home.tsx
│   │   └── Demo.tsx
│   │
│   ├── DadosPessoais/              # Configurações pessoais
│   │   └── Configuracoes.tsx
│   │
��   └── Sistema/                     # Sistema principal
│       ├── Cripto/                 # Módulo de criptomoedas
│       │   ├── DashboardCripto.tsx
│       │   └── MercadoCripto.tsx
│       │
│       ├── budget/                 # Módulo de orçamento
│       ├── investment/             # Módulo de investimentos
│       └── market/                 # Módulo de mercado
│           ├── CalculadoraFinanceira.tsx
│           ├── ListaDeDesejo.tsx
│           └── IndicadoresEconomicos.tsx
│
├── components/                      # Componentes organizados
│   ├── ui/                         # Componentes base (shadcn/ui)
│   ├── features/                   # Componentes específicos por feature
│   └── SubscriptionGuard.tsx       # Componente de proteção premium
│
└── hooks/                          # Hooks customizados
    └── useProfileVerification.ts   # Hook de verificação de perfil
```

## 🏗️ Design Patterns Implementados

### 1. **Entity-Service Pattern**
- **Entities**: Definem a estrutura de dados e tipos TypeScript
- **Services**: Gerenciam a comunicação com APIs e lógica de negócio
- **Examples**: Dados mockados organizados por entidade

### 2. **Repository Pattern**
- Cada serviço de API implementa métodos CRUD específicos
- Fallback automático para dados mockados quando API não está disponível
- Interface consistente entre diferentes fontes de dados

### 3. **Factory Pattern**
- Classes de serviço com métodos estáticos
- Instanciação automática baseada em configuração
- Exemplo: `FinancialCalculatorApiService.calculateCompoundInterest()`

### 4. **Strategy Pattern**
- Diferentes estratégias para dados (API real vs mock)
- Configuração via variáveis de ambiente
- Fallback gracioso em caso de falha

## 📊 Entidades Principais

### **FinancialCalculator**
```typescript
interface CompoundInterestInput {
  principal: number;
  rate: number;
  time: number;
  contribution: number;
  frequency: 'monthly' | 'yearly';
}

interface CompoundInterestResult {
  futureValue: number;
  totalContributions: number;
  earnings: number;
  percentageGain: number;
  monthlyData: MonthlyData[];
}
```

### **Wishlist**
```typescript
interface WishlistItem {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'fii' | 'crypto' | 'bond';
  currentPrice: number;
  targetPrice: number;
  priceAlert: boolean;
  priceHistory: PricePoint[];
}
```

### **EconomicIndicators**
```typescript
interface EconomicIndicator {
  id: string;
  name: string;
  code: string;
  value: number;
  change: number;
  changePercent: number;
  category: IndicatorCategory;
  historicalData: IndicatorDataPoint[];
}
```

## 🔧 Serviços de API

### **Estrutura Padrão dos Serviços**
```typescript
export class ExampleApiService {
  static async getData(filter?: Filter): Promise<Data[]> {
    if (USE_MOCK_DATA) {
      return getMockData(filter);
    }
    
    try {
      return await apiCall<Data[]>(ENDPOINTS.DATA, options);
    } catch (error) {
      console.warn('API call failed, falling back to mock data:', error);
      return getMockData(filter);
    }
  }
}
```

### **Configuração de Ambiente**
```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK_DATA=false
VITE_API_KEY=your_api_key
```

## 🎨 Layout Aprimorado

### **Calculadora Financeira - Layout Linear**
1. **Formulário de entrada**: Disposição horizontal em linha
2. **Resultados principais**: Cards destacados com métricas-chave
3. **Evolução detalhada**: Tabela mês a mês abaixo dos resultados

### **Lista de Desejos - Organizada**
1. **Estatísticas no topo**: Cards com métricas da wishlist
2. **Filtros e busca**: Controles organizados e intuitivos
3. **Tabela responsiva**: Com ações inline e alertas visuais

### **Indicadores Econômicos - Por Categoria**
1. **Sentimento do mercado**: Dashboard resumido no topo
2. **Visualização por abas**: Visão geral vs. Por categoria
3. **Filtros avançados**: Busca, categoria, ordenação

## 🚀 Funcionalidades Implementadas

### **Sistema de Subscriptions**
- Verificação de perfil de usuário (Free/Premium/Enterprise)
- Proteção de features premium com `SubscriptionGuard`
- Limites por tipo de assinatura

### **Sistema 2FA Completo**
- Setup por email com códigos de 6 dígitos
- Setup por SMS com formatação brasileira
- Integração com recuperação de senha

### **Dados Mockados Realísticos**
- Simulação de latência de API
- Dados brasileiros (moeda, formatação, setores)
- Cálculos matemáticos corretos

## 📈 Melhorias de Performance

### **Loading States**
- Indicadores visuais durante carregamento
- Skeleton screens para melhor UX
- Estados de erro bem definidos

### **Otimizações**
- Lazy loading de componentes pesados
- Memoização de cálculos complexos
- Debounce em filtros e busca

## 🔒 Segurança

### **Autenticação**
- Tokens JWT armazenados de forma segura
- Headers de autorização automáticos
- Logout automático em caso de token inválido

### **Validação**
- Validação de entrada em todos os formul��rios
- Sanitização de dados antes do envio
- Tratamento de erros da API

## 🧪 Testabilidade

### **Estrutura Testável**
- Separação clara de lógica e apresentação
- Mocks organizados por entidade
- Interfaces bem definidas para facilitar testes

### **Dados de Teste**
- Exemplos realísticos em cada serviço
- Cenários de erro simulados
- Estados de loading e vazio

## 📱 Responsividade

### **Design Mobile-First**
- Layouts que se adaptam a diferentes telas
- Navegação otimizada para mobile
- Tabelas com scroll horizontal quando necessário

### **Componentes Adaptativos**
- Grid system responsivo
- Cards que se reorganizam
- Formulários que se empilham em telas menores

Esta arquitetura garante:
- ✅ **Manutenibilidade**: Código organizado e fácil de entender
- ✅ **Escalabilidade**: Estrutura que cresce com o projeto
- ✅ **Testabilidade**: Fácil de testar e debugar
- ✅ **Performance**: Otimizado para velocidade
- ✅ **Developer Experience**: Fácil de desenvolver e modificar

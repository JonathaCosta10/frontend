# Documentação: Implementação de Novas APIs e Páginas no Projeto Organizesee

## Introdução

Este documento fornece um guia detalhado para implementar novas APIs e páginas no projeto Organizesee, garantindo a consistência com a arquitetura existente e o funcionamento correto do sistema de autenticação.

## Arquitetura Atual

O projeto segue uma arquitetura que separa claramente:

1. **Serviços API** (`client/services/api/`)
2. **Componentes React** (`client/pages/sistema/dashboard/`)
3. **Contextos** (`client/contexts/`)
4. **Autenticação** (JWT via `localStorageManager`)

## Fluxo Completo de Implementação

### 1. Definir Rotas da API

Edite o arquivo `client/contexts/Rotas.ts` para adicionar novos endpoints:

```typescript
export const routesMap = {
  // Rotas existentes
  login: "/api/auth/token/",
  refreshToken: "/api/auth/token/refresh/",
  
  // Novas rotas
  investimentos: "/api/investimentos/",
  investimentoDetalhes: (id: string) => `/api/investimentos/${id}/`,
  investimentoRendimentos: "/api/investimentos/rendimentos/",
};

export function getRoute(chave: string): string {
  // Verificar se a chave é uma função (rota parametrizada)
  const route = routesMap[chave];
  if (typeof route === "function") {
    throw new Error("Rota parametrizada requer argumentos");
  }
  return route;
}
```

### 2. Configurar Headers da API

Edite o arquivo `client/contexts/Headers.ts` para adicionar headers específicos:

```typescript
import { localStorageManager } from "@/lib/localStorage";

export interface HeaderModel {
  [key: string]: string;
}

export function getHeaders(chave: string, withAuth = false): HeaderModel {
  // Headers padrão para todas as chamadas
  const headers: HeaderModel = {
    "Accept": "application/json",
    "X-API-Key": import.meta.env.VITE_API_KEY || "organizesee-api-key-2025-secure",
  };

  // Se requer autenticação, adicionar token
  if (withAuth) {
    const token = localStorageManager.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  // Headers específicos por endpoint
  if (chave.includes("investimentos")) {
    headers["X-Module"] = "investments"; 
  }

  return headers;
}
```

### 3. Configurar Regras de Negócio

Edite o arquivo `client/contexts/Rules.ts` para incluir o serviço na lógica de regras:

```typescript
// Adicionar à lista de mapeamento de serviços
private getServiceFile(chave: string): string {
  const serviceMap: Record<string, string> = {
    // Serviços existentes
    login: "Login",
    dashboard: "Dashboard",
    
    // Novo serviço
    investimentos: "Investments",
    investimentoDetalhes: "Investments",
    investimentoRendimentos: "Investments",
    
    // Default
    default: "Generic",
  };

  return serviceMap[chave] || "Generic";
}

// Adicionar à lista de funções de conveniência
export const getInvestimentos = async (chave: string = "investimentos"): Promise<any> => {
  const response = await rulesInstance.get({
    chave,
    withAuth: true,
  });

  return response.success ? response.data : null;
};
```

### 4. Criar o Serviço API

Crie um novo arquivo em `client/services/api/investments.ts`:

```typescript
import { api } from "@/lib/api";
import { isDevelopment } from "@/config/development";

// Tipagem para os dados
export interface InvestimentoItem {
  id: string;
  nome: string;
  tipo: string;
  valor: number;
  data_inicio: string;
  rendimento_mensal: number;
}

export interface InvestimentosResponse {
  investimentos: InvestimentoItem[];
  total_investido: number;
  rendimento_total: number;
}

// Mock data para desenvolvimento
const mockInvestimentos: InvestimentosResponse = {
  investimentos: [
    {
      id: "1",
      nome: "Tesouro Direto",
      tipo: "Renda Fixa",
      valor: 5000,
      data_inicio: "2023-05-15",
      rendimento_mensal: 0.8
    },
    {
      id: "2",
      nome: "Fundo Imobiliário XYZ",
      tipo: "FII",
      valor: 8000,
      data_inicio: "2023-02-10",
      rendimento_mensal: 0.6
    }
  ],
  total_investido: 13000,
  rendimento_total: 650
};

/**
 * Serviço de API para Investimentos
 */
class InvestmentsApiService {
  /**
   * Busca todos os investimentos
   * @returns {Promise} Promise com os dados dos investimentos
   */
  async getInvestimentos() {
    try {
      console.log("🔄 investmentsApi - Iniciando chamada getInvestimentos...");
      const response = await api.get("/api/investimentos/", true);
      console.log("✅ Resposta Investimentos recebida:", response);
      return response;
    } catch (error) {
      console.error("❌ investmentsApi - Erro ao buscar investimentos:", error);
      
      // Use mock data only in development
      if (isDevelopment) {
        console.log("⚠️ Usando dados mock para investimentos (desenvolvimento)");
        return mockInvestimentos;
      }
      
      throw error;
    }
  }

  /**
   * Busca detalhes de um investimento específico
   * @param {string} id - ID do investimento
   * @returns {Promise} Promise com os dados do investimento
   */
  async getInvestimentoDetalhes(id: string) {
    try {
      const response = await api.get(`/api/investimentos/${id}/`, true);
      return response;
    } catch (error) {
      console.error(`❌ Erro ao buscar detalhes do investimento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo investimento
   * @param {Object} dados - Dados do investimento a ser criado
   * @returns {Promise} Promise com os dados do investimento criado
   */
  async criarInvestimento(dados: Omit<InvestimentoItem, 'id'>) {
    try {
      const response = await api.post("/api/investimentos/", dados, true);
      return response;
    } catch (error) {
      console.error("❌ Erro ao criar investimento:", error);
      throw error;
    }
  }

  /**
   * Atualiza um investimento existente
   * @param {string} id - ID do investimento
   * @param {Object} dados - Dados atualizados do investimento
   * @returns {Promise} Promise com os dados do investimento atualizado
   */
  async atualizarInvestimento(id: string, dados: Partial<InvestimentoItem>) {
    try {
      const response = await api.put(`/api/investimentos/${id}/`, dados, true);
      return response;
    } catch (error) {
      console.error(`❌ Erro ao atualizar investimento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Exclui um investimento
   * @param {string} id - ID do investimento a ser excluído
   * @returns {Promise} Promise com a resposta da exclusão
   */
  async excluirInvestimento(id: string) {
    try {
      const response = await api.delete(`/api/investimentos/${id}/`, true);
      return response;
    } catch (error) {
      console.error(`❌ Erro ao excluir investimento ${id}:`, error);
      throw error;
    }
  }
}

// Exportar instância singleton
export const investmentsApi = new InvestmentsApiService();
```

### 5. Criar a Página React

Crie um novo arquivo em `client/pages/sistema/dashboard/investimentos/index.tsx`:

```typescript
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  PlusCircle, 
  Loader2,
  TrendingUp,
  TrendingDown,
  LineChart,
  BarChart,
  AlertCircle,
  Edit,
  Trash
} from "lucide-react";
import { investmentsApi, InvestimentoItem } from "@/services/api/investments";
import { useTranslation } from "@/contexts/TranslationContext";
import { toast } from "@/hooks/use-toast";

export default function Investimentos() {
  const { t, formatCurrency } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("todos");
  
  // Estados
  const [investimentos, setInvestimentos] = useState<InvestimentoItem[]>([]);
  const [totalInvestido, setTotalInvestido] = useState(0);
  const [rendimentoTotal, setRendimentoTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carregar dados ao montar o componente
  useEffect(() => {
    console.log("🚀 INVESTIMENTOS - useEffect executado");
    console.log("👤 Usuário logado:", !!user);
    
    if (isAuthenticated) {
      fetchInvestimentos();
    }
  }, [isAuthenticated, user]);
  
  // Função para carregar investimentos
  const fetchInvestimentos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Buscando dados de investimentos...");
      const data = await investmentsApi.getInvestimentos();
      
      console.log("📊 Resposta:", data);
      
      if (data?.investimentos) {
        setInvestimentos(data.investimentos);
        setTotalInvestido(data.total_investido || 0);
        setRendimentoTotal(data.rendimento_total || 0);
        console.log("✅ Dados carregados com sucesso");
      } else {
        setError("Formato de dados inválido");
        console.warn("⚠️ Formato de dados inválido");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar investimentos:", error);
      setError("Não foi possível carregar os dados");
      toast({
        title: "Erro",
        description: "Não foi possível carregar os investimentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para adicionar investimento
  const handleAddInvestimento = async (dados: Omit<InvestimentoItem, 'id'>) => {
    try {
      const response = await investmentsApi.criarInvestimento(dados);
      
      // Atualizar estado com novo investimento
      setInvestimentos(prev => [...prev, response]);
      setTotalInvestido(prev => prev + dados.valor);
      
      toast({
        title: "Sucesso",
        description: "Investimento adicionado com sucesso",
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error("❌ Erro ao adicionar investimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o investimento",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Função para excluir investimento
  const handleDeleteInvestimento = async (id: string) => {
    try {
      await investmentsApi.excluirInvestimento(id);
      
      // Atualizar estado removendo o investimento
      const investimentoRemovido = investimentos.find(i => i.id === id);
      setInvestimentos(prev => prev.filter(i => i.id !== id));
      
      if (investimentoRemovido) {
        setTotalInvestido(prev => prev - investimentoRemovido.valor);
      }
      
      toast({
        title: "Sucesso",
        description: "Investimento excluído com sucesso",
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error(`❌ Erro ao excluir investimento ${id}:`, error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o investimento",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Renderização condicional - Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando investimentos...</p>
      </div>
    );
  }
  
  // Renderização condicional - Erro
  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 flex flex-col items-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-medium">Erro ao carregar dados</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Button onClick={fetchInvestimentos}>Tentar novamente</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investimentos</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie seus investimentos
          </p>
        </div>
        <Button onClick={() => {/* Abrir modal para adicionar */}}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo Investimento
        </Button>
      </div>
      
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestido)}</div>
            <p className="text-xs text-muted-foreground">
              Soma de todos os investimentos
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimento Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(rendimentoTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              Rendimentos acumulados
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retorno Médio</CardTitle>
            <LineChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalInvestido > 0 
                ? ((rendimentoTotal / totalInvestido) * 100).toFixed(2) 
                : "0.00"}%
            </div>
            <p className="text-xs text-muted-foreground">
              Retorno médio dos investimentos
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs e Tabela */}
      <Card>
        <CardHeader>
          <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="renda-fixa">Renda Fixa</TabsTrigger>
              <TabsTrigger value="renda-variavel">Renda Variável</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Valor</th>
                  <th className="text-left p-3">Data Início</th>
                  <th className="text-left p-3">Rendimento Mensal</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {investimentos
                  .filter(inv => {
                    if (activeTab === 'todos') return true;
                    if (activeTab === 'renda-fixa') return inv.tipo === 'Renda Fixa';
                    if (activeTab === 'renda-variavel') return inv.tipo === 'Renda Variável';
                    return true;
                  })
                  .map(investimento => (
                  <tr key={investimento.id} className="border-b">
                    <td className="p-3">{investimento.nome}</td>
                    <td className="p-3">{investimento.tipo}</td>
                    <td className="p-3">{formatCurrency(investimento.valor)}</td>
                    <td className="p-3">
                      {new Date(investimento.data_inicio).toLocaleDateString()}
                    </td>
                    <td className="p-3">{investimento.rendimento_mensal}%</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteInvestimento(investimento.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {investimentos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-muted-foreground">
                      Nenhum investimento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6. Adicionar a Rota React no Router

Edite o arquivo de rotas principal para adicionar o novo componente:

```tsx
// client/App.tsx ou arquivo de rotas
import { Routes, Route } from "react-router-dom";
import Investimentos from "@/pages/sistema/dashboard/investimentos";

// No componente de rotas
<Routes>
  {/* Outras rotas... */}
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route path="orcamento" element={<Orcamento />} />
    <Route path="info-diaria" element={<InfoDiaria />} />
    <Route path="investimentos" element={<Investimentos />} />
  </Route>
</Routes>
```

### 7. Adicionar Link na Navegação Lateral

Edite o componente de sidebar para incluir o link para a nova página:

```tsx
// client/components/DashboardSidebar.tsx
import { Wallet } from "lucide-react";

// No componente
<NavItem 
  to="/dashboard/investimentos"
  icon={<Wallet className="h-5 w-5" />}
  label="Investimentos"
/>
```

## Autenticação e Tratamento de Estado

### Sistema de Autenticação

O projeto utiliza JWT (JSON Web Tokens) para autenticação:

1. Os tokens são armazenados via `LocalStorageManager`
2. Para chamadas autenticadas, use `api.get(url, true)` ou `api.post(url, data, true)`
3. O sistema gerencia automaticamente a inclusão do header `Authorization: Bearer ${token}`
4. Refresh automático de token quando expirado

### Padrões de Estado e Loading

Siga este padrão para gerenciar estados e loadings:

```tsx
// Estados padrão
const [data, setData] = useState<DataType | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Função para carregar dados
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await apiService.getData();
    setData(response);
  } catch (error) {
    console.error("Erro:", error);
    setError("Mensagem amigável para o usuário");
    toast({ title: "Erro", description: "Mensagem de erro" });
  } finally {
    setLoading(false);
  }
};

// Renderização condicional
if (loading) return <LoadingComponent />;
if (error) return <ErrorComponent message={error} />;
if (!data) return <EmptyStateComponent />;

// Renderização principal com dados
return <MainComponent data={data} />;
```

## Mock Data para Desenvolvimento

Sempre forneça mock data para desenvolvimento:

```typescript
// Mock data para ambiente de desenvolvimento
if (isDevelopment) {
  console.log("⚠️ Usando dados mock (desenvolvimento)");
  return {
    // Dados mockados que imitam a estrutura real da API
    data: [...],
    total: 100,
    // etc.
  };
}
```

## Boas Práticas

1. **Tipagem forte**: Use TypeScript para todas as interfaces de dados
2. **Logs claros**: Adicione logs descritivos com emojis para facilitar o debugging
3. **Tratamento de erros**: Sempre use try/catch para tratar erros de API
4. **Loading states**: Implemente estados de loading para melhorar UX
5. **Fallbacks**: Tenha dados mock para desenvolvimento e testes
6. **Componentes menores**: Divida componentes grandes em menores para facilitar manutenção
7. **Hooks customizados**: Crie hooks para lógica reutilizável

## Exemplo de To-Do List para Implementação

Para facilitar o trabalho de um novo desenvolvedor, aqui está um checklist para implementar uma nova funcionalidade:

```
[ ] 1. Definir endpoints em Rotas.ts
[ ] 2. Configurar regras em Rules.ts
[ ] 3. Definir headers específicos em Headers.ts (se necessário)
[ ] 4. Criar o serviço API com tipagem e mock data
[ ] 5. Implementar a página React com estados e gerenciamento de loading
[ ] 6. Adicionar a rota no sistema de rotas
[ ] 7. Adicionar link na navegação lateral
[ ] 8. Testar fluxo completo (autenticação, loading, erros)
```

## Exemplo de Prompt para Solicitação de Implementação

```
Preciso implementar uma nova página "[NOME_DA_PÁGINA]" em "/dashboard/[ROTA]" que consome dados da API endpoint "/api/[NOVO_ENDPOINT]/". 

Seguindo o padrão existente no projeto, implemente:

1. Serviço de API:
   - Criar arquivo em "client/services/api/[nomeServico].ts"
   - Implementar métodos GET/POST/PUT/DELETE necessários
   - Incluir tipagem TypeScript para request/response
   - Adicionar dados mock para desenvolvimento

2. Página React:
   - Criar componente em "client/pages/sistema/dashboard/[pasta]/[arquivo].tsx"
   - Implementar estados (useState) para dados, loading e erros
   - Adicionar useEffect para carregar dados na montagem do componente
   - Incluir visualização de loading e tratamento de erros
   - Implementar funções para manipulação de dados (criar/editar/excluir)

3. Componentes UI:
   - Criar componentes visuais (tabelas, gráficos, forms) conforme necessário
   - Implementar responsividade mobile/desktop
   - Seguir padrão de design existente (shadcn/ui)

Estrutura de dados esperada: [DESCREVER_ESTRUTURA]
```

## Conclusão

Seguindo este guia passo a passo, você conseguirá implementar novas APIs e páginas no projeto Organizesee mantendo a consistência com a arquitetura existente e garantindo o funcionamento correto da autenticação e gerenciamento de estado.

Esta documentação serve como referência para qualquer desenvolvedor que precise adicionar novas funcionalidades ao projeto, garantindo que todos sigam os mesmos padrões e boas práticas estabelecidos.

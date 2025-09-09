import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, Percent, Search, AlertCircle, CheckCircle, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

// Import do serviço de investimentos
import investmentService, { InvestmentAsset, TickerSearchResult } from "@/services/investmentService";

// Interface atualizada sem o campo corretora
interface Investimento extends InvestmentAsset {}

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function CadastroInvestimentos() {
  const { toast } = useToast();
  
  // Estados principais
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tickerSearchResults, setTickerSearchResults] = useState<TickerSearchResult[]>([]);
  
  // Estados do formulário
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestimento, setEditingInvestimento] = useState<Investimento | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Omit<Investimento, 'id' | 'valor_total' | 'rentabilidade' | 'percentage'>>({
    ticker: "",
    nome_empresa: "",
    tipo: "",
    quantidade: 0,
    preco_medio: 0,
    data_compra: "",
    observacoes: "",
  });

  // Carregar investimentos ao montar o componente
  useEffect(() => {
    carregarInvestimentos();
  }, []);

  // Buscar tickers quando o usuário digita
  useEffect(() => {
    if (searchTerm.length >= 2) {
      buscarTickers();
    } else {
      setTickerSearchResults([]);
    }
  }, [searchTerm]);

  // Função para carregar investimentos da API
  const carregarInvestimentos = async () => {
    setLoading(true);
    try {
      const data = await investmentService.buscarAtivosPessoais();
      setInvestimentos(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar investimentos",
        description: error instanceof Error ? error.message : "Erro interno do servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar tickers
  const buscarTickers = async () => {
    setSearchLoading(true);
    try {
      const results = await investmentService.buscarTickers(searchTerm);
      setTickerSearchResults(results);
    } catch (error) {
      console.error("Erro ao buscar tickers:", error);
      setTickerSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Função para selecionar um ticker dos resultados da busca
  const selecionarTicker = (ticker: TickerSearchResult) => {
    setFormData(prev => ({
      ...prev,
      ticker: ticker.ticker,
      nome_empresa: ticker.name,
      tipo: ticker.type,
    }));
    setSearchTerm("");
    setTickerSearchResults([]);
  };

  // Função para salvar investimento (criar ou editar)
  const salvarInvestimento = async () => {
    try {
      if (!formData.ticker || !formData.nome_empresa || !formData.tipo || !formData.quantidade || !formData.preco_medio || !formData.data_compra) {
        toast({
          title: "Dados incompletos",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      if (editingInvestimento) {
        // Editar investimento existente
        await investmentService.editarAtivo(editingInvestimento.id!, formData);
        toast({
          title: "Investimento atualizado",
          description: "O investimento foi atualizado com sucesso.",
          variant: "default",
        });
      } else {
        // Criar novo investimento
        await investmentService.cadastrarAtivo(formData);
        toast({
          title: "Investimento cadastrado",
          description: "O investimento foi cadastrado com sucesso.",
          variant: "default",
        });
      }

      // Recarregar lista e fechar modal
      await carregarInvestimentos();
      resetForm();
      setIsDialogOpen(false);

    } catch (error) {
      toast({
        title: editingInvestimento ? "Erro ao atualizar" : "Erro ao cadastrar",
        description: error instanceof Error ? error.message : "Erro interno do servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir investimento
  const excluirInvestimento = async (id: number) => {
    try {
      setLoading(true);
      await investmentService.excluirAtivo(id);
      await carregarInvestimentos();
      toast({
        title: "Investimento excluído",
        description: "O investimento foi removido com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Erro interno do servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir modal de edição
  const abrirEdicao = (investimento: Investimento) => {
    setEditingInvestimento(investimento);
    setFormData({
      ticker: investimento.ticker,
      nome_empresa: investimento.nome_empresa,
      tipo: investimento.tipo,
      quantidade: investimento.quantidade,
      preco_medio: investimento.preco_medio,
      data_compra: investimento.data_compra,
      observacoes: investimento.observacoes || "",
    });
    setIsDialogOpen(true);
  };

  // Função para resetar formulário
  const resetForm = () => {
    setFormData({
      ticker: "",
      nome_empresa: "",
      tipo: "",
      quantidade: 0,
      preco_medio: 0,
      data_compra: "",
      observacoes: "",
    });
    setEditingInvestimento(null);
    setSearchTerm("");
    setTickerSearchResults([]);
  };

  // Cálculos para métricas e gráficos
  const metricas = useMemo(() => {
    if (investimentos.length === 0) return {
      valorTotal: 0,
      rentabilidadeTotal: 0,
      quantidadeAtivos: 0,
      melhorAtivo: null,
      piorAtivo: null
    };

    const valorTotal = investimentos.reduce((acc, inv) => acc + (inv.valor_total || 0), 0);
    const rentabilidadeTotal = investimentos.reduce((acc, inv) => acc + (inv.rentabilidade || 0), 0) / investimentos.length;
    
    const melhorAtivo = investimentos.reduce((melhor, atual) => 
      (atual.rentabilidade || 0) > (melhor.rentabilidade || 0) ? atual : melhor
    );
    
    const piorAtivo = investimentos.reduce((pior, atual) => 
      (atual.rentabilidade || 0) < (pior.rentabilidade || 0) ? atual : pior
    );

    return {
      valorTotal,
      rentabilidadeTotal,
      quantidadeAtivos: investimentos.length,
      melhorAtivo,
      piorAtivo
    };
  }, [investimentos]);

  // Dados para gráfico de pizza (distribuição por tipo)
  const dadosGraficoPizza = useMemo(() => {
    const distribuicaoPorTipo = investimentos.reduce((acc, inv) => {
      const tipo = inv.tipo || 'Outros';
      acc[tipo] = (acc[tipo] || 0) + (inv.valor_total || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribuicaoPorTipo).map(([tipo, valor]) => ({
      name: tipo,
      value: valor,
      percentage: (valor / metricas.valorTotal * 100).toFixed(1)
    }));
  }, [investimentos, metricas.valorTotal]);

  // Dados para gráfico de barras (top 10 ativos)
  const dadosGraficoBarras = useMemo(() => {
    return investimentos
      .sort((a, b) => (b.valor_total || 0) - (a.valor_total || 0))
      .slice(0, 10)
      .map(inv => ({
        ticker: inv.ticker,
        valor: inv.valor_total || 0,
        rentabilidade: inv.rentabilidade || 0
      }));
  }, [investimentos]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Investimentos</h1>
          <p className="text-muted-foreground">
            Gerencie sua carteira de investimentos e acompanhe performance
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Investimento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingInvestimento ? 'Editar Investimento' : 'Novo Investimento'}
              </DialogTitle>
              <DialogDescription>
                {editingInvestimento 
                  ? 'Atualize as informações do investimento.' 
                  : 'Adicione um novo investimento à sua carteira.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Busca de Ticker */}
              <div className="grid gap-2">
                <Label htmlFor="ticker-search">Buscar Ticker</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ticker-search"
                    placeholder="Digite o ticker (ex: VALE3, PETR4)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin" />
                  )}
                </div>
                
                {/* Resultados da busca */}
                {tickerSearchResults.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {tickerSearchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                        onClick={() => selecionarTicker(result)}
                      >
                        <div className="font-medium">{result.ticker}</div>
                        <div className="text-sm text-muted-foreground">{result.name}</div>
                        <Badge variant="outline" className="text-xs">{result.type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Campos do formulário */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ticker">Ticker *</Label>
                  <Input
                    id="ticker"
                    value={formData.ticker}
                    onChange={(e) => setFormData(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
                    placeholder="Ex: VALE3"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ação">Ação</SelectItem>
                      <SelectItem value="FII">FII</SelectItem>
                      <SelectItem value="ETF">ETF</SelectItem>
                      <SelectItem value="BDR">BDR</SelectItem>
                      <SelectItem value="Cripto">Cripto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nome_empresa">Nome da Empresa *</Label>
                <Input
                  id="nome_empresa"
                  value={formData.nome_empresa}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_empresa: e.target.value }))}
                  placeholder="Ex: Vale S.A."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantidade: Number(e.target.value) }))}
                    placeholder="100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="preco_medio">Preço Médio *</Label>
                  <Input
                    id="preco_medio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.preco_medio}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco_medio: Number(e.target.value) }))}
                    placeholder="25.50"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="data_compra">Data da Compra *</Label>
                <Input
                  id="data_compra"
                  type="date"
                  value={formData.data_compra}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_compra: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais sobre o investimento..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={salvarInvestimento} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingInvestimento ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.valorTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade Média</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metricas.rentabilidadeTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metricas.rentabilidadeTotal.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.quantidadeAtivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhor Ativo</CardTitle>
            {metricas.melhorAtivo && (metricas.melhorAtivo.rentabilidade || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {metricas.melhorAtivo ? metricas.melhorAtivo.ticker : 'N/A'}
            </div>
            <div className={`text-xs ${metricas.melhorAtivo && (metricas.melhorAtivo.rentabilidade || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metricas.melhorAtivo ? `${(metricas.melhorAtivo.rentabilidade || 0).toFixed(2)}%` : '0%'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
            <CardDescription>Alocação da carteira por categoria de investimento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosGraficoPizza}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosGraficoPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Ativos</CardTitle>
            <CardDescription>Maiores posições por valor investido</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGraficoBarras}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ticker" />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(value)} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'valor' 
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
                      : `${Number(value).toFixed(2)}%`,
                    name === 'valor' ? 'Valor Investido' : 'Rentabilidade'
                  ]}
                />
                <Legend />
                <Bar dataKey="valor" fill="#8884d8" name="valor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de investimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Investimentos</CardTitle>
          <CardDescription>Lista completa dos investimentos cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando investimentos...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Preço Médio</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Rentabilidade</TableHead>
                  <TableHead>Data Compra</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investimentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum investimento cadastrado. Clique em "Novo Investimento" para começar.
                    </TableCell>
                  </TableRow>
                ) : (
                  investimentos.map((investimento) => (
                    <TableRow key={investimento.id}>
                      <TableCell className="font-medium">{investimento.ticker}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{investimento.nome_empresa}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{investimento.tipo}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{investimento.quantidade.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(investimento.preco_medio)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(investimento.valor_total || 0)}
                      </TableCell>
                      <TableCell className={`text-right ${(investimento.rentabilidade || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(investimento.rentabilidade || 0).toFixed(2)}%
                      </TableCell>
                      <TableCell>{new Date(investimento.data_compra).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirEdicao(investimento)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => investimento.id && excluirInvestimento(investimento.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Import do serviço de investimentos
import investmentService, { InvestmentAsset, TickerSearchResult } from "@/services/investmentService";

// Interface conforme documentação do backend
interface Investimento extends InvestmentAsset {}

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
  const [formData, setFormData] = useState<Omit<Investimento, 'id' | 'valor_investido' | 'preco_atual' | 'valor_atual' | 'variacao_percentual' | 'ganho_perda'>>({
    ticker: "",
    data_compra: "",
    quantidade: 0,
    valor_unitario: 0,
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
    }));
    setSearchTerm("");
    setTickerSearchResults([]);
  };

  // Função para salvar investimento (criar ou editar)
  const salvarInvestimento = async () => {
    try {
      if (!formData.ticker || !formData.quantidade || !formData.valor_unitario || !formData.data_compra) {
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
      quantidade: investimento.quantidade,
      valor_unitario: investimento.valor_unitario,
      data_compra: investimento.data_compra,
    });
    setIsDialogOpen(true);
  };

  // Função para resetar formulário
  const resetForm = () => {
    setFormData({
      ticker: "",
      data_compra: "",
      quantidade: 0,
      valor_unitario: 0,
    });
    setEditingInvestimento(null);
    setSearchTerm("");
    setTickerSearchResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Investimentos</h1>
          <p className="text-muted-foreground">
            Gerencie sua carteira de investimentos conforme API integrada
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
                        <div className="text-sm text-muted-foreground">{result.descricao}</div>
                        <Badge variant="outline" className="text-xs">{result.tipo_ativo}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Campos do formulário */}
              <div className="grid gap-2">
                <Label htmlFor="ticker">Ticker *</Label>
                <Input
                  id="ticker"
                  value={formData.ticker}
                  onChange={(e) => setFormData(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
                  placeholder="Ex: VALE3"
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
                  <Label htmlFor="valor_unitario">Valor Unitário *</Label>
                  <Input
                    id="valor_unitario"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valor_unitario}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_unitario: Number(e.target.value) }))}
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investimentos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Valor Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                investimentos.reduce((acc, inv) => acc + (inv.valor_investido || 0), 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                investimentos.reduce((acc, inv) => acc + (inv.valor_atual || 0), 0)
              )}
            </div>
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
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Valor Unitário</TableHead>
                  <TableHead className="text-right">Valor Investido</TableHead>
                  <TableHead className="text-right">Preço Atual</TableHead>
                  <TableHead className="text-right">Valor Atual</TableHead>
                  <TableHead className="text-right">Variação %</TableHead>
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
                      <TableCell className="text-right">{investimento.quantidade.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(investimento.valor_unitario)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(investimento.valor_investido || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {investimento.preco_atual ? 
                          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(investimento.preco_atual) : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(investimento.valor_atual || 0)}
                      </TableCell>
                      <TableCell className={`text-right ${(investimento.variacao_percentual || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(investimento.variacao_percentual || 0).toFixed(2)}%
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

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  AlertTriangle,
  CreditCard,
  Calendar,
  TrendingDown,
  Trash2,
  Car,
  DollarSign,
  MoreHorizontal,
  Scale,
  Target,
  HelpCircle,
  Repeat,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { budgetApi } from "@/services/api/budget";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CompactLegend from "@/components/ui/CompactLegend";
import useFormRepeat from "@/hooks/useFormRepeat";
import { FORM_STORAGE_KEYS } from "@/utils/formRepeat";
import { categoryColors } from "@/utils/colors";
import { debtTypeMap } from "@/utils/mappings";

interface Divida {
  id: number;
  descricao: string;
  valor_mensal: number;
  valor_hoje: number;
  divida_total: number;
  quantidade_parcelas: number;
  taxa_juros: number;
  juros_mensais: number;
  categoria: string;
  flag: boolean;
  mes: number;
  ano: number;
}

interface TotalPorCategoria {
  categoria: string;
  total: number;
  percentual: number;
}

interface ResumoDividas {
  total_dividas: number;
  total_parcelas_mensais: number;
  total_juros_mensais: number;
  periodo: {
    mes: string;
    ano: string;
  };
}

interface FormData {
  descricao: string;
  valor_mensal: string;
  valor_hoje: string;
  taxa_juros: string;
  quantidade_parcelas: string;
}

export default function Dividas() {
  const { isAuthenticated } = useAuth();
  const { t, formatCurrency } = useTranslation();
  const { toast } = useToast();
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [totaisPorCategoria, setTotaisPorCategoria] = useState<TotalPorCategoria[]>([]);
  const [resumoDividas, setResumoDividas] = useState<ResumoDividas | null>(null);
  const [currentCategoria, setCurrentCategoria] = useState("CartaoDeCredito");
  const [formData, setFormData] = useState<FormData>({
    descricao: "",
    valor_mensal: "",
    valor_hoje: "",
    taxa_juros: "",
    quantidade_parcelas: "",
  });
  const [loading, setLoading] = useState(false);
  
  // Hook para gerenciar repetição de formulários
  const { saveValues, applyLastValues } = useFormRepeat<FormData>(FORM_STORAGE_KEYS.DIVIDAS);

  // Função para preparar dados do gráfico
  const prepararDadosGrafico = () => {
    if (!totaisPorCategoria || totaisPorCategoria.length === 0) {
      return [];
    }

    return totaisPorCategoria.map((item) => ({
      name: getCategoriaLabel(item.categoria),
      value: item.total,
      percentage: item.percentual,
      color: getCategoriaColor(item.categoria),
    }));
  };

  // Obter mês e ano do localStorage
  const mes =
    localStorage.getItem("mes") ||
    String(new Date().getMonth() + 1).padStart(2, "0");
  const ano = localStorage.getItem("ano") || String(new Date().getFullYear());

  useEffect(() => {
    if (isAuthenticated) {
      atualizarDividas();
    }
  }, [currentCategoria, mes, ano, isAuthenticated]);

  // Função para atualizar as dividas via API
  const atualizarDividas = async () => {
    setLoading(true);

    try {
      const response = await budgetApi.getMaioresDividas(
        currentCategoria,
        mes,
        ano,
      );
      setDividas(response.maiores_dividas || []);
      setTotaisPorCategoria(response.totais_por_categoria || []);
      setResumoDividas(response.resumo || null);
    } catch (error) {
      console.error("Erro ao obter as maiores dívidas:", error);
      setDividas([]);
      setTotaisPorCategoria([]);
      setResumoDividas(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para cadastrar uma dívida
  const cadastrarDivida = async () => {
    if (!isAuthenticated) {
      toast({
        title: t("authentication_required_debt"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.descricao || !formData.valor_mensal) {
      toast({
        title: t("fill_description_monthly_value"),
        variant: "destructive",
      });
      return;
    }

    const data = {
      categoria: currentCategoria,
      descricao: formData.descricao,
      valor_mensal: parseFloat(formData.valor_mensal),
      valor_hoje: parseFloat(formData.valor_hoje) || 0,
      taxa_juros: parseFloat(formData.taxa_juros) || 0,
      quantidade_parcelas: parseInt(formData.quantidade_parcelas) || 1,
      mes: parseInt(mes),
      ano: parseInt(ano),
    };

    try {
      // Salvar dados do formulário para repetição futura
      saveValues(formData);
      
      // Atualização otimista para melhorar UX
      const newDivida = {
        id: Date.now(), // ID temporário
        ...data,
        juros_mensais: 0, // Calculado pelo backend
        divida_total: parseFloat(formData.valor_hoje) || 0,
        flag: false,
      };
      
      setDividas(prev => [newDivida, ...prev]);
      
      await budgetApi.cadastrarDivida(data);
      
      toast({
        title: t("debt_registered_successfully"),
        variant: "default",
      });
      
      setFormData({
        descricao: "",
        valor_mensal: "",
        valor_hoje: "",
        taxa_juros: "",
        quantidade_parcelas: "",
      });
      
      // Atualizar dados após o cadastro
      atualizarDividas();
    } catch (error) {
      console.error("Erro ao cadastrar dívida:", error);
      toast({
        title: t("debt_registration_error"),
        description: error.message || t("unexpected_error"),
        variant: "destructive",
      });
      // Reverter atualização otimista em caso de erro
      atualizarDividas();
    }
  };

  // Função para excluir uma dívida
  const excluirDivida = async (id: number) => {
    if (window.confirm(t("confirm_delete_debt"))) {
      try {
        // Atualização otimista
        setDividas(prev => prev.filter(item => item.id !== id));
        
        await budgetApi.excluirDivida(id);
        
        toast({
          title: t("debt_deleted_successfully"),
          variant: "default",
        });
        
        // Atualizar dados após a exclusão
        atualizarDividas();
      } catch (error) {
        console.error("Erro ao excluir dívida:", error);
        toast({
          title: t("debt_deletion_error"),
          variant: "destructive",
        });
        // Reverter atualização otimista em caso de erro
        atualizarDividas();
      }
    }
  };

  // Função para aplicar o último formulário
  const aplicarUltimoFormulario = () => {
    const lastForm = applyLastValues();
    if (lastForm) {
      setFormData(lastForm);
    } else {
      toast({
        title: t("no_previous_form_data"),
        description: t("no_previous_form_data_description"),
        variant: "default",
      });
    }
  };

  // Função para limpar o formulário
  const limparFormulario = () => {
    setFormData({
      descricao: "",
      valor_mensal: "",
      valor_hoje: "",
      taxa_juros: "",
      quantidade_parcelas: "",
    });
  };

  // Função para mostrar o formulário de uma categoria específica
  const showForm = (categoria: string) => {
    setCurrentCategoria(categoria);
    limparFormulario();
  };

  // Função para formatar valores monetários
  const formatarValor = (valor: number) => {
    return formatCurrency(valor);
  };

  // Função para obter o ícone da categoria
  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case "CartaoDeCredito":
        return <CreditCard className="h-4 w-4" />;
      case "Financiamento":
        return <Car className="h-4 w-4" />;
      case "Emprestimo":
        return <DollarSign className="h-4 w-4" />;
      case "Outros":
        return <MoreHorizontal className="h-4 w-4" />;
      default:
        return <Scale className="h-4 w-4" />;
    }
  };

  // Função para obter a cor da categoria
  const getCategoriaColor = (categoria: string): string => {
    switch (categoria) {
      case "CartaoDeCredito":
        return categoryColors.cartao || "#FF6384";
      case "Financiamento":
        return categoryColors.financiamento || "#36A2EB";
      case "Emprestimo":
        return categoryColors.emprestimo || "#FFCE56";
      case "Outros":
        return categoryColors.outro || "#9966FF";
      default:
        return "#CCCCCC";
    }
  };

  // Função para obter o label da categoria
  const getCategoriaLabel = (categoria: string) => {
    const categoriaMapping = {
      "CartaoDeCredito": "cartao",
      "Financiamento": "financiamento",
      "Emprestimo": "emprestimo",
      "Outros": "outro"
    };
    
    // Usar o mapeamento centralizado ou fallback para tradução direta
    const mappedKey = categoriaMapping[categoria];
    if (mappedKey && debtTypeMap[mappedKey]) {
      return debtTypeMap[mappedKey];
    }
    
    switch (categoria) {
      case "CartaoDeCredito":
        return t("credit_card");
      case "Financiamento":
        return t("financing");
      case "Emprestimo":
        return t("loan");
      case "Outros":
        return t("others");
      default:
        return categoria;
    }
  };

  // Calcular totais usando os dados do resumo da API
  const totalDividas = resumoDividas?.total_dividas || 0;
  const totalParcelas = resumoDividas?.total_parcelas_mensais || 0;
  const totalJuros = resumoDividas?.total_juros_mensais || 0;
  const activeDividas = totaisPorCategoria.length;

  // Criar dados para legenda compacta
  const legendItems = prepararDadosGrafico().map(item => ({
    color: item.color,
    icon: getCategoriaIcon(item.name),
    label: item.name,
    percentage: item.percentage,
    value: formatarValor(item.value),
  }));

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_debts")}
            </CardTitle>
            <Scale className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatarValor(totalDividas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeDividas} {t("active_debts")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("monthly_installments")}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarValor(totalParcelas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("monthly_commitment")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("monthly_interest")}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatarValor(totalJuros)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("interest_paid_per_month")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("current_category")}
            </CardTitle>
            {getCategoriaIcon(currentCategoria)}
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {getCategoriaLabel(currentCategoria)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("active_filter")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Dívidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scale className="h-5 w-5" />
            <span>
              {t("debts")} - {getCategoriaLabel(currentCategoria)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("description")}</TableHead>
                <TableHead>{t("monthly_value")}</TableHead>
                <TableHead>{t("current_value")}</TableHead>
                <TableHead>{t("total_debt")}</TableHead>
                <TableHead>{t("quantity")}</TableHead>
                <TableHead>{t("interest_rate")}</TableHead>
                <TableHead>{t("monthly_interest_abbr")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    <div className="py-8">
                      <p className="text-muted-foreground">
                        {t("loading_debts")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : dividas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    <div className="py-8">
                      <p className="text-destructive">
                        {t("no_debts_registered_for_user")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                dividas.map((divida) => (
                  <TableRow key={divida.id}>
                    <TableCell className="font-medium">
                      {divida.descricao}
                    </TableCell>
                    <TableCell className="text-destructive font-semibold">
                      {formatarValor(divida.valor_mensal)}
                    </TableCell>
                    <TableCell>{formatarValor(divida.valor_hoje)}</TableCell>
                    <TableCell>{formatarValor(divida.divida_total)}</TableCell>
                    <TableCell>{divida.quantidade_parcelas}x</TableCell>
                    <TableCell>{divida.taxa_juros}%</TableCell>
                    <TableCell className="text-destructive">
                      {formatarValor(divida.juros_mensais)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => excluirDivida(divida.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Layout lado a lado: Gráfico à esquerda e Cadastro à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seção do Gráfico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-red-600" />
              <span>{t("distribution_by_category")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totaisPorCategoria && totaisPorCategoria.length > 0 ? (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepararDadosGrafico()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepararDadosGrafico().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legenda Compacta */}
                <div className="mt-4">
                  <CompactLegend items={legendItems} />
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível para exibir o gráfico</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção de Cadastro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getCategoriaIcon(currentCategoria)}
              <span>
                Cadastrar - {getCategoriaLabel(currentCategoria)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Botões de Categoria */}
            <div className="flex justify-center flex-wrap gap-1">
              {[
                {
                  key: "CartaoDeCredito",
                  icon: CreditCard,
                  label: t("credit_card"),
                },
                { key: "Financiamento", icon: Car, label: t("financing") },
                { key: "Emprestimo", icon: DollarSign, label: t("loan") },
                { key: "Outros", icon: MoreHorizontal, label: t("others") },
              ].map(({ key, icon: Icon, label }) => (
                <Button
                  key={key}
                  variant={currentCategoria === key ? "default" : "outline"}
                  onClick={() => showForm(key)}
                  className="flex items-center space-x-1 text-xs px-2 py-1"
                  size="sm"
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>

            {/* Formulário Compacto */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="descricao" className="text-xs">
                    {t("description")}
                  </Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    placeholder="Ex: Financiamento carro"
                    className="h-8"
                  />
                </div>

                <div>
                  <Label htmlFor="valor_mensal" className="text-xs">
                    {t("monthly_value")} (R$)
                  </Label>
                  <Input
                    id="valor_mensal"
                    type="number"
                    inputMode="decimal"
                    value={formData.valor_mensal}
                    onChange={(e) =>
                      setFormData({ ...formData, valor_mensal: e.target.value })
                    }
                    placeholder="450.00"
                    className="h-8"
                  />
                </div>
              </div>

              {currentCategoria === "CartaoDeCredito" && (
                <div>
                  <Label htmlFor="quantidade_parcelas" className="text-xs">
                    {t("parcels")}
                  </Label>
                  <Input
                    id="quantidade_parcelas"
                    type="number"
                    min="1"
                    value={formData.quantidade_parcelas}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantidade_parcelas: e.target.value,
                      })
                    }
                    placeholder="12"
                    className="h-8"
                  />
                </div>
              )}

              {currentCategoria !== "CartaoDeCredito" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="valor_hoje" className="text-xs">
                      {t("total_value")} (R$)
                    </Label>
                    <Input
                      id="valor_hoje"
                      type="number"
                      inputMode="decimal"
                      value={formData.valor_hoje}
                      onChange={(e) =>
                        setFormData({ ...formData, valor_hoje: e.target.value })
                      }
                      placeholder="25000.00"
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label htmlFor="taxa_juros" className="text-xs">
                      <div className="flex items-center">
                        <span>Taxa de juros real (CET)</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 ml-1 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Custo Efetivo Total</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </Label>
                    <Input
                      id="taxa_juros"
                      type="number"
                      inputMode="decimal"
                      value={formData.taxa_juros}
                      onChange={(e) =>
                        setFormData({ ...formData, taxa_juros: e.target.value })
                      }
                      placeholder="12.5"
                      className="h-8"
                    />
                  </div>
                </div>
              )}

              {currentCategoria !== "CartaoDeCredito" && (
                <div>
                  <Label htmlFor="quantidade_parcelas_extra" className="text-xs">
                    {t("parcels")}
                  </Label>
                  <Input
                    id="quantidade_parcelas_extra"
                    type="number"
                    min="1"
                    value={formData.quantidade_parcelas}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantidade_parcelas: e.target.value,
                      })
                    }
                    placeholder="36"
                    className="h-8"
                  />
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-2">
              <Button
                onClick={cadastrarDivida}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white h-8 text-sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                Cadastrar
              </Button>
              <Button 
                variant="outline" 
                onClick={aplicarUltimoFormulario}
                size="sm"
                className="text-xs px-2 py-1"
              >
                <Repeat className="h-3 w-3 mr-1" />
                {t("repeat")}
              </Button>
              <Button 
                variant="outline" 
                onClick={limparFormulario}
                size="sm"
                className="text-xs px-2 py-1"
              >
                {t("clear")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { budgetApi } from "@/services/api/budget";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useMonthYear } from "@/hooks/useMonthYear";

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

// Cores para o gráfico de pizza - tons de vermelho para dívidas
const COLORS = [
  "#dc2626", // red-600
  "#0891b2", // cyan-600
  "#7c3aed", // violet-600
  "#16a34a", // green-600
  "#f97316", // orange-500
  "#06b6d4", // cyan-500
  "#8b5cf6", // violet-500
  "#6366f1", // indigo-500
  "#ec4899", // pink-500
];

export default function Dividas() {
  const { isAuthenticated } = useAuth();
  const { t, formatCurrency } = useTranslation();
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [totaisPorCategoria, setTotaisPorCategoria] = useState<TotalPorCategoria[]>([]);
  const [resumoDividas, setResumoDividas] = useState<ResumoDividas | null>(null);
  const [currentCategoria, setCurrentCategoria] = useState("CartaoDeCredito");
  const [formVisible, setFormVisible] = useState(true); // Estado para controlar visibilidade do formulário
  const formRef = React.useRef<HTMLDivElement>(null); // Referência para o formulário
  const [formData, setFormData] = useState<FormData>({
    descricao: "",
    valor_mensal: "",
    valor_hoje: "",
    taxa_juros: "",
    quantidade_parcelas: "",
  });
  const { mes, ano } = useMonthYear();
  
  // Hook para detectar cliques fora do formulário
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        // Se o usuário clicou fora do formulário e havia dados preenchidos, mostrar confirmação
        if (formData.descricao || formData.valor_mensal) {
          const confirmClose = window.confirm("Deseja descartar os dados do formulário?");
          if (confirmClose) {
            limparFormulario();
          }
        } else {
          // Se o formulário está vazio, apenas esconde
          setFormVisible(false);
        }
      }
    }
    
    // Adiciona o listener quando o componente monta
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Remove o listener quando o componente desmonta
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [formData]);
  const [loading, setLoading] = useState(false);

  // Função para preparar dados do gráfico
  const prepararDadosGrafico = () => {
    if (!totaisPorCategoria || totaisPorCategoria.length === 0) {
      return [];
    }

    const total = totaisPorCategoria.reduce((sum, item) => sum + item.total, 0);
    
    return totaisPorCategoria.map((item, index) => ({
      name: getCategoriaLabel(item.categoria),
      value: item.total,
      percentage: ((item.total / total) * 100).toFixed(2),
      color: COLORS[index % COLORS.length],
    }));
  };

  // Mês e ano são obtidos do hook useMonthYear

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

  // Adiciona hook do toast
  const { toast } = useToast();

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
      // Enviar dados para a API
      await budgetApi.cadastrarDivida(data);
      
      // Mostrar toast de sucesso na barra lateral
      toast({
        title: "Sucesso!",
        description: `${getCategoriaLabel(currentCategoria)} cadastrado com sucesso.`,
        variant: "default",
        duration: 3000,
      });
      
      // Resetar o formulário
      setFormData({
        descricao: "",
        valor_mensal: "",
        valor_hoje: "",
        taxa_juros: "",
        quantidade_parcelas: "",
      });
      
      // Atualizar dados localmente sem recarregar toda a página
      atualizarDividas();
      
      // Adicionar novo item diretamente à lista local para atualização imediata
      const novaDivida: Divida = {
        id: Date.now(), // ID temporário até a próxima atualização
        descricao: data.descricao,
        valor_mensal: data.valor_mensal,
        valor_hoje: data.valor_hoje || 0,
        divida_total: data.valor_mensal * (data.quantidade_parcelas || 1),
        quantidade_parcelas: data.quantidade_parcelas,
        taxa_juros: data.taxa_juros || 0,
        juros_mensais: (data.valor_mensal * (data.taxa_juros / 100)) || 0,
        categoria: data.categoria,
        flag: true,
        mes: data.mes,
        ano: data.ano
      };
      
      setDividas(prevDividas => [...prevDividas, novaDivida]);
      
    } catch (error) {
      console.error("Erro ao cadastrar dívida:", error);
      toast({
        title: "Erro no cadastro",
        description: "Não foi possível cadastrar o item. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para excluir uma dívida
  const excluirDivida = async (id: number) => {
    if (window.confirm(t("confirm_delete_debt"))) {
      try {
        await budgetApi.excluirDivida(id);
        atualizarDividas();
        toast({
          title: t("debt_deleted_successfully"),
        });
      } catch (error) {
        console.error("Erro ao excluir dívida:", error);
        toast({
          title: t("debt_deletion_error"),
          variant: "destructive",
        });
      }
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
  
  // Função para repetir o último valor
  const repetirUltimoValor = () => {
    if (dividas.length > 0) {
      const ultimaDivida = dividas[0]; // Considerando que as dívidas estão ordenadas com a mais recente primeiro
      setFormData({
        descricao: ultimaDivida.descricao,
        valor_mensal: ultimaDivida.valor_mensal.toString(),
        valor_hoje: ultimaDivida.valor_hoje ? ultimaDivida.valor_hoje.toString() : "",
        taxa_juros: ultimaDivida.taxa_juros ? ultimaDivida.taxa_juros.toString() : "",
        quantidade_parcelas: ultimaDivida.quantidade_parcelas ? ultimaDivida.quantidade_parcelas.toString() : "",
      });
    }
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

  // Função para obter o label da categoria
  const getCategoriaLabel = (categoria: string) => {
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

  return (
    <>
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
                <TableHead>{t("annual_interest")}</TableHead>
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
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepararDadosGrafico().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(value), 'Valor']}
                      labelFormatter={(label) => `Categoria: ${label}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível para exibir o gráfico</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção de Cadastro */}
        <Card className={formVisible ? "" : "opacity-70"} ref={formRef}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getCategoriaIcon(currentCategoria)}
              <span>
                {getCategoriaLabel(currentCategoria)}
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
                  <Label htmlFor="descricao" className="text-xs">{t("description")}</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    placeholder={t("debt_description_placeholder")}
                    className="h-8"
                  />
                </div>

                <div>
                  <Label htmlFor="valor_mensal" className="text-xs">{t("monthly_value")} (R$)</Label>
                  <Input
                    id="valor_mensal"
                    type="number"
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
                    Parcelas
                  </Label>
                  <Input
                    id="quantidade_parcelas"
                    type="number"
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
                      {t("total_value_paying_today")} (R$)
                    </Label>
                    <Input
                      id="valor_hoje"
                      type="number"
                      value={formData.valor_hoje}
                      onChange={(e) =>
                        setFormData({ ...formData, valor_hoje: e.target.value })
                      }
                      placeholder="25000.00"
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label htmlFor="taxa_juros" className="text-xs tooltip-trigger">
                      Taxa de juros real (CET)
                    </Label>
                    <Input
                      id="taxa_juros"
                      type="number"
                      value={formData.taxa_juros}
                      onChange={(e) =>
                        setFormData({ ...formData, taxa_juros: e.target.value })
                      }
                      placeholder="12.5"
                      className="h-8"
                      title="Custo Efetivo Total - Taxa que representa o custo real da operação"
                    />
                  </div>
                </div>
              )}

              {currentCategoria !== "CartaoDeCredito" && (
                <div>
                  <Label htmlFor="quantidade_parcelas_extra" className="text-xs">
                    Parcelas
                  </Label>
                  <Input
                    id="quantidade_parcelas_extra"
                    type="number"
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
                onClick={limparFormulario}
                size="sm"
                className="text-xs px-2 py-1"
              >
                {t("clear")}
              </Button>
              <Button 
                variant="outline" 
                onClick={repetirUltimoValor}
                size="sm"
                className="text-xs px-2 py-1"
              >
                Repetir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <Toaster />
    </>
  );
}

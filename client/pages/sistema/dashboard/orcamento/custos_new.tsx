import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  TrendingDown,
  AlertCircle,
  Home,
  Car,
  DollarSign,
  Waves,
  GraduationCap,
  Coffee,
  Trash2,
  Target,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { budgetApi } from "@/services/api/budget";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Custo {
  id: number;
  descricao: string;
  valor_mensal: number;
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

interface FormData {
  descricao: string;
  valor_mensal: string;
}

// Cores para o gráfico de pizza - tons de vermelho para custos
const COLORS = [
  "#dc2626", // red-600
  "#ef4444", // red-500
  "#f87171", // red-400
  "#fca5a5", // red-300
  "#fecaca", // red-200
  "#fee2e2", // red-100
  "#991b1b", // red-800
  "#7f1d1d", // red-900
];

export default function Custos() {
  const { isAuthenticated } = useAuth();
  const { t, formatCurrency } = useTranslation();
  const [custos, setCustos] = useState<Custo[]>([]);
  const [totaisPorCategoria, setTotaisPorCategoria] = useState<TotalPorCategoria[]>([]);
  const [currentCategoria, setCurrentCategoria] = useState("Moradia");
  const [formData, setFormData] = useState<FormData>({
    descricao: "",
    valor_mensal: "",
  });
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

  // Obter mês e ano do localStorage
  const mes =
    localStorage.getItem("mes") ||
    String(new Date().getMonth() + 1).padStart(2, "0");
  const ano = localStorage.getItem("ano") || String(new Date().getFullYear());

  useEffect(() => {
    if (isAuthenticated) {
      atualizarCustos();
    }
  }, [currentCategoria, mes, ano, isAuthenticated]);

  // Função para atualizar os custos via API
  const atualizarCustos = async () => {
    setLoading(true);

    try {
      const response = await budgetApi.getMaioresGastos(
        currentCategoria,
        mes,
        ano,
      );
      setCustos(response.maiores_gastos || []);
      setTotaisPorCategoria(response.totais_por_categoria || []);
    } catch (error) {
      console.error("Erro ao obter os maiores custos:", error);
      setCustos([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para cadastrar um custo
  const cadastrarCusto = async () => {
    if (!isAuthenticated) {
      alert(t("authentication_required_cost"));
      return;
    }

    if (!formData.descricao || !formData.valor_mensal) {
      alert(t("fill_description_monthly_value"));
      return;
    }

    const data = {
      categoria: currentCategoria,
      descricao: formData.descricao,
      valor_mensal: parseFloat(formData.valor_mensal),
      flag: false,
      mes: parseInt(mes),
      ano: parseInt(ano),
    };

    try {
      await budgetApi.cadastrarGasto(data);
      alert(t("cost_registered_successfully"));
      setFormData({
        descricao: "",
        valor_mensal: "",
      });
      atualizarCustos();
    } catch (error) {
      console.error("Erro ao cadastrar custo:", error);
      alert(t("cost_registration_error"));
    }
  };

  // Função para excluir um custo
  const excluirCusto = async (id: number) => {
    if (window.confirm(t("confirm_delete_cost"))) {
      try {
        await budgetApi.excluirGasto(id);
        atualizarCustos();
        alert(t("cost_deleted_successfully"));
      } catch (error) {
        console.error("Erro ao excluir custo:", error);
        alert(t("cost_deletion_error"));
      }
    }
  };

  // Função para limpar o formulário
  const limparFormulario = () => {
    setFormData({
      descricao: "",
      valor_mensal: "",
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
      case "Moradia":
        return <Home className="h-4 w-4" />;
      case "Transporte":
        return <Car className="h-4 w-4" />;
      case "Alimentacao":
        return <Coffee className="h-4 w-4" />;
      case "Educacao":
        return <GraduationCap className="h-4 w-4" />;
      case "Lazer":
        return <Waves className="h-4 w-4" />;
      case "Outros":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  // Função para obter o label da categoria
  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case "Moradia":
        return t("housing");
      case "Transporte":
        return t("transport");
      case "Alimentacao":
        return t("food");
      case "Educacao":
        return t("education");
      case "Lazer":
        return t("leisure");
      case "Outros":
        return t("others");
      default:
        return categoria;
    }
  };

  // Calcular totais
  const totalCustos = custos.reduce((sum, c) => sum + (Number(c.valor_mensal) || 0), 0);
  const totalFixos = custos.filter(c => c.flag).reduce((sum, c) => sum + (Number(c.valor_mensal) || 0), 0);
  const totalVariaveis = custos.filter(c => !c.flag).reduce((sum, c) => sum + (Number(c.valor_mensal) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_costs")}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatarValor(totalCustos)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totaisPorCategoria.length} {t("active_costs")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("fixed_costs")}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarValor(totalFixos)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("monthly_commitment")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("variable_costs")}
            </CardTitle>
            <Waves className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatarValor(totalVariaveis)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("flexible_expenses")}
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

      {/* Tabela de Custos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5" />
            <span>
              {t("costs")} - {getCategoriaLabel(currentCategoria)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("description")}</TableHead>
                <TableHead>{t("monthly_value")}</TableHead>
                <TableHead>{t("type")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <div className="py-8">
                      <p className="text-muted-foreground">
                        {t("loading_costs")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : custos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <div className="py-8">
                      <p className="text-destructive">
                        {t("no_costs_registered_for_user")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                custos.map((custo) => (
                  <TableRow key={custo.id}>
                    <TableCell className="font-medium">
                      {custo.descricao}
                    </TableCell>
                    <TableCell className="text-destructive font-semibold">
                      {formatarValor(custo.valor_mensal)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={custo.flag ? "destructive" : "secondary"}>
                        {custo.flag ? t("fixed") : t("variable")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => excluirCusto(custo.id)}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getCategoriaIcon(currentCategoria)}
              <span>
                {t("register_new_cost")} - {getCategoriaLabel(currentCategoria)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Botões de Categoria */}
            <div className="flex justify-center flex-wrap gap-1">
              {[
                { key: "Moradia", icon: Home, label: t("housing") },
                { key: "Transporte", icon: Car, label: t("transport") },
                { key: "Alimentacao", icon: Coffee, label: t("food") },
                { key: "Educacao", icon: GraduationCap, label: t("education") },
                { key: "Lazer", icon: Waves, label: t("leisure") },
                { key: "Outros", icon: DollarSign, label: t("others") },
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
              <div>
                <Label htmlFor="descricao" className="text-xs">{t("description")} *</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  placeholder={t("cost_description_placeholder")}
                  className="h-8"
                />
              </div>

              <div>
                <Label htmlFor="valor_mensal" className="text-xs">{t("monthly_value")} *</Label>
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

            {/* Botões de Ação */}
            <div className="flex space-x-2">
              <Button
                onClick={cadastrarCusto}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

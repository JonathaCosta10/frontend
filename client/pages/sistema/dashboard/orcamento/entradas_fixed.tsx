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
  DollarSign,
  TrendingUp,
  Briefcase,
  HandCoins,
  Coins,
  Trash2,
  Target,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { budgetApi } from "@/services/api/budget";
import { useTranslation } from "@/contexts/TranslationContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// ========================= INTERFACES =========================
interface Entrada {
  id: number;
  descricao: string;
  valor_mensal: number;
  categoria: string;
  mes: number;
  ano: number;
  flag: boolean;
}

interface TotalPorCategoria {
  categoria: string;
  total: number;
  percentual: number;
}

interface ResumoEntradas {
  total_entradas: number;
  total_com_replicacao: number;
  total_sem_replicacao: number;
  periodo: {
    mes: string;
    ano: string;
  };
}

interface FormData {
  descricao: string;
  valor_mensal: string;
}

interface ApiResponse {
  maiores_entradas: Entrada[];
  totais_por_categoria: TotalPorCategoria[];
  resumo: ResumoEntradas;
}

// ========================= CONSTANTES =========================
// Cores para o gráfico de pizza - tons de verde para entradas
const COLORS = [
  "#16a34a", // green-600
  "#22c55e", // green-500
  "#4ade80", // green-400
  "#86efac", // green-300
  "#bbf7d0", // green-200
  "#dcfce7", // green-100
  "#15803d", // green-700
  "#166534", // green-800
];

// ========================= COMPONENTE PRINCIPAL =========================
export default function Entradas() {
  const { isAuthenticated } = useAuth();
  const { t, formatCurrency } = useTranslation();

  // ========================= ESTADOS =========================
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [totaisPorCategoria, setTotaisPorCategoria] = useState<TotalPorCategoria[]>([]);
  const [resumo, setResumo] = useState<ResumoEntradas | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentCategoria, setCurrentCategoria] = useState("Salario");
  const [formData, setFormData] = useState<FormData>({
    descricao: "",
    valor_mensal: "",
  });

  // ========================= CONFIGURAÇÕES =========================
  // Obter mês e ano do localStorage
  const mes = localStorage.getItem("mes") || String(new Date().getMonth() + 1).padStart(2, "0");
  const ano = localStorage.getItem("ano") || String(new Date().getFullYear());

  // Configuração das categorias
  const categorias = [
    { key: "Salario", icon: Briefcase, label: t("salary") },
    { key: "Freelance", icon: HandCoins, label: t("freelance") },
    { key: "Investimentos", icon: Coins, label: t("investment") },
    { key: "Outros", icon: DollarSign, label: t("other") },
  ];

  // ========================= FUNÇÕES AUXILIARES =========================
  // Função para preparar dados do gráfico
  const prepararDadosGrafico = () => {
    if (!totaisPorCategoria || totaisPorCategoria.length === 0) {
      return [];
    }

    return totaisPorCategoria.map((item, index) => ({
      name: getCategoriaLabel(item.categoria),
      value: item.total,
      percentage: item.percentual.toFixed(2),
      color: COLORS[index % COLORS.length],
    }));
  };

  // Função para obter o ícone da categoria
  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case "Salario":
        return <Briefcase className="h-4 w-4" />;
      case "Freelance":
        return <HandCoins className="h-4 w-4" />;
      case "Investimentos":
        return <Coins className="h-4 w-4" />;
      case "Outros":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  // Função para obter o label da categoria
  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case "Salario":
        return t("salary");
      case "Freelance":
        return t("freelance");
      case "Investimentos":
        return t("investment");
      case "Outros":
        return t("other");
      default:
        return categoria;
    }
  };

  // ========================= EFEITOS =========================
  useEffect(() => {
    if (isAuthenticated) {
      atualizarEntradas();
    }
  }, [currentCategoria, mes, ano, isAuthenticated]);

  // ========================= FUNÇÕES DA API =========================
  // Função para atualizar as entradas via API
  const atualizarEntradas = async () => {
    setLoading(true);

    try {
      const response: ApiResponse = await budgetApi.getMaioresEntradas(
        currentCategoria,
        mes,
        ano,
      );
      
      setEntradas(response.maiores_entradas || []);
      setTotaisPorCategoria(response.totais_por_categoria || []);
      setResumo(response.resumo || null);
    } catch (error) {
      console.error("Erro ao obter as maiores entradas:", error);
      setEntradas([]);
      setTotaisPorCategoria([]);
      setResumo(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para cadastrar uma entrada
  const cadastrarEntrada = async () => {
    if (!isAuthenticated) {
      alert(t("authentication_required"));
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
      mes: parseInt(mes),
      ano: parseInt(ano),
    };

    try {
      await budgetApi.cadastrarEntrada(data);
      alert(t("entry_registered_successfully"));
      setFormData({
        descricao: "",
        valor_mensal: "",
      });
      atualizarEntradas();
    } catch (error) {
      console.error("Erro ao cadastrar entrada:", error);
      alert(t("entry_registration_error"));
    }
  };

  // Função para excluir uma entrada
  const excluirEntrada = async (id: number) => {
    if (window.confirm(t("confirm_delete_entry"))) {
      try {
        await budgetApi.excluirEntrada(id);
        atualizarEntradas();
        alert(t("entry_deleted_successfully"));
      } catch (error) {
        console.error("Erro ao excluir entrada:", error);
        alert(t("entry_deletion_error"));
      }
    }
  };

  // ========================= FUNÇÕES DE FORMULÁRIO =========================
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

  // ========================= CÁLCULOS =========================
  const totalEntradas = resumo?.total_entradas || 0;
  const totalComReplicacao = resumo?.total_com_replicacao || 0;
  const totalSemReplicacao = resumo?.total_sem_replicacao || 0;

  // ========================= RENDER =========================
  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_income")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEntradas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totaisPorCategoria.length} {t("active_categories")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("with_replication")}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalComReplicacao)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("recurring_income")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("without_replication")}
            </CardTitle>
            <HandCoins className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalSemReplicacao)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("one_time_income")}
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

      {/* Tabela de Entradas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>
              {t("income")} - {getCategoriaLabel(currentCategoria)}
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
                        {t("loading_entries")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : entradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <div className="py-8">
                      <p className="text-green-600">
                        {t("no_entries_registered_for_user")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                entradas.map((entrada) => (
                  <TableRow key={entrada.id}>
                    <TableCell className="font-medium">
                      {entrada.descricao}
                    </TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      {formatCurrency(entrada.valor_mensal)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entrada.flag ? "default" : "secondary"}>
                        {entrada.flag ? t("recurring") : t("one_time")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => excluirEntrada(entrada.id)}
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
              <Target className="h-5 w-5 text-green-600" />
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
                Cadastrar - {getCategoriaLabel(currentCategoria)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Botões de Categoria */}
            <div className="flex justify-center flex-wrap gap-1">
              {categorias.map(({ key, icon: Icon, label }) => (
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
                  placeholder={t("entry_description_placeholder")}
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
                  placeholder="2500.00"
                  className="h-8"
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-2">
              <Button
                onClick={cadastrarEntrada}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-sm"
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

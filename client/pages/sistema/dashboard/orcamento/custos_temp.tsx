import React, { useState, useEffect, useRef } from "react";
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
  TrendingDown,
  AlertCircle,
  Home,
  DollarSign,
  Waves,
  GraduationCap,
  Coffee,
  Trash2,
  Target,
  Scale,
  CalendarIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { budgetApi } from "@/services/api/budget";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

// ========================= INTERFACES =========================
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

interface ResumoGastos {
  total_gastos: number;
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

// ========================= CONSTANTES =========================
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

// ========================= COMPONENTE PRINCIPAL =========================
export default function Custos() {
  // ========================= HOOKS =========================
  const { isAuthenticated } = useAuth();
  const { t, formatCurrency } = useTranslation();
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  // ========================= ESTADOS =========================
  const [custos, setCustos] = useState<Custo[]>([]);
  const [totaisPorCategoria, setTotaisPorCategoria] = useState<TotalPorCategoria[]>([]);
  const [resumoGastos, setResumoGastos] = useState<ResumoGastos | null>(null);
  const [currentCategoria, setCurrentCategoria] = useState("Custo Fixo");
  const [formData, setFormData] = useState<FormData>({
    descricao: "",
    valor_mensal: "",
  });
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  // ========================= EFEITOS =========================
  // Obter mês e ano do localStorage
  const mes = localStorage.getItem("mes") || String(new Date().getMonth() + 1).padStart(2, "0");
  const ano = localStorage.getItem("ano") || String(new Date().getFullYear());

  useEffect(() => {
    if (isAuthenticated) {
      carregarCustos();
    }
  }, [mes, ano, isAuthenticated]);

  // ========================= FUNÇÕES DE API =========================
  // Função para carregar os custos via API
  const carregarCustos = async () => {
    setLoading(true);
    try {
      const response = await budgetApi.getMaioresGastos("", mes, ano);
      setCustos(response.maiores_gastos || []);
      setTotaisPorCategoria(response.totais_por_categoria || []);
      setResumoGastos(response.resumo || null);
    } catch (error) {
      console.error("Erro ao obter os custos:", error);
      toast({
        title: t("error"),
        description: t("error_loading_data"),
        variant: "destructive",
      });
      setCustos([]);
      setTotaisPorCategoria([]);
      setResumoGastos(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para cadastrar um novo custo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.valor_mensal) {
      toast({
        title: t("validation_error"),
        description: t("fill_all_required_fields"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = {
        descricao: formData.descricao,
        valor_mensal: parseFloat(formData.valor_mensal),
        categoria: currentCategoria,
        mes: parseInt(mes),
        ano: parseInt(ano),
      };

      await budgetApi.cadastrarGasto(data);
      toast({
        title: t("success"),
        description: t("expense_registered_successfully"),
      });
      
      limparFormulario();
      carregarCustos();
    } catch (error) {
      console.error("Erro ao cadastrar custo:", error);
      toast({
        title: t("error"),
        description: t("error_registering_expense"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir um custo
  const excluirCusto = async (id: number) => {
    if (window.confirm(t("confirm_delete_expense"))) {
      setLoading(true);
      try {
        await budgetApi.excluirGasto(id);
        toast({
          title: t("success"),
          description: t("expense_deleted_successfully"),
        });
        carregarCustos();
      } catch (error) {
        console.error("Erro ao excluir custo:", error);
        toast({
          title: t("error"),
          description: t("error_deleting_expense"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // ========================= FUNÇÕES AUXILIARES =========================
  // Lista de categorias disponíveis
  const categorias = [
    { key: "Custo Fixo", icon: Home, label: t("fixed_cost") },
    { key: "Conforto", icon: Waves, label: t("comfort") },
    { key: "Alocação de Metas", icon: Target, label: t("goals_allocation") },
    { key: "Prazeres", icon: Coffee, label: t("pleasures") },
    { key: "Liberdade Financeira", icon: DollarSign, label: t("financial_freedom") },
    { key: "Conhecimento", icon: GraduationCap, label: t("knowledge") },
  ];

  // Função para mostrar o formulário com a categoria selecionada
  const showForm = (categoria: string) => {
    setCurrentCategoria(categoria);
    setFormVisible(true);
    limparFormulario();
  };

  // Função para obter o ícone da categoria
  const getCategoriaIcon = (categoria: string) => {
    const found = categorias.find(cat => cat.key === categoria);
    if (found) {
      const Icon = found.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Home className="h-4 w-4" />;
  };

  // Função para obter o label da categoria
  const getCategoriaLabel = (categoria: string) => {
    const found = categorias.find(cat => cat.key === categoria);
    return found ? found.label : categoria;
  };

  // Função para limpar o formulário
  const limparFormulario = () => {
    setFormData({
      descricao: "",
      valor_mensal: "",
    });
  };

  // Função para mudar a categoria ativa
  const handleCategoriaChange = (categoria: string) => {
    setCurrentCategoria(categoria);
  };

  // Função para repetir o último valor cadastrado
  const repetirUltimoValor = () => {
    if (custos.length > 0) {
      const ultimoCusto = custos[0]; // Assumindo que o primeiro da lista é o mais recente
      setFormData({
        ...formData,
        valor_mensal: ultimoCusto.valor_mensal.toString(),
      });
    }
  };

  // Função para atualizar inputs do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para preparar dados para o gráfico
  const prepararDadosGrafico = () => {
    if (!totaisPorCategoria || totaisPorCategoria.length === 0) {
      return [];
    }

    return totaisPorCategoria.map((item, index) => ({
      name: getCategoriaLabel(item.categoria),
      value: item.total,
      percentage: item.percentual,
      color: COLORS[index % COLORS.length],
    }));
  };

  // ========================= RENDER =========================
  return (
    <>
      <div className="space-y-3 md:space-y-6">
        <Toaster />
      
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("total_expenses")}
              </CardTitle>
              <Scale className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(resumoGastos?.total_gastos || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {custos.length} {t("active_expenses")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("monthly_fixed")}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(resumoGastos?.total_com_replicacao || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("monthly_commitment")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("monthly_variable")}
              </CardTitle>
              <Waves className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(resumoGastos?.total_sem_replicacao || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("one_time_expenses")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("reference_period")}
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {resumoGastos?.periodo?.mes}/{resumoGastos?.periodo?.ano}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("current_period")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de custos - Movida para cima */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {t("expenses_list")} 
              <span className="text-sm font-normal ml-2">
                ({custos.length} {t("items")})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("description")}</TableHead>
                  <TableHead>{t("value")}</TableHead>
                  <TableHead>{t("category")}</TableHead>
                  <TableHead className="w-[80px]">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <div className="py-8">
                        <p className="text-muted-foreground">
                          {t("loading_expenses")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : custos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <div className="py-8">
                        <p className="text-destructive">
                          {t("no_expenses_found")}
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
                        {formatCurrency(custo.valor_mensal)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getCategoriaIcon(custo.categoria)}
                          <span>{custo.categoria}</span>
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

        {/* Parte principal: Gráfico e Formulário */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
          {/* Gráfico de distribuição */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-destructive" />
                <span>{t("category_distribution")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t("loading_data")}
                  </p>
                </div>
              ) : totaisPorCategoria.length > 0 ? (
                <div className="h-64">
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
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {prepararDadosGrafico().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <AlertCircle className="h-16 w-16 text-muted-foreground" />
                  <p className="mt-4 text-center text-muted-foreground">
                    {t("no_expenses_found")}
                    <br />
                    {t("add_expense_to_see_chart")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulário de cadastro */}
          <Card ref={formRef}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span>{t("expense_management")}</span>
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
              
              {formVisible ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <Label htmlFor="descricao" className="text-xs">{t("description")} *</Label>
                    <Input
                      id="descricao"
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      placeholder={t("expense_description_placeholder")}
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label htmlFor="valor_mensal" className="text-xs">{t("value")} *</Label>
                    <Input
                      id="valor_mensal"
                      name="valor_mensal"
                      type="number"
                      value={formData.valor_mensal}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="h-8"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-sm"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {t("add")}
                    </Button>
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={repetirUltimoValor}
                      size="sm"
                      className="text-xs px-2 py-1"
                      disabled={custos.length === 0}
                    >
                      {t("repeat_last")}
                    </Button>
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => setFormVisible(false)}
                      size="sm"
                      className="text-xs px-2 py-1"
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col justify-center items-center h-40 space-y-4">
                  <DollarSign className="h-12 w-12 text-blue-500" />
                  <h3 className="text-lg font-medium text-center">
                    {t("manage_your_expenses")}
                  </h3>
                  <p className="text-sm text-center text-muted-foreground">
                    {t("click_new_expense_to_add")}
                  </p>
                  <Button
                    onClick={() => setFormVisible(true)}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t("new_expense")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

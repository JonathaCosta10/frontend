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
  Bell,
  Scale,
  BanknoteIcon,
  TrendingUp,
  CalendarIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { budgetApi } from "@/services/api/budget";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// ========================= INTERFACES =========================
interface Custo {
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

interface ApiResponse {
  maiores_gastos: Custo[];
  totais_por_categoria: TotalPorCategoria[];
  resumo: ResumoGastos;
}

// ========================= CONSTANTES =========================
// Cores para o gráfico de pizza - tons diversificados para custos
const COLORS = [
  "#f97316", // orange-500
  "#0891b2", // cyan-600
  "#7c3aed", // violet-600
  "#16a34a", // green-600
  "#dc2626", // red-600
  "#06b6d4", // cyan-500
  "#8b5cf6", // violet-500
  "#6366f1", // indigo-500
  "#ec4899", // pink-500
];

// ========================= COMPONENTE PRINCIPAL =========================
export default function Custos() {
  const { isAuthenticated } = useAuth();
  const { t, formatCurrency } = useTranslation();
  const { toast } = useToast();

  // ========================= ESTADOS =========================
  const [custos, setCustos] = useState<Custo[]>([]);
  const [totaisPorCategoria, setTotaisPorCategoria] = useState<TotalPorCategoria[]>([]);
  const [resumoGastos, setResumoGastos] = useState<ResumoGastos | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentCategoria, setCurrentCategoria] = useState("Custo Fixo");
  const [formVisible, setFormVisible] = useState(false);
  const formRef = React.useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>({
    descricao: "",
    valor_mensal: "",
  });
  
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

  // ========================= CONFIGURAÇÕES =========================
  // Obter mês e ano do localStorage ou usar o atual
  const mes = localStorage.getItem("mes") || String(new Date().getMonth() + 1).padStart(2, "0");
  const ano = localStorage.getItem("ano") || String(new Date().getFullYear());

  // Configuração das categorias
  const categorias = [
    { key: "Custo Fixo", icon: Home, label: "Custo Fixo" },
    { key: "Custo Variável", icon: Waves, label: "Custo Variável" },
    { key: "Transporte", icon: Car, label: "Transporte" },
    { key: "Educação", icon: GraduationCap, label: "Educação" },
    { key: "Lazer", icon: Coffee, label: "Lazer" },
  ];

  // ========================= FUNÇÕES AUXILIARES =========================
  // Função para preparar dados do gráfico
  const prepararDadosGrafico = () => {
    if (!totaisPorCategoria || totaisPorCategoria.length === 0) {
      return [];
    }

    const total = totaisPorCategoria.reduce((sum, item) => sum + item.total, 0);
    
    return totaisPorCategoria.map((item, index) => ({
      name: item.categoria,
      value: item.total,
      percentage: ((item.total / total) * 100).toFixed(2),
      color: COLORS[index % COLORS.length],
    }));
  };

  // Função para obter ícone da categoria
  const getCategoriaIcon = (categoria: string) => {
    const cat = categorias.find(c => c.key === categoria);
    if (cat) {
      const IconComponent = cat.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <DollarSign className="h-4 w-4" />;
  };

  // ========================= EFEITOS =========================
  // Carregar dados quando o componente montar
  useEffect(() => {
    if (isAuthenticated) {
      atualizarCustos();
    }
  }, [isAuthenticated, currentCategoria, mes, ano]);

  // ========================= FUNÇÕES DE API =========================
  // Buscar custos da API
  const atualizarCustos = async () => {
    setLoading(true);
    try {
      const response = await budgetApi.getMaioresGastos(
        currentCategoria,
        mes,
        ano
      );
      setCustos(response.maiores_gastos || []);
      setTotaisPorCategoria(response.totais_por_categoria || []);
      setResumoGastos(response.resumo || null);
    } catch (error) {
      console.error("Erro ao obter os maiores custos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os custos. Tente novamente.",
        variant: "destructive",
      });
      setCustos([]);
      setTotaisPorCategoria([]);
      setResumoGastos(null);
    } finally {
      setLoading(false);
    }
  };

  // Cadastrar novo custo
  const cadastrarCusto = async () => {
    try {
      // Converter valor_mensal para número
      const valorMensal = parseFloat(formData.valor_mensal.replace(",", "."));
      
      if (isNaN(valorMensal)) {
        toast({
          title: "Erro",
          description: "Por favor, informe um valor válido.",
          variant: "destructive",
        });
        return;
      }

      // Dados para cadastro
      const dadosCadastro = {
        descricao: formData.descricao,
        valor: valorMensal,
        categoria: currentCategoria,
        mes: mes,
        ano: ano
      };
      
      await budgetApi.cadastrarGasto(dadosCadastro);

      toast({
        title: "Sucesso",
        description: "Custo cadastrado com sucesso!",
        variant: "default",
      });

      // Limpar formulário e atualizar dados
      limparFormulario();
      setFormVisible(false);
      atualizarCustos();
    } catch (error) {
      console.error("Erro ao cadastrar custo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o custo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Excluir custo
  const excluirCusto = async (id: number) => {
    try {
      await budgetApi.excluirGasto(id);
      
      toast({
        title: "Sucesso",
        description: "Custo excluído com sucesso!",
        variant: "default",
      });
      
      // Atualizar dados do servidor
      atualizarCustos();
    } catch (error) {
      console.error("Erro ao excluir custo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o custo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // ========================= FUNÇÕES DE EVENTO =========================
  // Alterar categoria selecionada
  const handleCategoriaChange = (categoria: string) => {
    setCurrentCategoria(categoria);
  };

  // Alterar valores do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Lidar com envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cadastrarCusto();
  };

  // ========================= FUNÇÕES DE FORMULÁRIO =========================
  // Limpar formulário
  const limparFormulario = () => {
    setFormData({
      descricao: "",
      valor_mensal: "",
    });
  };

  // Repetir último valor
  const repetirUltimoValor = () => {
    if (custos.length > 0) {
      const ultimoCusto = custos[0]; // API já retorna ordenado
      setFormData({
        ...formData,
        valor_mensal: ultimoCusto.valor_mensal.toString(),
      });
    }
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

        {/* Parte principal: Gráfico e Formulário */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          {/* Gráfico de distribuição */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("category_distribution")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-80">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t("loading_data")}
                  </p>
                </div>
              ) : totaisPorCategoria.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepararDadosGrafico()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
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
                <div className="flex flex-col items-center justify-center h-80">
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">
                {formVisible ? t("new_expense") : t("expense_management")}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFormVisible(!formVisible)}
              >
                {formVisible ? (
                  t("cancel")
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    {t("new_expense")}
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {formVisible ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Categoria */}
                  <div className="space-y-1">
                    <Label className="text-xs">{t("category")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {categorias.map((categoria) => (
                        <Badge
                          key={categoria.key}
                          variant={currentCategoria === categoria.key ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleCategoriaChange(categoria.key)}
                        >
                          <categoria.icon className="h-3 w-3 mr-1" />
                          <span>{categoria.label}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Campos do formulário */}
                  <div className="space-y-3">
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
                  </div>

                  {/* Botões de ação */}
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
                      onClick={limparFormulario}
                      size="sm"
                      className="text-xs px-2 py-1"
                    >
                      {t("clear_form")}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col justify-center items-center h-64 space-y-4">
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
        
        {/* Tabela de custos */}
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
      </div>
    </>
  );
}

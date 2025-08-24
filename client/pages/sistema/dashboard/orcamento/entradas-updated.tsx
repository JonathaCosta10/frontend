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
  TrendingUp,
  DollarSign,
  Briefcase,
  GraduationCap,
  Gift,
  CreditCard,
  Heart,
  MessageCircle,
  Star,
  Target,
  Trash2,
  Repeat,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { budgetApi } from "@/services/api/budget";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import CompactLegend from "@/components/ui/CompactLegend";
import useFormRepeat from "@/hooks/useFormRepeat";
import { FORM_STORAGE_KEYS } from "@/utils/formRepeat";
import { categoryColors } from "@/utils/colors";
import { incomeTypeMap } from "@/utils/mappings";

interface Entrada {
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

export default function Entradas() {
  const { isAuthenticated } = useAuth();
  const { t, formatCurrency } = useTranslation();
  const { toast } = useToast();
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [totaisPorCategoria, setTotaisPorCategoria] = useState<TotalPorCategoria[]>([]);
  const [resumoEntradas, setResumoEntradas] = useState<ResumoEntradas | null>(null);
  const [currentCategoria, setCurrentCategoria] = useState("Salário");
  const [formData, setFormData] = useState<FormData>({
    descricao: "",
    valor_mensal: "",
  });
  const [loading, setLoading] = useState(false);
  
  // Hook para gerenciar repetição de formulários
  const { saveValues, applyLastValues } = useFormRepeat<FormData>(FORM_STORAGE_KEYS.ENTRADAS);

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
      atualizarEntradas();
    }
  }, [currentCategoria, mes, ano, isAuthenticated]);

  // Função para atualizar as entradas via API
  const atualizarEntradas = async () => {
    setLoading(true);

    try {
      const response = await budgetApi.getMaioresEntradas(
        currentCategoria,
        mes,
        ano,
      );
      setEntradas(response.maiores_entradas || []);
      setTotaisPorCategoria(response.totais_por_categoria || []);
      setResumoEntradas(response.resumo || null);
    } catch (error) {
      console.error("Erro ao obter as maiores entradas:", error);
      setEntradas([]);
      setTotaisPorCategoria([]);
      setResumoEntradas(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para cadastrar uma entrada
  const cadastrarEntrada = async () => {
    if (!isAuthenticated) {
      toast({
        title: t("authentication_required_income"),
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
      // Se o tipo for "Salário", força flag = true
      flag: currentCategoria === "Salário",
      mes: parseInt(mes),
      ano: parseInt(ano),
    };

    try {
      // Salvar dados do formulário para repetição futura
      saveValues(formData);
      
      // Atualização otimista para melhorar UX
      const newEntrada = {
        id: Date.now(), // ID temporário
        ...data,
        flag: currentCategoria === "Salário",
      };
      
      setEntradas(prev => [newEntrada, ...prev]);
      
      await budgetApi.cadastrarEntrada(data);
      
      toast({
        title: t("income_registered_successfully"),
        variant: "default",
      });
      
      setFormData({
        descricao: "",
        valor_mensal: "",
      });
      
      // Atualizar dados após o cadastro
      atualizarEntradas();
    } catch (error) {
      console.error("Erro ao cadastrar entrada:", error);
      toast({
        title: t("income_registration_error"),
        description: error.message || t("unexpected_error"),
        variant: "destructive",
      });
      // Reverter atualização otimista em caso de erro
      atualizarEntradas();
    }
  };

  // Função para excluir uma entrada
  const excluirEntrada = async (id: number) => {
    if (window.confirm(t("confirm_delete_income"))) {
      try {
        // Atualização otimista
        setEntradas(prev => prev.filter(item => item.id !== id));
        
        await budgetApi.excluirEntrada(id);
        
        toast({
          title: t("income_deleted_successfully"),
          variant: "default",
        });
      } catch (error) {
        console.error("Erro ao excluir entrada:", error);
        toast({
          title: t("income_deletion_error"),
          variant: "destructive",
        });
        // Reverter atualização otimista em caso de erro
        atualizarEntradas();
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

  // Função para atualizar flag de repetição
  const atualizarFlagEntrada = async (id: number, novaFlag: boolean) => {
    if (!isAuthenticated) {
      toast({
        title: t("authentication_required"),
        variant: "destructive",
      });
      return;
    }

    const dadosAtualizados = {
      flag: novaFlag,
    };

    try {
      // Atualização otimista
      setEntradas(prev => prev.map(item => 
        item.id === id ? { ...item, flag: novaFlag } : item
      ));
      
      await budgetApi.atualizarFlagEntrada(id, dadosAtualizados);
    } catch (error) {
      console.error("Erro ao atualizar flag da entrada:", error);
      toast({
        title: t("flag_update_error"),
        description: error.message || t("unexpected_error"),
        variant: "destructive",
      });
      // Reverter atualização otimista em caso de erro
      atualizarEntradas();
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
      case "Salário":
        return <Briefcase className="h-4 w-4" />;
      case "Freelance":
        return <CreditCard className="h-4 w-4" />;
      case "Investimentos":
        return <TrendingUp className="h-4 w-4" />;
      case "Bolsa":
        return <GraduationCap className="h-4 w-4" />;
      case "Presente":
        return <Gift className="h-4 w-4" />;
      case "Doação":
        return <Heart className="h-4 w-4" />;
      case "Outros":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  // Função para obter a cor da categoria
  const getCategoriaColor = (categoria: string): string => {
    const categoriaMapping = {
      "Salário": "salario",
      "Freelance": "freelance", 
      "Investimentos": "investimentos",
      "Bolsa": "bolsa",
      "Presente": "presente",
      "Doação": "doacao",
      "Outros": "outros_entradas"
    };
    
    const mappedKey = categoriaMapping[categoria];
    if (mappedKey && categoryColors[mappedKey]) {
      return categoryColors[mappedKey];
    }
    
    switch (categoria) {
      case "Salário":
        return "#4CAF50";
      case "Freelance":
        return "#9C27B0";
      case "Investimentos":
        return "#2196F3";
      case "Bolsa":
        return "#FFC107";
      case "Presente":
        return "#FF5722";
      case "Doação":
        return "#E91E63";
      case "Outros":
        return "#607D8B";
      default:
        return "#9E9E9E";
    }
  };

  // Função para obter o label da categoria
  const getCategoriaLabel = (categoria: string) => {
    const categoriaMapping = {
      "Salário": "salario",
      "Freelance": "freelance", 
      "Investimentos": "investimentos",
      "Bolsa": "bolsa",
      "Presente": "presente",
      "Doação": "doacao",
      "Outros": "outros"
    };
    
    // Usar o mapeamento centralizado ou fallback para tradução direta
    const mappedKey = categoriaMapping[categoria];
    if (mappedKey && incomeTypeMap[mappedKey]) {
      return incomeTypeMap[mappedKey];
    }
    
    switch (categoria) {
      case "Salário":
        return t("salary");
      case "Freelance":
        return t("freelance");
      case "Investimentos":
        return t("investments");
      case "Bolsa":
        return t("scholarship");
      case "Presente":
        return t("gift");
      case "Doação":
        return t("donation");
      case "Outros":
        return t("others");
      default:
        return categoria;
    }
  };

  // Calcular totais usando os dados do resumo da API
  const totalEntradas = resumoEntradas?.total_entradas || 0;
  const totalFixas = resumoEntradas?.total_com_replicacao || 0;
  const totalVariaveis = resumoEntradas?.total_sem_replicacao || 0;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_income")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatarValor(totalEntradas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("income_for_month")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("fixed_income")}
            </CardTitle>
            <Star className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarValor(totalFixas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("recurring_income")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("variable_income")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarValor(totalVariaveis)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("non_recurring_income")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Entradas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
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
                <TableHead>{t("recurring")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <div className="py-8">
                      <p className="text-muted-foreground">
                        {t("loading_income")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : entradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <div className="py-8">
                      <p className="text-muted-foreground">
                        {t("no_income_registered_for_user")}
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
                    <TableCell>{formatarValor(entrada.valor_mensal)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={entrada.flag}
                        onCheckedChange={(checked) =>
                          atualizarFlagEntrada(entrada.id, checked)
                        }
                        disabled={currentCategoria === "Salário"}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => excluirEntrada(entrada.id)}
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
                {t("register")} - {getCategoriaLabel(currentCategoria)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Botões de Categoria */}
            <div className="flex justify-center flex-wrap gap-1">
              {[
                { key: "Salário", icon: Briefcase, label: t("salary") },
                { key: "Freelance", icon: CreditCard, label: t("freelance") },
                { key: "Investimentos", icon: TrendingUp, label: t("investments") },
                { key: "Bolsa", icon: GraduationCap, label: t("scholarship") },
                { key: "Presente", icon: Gift, label: t("gift") },
                { key: "Doação", icon: Heart, label: t("donation") },
                { key: "Outros", icon: MessageCircle, label: t("others") },
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
            <div className="space-y-4">
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
                  placeholder={t("income_description_placeholder")}
                  className="h-9 mt-1"
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
                  placeholder="3500.00"
                  className="h-9 mt-1"
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-2 pt-2">
              <Button
                onClick={cadastrarEntrada}
                disabled={loading}
                className="text-white h-9"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t("register")}
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

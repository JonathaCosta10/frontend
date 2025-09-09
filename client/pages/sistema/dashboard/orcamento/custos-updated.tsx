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
  Bell,
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
import { costTypeMap } from "@/utils/mappings";

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

export default function Custos() {
  const { isAuthenticated } = useAuth();
  const { t, formatCurrency } = useTranslation();
  const { toast } = useToast();
  const [custos, setCustos] = useState<Custo[]>([]);
  const [totaisPorCategoria, setTotaisPorCategoria] = useState<TotalPorCategoria[]>([]);
  const [resumoGastos, setResumoGastos] = useState<ResumoGastos | null>(null);
  const [currentCategoria, setCurrentCategoria] = useState("Custo Fixo");
  const [formVisible, setFormVisible] = useState(true);
  const formRef = React.useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>({
    descricao: "",
    valor_mensal: "",
  });
  const [loading, setLoading] = useState(false);
  
  // Hook para detectar cliques fora do formulário
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        // Se o usuário clicou fora do formulário e havia dados preenchidos, mostrar confirmação
        if (formData.descricao || formData.valor_mensal) {
          const confirmClose = window.confirm("Deseja descartar os dados do formulário?");
          if (confirmClose) {
            setFormData({
              descricao: "",
              valor_mensal: "",
            });
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
  
  // Hook para gerenciar repetição de formulários
  const { saveValues, applyLastValues } = useFormRepeat<FormData>(FORM_STORAGE_KEYS.CUSTOS);

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
      setResumoGastos(response.resumo || null);
    } catch (error) {
      console.error("Erro ao obter os maiores custos:", error);
      setCustos([]);
      setTotaisPorCategoria([]);
      setResumoGastos(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para cadastrar um custo
  const cadastrarCusto = async () => {
    if (!isAuthenticated) {
      toast({
        title: t("authentication_required_cost"),
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
      // Se o tipo for "Custo Fixo", força flag = true
      flag: currentCategoria === "Custo Fixo",
      mes: parseInt(mes),
      ano: parseInt(ano),
    };

    try {
      // Salvar dados do formulário para repetição futura
      saveValues(formData);
      
      // Atualização otimista para melhorar UX
      const newCusto = {
        id: Date.now(), // ID temporário
        ...data,
        flag: currentCategoria === "Custo Fixo",
      };
      
      setCustos(prev => [newCusto, ...prev]);
      
      await budgetApi.cadastrarGasto(data);
      
      toast({
        title: "Sucesso!",
        description: `${getCategoriaLabel(currentCategoria)} cadastrado com sucesso.`,
        variant: "default",
        duration: 3000,
      });
      
      setFormData({
        descricao: "",
        valor_mensal: "",
      });
      
      // Atualizar dados após o cadastro
      atualizarCustos();
    } catch (error) {
      console.error("Erro ao cadastrar custo:", error);
      toast({
        title: t("cost_registration_error"),
        description: error.message || t("unexpected_error"),
        variant: "destructive",
      });
      // Reverter atualização otimista em caso de erro
      atualizarCustos();
    }
  };

  // Função para excluir um custo
  const excluirCusto = async (id: number) => {
    if (window.confirm(t("confirm_delete_cost"))) {
      try {
        // Atualização otimista
        setCustos(prev => prev.filter(item => item.id !== id));
        
        await budgetApi.excluirGasto(id);
        
        toast({
          title: t("cost_deleted_successfully"),
          variant: "default",
        });
      } catch (error) {
        console.error("Erro ao excluir custo:", error);
        toast({
          title: t("cost_deletion_error"),
          variant: "destructive",
        });
        // Reverter atualização otimista em caso de erro
        atualizarCustos();
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
  const atualizarFlagCusto = async (id: number, novaFlag: boolean) => {
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
      setCustos(prev => prev.map(item => 
        item.id === id ? { ...item, flag: novaFlag } : item
      ));
      
      await budgetApi.atualizarFlagCusto(id, dadosAtualizados);
    } catch (error) {
      console.error("Erro ao atualizar flag do custo:", error);
      toast({
        title: t("flag_update_error"),
        description: error.message || t("unexpected_error"),
        variant: "destructive",
      });
      // Reverter atualização otimista em caso de erro
      atualizarCustos();
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
      case "Outros":
        return <DollarSign className="h-4 w-4" />;
      case "Conforto":
        return <Waves className="h-4 w-4" />;
      case "Educacao":
        return <GraduationCap className="h-4 w-4" />;
      case "Custo Fixo":
        return <Bell className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  // Função para obter a cor da categoria
  const getCategoriaColor = (categoria: string): string => {
    const categoriaMapping = {
      "Moradia": "moradia",
      "Transporte": "transporte", 
      "Alimentacao": "alimentacao",
      "Outros": "outros",
      "Conforto": "lazer",
      "Educacao": "educacao",
      "Custo Fixo": "assinaturas"
    };
    
    const mappedKey = categoriaMapping[categoria];
    if (mappedKey && categoryColors[mappedKey]) {
      return categoryColors[mappedKey];
    }
    
    switch (categoria) {
      case "Moradia":
        return "#FF8A80";
      case "Transporte":
        return "#B9F6CA";
      case "Alimentacao":
        return "#82B1FF";
      case "Outros":
        return "#CCCCCC";
      case "Conforto":
        return "#FFFF8D";
      case "Educacao":
        return "#B388FF";
      case "Custo Fixo":
        return "#EA80FC";
      default:
        return "#CCCCCC";
    }
  };

  // Função para obter o label da categoria
  const getCategoriaLabel = (categoria: string) => {
    const categoriaMapping = {
      "Moradia": "moradia",
      "Transporte": "transporte", 
      "Alimentacao": "alimentacao",
      "Outros": "outros",
      "Conforto": "lazer",
      "Educacao": "educacao",
      "Custo Fixo": "assinaturas"
    };
    
    // Usar o mapeamento centralizado ou fallback para tradução direta
    const mappedKey = categoriaMapping[categoria];
    if (mappedKey && costTypeMap[mappedKey]) {
      return costTypeMap[mappedKey];
    }
    
    switch (categoria) {
      case "Moradia":
        return t("housing");
      case "Transporte":
        return t("transportation");
      case "Alimentacao":
        return t("food");
      case "Outros":
        return t("others");
      case "Conforto":
        return t("comfort");
      case "Educacao":
        return t("education");
      case "Custo Fixo":
        return t("fixed_cost");
      default:
        return categoria;
    }
  };

  // Calcular totais usando os dados do resumo da API
  const totalGastos = resumoGastos?.total_gastos || 0;
  const totalFixos = resumoGastos?.total_com_replicacao || 0;
  const totalVariaveis = resumoGastos?.total_sem_replicacao || 0;

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
              {t("total_expenses")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatarValor(totalGastos)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("expenses_for_month")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("fixed_costs")}
            </CardTitle>
            <Bell className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarValor(totalFixos)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("recurring_costs")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("variable_costs")}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarValor(totalVariaveis)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("non_recurring_costs")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Custos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>
              {t("expenses")} - {getCategoriaLabel(currentCategoria)}
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
                        {t("loading_costs")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : custos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <div className="py-8">
                      <p className="text-muted-foreground">
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
                    <TableCell>{formatarValor(custo.valor_mensal)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={custo.flag}
                        onCheckedChange={(checked) =>
                          atualizarFlagCusto(custo.id, checked)
                        }
                        disabled={currentCategoria === "Custo Fixo"}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => excluirCusto(custo.id)}
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
                { key: "Moradia", icon: Home, label: t("housing") },
                { key: "Transporte", icon: Car, label: t("transportation") },
                { key: "Alimentacao", icon: Coffee, label: t("food") },
                { key: "Educacao", icon: GraduationCap, label: t("education") },
                { key: "Conforto", icon: Waves, label: t("comfort") },
                { key: "Custo Fixo", icon: Bell, label: t("fixed_cost") },
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
                  placeholder={t("expense_description_placeholder")}
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
                  placeholder="450.00"
                  className="h-9 mt-1"
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-2 pt-2">
              <Button
                onClick={cadastrarCusto}
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

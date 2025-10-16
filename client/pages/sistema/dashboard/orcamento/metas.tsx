import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Sparkles,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { useToast } from "@/hooks/use-toast";
import { budgetApi } from "@/services/api/budget";
import PremiumStatusTestSimulator from "@/components/PremiumStatusTestSimulator";
// Optimized Chart.js import - import all components needed for doughnut charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  DoughnutController,
  Title,
  Tooltip,
  Legend
);

// Register only the components we need
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Meta {
  id: number;
  titulo_da_meta: string;
  descricao: string;
  valor_alvo: string | number; // API pode retornar string
  valor_hoje: string | number; // API pode retornar string
  data_limite: string;
  categoria: string;
}

interface ResumoMetas {
  total_economizado: number;
  metas_totais: number;
  metas_ativas: number;
  metas_concluidas: number;
  progresso_geral: number;
}

interface SliderValues {
  custoFixo: number;
  conforto: number;
  metas: number;
  prazeres: number;
  liberdadeFinanceira: number;
  conhecimento: number;
}

export default function Metas() {
  const { isAuthenticated } = useAuth();
  const { t, formatCurrency } = useTranslation();
  const { formatValue, shouldHideCharts } = usePrivacy();
  const { toast } = useToast();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [resumoMetas, setResumoMetas] = useState<ResumoMetas | null>(null);
  const [isNovaMetaOpen, setIsNovaMetaOpen] = useState(false);
  const [isEditMetaOpen, setIsEditMetaOpen] = useState(false);
  const [isAtualizarValorOpen, setIsAtualizarValorOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [metaParaAtualizar, setMetaParaAtualizar] = useState<Meta | null>(null);
  const [novoValor, setNovoValor] = useState("");
  const [tipoOperacao, setTipoOperacao] = useState<"adicionar" | "substituir">("adicionar");
  const [novaMeta, setNovaMeta] = useState({
    titulo_da_meta: "",
    descricao: "",
    valor_alvo: "",
    data_limite: "",
    categoria: "",
  });
  const [editMeta, setEditMeta] = useState({
    titulo_da_meta: "",
    descricao: "",
    valor_alvo: "",
    valor_hoje: "",
    data_limite: "",
    categoria: "",
  });
  const [sliderValues, setSliderValues] = useState<SliderValues>({
    custoFixo: 0,
    conforto: 0,
    metas: 0,
    prazeres: 0,
    liberdadeFinanceira: 0,
    conhecimento: 0,
  });
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  // Obter mês e ano do localStorage
  const mes =
    localStorage.getItem("mes") ||
    String(new Date().getMonth() + 1).padStart(2, "0");
  const ano = localStorage.getItem("ano") || String(new Date().getFullYear());

  useEffect(() => {
    if (isAuthenticated) {
      loadMetas();
      loadOrcamentoDomestico();
    }
  }, [isAuthenticated]);

  // Carregar metas da API
  const loadMetas = async () => {
    setLoading(true);
    try {
      const response = await budgetApi.getMetasPersonalizadas();
      setMetas(response.cadastros || []);
      setResumoMetas(response.resumo || null);
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
      setMetas([]);
      setResumoMetas(null);
    } finally {
      setLoading(false);
    }
  };
  const loadOrcamentoDomestico = async () => {
    try {
      const response = await budgetApi.getOrcamentoDomestico();

      // Converter percentuais para valores dos sliders (0-100)
      setSliderValues({
        custoFixo: Math.round((response.custos_fixos || 0) * 100),
        conforto: Math.round((response.conforto || 0) * 100),
        metas: Math.round((response.metas || 0) * 100),
        prazeres: Math.round((response.prazer || 0) * 100),
        liberdadeFinanceira: Math.round((response.liberdade_financeira || 0) * 100),
        conhecimento: Math.round((response.conhecimento || 0) * 100),
      });

      // Calcular total
      const totalPercent = Object.values({
        custoFixo: Math.round((response.custos_fixos || 0) * 100),
        conforto: Math.round((response.conforto || 0) * 100),
        metas: Math.round((response.metas || 0) * 100),
        prazeres: Math.round((response.prazer || 0) * 100),
        liberdadeFinanceira: Math.round((response.liberdade_financeira || 0) * 100),
        conhecimento: Math.round((response.conhecimento || 0) * 100),
      }).reduce((acc, curr) => acc + curr, 0);

      setTotal(totalPercent);
    } catch (error) {
      console.error("Erro ao carregar orçamento doméstico:", error);
    }
  };

  // Função para lidar com mudanças nos sliders
  const handleSliderChange = (name: keyof SliderValues, value: number[]) => {
    const newValues = { ...sliderValues, [name]: value[0] };
    const total = Object.values(newValues).reduce((acc, curr) => acc + curr, 0);

    if (total > 100) {
      setError(t("percentage_complete_allocation"));
    } else {
      setError("");
      setSliderValues(newValues);
      setTotal(total);
    }
  };

  // Função para inicializar edição de meta
  const handleEditMeta = (meta: Meta) => {
    setEditingMeta(meta);
    setEditMeta({
      titulo_da_meta: meta.titulo_da_meta,
      descricao: meta.descricao,
      valor_alvo: meta.valor_alvo.toString(),
      valor_hoje: meta.valor_hoje.toString(),
      data_limite: meta.data_limite,
      categoria: meta.categoria,
    });
    setIsEditMetaOpen(true);
  };

  // Função para salvar edição de meta
  const salvarEdicaoMeta = async () => {
    if (!editingMeta || !isAuthenticated) {
      console.error("Meta não selecionada ou usuário não autenticado");
      return;
    }

    if (
      !editMeta.titulo_da_meta ||
      !editMeta.valor_alvo ||
      !editMeta.data_limite ||
      !editMeta.categoria
    ) {
      alert(t("fill_required_fields"));
      return;
    }

    try {
      setLoading(true);
      
      const metaAtualizada = {
        titulo_da_meta: editMeta.titulo_da_meta,
        descricao: editMeta.descricao,
        valor_alvo: parseFloat(editMeta.valor_alvo),
        valor_hoje: parseFloat(editMeta.valor_hoje),
        data_limite: editMeta.data_limite,
        categoria: editMeta.categoria,
      };

      // Enviar para API
      await budgetApi.atualizarMeta(editingMeta.id, metaAtualizada);

      // Recarregar metas após atualizar
      await loadMetas();

      // Limpar formulário e fechar modal
      setEditMeta({
        titulo_da_meta: "",
        descricao: "",
        valor_alvo: "",
        valor_hoje: "",
        data_limite: "",
        categoria: "",
      });
      setEditingMeta(null);
      setIsEditMetaOpen(false);

      console.log(t("goal_updated_successfully"));
    } catch (error) {
      console.error("Erro ao editar meta:", error);
      alert(t("error_updating_goal"));
    } finally {
      setLoading(false);
    }
  };

  // Função para criar nova meta
  const criarNovaMeta = async () => {
    if (!isAuthenticated) {
      console.error("Usuário não autenticado");
      return;
    }

    if (
      !novaMeta.titulo_da_meta ||
      !novaMeta.valor_alvo ||
      !novaMeta.data_limite ||
      !novaMeta.categoria
    ) {
      alert(t("fill_required_fields"));
      return;
    }

    try {
      setLoading(true);
      
      const novaMetaData = {
        titulo_da_meta: novaMeta.titulo_da_meta,
        descricao: novaMeta.descricao,
        valor_alvo: parseFloat(novaMeta.valor_alvo),
        valor_hoje: 0,
        data_limite: novaMeta.data_limite,
        categoria: novaMeta.categoria,
      };

      // Enviar para API
      await budgetApi.cadastrarMeta(novaMetaData);

      // Recarregar metas após cadastrar
      await loadMetas();

      // Limpar formulário e fechar modal
      setNovaMeta({
        titulo_da_meta: "",
        descricao: "",
        valor_alvo: "",
        data_limite: "",
        categoria: "",
      });
      setIsNovaMetaOpen(false);

      console.log(t("goal_created_successfully"));
    } catch (error) {
      console.error("Erro ao criar meta:", error);
      alert(t("error_creating_goal"));
    } finally {
      setLoading(false);
    }
  };

  // Função para criar template de Reserva de Emergência
  const criarTemplateEmergencia = async () => {
    if (!isAuthenticated) {
      console.error("Usuário não autenticado");
      return;
    }

    try {
      setLoading(true);
      
      const dataLimite = new Date();
      dataLimite.setFullYear(dataLimite.getFullYear() + 1);
      const dataLimiteFormatted = dataLimite.toISOString().split('T')[0];

      const metaEmergencia = {
        titulo_da_meta: "Reserva de Emergência",
        descricao: "Dinheiro para usar em emergencia, o ideal é que seja de 6 a 12x o seu custo mensal (Considerando dividas e gastos).",
        valor_alvo: 15000,
        valor_hoje: 0,
        data_limite: dataLimiteFormatted,
        categoria: "emergency_reserve",
      };

      // Enviar para API
      await budgetApi.cadastrarMeta(metaEmergencia);

      // Recarregar metas após cadastrar
      await loadMetas();

      toast({
        title: "Template adicionado",
        description: "Reserva de Emergência criada com sucesso.",
      });

      console.log("Template de Reserva de Emergência criado com sucesso");
    } catch (error) {
      console.error("Erro ao criar template de emergência:", error);
      toast({
        title: "Erro",
        variant: "destructive",
        description: "Não foi possível criar a Reserva de Emergência.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir meta
  const excluirMeta = async (meta: Meta) => {
    if (!isAuthenticated) {
      console.error("Usuário não autenticado");
      return;
    }

    const confirmacao = confirm(
      `${t("confirm_delete_goal")} "${meta.titulo_da_meta}"?`
    );
    
    if (!confirmacao) return;

    try {
      setLoading(true);
      
      // Enviar para API
      await budgetApi.excluirMeta(meta.id);

      // Recarregar metas após excluir
      await loadMetas();

      console.log(t("goal_deleted_successfully"));
    } catch (error) {
      console.error("Erro ao excluir meta:", error);
      alert(t("error_deleting_goal"));
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir modal de atualizar valor
  const handleAtualizarValor = (meta: Meta) => {
    setMetaParaAtualizar(meta);
    setNovoValor("");
    setTipoOperacao("adicionar");
    setIsAtualizarValorOpen(true);
  };

  // Função para atualizar valor da meta
  const atualizarValorMeta = async () => {
    if (!metaParaAtualizar || !isAuthenticated || !novoValor) {
      alert(t("fill_required_fields"));
      return;
    }

    try {
      setLoading(true);
      
      const valorNovo = parseFloat(novoValor);

      // Enviar para API com operation_type
      await budgetApi.atualizarValorMeta(metaParaAtualizar.id, tipoOperacao, valorNovo);

      // Recarregar metas após atualizar
      await loadMetas();

      // Limpar formulário e fechar modal
      setNovoValor("");
      setMetaParaAtualizar(null);
      setIsAtualizarValorOpen(false);

      console.log(t("goal_value_updated_successfully"));
    } catch (error) {
      console.error("Erro ao atualizar valor da meta:", error);
      alert(t("error_updating_goal_value"));
    } finally {
      setLoading(false);
    }
  };

  // Função para enviar alocação de metas
  const enviarAlocacaoMetas = async () => {
    if (!isAuthenticated) {
      console.error(t("user_not_authenticated"));
      return;
    }

    setLoading(true);

    const payload = {
      custos_fixos: (sliderValues.custoFixo / 100).toFixed(2),
      prazer: (sliderValues.prazeres / 100).toFixed(2),
      conforto: (sliderValues.conforto / 100).toFixed(2),
      metas: (sliderValues.metas / 100).toFixed(2),
      liberdade_financeira: (sliderValues.liberdadeFinanceira / 100).toFixed(2),
      conhecimento: (sliderValues.conhecimento / 100).toFixed(2),
    };

    try {
      const response = await budgetApi.cadastrarOrcamentoDomestico(payload);

      alert(t("goal_allocation_success"));
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert(t("server_connection_error"));
    } finally {
      setLoading(false);
    }
  };

  // Criar gráfico Chart.js
  useEffect(() => {
    if (chartRef.current) {
      // Destruir gráfico anterior se existir
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        chartInstance.current = new ChartJS(ctx, {
          type: "doughnut",
          data: {
            labels: [
              t("fixed_cost"),
              t("comfort"),
              t("goals_allocation"),
              t("pleasures"),
              t("financial_freedom"),
              t("knowledge"),
            ],
            datasets: [
              {
                label: t("goal_distribution"),
                data: [
                  sliderValues.custoFixo,
                  sliderValues.conforto,
                  sliderValues.metas,
                  sliderValues.prazeres,
                  sliderValues.liberdadeFinanceira,
                  sliderValues.conhecimento,
                ],
                backgroundColor: [
                  "#E6E6FA",
                  "#EE82EE",
                  "#9370DB",
                  "#00BFFF",
                  "#00FA9A",
                  "#FF6347",
                ],
                borderWidth: 2,
                borderColor: "#ffffff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 20,
                  usePointStyle: true,
                },
              },
            },
          },
        });
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [sliderValues, t]);

  // Usar dados do resumo da API ao invés de calcular localmente
  const metasAtivas = resumoMetas?.metas_ativas || 0;
  const metasConcluidas = resumoMetas?.metas_concluidas || 0;
  const totalEconomizado = resumoMetas?.total_economizado || 0;
  const totalObjetivos = metas.reduce((sum, meta) => sum + parseFloat(meta.valor_alvo.toString()), 0);

  const getProgressoGeral = () => {
    return resumoMetas?.progresso_geral || 0;
  };

  const getDiasRestantes = (prazo: string) => {
    const hoje = new Date();
    const dataPrazo = new Date(prazo);
    const diffTime = dataPrazo.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusPrazo = (prazo: string) => {
    const dias = getDiasRestantes(prazo);
    if (dias < 0) return { status: t("overdue"), color: "destructive" };
    if (dias <= 30) return { status: t("urgent"), color: "destructive" };
    if (dias <= 90) return { status: t("upcoming"), color: "default" };
    return { status: t("normal"), color: "secondary" };
  };

  return (
    <div className="space-y-6">
      {/* Simulador de Status Premium - APENAS PARA DEBUG */}
      {process.env.NODE_ENV === 'development' && (
        <PremiumStatusTestSimulator />
      )}
      
      {/* Cards de Resumo */}
      {!shouldHideCharts() && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("total_saved")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatValue(totalEconomizado)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("of_total")} {formatValue(totalObjetivos)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("active_goals")}
              </CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metasAtivas}</div>
              <p className="text-xs text-muted-foreground">
                {metas.length} {t("total_goals")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("completed_goals")}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metasConcluidas}</div>
              <p className="text-xs text-muted-foreground">
                {metasConcluidas > 0 && metas.length > 0
                  ? `${((metasConcluidas / metas.length) * 100).toFixed(0)}% ${t("completed").toLowerCase()}`
                  : t("none_completed")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("general_progress")}
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getProgressoGeral().toFixed(1)}%
              </div>
              <Progress value={getProgressoGeral()} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alocação de Metas - Gráfico e Sliders */}
      {!shouldHideCharts() && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>{t("goal_distribution")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {error}
                </p>
              </div>
            )}
            <div className="relative h-80">
              {shouldHideCharts() ? (
                <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-center space-y-2">
                    <EyeOff className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-gray-500 text-sm">Gráfico oculto</p>
                  </div>
                </div>
              ) : (
                <canvas ref={chartRef} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sliders de Alocação */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {t("goal_allocation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              {
                name: "custoFixo" as keyof SliderValues,
                label: t("fixed_cost"),
                color: "#E6E6FA",
              },
              {
                name: "conforto" as keyof SliderValues,
                label: t("comfort"),
                color: "#EE82EE",
              },
              {
                name: "metas" as keyof SliderValues,
                label: t("goals_allocation"),
                color: "#9370DB",
              },
              {
                name: "prazeres" as keyof SliderValues,
                label: t("pleasures"),
                color: "#00BFFF",
              },
              {
                name: "liberdadeFinanceira" as keyof SliderValues,
                label: t("financial_freedom"),
                color: "#00FA9A",
              },
              {
                name: "conhecimento" as keyof SliderValues,
                label: t("knowledge"),
                color: "#FF6347",
              },
            ].map(({ name, label, color }) => (
              <div key={name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: color }}
                    />
                    {label}
                  </Label>
                  <span className="text-sm font-semibold">
                    {sliderValues[name]}%
                  </span>
                </div>
                <Slider
                  value={[sliderValues[name]]}
                  onValueChange={(value) => handleSliderChange(name, value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">{t("total")}:</span>
                <span
                  className={`text-lg font-bold ${total > 100 ? "text-destructive" : "text-primary"}`}
                >
                  {total}%
                </span>
              </div>
              <Button
                onClick={enviarAlocacaoMetas}
                disabled={total > 100 || loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? t("updating") : t("update_allocation")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Botão Adicionar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("my_financial_goals")}</h2>
        <Dialog open={isNovaMetaOpen} onOpenChange={setIsNovaMetaOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{t("new_goal")}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("create_new_goal")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">{t("goal_title_required")}</Label>
                <Input
                  id="titulo"
                  value={novaMeta.titulo_da_meta}
                  onChange={(e) =>
                    setNovaMeta((prev) => ({ ...prev, titulo_da_meta: e.target.value }))
                  }
                  placeholder={t("goal_title_placeholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">{t("goal_description")}</Label>
                <Textarea
                  id="descricao"
                  value={novaMeta.descricao}
                  onChange={(e) =>
                    setNovaMeta((prev) => ({
                      ...prev,
                      descricao: e.target.value,
                    }))
                  }
                  placeholder={t("goal_description_placeholder")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorAlvo">{t("target_value_required")}</Label>
                <Input
                  id="valorAlvo"
                  type="number"
                  value={novaMeta.valor_alvo}
                  onChange={(e) =>
                    setNovaMeta((prev) => ({
                      ...prev,
                      valor_alvo: e.target.value,
                    }))
                  }
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prazo">{t("deadline_required")}</Label>
                <Input
                  id="prazo"
                  type="date"
                  value={novaMeta.data_limite}
                  onChange={(e) =>
                    setNovaMeta((prev) => ({ ...prev, data_limite: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">{t("category_required")}</Label>
                <Select
                  value={novaMeta.categoria}
                  onValueChange={(value) =>
                    setNovaMeta((prev) => ({ ...prev, categoria: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency_reserve">{t("emergency_reserve")}</SelectItem>
                    <SelectItem value="leisure">{t("leisure")}</SelectItem>
                    <SelectItem value="education">{t("education")}</SelectItem>
                    <SelectItem value="housing">{t("housing")}</SelectItem>
                    <SelectItem value="others">{t("others")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsNovaMetaOpen(false)}
                  className="flex-1"
                >
                  {t("cancel")}
                </Button>
                <Button onClick={criarNovaMeta} className="flex-1">
                  {t("create_goal")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Meta Dialog */}
        <Dialog open={isEditMetaOpen} onOpenChange={setIsEditMetaOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("edit_goal")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-titulo">{t("goal_title_required")}</Label>
                <Input
                  id="edit-titulo"
                  value={editMeta.titulo_da_meta}
                  onChange={(e) =>
                    setEditMeta((prev) => ({ ...prev, titulo_da_meta: e.target.value }))
                  }
                  placeholder={t("goal_title_placeholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-descricao">{t("goal_description")}</Label>
                <Textarea
                  id="edit-descricao"
                  value={editMeta.descricao}
                  onChange={(e) =>
                    setEditMeta((prev) => ({
                      ...prev,
                      descricao: e.target.value,
                    }))
                  }
                  placeholder={t("goal_description_placeholder")}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-valorAlvo">
                    {t("target_value_required")}
                  </Label>
                  <Input
                    id="edit-valorAlvo"
                    type="number"
                    value={editMeta.valor_alvo}
                    onChange={(e) =>
                      setEditMeta((prev) => ({
                        ...prev,
                        valor_alvo: e.target.value,
                      }))
                    }
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-valorAtual">{t("current_value")}</Label>
                  <Input
                    id="edit-valorAtual"
                    type="number"
                    value={editMeta.valor_hoje}
                    onChange={(e) =>
                      setEditMeta((prev) => ({
                        ...prev,
                        valor_hoje: e.target.value,
                      }))
                    }
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-prazo">{t("deadline_required")}</Label>
                <Input
                  id="edit-prazo"
                  type="date"
                  value={editMeta.data_limite}
                  onChange={(e) =>
                    setEditMeta((prev) => ({ ...prev, data_limite: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-categoria">{t("category_required")}</Label>
                <Select
                  value={editMeta.categoria}
                  onValueChange={(value) =>
                    setEditMeta((prev) => ({ ...prev, categoria: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency_reserve">{t("emergency_reserve")}</SelectItem>
                    <SelectItem value="leisure">{t("leisure")}</SelectItem>
                    <SelectItem value="education">{t("education")}</SelectItem>
                    <SelectItem value="housing">{t("housing")}</SelectItem>
                    <SelectItem value="others">{t("others")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditMetaOpen(false)}
                  className="flex-1"
                >
                  {t("cancel")}
                </Button>
                <Button onClick={salvarEdicaoMeta} className="flex-1">
                  {t("save_changes")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Atualizar Valor Meta Dialog */}
        <Dialog open={isAtualizarValorOpen} onOpenChange={setIsAtualizarValorOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("update_goal_value")}</DialogTitle>
            </DialogHeader>
            {metaParaAtualizar && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="bg-muted p-3 rounded-md">
                    <h4 className="font-semibold">{metaParaAtualizar.titulo_da_meta}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("current_value")}: {formatCurrency(parseFloat(metaParaAtualizar.valor_hoje.toString()))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("target_value")}: {formatCurrency(parseFloat(metaParaAtualizar.valor_alvo.toString()))}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo-operacao">{t("operation_type")}</Label>
                  <Select
                    value={tipoOperacao}
                    onValueChange={(value: "adicionar" | "substituir") => setTipoOperacao(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adicionar">{t("add_to_current")}</SelectItem>
                      <SelectItem value="substituir">{t("replace_value")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="novo-valor">
                    {tipoOperacao === "adicionar" ? t("value_to_add") : t("new_value")}
                  </Label>
                  <Input
                    id="novo-valor"
                    type="number"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                  />
                </div>

                {tipoOperacao === "adicionar" && novoValor && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm">
                      <span className="font-semibold">{t("result")}:</span>{" "}
                      {formatCurrency(
                        parseFloat(metaParaAtualizar.valor_hoje.toString()) + 
                        parseFloat(novoValor || "0")
                      )}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAtualizarValorOpen(false)}
                    className="flex-1"
                  >
                    {t("cancel")}
                  </Button>
                  <Button 
                    onClick={atualizarValorMeta} 
                    className="flex-1"
                    disabled={!novoValor || loading}
                  >
                    {loading ? t("updating") : t("update_value")}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de Metas */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold">{t("registered_goals")}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={criarTemplateEmergencia}
              disabled={loading}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Adicionar Reserva de Emergência
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("loading_goals")}</p>
          </div>
        ) : metas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("no_goals_registered")}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t("click_new_goal_to_start")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metas.map((meta) => {
          const valorHoje = parseFloat(meta.valor_hoje.toString());
          const valorAlvo = parseFloat(meta.valor_alvo.toString());
          const progresso = (valorHoje / valorAlvo) * 100;
          const statusPrazo = getStatusPrazo(meta.data_limite);
          const diasRestantes = getDiasRestantes(meta.data_limite);
          const isCompleta = progresso >= 100; // Baseado na % de progresso

          return (
            <Card
              key={meta.id}
              className={isCompleta ? "border-green-600" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{meta.titulo_da_meta}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {meta.descricao}
                    </p>
                  </div>
                  <Badge
                    variant={
                      isCompleta ? "default" : "secondary"
                    }
                    className={
                      isCompleta
                        ? "bg-green-600 text-white"
                        : ""
                    }
                  >
                    {meta.categoria}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progresso */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>
                        {t("progress")}: {progresso.toFixed(1)}%
                      </span>
                      <span>
                        {formatValue(valorHoje)} /{" "}
                        {formatValue(valorAlvo)}
                      </span>
                    </div>
                    <Progress
                      value={progresso}
                      className={`h-2 ${isCompleta ? "[&>div]:bg-green-600" : ""}`}
                    />
                  </div>

                  {/* Prazo */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {t("deadline")}:{" "}
                        {new Date(meta.data_limite).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant={statusPrazo.color as any}>
                      {isCompleta
                        ? t("completed")
                        : diasRestantes > 0
                          ? `${diasRestantes} ${t("days")}`
                          : t("overdue")}
                    </Badge>
                  </div>

                  {/* Valor restante */}
                  {!isCompleta && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {t("remaining")}:{" "}
                      </span>
                      <span className="font-semibold">
                        {formatValue(valorAlvo - valorHoje)}
                      </span>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex space-x-2 pt-2">
                    {!isCompleta && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditMeta(meta)}
                        >
                          {t("edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAtualizarValor(meta)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {t("add_value")}
                        </Button>
                      </>
                    )}
                    
                    {/* Botão de excluir sempre presente */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => excluirMeta(meta)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    {isCompleta && (
                      <Badge
                        variant="default"
                        className="bg-green-600 text-white"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t("completed")}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
          </div>
        )}
      </div>
    </div>
  );
}

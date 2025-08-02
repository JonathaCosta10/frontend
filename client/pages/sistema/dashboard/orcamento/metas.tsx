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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { budgetApi } from "@/services/api/budget";
import Chart from "chart.js/auto";

interface Meta {
  id: number;
  titulo: string;
  descricao: string;
  valorAlvo: number;
  valorAtual: number;
  prazo: string;
  categoria: string;
  status: "ativa" | "pausada" | "concluida";
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
  const [metas, setMetas] = useState<Meta[]>([]);
  const [isNovaMetaOpen, setIsNovaMetaOpen] = useState(false);
  const [isEditMetaOpen, setIsEditMetaOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [novaMeta, setNovaMeta] = useState({
    titulo: "",
    descricao: "",
    valorAlvo: "",
    prazo: "",
    categoria: "",
  });
  const [editMeta, setEditMeta] = useState({
    titulo: "",
    descricao: "",
    valorAlvo: "",
    valorAtual: "",
    prazo: "",
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
  const chartInstance = useRef<Chart | null>(null);

  // Obter mês e ano do localStorage
  const mes =
    localStorage.getItem("mes") ||
    String(new Date().getMonth() + 1).padStart(2, "0");
  const ano = localStorage.getItem("ano") || String(new Date().getFullYear());

  useEffect(() => {
    if (isAuthenticated) {
      loadMockMetas();
      loadOrcamentoDomestico();
    }
  }, [isAuthenticated]);

  // Carregar dados do orçamento doméstico
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

  // Carregar metas mock (em produção, você faria chamadas para API)
  const loadMockMetas = () => {
    setMetas([
      {
        id: 1,
        titulo: t("emergency_reserve"),
        descricao: t("save_six_months_expenses"),
        valorAlvo: 18000,
        valorAtual: 12500,
        prazo: "2024-12-31",
        categoria: t("emergency"),
        status: "ativa",
      },
      {
        id: 2,
        titulo: t("europe_trip"),
        descricao: t("save_vacation_money"),
        valorAlvo: 8000,
        valorAtual: 3200,
        prazo: "2024-06-30",
        categoria: t("leisure"),
        status: "ativa",
      },
      {
        id: 3,
        titulo: t("specialization_course"),
        descricao: t("finance_mba"),
        valorAlvo: 15000,
        valorAtual: 15000,
        prazo: "2024-01-31",
        categoria: t("education"),
        status: "concluida",
      },
      {
        id: 4,
        titulo: t("apartment_down_payment"),
        descricao: t("twenty_percent_property_value"),
        valorAlvo: 50000,
        valorAtual: 25000,
        prazo: "2025-03-31",
        categoria: t("housing"),
        status: "ativa",
      },
    ]);
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
      titulo: meta.titulo,
      descricao: meta.descricao,
      valorAlvo: meta.valorAlvo.toString(),
      valorAtual: meta.valorAtual.toString(),
      prazo: meta.prazo,
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
      !editMeta.titulo ||
      !editMeta.valorAlvo ||
      !editMeta.prazo ||
      !editMeta.categoria
    ) {
      alert(t("fill_required_fields"));
      return;
    }

    try {
      const metaAtualizada = {
        ...editingMeta,
        titulo: editMeta.titulo,
        descricao: editMeta.descricao,
        valorAlvo: parseFloat(editMeta.valorAlvo),
        valorAtual: parseFloat(editMeta.valorAtual),
        prazo: editMeta.prazo,
        categoria: editMeta.categoria,
      };

      // Atualizar meta na lista
      setMetas((prev) =>
        prev.map((meta) =>
          meta.id === editingMeta.id ? metaAtualizada : meta,
        ),
      );

      // Limpar formulário e fechar modal
      setEditMeta({
        titulo: "",
        descricao: "",
        valorAlvo: "",
        valorAtual: "",
        prazo: "",
        categoria: "",
      });
      setEditingMeta(null);
      setIsEditMetaOpen(false);

      console.log(t("goal_updated_successfully"));
    } catch (error) {
      console.error("Erro ao editar meta:", error);
      alert(t("error_updating_goal"));
    }
  };

  // Função para criar nova meta
  const criarNovaMeta = async () => {
    if (!isAuthenticated) {
      console.error("Usuário não autenticado");
      return;
    }

    if (
      !novaMeta.titulo ||
      !novaMeta.valorAlvo ||
      !novaMeta.prazo ||
      !novaMeta.categoria
    ) {
      alert(t("fill_required_fields"));
      return;
    }

    try {
      const novaMetaData = {
        titulo: novaMeta.titulo,
        descricao: novaMeta.descricao,
        valorAlvo: parseFloat(novaMeta.valorAlvo),
        valorAtual: 0,
        prazo: novaMeta.prazo,
        categoria: novaMeta.categoria,
        status: "ativa" as const,
      };

      // Simular criação da meta (substitua pela chamada API real)
      const novaMeta = { ...novaMetaData, id: Date.now() };
      setMetas((prev) => [...prev, novaMeta]);

      // Limpar formulário e fechar modal
      setNovaMeta({
        titulo: "",
        descricao: "",
        valorAlvo: "",
        prazo: "",
        categoria: "",
      });
      setIsNovaMetaOpen(false);

      console.log(t("goal_created_successfully"));
    } catch (error) {
      console.error("Erro ao criar meta:", error);
      alert(t("error_creating_goal"));
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
        chartInstance.current = new Chart(ctx, {
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

  const metasAtivas = metas.filter((m) => m.status === "ativa");
  const metasConcluidas = metas.filter((m) => m.status === "concluida");
  const totalEconomizado = metas.reduce(
    (sum, meta) => sum + meta.valorAtual,
    0,
  );
  const totalObjetivos = metas.reduce((sum, meta) => sum + meta.valorAlvo, 0);

  const getProgressoGeral = () => {
    if (totalObjetivos === 0) return 0;
    return (totalEconomizado / totalObjetivos) * 100;
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
      {/* Cards de Resumo */}
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
              {formatCurrency(totalEconomizado)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("of_total")} {formatCurrency(totalObjetivos)}
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
            <div className="text-2xl font-bold">{metasAtivas.length}</div>
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
            <div className="text-2xl font-bold">{metasConcluidas.length}</div>
            <p className="text-xs text-muted-foreground">
              {metasConcluidas.length > 0
                ? `${((metasConcluidas.length / metas.length) * 100).toFixed(0)}% ${t("completed").toLowerCase()}`
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

      {/* Alocação de Metas - Gráfico e Sliders */}
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
              <canvas ref={chartRef} />
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
                  value={novaMeta.titulo}
                  onChange={(e) =>
                    setNovaMeta((prev) => ({ ...prev, titulo: e.target.value }))
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
                  value={novaMeta.valorAlvo}
                  onChange={(e) =>
                    setNovaMeta((prev) => ({
                      ...prev,
                      valorAlvo: e.target.value,
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
                  value={novaMeta.prazo}
                  onChange={(e) =>
                    setNovaMeta((prev) => ({ ...prev, prazo: e.target.value }))
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
                    <SelectItem value="emergency">{t("emergency")}</SelectItem>
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
                  value={editMeta.titulo}
                  onChange={(e) =>
                    setEditMeta((prev) => ({ ...prev, titulo: e.target.value }))
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
                    value={editMeta.valorAlvo}
                    onChange={(e) =>
                      setEditMeta((prev) => ({
                        ...prev,
                        valorAlvo: e.target.value,
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
                    value={editMeta.valorAtual}
                    onChange={(e) =>
                      setEditMeta((prev) => ({
                        ...prev,
                        valorAtual: e.target.value,
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
                  value={editMeta.prazo}
                  onChange={(e) =>
                    setEditMeta((prev) => ({ ...prev, prazo: e.target.value }))
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
                    <SelectItem value="emergency">{t("emergency")}</SelectItem>
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
      </div>

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metas.map((meta) => {
          const progresso = (meta.valorAtual / meta.valorAlvo) * 100;
          const statusPrazo = getStatusPrazo(meta.prazo);
          const diasRestantes = getDiasRestantes(meta.prazo);

          return (
            <Card
              key={meta.id}
              className={meta.status === "concluida" ? "border-green-600" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{meta.titulo}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {meta.descricao}
                    </p>
                  </div>
                  <Badge
                    variant={
                      meta.status === "concluida" ? "default" : "secondary"
                    }
                    className={
                      meta.status === "concluida"
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
                        {formatCurrency(meta.valorAtual)} /{" "}
                        {formatCurrency(meta.valorAlvo)}
                      </span>
                    </div>
                    <Progress
                      value={progresso}
                      className={`h-2 ${meta.status === "concluida" ? "[&>div]:bg-green-600" : ""}`}
                    />
                  </div>

                  {/* Prazo */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {t("deadline")}:{" "}
                        {new Date(meta.prazo).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant={statusPrazo.color as any}>
                      {meta.status === "concluida"
                        ? t("completed")
                        : diasRestantes > 0
                          ? `${diasRestantes} ${t("days")}`
                          : t("overdue")}
                    </Badge>
                  </div>

                  {/* Valor restante */}
                  {meta.status !== "concluida" && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {t("remaining")}:{" "}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(meta.valorAlvo - meta.valorAtual)}
                      </span>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex space-x-2 pt-2">
                    {meta.status === "ativa" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMeta(meta)}
                      >
                        {t("edit")}
                      </Button>
                    )}
                    {meta.status === "concluida" && (
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
    </div>
  );
}

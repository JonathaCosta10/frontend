import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  Bell,
  AlertCircle,
  DollarSign,
  Percent,
  Users,
  Building,
  Loader2,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";

// Tipos temporários até a implementação da API real
interface EconomicIndicator {
  id: string;
  name: string;
  code: string;
  category: IndicatorCategory;
  value: number;
  unit: string;
  change: number;
  changePercent: number;
  lastUpdate: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
}

interface IndicatorGroup {
  category: IndicatorCategory;
  title: string;
  description: string;
  indicators: EconomicIndicator[];
}

interface IndicatorFilter {
  sortBy: "lastUpdate" | "name" | "change";
  sortOrder: "asc" | "desc";
  category?: IndicatorCategory;
}

type IndicatorCategory = 
  | "interest_rates" 
  | "inflation" 
  | "employment" 
  | "gdp" 
  | "currency" 
  | "commodities" 
  | "stock_indices" 
  | "bonds";

export default function IndicadoresEconomicos() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [indicatorGroups, setIndicatorGroups] = useState<IndicatorGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    IndicatorCategory | "all"
  >("all");

  // Filter state
  const [filter, setFilter] = useState<IndicatorFilter>({
    sortBy: "lastUpdate",
    sortOrder: "desc",
  });

  // Alerts state
  const [alertsEnabled, setAlertsEnabled] = useState<Set<string>>(new Set());

  // Load data on component mount
  useEffect(() => {
    loadIndicatorData();
    loadIndicatorGroups();
    // Removido loadMarketSentiment já que a seção foi removida
  }, [filter, selectedCategory]);

  const loadIndicatorData = async () => {
    setIsLoading(true);
    try {
      // TODO: Implementar chamada para API real de indicadores econômicos
      // Endpoint esperado: GET /api/indicadores-economicos/
      // Parâmetros: category, sortBy, sortOrder
      // Exemplo de uso:
      // const response = await fetch('/api/indicadores-economicos/', {
      //   method: 'GET',
      //   headers: { 'Authorization': `Bearer ${token}` },
      //   params: { category: selectedCategory !== 'all' ? selectedCategory : undefined }
      // });
      // const data = await response.json();
      // setIndicators(data.indicators || []);
      
      // Por enquanto, mantém vazio até a API estar pronta
      console.log("📊 Aguardando dados reais da API de indicadores econômicos");
      setIndicators([]);
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failed_load_economic_indicators"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadIndicatorGroups = async () => {
    try {
      // TODO: Implementar chamada para API real de grupos de indicadores
      // Endpoint esperado: GET /api/indicadores-economicos/grupos/
      // Retorno esperado: Array de grupos com categorias na ordem: currency, inflation, interest_rates, gdp, stock_indices
      // Exemplo de estrutura esperada:
      // {
      //   category: "currency",
      //   title: "Câmbio",
      //   description: "Variações das principais moedas",
      //   indicators: [...]
      // }
      
      console.log("📊 Carregando grupos na ordem: Câmbio → Inflação → Taxa de Juros → PIB → Índices Acionários");
      
      // Dados mockados temporários na nova ordem solicitada
      const mockGroups = [
        {
          category: "currency" as const,
          title: t("currency"),
          description: "Variações das principais moedas",
          indicators: []
        },
        {
          category: "inflation" as const,
          title: t("inflation"),
          description: "Índices de inflação e preços",
          indicators: []
        },
        {
          category: "interest_rates" as const,
          title: t("interest_rates"),
          description: "Taxas de juros básicas",
          indicators: []
        },
        {
          category: "gdp" as const,
          title: t("gdp"),
          description: "Produto Interno Bruto",
          indicators: []
        },
        {
          category: "stock_indices" as const,
          title: t("stock_indices"),
          description: "Principais índices da bolsa",
          indicators: []
        }
      ];
      setIndicatorGroups(mockGroups);
    } catch (error) {
      console.error("Error loading indicator groups:", error);
    }
  };

  const getCategoryIcon = (category: IndicatorCategory) => {
    const icons = {
      interest_rates: <Percent className="h-4 w-4" />,
      inflation: <TrendingUp className="h-4 w-4" />,
      employment: <Users className="h-4 w-4" />,
      gdp: <Building className="h-4 w-4" />,
      currency: <DollarSign className="h-4 w-4" />,
      commodities: <BarChart className="h-4 w-4" />,
      stock_indices: <LineChart className="h-4 w-4" />,
      bonds: <Activity className="h-4 w-4" />,
    };
    return icons[category] || <Activity className="h-4 w-4" />;
  };

  const getCategoryLabel = (category: IndicatorCategory) => {
    const labels = {
      interest_rates: t("interest_rates"),
      inflation: t("inflation"),
      employment: t("employment"),
      gdp: t("gdp"),
      currency: t("currency"),
      commodities: t("commodities"),
      stock_indices: t("stock_indices"),
      bonds: t("bonds"),
    };
    return labels[category] || category;
  };

  const getVariationIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getVariationColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const filteredIndicators = indicators.filter(
    (indicator) =>
      indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatValue = (value: number, unit: string) => {
    if (unit === "BRL" || unit.includes("R$")) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }

    if (unit.includes("%")) {
      return `${value.toFixed(2)}%`;
    }

    if (unit === "pontos") {
      return new Intl.NumberFormat("pt-BR").format(value);
    }

    return `${value.toFixed(2)} ${unit}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleAlert = (indicatorId: string) => {
    const newAlerts = new Set(alertsEnabled);
    if (newAlerts.has(indicatorId)) {
      newAlerts.delete(indicatorId);
    } else {
      newAlerts.add(indicatorId);
    }
    setAlertsEnabled(newAlerts);

    toast({
      title: t("success"),
      description: newAlerts.has(indicatorId)
        ? t("price_alert_activated")
        : t("price_alert_deactivated"),
    });
  };

  // Função para ordenar categorias na ordem desejada: Câmbio, Inflação, Taxa de Juros, PIB, Índices Acionários
  const getOrderedIndicatorGroups = () => {
    const desiredOrder = ["currency", "inflation", "interest_rates", "gdp", "stock_indices"];
    
    return indicatorGroups.sort((a, b) => {
      const indexA = desiredOrder.indexOf(a.category);
      const indexB = desiredOrder.indexOf(b.category);
      
      // Se ambos estão na lista, ordenar pela posição
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Se apenas um está na lista, priorizar o que está
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Se nenhum está na lista, manter ordem original
      return 0;
    });
  };

  return (
    <MarketPremiumGuard marketFeature="financial-calculator">
      <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <Activity className="h-8 w-8 text-blue-600" />
          <span>{t("economic_indicators")}</span>
        </h1>
        <p className="text-muted-foreground">{t("follow_main_indicators")}</p>
      </div>

      {/* Main Content - Categories View */}
      <div className="space-y-3 md:space-y-6">
        {/* Categories Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t("by_category")}</h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {getOrderedIndicatorGroups().map((group) => (
              <Card
                key={group.category}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getCategoryIcon(group.category)}
                    <span>{group.title}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.indicators.slice(0, 3).map((indicator) => (
                    <div
                      key={indicator.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{indicator.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {indicator.code}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatValue(indicator.value, indicator.unit)}
                        </p>
                        <div className="flex items-center space-x-1">
                          {getVariationIcon(indicator.change)}
                          <span
                            className={`text-xs ${getVariationColor(indicator.change)}`}
                          >
                            {indicator.changePercent > 0 ? "+" : ""}
                            {indicator.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {group.indicators.length > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedCategory(group.category)}
                    >
                      {t("view_all")} ({group.indicators.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MarketPremiumGuard>
  );
}

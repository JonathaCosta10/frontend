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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { EconomicIndicatorsApiService } from "@/services/api/entities/economicIndicatorsApi";
import {
  EconomicIndicator,
  IndicatorGroup,
  MarketSentiment,
  IndicatorFilter,
  IndicatorCategory,
} from "@/src/entities/EconomicIndicators";

export default function IndicadoresEconomicos() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [indicatorGroups, setIndicatorGroups] = useState<IndicatorGroup[]>([]);
  const [marketSentiment, setMarketSentiment] =
    useState<MarketSentiment | null>(null);
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
    loadMarketSentiment();
  }, [filter, selectedCategory]);

  const loadIndicatorData = async () => {
    setIsLoading(true);
    try {
      const filterWithCategory = {
        ...filter,
        category: selectedCategory === "all" ? undefined : selectedCategory,
      };
      const data =
        await EconomicIndicatorsApiService.getEconomicIndicators(
          filterWithCategory,
        );
      setIndicators(data);
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
      const groups = await EconomicIndicatorsApiService.getIndicatorGroups();
      setIndicatorGroups(groups);
    } catch (error) {
      console.error("Error loading indicator groups:", error);
    }
  };

  const loadMarketSentiment = async () => {
    try {
      const sentiment = await EconomicIndicatorsApiService.getMarketSentiment();
      setMarketSentiment(sentiment);
    } catch (error) {
      console.error("Error loading market sentiment:", error);
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

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-600 bg-green-50";
      case "bearish":
        return "text-red-600 bg-red-50";
      default:
        return "text-yellow-600 bg-yellow-50";
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return t("optimistic");
      case "bearish":
        return t("pessimistic");
      default:
        return t("neutral");
    }
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

      {/* Market Sentiment Card */}
      {marketSentiment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{t("market_sentiment")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("general_sentiment")}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      className={getSentimentColor(marketSentiment.overall)}
                    >
                      {getSentimentLabel(marketSentiment.overall)}
                    </Badge>
                    <span className="text-2xl font-bold">
                      {marketSentiment.score > 0 ? "+" : ""}
                      {marketSentiment.score}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("last_update")}: {formatDate(marketSentiment.lastUpdate)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t("interest")}</span>
                    <span
                      className={getVariationColor(
                        marketSentiment.factors.interestRates,
                      )}
                    >
                      {marketSentiment.factors.interestRates > 0 ? "+" : ""}
                      {marketSentiment.factors.interestRates}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("inflation")}</span>
                    <span
                      className={getVariationColor(
                        marketSentiment.factors.inflation,
                      )}
                    >
                      {marketSentiment.factors.inflation > 0 ? "+" : ""}
                      {marketSentiment.factors.inflation}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("employment")}</span>
                    <span
                      className={getVariationColor(
                        marketSentiment.factors.employment,
                      )}
                    >
                      {marketSentiment.factors.employment > 0 ? "+" : ""}
                      {marketSentiment.factors.employment}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t("gdp")}</span>
                    <span
                      className={getVariationColor(
                        marketSentiment.factors.gdpGrowth,
                      )}
                    >
                      {marketSentiment.factors.gdpGrowth > 0 ? "+" : ""}
                      {marketSentiment.factors.gdpGrowth}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("volatility")}</span>
                    <span
                      className={getVariationColor(
                        marketSentiment.factors.marketVolatility,
                      )}
                    >
                      {marketSentiment.factors.marketVolatility > 0 ? "+" : ""}
                      {marketSentiment.factors.marketVolatility}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="categories">{t("by_category")}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-3 md:space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search_indicators")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as any)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_categories")}</SelectItem>
                  <SelectItem value="interest_rates">
                    {t("interest_rates")}
                  </SelectItem>
                  <SelectItem value="inflation">{t("inflation")}</SelectItem>
                  <SelectItem value="employment">{t("employment")}</SelectItem>
                  <SelectItem value="gdp">{t("gdp")}</SelectItem>
                  <SelectItem value="currency">{t("currency")}</SelectItem>
                  <SelectItem value="stock_indices">
                    {t("stock_indices")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={`${filter.sortBy}-${filter.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split("-");
                  setFilter({
                    ...filter,
                    sortBy: sortBy as any,
                    sortOrder: sortOrder as any,
                  });
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastUpdate-desc">
                    {t("most_recent")}
                  </SelectItem>
                  <SelectItem value="name-asc">{t("name_a_z")}</SelectItem>
                  <SelectItem value="change-desc">
                    {t("highest_variation")}
                  </SelectItem>
                  <SelectItem value="change-asc">
                    {t("lowest_variation")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Indicators Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t("economic_indicators_table")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredIndicators.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? t("no_indicator_found")
                      : t("no_indicator_available")}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("indicator")}</TableHead>
                      <TableHead>{t("category")}</TableHead>
                      <TableHead>{t("current_value")}</TableHead>
                      <TableHead>{t("variation")}</TableHead>
                      <TableHead>{t("frequency")}</TableHead>
                      <TableHead>{t("last_updated")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIndicators.map((indicator) => (
                      <TableRow key={indicator.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{indicator.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {indicator.code}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(indicator.category)}
                            <Badge variant="outline">
                              {getCategoryLabel(indicator.category)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatValue(indicator.value, indicator.unit)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {getVariationIcon(indicator.change)}
                            <span
                              className={`font-semibold ${getVariationColor(indicator.change)}`}
                            >
                              {indicator.change > 0 ? "+" : ""}
                              {indicator.change.toFixed(2)}
                            </span>
                            <span
                              className={`text-sm ${getVariationColor(indicator.changePercent)}`}
                            >
                              ({indicator.changePercent > 0 ? "+" : ""}
                              {indicator.changePercent.toFixed(2)}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {indicator.frequency === "daily" && t("daily")}
                            {indicator.frequency === "weekly" && t("weekly")}
                            {indicator.frequency === "monthly" && t("monthly")}
                            {indicator.frequency === "quarterly" &&
                              t("quarterly")}
                            {indicator.frequency === "yearly" && t("yearly")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(indicator.lastUpdate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAlert(indicator.id)}
                              className={
                                alertsEnabled.has(indicator.id)
                                  ? "text-red-600 hover:text-red-700"
                                  : "text-muted-foreground hover:text-orange-600"
                              }
                              title={
                                alertsEnabled.has(indicator.id)
                                  ? t("price_alert_enabled")
                                  : t("price_alert_disabled")
                              }
                            >
                              <Bell
                                className={`h-4 w-4 ${alertsEnabled.has(indicator.id) ? "fill-current" : ""}`}
                              />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <BarChart className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-3 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {indicatorGroups.map((group) => (
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
        </TabsContent>
      </Tabs>
    </div>
    </MarketPremiumGuard>
  );
}

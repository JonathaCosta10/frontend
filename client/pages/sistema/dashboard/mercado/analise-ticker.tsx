import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  DollarSign,
  Percent,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";
import { useTranslation } from "@/contexts/TranslationContext";

interface TickerAnalysis {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  variation: number;
  marketCap: string;
  volume: string;
  pe: number;
  dividend: number;
  roe: number;
  debt: number;
  recommendation: "COMPRA" | "VENDA" | "NEUTRO";
  risk: "BAIXO" | "MÉDIO" | "ALTO";
  score: number;
}

interface TechnicalAnalysis {
  support: number;
  resistance: number;
  trend: "ALTA" | "BAIXA" | "LATERAL";
  rsi: number;
  macd: "POSITIVO" | "NEGATIVO";
  volume: "ALTO" | "MÉDIO" | "BAIXO";
}

export default function AnaliseTicker() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [searchTicker, setSearchTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<TickerAnalysis | null>(null);
  const [technical, setTechnical] = useState<TechnicalAnalysis | null>(null);

  useEffect(() => {
    const tickerFromUrl = searchParams.get("ticker");
    if (tickerFromUrl) {
      setSearchTicker(tickerFromUrl);
      // Auto-perform analysis if ticker comes from URL
      performAnalysisForTicker(tickerFromUrl);
    }
  }, [searchParams]);

  const performAnalysisForTicker = (ticker: string) => {
    if (!ticker.trim()) return;

    setLoading(true);

    // Simular chamada de API
    setTimeout(() => {
      setAnalysis({
        ticker: ticker.toUpperCase(),
        name: `${ticker.toUpperCase()} - ${t("company_example")}`,
        sector: t("energy_sector"),
        price: 32.5,
        variation: 2.1,
        marketCap: "156.8B",
        volume: "2.3M",
        pe: 12.5,
        dividend: 5.2,
        roe: 18.5,
        debt: 45.2,
        recommendation: "COMPRA",
        risk: "MÉDIO",
        score: 8.2,
      });

      setTechnical({
        support: 30.5,
        resistance: 35.0,
        trend: "ALTA",
        rsi: 65,
        macd: "POSITIVO",
        volume: "ALTO",
      });

      setLoading(false);
    }, 1500);
  };

  const performAnalysis = () => {
    performAnalysisForTicker(searchTicker);
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "COMPRA":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "VENDA":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "NEUTRO":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "BAIXO":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "MÉDIO":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "ALTO":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getIndicatorStatus = (
    value: number,
    good: number,
    excellent: number,
  ) => {
    if (value >= excellent)
      return { icon: CheckCircle, color: "text-green-600" };
    if (value >= good) return { icon: Clock, color: "text-yellow-600" };
    return { icon: AlertCircle, color: "text-red-600" };
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">{t("ticker_analysis_title")}</h2>
          <p className="text-muted-foreground">
            {t("fundamental_technical_detailed")}
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex space-x-2">
              <Input
                placeholder={t("enter_ticker_placeholder")}
                value={searchTicker}
                onChange={(e) => setSearchTicker(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && performAnalysis()}
                className="flex-1"
              />
              <Button onClick={performAnalysis} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? t("analyzing_ticker") : t("analyze_button")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {analysis.ticker}
                    </CardTitle>
                    <p className="text-muted-foreground">{analysis.name}</p>
                    <Badge variant="secondary">{analysis.sector}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      R$ {analysis.price.toFixed(2)}
                    </div>
                    <div className="flex items-center space-x-2">
                      {analysis.variation > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={
                          analysis.variation > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {analysis.variation > 0 ? "+" : ""}
                        {analysis.variation.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("recommendation")}
                    </p>
                    <Badge
                      className={getRecommendationColor(
                        analysis.recommendation,
                      )}
                    >
                      {analysis.recommendation}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t("risk")}</p>
                    <Badge className={getRiskColor(analysis.risk)}>
                      {analysis.risk}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("score")}
                    </p>
                    <p
                      className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}
                    >
                      {analysis.score.toFixed(1)}/10
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("market_cap")}
                    </p>
                    <p className="text-lg font-semibold">
                      {analysis.marketCap}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Tabs defaultValue="fundamental" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fundamental">
                  {t("fundamental_analysis")}
                </TabsTrigger>
                <TabsTrigger value="technical">
                  {t("technical_analysis")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="fundamental" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* P/E Ratio */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>P/E Ratio</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {analysis.pe.toFixed(1)}
                        </span>
                        {(() => {
                          const { icon: Icon, color } = getIndicatorStatus(
                            analysis.pe,
                            15,
                            10,
                          );
                          return <Icon className={`h-5 w-5 ${color}`} />;
                        })()}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {analysis.pe < 10
                          ? t("very_attractive")
                          : analysis.pe < 15
                            ? t("attractive")
                            : t("expensive")}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Dividend Yield */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Percent className="h-5 w-5" />
                        <span>Dividend Yield</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {analysis.dividend.toFixed(1)}%
                        </span>
                        {(() => {
                          const { icon: Icon, color } = getIndicatorStatus(
                            analysis.dividend,
                            4,
                            6,
                          );
                          return <Icon className={`h-5 w-5 ${color}`} />;
                        })()}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {analysis.dividend > 6
                          ? t("excellent")
                          : analysis.dividend > 4
                            ? t("good")
                            : t("low")}
                      </p>
                    </CardContent>
                  </Card>

                  {/* ROE */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>ROE</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {analysis.roe.toFixed(1)}%
                        </span>
                        {(() => {
                          const { icon: Icon, color } = getIndicatorStatus(
                            analysis.roe,
                            15,
                            20,
                          );
                          return <Icon className={`h-5 w-5 ${color}`} />;
                        })()}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {analysis.roe > 20
                          ? t("excellent")
                          : analysis.roe > 15
                            ? t("good")
                            : t("low")}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Debt Ratio */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <PieChart className="h-5 w-5" />
                        <span>{t("debt_ratio_label")}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {analysis.debt.toFixed(1)}%
                        </span>
                        {(() => {
                          const { icon: Icon, color } = getIndicatorStatus(
                            100 - analysis.debt,
                            40,
                            60,
                          );
                          return <Icon className={`h-5 w-5 ${color}`} />;
                        })()}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {analysis.debt < 40
                          ? t("low")
                          : analysis.debt < 60
                            ? t("moderate")
                            : t("high")}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Volume */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>{t("volume_label")}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {analysis.volume}
                        </span>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("adequate_liquidity_label")}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("fundamental_summary")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>
                          {t("good_roe_profitability")} (ROE: {analysis.roe}
                          %)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>
                          {t("attractive_dividend_yield")} ({analysis.dividend}
                          %)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <span>
                          {t("moderate_debt_level")} ({analysis.debt}%)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                {technical && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Support/Resistance */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Target className="h-5 w-5" />
                            <span>{t("support_resistance")}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                {t("resistance")}:
                              </span>
                              <span className="font-semibold">
                                R$ {technical.resistance.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                {t("support")}:
                              </span>
                              <span className="font-semibold">
                                R$ {technical.support.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Trend */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5" />
                            <span>{t("trend")}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Badge
                              className={
                                technical.trend === "ALTA"
                                  ? "bg-green-100 text-green-800"
                                  : technical.trend === "BAIXA"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {technical.trend}
                            </Badge>
                            {technical.trend === "ALTA" ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : technical.trend === "BAIXA" ? (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            ) : (
                              <BarChart3 className="h-5 w-5 text-yellow-600" />
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* RSI */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <BarChart3 className="h-5 w-5" />
                            <span>RSI</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                              {technical.rsi}
                            </span>
                            <Badge
                              className={
                                technical.rsi > 70
                                  ? "bg-red-100 text-red-800"
                                  : technical.rsi < 30
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {technical.rsi > 70
                                ? t("overbought")
                                : technical.rsi < 30
                                  ? t("oversold")
                                  : t("neutral")}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Technical Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("technical_summary")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>{t("uptrend_confirmed")}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span>{t("high_volume_trading")}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <span>{t("rsi_near_overbought")}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Empty state */}
        {!analysis && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t("ticker_analysis_title")}
              </h3>
              <p className="text-muted-foreground">
                {t("enter_ticker_to_start")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MarketPremiumGuard>
  );
}

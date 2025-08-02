import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Star,
  Youtube,
  Instagram,
  Clock,
  Wallet,
  Activity,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Music,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface PortfolioAsset {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  value: number;
}

interface Influencer {
  id: string;
  name: string;
  expertise: string;
  avatar: string;
  imageUrl: string;
  youtube?: string;
  tiktok?: string;
  instagram?: string;
  description: string;
  followers: string;
}

export default function InfoDiaria() {
  const { t, formatCurrency } = useTranslation();
  const today = new Date();
  const todayFormatted = today.toLocaleDateString();

  // Currency and Stock chart states
  const [selectedCurrency, setSelectedCurrency] = useState("BRL/USD");
  const [selectedStock, setSelectedStock] = useState("Ibovespa");
  const [currencyTimePeriod, setCurrencyTimePeriod] = useState("1D");
  const [stockTimePeriod, setStockTimePeriod] = useState("1D");

  // Influencers state
  const [favoriteInfluencers, setFavoriteInfluencers] = useState<Set<string>>(
    new Set(),
  );
  const [currentInfluencerIndex, setCurrentInfluencerIndex] = useState(0);
  const [isInfluencerManagerOpen, setIsInfluencerManagerOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(
    null,
  );
  const [influencersList, setInfluencersList] = useState<Influencer[]>([]);

  // Mock data
  const currencyData = {
    "BRL/USD": { rate: 5.13, change: 0.02, changePercent: 0.39 },
    "BRL/JPY": { rate: 0.034, change: -0.001, changePercent: -2.94 },
    "BRL/EUR": { rate: 5.45, change: 0.05, changePercent: 0.92 },
  };

  const stockData = {
    Ibovespa: { value: 126845, change: 1250, changePercent: 0.99 },
    Nasdaq: { value: 15892, change: -85, changePercent: -0.53 },
    SP500: { value: 4756, change: 12, changePercent: 0.25 },
  };

  const portfolioData = {
    totalValue: 125400.5,
    todayChange: 2150.75,
    todayChangePercent: 1.74,
    assets: [
      {
        symbol: "PETR4",
        name: "Petrobras",
        currentPrice: 32.45,
        change: 0.85,
        changePercent: 2.69,
        value: 15420.5,
      },
      {
        symbol: "VALE3",
        name: "Vale",
        currentPrice: 68.3,
        change: -1.2,
        changePercent: -1.73,
        value: 12800.0,
      },
      {
        symbol: "ITUB4",
        name: "Itaú",
        currentPrice: 25.15,
        change: 0.45,
        changePercent: 1.82,
        value: 10050.0,
      },
      {
        symbol: "BBDC4",
        name: "Bradesco",
        currentPrice: 18.9,
        change: -0.3,
        changePercent: -1.56,
        value: 8960.0,
      },
      {
        symbol: "MGLU3",
        name: "Magazine Luiza",
        currentPrice: 4.75,
        change: 0.12,
        changePercent: 2.59,
        value: 7125.0,
      },
    ] as PortfolioAsset[],
  };

  // Initialize influencers list
  React.useEffect(() => {
    if (influencersList.length === 0) {
      setInfluencersList(initialInfluencers);
    }
  }, []);

  const initialInfluencers: Influencer[] = [
    {
      id: "1",
      name: "Carlos Investidor",
      expertise: "Análise Técnica",
      avatar: "CI",
      imageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      youtube: "https://youtube.com/@carlosinvestidor",
      tiktok: "https://tiktok.com/@carlosinvest",
      instagram: "https://instagram.com/carlosinvestidor",
      description:
        "Especialista em análise técnica com foco em day trade e swing trade",
      followers: "120k",
    },
    {
      id: "2",
      name: "Ana Market",
      expertise: "Fundos Imobiliários",
      avatar: "AM",
      imageUrl:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      youtube: "https://youtube.com/@anamarket",
      tiktok: "https://tiktok.com/@anamarket",
      instagram: "https://instagram.com/anamarket",
      description: "Focada em FIIs e estratégias de renda passiva",
      followers: "85k",
    },
    {
      id: "3",
      name: "Pedro Cripto",
      expertise: "Criptomoedas",
      avatar: "PC",
      imageUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      youtube: "https://youtube.com/@pedrocripto",
      tiktok: "https://tiktok.com/@pedrocripto",
      instagram: "https://instagram.com/pedrocripto",
      description: "Análise de criptomoedas, DeFi e mercado descentralizado",
      followers: "95k",
    },
    {
      id: "4",
      name: "Marina Stocks",
      expertise: "Ações Americanas",
      avatar: "MS",
      imageUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      youtube: "https://youtube.com/@marinastocks",
      tiktok: "https://tiktok.com/@marinastocks",
      instagram: "https://instagram.com/marinastocks",
      description: "Especialista em mercado americano e ações de tecnologia",
      followers: "110k",
    },
  ];

  const toggleFavoriteInfluencer = (influencerId: string) => {
    const newFavorites = new Set(favoriteInfluencers);
    if (newFavorites.has(influencerId)) {
      newFavorites.delete(influencerId);
    } else {
      newFavorites.add(influencerId);
    }
    setFavoriteInfluencers(newFavorites);
  };

  const nextInfluencer = () => {
    setCurrentInfluencerIndex((prev) =>
      prev + 2 >= influencersList.length ? 0 : prev + 2,
    );
  };

  const prevInfluencer = () => {
    setCurrentInfluencerIndex((prev) =>
      prev === 0
        ? Math.max(0, influencersList.length - 2)
        : Math.max(0, prev - 2),
    );
  };

  const currentCurrency =
    currencyData[selectedCurrency as keyof typeof currencyData];
  const currentStock = stockData[selectedStock as keyof typeof stockData];
  const currentInfluencer = influencersList[currentInfluencerIndex];
  const nextInfluencerData = influencersList[currentInfluencerIndex + 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("daily_info")}</h1>
          <p className="text-muted-foreground">
            {t("daily_overview_subtitle")} - {todayFormatted}
          </p>
        </div>
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Currency and Stock Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>{t("currencies")}</span>
              </CardTitle>
              <Select
                value={selectedCurrency}
                onValueChange={setSelectedCurrency}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL/USD">BRL/USD</SelectItem>
                  <SelectItem value="BRL/JPY">BRL/JPY</SelectItem>
                  <SelectItem value="BRL/EUR">BRL/EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Time Period Buttons */}
              <div className="flex items-center justify-center">
                <div className="flex space-x-1 bg-muted rounded-lg p-1">
                  {["1D", "5D", "1M", "6M", "YTD", "1A", "5A"].map((period) => (
                    <Button
                      key={period}
                      variant={
                        currencyTimePeriod === period ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() => setCurrencyTimePeriod(period)}
                      className="px-3 py-1 h-8 text-xs"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {currentCurrency.rate.toFixed(3)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm ${
                        currentCurrency.change >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {currentCurrency.change >= 0 ? "+" : ""}
                      {currentCurrency.change.toFixed(3)}
                    </span>
                    <Badge
                      variant={
                        currentCurrency.changePercent >= 0
                          ? "default"
                          : "destructive"
                      }
                      className={
                        currentCurrency.changePercent >= 0
                          ? "bg-green-600"
                          : "bg-red-600"
                      }
                    >
                      {currentCurrency.changePercent >= 0 ? "+" : ""}
                      {currentCurrency.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
                {currentCurrency.changePercent >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
              {/* Mock Chart Area */}
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  {t("chart")} {selectedCurrency}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>{t("stock_exchanges")}</span>
              </CardTitle>
              <Select value={selectedStock} onValueChange={setSelectedStock}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ibovespa">Ibovespa</SelectItem>
                  <SelectItem value="Nasdaq">Nasdaq</SelectItem>
                  <SelectItem value="SP500">S&P 500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Time Period Buttons */}
              <div className="flex items-center justify-center">
                <div className="flex space-x-1 bg-muted rounded-lg p-1">
                  {["1D", "5D", "1M", "6M", "YTD", "1A", "5A"].map((period) => (
                    <Button
                      key={period}
                      variant={stockTimePeriod === period ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setStockTimePeriod(period)}
                      className="px-3 py-1 h-8 text-xs"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {currentStock.value.toLocaleString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm ${
                        currentStock.change >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {currentStock.change >= 0 ? "+" : ""}
                      {currentStock.change}
                    </span>
                    <Badge
                      variant={
                        currentStock.changePercent >= 0
                          ? "default"
                          : "destructive"
                      }
                      className={
                        currentStock.changePercent >= 0
                          ? "bg-green-600"
                          : "bg-red-600"
                      }
                    >
                      {currentStock.changePercent >= 0 ? "+" : ""}
                      {currentStock.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
                {currentStock.changePercent >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
              {/* Mock Chart Area */}
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                <Activity className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  {t("chart")} {selectedStock}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>{t("variable_income")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(portfolioData.totalValue)}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("total_value")}
              </p>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  portfolioData.todayChange >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {portfolioData.todayChange >= 0 ? "+" : ""}
                {formatCurrency(portfolioData.todayChange)}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("today_variation")}
              </p>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  portfolioData.todayChangePercent >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {portfolioData.todayChangePercent >= 0 ? "+" : ""}
                {portfolioData.todayChangePercent.toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground">{t("percentage")}</p>
            </div>
          </div>

          <Tabs defaultValue="variations" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="variations">
                {t("highest_trading_volumes")}
              </TabsTrigger>
              <TabsTrigger value="opportunities">
                {t("portfolio_variations")}
              </TabsTrigger>
              <TabsTrigger value="average-price">
                {t("average_price_opportunity")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="variations" className="space-y-4">
              <div className="space-y-3">
                {portfolioData.assets.map((asset, index) => (
                  <div
                    key={asset.symbol}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <div className="font-semibold">{asset.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          {asset.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(asset.currentPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(asset.value)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${
                            asset.change >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {asset.change >= 0 ? "+" : ""}
                          {formatCurrency(asset.change)}
                        </div>
                        <div
                          className={`text-sm ${
                            asset.changePercent >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {asset.changePercent >= 0 ? "+" : ""}
                          {asset.changePercent.toFixed(2)}%
                        </div>
                      </div>
                      {asset.changePercent >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-4">
              <div className="space-y-3">
                {portfolioData.assets
                  .filter((asset) => asset.changePercent < -2) // Assets with good buying opportunities
                  .map((asset, index) => (
                    <div
                      key={asset.symbol}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <div className="font-semibold">{asset.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCurrency(asset.currentPrice)}
                          </div>
                          <div className="text-sm text-green-600">
                            {t("buy_opportunity")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-600 font-semibold">
                            {formatCurrency(asset.change)}
                          </div>
                          <div className="text-sm text-red-600">
                            {asset.changePercent.toFixed(2)}%
                          </div>
                        </div>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                  ))}
                {portfolioData.assets.filter(
                  (asset) => asset.changePercent < -2,
                ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("no_buy_opportunities_today")}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="average-price" className="space-y-4">
              <div className="space-y-3">
                {portfolioData.assets
                  .filter((asset) => Math.abs(asset.changePercent) < 1) // Assets with low volatility
                  .map((asset, index) => (
                    <div
                      key={asset.symbol}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <div className="font-semibold">{asset.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCurrency(asset.currentPrice)}
                          </div>
                          <div className="text-sm text-blue-600">
                            {t("stable_price")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-semibold ${
                              asset.change >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {asset.change >= 0 ? "+" : ""}
                            {formatCurrency(asset.change)}
                          </div>
                          <div
                            className={`text-sm ${
                              asset.changePercent >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {asset.changePercent >= 0 ? "+" : ""}
                            {asset.changePercent.toFixed(2)}%
                          </div>
                        </div>
                        <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                      </div>
                    </div>
                  ))}
                {portfolioData.assets.filter(
                  (asset) => Math.abs(asset.changePercent) < 1,
                ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("no_stable_assets_today")}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Daily Influencers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>{t("daily_main_influencers")}</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("main_financial_market_influencers")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Navigation buttons */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={prevInfluencer}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{t("previous")}</span>
              </Button>
              <div className="text-sm text-muted-foreground">
                {Math.floor(currentInfluencerIndex / 2) + 1} {t("of")}{" "}
                {Math.ceil(influencersList.length / 2)} {t("pages")}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={nextInfluencer}
                className="flex items-center space-x-2"
              >
                <span>{t("next")}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Current Influencers (Two per page) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Influencer */}
              <div className="border rounded-lg p-6 bg-muted/20">
                <div className="flex items-start space-x-4">
                  <img
                    src={currentInfluencer?.imageUrl || ""}
                    alt={currentInfluencer?.name || ""}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }}
                  />
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground items-center justify-center font-bold text-lg hidden">
                    {currentInfluencer?.avatar || "?"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {currentInfluencer?.name || "Carregando..."}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {currentInfluencer?.expertise || ""} •{" "}
                          {currentInfluencer?.followers || "0"} {t("followers")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          currentInfluencer &&
                          toggleFavoriteInfluencer(currentInfluencer.id)
                        }
                        className={
                          currentInfluencer &&
                          favoriteInfluencers.has(currentInfluencer.id)
                            ? "text-yellow-600 hover:text-yellow-700"
                            : "text-muted-foreground hover:text-yellow-600"
                        }
                      >
                        <Star
                          className={`h-5 w-5 ${currentInfluencer && favoriteInfluencers.has(currentInfluencer.id) ? "fill-current" : ""}`}
                        />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm">
                      {currentInfluencer?.description || ""}
                    </p>

                    {/* Social Media Links */}
                    <div className="flex items-center space-x-2 mt-4">
                      {currentInfluencer?.youtube && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <a
                            href={currentInfluencer?.youtube || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Youtube className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {currentInfluencer?.tiktok && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="p-2"
                        >
                          <a
                            href={currentInfluencer?.tiktok || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Music className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {currentInfluencer?.instagram && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="p-2 text-pink-600 hover:text-pink-700"
                        >
                          <a
                            href={currentInfluencer?.instagram || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Instagram className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Influencer */}
              {nextInfluencerData && (
                <div className="border rounded-lg p-6 bg-muted/20">
                  <div className="flex items-start space-x-4">
                    <img
                      src={nextInfluencerData?.imageUrl || ""}
                      alt={nextInfluencerData?.name || ""}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling.style.display =
                          "flex";
                      }}
                    />
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground items-center justify-center font-bold text-lg hidden">
                      {nextInfluencerData?.avatar || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {nextInfluencerData?.name || "Carregando..."}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {nextInfluencerData?.expertise || ""} •{" "}
                            {nextInfluencerData?.followers || "0"}{" "}
                            {t("followers")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            nextInfluencerData &&
                            toggleFavoriteInfluencer(nextInfluencerData.id)
                          }
                          className={
                            nextInfluencerData &&
                            favoriteInfluencers.has(nextInfluencerData.id)
                              ? "text-yellow-600 hover:text-yellow-700"
                              : "text-muted-foreground hover:text-yellow-600"
                          }
                        >
                          <Star
                            className={`h-5 w-5 ${nextInfluencerData && favoriteInfluencers.has(nextInfluencerData.id) ? "fill-current" : ""}`}
                          />
                        </Button>
                      </div>
                      <p className="mt-2 text-sm">
                        {nextInfluencerData?.description || ""}
                      </p>

                      {/* Social Media Links */}
                      <div className="flex items-center space-x-2 mt-4">
                        {nextInfluencerData?.youtube && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <a
                              href={nextInfluencerData?.youtube || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Youtube className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {nextInfluencerData?.tiktok && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="p-2"
                          >
                            <a
                              href={nextInfluencerData?.tiktok || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Music className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {nextInfluencerData?.instagram && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="p-2 text-pink-600 hover:text-pink-700"
                          >
                            <a
                              href={nextInfluencerData.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Instagram className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Influencer Management Button */}
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => setIsInfluencerManagerOpen(true)}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>{t("manage_influencers")}</span>
              </Button>
            </div>

            {/* Favorites Summary */}
            {favoriteInfluencers.size > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  {t("favorite_influencers")} ({favoriteInfluencers.size})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {influencersList
                    .filter((inf) => favoriteInfluencers.has(inf.id))
                    .map((inf) => (
                      <Badge
                        key={inf.id}
                        variant="outline"
                        className="bg-yellow-100 dark:bg-yellow-900"
                      >
                        <Star className="h-3 w-3 mr-1 fill-current text-yellow-600" />
                        {inf.name}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Influencer Management Dialog */}
      {isInfluencerManagerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {t("manage_influencers")}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setIsInfluencerManagerOpen(false)}
                >
                  {t("close")}
                </Button>
              </div>

              <div className="space-y-4">
                {influencersList.map((influencer) => (
                  <div key={influencer.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={influencer.imageUrl}
                        alt={influencer.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {influencer.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {influencer.expertise} • {influencer.followers}{" "}
                              {t("followers")}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingInfluencer(influencer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setInfluencersList((prev) =>
                                  prev.filter(
                                    (inf) => inf.id !== influencer.id,
                                  ),
                                );
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{influencer.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {influencer.youtube && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-2 text-red-600"
                            >
                              <Youtube className="h-3 w-3" />
                            </Button>
                          )}
                          {influencer.tiktok && (
                            <Button variant="outline" size="sm" className="p-2">
                              <Music className="h-3 w-3" />
                            </Button>
                          )}
                          {influencer.instagram && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-2 text-pink-600"
                            >
                              <Instagram className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Button
                  onClick={() =>
                    setEditingInfluencer({
                      id: Date.now().toString(),
                      name: "",
                      expertise: "",
                      avatar: "",
                      imageUrl: "",
                      description: "",
                      followers: "",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("add_new_influencer")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Influencer Dialog */}
      {editingInfluencer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingInfluencer.name ? t("edit") : t("new")} {t("influencer")}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  value={editingInfluencer.name}
                  onChange={(e) =>
                    setEditingInfluencer({
                      ...editingInfluencer,
                      name: e.target.value,
                      avatar: e.target.value
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase(),
                    })
                  }
                  placeholder={t("influencer_name_placeholder")}
                />
              </div>
              <div>
                <Label htmlFor="expertise">{t("expertise")}</Label>
                <Input
                  id="expertise"
                  value={editingInfluencer.expertise}
                  onChange={(e) =>
                    setEditingInfluencer({
                      ...editingInfluencer,
                      expertise: e.target.value,
                    })
                  }
                  placeholder={t("expertise_placeholder")}
                />
              </div>
              <div>
                <Label htmlFor="followers">{t("followers")}</Label>
                <Input
                  id="followers"
                  value={editingInfluencer.followers}
                  onChange={(e) =>
                    setEditingInfluencer({
                      ...editingInfluencer,
                      followers: e.target.value,
                    })
                  }
                  placeholder={t("followers_placeholder")}
                />
              </div>
              <div>
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea
                  id="description"
                  value={editingInfluencer.description}
                  onChange={(e) =>
                    setEditingInfluencer({
                      ...editingInfluencer,
                      description: e.target.value,
                    })
                  }
                  placeholder={t("influencer_description_placeholder")}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">{t("image_url")}</Label>
                <Input
                  id="imageUrl"
                  value={editingInfluencer.imageUrl}
                  onChange={(e) =>
                    setEditingInfluencer({
                      ...editingInfluencer,
                      imageUrl: e.target.value,
                    })
                  }
                  placeholder={t("image_url_placeholder")}
                />
              </div>
              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={editingInfluencer.youtube || ""}
                  onChange={(e) =>
                    setEditingInfluencer({
                      ...editingInfluencer,
                      youtube: e.target.value,
                    })
                  }
                  placeholder={t("youtube_placeholder")}
                />
              </div>
              <div>
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  value={editingInfluencer.tiktok || ""}
                  onChange={(e) =>
                    setEditingInfluencer({
                      ...editingInfluencer,
                      tiktok: e.target.value,
                    })
                  }
                  placeholder={t("tiktok_placeholder")}
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={editingInfluencer.instagram || ""}
                  onChange={(e) =>
                    setEditingInfluencer({
                      ...editingInfluencer,
                      instagram: e.target.value,
                    })
                  }
                  placeholder={t("instagram_placeholder")}
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <Button
                onClick={() => {
                  if (editingInfluencer.name && editingInfluencer.expertise) {
                    const existingIndex = influencersList.findIndex(
                      (inf) => inf.id === editingInfluencer.id,
                    );
                    if (existingIndex >= 0) {
                      // Update existing
                      setInfluencersList((prev) =>
                        prev.map((inf) =>
                          inf.id === editingInfluencer.id
                            ? editingInfluencer
                            : inf,
                        ),
                      );
                    } else {
                      // Add new
                      setInfluencersList((prev) => [
                        ...prev,
                        editingInfluencer,
                      ]);
                    }
                    setEditingInfluencer(null);
                  }
                }}
                className="flex-1"
              >
                {t("save")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingInfluencer(null)}
                className="flex-1"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

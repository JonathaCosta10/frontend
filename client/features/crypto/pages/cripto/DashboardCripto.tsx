import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bitcoin,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  AlertTriangle,
  Sparkles,
  Activity,
  PieChart,
  BarChart3,
  Target,
} from "lucide-react";
import CryptoPremiumGuard from "@/core/security/guards/CryptoPremiumGuard";
import { useTranslation } from '../../../../contexts/TranslationContext';

interface CriptoAsset {
  id: number;
  symbol: string;
  name: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  change24h: number;
  changePercent: number;
  marketCap: string;
  sector: string;
}

export default function DashboardCripto() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState("dashboard");
  // Market data for the mercado view
  const [marketData] = useState([
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: 195000,
      change24h: 1.25,
      marketCap: "1.2T",
      volume: "45.2B",
      sector: "Layer 1",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: 13500,
      change24h: -0.5,
      marketCap: "320B",
      volume: "18.7B",
      sector: "Smart Contracts",
    },
    {
      symbol: "BNB",
      name: "Binance Coin",
      price: 1350,
      change24h: 2.0,
      marketCap: "85B",
      volume: "3.2B",
      sector: "Exchange",
    },
    {
      symbol: "SOL",
      name: "Solana",
      price: 680,
      change24h: 3.8,
      marketCap: "52B",
      volume: "8.1B",
      sector: "Layer 1",
    },
    {
      symbol: "ADA",
      name: "Cardano",
      price: 2.85,
      change24h: -1.2,
      marketCap: "45B",
      volume: "2.8B",
      sector: "Smart Contracts",
    },
    {
      symbol: "XRP",
      name: "Ripple",
      price: 3.2,
      change24h: 0.8,
      marketCap: "89B",
      volume: "5.4B",
      sector: "Payment",
    },
    {
      symbol: "DOGE",
      name: "Dogecoin",
      price: 0.85,
      change24h: -2.1,
      marketCap: "32B",
      volume: "4.2B",
      sector: "Meme",
    },
    {
      symbol: "AVAX",
      name: "Avalanche",
      price: 150,
      change24h: 4.2,
      marketCap: "28B",
      volume: "1.8B",
      sector: "Layer 1",
    },
  ]);

  const [selectedSector, setSelectedSector] = useState("Todos");
  const cryptoSectors = [
    "Todos",
    "Layer 1",
    "Smart Contracts",
    "Exchange",
    "Payment",
    "Meme",
  ];

  const filteredMarketData =
    selectedSector === "Todos"
      ? marketData
      : marketData.filter((crypto) => crypto.sector === selectedSector);

  const [criptoAssets, setCriptoAssets] = useState<CriptoAsset[]>([
    {
      id: 1,
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.25,
      avgPrice: 180000,
      currentPrice: 195000,
      value: 48750,
      change24h: 2400,
      changePercent: 1.25,
      marketCap: "1.2T",
      sector: "Layer 1",
    },
    {
      id: 2,
      symbol: "ETH",
      name: "Ethereum",
      amount: 2.5,
      avgPrice: 12000,
      currentPrice: 13500,
      value: 33750,
      change24h: -675,
      changePercent: -0.5,
      marketCap: "320B",
      sector: "Smart Contracts",
    },
    {
      id: 3,
      symbol: "BNB",
      name: "Binance Coin",
      amount: 10,
      avgPrice: 1200,
      currentPrice: 1350,
      value: 13500,
      change24h: 270,
      changePercent: 2.0,
      marketCap: "85B",
      sector: "Exchange",
    },
    {
      id: 4,
      symbol: "ADA",
      name: "Cardano",
      amount: 1000,
      avgPrice: 2.5,
      currentPrice: 2.85,
      value: 2850,
      change24h: -35,
      changePercent: -1.2,
      marketCap: "45B",
      sector: "Smart Contracts",
    },
  ]);

  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    amount: "",
    avgPrice: "",
    sector: "",
  });

  // Portfolio calculations
  const totalPortfolioValue = criptoAssets.reduce(
    (sum, asset) => sum + asset.value,
    0,
  );
  const totalInvested = criptoAssets.reduce(
    (sum, asset) => sum + asset.amount * asset.avgPrice,
    0,
  );
  const totalGainLoss = totalPortfolioValue - totalInvested;
  const totalGainLossPercent = (totalGainLoss / totalInvested) * 100;

  // Sector distribution
  const sectorDistribution = criptoAssets.reduce(
    (acc, asset) => {
      acc[asset.sector] = (acc[asset.sector] || 0) + asset.value;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Best and worst performers
  const bestPerformer = criptoAssets.reduce((best, current) =>
    current.changePercent > best.changePercent ? current : best,
  );
  const worstPerformer = criptoAssets.reduce((worst, current) =>
    current.changePercent < worst.changePercent ? current : worst,
  );

  const getVariationIcon = (value: number) => {
    return value >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-success" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-destructive" />
    );
  };

  const getVariationColor = (value: number) => {
    return value >= 0 ? "text-success" : "text-destructive";
  };

  const getVariationClass = (variacao: number) => {
    if (variacao > 0) return "text-success bg-success/10";
    if (variacao < 0) return "text-destructive bg-destructive/10";
    return "text-muted-foreground bg-muted/10";
  };

  const getTopByCategory = (category: string) => {
    switch (category) {
      case "Maiores":
        return marketData
          .sort(
            (a, b) =>
              parseFloat(b.marketCap.replace(/[TB]/g, "")) -
              parseFloat(a.marketCap.replace(/[TB]/g, "")),
          )
          .slice(0, 3);
      case "Populares":
        return marketData
          .sort(
            (a, b) =>
              parseFloat(b.volume?.replace("B", "") || "0") -
              parseFloat(a.volume?.replace("B", "") || "0"),
          )
          .slice(0, 3);
      case "Valorizadas":
        return marketData.sort((a, b) => b.change24h - a.change24h).slice(0, 3);
      default:
        return [];
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleAddCrypto = () => {
    if (!formData.symbol || !formData.amount || !formData.avgPrice) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const newAsset: CriptoAsset = {
      id: Date.now(),
      symbol: formData.symbol.toUpperCase(),
      name: formData.name || formData.symbol,
      amount: parseFloat(formData.amount),
      avgPrice: parseFloat(formData.avgPrice),
      currentPrice: parseFloat(formData.avgPrice) * 1.1, // Mock current price
      value: parseFloat(formData.amount) * parseFloat(formData.avgPrice) * 1.1,
      change24h: 0,
      changePercent: 0,
      marketCap: "N/A",
      sector: formData.sector || "Outros",
    };

    setCriptoAssets([...criptoAssets, newAsset]);
    setFormData({ symbol: "", name: "", amount: "", avgPrice: "", sector: "" });
  };

  const handleDeleteAsset = (id: number) => {
    if (window.confirm("Tem certeza que deseja remover este ativo?")) {
      setCriptoAssets(criptoAssets.filter((asset) => asset.id !== id));
    }
  };

  return (
    <CryptoPremiumGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Bitcoin className="h-8 w-8 text-orange-500" />
              <span>{t("crypto_main_title")}</span>
            </h1>
            <p className="text-muted-foreground">{t("crypto_subtitle")}</p>
          </div>

          <div className="flex space-x-2">
            <Button
              variant={viewMode === "dashboard" ? "default" : "outline"}
              onClick={() => setViewMode("dashboard")}
            >
              <PieChart className="h-4 w-4 mr-2" />
              {t("dashboard")}
            </Button>
            <Button
              variant={viewMode === "mercado" ? "default" : "outline"}
              onClick={() => setViewMode("mercado")}
            >
              <Activity className="h-4 w-4 mr-2" />
              {t("mercado")}
            </Button>
            <Button
              variant={viewMode === "portfolio" ? "default" : "outline"}
              onClick={() => setViewMode("portfolio")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {t("portfolio")}
            </Button>
            <Button
              variant={viewMode === "cadastro" ? "default" : "outline"}
              onClick={() => setViewMode("cadastro")}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("cadastro")}
            </Button>
          </div>
        </div>

        {/* Dashboard Overview */}
        {viewMode === "dashboard" && (
          <>
            {/* Main metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("crypto_total_value")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Bitcoin className="h-4 w-4 text-orange-500" />
                    <span className="text-2xl font-bold">
                      {formatCurrency(totalPortfolioValue)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("crypto_current_portfolio")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("crypto_total_invested")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {formatCurrency(totalInvested)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("crypto_capital_contributed")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("crypto_profit_loss")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    {getVariationIcon(totalGainLoss)}
                    <span
                      className={`text-2xl font-bold ${getVariationColor(totalGainLoss)}`}
                    >
                      {formatCurrency(totalGainLoss)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className={getVariationColor(totalGainLossPercent)}>
                      {totalGainLossPercent >= 0 ? "+" : ""}
                      {totalGainLossPercent.toFixed(2)}%
                    </span>{" "}
                    {t("crypto_return_percentage")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("crypto_assets_count")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span className="text-2xl font-bold">
                      {criptoAssets.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("crypto_different_assets")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                    <span>Melhor Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bitcoin className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="font-medium text-lg">
                          {bestPerformer.symbol}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {bestPerformer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(bestPerformer.value)}
                        </p>
                      </div>
                    </div>
                    <div className="text-green-600 font-bold text-xl">
                      +{bestPerformer.changePercent}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <TrendingDown className="h-5 w-5" />
                    <span>Maior Queda</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bitcoin className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="font-medium text-lg">
                          {worstPerformer.symbol}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {worstPerformer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(worstPerformer.value)}
                        </p>
                      </div>
                    </div>
                    <div className="text-red-600 font-bold text-xl">
                      {worstPerformer.changePercent}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sector Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Distribuição por Setor</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(sectorDistribution).map(([sector, value]) => (
                    <div key={sector} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{sector}</span>
                        <span>
                          {formatCurrency(value)} (
                          {((value / totalPortfolioValue) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(value / totalPortfolioValue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Market View */}
        {viewMode === "mercado" && (
          <>
            {/* Market Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["Maiores", "Populares", "Valorizadas"].map((title) => (
                <Card key={title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Símbolo | Volume | Variação 24h
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {getTopByCategory(title).map((crypto, idx) => (
                      <div
                        key={`${title}-${idx}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Bitcoin className="h-5 w-5 text-orange-500" />
                          <div className="flex flex-col">
                            <span className="font-medium">{crypto.symbol}</span>
                            <span className="text-sm text-muted-foreground">
                              {crypto.volume}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCurrency(crypto.price)}
                          </div>
                          <Badge
                            className={getVariationClass(crypto.change24h)}
                          >
                            {crypto.change24h > 0 ? "+" : ""}
                            {crypto.change24h.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sector Filters */}
            <div className="flex flex-wrap gap-2">
              {cryptoSectors.map((sector) => (
                <Button
                  key={sector}
                  variant={selectedSector === sector ? "default" : "outline"}
                  onClick={() => setSelectedSector(sector)}
                  className="flex-shrink-0"
                >
                  {sector}
                </Button>
              ))}
            </div>

            {/* Market Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Mercado de Criptomoedas</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {filteredMarketData.length} de {marketData.length}{" "}
                  criptomoedas
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Moeda</TableHead>
                        <TableHead>Preço (BRL)</TableHead>
                        <TableHead>Variação 24h</TableHead>
                        <TableHead>Market Cap</TableHead>
                        <TableHead>Volume 24h</TableHead>
                        <TableHead>Setor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMarketData.map((crypto) => (
                        <TableRow
                          key={crypto.symbol}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Bitcoin className="h-5 w-5 text-orange-500" />
                              <div>
                                <div className="font-medium">
                                  {crypto.symbol}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {crypto.name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(crypto.price)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {getVariationIcon(crypto.change24h)}
                              <Badge
                                className={getVariationClass(crypto.change24h)}
                              >
                                {crypto.change24h > 0 ? "+" : ""}
                                {crypto.change24h.toFixed(2)}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {crypto.marketCap}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {crypto.volume}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {crypto.sector}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Portfolio View */}
        {viewMode === "portfolio" && (
          <Card>
            <CardHeader>
              <CardTitle>Meu Portfolio de Criptomoedas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Moeda</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Médio</TableHead>
                    <TableHead>Preço Atual</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Variaç��o 24h</TableHead>
                    <TableHead>G/P</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criptoAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div>
                          <Bitcoin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Nenhuma criptomoeda no portfolio
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    criptoAssets.map((asset) => {
                      const gainLoss =
                        asset.value - asset.amount * asset.avgPrice;
                      const gainLossPercent =
                        (gainLoss / (asset.amount * asset.avgPrice)) * 100;

                      return (
                        <TableRow key={asset.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Bitcoin className="h-4 w-4 text-orange-500" />
                              <div>
                                <p className="font-medium">{asset.symbol}</p>
                                <p className="text-xs text-muted-foreground">
                                  {asset.name}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{asset.sector}</Badge>
                          </TableCell>
                          <TableCell>{asset.amount}</TableCell>
                          <TableCell>
                            {formatCurrency(asset.avgPrice)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(asset.currentPrice)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(asset.value)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {getVariationIcon(asset.changePercent)}
                              <span
                                className={`text-sm ${getVariationColor(asset.changePercent)}`}
                              >
                                {asset.changePercent}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={getVariationColor(gainLoss)}>
                              <div className="font-semibold">
                                {formatCurrency(gainLoss)}
                              </div>
                              <div className="text-xs">
                                ({gainLossPercent.toFixed(1)}%)
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Cadastro Form */}
        {viewMode === "cadastro" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Adicionar Criptomoeda</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="symbol">Símbolo *</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) =>
                      setFormData({ ...formData, symbol: e.target.value })
                    }
                    placeholder="BTC, ETH, BNB..."
                    className="uppercase"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Bitcoin, Ethereum..."
                  />
                </div>
                <div>
                  <Label htmlFor="sector">Setor</Label>
                  <Select
                    value={formData.sector}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sector: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Layer 1">Layer 1</SelectItem>
                      <SelectItem value="Smart Contracts">
                        Smart Contracts
                      </SelectItem>
                      <SelectItem value="DeFi">DeFi</SelectItem>
                      <SelectItem value="Exchange">Exchange</SelectItem>
                      <SelectItem value="NFT">NFT</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Stablecoin">Stablecoin</SelectItem>
                      <SelectItem value="Privacy">Privacy</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Quantidade *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.00000001"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.25"
                  />
                </div>
                <div>
                  <Label htmlFor="avgPrice">Preço Médio (BRL) *</Label>
                  <Input
                    id="avgPrice"
                    type="number"
                    step="0.01"
                    value={formData.avgPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, avgPrice: e.target.value })
                    }
                    placeholder="180000"
                  />
                </div>
              </div>
              <Button onClick={handleAddCrypto} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Criptomoeda
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </CryptoPremiumGuard>
  );
}

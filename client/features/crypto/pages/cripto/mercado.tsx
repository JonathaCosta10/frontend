import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bitcoin,
  TrendingUp,
  TrendingDown,
  Search,
  Star,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from "lucide-react";
import { useTranslation } from '../../../../contexts/TranslationContext';

interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  icon: string;
}

export default function MercadoCripto() {
  const { t } = useTranslation();
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Mock crypto data similar to FII Market structure
    const mockCryptoData: CryptoAsset[] = [
      {
        symbol: "BTC",
        name: "Bitcoin",
        price: 293450.5,
        change24h: 2.45,
        volume24h: 15200000000,
        marketCap: 5750000000000,
        rank: 1,
        icon: "₿",
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        price: 12250.75,
        change24h: -1.23,
        volume24h: 8900000000,
        marketCap: 1470000000000,
        rank: 2,
        icon: "Ξ",
      },
      {
        symbol: "SOL",
        name: "Solana",
        price: 485.3,
        change24h: 5.67,
        volume24h: 1200000000,
        marketCap: 228000000000,
        rank: 3,
        icon: "◎",
      },
      {
        symbol: "XRP",
        name: "Ripple",
        price: 3.15,
        change24h: -0.89,
        volume24h: 980000000,
        marketCap: 180000000000,
        rank: 4,
        icon: "◉",
      },
      {
        symbol: "ADA",
        name: "Cardano",
        price: 2.45,
        change24h: 1.78,
        volume24h: 650000000,
        marketCap: 87000000000,
        rank: 5,
        icon: "₳",
      },
      {
        symbol: "AVAX",
        name: "Avalanche",
        price: 175.8,
        change24h: 3.21,
        volume24h: 420000000,
        marketCap: 70000000000,
        rank: 6,
        icon: "▲",
      },
      {
        symbol: "DOT",
        name: "Polkadot",
        price: 28.9,
        change24h: -2.15,
        volume24h: 380000000,
        marketCap: 42000000000,
        rank: 7,
        icon: "●",
      },
      {
        symbol: "MATIC",
        name: "Polygon",
        price: 4.65,
        change24h: 4.33,
        volume24h: 290000000,
        marketCap: 46000000000,
        rank: 8,
        icon: "⬟",
      },
    ];

    setTimeout(() => {
      setCryptoAssets(mockCryptoData);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) {
      return `R$ ${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `R$ ${(value / 1e6).toFixed(1)}M`;
    }
    return formatCurrency(value);
  };

  const filteredAssets = cryptoAssets
    .filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return b.price - a.price;
        case "change":
          return b.change24h - a.change24h;
        case "volume":
          return b.volume24h - a.volume24h;
        case "marketCap":
          return b.marketCap - a.marketCap;
        default:
          return a.rank - b.rank;
      }
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              {t("loading_crypto_market")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <Bitcoin className="h-6 w-6 text-orange-500" />
          <span>{t("crypto_market_title")}</span>
        </h2>
        <p className="text-muted-foreground">
          {t("follow_digital_assets_realtime")}
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("search_cryptocurrency")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("sort_by")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rank">{t("ranking")}</SelectItem>
            <SelectItem value="price">{t("price")}</SelectItem>
            <SelectItem value="change">{t("change_24h")}</SelectItem>
            <SelectItem value="volume">{t("volume")}</SelectItem>
            <SelectItem value="marketCap">{t("market_cap")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bitcoin className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("btc_dominance")}
                </p>
                <p className="font-semibold">52.4%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("total_market_cap")}
                </p>
                <p className="font-semibold">R$ 8.2T</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("volume_24h")}
                </p>
                <p className="font-semibold">R$ 89.5B</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("active_assets")}
                </p>
                <p className="font-semibold">2,847</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crypto Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("main_cryptocurrencies")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("rank")}</TableHead>
                <TableHead>{t("asset")}</TableHead>
                <TableHead>{t("price")}</TableHead>
                <TableHead>{t("change_24h")}</TableHead>
                <TableHead>{t("volume_24h")}</TableHead>
                <TableHead>{t("market_cap")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.symbol}>
                  <TableCell className="font-medium">#{asset.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <span className="text-orange-600 font-semibold">
                          {asset.icon}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{asset.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {asset.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(asset.price)}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`flex items-center space-x-1 ${
                        asset.change24h > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {asset.change24h > 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {asset.change24h > 0 ? "+" : ""}
                        {asset.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatVolume(asset.volume24h)}</TableCell>
                  <TableCell>{formatVolume(asset.marketCap)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Star className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

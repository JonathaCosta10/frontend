import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";

interface FinancialData {
  ticker: string;
  preco: number;
  variacao: number;
  marketCap: string;
  setor: string;
  volume?: string;
}

export default function FIIMarket() {
  const { t, formatCurrency } = useTranslation();
  const navigate = useNavigate();
  const [setorSelecionado, setSetorSelecionado] = useState(t("all_sectors"));
  const [dados, setDados] = useState<FinancialData[]>([]);

  const handleTickerSearch = (ticker: string) => {
    navigate(`/dashboard/mercado/analise-ticker?ticker=${ticker}`);
  };

  useEffect(() => {
    // Sample financial data
    setDados([
      {
        ticker: "HGLG11",
        preco: 123.45,
        variacao: 1.2,
        marketCap: "2.1B",
        setor: t("logistics"),
        volume: "1.2M",
      },
      {
        ticker: "KNRI11",
        preco: 110.22,
        variacao: -0.5,
        marketCap: "3.2B",
        setor: t("corporate"),
        volume: "856K",
      },
      {
        ticker: "MXRF11",
        preco: 10.01,
        variacao: 0.8,
        marketCap: "4.1B",
        setor: t("hybrid"),
        volume: "2.1M",
      },
      {
        ticker: "XPLG11",
        preco: 89.67,
        variacao: 2.1,
        marketCap: "1.8B",
        setor: t("logistics"),
        volume: "934K",
      },
      {
        ticker: "BTLG11",
        preco: 95.33,
        variacao: -1.3,
        marketCap: "2.7B",
        setor: t("corporate"),
        volume: "756K",
      },
      {
        ticker: "VILG11",
        preco: 102.89,
        variacao: 0.4,
        marketCap: "3.9B",
        setor: t("hybrid"),
        volume: "1.5M",
      },
      {
        ticker: "RBRR11",
        preco: 78.92,
        variacao: 1.8,
        marketCap: "1.4B",
        setor: t("logistics"),
        volume: "1.8M",
      },
      {
        ticker: "BCFF11",
        preco: 87.45,
        variacao: -0.9,
        marketCap: "2.3B",
        setor: t("corporate"),
        volume: "623K",
      },
    ]);
  }, [t]);

  const setores = [
    t("all_sectors"),
    t("logistics"),
    t("corporate"),
    t("hybrid"),
  ];
  const dadosFiltrados =
    setorSelecionado === t("all_sectors")
      ? dados
      : dados.filter((item) => item.setor === setorSelecionado);

  const getVariationClass = (variacao: number) => {
    if (variacao > 0) return "text-success bg-success/10";
    if (variacao < 0) return "text-destructive bg-destructive/10";
    return "text-muted-foreground bg-muted/10";
  };

  const getTopByCategory = (category: string) => {
    switch (category) {
      case t("biggest"):
        return dados
          .sort(
            (a, b) =>
              parseFloat(b.marketCap.replace("B", "")) -
              parseFloat(a.marketCap.replace("B", "")),
          )
          .slice(0, 3);
      case t("popular"):
        return dados
          .sort(
            (a, b) =>
              parseFloat(b.volume?.replace("M", "") || "0") -
              parseFloat(a.volume?.replace("M", "") || "0"),
          )
          .slice(0, 3);
      case t("new"):
        return dados.sort((a, b) => b.variacao - a.variacao).slice(0, 3);
      default:
        return [];
    }
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-8">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[t("biggest"), t("popular"), t("new")].map((title) => (
          <Card key={title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("ticker_volume_variation")}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {getTopByCategory(title).map((item, idx) => (
                <div
                  key={`${title}-${idx}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{item.ticker}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.volume || "N/A"}
                    </span>
                  </div>
                  <Badge className={getVariationClass(item.variacao)}>
                    {item.variacao > 0 ? "+" : ""}
                    {item.variacao.toFixed(2)}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {setores.map((setor) => (
          <Button
            key={setor}
            variant={setorSelecionado === setor ? "default" : "outline"}
            onClick={() => setSetorSelecionado(setor)}
            className="flex-shrink-0"
          >
            {setor}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("real_estate_funds")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("funds_of_total", {
              filtered: dadosFiltrados.length,
              total: dados.length,
            })}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("ticker")}</TableHead>
                  <TableHead>{t("price")}</TableHead>
                  <TableHead>{t("variation_d1")}</TableHead>
                  <TableHead>{t("market_cap")}</TableHead>
                  <TableHead>{t("sector")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosFiltrados.map((ativo) => (
                  <TableRow key={ativo.ticker} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {ativo.ticker}
                    </TableCell>
                    <TableCell>{formatCurrency(ativo.preco)}</TableCell>
                    <TableCell>
                      <Badge className={getVariationClass(ativo.variacao)}>
                        {ativo.variacao > 0 ? "+" : ""}
                        {ativo.variacao.toFixed(2)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{ativo.marketCap}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ativo.setor}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTickerSearch(ativo.ticker)}
                        className="h-8 w-8 p-0"
                        title={t("analyze_ticker", { ticker: ativo.ticker })}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
    </MarketPremiumGuard>
  );
}

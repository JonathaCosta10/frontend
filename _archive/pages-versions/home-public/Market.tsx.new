import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  ArrowRight,
  Search,
  LineChart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import PublicLayout from "@/components/PublicLayout";

export default function Market() {
  const { t } = useTranslation();

  // Mock data for market stats
  const marketStats = [
    {
      name: "Índice Bovespa",
      value: "118.432,63",
      change: "+1.24%",
      changeType: "up",
    },
    {
      name: "S&P 500",
      value: "4.783,45",
      change: "+0.63%",
      changeType: "up",
    },
    {
      name: "Dólar",
      value: "R$ 4,92",
      change: "-0.35%",
      changeType: "down",
    },
    {
      name: "Euro",
      value: "R$ 5,38",
      change: "-0.12%",
      changeType: "down",
    },
  ];

  // Mock data for market trends
  const trends = [
    {
      name: "Tecnologia",
      growth: "+3.5%",
      direction: "up",
      description:
        "Setor de tecnologia continua em alta com crescimento acima da média do mercado.",
    },
    {
      name: "Energia Renovável",
      growth: "+5.2%",
      direction: "up",
      description:
        "Empresas de energia limpa mostram forte desempenho com novos investimentos globais.",
    },
    {
      name: "Varejo Tradicional",
      growth: "-1.7%",
      direction: "down",
      description:
        "Setor sofre pressão com mudança para compras online e inflação elevada.",
    },
    {
      name: "Commodities",
      growth: "+2.1%",
      direction: "up",
      description:
        "Preços de commodities em alta com aumento da demanda global e problemas na cadeia de suprimentos.",
    },
  ];

  // Mock data for top assets
  const topAssets = [
    {
      name: "PETR4",
      company: "Petrobras",
      price: "R$ 36,45",
      change: "+2.3%",
      changeType: "up",
    },
    {
      name: "VALE3",
      company: "Vale",
      price: "R$ 72,13",
      change: "+1.5%",
      changeType: "up",
    },
    {
      name: "ITUB4",
      company: "Itaú Unibanco",
      price: "R$ 34,29",
      change: "+0.8%",
      changeType: "up",
    },
    {
      name: "MGLU3",
      company: "Magazine Luiza",
      price: "R$ 1,97",
      change: "-3.2%",
      changeType: "down",
    },
    {
      name: "BBDC4",
      company: "Bradesco",
      price: "R$ 16,82",
      change: "-0.5%",
      changeType: "down",
    },
    {
      name: "WEGE3",
      company: "WEG",
      price: "R$ 42,56",
      change: "+2.1%",
      changeType: "up",
    },
  ];

  // Mock data for economic indicators
  const indicators = [
    { name: "Inflação (IPCA)", value: "4.23%", change: "-0.15%" },
    { name: "Taxa SELIC", value: "10.75%", change: "0.00%" },
    { name: "PIB (YoY)", value: "2.9%", change: "+0.3%" },
    { name: "Desemprego", value: "7.5%", change: "-0.2%" },
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Mercado Financeiro</h1>
              <p className="text-lg text-muted-foreground">
                Acompanhe as principais notícias e tendências do mercado financeiro
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar ativo ou notícia..."
                  className="pl-10 pr-4 py-2 w-full rounded-md border border-input bg-background"
                />
              </div>
            </div>
          </div>

          {/* Market Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketStats.map((stat) => (
              <Card key={stat.name} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{stat.name}</p>
                    {stat.changeType === "up" ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Market Trends Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Tendências de Mercado</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/market/trends">
                Ver todas
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.map((trend) => (
              <Card key={trend.name} className="border border-border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold">{trend.name}</h3>
                    {trend.direction === "up" ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {trend.growth}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {trend.growth}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{trend.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Top Assets Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Ativos em Destaque</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/cripto-market">
                Ver Criptomoedas
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4">Ativo</th>
                  <th className="text-right py-4 px-4">Preço Atual</th>
                  <th className="text-right py-4 px-4">Variação 24h</th>
                </tr>
              </thead>
              <tbody>
                {topAssets.map((asset) => (
                  <tr key={asset.name} className="border-b border-border hover:bg-muted/50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-sm text-muted-foreground">{asset.company}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-medium">
                      {asset.price}
                    </td>
                    <td className={`py-4 px-4 text-right ${
                      asset.changeType === "up" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      <div className="flex items-center justify-end">
                        {asset.changeType === "up" ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {asset.change}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Economic Indicators Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Indicadores Econômicos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {indicators.map((indicator) => (
              <Card key={indicator.name} className="border border-border">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">{indicator.name}</p>
                  <p className="text-2xl font-bold mb-1">{indicator.value}</p>
                  <p className={`text-sm ${
                    indicator.change.startsWith("+") 
                      ? "text-green-600 dark:text-green-400" 
                      : indicator.change.startsWith("-") 
                      ? "text-red-600 dark:text-red-400" 
                      : "text-muted-foreground"
                  }`}>
                    {indicator.change} vs mês anterior
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Gráficos de Mercado</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Ibovespa - Últimos 30 dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[16/9] bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico do Ibovespa seria exibido aqui</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Comparativo de Setores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[16/9] bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de comparação seria exibido aqui</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-8">
          <Card className="border border-border bg-muted/50">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <h2 className="text-2xl font-bold mb-2">
                    Acompanhe seu portfólio de investimentos
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Crie uma conta gratuita e tenha acesso a ferramentas avançadas de análise 
                    para monitorar e otimizar seus investimentos.
                  </p>
                  <div className="flex gap-4">
                    <Button asChild>
                      <Link to="/signup">Criar Conta Grátis</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/about">Saiba Mais</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <PieChart className="h-28 w-28 text-primary/20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Disclaimer Section */}
        <div className="text-sm text-muted-foreground border-t pt-6">
          <p className="mb-2">
            <strong>Aviso legal:</strong> As informações contidas nesta página são apenas para fins informativos 
            e educacionais. Não constituem recomendação de investimento ou consultoria financeira.
          </p>
          <p>
            Investimentos envolvem riscos, incluindo possível perda do principal investido. 
            O desempenho passado não é garantia de resultados futuros.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}

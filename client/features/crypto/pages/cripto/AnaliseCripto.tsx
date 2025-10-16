import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart3,
  PieChart,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";

interface CryptoAnalysis {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  change30d: number;
  volume: number;
  marketCap: number;
  circulatingSupply: number;
  maxSupply: number;
  technicalIndicators: {
    rsi: number;
    macd: "bullish" | "bearish";
    movingAverage: "above" | "below";
    support: number;
    resistance: number;
  };
  sentiment: "bullish" | "bearish" | "neutral";
  riskLevel: "low" | "medium" | "high";
  recommendation: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
}

export default function AnaliseCripto() {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [loading, setLoading] = useState(false);

  const cryptoAnalysis: Record<string, CryptoAnalysis> = {
    BTC: {
      symbol: "BTC",
      name: "Bitcoin",
      price: 293450.50,
      change24h: 2.45,
      change7d: 8.12,
      change30d: 15.67,
      volume: 15200000000,
      marketCap: 5750000000000,
      circulatingSupply: 19600000,
      maxSupply: 21000000,
      technicalIndicators: {
        rsi: 65.4,
        macd: "bullish",
        movingAverage: "above",
        support: 285000,
        resistance: 310000,
      },
      sentiment: "bullish",
      riskLevel: "medium",
      recommendation: "buy",
    },
    ETH: {
      symbol: "ETH",
      name: "Ethereum",
      price: 12250.75,
      change24h: -1.23,
      change7d: 5.89,
      change30d: 22.45,
      volume: 8900000000,
      marketCap: 1470000000000,
      circulatingSupply: 120000000,
      maxSupply: 0, // No max supply
      technicalIndicators: {
        rsi: 58.2,
        macd: "bearish",
        movingAverage: "above",
        support: 11800,
        resistance: 13500,
      },
      sentiment: "neutral",
      riskLevel: "medium",
      recommendation: "hold",
    },
    SOL: {
      symbol: "SOL",
      name: "Solana",
      price: 485.30,
      change24h: 5.67,
      change7d: 12.34,
      change30d: 45.78,
      volume: 1200000000,
      marketCap: 228000000000,
      circulatingSupply: 470000000,
      maxSupply: 0,
      technicalIndicators: {
        rsi: 72.1,
        macd: "bullish",
        movingAverage: "above",
        support: 450,
        resistance: 520,
      },
      sentiment: "bullish",
      riskLevel: "high",
      recommendation: "strong_buy",
    }
  };

  const analysis = cryptoAnalysis[selectedCrypto];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "strong_buy": return "text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-200";
      case "buy": return "text-green-600 bg-green-50 dark:bg-green-900/50 dark:text-green-300";
      case "hold": return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/50 dark:text-yellow-300";
      case "sell": return "text-red-600 bg-red-50 dark:bg-red-900/50 dark:text-red-300";
      case "strong_sell": return "text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getRecommendationText = (rec: string) => {
    switch (rec) {
      case "strong_buy": return "COMPRA FORTE";
      case "buy": return "COMPRA";
      case "hold": return "MANTER";
      case "sell": return "VENDA";
      case "strong_sell": return "VENDA FORTE";
      default: return "NEUTRO";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-blue-500" />
          <span>Análise de Criptomoedas</span>
        </h2>
        <p className="text-muted-foreground">
          Análise técnica e fundamentalista detalhada de ativos digitais
        </p>
      </div>

      {/* Search and Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Digite o símbolo da criptomoeda (ex: BTC, ETH, SOL)"
                className="pl-10"
              />
            </div>
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar ativo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">₿ Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETH">Ξ Ethereum (ETH)</SelectItem>
                <SelectItem value="SOL">◎ Solana (SOL)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setLoading(true)}>
              <Search className="h-4 w-4 mr-2" />
              Analisar
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bitcoin className="h-5 w-5 text-orange-500" />
                  <span>{analysis.name} ({analysis.symbol})</span>
                </div>
                <Badge className={getRecommendationColor(analysis.recommendation)}>
                  {getRecommendationText(analysis.recommendation)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{formatCurrency(analysis.price)}</p>
                  <p className="text-sm text-muted-foreground">Preço Atual</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${analysis.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.change24h > 0 ? '+' : ''}{analysis.change24h.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Variação 24h</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${analysis.change7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.change7d > 0 ? '+' : ''}{analysis.change7d.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Variação 7d</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${analysis.change30d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.change30d > 0 ? '+' : ''}{analysis.change30d.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Variação 30d</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="technical" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="technical">Análise Técnica</TabsTrigger>
              <TabsTrigger value="fundamental">Análise Fundamentalista</TabsTrigger>
              <TabsTrigger value="risk">Análise de Risco</TabsTrigger>
            </TabsList>

            <TabsContent value="technical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Indicadores Técnicos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>RSI (14)</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{analysis.technicalIndicators.rsi}</span>
                        <Badge variant={analysis.technicalIndicators.rsi > 70 ? "destructive" : analysis.technicalIndicators.rsi < 30 ? "secondary" : "outline"}>
                          {analysis.technicalIndicators.rsi > 70 ? "Sobrecomprado" : analysis.technicalIndicators.rsi < 30 ? "Sobrevendido" : "Neutro"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>MACD</span>
                      <Badge variant={analysis.technicalIndicators.macd === "bullish" ? "default" : "destructive"}>
                        {analysis.technicalIndicators.macd === "bullish" ? "Alta" : "Baixa"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Média Móvel</span>
                      <Badge variant={analysis.technicalIndicators.movingAverage === "above" ? "default" : "destructive"}>
                        {analysis.technicalIndicators.movingAverage === "above" ? "Acima" : "Abaixo"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Suporte e Resistência</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Suporte</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(analysis.technicalIndicators.support)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Preço Atual</span>
                      <span className="font-medium">{formatCurrency(analysis.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Resistência</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(analysis.technicalIndicators.resistance)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{
                          width: `${((analysis.price - analysis.technicalIndicators.support) / 
                                   (analysis.technicalIndicators.resistance - analysis.technicalIndicators.support)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="fundamental" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas Fundamentalistas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Market Cap</span>
                      <span className="font-medium">R$ {(analysis.marketCap / 1e12).toFixed(2)}T</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volume 24h</span>
                      <span className="font-medium">R$ {(analysis.volume / 1e9).toFixed(1)}B</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Oferta Circulante</span>
                      <span className="font-medium">{(analysis.circulatingSupply / 1e6).toFixed(1)}M</span>
                    </div>
                    {analysis.maxSupply > 0 && (
                      <div className="flex justify-between">
                        <span>Oferta Máxima</span>
                        <span className="font-medium">{(analysis.maxSupply / 1e6).toFixed(1)}M</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sentimento de Mercado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Sentimento Geral</span>
                      <Badge variant={
                        analysis.sentiment === "bullish" ? "default" : 
                        analysis.sentiment === "bearish" ? "destructive" : "secondary"
                      }>
                        {analysis.sentiment === "bullish" ? "Otimista" : 
                         analysis.sentiment === "bearish" ? "Pessimista" : "Neutro"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Nível de Risco</span>
                      <Badge variant={
                        analysis.riskLevel === "low" ? "default" : 
                        analysis.riskLevel === "medium" ? "secondary" : "destructive"
                      }>
                        {analysis.riskLevel === "low" ? "Baixo" : 
                         analysis.riskLevel === "medium" ? "Médio" : "Alto"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Risco</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                        Fatores de Risco
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Alta volatilidade característica do mercado cripto</li>
                        <li>• Regulamentação em desenvolvimento</li>
                        <li>• Riscos tecnológicos e de segurança</li>
                        <li>• Dependência de adoção e sentimento do mercado</li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Pontos Positivos
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Tecnologia blockchain consolidada</li>
                        <li>• Crescente adoção institucional</li>
                        <li>• Potencial de valorização a longo prazo</li>
                        <li>• Diversificação de portfólio</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Building,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  LineChart,
  Minus,
  Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";
import { analisarAtivoAcoes } from "@/services/investmentService";
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AcaoAnaliseDetalhada() {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();

  console.log('Ticker recebido na página de ações:', ticker);

  // Verificar se o ticker é válido
  if (!ticker) {
    console.error('Ticker não encontrado nos parâmetros da URL');
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Erro: Ticker não especificado</p>
        <button 
          onClick={() => navigate('/dashboard/mercado/analise-ticker')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Voltar para Busca
        </button>
      </div>
    );
  }

  // Query para análise da ação
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    error: analysisError,
    refetch: refetchAnalysis
  } = useQuery({
    queryKey: ['acao-analysis-detalhada', ticker],
    queryFn: () => analisarAtivoAcoes(ticker!),
    enabled: !!ticker && ticker.length >= 3,
    staleTime: 5 * 60 * 1000,
  });

  // Funções de formatação
  const formatCurrency = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatPercentage = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return '0,00%';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue / 100);
  };

  const formatNumberWithDecimals = (value: number | string | null | undefined, decimals: number = 2) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return '0';
    }
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numValue);
  };

  const formatLargeNumber = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return '0';
    }
    
    if (numValue >= 1000000000) {
      return `${(numValue / 1000000000).toFixed(1)}B`;
    } else if (numValue >= 1000000) {
      return `${(numValue / 1000000).toFixed(1)}M`;
    } else if (numValue >= 1000) {
      return `${(numValue / 1000).toFixed(1)}K`;
    }
    return numValue.toString();
  };

  const getVariationIcon = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
    if (numValue > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (numValue < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getVariationColor = (value: number | string | null | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return 'text-gray-600';
    }
    return numValue >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getIndicatorColor = (value: number | string | null | undefined, type: 'p_l' | 'p_vp' | 'roe' | 'dividend_yield') => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return 'gray';
    }

    switch (type) {
      case 'p_l':
        if (numValue < 10) return 'green';
        if (numValue < 20) return 'yellow';
        return 'red';
      case 'p_vp':
        if (numValue < 1) return 'green';
        if (numValue < 2) return 'yellow';
        return 'red';
      case 'roe':
        if (numValue > 15) return 'green';
        if (numValue > 10) return 'yellow';
        return 'red';
      case 'dividend_yield':
        if (numValue > 6) return 'green';
        if (numValue > 3) return 'yellow';
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/mercado/analise-ticker')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Análise de Ação: {ticker?.toUpperCase()}</h1>
            <p className="text-muted-foreground">Análise fundamentalista detalhada da ação</p>
          </div>
        </div>

        {/* Loading State */}
        {isAnalysisLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Carregando análise detalhada da ação {ticker?.toUpperCase()}...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {analysisError && (
          <Card>
            <CardContent className="p-8 text-center text-red-600">
              <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
              <p>Erro ao carregar análise: {analysisError.message}</p>
              <Button onClick={() => refetchAnalysis()} className="mt-4">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Analysis Data */}
        {analysisData && (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Building className="h-6 w-6" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nome da Empresa</p>
                    <p className="font-semibold">{analysisData.nome_empresa || analysisData.razao_social || ticker?.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Setor</p>
                    <p className="font-semibold">{analysisData.setor || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Preço Atual</p>
                    <p className="font-semibold text-lg">{formatCurrency(analysisData.preco_atual)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Variação Diária</p>
                    <div className="flex items-center gap-1">
                      {getVariationIcon(analysisData.variacao_dia)}
                      <p className={`font-semibold ${getVariationColor(analysisData.variacao_dia)}`}>
                        {formatPercentage(analysisData.variacao_dia)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Volume</p>
                    <p className="font-semibold">{formatLargeNumber(analysisData.volume)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Market Cap</p>
                    <p className="font-semibold">{formatCurrency(analysisData.market_cap)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indicadores Fundamentalistas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6" />
                  Indicadores Fundamentalistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${
                    getIndicatorColor(analysisData.p_l, 'p_l') === 'green' ? 'bg-green-50' :
                    getIndicatorColor(analysisData.p_l, 'p_l') === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                    <p className={`text-sm font-medium ${
                      getIndicatorColor(analysisData.p_l, 'p_l') === 'green' ? 'text-green-600' :
                      getIndicatorColor(analysisData.p_l, 'p_l') === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                    }`}>P/L (Preço/Lucro)</p>
                    <p className={`text-2xl font-bold ${
                      getIndicatorColor(analysisData.p_l, 'p_l') === 'green' ? 'text-green-700' :
                      getIndicatorColor(analysisData.p_l, 'p_l') === 'yellow' ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {formatNumberWithDecimals(analysisData.p_l)}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    getIndicatorColor(analysisData.p_vp, 'p_vp') === 'green' ? 'bg-green-50' :
                    getIndicatorColor(analysisData.p_vp, 'p_vp') === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                    <p className={`text-sm font-medium ${
                      getIndicatorColor(analysisData.p_vp, 'p_vp') === 'green' ? 'text-green-600' :
                      getIndicatorColor(analysisData.p_vp, 'p_vp') === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                    }`}>P/VP (Preço/Valor Patrimonial)</p>
                    <p className={`text-2xl font-bold ${
                      getIndicatorColor(analysisData.p_vp, 'p_vp') === 'green' ? 'text-green-700' :
                      getIndicatorColor(analysisData.p_vp, 'p_vp') === 'yellow' ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {formatNumberWithDecimals(analysisData.p_vp)}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    getIndicatorColor(analysisData.roe, 'roe') === 'green' ? 'bg-green-50' :
                    getIndicatorColor(analysisData.roe, 'roe') === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                    <p className={`text-sm font-medium ${
                      getIndicatorColor(analysisData.roe, 'roe') === 'green' ? 'text-green-600' :
                      getIndicatorColor(analysisData.roe, 'roe') === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                    }`}>ROE</p>
                    <p className={`text-2xl font-bold ${
                      getIndicatorColor(analysisData.roe, 'roe') === 'green' ? 'text-green-700' :
                      getIndicatorColor(analysisData.roe, 'roe') === 'yellow' ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {formatPercentage(analysisData.roe)}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    getIndicatorColor(analysisData.dividend_yield, 'dividend_yield') === 'green' ? 'bg-green-50' :
                    getIndicatorColor(analysisData.dividend_yield, 'dividend_yield') === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                    <p className={`text-sm font-medium ${
                      getIndicatorColor(analysisData.dividend_yield, 'dividend_yield') === 'green' ? 'text-green-600' :
                      getIndicatorColor(analysisData.dividend_yield, 'dividend_yield') === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                    }`}>Dividend Yield</p>
                    <p className={`text-2xl font-bold ${
                      getIndicatorColor(analysisData.dividend_yield, 'dividend_yield') === 'green' ? 'text-green-700' :
                      getIndicatorColor(analysisData.dividend_yield, 'dividend_yield') === 'yellow' ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {formatPercentage(analysisData.dividend_yield)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Histórica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6" />
                  Performance Histórica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rentabilidade 1 Mês</p>
                    <div className="flex items-center gap-1">
                      {getVariationIcon(analysisData.rentabilidade_1m)}
                      <p className={`font-semibold ${getVariationColor(analysisData.rentabilidade_1m)}`}>
                        {formatPercentage(analysisData.rentabilidade_1m)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rentabilidade 12 Meses</p>
                    <div className="flex items-center gap-1">
                      {getVariationIcon(analysisData.rentabilidade_12m)}
                      <p className={`font-semibold ${getVariationColor(analysisData.rentabilidade_12m)}`}>
                        {formatPercentage(analysisData.rentabilidade_12m)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rentabilidade Total</p>
                    <div className="flex items-center gap-1">
                      {getVariationIcon(analysisData.rentabilidade_total)}
                      <p className={`font-semibold ${getVariationColor(analysisData.rentabilidade_total)}`}>
                        {formatPercentage(analysisData.rentabilidade_total)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indicadores Financeiros Adicionais */}
            {(analysisData.ebitda || analysisData.receita_liquida || analysisData.lucro_liquido) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <DollarSign className="h-6 w-6" />
                    Indicadores Financeiros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisData.receita_liquida && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Receita Líquida</p>
                        <p className="font-semibold text-lg">{formatCurrency(analysisData.receita_liquida)}</p>
                      </div>
                    )}
                    {analysisData.lucro_liquido && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                        <p className="font-semibold text-lg">{formatCurrency(analysisData.lucro_liquido)}</p>
                      </div>
                    )}
                    {analysisData.ebitda && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">EBITDA</p>
                        <p className="font-semibold text-lg">{formatCurrency(analysisData.ebitda)}</p>
                      </div>
                    )}
                    {analysisData.margem_ebitda && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Margem EBITDA</p>
                        <p className="font-semibold">{formatPercentage(analysisData.margem_ebitda)}</p>
                      </div>
                    )}
                    {analysisData.margem_liquida && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Margem Líquida</p>
                        <p className="font-semibold">{formatPercentage(analysisData.margem_liquida)}</p>
                      </div>
                    )}
                    {analysisData.roa && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">ROA</p>
                        <p className="font-semibold">{formatPercentage(analysisData.roa)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dados Brutos para Debug (remover em produção) */}
            <Card>
              <CardHeader>
                <CardTitle>Dados da API (Debug)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(analysisData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MarketPremiumGuard>
  );
}
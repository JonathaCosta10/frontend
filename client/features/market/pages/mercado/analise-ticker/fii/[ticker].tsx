import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  LineChart,
  Minus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import MarketPremiumGuard from "@/core/security/guards/MarketPremiumGuard";
import { analisarAtivoFII } from "@/features/investments/services/investmentService";
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

export default function FIIAnaliseDetalhada() {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();

  console.log('Ticker recebido na página de FII:', ticker);

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

  // Query para análise do FII
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    error: analysisError,
    refetch: refetchAnalysis
  } = useQuery({
    queryKey: ['fii-analysis-detalhada', ticker],
    queryFn: () => analisarAtivoFII(ticker!),
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

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/mercado/analise-ticker')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Análise de FII: {ticker?.toUpperCase()}</h1>
            <p className="text-muted-foreground">Análise detalhada do Fundo de Investimento Imobiliário</p>
          </div>
        </div>

        {/* Loading State */}
        {isAnalysisLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Carregando análise detalhada do FII {ticker?.toUpperCase()}...</p>
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
                  <Building2 className="h-6 w-6" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nome do Fundo</p>
                    <p className="font-semibold">{analysisData.nome_fundo || ticker?.toUpperCase()}</p>
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
                    <p className="font-semibold">{formatNumberWithDecimals(analysisData.volume, 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Market Cap</p>
                    <p className="font-semibold">{formatCurrency(analysisData.market_cap)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indicadores de Rentabilidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6" />
                  Indicadores de Rentabilidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-600">Dividend Yield</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatPercentage(analysisData.dividend_yield)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-600">P/VP</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatNumberWithDecimals(analysisData.p_vp)}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-600">Valor Patrimonial</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {formatCurrency(analysisData.valor_patrimonial)}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-orange-600">Vacância</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {formatPercentage(analysisData.vacancia)}
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

            {/* Informações Adicionais */}
            {(analysisData.imoveis || analysisData.total_imoveis || analysisData.gestora) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Building2 className="h-6 w-6" />
                    Informações do Fundo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisData.gestora && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Gestora</p>
                        <p className="font-semibold">{analysisData.gestora}</p>
                      </div>
                    )}
                    {analysisData.total_imoveis && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total de Imóveis</p>
                        <p className="font-semibold">{analysisData.total_imoveis}</p>
                      </div>
                    )}
                    {analysisData.area_total && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Área Total</p>
                        <p className="font-semibold">{formatNumberWithDecimals(analysisData.area_total, 0)} m²</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Distribuições */}
            {analysisData.ultima_distribuicao && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Calendar className="h-6 w-6" />
                    Histórico de Distribuições
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Última Distribuição</p>
                      <p className="font-semibold text-lg">{formatCurrency(analysisData.ultima_distribuicao)}</p>
                    </div>
                    {analysisData.data_ultima_distribuicao && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Data da Última Distribuição</p>
                        <p className="font-semibold">{analysisData.data_ultima_distribuicao}</p>
                      </div>
                    )}
                    {analysisData.distribuicoes_12m && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Distribuições 12M</p>
                        <p className="font-semibold">{formatCurrency(analysisData.distribuicoes_12m)}</p>
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
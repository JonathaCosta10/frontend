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
    queryFn: () => {
      console.log('Chamando API de ações para ticker:', ticker);
      console.log('URL da API será:', `http://127.0.0.1:5000/api/investimentos/analise-ativo/acoes/?ticker=${ticker}`);
      return analisarAtivoAcoes(ticker!);
    },
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
            <h1 className="text-3xl font-bold">Análise de Ação: {ticker?.toUpperCase()}</h1>
            <p className="text-muted-foreground">Análise fundamentalista detalhada da ação</p>
            <p className="text-xs text-blue-600 mt-1">API: http://127.0.0.1:5000/api/investimentos/analise-ativo/acoes/?ticker={ticker}</p>
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
                </div>
              </CardContent>
            </Card>

            {/* Dados Brutos para Debug */}
            <Card>
              <CardHeader>
                <CardTitle>Dados da API</CardTitle>
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
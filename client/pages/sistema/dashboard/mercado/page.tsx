import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, TrendingDown, BarChart3, PieChart, DollarSign, Target, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";
import { marketApi } from "@/services/api/market";

export default function MercadoPage() {
  const navigate = useNavigate();
  const [tipoAtivo, setTipoAtivo] = useState<"acao" | "fii" | "todos">("todos");
  const [currentView, setCurrentView] = useState<"destaques" | "analise">("destaques");

  const {
    data: marketResponse,
    isLoading,
    isError,
    refetch,
    error
  } = useQuery({
    queryKey: ['market-destaques-gerais'],
    queryFn: marketApi.getDestaquesGerais,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatMilhoes = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}B`;
    }
    return `R$ ${value.toFixed(1)}M`;
  };

  const formatVariacao = (variacao: number) => {
    return `${variacao > 0 ? '+' : ''}${variacao.toFixed(2)}%`;
  };

  const getVariationClass = (variacao: number) => {
    if (variacao > 0) return "text-green-600 bg-green-50";
    if (variacao < 0) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  if (isLoading) {
    return (
      <MarketPremiumGuard marketFeature="ticker-analysis">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="ml-4">Carregando dados do mercado...</p>
        </div>
      </MarketPremiumGuard>
    );
  }

  if (isError) {
    return (
      <MarketPremiumGuard marketFeature="ticker-analysis">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-500">Erro: {error?.message}</p>
            <Button onClick={() => refetch()} className="mt-2">
              Tentar novamente
            </Button>
          </div>
        </div>
      </MarketPremiumGuard>
    );
  }

  if (!marketResponse?.success || !marketResponse?.data) {
    return (
      <MarketPremiumGuard marketFeature="ticker-analysis">
        <div className="text-center p-8">
          <p className="text-red-500">Dados inválidos da API</p>
        </div>
      </MarketPremiumGuard>
    );
  }

  const { data } = marketResponse;

  // Configurações visuais para cada setor de ações
  const getSetorConfig = (setor: string) => {
    const configs: Record<string, any> = {
      "Financeiro": {
        icon: "🏦",
        borderColor: "border-blue-200",
        bgColor: "bg-blue-50",
        textColor: "text-blue-800",
        description: "Bancos e instituições financeiras consolidadas"
      },
      "Energia Elétrica": {
        icon: "⚡",
        borderColor: "border-yellow-200",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-800",
        description: "Empresas de distribuição e geração de energia"
      },
      "Materiais Básicos": {
        icon: "🏭",
        borderColor: "border-gray-200",
        bgColor: "bg-gray-50",
        textColor: "text-gray-800",
        description: "Siderurgia, mineração e materiais essenciais"
      },
      "Saúde/Hospitais": {
        icon: "🏥",
        borderColor: "border-red-200",
        bgColor: "bg-red-50",
        textColor: "text-red-800",
        description: "Hospitais, planos de saúde e farmacêuticas"
      },
      "Telecomunicações": {
        icon: "📡",
        borderColor: "border-purple-200",
        bgColor: "bg-purple-50",
        textColor: "text-purple-800",
        description: "Operadoras de telefonia e internet"
      },
      "Petróleo e Gás": {
        icon: "🛢️",
        borderColor: "border-orange-200",
        bgColor: "bg-orange-50",
        textColor: "text-orange-800",
        description: "Exploração, refino e distribuição de petróleo"
      }
    };
    
    return configs[setor] || {
      icon: "🏢",
      borderColor: "border-gray-200",
      bgColor: "bg-gray-50",
      textColor: "text-gray-800",
      description: "Setor consolidado no mercado"
    };
  };

  // Configurações visuais para cada segmento de FIIs
  const getSegmentoConfig = (segmento: string) => {
    const configs: Record<string, any> = {
      "Shopping Centers": {
        icon: "🛍️",
        borderColor: "border-pink-200",
        bgColor: "bg-pink-50",
        textColor: "text-pink-800",
        description: "Centros comerciais em localizações estratégicas"
      },
      "Lajes Corporativas": {
        icon: "🏢",
        borderColor: "border-blue-200",
        bgColor: "bg-blue-50",
        textColor: "text-blue-800",
        description: "Edifícios corporativos de alto padrão"
      },
      "Logística": {
        icon: "📦",
        borderColor: "border-green-200",
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        description: "Galpões e centros de distribuição"
      },
      "Híbridos": {
        icon: "🔄",
        borderColor: "border-indigo-200",
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-800",
        description: "Diversificação entre múltiplos segmentos"
      },
      "Hospitais": {
        icon: "🏥",
        borderColor: "border-red-200",
        bgColor: "bg-red-50",
        textColor: "text-red-800",
        description: "Hospitais e clínicas médicas especializadas"
      }
    };
    
    return configs[segmento] || {
      icon: "🏗️",
      borderColor: "border-gray-200",
      bgColor: "bg-gray-50",
      textColor: "text-gray-800",
      description: "Segmento imobiliário consolidado"
    };
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Mercado</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Análise de ativos em setores confiáveis - empresas e fundos com histórico comprovado
            </p>
          </div>
        </div>

        {/* Navegação horizontal entre Destaques e Análise */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView("destaques")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentView === "destaques"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Destaques
              </div>
            </button>
            <button
              onClick={() => setCurrentView("analise")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentView === "analise"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Análise
              </div>
            </button>
          </nav>
        </div>

        {/* Renderização condicional */}
        {currentView === "analise" ? (
          <div className="flex justify-center py-8">
            <Button 
              onClick={() => navigate('/dashboard/mercado/analise-ticker')}
              className="text-lg px-8 py-4"
            >
              Ir para Análise de Ticker
            </Button>
          </div>
        ) : (
          <div className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total de Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.resumo.total_acoes}</div>
              <p className="text-xs text-green-600 mt-1">Setores consolidados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total de FIIs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.resumo.total_fiis}</div>
              <p className="text-xs text-green-600 mt-1">Segmentos testados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Critério</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold text-blue-600">Confiabilidade</div>
              <p className="text-xs text-gray-500 mt-1">Histórico comprovado</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button
            variant={tipoAtivo === "todos" ? "default" : "outline"}
            onClick={() => setTipoAtivo("todos")}
          >
            Todos os Confiáveis
          </Button>
          <Button
            variant={tipoAtivo === "acao" ? "default" : "outline"}
            onClick={() => setTipoAtivo("acao")}
          >
            Ações Confiáveis
          </Button>
          <Button
            variant={tipoAtivo === "fii" ? "default" : "outline"}
            onClick={() => setTipoAtivo("fii")}
          >
            FIIs Confiáveis
          </Button>
        </div>

        {/* Seção explicativa sobre critérios */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">
                ℹ️
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Por que esses ativos são considerados confiáveis?</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>Histórico comprovado:</strong> Empresas e fundos com mais de 5 anos de operação estável</p>
                  <p>• <strong>Setores resilientes:</strong> Segmentos essenciais que atravessaram diferentes ciclos econômicos</p>
                  <p>• <strong>Fundamentals sólidos:</strong> Indicadores financeiros consistentes ao longo do tempo</p>
                  <p>• <strong>Dividendos regulares:</strong> Histórico de distribuição de proventos aos acionistas</p>
                  <p>• <strong>Substituição estratégica:</strong> Saúde/Hospitais no lugar de Papel (setor mais volátil)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {(tipoAtivo === "todos" || tipoAtivo === "acao") && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <div className="text-2xl">🏢</div>
                <div>
                  <h2 className="text-lg font-bold">Ações - Setores Confiáveis</h2>
                  <p className="text-sm text-blue-700 font-normal mt-1">
                    💎 Empresas consolidadas em setores que resistiram ao teste do tempo
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {Object.entries(data.acoes_perenes).map(([setor, dados]) => {
                  const setorConfig = getSetorConfig(setor);
                  return (
                    <div key={setor} className={`border-2 rounded-xl p-5 transition-all hover:shadow-lg ${setorConfig.borderColor} ${setorConfig.bgColor}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl">{setorConfig.icon}</div>
                        <div>
                          <h3 className={`font-bold text-lg ${setorConfig.textColor}`}>{setor}</h3>
                          <p className="text-sm text-gray-600">
                            {dados.total_ativos} ativos • {setorConfig.description}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dados.ativos.map(ativo => (
                          <div key={ativo.ticker} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <div>
                              <div className="font-mono font-bold text-gray-900">{ativo.ticker}</div>
                              <div className="text-sm text-gray-600 truncate max-w-[120px] mb-1">{ativo.nome}</div>
                              <div className="text-xs font-semibold text-gray-800">{formatCurrency(ativo.preco_atual)}</div>
                              {ativo.p_vp && (
                                <div className="text-xs text-blue-600 mt-1">P/VP: {ativo.p_vp.toFixed(2)}</div>
                              )}
                            </div>
                            <Badge className={`${getVariationClass(ativo.variacao_diaria)} flex items-center gap-1 font-semibold`}>
                              {ativo.variacao_diaria > 0 && <TrendingUp className="h-3 w-3" />}
                              {ativo.variacao_diaria < 0 && <TrendingDown className="h-3 w-3" />}
                              {formatVariacao(ativo.variacao_diaria)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {(tipoAtivo === "todos" || tipoAtivo === "fii") && (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <div className="text-2xl">🏗️</div>
                <div>
                  <h2 className="text-lg font-bold">FIIs - Segmentos Confiáveis</h2>
                  <p className="text-sm text-green-700 font-normal mt-1">
                    🏢 Fundos imobiliários em segmentos consolidados e rentáveis
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {Object.entries(data.fiis_perenes).map(([segmento, dados]) => {
                  const segmentoConfig = getSegmentoConfig(segmento);
                  return (
                    <div key={segmento} className={`border-2 rounded-xl p-5 transition-all hover:shadow-lg ${segmentoConfig.borderColor} ${segmentoConfig.bgColor}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl">{segmentoConfig.icon}</div>
                        <div>
                          <h3 className={`font-bold text-lg ${segmentoConfig.textColor}`}>{segmento}</h3>
                          <p className="text-sm text-gray-600">
                            {dados.total_ativos} fundos • {segmentoConfig.description}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dados.ativos.map(ativo => (
                          <div key={ativo.ticker} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <div>
                              <div className="font-mono font-bold text-gray-900">{ativo.ticker}</div>
                              <div className="text-sm text-gray-600 truncate max-w-[120px] mb-1">{ativo.nome}</div>
                              <div className="text-xs font-semibold text-gray-800">{formatCurrency(ativo.preco_atual)}</div>
                              {ativo.dy_anualizado && (
                                <div className="text-xs text-green-600 mt-1">
                                  DY: {(ativo.dy_anualizado * 100).toFixed(2)}%
                                </div>
                              )}
                            </div>
                            <Badge className={`${getVariationClass(ativo.variacao_diaria)} flex items-center gap-1 font-semibold`}>
                              {ativo.variacao_diaria > 0 && <TrendingUp className="h-3 w-3" />}
                              {ativo.variacao_diaria < 0 && <TrendingDown className="h-3 w-3" />}
                              {formatVariacao(ativo.variacao_diaria)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-sm font-semibold text-green-700">
                🛡️ Investimentos Confiáveis • Dados em Tempo Real
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>📊 Versão: {data.resumo.versao} • Atualizado: {new Date(marketResponse.timestamp).toLocaleString('pt-BR')}</p>
                <p>✅ Setores selecionados com base em histórico de performance e estabilidade</p>
                <p>💡 <strong>Lembre-se:</strong> Investimentos envolvem riscos. Diversifique sua carteira e consulte um profissional.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
        )}
      </div>
    </MarketPremiumGuard>
  );
}
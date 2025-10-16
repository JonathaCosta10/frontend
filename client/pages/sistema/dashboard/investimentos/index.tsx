import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart, TrendingUp, Loader2 } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
// import { usePrivacy } from "@/contexts/PrivacyContext";
// import { useResponsive } from "@/hooks/useResponsive";
import PieChartWithLegend from "@/components/charts/PieChartWithLegend";
import GraficoSetorialAcao from "@/components/charts/GraficoSetorialAcao";
import GraficoDividendosFII from "@/components/charts/GraficoDividendosFII";
import GraficoRentabilidadeGeral from "@/components/charts/GraficoRentabilidadeGeral";
import InvestmentDividendPremiumGuard from "@/components/InvestmentDividendPremiumGuard";
import { investmentsApi } from '@/services/api/investments';
import type { AlocacaoTipoResponse } from '@/services/api/investments';
import investmentService, { InvestmentAsset } from "@/services/investmentService";
import { InvestmentsNoDataGuidance } from "@/components/NewUserGuidance";

// Funções auxiliares para cálculos
const toNumber = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Calcula a rentabilidade com base no valor investido e no valor atual
const calcularRentabilidade = (valorInvestido: number, valorAtual: number): number => {
  if (valorInvestido <= 0) return 0;
  return ((valorAtual - valorInvestido) / valorInvestido) * 100;
};

export default function Investimentos() {
  const { t, formatCurrency } = useTranslation();
  // const { formatValue, shouldHideCharts } = usePrivacy();
  // const { isMobile, isTablet } = useResponsive();
  
  // Mock values for now
  const formatValue = (value: any) => value;
  const shouldHideCharts = false;
  const isMobile = false;
  const isTablet = false;
  
  const getResponsiveClasses = (config: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    largeDesktop?: string;
  }) => {
    const { mobile = '', tablet = '', desktop = '', largeDesktop = '' } = config;
    
    if (isMobile && mobile) return mobile;
    else if (isTablet && tablet) return tablet;
    else if (!isMobile && !isTablet && desktop) return desktop;
    else if (largeDesktop) return largeDesktop;
    
    return 'grid-cols-1 lg:grid-cols-4'; // fallback
  };
  const [alocacaoData, setAlocacaoData] = useState<AlocacaoTipoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [investimentos, setInvestimentos] = useState<InvestmentAsset[]>([]);
  const [rentabilidadeTotal, setRentabilidadeTotal] = useState<number>(0);
  const [dadosSetoriais, setDadosSetoriais] = useState<{totalAtivos: number; quantidadeSetores: number}>({
    totalAtivos: 0,
    quantidadeSetores: 0
  });

  // Obter mês e ano do localStorage para os gráficos de dividendos
  const mes = localStorage.getItem("mes") || String(new Date().getMonth() + 1).padStart(2, "0");
  const ano = localStorage.getItem("ano") || String(new Date().getFullYear());

  // Carregar dados da API
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        
        // Obter dados de alocação
        try {
          const data = await investmentsApi.getAlocacaoTipo();
          
          // Verificar se é o novo formato
          if (data && 'alocacao_por_tipo' in data) {
            setAlocacaoData(data as AlocacaoTipoResponse);
          }
        } catch (alocacaoError) {
          console.error("Erro ao carregar dados de alocação:", alocacaoError);
          // Não interrompemos completamente o fluxo, apenas registramos o erro
        }
        
        // Obter dados setoriais para diversificação
        try {
          const setoresData = await investmentsApi.getSetores("Acoes");
          
          if (setoresData && 'data' in setoresData && setoresData.success) {
            // Formato novo da API
            console.log("Formato API novo detectado:", setoresData.data);
            setDadosSetoriais({
              totalAtivos: setoresData.data.total_ativos || 0,
              quantidadeSetores: setoresData.data.resumo.quantidade_setores || 0
            });
          } else if (setoresData && 'setores' in setoresData) {
            // Formato antigo (mock para desenvolvimento)
            console.log("Formato API antigo detectado:", setoresData);
            const setores = setoresData.setores || [];
            // Contagem explícita de todos os ativos em todos os setores
            const totalAtivos = setores.reduce((sum, setor) => {
              // Garantir que acoes existe e é um array
              return sum + (Array.isArray(setor.acoes) ? setor.acoes.length : 0);
            }, 0);
            setDadosSetoriais({
              totalAtivos: totalAtivos,
              quantidadeSetores: setores.length
            });
          } else {
            // Fallback seguro para evitar exibição de dados incorretos
            console.log("Formato de dados não reconhecido:", setoresData);
            setDadosSetoriais({
              totalAtivos: 0,
              quantidadeSetores: 0
            });
          }
        } catch (setoresError) {
          console.error("Erro ao carregar dados de setores:", setoresError);
        }
        
        // Buscar ativos pessoais para calcular rentabilidade e diversificação
        try {
          const ativosData = await investmentService.buscarAtivosPessoais();
          
          if (ativosData) {
            setInvestimentos(ativosData);
            
            // Calcular rentabilidade total
            if (ativosData.length > 0) {
              const totalInvestido = ativosData.reduce((acc, inv) => acc + toNumber(inv.valor_investido), 0);
              const totalAtual = ativosData.reduce((acc, inv) => acc + toNumber(inv.valor_atual), 0);
              const rentabilidade = calcularRentabilidade(totalInvestido, totalAtual);
              setRentabilidadeTotal(rentabilidade);
              
              // Salvar no localStorage para uso futuro se necessário
              localStorage.setItem("rentabilidadeTotal", rentabilidade.toFixed(2));
              
              // Calcular diversificação baseada nos ativos pessoais (combinando ACAO e FII)
              const setoresPorTipo = new Map<string, Set<string>>();
              const ativosAcoesFII = ativosData.filter(ativo => 
                ativo.tipo === "ACAO" || ativo.tipo === "FII" || 
                ativo.tipo === "Acoes" || ativo.tipo === "Fundos Imobiliários");
                
              // Vamos usar o ticker como identificador de setor (simplificado)
              // Em um cenário real, precisaríamos de um mapeamento de tickers para setores
              ativosAcoesFII.forEach(ativo => {
                const tipo = ativo.tipo || "Desconhecido";
                if (!setoresPorTipo.has(tipo)) {
                  setoresPorTipo.set(tipo, new Set());
                }
                // Considerar cada ticker como um "setor" diferente para este exemplo
                // Em um caso real, usaríamos um campo específico de setor
                setoresPorTipo.get(tipo)?.add(ativo.ticker);
              });
              
              // Total de ativos únicos considerando ACAO e FII
              const totalAtivos = ativosAcoesFII.length;
              
              // Total de "setores" (nesse caso usamos tickers como proxy)
              const setoresUnicos = new Set<string>();
              ativosAcoesFII.forEach(ativo => {
                setoresUnicos.add(ativo.ticker.substring(0, 4)); // Usar prefixo como aproximação de setor
              });
              
              // Atualizar dados setoriais com base nos ativos pessoais
              setDadosSetoriais({
                totalAtivos: totalAtivos,
                quantidadeSetores: setoresUnicos.size
              });
            }
          }
        } catch (ativosError) {
          console.error("Erro ao carregar ativos pessoais:", ativosError);
          // Não interrompemos completamente o fluxo, apenas registramos o erro
        }
      } catch (error) {
        console.error("Erro geral ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Verificar se há investimentos cadastrados
  const temInvestimentos = !loading && investimentos && investimentos.length > 0;
  const temAlocacaoData = !loading && alocacaoData && alocacaoData.total_carteira > 0;
  
  // Se estiver carregando, mostrar o loader
  if (loading) {
    return (
      <div className="space-y-3 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Se não houver investimentos cadastrados, mostrar orientação
  if (!temInvestimentos && !temAlocacaoData) {
    return <InvestmentsNoDataGuidance />;
  }

  return (
    <div className={`space-y-6 ${isMobile ? 'px-4' : ''}`}>
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-col md:flex-row'} justify-between items-start ${isMobile ? 'gap-2' : 'md:items-center gap-4'}`}>
        <div>
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>{t('investment_dashboard')}</h2>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            {t('track_performance_distribution')}
          </p>
        </div>
        <Badge variant="outline" className={`bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ${isMobile ? 'self-start' : ''}`}>
          {t('updated_real_time')}
        </Badge>
      </div>

      {/* Valor Total e Valorização - Nova Seção */}
      {!shouldHideCharts && (
        <div className={`grid gap-4 ${getResponsiveClasses({
          mobile: 'grid-cols-1',
          tablet: 'grid-cols-1 lg:grid-cols-2',
          desktop: 'grid-cols-1 lg:grid-cols-4',
          largeDesktop: 'grid-cols-1 lg:grid-cols-4'
        })}`}>
          {/* Box Principal - Valor Total com Slide */}
          <div className={isMobile ? 'col-span-1' : 'lg:col-span-3'}>
            <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/20 dark:to-emerald-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className={`font-semibold flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Valor Total da Carteira
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {formatCurrency((alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "ACAO")?.valor_atual || 0) + 
                                    (alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "FII")?.valor_atual || 0))}
                    </p>
                    <p className="text-sm text-muted-foreground">Total investido</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-700">Ações</p>
                      <p className="text-lg font-bold text-blue-700">
                        {formatCurrency(alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "ACAO")?.valor_atual || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-700">FIIs</p>
                      <p className="text-lg font-bold text-emerald-700">
                        {formatCurrency(alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "FII")?.valor_atual || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Barra de Progresso com Cores */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700 font-medium">Ações</span>
                    <span className="text-emerald-700 font-medium">FIIs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="h-full flex">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-1000" 
                        style={{
                          width: `${
                            ((alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "ACAO")?.valor_atual || 0) / 
                             ((alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "ACAO")?.valor_atual || 0) + 
                              (alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "FII")?.valor_atual || 0))) * 100
                          }%`
                        }}
                      ></div>
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-1000" 
                        style={{
                          width: `${
                            ((alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "FII")?.valor_atual || 0) / 
                             ((alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "ACAO")?.valor_atual || 0) + 
                              (alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "FII")?.valor_atual || 0))) * 100
                          }%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {(((alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "ACAO")?.valor_atual || 0) / 
                         ((alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "ACAO")?.valor_atual || 0) + 
                          (alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "FII")?.valor_atual || 0))) * 100).toFixed(1)}%
                    </span>
                    <span>
                      {(((alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "FII")?.valor_atual || 0) / 
                         ((alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "ACAO")?.valor_atual || 0) + 
                          (alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "FII")?.valor_atual || 0))) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Box Valorização */}
          <div>
            <Card className="bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-200 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium bg-gradient-to-r from-blue-700 to-emerald-700 bg-clip-text text-transparent flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Valorização das Cotas
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center">
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-emerald-700 bg-clip-text text-transparent">+{rentabilidadeTotal.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Rentabilidade Total</p>
                  <Badge className="bg-gradient-to-r from-blue-100 to-emerald-100 text-blue-800 border border-blue-200 text-xs">
                    +{formatCurrency(1250)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Detalhes por Setor - ACIMA dos Gráficos */}
      {!shouldHideCharts && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Detalhes Ações */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-base font-medium text-blue-800">Ações</span>
            </div>

            <Card className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 border-blue-300 shadow-md min-h-[320px] hover:shadow-lg transition-shadow duration-300">
              <CardContent className="h-full flex flex-col justify-between pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                  {/* Diversificação */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Diversificação</p>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Boa</Badge>
                      <span className="text-sm font-medium">10 setores</span>
                    </div>
                    <p className="text-xs text-muted-foreground">10 ativos no total</p>
                    <div className="w-full bg-white rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: "85%"}}></div>
                    </div>
                  </div>

                  {/* Maior Concentração */}
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-2">Maior Concentração</p>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-blue-50 text-blue-700 border border-blue-300">Bancos</Badge>
                      <p className="text-lg font-bold text-blue-700">21.7%</p>
                      <p className="text-xs text-muted-foreground">da carteira</p>
                    </div>
                  </div>
                </div>

                {/* Grid inferior - sempre na parte inferior */}
                <div className="mt-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-blue-200">
                    <div className="text-center p-3 bg-gradient-to-br from-white to-blue-50 rounded-lg border border-blue-200 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Segunda</p>
                      <p className="text-xs font-medium text-blue-800">Petróleo</p>
                      <p className="text-sm font-bold text-blue-700">15.3%</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-white to-blue-50 rounded-lg border border-blue-200 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Terceira</p>
                      <p className="text-xs font-medium text-blue-800">Tecnologia</p>
                      <p className="text-sm font-bold text-blue-700">8.9%</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-white to-blue-50 rounded-lg border border-blue-200 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Menor</p>
                      <p className="text-xs font-medium text-blue-800">Agricultura</p>
                      <p className="text-sm font-bold text-blue-700">1.6%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes Fundos Imobiliários */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-emerald-600" />
              <span className="text-base font-medium text-emerald-800">Fundos Imobiliários</span>
            </div>

            <Card className="bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 border-emerald-300 shadow-md min-h-[320px] hover:shadow-lg transition-shadow duration-300">
              <CardContent className="h-full flex flex-col justify-between pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                  {/* Diversificação */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Diversificação</p>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-emerald-100 text-emerald-800 text-xs">Boa</Badge>
                      <span className="text-sm font-medium">5 setores</span>
                    </div>
                    <p className="text-xs text-muted-foreground">5 ativos no total</p>
                    <div className="w-full bg-white rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: "75%"}}></div>
                    </div>
                  </div>

                  {/* Maior Concentração */}
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-2">Maior Concentração</p>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300">Logística</Badge>
                      <p className="text-lg font-bold text-emerald-700">34.3%</p>
                      <p className="text-xs text-muted-foreground">da carteira</p>
                    </div>
                  </div>
                </div>

                {/* Grid inferior - sempre na parte inferior */}
                <div className="mt-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-emerald-200">
                    <div className="text-center p-3 bg-gradient-to-br from-white to-emerald-50 rounded-lg border border-emerald-200 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Segunda</p>
                      <p className="text-xs font-medium text-emerald-800">Shoppings</p>
                      <p className="text-sm font-bold text-emerald-700">23.8%</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-white to-emerald-50 rounded-lg border border-emerald-200 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Terceira</p>
                      <p className="text-xs font-medium text-emerald-800">Corporativo</p>
                      <p className="text-sm font-bold text-emerald-700">16.2%</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-white to-emerald-50 rounded-lg border border-emerald-200 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Menor</p>
                      <p className="text-xs font-medium text-emerald-800">Lajes Corp.</p>
                      <p className="text-sm font-bold text-emerald-700">11.6%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Gráficos Setoriais */}
      {!shouldHideCharts && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Gráfico Ações */}
          <Card className="h-full bg-gradient-to-br from-blue-50 via-white to-blue-50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2 text-lg font-bold">
                <BarChart3 className="h-6 w-6" />
                <span>Ações</span>
              </CardTitle>
              <p className="text-blue-100 text-sm">
                Distribuição por setores • {dadosSetoriais.totalAtivos || 10} ativos
              </p>
            </CardHeader>
            <CardContent className="min-h-[700px] p-6">
              <GraficoSetorialAcao tipoSelecionado="Acoes" />
            </CardContent>
          </Card>

          {/* Gráfico Fundos Imobiliários */}
          <Card className="h-full bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2 text-lg font-bold">
                <PieChart className="h-6 w-6" />
                <span>Fundos Imobiliários</span>
              </CardTitle>
              <p className="text-emerald-100 text-sm">
                Distribuição por setores • {alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "FII")?.quantidade_ativos || 5} ativos
              </p>
            </CardHeader>
            <CardContent className="min-h-[700px] p-6">
              <GraficoSetorialAcao tipoSelecionado="Fundos Imobiliários" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico de Dividendos */}
      <InvestmentDividendPremiumGuard feature="dividends_history">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>{t('dividend_history')}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Evolução da rentabilidade por tipo de ativo e análise de yield
            </p>
          </CardHeader>
          <CardContent>
            <GraficoRentabilidadeGeral tipo="linha" />
          </CardContent>
        </Card>
      </InvestmentDividendPremiumGuard>

      {/* Resumo de Performance */}
      {!shouldHideCharts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Performance da Carteira</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <span className="text-sm font-medium">Diversificação</span>
                <Badge className="bg-green-100 text-green-800">Excelente (85%)</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <span className="text-sm font-medium">Rentabilidade</span>
                <Badge className="bg-blue-100 text-blue-800">+{rentabilidadeTotal.toFixed(1)}%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Próximos Passos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InvestmentDividendPremiumGuard feature="dividends_insights">
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Dividendos Recebidos</span>
                  <Badge variant="outline">{formatCurrency(2830)} este mês</Badge>
                </div>
              </InvestmentDividendPremiumGuard>
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <span className="text-sm font-medium">Rebalanceamento</span>
                <Badge className="bg-purple-100 text-purple-800">Considerar</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

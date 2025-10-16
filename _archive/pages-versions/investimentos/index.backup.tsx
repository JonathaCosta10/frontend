import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Building2,
  CreditCard,
  Loader2,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from "@/contexts/TranslationContext";
import { usePrivacy } from "@/contexts/PrivacyContext";
import PieChartWithLegend from "@/components/charts/PieChartWithLegend";
import GraficoSetorialAcao from "@/components/charts/GraficoSetorialAcao";
import GraficoDividendosFII from "@/components/charts/GraficoDividendosFII";
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
  const { formatValue, shouldHideCharts } = usePrivacy();
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
        
        // Obter dados setoriais para diversificação - usando Acoes como padrão para estatísticas gerais
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
    <div className="space-y-4 md:space-y-6 w-full">
      {/* Header mais limpo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">{t('investment_dashboard')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('track_performance_distribution')}
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1 w-fit">
          <TrendingUp className="h-3.5 w-3.5" />
          <span className="text-xs sm:text-sm">{t('updated_real_time')}</span>
        </Badge>
      </div>

      {/* Cards de Resumo da Carteira */}
      {!shouldHideCharts() && alocacaoData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card Total da Carteira */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total da Carteira
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold text-blue-900 dark:text-blue-200">
                {formatValue(alocacaoData.total_carteira)}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                {alocacaoData.alocacao_por_tipo.reduce((acc, item) => acc + item.quantidade_ativos, 0)} ativos
              </p>
            </CardContent>
          </Card>

          {/* Card Ações */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Ações
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg font-bold text-blue-900 dark:text-blue-200">
                {formatValue(alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "ACAO")?.valor_atual || 0)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                  {dadosSetoriais.quantidadeSetores} setores
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                  {alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "ACAO")?.quantidade_ativos || 0} ativos
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Card Fundos Imobiliários */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Fundos Imobiliários
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                {formatValue(alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "FII")?.valor_atual || 0)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300">
                  5 setores
                </Badge>
                <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300">
                  {alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "FII")?.quantidade_ativos || 0} ativos
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Card Dividendos */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Dividendos ({mes}/{ano})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg font-bold text-green-900 dark:text-green-200">
                R$ 2.830,00
              </div>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                Recebido no mês
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos Setoriais */}
      {!shouldHideCharts() && alocacaoData && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Análise Setorial
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Ações */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border shadow-sm">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    <PieChart className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">Ações - Análise Setorial</h3>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  50.5%
                </Badge>
              </div>
              
              {/* Diversificação melhorada */}
              <div className="p-4 border-b bg-blue-50/30 dark:bg-blue-900/20">
                <div className="flex flex-wrap gap-2 justify-between items-center mb-3">
                  <div className="flex gap-2">
                    <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                      {dadosSetoriais.quantidadeSetores || 10} setores
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                      {alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "ACAO")?.quantidade_ativos || 10} ativos
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                      {formatValue(alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "ACAO")?.valor_atual || 0)}
                    </p>
                  </div>
                </div>
                
                {/* Lista de setores */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-blue-800 dark:text-blue-300">Bancos 21.6%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-blue-800 dark:text-blue-300">Telecom 15.3%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-blue-800 dark:text-blue-300">Tecnologia 13.7%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-blue-800 dark:text-blue-300">Varejo 12.7%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                    <span className="text-blue-800 dark:text-blue-300">Seguros 6.3%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-blue-800 dark:text-blue-300">Saúde 5.5%</span>
                  </div>
                </div>
              </div>
              
              {/* Gráfico */}
              <div className="p-4">
                <GraficoSetorialAcao tipoSelecionado="Acoes" />
              </div>
            </div>
                        </Badge>
                      </div>
                      
                      {/* Lista de setores */}
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span>Bancos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Energia</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span>Siderurgia</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <span>Tecnologia</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span>Varejo</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span>Seguros</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-3 pt-2 border-t">
                      {dadosSetoriais.quantidadeSetores > 5 
                        ? "Excelente diversificação setorial reduzindo riscos"
                        : "Considere diversificar em mais setores"
                      }
                    </p>
                  </CardContent>
                </Card>


                
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                  <Card className="shadow-sm border border-blue-100 dark:border-blue-800 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Maior Setor</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 flex flex-col justify-center h-full">
                      <div className="text-center">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 px-3 py-1">
                          Bancos
                        </Badge>
                        <p className="text-lg font-semibold text-blue-700 dark:text-blue-300 mt-1">21.6%</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm border border-blue-100 dark:border-blue-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Menor Setor</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-center">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 px-3 py-1">
                          Energia
                        </Badge>
                        <p className="text-lg font-semibold text-blue-700 dark:text-blue-300 mt-1">3.5%</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm border border-blue-100 dark:border-blue-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Total</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                          {formatValue(alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "ACAO")?.valor_atual || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Gráfico de Ações */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border shadow-sm mt-4">
                <div className="p-3 flex items-center justify-between border-b">
                  <h3 className="font-medium">Ações - Gráfico Setorial</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    50.5%
                  </Badge>
                </div>
                
                {/* Linha de badges abaixo do título */}
                <div className="p-3 border-b">
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Badge className="bg-blue-50 text-xs font-normal py-0.5 px-2 rounded-full">
                        10 setores
                      </Badge>
                      <Badge className="bg-blue-50 text-xs font-normal py-0.5 px-2 rounded-full">
                        10 ativos
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 font-medium">
                      R$ 10.523,45
                    </Badge>
                  </div>
                </div>
                
                {/* Gráfico completo */}
                <div className="px-2 py-1">
                  <GraficoSetorialAcao tipoSelecionado="Acoes" />
                </div>
                
                {/* Legendas no formato da imagem de referência */}
                <div className="px-3 py-2 grid grid-cols-2 gap-x-5 gap-y-1">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
                    <span className="text-xs">Bancos</span>
                    <span className="text-xs ml-1.5 text-blue-700">21.6%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></div>
                    <span className="text-xs">Telecom</span>
                    <span className="text-xs ml-1.5 text-purple-700">15.3%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                    <span className="text-xs">Varejo</span>
                    <span className="text-xs ml-1.5 text-green-700">12.7%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></div>
                    <span className="text-xs">Tecnologia</span>
                    <span className="text-xs ml-1.5 text-orange-700">13.7%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-300 mr-1.5"></div>
                    <span className="text-xs">Seguros</span>
                    <span className="text-xs ml-1.5 text-blue-700">6.3%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></div>
                    <span className="text-xs">Saúde</span>
                    <span className="text-xs ml-1.5 text-emerald-700">5.5%</span>
                  </div>
                </div>
                
                {/* Linha específica para Bancos como na imagem */}
                <div className="px-3 py-2 border-t">
                  <div className="flex items-center">
                    <div className="flex items-center bg-blue-50 px-2 py-1 rounded">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
                      <span className="text-xs text-blue-900">Bancos</span>
                      <span className="text-xs ml-1.5 text-blue-700">21.6%</span>
                      <span className="text-[10px] text-blue-600 ml-1.5">(1)</span>
                    </div>
                  </div>
                </div>
                
                {/* Outras entradas específicas como na imagem */}
                <div className="px-3 py-2 text-xs text-gray-700 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                    <span>Saneamento, Serv. Água & Esg. 1.6% (1)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Energia Elétrica 3.5% (1)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>Extração Mineral 13.8% (1)</span>
                  </div>
                </div>
                
                <div className="p-3 text-center">
                  <p className="text-lg font-medium text-blue-800 dark:text-blue-300">
                    R$ 10.523,45
                  </p>
                </div>
              </div>
            </div>

            {/* Card de Fundos Imobiliários */}
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                  <Building2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Fundos Imobiliários</h3>
              </div>
              
              {/* Cards de detalhes setoriais para FIIs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
                <Card className="shadow-sm border border-emerald-100 dark:border-emerald-800 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-emerald-800 dark:text-emerald-300">Diversificação</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 flex flex-col h-full justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-between items-center">
                        <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 text-sm px-3 py-1">
                          5 setores
                        </Badge>
                        <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 text-sm px-3 py-1">
                          {alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "FII")?.quantidade_ativos || 5} ativos
                        </Badge>
                      </div>
                      
                      {/* Lista de setores FII */}
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span>Logística</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Shopping</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span>Corporativo</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <span>Híbrido</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span>Lajes Corp.</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-3 pt-2 border-t">
                      Boa diversificação entre segmentos imobiliários
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-emerald-100 dark:border-emerald-800 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-emerald-800 dark:text-emerald-300">Concentração</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 flex flex-col h-full justify-center">
                    <div className="text-center space-y-2">
                      <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 text-sm px-3 py-1">
                        Logística
                      </Badge>
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        33.7%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Maior concentração
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                  <Card className="shadow-sm border border-emerald-100 dark:border-emerald-800 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Maior Setor</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 flex flex-col justify-center h-full">
                      <div className="text-center">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 px-2 py-1 text-xs">
                          Logística
                        </Badge>
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-emerald-700 dark:text-emerald-300 mt-1">33.7%</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm border border-emerald-100 dark:border-emerald-800 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Menor Setor</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 flex flex-col justify-center h-full">
                      <div className="text-center">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 px-2 py-1 text-xs">
                          Corporativo
                        </Badge>
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-emerald-700 dark:text-emerald-300 mt-1">11.6%</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm border border-emerald-100 dark:border-emerald-800 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Total</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 flex flex-col justify-center h-full">
                      <div className="text-center">
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                          {formatValue(alocacaoData?.alocacao_por_tipo.find(item => item.tipo === "FII")?.valor_atual || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Gráfico de FIIs */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border shadow-sm mt-4 w-full">
                <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b space-y-2 sm:space-y-0">
                  <h3 className="font-medium text-sm sm:text-base">Fundos Imobiliários - Gráfico Setorial</h3>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 w-fit">
                    49.5%
                  </Badge>
                </div>
                
                {/* Linha de badges abaixo do título */}
                <div className="p-3 border-b">
                  <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-emerald-50 text-xs font-normal py-0.5 px-2 rounded-full">
                        5 setores
                      </Badge>
                      <Badge className="bg-emerald-50 text-xs font-normal py-0.5 px-2 rounded-full">
                        5 ativos
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 font-medium w-fit">
                      R$ 10.335,30
                    </Badge>
                  </div>
                </div>
                
                {/* Gráfico completo */}
                <div className="px-2 py-1">
                  <GraficoSetorialAcao tipoSelecionado="Fundos Imobiliários" />
                </div>
                
                {/* Legendas no formato da imagem de referência */}
                <div className="px-3 py-2 grid grid-cols-2 gap-x-5 gap-y-1">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
                    <span className="text-xs">Logística</span>
                    <span className="text-xs ml-1.5 text-blue-700">33.7%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                    <span className="text-xs">Shopping Centers</span>
                    <span className="text-xs ml-1.5 text-green-700">25.4%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></div>
                    <span className="text-xs">Recebíveis</span>
                    <span className="text-xs ml-1.5 text-purple-700">15.0%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></div>
                    <span className="text-xs">Papel</span>
                    <span className="text-xs ml-1.5 text-orange-700">14.3%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-pink-500 mr-1.5"></div>
                    <span className="text-xs">Corporativo</span>
                    <span className="text-xs ml-1.5 text-pink-700">11.6%</span>
                  </div>
                </div>
                
                {/* Linha específica para Logística como na imagem */}
                <div className="px-3 py-2 border-t">
                  <div className="flex items-center">
                    <div className="flex items-center bg-blue-50 px-2 py-1 rounded">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
                      <span className="text-xs text-blue-900">Logística</span>
                      <span className="text-xs ml-1.5 text-blue-700">33.7%</span>
                      <span className="text-[10px] text-blue-600 ml-1.5">(1)</span>
                    </div>
                  </div>
                </div>
                
                {/* Outras entradas específicas como na imagem */}
                <div className="px-3 py-2 text-xs text-gray-700 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Shopping Centers 25.4% (1)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    <span>Lajes Corporativas 11.6% (1)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span>Títulos e Val. Mob. 15.0% (1)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>Híbrido 14.3% (1)</span>
                  </div>
                </div>
                
                <div className="p-3 text-center">
                  <p className="text-lg font-medium text-emerald-800 dark:text-emerald-300">
                    R$ 10.335,30
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Carteira Total - Resumo simplificado */}
      {!shouldHideCharts() && alocacaoData && (
        <div className="mt-4 md:mt-6 w-full">
          <div className="bg-white dark:bg-slate-800 rounded-xl border w-full">
            <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b space-y-2 sm:space-y-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <PieChart className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </div>
                <h3 className="font-medium text-sm sm:text-base">Carteira Total</h3>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 w-fit">
                9.19%
              </Badge>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !alocacaoData || alocacaoData.alocacao_por_tipo.length === 0 ? (
              <div className="flex items-center justify-center h-16 text-sm text-muted-foreground">
                Nenhum investimento cadastrado
              </div>
            ) : (
              <div>
                {/* Valor total e dividendos */}
                <div className="p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-center">
                    R$ 20.858,75
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mt-3">
                    <div className="text-center">
                      <div className="text-sm text-slate-500 dark:text-slate-400">Dividendos no mês</div>
                      <div className="text-base sm:text-lg font-semibold">R$ 128,80</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-slate-500 dark:text-slate-400">Dividendos no ano</div>
                      <div className="text-base sm:text-lg font-semibold">R$ 1.523,40</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Total de 15 ativos em carteira
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Seções de Rentabilidade e Dividendos */}
      {!shouldHideCharts() && alocacaoData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6 w-full">
          {/* Rentabilidade */}
          <div className="bg-white dark:bg-slate-800 border rounded-lg w-full">
            <div className="p-3 border-b flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h3 className="font-medium text-sm sm:text-base">Rentabilidade</h3>
              </div>
              <div className="sm:ml-auto">
                <Badge className="bg-green-50 px-2 py-0.5 text-green-700 w-fit">
                  +9.19%
                </Badge>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between text-xs sm:text-sm py-1">
                <span className="text-muted-foreground">Valor Atual</span>
                <span className="text-right text-muted-foreground">Fundos Imobiliários</span>
              </div>
              <div className="py-1">
                <span className="text-lg font-medium">R$ 10.335,30</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Acumulado no Ano
              </div>
            </div>
          </div>
          
          {/* Dividendos */}
          <div className="bg-white dark:bg-slate-800 border rounded-lg w-full">
            <div className="p-3 border-b flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-sm sm:text-base">Dividendos</h3>
              </div>
              <div className="sm:ml-auto">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 w-fit">
                  {mes}/{ano}
                </Badge>
              </div>
            </div>
            
            <div className="p-4">
              <div className="text-base sm:text-lg font-medium mb-2">
                R$ 2.830,00
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="text-xs sm:text-sm py-1">
                  <div className="text-muted-foreground">Proventos</div>
                  <div className="font-medium">09/2025</div>
                </div>
                <div className="text-xs sm:text-sm py-1 sm:text-right">
                  <div className="text-muted-foreground">Fundos Imobiliários</div>
                  <div>Yield: <span className="font-medium">0.85%</span></div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground mt-3">
                Recebido no Mês
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Seção de Rentabilidade e Dividendos removida para evitar duplicação */}

      {/* Insights e Recomendações com layout simplificado */}
      {!shouldHideCharts() && (
        <div className="mt-4 md:mt-6 w-full">
          <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Insights e Recomendações
          </h3>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 w-full">
            {/* Análise de Performance */}
            <Card className="shadow-sm w-full">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-800/50 rounded-full">
                    <BarChart3 className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  </div>
                  <span className="text-sm sm:text-base">{t('performance_analysis')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2 sm:p-3 bg-white dark:bg-slate-800 border rounded-lg shadow-sm">
                    <div className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                      <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">85</div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium mb-0.5">{t('diversification_goal')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('well_diversified_score', { score: '85' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-2 sm:p-3 bg-white dark:bg-slate-800 border rounded-lg shadow-sm">
                    <div className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium mb-0.5">{t('profitability_performance')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('investments_performing_above_cdi', { percentage: '2.3' })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Próximos Passos */}
            <Card className="shadow-sm w-full">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-800/50 rounded-full">
                    <PieChart className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                  </div>
                  <span className="text-sm sm:text-base">{t('next_steps')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <InvestmentDividendPremiumGuard feature="dividends_insights">
                    <div className="flex items-start gap-3 p-2 sm:p-3 bg-white dark:bg-slate-800 border rounded-lg shadow-sm">
                      <div className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <div className="text-xs sm:text-sm text-primary">💰</div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium mb-0.5">{t('leverage_dividends')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('received_this_month_consider_reinvest', { amount: formatCurrency(2830) })}
                        </p>
                      </div>
                    </div>
                  </InvestmentDividendPremiumGuard>
                  
                  <div className="flex items-start gap-3 p-2 sm:p-3 bg-white dark:bg-slate-800 border rounded-lg shadow-sm">
                    <div className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center flex-shrink-0">
                      <div className="text-xs text-yellow-600 dark:text-yellow-500">⚠️</div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium mb-0.5">{t('attention_warning')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('consider_rebalancing_portfolio')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

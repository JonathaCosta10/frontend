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
import { BarChart3, PieChart, TrendingUp, Loader2 } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import GraficoAlocacaoTipo from "@/components/charts/GraficoAlocacaoTipo";
import GraficoSetorialAcao from "@/components/charts/GraficoSetorialAcao";
import GraficoDividendosFII from "@/components/charts/GraficoDividendosFII";
import GraficoRentabilidadeGeral from "@/components/charts/GraficoRentabilidadeGeral";
import InvestmentDividendPremiumGuard from "@/components/InvestmentDividendPremiumGuard";
import { investmentsApi } from '@/services/api/investments';
import type { AlocacaoTipoResponse } from '@/services/api/investments';
import investmentService, { InvestmentAsset } from "@/services/investmentService";
import { InvestmentsNoDataGuidance } from "@/components/NewUserGuidance";

// VERSÃO DE PRODUÇÃO COM CORREÇÕES ESPECÍFICAS

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
  const [tipoSelecionado, setTipoSelecionado] = useState("Acoes");
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
        const data = await investmentsApi.getAlocacaoTipo();
        
        // Verificar se é o novo formato
        if ('alocacao_por_tipo' in data) {
          setAlocacaoData(data as AlocacaoTipoResponse);
        }

        // Obter dados setoriais para diversificação
        try {
          const setoresData = await investmentsApi.getSetores(tipoSelecionado);
          
          if (setoresData && 'data' in setoresData && setoresData.success) {
            // Formato novo da API
            setDadosSetoriais({
              totalAtivos: setoresData.data.total_ativos || 0,
              quantidadeSetores: setoresData.data.resumo.quantidade_setores || 0
            });
          } else if (setoresData && 'setores' in setoresData) {
            // Formato antigo (mock para desenvolvimento)
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
          }
        } catch (setoresError) {
          console.error("Erro ao carregar dados de setores:", setoresError);
        }
        
        // Buscar ativos pessoais para calcular rentabilidade e diversificação
        const ativosData = await investmentService.buscarAtivosPessoais();
        setInvestimentos(ativosData);
        
        // Calcular rentabilidade total
        if (ativosData && ativosData.length > 0) {
          const totalInvestido = ativosData.reduce((acc, inv) => acc + toNumber(inv.valor_investido), 0);
          const totalAtual = ativosData.reduce((acc, inv) => acc + toNumber(inv.valor_atual), 0);
          const rentabilidade = calcularRentabilidade(totalInvestido, totalAtual);
          setRentabilidadeTotal(rentabilidade);
          
          // Salvar no localStorage para uso futuro se necessário
          localStorage.setItem("rentabilidadeTotal", rentabilidade.toFixed(2));
          
          // Calcular diversificação baseada nos ativos pessoais (combinando ACAO e FII)
          const ativosAcoesFII = ativosData.filter(ativo => 
            ativo.tipo === "ACAO" || ativo.tipo === "FII" || 
            ativo.tipo === "Acoes" || ativo.tipo === "Fundos Imobiliários");
              
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
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [tipoSelecionado]);

  // Verificações de dados
  const temInvestimentos = !loading && investimentos && investimentos.length > 0;
  const temAlocacaoData = !loading && alocacaoData && alocacaoData.total_carteira > 0;

  // Renderizar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carregando investimentos...</p>
        </div>
      </div>
    );
  }

  // Renderizar guidance se não houver dados
  if (!temInvestimentos && !temAlocacaoData) {
    return <InvestmentsNoDataGuidance />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('investment_dashboard')}</h2>
          <p className="text-muted-foreground">
            {t('track_performance_distribution')}
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {t('updated_real_time')}
        </Badge>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_portfolio')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {alocacaoData ? formatCurrency(alocacaoData.total_carteira) : formatCurrency(0)}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('diversification')}</CardTitle>
            <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full">
              <PieChart className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tipos</span>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {alocacaoData ? `${alocacaoData.resumo.tipos_diferentes} tipos` : "0 tipos"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {alocacaoData?.resumo.maior_alocacao ? 
                    `${alocacaoData.resumo.maior_alocacao.tipo}: ${alocacaoData.resumo.maior_alocacao.percentual_alocacao.toFixed(1)}%` : 
                    "Nenhum investimento"
                  }
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('profitability')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <>
                <div className={`text-2xl font-bold ${rentabilidadeTotal >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {rentabilidadeTotal >= 0 ? '+' : ''}{rentabilidadeTotal.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('accumulated_year')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <InvestmentDividendPremiumGuard feature="dividends_card">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dividends')}</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(2830)}</div>
              <p className="text-xs text-muted-foreground">
                {t('received_month')}
              </p>
            </CardContent>
          </Card>
        </InvestmentDividendPremiumGuard>
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alocação por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>{t('allocation_by_type')}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('portfolio_distribution_category')}
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Carregando alocação...</p>
                </div>
              </div>
            ) : !alocacaoData ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhum investimento cadastrado
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cadastre seus investimentos para ver a distribuição por tipo
                  </p>
                  <Button asChild>
                    <a href="/dashboard/investimentos/cadastro">
                      Cadastrar Investimento
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {alocacaoData.alocacao_por_tipo.map((item, index) => (
                    <div
                      key={item.tipo}
                      className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.tipo}</h4>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          index === 0 ? 'bg-blue-100 text-blue-700' :
                          index === 1 ? 'bg-emerald-100 text-emerald-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {item.percentual_alocacao.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(item.valor_atual)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.quantidade_ativos} ativos
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Total da carteira:</strong> {formatCurrency(alocacaoData.total_carteira)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alocação Setorial */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>{t('sector_allocation')}</span>
              </CardTitle>
              <Select value={tipoSelecionado} onValueChange={setTipoSelecionado}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Acoes">{t('stocks')}</SelectItem>
                  <SelectItem value="Fundos Imobiliários">{t('reits')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('investments_distributed_sector')}
            </p>
          </CardHeader>
          <CardContent>
            <GraficoSetorialAcao tipoSelecionado={tipoSelecionado} />
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Dividendos */}
      <InvestmentDividendPremiumGuard feature="dividends_history">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>{t('dividends_history')}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Evolução da rentabilidade por tipo de ativo e análise de yield
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <GraficoRentabilidadeGeral tipo="linha" />
          </CardContent>
        </Card>
      </InvestmentDividendPremiumGuard>
    </div>
  );
}

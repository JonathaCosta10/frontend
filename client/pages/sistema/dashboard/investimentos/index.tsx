import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart, TrendingUp, Loader2 } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import GraficoAlocacaoTipo from "@/components/charts/GraficoAlocacaoTipo";
import GraficoSetorialAcao from "@/components/charts/GraficoSetorialAcao";
import GraficoDividendosFII from "@/components/charts/GraficoDividendosFII";
import InvestmentDividendPremiumGuard from "@/components/InvestmentDividendPremiumGuard";
import { investmentsApi } from '@/services/api/investments';
import type { AlocacaoTipoResponse } from '@/services/api/investments';
import investmentService, { InvestmentAsset } from "@/services/investmentService";

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
        
        // Buscar ativos pessoais para calcular rentabilidade
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
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

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
            <PieChart className="h-4 w-4 text-muted-foreground" />
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
            <GraficoAlocacaoTipo />
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
                  <SelectItem value="Renda Fixa">{t('fixed_income')}</SelectItem>
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
                  <span>{t('dividend_history')} - {tipoSelecionado}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('dividend_evolution_over_time')}
                </p>
              </div>
              <Badge variant="secondary">
                {mes}/{ano}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <GraficoDividendosFII
              mes={mes}
              ano={ano}
              tipoSelecionado={tipoSelecionado}
            />
          </CardContent>
        </Card>
      </InvestmentDividendPremiumGuard>

      {/* Insights e Recomendações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('performance_analysis')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>{t('diversification_goal')}:</strong> {t('well_diversified_score', { score: '85' })}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>{t('profitability_performance')}:</strong> {t('investments_performing_above_cdi', { percentage: '2.3' })}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>{t('attention_warning')}:</strong> {t('consider_rebalancing_portfolio')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('next_steps')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InvestmentDividendPremiumGuard feature="dividends_insights">
              <div className="p-3 border-l-4 border-l-primary bg-primary/5 rounded-r-lg">
                <p className="text-sm">
                  <strong>{t('leverage_dividends')}:</strong> {t('received_this_month_consider_reinvest', { amount: formatCurrency(2830) })}
                </p>
              </div>
            </InvestmentDividendPremiumGuard>
            <div className="p-3 border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950 rounded-r-lg">
              <p className="text-sm">
                <strong>{t('explore_new_sectors')}:</strong> {t('portfolio_concentrated_diversify')}
              </p>
            </div>
            <div className="p-3 border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950 rounded-r-lg">
              <p className="text-sm">
                <strong>{t('increase_contributions')}:</strong> {t('positive_performance_increase_monthly')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

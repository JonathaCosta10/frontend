import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Medal,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Target,
  Zap
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import SubscriptionGuard from '@/components/SubscriptionGuard';

interface RankingItem {
  posicao: number;
  codigo: string;
  nome: string;
  tipo: string;
  rentabilidade: number;
  volume: number;
  volatilidade: number;
  dividendYield: number;
  precoAtual: number;
  variacao: number;
  pontuacao: number;
}

export default function Ranking() {
  const { t, formatCurrency } = useTranslation();
  const [criterio, setCriterio] = useState('rentabilidade');
  const [categoria, setCategoria] = useState('todas');
  const [periodo, setPeriodo] = useState('12m');

  const rankingData: RankingItem[] = [
    {
      posicao: 1,
      codigo: 'VALE3',
      nome: 'Vale S.A.',
      tipo: t('stock'),
      rentabilidade: 28.5,
      volume: 1250000000,
      volatilidade: 24.8,
      dividendYield: 12.3,
      precoAtual: 72.45,
      variacao: 2.8,
      pontuacao: 95
    },
    {
      posicao: 2,
      codigo: 'HGLG11',
      nome: 'CSHG Logística',
      tipo: 'FII',
      rentabilidade: 22.1,
      volume: 45000000,
      volatilidade: 12.5,
      dividendYield: 9.8,
      precoAtual: 128.90,
      variacao: 1.2,
      pontuacao: 92
    },
    {
      posicao: 3,
      codigo: 'ITUB4',
      nome: 'Itaú Unibanco',
      tipo: t('stock'),
      rentabilidade: 18.9,
      volume: 890000000,
      volatilidade: 18.2,
      dividendYield: 8.5,
      precoAtual: 32.15,
      variacao: 0.8,
      pontuacao: 88
    },
    {
      posicao: 4,
      codigo: 'MXRF11',
      nome: 'Max Retail',
      tipo: 'FII',
      rentabilidade: 15.6,
      volume: 28000000,
      volatilidade: 14.1,
      dividendYield: 8.9,
      precoAtual: 10.85,
      variacao: -0.5,
      pontuacao: 85
    },
    {
      posicao: 5,
      codigo: 'PETR4',
      nome: 'Petrobras',
      tipo: t('stock'),
      rentabilidade: 12.3,
      volume: 2100000000,
      volatilidade: 32.5,
      dividendYield: 15.2,
      precoAtual: 38.92,
      variacao: -1.2,
      pontuacao: 82
    }
  ];

  const getMedalIcon = (posicao: number) => {
    if (posicao === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (posicao === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (posicao === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">{posicao}</span>;
  };

  const getVariationIcon = (value: number) => {
    return value >= 0 ? 
      <ArrowUpRight className="h-4 w-4 text-success" /> : 
      <ArrowDownRight className="h-4 w-4 text-destructive" />;
  };

  const getVariationColor = (value: number) => {
    return value >= 0 ? 'text-success' : 'text-destructive';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    return `${(volume / 1000).toFixed(1)}K`;
  };

  const topPerformers = rankingData.slice(0, 3);

  return (
    <SubscriptionGuard>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('asset_ranking')}</h1>
          <p className="text-muted-foreground">
            {t('discover_best_investments_criteria')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={criterio} onValueChange={setCriterio}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('criteria')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rentabilidade">{t('profitability')}</SelectItem>
              <SelectItem value="dividendos">{t('dividend_yield')}</SelectItem>
              <SelectItem value="volume">{t('volume')}</SelectItem>
              <SelectItem value="pontuacao">{t('general_score')}</SelectItem>
              <SelectItem value="volatilidade">{t('lower_risk')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">{t('all_categories')}</SelectItem>
              <SelectItem value="acoes">{t('stocks_category')}</SelectItem>
              <SelectItem value="fiis">{t('reits_category')}</SelectItem>
              <SelectItem value="etfs">{t('etfs')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder={t('period')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1M</SelectItem>
              <SelectItem value="3m">3M</SelectItem>
              <SelectItem value="6m">6M</SelectItem>
              <SelectItem value="12m">12M</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topPerformers.map((item, index) => (
          <Card key={item.codigo} className={`${index === 0 ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getMedalIcon(item.posicao)}
                  <span className="font-bold text-lg">{item.posicao}º {t('place')}</span>
                </div>
                <Badge className={`${getScoreColor(item.pontuacao)} text-white`}>
                  {item.pontuacao}{t('points')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg">{item.codigo}</h3>
                  <p className="text-sm text-muted-foreground">{item.nome}</p>
                  <Badge variant="outline" className="mt-1">{item.tipo}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('profitability')}</p>
                    <p className={`font-semibold ${getVariationColor(item.rentabilidade)}`}>
                      {item.rentabilidade}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">D.Y.</p>
                    <p className="font-semibold text-success">{item.dividendYield}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('price')}</p>
                    <p className="font-semibold">{formatCurrency(item.precoAtual)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('daily_variation')}</p>
                    <div className="flex items-center space-x-1">
                      {getVariationIcon(item.variacao)}
                      <span className={`font-semibold text-xs ${getVariationColor(item.variacao)}`}>
                        {item.variacao}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights do Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-warning" />
            <span>{t('ranking_insights')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">{t('month_highlight')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('vale3_leads_commodities')}
              </p>
            </div>
            
            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-success" />
                <span className="font-medium text-success">{t('best_risk_return')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('hglg11_good_profitability_low_volatility')}
              </p>
            </div>
            
            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-warning" />
                <span className="font-medium text-warning">{t('opportunity')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('fiis_yields_above_8_percent')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela Completa do Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>{t('complete_ranking')} - {criterio} ({periodo})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('position')}</TableHead>
                <TableHead>{t('asset')}</TableHead>
                <TableHead>{t('type')}</TableHead>
                <TableHead>{t('profitability')}</TableHead>
                <TableHead>D.Y.</TableHead>
                <TableHead>{t('volume')}</TableHead>
                <TableHead>{t('volatility')}</TableHead>
                <TableHead>{t('current_price')}</TableHead>
                <TableHead>{t('variation')}</TableHead>
                <TableHead>{t('score')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankingData.map((item) => (
                <TableRow key={item.codigo} className={item.posicao <= 3 ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getMedalIcon(item.posicao)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.codigo}</p>
                      <p className="text-xs text-muted-foreground">{item.nome}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.tipo}</Badge>
                  </TableCell>
                  <TableCell className={getVariationColor(item.rentabilidade)}>
                    <div className="flex items-center space-x-1">
                      {getVariationIcon(item.rentabilidade)}
                      <span className="font-semibold">{item.rentabilidade}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-success font-semibold">
                    {item.dividendYield}%
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatVolume(item.volume)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.volatilidade < 15 ? 'default' : item.volatilidade < 25 ? 'secondary' : 'destructive'}>
                      {item.volatilidade}%
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.precoAtual)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getVariationIcon(item.variacao)}
                      <span className={`text-sm ${getVariationColor(item.variacao)}`}>
                        {item.variacao}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getScoreColor(item.pontuacao)} text-white`}>
                        {item.pontuacao}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Filtros Avançados */}
      <Card>
        <CardHeader>
          <CardTitle>{t('custom_filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t('highest_growth')}
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingDown className="h-4 w-4 mr-2" />
              {t('lowest_volatility')}
            </Button>
            <Button variant="outline" className="justify-start">
              <Star className="h-4 w-4 mr-2" />
              {t('highest_dividends')}
            </Button>
            <Button variant="outline" className="justify-start">
              <Target className="h-4 w-4 mr-2" />
              {t('best_cost_benefit')}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </SubscriptionGuard>
  );
}

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign, 
  Globe, 
  Zap,
  Home,
  Car,
  ShoppingCart,
  Briefcase,
  Activity,
  Calendar
} from "lucide-react";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";

export default function IndicadoresEconomicos() {
  // Dados simulados dos indicadores (em uma implementação real, viriam de uma API)
  const [indicadores] = useState({
    principais: [
      {
        nome: 'SELIC',
        valor: 11.75,
        unidade: '%',
        variacao: -0.50,
        descricao: 'Taxa básica de juros',
        ultimaAtualizacao: '2024-01-31',
        tendencia: 'baixa',
        icon: BarChart3
      },
      {
        nome: 'IPCA',
        valor: 4.62,
        unidade: '%',
        variacao: -0.38,
        descricao: 'Inflação acumulada em 12 meses',
        ultimaAtualizacao: '2024-01-31',
        tendencia: 'baixa',
        icon: TrendingUp
      },
      {
        nome: 'PIB',
        valor: 2.9,
        unidade: '%',
        variacao: 0.2,
        descricao: 'Crescimento no trimestre',
        ultimaAtualizacao: '2024-01-31',
        tendencia: 'alta',
        icon: Globe
      },
      {
        nome: 'Taxa de Desemprego',
        valor: 7.8,
        unidade: '%',
        variacao: -0.3,
        descricao: 'Desocupação no trimestre',
        ultimaAtualizacao: '2024-01-31',
        tendencia: 'baixa',
        icon: Briefcase
      }
    ],
    cambio: [
      {
        nome: 'USD/BRL',
        valor: 4.98,
        unidade: 'R$',
        variacao: -0.02,
        percentual: -0.40,
        ultimaAtualizacao: '2024-02-01',
        icon: DollarSign
      },
      {
        nome: 'EUR/BRL',
        valor: 5.39,
        unidade: 'R$',
        variacao: 0.01,
        percentual: 0.19,
        ultimaAtualizacao: '2024-02-01',
        icon: DollarSign
      },
      {
        nome: 'GBP/BRL',
        valor: 6.33,
        unidade: 'R$',
        variacao: -0.03,
        percentual: -0.47,
        ultimaAtualizacao: '2024-02-01',
        icon: DollarSign
      }
    ],
    setoriais: [
      {
        nome: 'Energia Elétrica',
        valor: 0.85,
        unidade: '%',
        variacao: 0.12,
        descricao: 'Variação mensal',
        categoria: 'Energia',
        icon: Zap
      },
      {
        nome: 'Habitação',
        valor: 0.45,
        unidade: '%',
        variacao: -0.08,
        descricao: 'Variação mensal',
        categoria: 'Moradia',
        icon: Home
      },
      {
        nome: 'Transportes',
        valor: -0.23,
        unidade: '%',
        variacao: -0.15,
        descricao: 'Variação mensal',
        categoria: 'Transporte',
        icon: Car
      },
      {
        nome: 'Alimentação',
        valor: 0.67,
        unidade: '%',
        variacao: 0.23,
        descricao: 'Variação mensal',
        categoria: 'Alimentos',
        icon: ShoppingCart
      }
    ]
  });

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const getVariationColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVariationIcon = (value: number) => {
    if (value > 0) return TrendingUp;
    if (value < 0) return TrendingDown;
    return Activity;
  };

  const getTendencyBadge = (tendencia: string) => {
    const variants = {
      'alta': 'default',
      'baixa': 'secondary',
      'estavel': 'outline'
    } as const;
    
    const colors = {
      'alta': 'bg-green-100 text-green-800',
      'baixa': 'bg-red-100 text-red-800',
      'estavel': 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge variant={variants[tendencia as keyof typeof variants]} className={colors[tendencia as keyof typeof colors]}>
        {tendencia.charAt(0).toUpperCase() + tendencia.slice(1)}
      </Badge>
    );
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Indicadores Econômicos</h1>
          <p className="text-muted-foreground">Acompanhe os principais indicadores da economia brasileira em tempo real</p>
        </div>

        <Tabs defaultValue="principais" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="principais">Principais</TabsTrigger>
            <TabsTrigger value="cambio">Câmbio</TabsTrigger>
            <TabsTrigger value="setoriais">Setoriais</TabsTrigger>
          </TabsList>

          {/* Indicadores Principais */}
          <TabsContent value="principais" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {indicadores.principais.map((indicador, index) => {
                const Icon = indicador.icon;
                const VariationIcon = getVariationIcon(indicador.variacao);
                
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="h-6 w-6 text-blue-600" />
                        {getTendencyBadge(indicador.tendencia)}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{indicador.nome}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">
                            {formatNumber(indicador.valor)}{indicador.unidade}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${getVariationColor(indicador.variacao)}`}>
                          <VariationIcon className="h-3 w-3" />
                          <span>
                            {indicador.variacao > 0 ? '+' : ''}{formatNumber(indicador.variacao, 2)}p.p.
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{indicador.descricao}</p>
                        <p className="text-xs text-gray-400">
                          Atualizado em {new Date(indicador.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Resumo Econômico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Cenário Macroeconômico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-700">Pontos Positivos</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>SELIC em trajetória de queda, reduzindo custo do crédito</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Inflação convergindo para a meta do Banco Central</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>PIB apresentando crescimento sustentado</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Taxa de desemprego em queda gradual</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-yellow-700">Pontos de Atenção</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Pressões fiscais podem afetar política monetária</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Cenário externo com incertezas geopolíticas</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Volatilidade cambial influenciando inflação importada</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Câmbio */}
          <TabsContent value="cambio" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {indicadores.cambio.map((moeda, index) => {
                const Icon = moeda.icon;
                const VariationIcon = getVariationIcon(moeda.variacao);
                
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Icon className="h-6 w-6 text-green-600" />
                        <Badge variant="outline">{moeda.nome.split('/')[0]}</Badge>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{moeda.nome}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">
                            {moeda.unidade} {formatNumber(moeda.valor, 3)}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${getVariationColor(moeda.variacao)}`}>
                          <VariationIcon className="h-3 w-3" />
                          <span>
                            {moeda.variacao > 0 ? '+' : ''}{formatNumber(moeda.variacao, 3)} 
                            ({moeda.percentual > 0 ? '+' : ''}{formatNumber(moeda.percentual, 2)}%)
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Atualizado em {new Date(moeda.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Análise Cambial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Análise do Cenário Cambial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Dólar Americano (USD/BRL)</h4>
                    <p className="text-sm text-blue-700">
                      O real mantém estabilidade frente ao dólar, reflexo da melhora dos fundamentos macroeconômicos 
                      e da perspectiva de queda da taxa de juros americana. Fatores domésticos como política fiscal 
                      continuam sendo monitorados pelos investidores.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Euro (EUR/BRL)</h4>
                    <p className="text-sm text-purple-700">
                      O euro apresenta leve valorização frente ao real, influenciado pelas decisões do BCE e 
                      pela recuperação econômica da zona do euro. Fluxos comerciais Brasil-Europa permanecem importantes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Indicadores Setoriais */}
          <TabsContent value="setoriais" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {indicadores.setoriais.map((setor, index) => {
                const Icon = setor.icon;
                const VariationIcon = getVariationIcon(setor.valor);
                
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Icon className="h-6 w-6 text-purple-600" />
                        <Badge variant="outline">{setor.categoria}</Badge>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold">{setor.nome}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-xl font-bold ${getVariationColor(setor.valor)}`}>
                            {setor.valor > 0 ? '+' : ''}{formatNumber(setor.valor)}{setor.unidade}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${getVariationColor(setor.variacao)}`}>
                          <VariationIcon className="h-3 w-3" />
                          <span>
                            {setor.variacao > 0 ? '+' : ''}{formatNumber(setor.variacao, 2)}p.p.
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{setor.descricao}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Análise Setorial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Pressões Inflacionárias por Setor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-red-700">Setores com Pressão Alta</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span className="text-sm font-medium">Energia Elétrica</span>
                          <span className="text-sm font-bold text-red-600">+0.85%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span className="text-sm font-medium">Alimentação</span>
                          <span className="text-sm font-bold text-red-600">+0.67%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-700">Setores com Alívio</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="text-sm font-medium">Transportes</span>
                          <span className="text-sm font-bold text-green-600">-0.23%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="text-sm font-medium">Habitação</span>
                          <span className="text-sm font-bold text-green-600">+0.45%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Última Atualização */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Dados atualizados automaticamente</span>
              </div>
              <span>Última atualização: {new Date().toLocaleString('pt-BR')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketPremiumGuard>
  );
}
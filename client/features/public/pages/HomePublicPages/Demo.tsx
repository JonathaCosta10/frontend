import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  BarChart3,
  PieChart,
  Target,
  Calculator,
  Eye,
  EyeOff,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "@/features/public/components/PublicLayout";

export default function Demo() {
  const [hideValues, setHideValues] = useState(false);

  const systemFeatures = [
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Visão Geral do Orçamento",
      description: "Dashboard completo com histórico anual de entradas, distribuição de gastos e insights financeiros em tempo real."
    },
    {
      icon: <PieChart className="h-8 w-8 text-green-600" />,
      title: "Gestão de Investimentos",
      description: "Acompanhe sua carteira total, diversificação por tipo de ativo e distribuição por setores com análises detalhadas."
    },
    {
      icon: <Target className="h-8 w-8 text-purple-600" />,
      title: "Controle de Metas",
      description: "Defina e acompanhe suas metas financeiras com categorização inteligente e visualização de progresso."
    },
    {
      icon: <Calculator className="h-8 w-8 text-orange-600" />,
      title: "Calculadoras Financeiras",
      description: "Ferramentas avançadas para cálculo de juros compostos, planejamento de aposentadoria e análise de investimentos."
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="text-center py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6">
            <span className="text-primary">Sistema Organizesee</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 px-2">
            Conheça as funcionalidades do nosso sistema de gestão financeira completo
          </p>

          {/* Privacy Toggle */}
          <div className="mb-8 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setHideValues(!hideValues)}
              className="flex items-center space-x-2"
            >
              {hideValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span>{hideValues ? 'Mostrar Valores' : 'Ocultar Valores'}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* System Features */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Funcionalidades do Sistema
          </h2>
          <p className="text-xl text-muted-foreground">
            Explore todas as ferramentas disponíveis para sua gestão financeira
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {systemFeatures.map((feature, index) => (
            <Card key={index} className="text-center p-6">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Budget Dashboard Demo */}
      <section className="py-16 bg-muted/50 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Dashboard de Orçamento
          </h2>
          <p className="text-xl text-muted-foreground">
            Veja como funciona o controle completo das suas finanças
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Historical Chart Simulation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Histórico anual de entradas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Faturamento Anual</p>
                    <p className="text-lg font-bold text-blue-600">
                      {hideValues ? "R$ ****" : "R$ 19.539,84"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Média Mensal</p>
                    <p className="text-lg font-bold text-green-600">
                      {hideValues ? "R$ ****" : "R$ 6.513,28"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Melhor Mês</p>
                    <p className="text-lg font-bold text-purple-600">
                      {hideValues ? "R$ ****" : "R$ 10.497,52"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pior Mês</p>
                    <p className="text-lg font-bold text-orange-600">
                      {hideValues ? "R$ ****" : "R$ 45,00"}
                    </p>
                  </div>
                </div>
                
                {/* Simulated Chart */}
                <div className="h-48 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg p-4">
                  <div className="flex h-full items-end justify-around">
                    {[0.2, 0.4, 0.7, 0.9, 0.8, 0.6, 0.5, 0.8, 0.9, 0.7, 0.6, 0.8].map((height, i) => (
                      <div
                        key={i}
                        className="w-6 rounded-t bg-gradient-to-t from-blue-500 to-green-500"
                        style={{ height: `${height * 100}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                <span>Distribuição anual de gastos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Anual</p>
                  <p className="text-2xl font-bold text-red-600">
                    {hideValues ? "R$ ****" : "R$ 15.564,72"}
                  </p>
                  <p className="text-sm text-muted-foreground">3 meses considerados</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Dívidas Mensais</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{hideValues ? "R$ ****" : "R$ 7.644,82"}</span>
                      <span className="text-xs text-muted-foreground ml-2">49.1%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm">Custo Fixo</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{hideValues ? "R$ ****" : "R$ 7.100,00"}</span>
                      <span className="text-xs text-muted-foreground ml-2">45.6%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Metas</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{hideValues ? "R$ ****" : "R$ 580,00"}</span>
                      <span className="text-xs text-muted-foreground ml-2">3.7%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Conforto</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{hideValues ? "R$ ****" : "R$ 239,90"}</span>
                      <span className="text-xs text-muted-foreground ml-2">1.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Investment Portfolio Demo */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Carteira de Investimentos
          </h2>
          <p className="text-xl text-muted-foreground">
            Acompanhe sua diversificação e distribuição por setores
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Portfolio Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Carteira Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div>
                  <p className="text-3xl font-bold">{hideValues ? "R$ ****" : "R$ 20.652,75"}</p>
                  <p className="text-sm text-muted-foreground">2 tipos</p>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-600">Ação</span>
                      <span className="text-blue-600">50.4%</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-muted-foreground">10 ativos</span>
                      <span className="font-bold">{hideValues ? "R$ ****" : "R$ 10.411,50"}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-600">Fundos Imobiliários</span>
                      <span className="text-green-600">49.6%</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-muted-foreground">5 ativos</span>
                      <span className="font-bold">{hideValues ? "R$ ****" : "R$ 10.241,25"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sector Distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Distribuição por Setor</CardTitle>
              <p className="text-sm text-muted-foreground">10 setores</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Bancos</span>
                    <span className="text-sm font-medium">21.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Petróleo e Gás</span>
                    <span className="text-sm font-medium">15.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Saneamento</span>
                    <span className="text-sm font-medium">15.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Extração Mineral</span>
                    <span className="text-sm font-medium">13.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Energia Elétrica</span>
                    <span className="text-sm font-medium">12.6%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Bolsas de Valores</span>
                    <span className="text-sm font-medium">6.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Seguros</span>
                    <span className="text-sm font-medium">6.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Equipamentos</span>
                    <span className="text-sm font-medium">3.6%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Bebidas e Fumo</span>
                    <span className="text-sm font-medium">3.6%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Agricultura</span>
                    <span className="text-sm font-medium">1.6%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Financial Calculator Demo */}
      <section className="py-16 bg-muted/50 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Calculadora de Juros Compostos
          </h2>
          <p className="text-xl text-muted-foreground">
            Planeje seus investimentos com precisão
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Simulação de Investimento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Valor Inicial</label>
                    <div className="text-xl font-bold">{hideValues ? "R$ ****" : "R$ 10.000"}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Taxa de juros anual</label>
                    <div className="text-xl font-bold">12% por ano</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Período (anos)</label>
                    <div className="text-xl font-bold">10 years</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Depósito Mensal</label>
                    <div className="text-xl font-bold">{hideValues ? "R$ ****" : "R$ 500"}</div>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Valor Final Total</div>
                    <div className="text-2xl font-bold text-green-600">
                      {hideValues ? "R$ ****" : "R$ 148.023,21"}
                    </div>
                    <div className="text-sm text-muted-foreground">Valor acumulado do fim do período</div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Valor Total Investido</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {hideValues ? "R$ ****" : "R$ 70.000,00"}
                    </div>
                    <div className="text-sm text-muted-foreground">Capital investido e contribuições</div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total de Juros Ganhos</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {hideValues ? "R$ ****" : "R$ 78.023,21"}
                    </div>
                    <div className="text-sm text-muted-foreground">yield: 111.46% do investimento</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Crie sua conta gratuita e comece a organizar suas finanças hoje mesmo
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="flex items-center space-x-2">
                <span>Começar Gratuitamente</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  TrendingUp, 
  PiggyBank, 
  Target,
  DollarSign,
  Percent,
  Calendar
} from "lucide-react";
import MarketPremiumGuard from "@/core/security/guards/MarketPremiumGuard";

export default function CalculadoraFinanceira() {
  // Estados para Juros Compostos
  const [jcCapitalInicial, setJcCapitalInicial] = useState('');
  const [jcAporteMensal, setJcAporteMensal] = useState('');
  const [jcTaxaJuros, setJcTaxaJuros] = useState('');
  const [jcTempo, setJcTempo] = useState('');
  const [jcTipoTempo, setJcTipoTempo] = useState('anos');
  const [jcResultado, setJcResultado] = useState<any>(null);

  // Estados para Aposentadoria
  const [apIdadeAtual, setApIdadeAtual] = useState('');
  const [apIdadeAposentadoria, setApIdadeAposentadoria] = useState('');
  const [apCapitalInicial, setApCapitalInicial] = useState('');
  const [apAporteMensal, setApAporteMensal] = useState('');
  const [apTaxaJuros, setApTaxaJuros] = useState('');
  const [apResultado, setApResultado] = useState<any>(null);

  // Estados para Rendimento Necessário
  const [rnValorDesejado, setRnValorDesejado] = useState('');
  const [rnCapitalInicial, setRnCapitalInicial] = useState('');
  const [rnAporteMensal, setRnAporteMensal] = useState('');
  const [rnTempo, setRnTempo] = useState('');
  const [rnTipoTempo, setRnTipoTempo] = useState('anos');
  const [rnResultado, setRnResultado] = useState<any>(null);

  // Funções de formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  // Cálculo de Juros Compostos
  const calcularJurosCompostos = () => {
    const capital = parseFloat(jcCapitalInicial) || 0;
    const aporte = parseFloat(jcAporteMensal) || 0;
    const taxa = parseFloat(jcTaxaJuros) / 100;
    let periodo = parseFloat(jcTempo);

    if (jcTipoTempo === 'meses') {
      periodo = periodo / 12;
    }

    const taxaMensal = taxa / 12;
    const meses = periodo * 12;

    // Valor futuro do capital inicial
    const valorFuturoCapital = capital * Math.pow(1 + taxaMensal, meses);

    // Valor futuro dos aportes mensais
    const valorFuturoAportes = aporte * (Math.pow(1 + taxaMensal, meses) - 1) / taxaMensal;

    const valorTotal = valorFuturoCapital + valorFuturoAportes;
    const totalInvestido = capital + (aporte * meses);
    const jurosGanhos = valorTotal - totalInvestido;

    setJcResultado({
      valorTotal,
      totalInvestido,
      jurosGanhos,
      rentabilidade: (jurosGanhos / totalInvestido) * 100
    });
  };

  // Cálculo para Aposentadoria
  const calcularAposentadoria = () => {
    const idadeAtual = parseFloat(apIdadeAtual);
    const idadeAposentadoria = parseFloat(apIdadeAposentadoria);
    const capital = parseFloat(apCapitalInicial) || 0;
    const aporte = parseFloat(apAporteMensal) || 0;
    const taxa = parseFloat(apTaxaJuros) / 100;

    const anosContribuicao = idadeAposentadoria - idadeAtual;
    const mesesContribuicao = anosContribuicao * 12;
    const taxaMensal = taxa / 12;

    // Valor futuro do capital inicial
    const valorFuturoCapital = capital * Math.pow(1 + taxaMensal, mesesContribuicao);

    // Valor futuro dos aportes mensais
    const valorFuturoAportes = aporte * (Math.pow(1 + taxaMensal, mesesContribuicao) - 1) / taxaMensal;

    const valorTotal = valorFuturoCapital + valorFuturoAportes;
    const totalInvestido = capital + (aporte * mesesContribuicao);
    const jurosGanhos = valorTotal - totalInvestido;

    // Renda mensal estimada (usando regra dos 4%)
    const rendaMensal = (valorTotal * 0.04) / 12;

    setApResultado({
      valorTotal,
      totalInvestido,
      jurosGanhos,
      anosContribuicao,
      rendaMensal
    });
  };

  // Cálculo de Rendimento Necessário
  const calcularRendimentoNecessario = () => {
    const valorDesejado = parseFloat(rnValorDesejado);
    const capital = parseFloat(rnCapitalInicial) || 0;
    const aporte = parseFloat(rnAporteMensal) || 0;
    let periodo = parseFloat(rnTempo);

    if (rnTipoTempo === 'meses') {
      periodo = periodo / 12;
    }

    const meses = periodo * 12;
    const totalInvestido = capital + (aporte * meses);

    // Tentativa de encontrar a taxa necessária (método iterativo simplificado)
    let taxaNecessaria = 0;
    let taxaTentativa = 0.01; // Começar com 1%
    let incremento = 0.001; // 0.1%
    let valorCalculado = 0;

    for (let i = 0; i < 1000; i++) {
      const taxaMensal = taxaTentativa / 12;
      const valorFuturoCapital = capital * Math.pow(1 + taxaMensal, meses);
      const valorFuturoAportes = aporte * (Math.pow(1 + taxaMensal, meses) - 1) / taxaMensal;
      valorCalculado = valorFuturoCapital + valorFuturoAportes;

      if (valorCalculado >= valorDesejado) {
        taxaNecessaria = taxaTentativa;
        break;
      }
      taxaTentativa += incremento;
    }

    setRnResultado({
      valorDesejado,
      totalInvestido,
      taxaNecessaria: taxaNecessaria * 100,
      possivel: valorCalculado >= valorDesejado
    });
  };

  return (
    <MarketPremiumGuard marketFeature="financial-calculator">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Calculadora Financeira</h1>
          <p className="text-muted-foreground">Ferramentas de cálculo para investimentos</p>
        </div>

        <Tabs defaultValue="juros-compostos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="juros-compostos" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Juros Compostos
            </TabsTrigger>
            <TabsTrigger value="aposentadoria" className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Aposentadoria
            </TabsTrigger>
            <TabsTrigger value="rendimento-necessario" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Rendimento Necessário
            </TabsTrigger>
          </TabsList>

          {/* Calculadora de Juros Compostos */}
          <TabsContent value="juros-compostos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Calculadora de Juros Compostos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jc-capital">Capital Inicial (R$)</Label>
                    <Input
                      id="jc-capital"
                      type="number"
                      placeholder="10000"
                      value={jcCapitalInicial}
                      onChange={(e) => setJcCapitalInicial(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jc-aporte">Aporte Mensal (R$)</Label>
                    <Input
                      id="jc-aporte"
                      type="number"
                      placeholder="500"
                      value={jcAporteMensal}
                      onChange={(e) => setJcAporteMensal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jc-taxa">Taxa de Juros (% ao ano)</Label>
                    <Input
                      id="jc-taxa"
                      type="number"
                      step="0.01"
                      placeholder="12"
                      value={jcTaxaJuros}
                      onChange={(e) => setJcTaxaJuros(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jc-tempo">Tempo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="jc-tempo"
                        type="number"
                        placeholder="10"
                        value={jcTempo}
                        onChange={(e) => setJcTempo(e.target.value)}
                        className="flex-1"
                      />
                      <Select value={jcTipoTempo} onValueChange={setJcTipoTempo}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anos">Anos</SelectItem>
                          <SelectItem value="meses">Meses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Button onClick={calcularJurosCompostos} className="w-full">
                  Calcular
                </Button>

                {jcResultado && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold mb-4 text-green-800">Resultado da Simulação</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Valor Total</p>
                        <p className="text-lg font-bold text-green-700">{formatCurrency(jcResultado.valorTotal)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Investido</p>
                        <p className="text-lg font-bold text-blue-700">{formatCurrency(jcResultado.totalInvestido)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Juros Ganhos</p>
                        <p className="text-lg font-bold text-purple-700">{formatCurrency(jcResultado.jurosGanhos)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Rentabilidade</p>
                        <p className="text-lg font-bold text-orange-700">{formatPercentage(jcResultado.rentabilidade)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calculadora de Aposentadoria */}
          <TabsContent value="aposentadoria" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  Planejamento para Aposentadoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ap-idade-atual">Idade Atual</Label>
                    <Input
                      id="ap-idade-atual"
                      type="number"
                      placeholder="30"
                      value={apIdadeAtual}
                      onChange={(e) => setApIdadeAtual(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ap-idade-aposentadoria">Idade de Aposentadoria</Label>
                    <Input
                      id="ap-idade-aposentadoria"
                      type="number"
                      placeholder="65"
                      value={apIdadeAposentadoria}
                      onChange={(e) => setApIdadeAposentadoria(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ap-capital">Capital Inicial (R$)</Label>
                    <Input
                      id="ap-capital"
                      type="number"
                      placeholder="10000"
                      value={apCapitalInicial}
                      onChange={(e) => setApCapitalInicial(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ap-aporte">Aporte Mensal (R$)</Label>
                    <Input
                      id="ap-aporte"
                      type="number"
                      placeholder="1000"
                      value={apAporteMensal}
                      onChange={(e) => setApAporteMensal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="ap-taxa">Taxa de Juros (% ao ano)</Label>
                    <Input
                      id="ap-taxa"
                      type="number"
                      step="0.01"
                      placeholder="10"
                      value={apTaxaJuros}
                      onChange={(e) => setApTaxaJuros(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={calcularAposentadoria} className="w-full">
                  Calcular Aposentadoria
                </Button>

                {apResultado && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold mb-4 text-blue-800">Projeção da Aposentadoria</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Valor Acumulado</p>
                        <p className="text-lg font-bold text-green-700">{formatCurrency(apResultado.valorTotal)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Investido</p>
                        <p className="text-lg font-bold text-blue-700">{formatCurrency(apResultado.totalInvestido)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Rendimentos</p>
                        <p className="text-lg font-bold text-purple-700">{formatCurrency(apResultado.jurosGanhos)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Anos de Contribuição</p>
                        <p className="text-lg font-bold text-orange-700">{apResultado.anosContribuicao} anos</p>
                      </div>
                      <div className="text-center md:col-span-2 lg:col-span-2">
                        <p className="text-sm text-gray-600">Renda Mensal Estimada (4% ao ano)</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(apResultado.rendaMensal)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calculadora de Rendimento Necessário */}
          <TabsContent value="rendimento-necessario" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Qual Rendimento Preciso?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rn-valor">Valor Desejado (R$)</Label>
                    <Input
                      id="rn-valor"
                      type="number"
                      placeholder="1000000"
                      value={rnValorDesejado}
                      onChange={(e) => setRnValorDesejado(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rn-capital">Capital Inicial (R$)</Label>
                    <Input
                      id="rn-capital"
                      type="number"
                      placeholder="10000"
                      value={rnCapitalInicial}
                      onChange={(e) => setRnCapitalInicial(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rn-aporte">Aporte Mensal (R$)</Label>
                    <Input
                      id="rn-aporte"
                      type="number"
                      placeholder="500"
                      value={rnAporteMensal}
                      onChange={(e) => setRnAporteMensal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rn-tempo">Prazo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="rn-tempo"
                        type="number"
                        placeholder="10"
                        value={rnTempo}
                        onChange={(e) => setRnTempo(e.target.value)}
                        className="flex-1"
                      />
                      <Select value={rnTipoTempo} onValueChange={setRnTipoTempo}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anos">Anos</SelectItem>
                          <SelectItem value="meses">Meses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Button onClick={calcularRendimentoNecessario} className="w-full">
                  Calcular Taxa Necessária
                </Button>

                {rnResultado && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold mb-4 text-purple-800">Taxa de Rendimento Necessária</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Valor Desejado</p>
                        <p className="text-lg font-bold text-green-700">{formatCurrency(rnResultado.valorDesejado)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total a Investir</p>
                        <p className="text-lg font-bold text-blue-700">{formatCurrency(rnResultado.totalInvestido)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Taxa Necessária</p>
                        <p className="text-lg font-bold text-purple-700">{formatPercentage(rnResultado.taxaNecessaria)}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-white">
                      <p className={`text-center font-semibold ${rnResultado.possivel ? 'text-green-600' : 'text-red-600'}`}>
                        {rnResultado.possivel 
                          ? '✅ Meta alcançável com essa taxa de rendimento!'
                          : '❌ Meta muito ambiciosa para os parâmetros informados.'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MarketPremiumGuard>
  );
}
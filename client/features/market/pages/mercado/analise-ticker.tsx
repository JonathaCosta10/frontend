import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChartContainer } from '@/components/ui/chart';
import { 
  Search,
  Building2, 
  TrendingUp, 
  BarChart3, 
  PieChart
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import MarketPremiumGuard from "@/core/security/guards/MarketPremiumGuard";
import investmentService from "@/features/investments/services/investmentService";
import { marketApi, type TabelaSetorData, type TabelaSegmentoData } from '@/services/api/market';

export default function AnaliseTicker() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search function
  const debouncedSearch = useCallback(
    async (term: string) => {
      if (!term || term.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await investmentService.buscarTickers(term);
        console.log('Resultados da busca:', results);
        setSearchResults(results || []);
      } catch (error) {
        console.error('Erro ao buscar tickers:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Effect for auto-search with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, 500); // 0.5 segundo de delay

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  // Função para detectar automaticamente o tipo do ativo
  const detectarTipoAtivo = (ticker: string, tipoAPI?: string) => {
    // Se a API retornou o tipo, usar ele
    if (tipoAPI) {
      return tipoAPI.toLowerCase().includes('fii') || tipoAPI.toLowerCase().includes('fund') ? 'FII' : 'AÇÃO';
    }
    
    // Detecção automática baseada no padrão do ticker
    // FIIs geralmente terminam com 11
    if (ticker && ticker.endsWith('11')) {
      return 'FII';
    }
    
    // Se não termina com 11, provavelmente é ação
    return 'AÇÃO';
  };

  // Função para selecionar um ticker e direcionar para análise específica
  const selectTicker = (ticker: string, tipo?: string) => {
    console.log('Selecionando ticker:', ticker, 'tipo da API:', tipo);
    
    if (!ticker || ticker.trim() === '') {
      console.error('Ticker inválido:', ticker);
      return;
    }
    
    // Detectar tipo automaticamente
    const tipoDetectado = detectarTipoAtivo(ticker, tipo);
    console.log('Tipo detectado:', tipoDetectado);
    
    // Limpar os estados de busca
    setSearchTerm('');
    setSearchResults([]);
    
    try {
      if (tipoDetectado === 'FII') {
        const urlFII = `/dashboard/mercado/analise-ticker/fii?ticker=${ticker.toUpperCase()}`;
        console.log('Navegando para FII:', urlFII);
        navigate(urlFII);
      } else {
        const urlAcao = `/dashboard/mercado/analise-ticker-acoes?ticker=${ticker.toUpperCase()}`;
        console.log('Navegando para Ação:', urlAcao);
        navigate(urlAcao);
      }
    } catch (error) {
      console.error('Erro na navegação:', error);
    }
  };

  return (
    <MarketPremiumGuard marketFeature="ticker-analysis">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Análise Ativos</h1>
          <p className="text-muted-foreground text-lg">Análise detalhada de ativos individuais</p>
        </div>

        {/* Campo de Busca Universal - Maior */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Search className="h-7 w-7" />
              Digite o codigo do ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Digite o nome ou código do ativo (ex: PETR4, HGLG11, VALE3, Petrobras, Shopping)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xl h-16 px-8"
              />
              
              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Buscando...</span>
                </div>
              )}

              {/* Resultados da Busca */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Resultados encontrados:</h4>
                  <div className="grid gap-3 max-h-80 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md"
                        onClick={() => {
                          console.log('Clicando no resultado:', result);
                          selectTicker(result.ticker, result.tipo_ativo);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{result.ticker}</span>
                              <Badge 
                                variant={detectarTipoAtivo(result.ticker, result.tipo_ativo) === 'FII' ? 'default' : 'secondary'}
                                className="px-2 py-1 text-xs"
                              >
                                {detectarTipoAtivo(result.ticker, result.tipo_ativo)}
                              </Badge>
                            </div>
                            {result.setor && (
                              <p className="text-gray-500 text-xs mt-1">Setor: {result.setor}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {result.preco && (
                              <p className="font-semibold text-green-600">
                                R$ {Number(result.preco).toFixed(2)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Clique para analisar</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.length === 0 && searchTerm && !isSearching && searchTerm.length >= 2 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">
                    Nenhum resultado encontrado para "{searchTerm}". Tente outros termos de busca.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráficos de Setores */}
        <SetoresGraficos />

        {/* Opções de Análise Especializada - Cards Maiores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-blue-300 min-h-[280px]">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <Building2 className="h-10 w-10 text-blue-600" />
                Análise de FIIs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-xl leading-relaxed">
                Análise especializada em Fundos de Investimento Imobiliário com métricas específicas do setor imobiliário.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="px-3 py-1 text-sm">P/VP</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Dividend Yield</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Liquidez</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Alavancagem</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Composição</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-green-300 min-h-[280px]">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <TrendingUp className="h-10 w-10 text-green-600" />
                Análise de Ações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-xl leading-relaxed">
                Análise completa de ações com indicadores fundamentalistas e técnicos para decisões de investimento.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="px-3 py-1 text-sm">P/L</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">ROE</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Dividend Yield</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Volume</Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">Setor</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações sobre as Análises - Fonte Maior */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-4 text-3xl">
              <BarChart3 className="h-8 w-8" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center space-y-6">
                <Search className="h-16 w-16 mx-auto text-blue-600" />
                <h4 className="font-semibold text-2xl">1. Busque</h4>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Digite o código ou nome do ativo que deseja analisar. Nossa busca é inteligente e encontra tanto FIIs quanto ações.
                </p>
              </div>
              <div className="text-center space-y-6">
                <PieChart className="h-16 w-16 mx-auto text-green-600" />
                <h4 className="font-semibold text-2xl">2. Analise</h4>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Visualize métricas detalhadas e indicadores específicos para cada tipo de ativo com análises profundas.
                </p>
              </div>
              <div className="text-center space-y-6">
                <TrendingUp className="h-16 w-16 mx-auto text-purple-600" />
                <h4 className="font-semibold text-2xl">3. Decida</h4>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Use os dados e insights para tomar decisões de investimento informadas e estratégicas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketPremiumGuard>
  );
}

// Componente para gráficos de setores
function SetoresGraficos() {
  console.log('🎯 SetoresGraficos - Componente renderizando');
  
  const { data: marketData, isLoading, error } = useQuery({
    queryKey: ['market-destaques-gerais'],
    queryFn: marketApi.getDestaquesGerais,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: false, // Desabilitar auto-refresh para evitar spam de requisições
    retry: 1, // Tentar apenas uma vez
  });

  console.log('🔍 SetoresGraficos - Estado:', { isLoading, error: error?.message, hasData: !!marketData });

  // Dados mock para quando a API não estiver disponível
  const mockData = {
    success: true,
    data: {
      tabelas_para_graficos: {
        tabela_acoes: [
          {
            setor: "Financeiro",
            valor_milhoes: 973400.6,
            valor_patrimonial_milhoes: 400743.9,
            p_vp_medio: 2.43,
            variacao_diaria: 0.54,
            variacao_semanal: 1.57,
            percentual_total: 32.44,
            percentual_categoria: 32.44,
            total_ativos: 8,
            fonte_calculo: "market_cap_real",
            ativos_com_market_cap_real: 8
          },
          {
            setor: "Materiais Básicos",
            valor_milhoes: 936665.7,
            valor_patrimonial_milhoes: 329572.7,
            p_vp_medio: 2.84,
            variacao_diaria: -0.65,
            variacao_semanal: -1.47,
            percentual_total: 31.21,
            percentual_categoria: 31.21,
            total_ativos: 7,
            fonte_calculo: "market_cap_real",
            ativos_com_market_cap_real: 7
          },
          {
            setor: "Industrial",
            valor_milhoes: 438812.4,
            valor_patrimonial_milhoes: 24871.2,
            p_vp_medio: 17.64,
            variacao_diaria: 1.93,
            variacao_semanal: 3.11,
            percentual_total: 14.62,
            percentual_categoria: 14.62,
            total_ativos: 5,
            fonte_calculo: "market_cap_real",
            ativos_com_market_cap_real: 5
          },
          {
            setor: "Energia Elétrica",
            valor_milhoes: 359686.9,
            valor_patrimonial_milhoes: 124903.3,
            p_vp_medio: 2.88,
            variacao_diaria: 2.19,
            variacao_semanal: 2.38,
            percentual_total: 11.99,
            percentual_categoria: 11.99,
            total_ativos: 8,
            fonte_calculo: "market_cap_real",
            ativos_com_market_cap_real: 8
          },
          {
            setor: "Consumo Não-Cíclico",
            valor_milhoes: 292298.0,
            valor_patrimonial_milhoes: 12786.1,
            p_vp_medio: 22.86,
            variacao_diaria: -0.13,
            variacao_semanal: 0.07,
            percentual_total: 9.74,
            percentual_categoria: 9.74,
            total_ativos: 6,
            fonte_calculo: "market_cap_real",
            ativos_com_market_cap_real: 6
          }
        ],
        tabela_fiis: [
          {
            segmento: "Shoppings",
            valor_milhoes: 29.4,
            variacao_diaria: -0.33,
            variacao_semanal: 0.04,
            percentual_total: 0.0,
            percentual_categoria: 36.66,
            total_ativos: 6
          },
          {
            segmento: "Logística",
            valor_milhoes: 27.8,
            variacao_diaria: 0.27,
            variacao_semanal: 0.22,
            percentual_total: 0.0,
            percentual_categoria: 34.66,
            total_ativos: 6
          },
          {
            segmento: "Lajes Corporativas",
            valor_milhoes: 13.3,
            variacao_diaria: -0.28,
            variacao_semanal: -0.14,
            percentual_total: 0.0,
            percentual_categoria: 16.58,
            total_ativos: 8
          },
          {
            segmento: "FOFs",
            valor_milhoes: 8.5,
            variacao_diaria: 0.17,
            variacao_semanal: 0.26,
            percentual_total: 0.0,
            percentual_categoria: 10.6,
            total_ativos: 4
          },
          {
            segmento: "Saúde/Hospitais",
            valor_milhoes: 1.2,
            variacao_diaria: -0.23,
            variacao_semanal: 0.61,
            percentual_total: 0.0,
            percentual_categoria: 1.5,
            total_ativos: 4
          }
        ]
      }
    }
  };

  // Usar dados da API se disponíveis, senão usar mock
  const dataToUse = (marketData?.success && marketData?.data) ? marketData : mockData;

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <BarChart3 className="h-7 w-7" />
            Análise por Setores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">Carregando dados do mercado...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tabelaAcoes = dataToUse.data?.tabelas_para_graficos?.tabela_acoes || [];
  const tabelaFiis = dataToUse.data?.tabelas_para_graficos?.tabela_fiis || [];

  // Debug: verificar se os dados estão chegando
  console.log('📊 SetoresGraficos - Dados da API:', dataToUse);
  console.log('📈 SetoresGraficos - Tabela Ações:', tabelaAcoes);
  console.log('🏢 SetoresGraficos - Tabela FIIs:', tabelaFiis);

  // Verificar se há dados para renderizar
  if (tabelaAcoes.length === 0 && tabelaFiis.length === 0) {
    console.log('⚠️ SetoresGraficos - Nenhum dado disponível para gráficos');
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <BarChart3 className="h-7 w-7" />
            Análise por Setores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-yellow-600 text-lg">Nenhum dado disponível para gráficos</p>
            <p className="text-sm text-gray-500 mt-2">
              Aguarde o carregamento dos dados do mercado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('✅ SetoresGraficos - Renderizando gráficos com dados');

  // Ordenar setores por valor (maior para menor)
  const acoesSorted = [...tabelaAcoes].sort((a, b) => b.valor_milhoes - a.valor_milhoes);
  const fiisSorted = [...tabelaFiis].sort((a, b) => b.valor_milhoes - a.valor_milhoes);

  // Cores para os gráficos
  const coresAcoes = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const coresFiis = ['#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'];

  // Formatador de valores
  const formatarValor = (valor: number) => {
    if (valor >= 1000) {
      return `R$ ${(valor / 1000).toFixed(1)}B`;
    }
    return `R$ ${valor.toFixed(0)}M`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <BarChart3 className="h-7 w-7" />
          Análise por Setores
          {error && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Dados de demonstração
            </Badge>
          )}
        </CardTitle>
        <p className="text-muted-foreground text-lg mt-2">
          Distribuição de valor de mercado por setores e segmentos
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Gráfico de Ações por Setor */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800">Ações por Setor</h3>
              <p className="text-sm text-gray-600">Valor de mercado em milhões de reais</p>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={acoesSorted}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="setor" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                    stroke="#666"
                  />
                  <YAxis 
                    tickFormatter={formatarValor}
                    fontSize={11}
                    stroke="#666"
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatarValor(value),
                      'Valor de Mercado'
                    ]}
                    labelFormatter={(label: string) => `Setor: ${label}`}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Bar dataKey="valor_milhoes" radius={[4, 4, 0, 0]}>
                    {acoesSorted.map((entry, index) => (
                      <Cell key={`cell-acoes-${index}`} fill={coresAcoes[index % coresAcoes.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Estatísticas das Ações */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {acoesSorted.slice(0, 2).map((setor, index) => (
                <div key={setor.setor} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: coresAcoes[index] }}
                    />
                    <span className="font-medium text-sm">{setor.setor}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{formatarValor(setor.valor_milhoes)}</p>
                  <p className="text-xs text-gray-600">{setor.percentual_categoria.toFixed(1)}% do total</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de FIIs por Segmento */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800">FIIs por Segmento</h3>
              <p className="text-sm text-gray-600">Valor de mercado em milhões de reais</p>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={fiisSorted}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="segmento" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                    stroke="#666"
                  />
                  <YAxis 
                    tickFormatter={formatarValor}
                    fontSize={11}
                    stroke="#666"
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatarValor(value),
                      'Valor de Mercado'
                    ]}
                    labelFormatter={(label: string) => `Segmento: ${label}`}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Bar dataKey="valor_milhoes" radius={[4, 4, 0, 0]}>
                    {fiisSorted.map((entry, index) => (
                      <Cell key={`cell-fiis-${index}`} fill={coresFiis[index % coresFiis.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Estatísticas dos FIIs */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {fiisSorted.slice(0, 2).map((segmento, index) => (
                <div key={segmento.segmento} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: coresFiis[index] }}
                    />
                    <span className="font-medium text-sm">{segmento.segmento}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{formatarValor(segmento.valor_milhoes)}</p>
                  <p className="text-xs text-gray-600">{segmento.percentual_categoria.toFixed(1)}% do total</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumo Total */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <h4 className="font-semibold text-gray-800">Total Ações</h4>
              <p className="text-2xl font-bold text-blue-600">
                {formatarValor(acoesSorted.reduce((acc, curr) => acc + curr.valor_milhoes, 0))}
              </p>
              <p className="text-sm text-gray-600">
                {acoesSorted.reduce((acc, curr) => acc + curr.total_ativos, 0)} ativos
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Total FIIs</h4>
              <p className="text-2xl font-bold text-green-600">
                {formatarValor(fiisSorted.reduce((acc, curr) => acc + curr.valor_milhoes, 0))}
              </p>
              <p className="text-sm text-gray-600">
                {fiisSorted.reduce((acc, curr) => acc + curr.total_ativos, 0)} ativos
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Total Geral</h4>
              <p className="text-2xl font-bold text-purple-600">
                {formatarValor(
                  acoesSorted.reduce((acc, curr) => acc + curr.valor_milhoes, 0) +
                  fiisSorted.reduce((acc, curr) => acc + curr.valor_milhoes, 0)
                )}
              </p>
              <p className="text-sm text-gray-600">
                {acoesSorted.reduce((acc, curr) => acc + curr.total_ativos, 0) + 
                 fiisSorted.reduce((acc, curr) => acc + curr.total_ativos, 0)} ativos
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
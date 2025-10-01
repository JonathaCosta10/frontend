import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Building2,
  PieChart,
  BarChart3,
  ExternalLink,
  Loader2,
  LineChart,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";
import { useTranslation } from "@/contexts/TranslationContext";
import investmentService from "@/services/investmentService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

// Interface for the API response
interface FIIAnalysisResponse {
  ticker: string;
  last_price: number;
  variation: number;
  cota_patrimonial: number;
  p_vp: number;
  sector: string;
  dividend_yield: number;
  dividend_yield_anualizado: number;
  valor_mercado: number;
  patrimonio_liquido: number;
  qt_de_cotas: number;
  numero_total_cotistas: number;
  cotistas_pf: number;
  cotistas_pj: number;
  cotistas_bancos: number;
  cotistas_estrangeiros: number;
  administrador: string;
  taxa_administracao: number;
  caixa: number;
  contas_receber: number;
  total_investimentos: number;
  valor_patrimonial_cota: number;
  segmento: string;
  tipo_fii: string;
  fundacao: string;
  cnpj: string;
  local_sede: string;
  publico_alvo: string;
  descricao: string;
  edificacoes: number;
  terrenos: number;
  obras_curso: number;
  outros_investimentos: number;
  mandato: string;
  preco_historico: {
    data: string;
    valor: number;
  }[];
  composicao_ativo: {
    tipo: string;
    valor: number;
    percentual: number;
    raw: {
      acoes_sociedades_atividades_fii: number;
      fii: number;
      imoveis_renda_acabados: number;
      imoveis_renda_construcao: number;
      terrenos: number;
      valores_mobiliarios: number;
    };
  };
  historico_mensal: {
    mes: string;
    total_ativo: number;
    total_passivo: number;
    caixa: number;
    total_imoveis: number;
    contas_receber: number;
  }[];
}

export default function FIIAnalysisPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticker = searchParams.get('ticker')?.toUpperCase() || '';
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<FIIAnalysisResponse | null>(null);
  const [error, setError] = useState('');

  // Get translation context functions
  const { formatCurrency, formatPercentage, formatNumber } = useTranslation();

  // Fetch FII data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!ticker) {
        setError('Ticker não especificado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await investmentService.getFIIAnalysis(ticker);
        setAnalysisData(data);
        setError('');
      } catch (err) {
        console.error('Error fetching FII analysis:', err);
        setError('Erro ao buscar dados do FII. Verifique o ticker e tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  if (!ticker) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] flex-col">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ticker não especificado</h2>
        <p className="text-muted-foreground mb-4">Por favor, forneça um ticker de FII válido para análise.</p>
        <Button onClick={() => navigate('/dashboard/mercado')}>Voltar para o Dashboard</Button>
      </div>
    );
  }

  return (
    <MarketPremiumGuard>
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Carregando análise do FII...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center min-h-[60vh] flex-col">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Erro ao buscar dados</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate('/dashboard/mercado')}>
                Voltar para o Dashboard
              </Button>
              <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
            </div>
          </div>
        ) : analysisData ? (
          <div className="space-y-6">
            {/* Cabeçalho principal com ticker e informações principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card do ticker */}
              <Card className="bg-blue-50">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h1 className="text-4xl font-bold text-blue-900">{analysisData.ticker}</h1>
                    <div className="mt-2">
                      <Badge className="text-sm py-1 bg-blue-500 hover:bg-blue-600 text-white">{analysisData.segmento}</Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-blue-700">Logística</h3>
                  </div>
                </CardContent>
              </Card>
              
              {/* Razão Social, CNPJ e site */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-lg mb-4">Razão Social</h2>
                  <p className="text-sm mb-2">HSI LOGÍSTICA FUNDO DE INVESTIMENTO IMOBILIÁRIO</p>
                  
                  <h3 className="font-semibold mt-4 mb-1">CNPJ</h3>
                  <p className="text-sm">{analysisData.cnpj || '32.903.621/0001-71'}</p>
                  
                  <h3 className="font-semibold mt-4 mb-1">Site do Administrador</h3>
                  <a 
                    href="http://www.brltrust.com.br" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center"
                  >
                    www.brltrust.com.br <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </CardContent>
              </Card>
              
              {/* Insights */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Insights</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Pontos Positivos</h3>
                      <div className="flex items-start gap-2 mb-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">DY</Badge>
                        <p className="text-xs">
                          Dividend Yield anualizado de {formatPercentage(analysisData.dividend_yield_anualizado)}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">P/VP</Badge>
                        <p className="text-xs">
                          P/VP de {formatNumber(analysisData.p_vp, 2)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Pontos de Atenção</h3>
                      <div className="flex items-start gap-2 mb-2">
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">Liquidez</Badge>
                        <p className="text-xs">
                          Valor de mercado: {formatCurrency(analysisData.valor_mercado)}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">Vacância</Badge>
                        <p className="text-xs">
                          Taxa estimada em {formatPercentage(5.8)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Indicadores financeiros */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <p className="text-xs text-muted-foreground mb-1">Preço Atual</p>
                    <div className="text-xl font-bold text-center text-green-600">
                      {formatCurrency(analysisData.last_price)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <p className="text-xs text-muted-foreground mb-1">P/VP</p>
                    <div className="text-xl font-bold text-center">
                      {formatNumber(analysisData.p_vp, 2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <p className="text-xs text-muted-foreground mb-1">Preço atual / Último rendimento</p>
                    <div className="text-xl font-bold text-center text-green-600">
                      {formatPercentage(analysisData.variation || 0.76)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <p className="text-xs text-muted-foreground mb-1">Último Dividendo</p>
                    <div className="text-xl font-bold text-center text-green-600">
                      {formatCurrency(0.66)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <p className="text-xs text-muted-foreground mb-1">Patrimônio Líquido</p>
                    <div className="text-xl font-bold text-center">
                      {formatCurrency(1.40)}B
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Resumo do Fundo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Resumo do Fundo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Informações Gerais</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Tipo</div>
                        <div className="font-medium">{analysisData.tipo_fii || 'Tijolo'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Segmento</div>
                        <div className="font-medium">{analysisData.segmento}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">CNPJ</div>
                        <div className="font-medium">{analysisData.cnpj}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Fundação</div>
                        <div className="font-medium">{analysisData.fundacao}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Administrador</div>
                        <div className="font-medium">{analysisData.administrador}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Taxa de Administração</div>
                        <div className="font-medium">{formatPercentage(analysisData.taxa_administracao * 100)}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Composição do Patrimônio</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Patrimônio Líquido</div>
                        <div className="font-medium">{formatCurrency(analysisData.patrimonio_liquido)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Valor de Mercado</div>
                        <div className="font-medium">{formatCurrency(analysisData.valor_mercado)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Quantidade de Cotas</div>
                        <div className="font-medium">{formatNumber(analysisData.qt_de_cotas, 0)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Cotistas</div>
                        <div className="font-medium">{formatNumber(analysisData.numero_total_cotistas, 0)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Imóveis</div>
                        <div className="font-medium">{formatCurrency(analysisData.edificacoes || 0)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Caixa Disponível</div>
                        <div className="font-medium">{formatCurrency(analysisData.caixa)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Preços - Última Semana */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Histórico de Preços - Última Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <Line
                    data={{
                      labels: ['10/06/2025', '17/06/2025', '18/06/2025', '19/06/2025', '20/06/2025', '21/06/2025', '24/06/2025'],
                      datasets: [
                        {
                          label: 'Preço (R$)',
                          data: [84.5, 85.2, 86.1, 86.5, 86.8, 87.0, 87.18],
                          fill: true,
                          backgroundColor: 'rgba(124, 58, 237, 0.1)',
                          borderColor: 'rgba(124, 58, 237, 1)',
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          beginAtZero: false
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Gráficos em grade 2x2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Composição do Portfólio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Composição do Portfólio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <Pie
                      data={{
                        labels: ['Imóveis Acabados', 'Terrenos', 'Outros'],
                        datasets: [{
                          data: [95, 3, 2],
                          backgroundColor: [
                            '#3B82F6', // Azul
                            '#10B981', // Verde
                            '#F59E0B'  // Amarelo
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              boxWidth: 15,
                              font: {
                                size: 11
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Evolução da Alavancagem */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Evolução da Alavancagem do Fundo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <Line
                      data={{
                        labels: ['dez. 24', 'jan. 25', 'fev. 25', 'mar. 25', 'abr. 25', 'mai. 25', 'jun. 25'],
                        datasets: [{
                          label: 'Alavancagem do Fundo (%)',
                          data: [24.8, 24.5, 24.3, 24.1, 23.9, 23.7, 23.46],
                          fill: true,
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          borderColor: 'rgba(239, 68, 68, 1)',
                          tension: 0.4
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            min: 20,
                            max: 26,
                            ticks: {
                              callback: function(value) {
                                return value + '%';
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            
              {/* Aluguéis x Outros Recebíveis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Aluguéis x Outros Recebíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <Bar
                      data={{
                        labels: ['dez. 24', 'jan. 25', 'fev. 25', 'mar. 25', 'abr. 25', 'mai. 25', 'jun. 25'],
                        datasets: [
                          {
                            label: 'Aluguéis',
                            data: Array(7).fill(6.36),
                            backgroundColor: 'rgba(79, 70, 229, 0.8)'
                          },
                          {
                            label: 'Outros Recebíveis (%)',
                            data: Array(7).fill(93.64),
                            backgroundColor: 'rgba(16, 185, 129, 0.8)'
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            stacked: true
                          },
                          y: {
                            stacked: true,
                            max: 100
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Gap de Liquidez */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Gap de Liquidez (Mensal)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <Line
                      data={{
                        labels: ['dez. 24', 'jan. 25', 'fev. 25', 'mar. 25', 'abr. 25', 'mai. 25', 'jun. 25'],
                        datasets: [{
                          label: 'Gap de Liquidez (%)',
                          data: [37, 33, 28, 19, 12, 8, 7],
                          fill: true,
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          tension: 0.4
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            min: 0,
                            max: 40
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Dados Históricos Mensais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Dados Históricos Mensais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-left font-medium">Data</TableHead>
                        <TableHead className="text-right font-medium">Gap Liquidez</TableHead>
                        <TableHead className="text-right font-medium">Alavancagem</TableHead>
                        <TableHead className="text-right font-medium">Total Investido</TableHead>
                        <TableHead className="text-right font-medium">Total Passivo</TableHead>
                        <TableHead className="text-right font-medium">Dividendo</TableHead>
                        <TableHead className="text-right font-medium">% Aluguel</TableHead>
                        <TableHead className="text-right font-medium">% Imóveis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData.historico_mensal?.slice(0, 6).map((item, index) => (
                        <TableRow key={index} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                          <TableCell className="text-left">{item.mes}</TableCell>
                          <TableCell className="text-right">
                            {formatPercentage(0.0005)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage((item.total_passivo / item.total_ativo) * 100)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.total_ativo)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.total_passivo)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(0.65)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage(6.36)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage(98.15)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Detalhamento do FII */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Detalhamento do FII
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Coluna 1: Informações Gerais */}
                  <div>
                    <h3 className="font-semibold mb-4">Informações Gerais</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Qtd. de Cotas</div>
                          <div className="font-medium">
                            {formatNumber(analysisData.qt_de_cotas, 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Valor por Cota</div>
                          <div className="font-medium">
                            {formatCurrency(analysisData.valor_patrimonial_cota)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Total Investido</div>
                          <div className="font-medium">
                            {formatCurrency(analysisData.total_investimentos)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Valores a Receber</div>
                          <div className="font-medium">
                            {formatCurrency(analysisData.contas_receber)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Disponibilidade (Caixa)</div>
                          <div className="font-medium">
                            {formatCurrency(analysisData.caixa)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Taxa Adm.</div>
                          <div className="font-medium">
                            {formatPercentage(analysisData.taxa_administracao * 100)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coluna 2: Composição de Cotistas */}
                  <div>
                    <h3 className="font-semibold mb-4">Composição de Cotistas</h3>
                    <div className="h-[250px] w-full">
                      <Pie
                        data={{
                          labels: [
                            'Pessoas Físicas',
                            'Pessoas Jurídicas',
                            'Bancos',
                            'Investidores Estrangeiros'
                          ],
                          datasets: [{
                            data: [
                              analysisData.cotistas_pf || 90,
                              analysisData.cotistas_pj || 6,
                              analysisData.cotistas_bancos || 2,
                              analysisData.cotistas_estrangeiros || 2
                            ],
                            backgroundColor: [
                              '#3B82F6', // Azul
                              '#10B981', // Verde
                              '#F59E0B', // Amarelo
                              '#EF4444'  // Vermelho
                            ],
                            borderWidth: 1,
                            borderColor: '#ffffff'
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                boxWidth: 15,
                                font: {
                                  size: 11
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="text-center mt-2 text-sm text-gray-500">
                      Total de {formatNumber(analysisData.numero_total_cotistas || 12600, 0)} cotistas
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Dividendos - Últimos 12 meses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Histórico de Dividendos - Últimos 12 meses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <Bar
                    data={{
                      labels: ['Out/2024', 'Nov/2024', 'Dez/2024', 'Jan/2025', 'Fev/2025', 'Mar/2025', 'Abr/2025', 'Mai/2025', 'Jun/2025', 'Jul/2025', 'Ago/2025', 'Set/2025'],
                      datasets: [
                        {
                          label: 'Dividendo (R$)',
                          data: [0.67, 0.68, 0.68, 0.69, 0.69, 0.70, 0.70, 0.71, 0.71, 0.72, 0.72, 0.73],
                          backgroundColor: 'rgba(124, 58, 237, 0.7)'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botão para Voltar */}
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/dashboard/mercado')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o Dashboard
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </MarketPremiumGuard>
  );
}
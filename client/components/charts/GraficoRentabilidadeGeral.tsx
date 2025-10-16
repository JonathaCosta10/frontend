import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Loader2, TrendingUp, TrendingDown, Info } from "lucide-react";
import { investmentsApi, RentabilidadeGeralResponse, EvolucaoMensal } from '@/services/api/investments';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GraficoRentabilidadeGeralProps {
  tipo?: 'linha' | 'barra';
}

const GraficoRentabilidadeGeral: React.FC<GraficoRentabilidadeGeralProps> = ({
  tipo = 'linha'
}) => {
  const { shouldHideCharts } = usePrivacy();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RentabilidadeGeralResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tipoGrafico, setTipoGrafico] = useState<'linha' | 'barra'>(tipo);

  useEffect(() => {
    const fetchRentabilidadeGeral = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔄 [GraficoRentabilidadeGeral] Iniciando busca de dados...");
        
        const response = await investmentsApi.getRentabilidadeGeral();
        console.log("✅ [GraficoRentabilidadeGeral] Dados de rentabilidade recebidos:", response);
        
        const validacao = {
          isValidResponse: !!response,
          hasSuccess: response?.success,
          hasData: !!response?.data,
          hasEvolucaoMensal: !!response?.data?.evolucao_mensal_consolidada,
          qtdMesesEvolucao: response?.data?.evolucao_mensal_consolidada?.length,
          primeiroMes: response?.data?.evolucao_mensal_consolidada?.[0]
        };
        
        console.log("📊 [GraficoRentabilidadeGeral] Validação da estrutura:", validacao);
        
        setData(response);
      } catch (error) {
        console.error("Erro ao buscar rentabilidade geral:", error);
        setError("Erro ao carregar dados de rentabilidade");
      } finally {
        setLoading(false);
      }
    };

    fetchRentabilidadeGeral();
  }, []);

  // Preparar dados para o gráfico
  const chartData = data?.data.evolucao_mensal_consolidada.map(item => ({
    mes: new Date(item.mes_periodo + "-01").toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: '2-digit' 
    }),
    FII: item.valor_total_div_fii,
    Ações: item.valor_total_div_acao,
    Total: item.dividendos_total,
    'Patrimônio FII': item.valor_total_fii,
    'Patrimônio Ações': item.valor_total_acao,
    'Patrimônio Total': item.patrimonio_total,
    'Yield FII (%)': item.valor_total_fii > 0 ? ((item.valor_total_div_fii / item.valor_total_fii) * 100).toFixed(2) : '0',
    'Yield Ações (%)': item.valor_total_acao > 0 ? ((item.valor_total_div_acao / item.valor_total_acao) * 100).toFixed(2) : '0',
    'Yield Total (%)': item.patrimonio_total > 0 ? ((item.dividendos_total / item.patrimonio_total) * 100).toFixed(2) : '0'
  })) || [];

  // Debug: Log dos dados processados para o gráfico
  if (chartData.length > 0) {
    console.log("📊 Dados processados para o gráfico:", chartData);
  }

  // Formatador de moeda para tooltips
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Corrigindo: shouldHideCharts é uma função, não uma propriedade
  if (shouldHideCharts()) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Gráfico oculto por privacidade</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">Carregando dados de rentabilidade...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">{error || "Não foi possível carregar os dados"}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // Verifica se há dados de evolução mensal
  if (!data.data.evolucao_mensal_consolidada || data.data.evolucao_mensal_consolidada.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Nenhum dado de evolução mensal encontrado</p>
          <p className="text-xs text-muted-foreground">Certifique-se de que há investimentos cadastrados</p>
        </div>
      </div>
    );
  }

  const metricas = data.data.metricas_periodo;

  return (
    <div className="space-y-6">
      {/* Métricas resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patrimônio Final</p>
                <p className="text-2xl font-bold">{formatCurrency(metricas.patrimonio_final)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                Inicial: {formatCurrency(metricas.patrimonio_inicial)}
              </Badge>
              <Badge variant="default" className="text-xs text-green-600">
                +{formatCurrency(metricas.valorizacao_patrimonio)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Dividendos</p>
                <p className="text-2xl font-bold">{formatCurrency(metricas.total_dividendos_periodo)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">💰</span>
              </div>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                FII: {formatCurrency(metricas.total_dividendos_fii)}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Ações: {formatCurrency(metricas.total_dividendos_acao)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Yield do Período</p>
              <p className="text-lg font-bold text-green-600">
                FII: {metricas.yield_fii_periodo.toFixed(2)}%
              </p>
              <p className="text-lg font-bold text-blue-600">
                Ações: {metricas.yield_acao_periodo.toFixed(2)}%
              </p>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-muted-foreground">Rentabilidade Total</p>
              <p className="text-lg font-bold text-purple-600">
                {metricas.rentabilidade_total_periodo.toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {data.data.periodo_analise.meses_analisados} meses analisados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Evolução da Rentabilidade por Ativo</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant={tipoGrafico === 'linha' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTipoGrafico('linha')}
              >
                Linha
              </Button>
              <Button 
                variant={tipoGrafico === 'barra' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTipoGrafico('barra')}
              >
                Barra
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dividendos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dividendos">Dividendos (R$)</TabsTrigger>
              <TabsTrigger value="patrimonio">Patrimônio (R$)</TabsTrigger>
              <TabsTrigger value="yield">Yield (%)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dividendos" className="mt-4">
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total do Período:</span>
                  <span className="font-semibold text-lg">{formatCurrency(metricas.total_dividendos_periodo)}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>FII: {formatCurrency(metricas.total_dividendos_fii)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Ações: {formatCurrency(metricas.total_dividendos_acao)}</span>
                  </span>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={380}>
                {tipoGrafico === 'linha' ? (
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                      labelStyle={{ color: '#666' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="FII" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#3b82f6' }}
                      activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Ações" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#10b981' }}
                      activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                      labelStyle={{ color: '#666' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="rect"
                    />
                    <Bar 
                      dataKey="FII" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                      name="FII"
                    />
                    <Bar 
                      dataKey="Ações" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                      name="Ações"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="patrimonio" className="mt-4">
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Patrimônio Total:</span>
                  <span className="font-semibold text-lg">{formatCurrency(metricas.patrimonio_final)}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>FII: {formatCurrency(chartData[chartData.length - 1]?.['Patrimônio FII'] || 0)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Ações: {formatCurrency(chartData[chartData.length - 1]?.['Patrimônio Ações'] || 0)}</span>
                  </span>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={380}>
                {tipoGrafico === 'linha' ? (
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                      labelStyle={{ color: '#666' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Patrimônio FII" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#3b82f6' }}
                      activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                      name="FII"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Patrimônio Ações" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#10b981' }}
                      activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                      name="Ações"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                      labelStyle={{ color: '#666' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="rect"
                    />
                    <Bar 
                      dataKey="Patrimônio FII" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                      name="FII"
                    />
                    <Bar 
                      dataKey="Patrimônio Ações" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                      name="Ações"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="yield" className="mt-4">
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Yield Médio do Período:</span>
                  <span className="font-semibold text-lg">
                    {((metricas.yield_fii_periodo + metricas.yield_acao_periodo) / 2).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>FII: {metricas.yield_fii_periodo.toFixed(2)}%</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Ações: {metricas.yield_acao_periodo.toFixed(2)}%</span>
                  </span>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={380}>
                {tipoGrafico === 'linha' ? (
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip 
                      formatter={(value: string, name: string) => [`${value}%`, name]}
                      labelStyle={{ color: '#666' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Yield FII (%)" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#3b82f6' }}
                      activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                      name="FII"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Yield Ações (%)" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#10b981' }}
                      activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                      name="Ações"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip 
                      formatter={(value: string, name: string) => [`${value}%`, name]}
                      labelStyle={{ color: '#666' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="rect"
                    />
                    <Bar 
                      dataKey="Yield FII (%)" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                      name="FII"
                    />
                    <Bar 
                      dataKey="Yield Ações (%)" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                      name="Ações"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Indicadores de qualidade */}
      {data.data.qualidade_dados && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Indicadores de Qualidade dos Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-2">
              <Badge 
                variant={data.data.qualidade_dados.tem_dados_suficientes ? "default" : "destructive"}
              >
                {data.data.qualidade_dados.tem_dados_suficientes ? "Dados Suficientes" : "Dados Insuficientes"}
              </Badge>
              <Badge variant="secondary">
                Confiabilidade: {data.data.qualidade_dados.confiabilidade}
              </Badge>
              <Badge variant="outline">
                {data.data.qualidade_dados.percentual_dados_reais.toFixed(1)}% dados reais
              </Badge>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <p>• {data.data.qualidade_dados.meses_com_dados_reais} meses com dados reais</p>
              <p>• {data.data.qualidade_dados.meses_projetados} meses projetados</p>
              <p>• Período: {data.data.periodo_analise.data_inicio} até {data.data.periodo_analise.data_fim}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GraficoRentabilidadeGeral;
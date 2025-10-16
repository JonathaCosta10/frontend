import React from "react";
import { budgetApi, DistribuicaoGastosResponse } from "@/services/api/budget";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, AlertTriangle, TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";
import { useApiData } from '@/shared/hooks/useApiData';
import { useTranslation } from '@/contexts/TranslationContext';
import { usePrivacy } from '@/contexts/PrivacyContext';

interface MetaRealidadeChartProps {
  mes: number;
  ano: number;
}

interface AlertasProps {
  totalPlanejadoIncompleto: boolean;
  semGastosCadastrados: boolean;
}

interface CategoriaData {
  categoria: string;
  planejado: number;
  realizado: number;
  percentualUsado: number;
  status: 'dentro' | 'excedeu' | 'sem_dados';
  cor: string;
}

const MetaRealidadeChart: React.FC<MetaRealidadeChartProps> = ({ mes, ano }) => {
  const { formatCurrency } = useTranslation();
  const { formatValue, shouldHideCharts } = usePrivacy();
  
  const { data, loading, error } = useApiData(
    () => budgetApi.getDistribuicaoGastosCompleta(mes, ano)
  );

  const verificarAlertas = (dadosCompletos: DistribuicaoGastosResponse): AlertasProps => {
    let totalPlanejadoIncompleto = false;
    let semGastosCadastrados = false;

    // Buscar dados do mês específico
    const mesString = mes.toString();
    const dadosMesAtual = dadosCompletos.dados_mensais?.[mesString];

    if (dadosMesAtual) {
      // Verificar orçamento doméstico do mês atual
      if (dadosMesAtual.orcamento_domestico?.resumo) {
        totalPlanejadoIncompleto = dadosMesAtual.orcamento_domestico.resumo.total_planejado !== 1.00;
      }

      // Verificar se há gastos cadastrados no mês atual
      const temGastos = dadosMesAtual.gastos?.resumo?.total_gastos && dadosMesAtual.gastos.resumo.total_gastos > 0;
      semGastosCadastrados = !temGastos;
    } else {
      semGastosCadastrados = true;
    }

    return { totalPlanejadoIncompleto, semGastosCadastrados };
  };

  const processarDadosCategorias = (dadosCompletos: DistribuicaoGastosResponse): CategoriaData[] => {
    if (!dadosCompletos.dados_mensais) return [];

    const categorias = ['Custos Fixos', 'Prazer', 'Conforto', 'Metas', 'Liberdade Financeira', 'Conhecimento'];
    const categoriasMap: { [key: string]: string } = {
      'Custos Fixos': 'Custo Fixo',
      'Prazer': 'Prazer',
      'Conforto': 'Conforto', 
      'Metas': 'Metas',
      'Liberdade Financeira': 'Liberdade Financeira',
      'Conhecimento': 'Conhecimento'
    };

    const cores: { [key: string]: string } = {
      'Custos Fixos': '#ef4444',
      'Prazer': '#ec4899',
      'Conforto': '#3b82f6',
      'Metas': '#22c55e',
      'Liberdade Financeira': '#a855f7',
      'Conhecimento': '#f97316'
    };

    // Buscar dados do mês específico
    const mesString = mes.toString();
    const dadosMesAtual = dadosCompletos.dados_mensais[mesString];
    
    if (!dadosMesAtual) {
      console.log(`Dados do mês ${mes} não encontrados`);
      return [];
    }

    // Pegar o orçamento doméstico do mês atual
    const orcamentoDomestico = dadosMesAtual.orcamento_domestico;
    if (!orcamentoDomestico) {
      console.log('Orçamento doméstico não encontrado');
      return [];
    }

    // Usar apenas os dados do mês atual
    const totalEntradasMes = dadosMesAtual.resumo_financeiro?.total_entradas || 0;
    const gastosReaisPorCategoria: { [key: string]: number } = {};

    // Processar gastos apenas do mês atual
    if (dadosMesAtual.gastos?.por_categoria) {
      dadosMesAtual.gastos.por_categoria.forEach(item => {
        const categoriaApi = item.categoria;
        const categoria = Object.keys(categoriasMap).find(key => categoriasMap[key] === categoriaApi);
        if (categoria) {
          gastosReaisPorCategoria[categoria] = item.total;
        }
      });
    }

    // Criar dados das categorias
    const dadosCategorias: CategoriaData[] = [];

    categorias.forEach(categoria => {
      // Encontrar o valor planejado baseado no total de entradas do mês atual
      let valorPlanejado = 0;
      if (orcamentoDomestico.por_categoria) {
        const itemOrcamento = orcamentoDomestico.por_categoria.find((item: any) => item.categoria === categoria);
        if (itemOrcamento) {
          valorPlanejado = totalEntradasMes * itemOrcamento.valor;
        }
      }

      const valorRealizado = gastosReaisPorCategoria[categoria] || 0;
      
      let percentualUsado = 0;
      let status: 'dentro' | 'excedeu' | 'sem_dados' = 'sem_dados';
      
      if (valorPlanejado > 0) {
        percentualUsado = Math.min((valorRealizado / valorPlanejado) * 100, 150); // Limite visual de 150%
        if (valorRealizado <= valorPlanejado) {
          status = 'dentro';
        } else {
          status = 'excedeu';
        }
      } else if (valorRealizado > 0) {
        percentualUsado = 100;
        status = 'excedeu';
      }

      if (valorPlanejado > 0 || valorRealizado > 0) {
        dadosCategorias.push({
          categoria,
          planejado: valorPlanejado,
          realizado: valorRealizado,
          percentualUsado,
          status,
          cor: cores[categoria]
        });
      }
    });

    return dadosCategorias.sort((a, b) => b.planejado - a.planejado);
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-center space-y-4">
        <Target className="h-12 w-12 text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">Nenhum dado disponível</h3>
          <p className="text-muted-foreground">Configure seu orçamento para visualizar a comparação</p>
        </div>
      </div>
    );
  }

  const alertas = verificarAlertas(data);
  const dadosCategorias = processarDadosCategorias(data);

  if (dadosCategorias.length === 0) {
    return (
      <div className="space-y-4">
        {/* Alertas */}
        {(alertas.totalPlanejadoIncompleto || alertas.semGastosCadastrados) && (
          <div className="space-y-2">
            {alertas.totalPlanejadoIncompleto && (
              <div className="flex items-center space-x-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-700 dark:text-amber-300">
                  Suas metas ainda não foram completamente cadastradas, faça a distribuição de 100% do seu orçamento.
                </span>
              </div>
            )}
            {alertas.semGastosCadastrados && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Seus custos ainda não foram cadastrados na nossa plataforma, faça o cadastro para ter a visão completa da sua vida financeira.
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="h-40 flex flex-col items-center justify-center text-center space-y-4">
          <Target className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Dados insuficientes</h3>
            <p className="text-muted-foreground">Cadastre entradas e gastos para visualizar a comparação</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {(alertas.totalPlanejadoIncompleto || alertas.semGastosCadastrados) && (
        <div className="space-y-2">
          {alertas.totalPlanejadoIncompleto && (
            <div className="flex items-center space-x-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700 dark:text-amber-300">
                Suas metas ainda não foram completamente cadastradas, faça a distribuição de 100% do seu orçamento.
              </span>
            </div>
          )}
          {alertas.semGastosCadastrados && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Seus custos ainda não foram cadastrados na nossa plataforma, faça o cadastro para ter a visão completa da sua vida financeira.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Resumo Geral */}
      {!shouldHideCharts() && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Total Planejado</div>
                <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {formatValue(dadosCategorias.reduce((sum, cat) => sum + cat.planejado, 0))}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Realizado</div>
                <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                  {formatValue(dadosCategorias.reduce((sum, cat) => sum + cat.realizado, 0))}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Dentro do Orçamento</div>
                <div className="text-lg font-bold text-green-700 dark:text-green-400">
                  {dadosCategorias.filter(cat => cat.status === 'dentro').length}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Acima do Orçamento</div>
                <div className="text-lg font-bold text-red-700 dark:text-red-400">
                  {dadosCategorias.filter(cat => cat.status === 'excedeu').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards das Categorias */}
      <div className="grid gap-4">
        {dadosCategorias.map((categoria) => (
          <Card key={categoria.categoria} className="border-l-4" style={{ borderLeftColor: categoria.cor }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: categoria.cor }}
                  />
                  <h4 className="font-semibold text-sm">{categoria.categoria}</h4>
                  {categoria.status === 'excedeu' ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : categoria.status === 'dentro' ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : null}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatValue(categoria.realizado)} / {formatValue(categoria.planejado)}
                  </div>
                  <div className={`text-xs ${
                    categoria.status === 'excedeu' ? 'text-red-600' : 
                    categoria.status === 'dentro' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {shouldHideCharts() ? '****% usado' : `${categoria.percentualUsado.toFixed(1)}% usado`}
                  </div>
                </div>
              </div>
              
              {/* Barra de Progresso */}
              <div className="space-y-2">
                {shouldHideCharts() ? (
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  </div>
                ) : (
                  <Progress 
                    value={categoria.percentualUsado} 
                    className="h-2"
                    style={{
                      '--progress-background': categoria.status === 'excedeu' ? '#fef2f2' : '#f0f9ff',
                      '--progress-foreground': categoria.status === 'excedeu' ? '#dc2626' : categoria.cor
                    } as React.CSSProperties}
                  />
                )}
                
                {/* Informações adicionais */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {shouldHideCharts() ? (
                      categoria.planejado > categoria.realizado ? 'Disponível: R$ ****' : 'Excesso: R$ ****'
                    ) : (
                      categoria.planejado > categoria.realizado 
                        ? `Disponível: ${formatCurrency(categoria.planejado - categoria.realizado)}`
                        : `Excesso: ${formatCurrency(categoria.realizado - categoria.planejado)}`
                    )}
                  </span>
                  <span>
                    {categoria.status === 'dentro' ? 'Dentro do orçamento' : 
                     categoria.status === 'excedeu' ? 'Acima do orçamento' : 'Sem dados'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MetaRealidadeChart;

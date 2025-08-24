import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp, CircleDollarSign, BarChart3, PieChart } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAuth } from "@/contexts/AuthContext";
import { InvestmentApi } from "@/services/api/investment";
import { Link } from "react-router-dom";
import { AssetCard } from "@/components/ui/AssetCard";
import CompactLegend from "@/components/ui/CompactLegend";
import { formatPercentage } from "@/utils/formatters";
import { formatCurrencyCompact } from "@/utils/formattersCompact";
import { categoryColors } from "@/utils/colors";
import { assetClassMap, assetTypeMap } from "@/utils/mappings";

import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend as RechartsLegend
} from "recharts";

interface Carteira {
  id: number;
  nome: string;
  total: number;
  variacao_ultimo_dia: number;
  variacao_total: number;
  ativos: Array<{
    id: number;
    ticker: string;
    nome: string;
    tipo: string;
    quantidade: number;
    preco_medio: number;
    preco_atual: number;
    valor_investido: number;
    valor_atual: number;
    variacao_percentual: number;
    variacao_valor: number;
    rentabilidade: number;
    classe: string;
    setor: string | null;
    risco: string | null;
  }>;
  classes: Array<{
    classe: string;
    valor: number;
    percentual: number;
  }>;
  setores: Array<{
    setor: string;
    valor: number;
    percentual: number;
  }> | null;
}

const InvestimentosPage: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [carteiras, setCarteiras] = useState<Carteira[]>([]);
  const [loadingCarteiras, setLoadingCarteiras] = useState<boolean>(true);
  const [totalInvestido, setTotalInvestido] = useState<number>(0);
  const [totalAtual, setTotalAtual] = useState<number>(0);
  const [totalVariacaoValor, setTotalVariacaoValor] = useState<number>(0);
  const [totalVariacaoPercentual, setTotalVariacaoPercentual] = useState<number>(0);
  
  // Dados agregados para gráficos
  const [dadosClasses, setDadosClasses] = useState<{classe: string; valor: number; percentual: number}[]>([]);
  const [dadosSetores, setDadosSetores] = useState<{setor: string; valor: number; percentual: number}[]>([]);

  // Carrega as carteiras de investimento
  useEffect(() => {
    const carregarCarteiras = async () => {
      if (!isAuthenticated) {
        setLoadingCarteiras(false);
        return;
      }

      try {
        setLoadingCarteiras(true);
        const response = await InvestmentApi.getCarteiras();
        setCarteiras(response.data || []);
        
        // Calcula totais
        let investido = 0;
        let atual = 0;
        let variacao = 0;
        let classesAgregadas = {};
        let setoresAgregados = {};
        
        response.data.forEach((carteira: Carteira) => {
          carteira.ativos.forEach(ativo => {
            investido += ativo.valor_investido;
            atual += ativo.valor_atual;
            
            // Agrega classes
            if (classesAgregadas[ativo.classe]) {
              classesAgregadas[ativo.classe] += ativo.valor_atual;
            } else {
              classesAgregadas[ativo.classe] = ativo.valor_atual;
            }
            
            // Agrega setores (se existirem)
            if (ativo.setor) {
              if (setoresAgregados[ativo.setor]) {
                setoresAgregados[ativo.setor] += ativo.valor_atual;
              } else {
                setoresAgregados[ativo.setor] = ativo.valor_atual;
              }
            }
          });
        });
        
        variacao = atual - investido;
        const percentual = investido > 0 ? (variacao / investido) * 100 : 0;
        
        setTotalInvestido(investido);
        setTotalAtual(atual);
        setTotalVariacaoValor(variacao);
        setTotalVariacaoPercentual(percentual);
        
        // Processa dados de classes para o gráfico
        const classesData = Object.keys(classesAgregadas).map(classe => {
          return {
            classe,
            valor: classesAgregadas[classe],
            percentual: (classesAgregadas[classe] / atual) * 100
          };
        });
        setDadosClasses(classesData);
        
        // Processa dados de setores para o gráfico
        const setoresData = Object.keys(setoresAgregados).map(setor => {
          return {
            setor,
            valor: setoresAgregados[setor],
            percentual: (setoresAgregados[setor] / atual) * 100
          };
        });
        setDadosSetores(setoresData);
      } catch (error) {
        console.error("Erro ao carregar carteiras:", error);
      } finally {
        setLoadingCarteiras(false);
      }
    };

    carregarCarteiras();
  }, [isAuthenticated]);

  // Cores para os gráficos
  const getClassColor = (className: string) => {
    const classMapping = {
      "Renda Fixa": "rendaFixa",
      "Renda Variável": "rendaVariavel",
      "Fundos Imobiliários": "fundosImobiliarios",
      "Criptomoedas": "criptomoedas",
      "BDRs": "bdrs",
      "COEs": "coes",
      "Ouro": "ouro",
      "Tesouro Direto": "tesouroDireto",
      "ETFs": "etfs",
      "Outros": "outros"
    };
    
    const mappedKey = classMapping[className];
    if (mappedKey && categoryColors[mappedKey]) {
      return categoryColors[mappedKey];
    }
    
    return "#CCCCCC"; // Cor padrão
  };
  
  const getSectorColor = (sector: string) => {
    const sectorMapping = {
      "Tecnologia": "tecnologia",
      "Financeiro": "financeiro",
      "Consumo": "consumo",
      "Energia": "energia",
      "Saúde": "saude",
      "Indústria": "industria",
      "Materiais Básicos": "materiaisBasicos",
      "Serviços de Comunicação": "comunicacao",
      "Utilidades Públicas": "utilities",
      "Imobiliário": "imobiliario",
      "Outros": "outrosSetores"
    };
    
    const mappedKey = sectorMapping[sector];
    if (mappedKey && categoryColors[mappedKey]) {
      return categoryColors[mappedKey];
    }
    
    return "#CCCCCC"; // Cor padrão
  };

  // Prepara dados para o gráfico de classes
  const chartDataClasses = dadosClasses.map(item => ({
    name: assetClassMap[item.classe.toLowerCase()] || item.classe,
    value: item.valor,
    percentual: item.percentual
  }));

  // Prepara dados para o gráfico de setores
  const chartDataSetores = dadosSetores.map(item => ({
    name: item.setor,
    value: item.valor,
    percentual: item.percentual
  }));

  // Cria itens para a legenda compacta de classes
  const legendItemsClasses = dadosClasses.map(item => ({
    color: getClassColor(item.classe),
    label: assetClassMap[item.classe.toLowerCase()] || item.classe,
    percentage: item.percentual,
    value: formatCurrency(item.valor)
  }));

  // Cria itens para a legenda compacta de setores
  const legendItemsSetores = dadosSetores.map(item => ({
    color: getSectorColor(item.setor),
    label: item.setor,
    percentage: item.percentual,
    value: formatCurrency(item.valor)
  }));

  return (
    <div className="space-y-6">
      {/* Cabeçalho com totais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card Total Investido */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <CircleDollarSign className="h-4 w-4" />
              <span>{t("invested_value")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalInvestido)}
            </div>
          </CardContent>
        </Card>

        {/* Card Valor Atual */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <CircleDollarSign className="h-4 w-4" />
              <span>{t("current_value")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAtual)}
            </div>
          </CardContent>
        </Card>

        {/* Card Variação em Valor */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>{t("value_variation")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalVariacaoValor >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(totalVariacaoValor)}
            </div>
          </CardContent>
        </Card>

        {/* Card Variação Percentual */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>{t("percentage_variation")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalVariacaoPercentual >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatPercentage(totalVariacaoPercentual)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos em grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Alocação por Classe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>{t("allocation_by_class")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosClasses.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={chartDataClasses}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                      >
                        {chartDataClasses.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getClassColor(dadosClasses[index].classe)} 
                          />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4">
                  <CompactLegend items={legendItemsClasses} />
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>{t("no_data_available")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Alocação por Setor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>{t("allocation_by_sector")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosSetores.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={chartDataSetores}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                      >
                        {chartDataSetores.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getSectorColor(dadosSetores[index].setor)} 
                          />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4">
                  <CompactLegend items={legendItemsSetores} />
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>{t("no_sector_data_available")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de Carteiras */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("portfolios")}</CardTitle>
          <Link to="/sistema/dashboard/investimentos/cadastrar-carteira">
            <Button size="sm" variant="outline" className="h-8">
              <PlusCircle className="h-4 w-4 mr-2" />
              {t("new_portfolio")}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingCarteiras ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">{t("loading_portfolios")}</p>
            </div>
          ) : carteiras.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">{t("no_portfolios_yet")}</p>
              <p className="mt-2 text-sm">
                {t("start_creating_portfolio")}
              </p>
              <Link
                to="/sistema/dashboard/investimentos/cadastrar-carteira"
                className="mt-4 inline-block"
              >
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t("create_portfolio")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {carteiras.map((carteira) => (
                <Link
                  key={carteira.id}
                  to={`/sistema/dashboard/investimentos/carteira/${carteira.id}`}
                  className="block"
                >
                  <AssetCard
                    title={carteira.nome}
                    value={carteira.total}
                    variation={carteira.variacao_total}
                    dailyChange={carteira.variacao_ultimo_dia}
                  />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestimentosPage;

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PieChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { InvestmentApi } from "@/services/api/investment";
import { useToast } from "@/hooks/use-toast";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { categoryColors } from "@/utils/colors";
import CompactLegend from "@/components/ui/CompactLegend";

// Componente de setor ativo para o gráfico de pizza
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
    percent
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
      />
    </g>
  );
};

export default function AlocacaoSetorial() {
  const { carteira_id } = useParams<{ carteira_id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, formatCurrency } = useTranslation();
  const { toast } = useToast();

  const [carteiraInfo, setCarteiraInfo] = useState<any>(null);
  const [dadosSetoriais, setDadosSetoriais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !carteira_id) {
      setLoading(false);
      return;
    }

    const carregarDados = async () => {
      try {
        setLoading(true);
        
        // Carregar informações da carteira
        const resCarteira = await InvestmentApi.getCarteiraById(parseInt(carteira_id));
        setCarteiraInfo(resCarteira.data);
        
        // Carregar dados de alocação setorial
        const resAlocacao = await InvestmentApi.getRelatorioAlocacao(parseInt(carteira_id));
        
        // Processar dados setoriais
        if (resAlocacao.data && resAlocacao.data.setores) {
          const dadosProcessados = resAlocacao.data.setores
            .filter((item: any) => item.setor) // Remover itens sem setor definido
            .map((item: any) => ({
              name: item.setor,
              value: item.valor,
              percentual: item.percentual
            }));
          
          setDadosSetoriais(dadosProcessados);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: t("error_loading_data"),
          description: t("please_try_again"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [isAuthenticated, carteira_id, t, toast]);

  // Cores para setores
  const getSetorColor = (setor: string): string => {
    const setorMapping: Record<string, string> = {
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
    
    const mappedKey = setorMapping[setor];
    if (mappedKey && categoryColors[mappedKey]) {
      return categoryColors[mappedKey];
    }
    
    // Fallback para cores aleatórias mas consistentes
    const stringToColor = (str: string): string => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = '#';
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
      }
      return color;
    };
    
    return stringToColor(setor);
  };

  // Criar itens para legenda compacta
  const legendItems = dadosSetoriais.map(item => ({
    color: getSetorColor(item.name),
    label: item.name,
    percentage: item.percentual,
    value: formatCurrency(item.value)
  }));

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <PieChart className="h-6 w-6 mr-2" />
            {t("sector_allocation")}
          </h2>
          {carteiraInfo && (
            <p className="text-muted-foreground">
              {carteiraInfo.nome}
            </p>
          )}
        </div>
      </div>

      {/* Gráfico de Alocação Setorial */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sector_allocation")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">{t("loading_data")}</p>
            </div>
          ) : dadosSetoriais.length === 0 ? (
            <div className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">{t("no_sector_data")}</p>
            </div>
          ) : (
            <div>
              {/* Gráfico de Pizza */}
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={dadosSetoriais}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {dadosSetoriais.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getSetorColor(entry.name)} 
                        />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legenda */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">{t("details_by_sector")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CompactLegend items={legendItems} columns={1} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

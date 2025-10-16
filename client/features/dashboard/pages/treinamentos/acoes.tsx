import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  BarChart3,
  Users,
  BookOpen,
  Play,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from '../../../../contexts/TranslationContext';
import TrainingPremiumGuard from "@/core/security/guards/TrainingPremiumGuard";

export default function Acoes() {
  const { t } = useTranslation();

  const modules = [
    {
      title: "Introdução ao Mercado de Ações",
      description: "Como funciona a bolsa de valores e conceitos fundamentais",
      duration: "50 min",
      level: "Iniciante",
      completed: false,
    },
    {
      title: "Análise Fundamentalista",
      description: "Como analisar empresas através de indicadores financeiros",
      duration: "75 min",
      level: "Intermediário",
      completed: false,
    },
    {
      title: "Análise Técnica",
      description: "Gráficos, padrões e indicadores técnicos",
      duration: "65 min",
      level: "Intermediário",
      completed: false,
    },
    {
      title: "Estratégias de Investimento",
      description: "Value investing, growth e outras estratégias",
      duration: "60 min",
      level: "Avançado",
      completed: false,
    },
    {
      title: "Gestão de Risco",
      description: "Como proteger seu capital e gerenciar perdas",
      duration: "45 min",
      level: "Intermediário",
      completed: false,
    },
    {
      title: "Psicologia do Investidor",
      description: "Controle emocional e disciplina no mercado",
      duration: "40 min",
      level: "Avançado",
      completed: false,
    },
  ];

  const indicators = [
    { name: "P/L", description: "Preço sobre Lucro", goodRange: "5-15" },
    {
      name: "P/VP",
      description: "Preço sobre Valor Patrimonial",
      goodRange: "0.5-2",
    },
    { name: "ROE", description: "Return on Equity", goodRange: ">15%" },
    { name: "ROA", description: "Return on Assets", goodRange: ">5%" },
    {
      name: "Margem Líquida",
      description: "Lucratividade da empresa",
      goodRange: ">10%",
    },
    { name: "Debt/Equity", description: "Endividamento", goodRange: "<0.5" },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Iniciante":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Intermediário":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Avançado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <TrainingPremiumGuard trainingType="acoes">
      <div className="space-y-3 md:space-y-6">
      {/* Warning Alert */}
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                Atenção: Investimento de Alto Risco
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Ações são investimentos de renda variável com alto potencial de
                retorno, mas também alto risco de perda. Estude bem antes de
                investir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              {t("stocks_training")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6 Módulos</div>
            <p className="text-xs text-muted-foreground">
              Curso completo sobre ações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Duração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5h 35min</div>
            <p className="text-xs text-muted-foreground">
              Tempo total estimado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Potencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Alto</div>
            <p className="text-xs text-muted-foreground">
              Retorno historicamente superior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Volatilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Alta</div>
            <p className="text-xs text-muted-foreground">
              Oscilações significativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Modules */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Módulos do Curso</h2>

        {modules.map((module, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{module.title}</h3>
                    <Badge className={getLevelColor(module.level)}>
                      {module.level}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground mb-4">
                    {module.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {module.duration}
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Indicators Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Principais Indicadores Fundamentalistas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {indicators.map((indicator, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{indicator.name}</h4>
                  <Badge variant="outline">{indicator.goodRange}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {indicator.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investment Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Principais Estratégias de Investimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Value Investing</h4>
              <p className="text-sm text-muted-foreground">
                Busca por ações subvalorizadas pelo mercado com base em análise
                fundamentalista.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Growth Investing</h4>
              <p className="text-sm text-muted-foreground">
                Foco em empresas com alto potencial de crescimento e expansão.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Dividend Investing</h4>
              <p className="text-sm text-muted-foreground">
                Investimento em ações que pagam dividendos consistentes e
                crescentes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </TrainingPremiumGuard>
  );
}

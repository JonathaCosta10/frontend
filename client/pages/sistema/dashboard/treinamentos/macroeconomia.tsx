import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe,
  TrendingUp,
  DollarSign,
  BookOpen,
  Play,
  Clock,
  BarChart3,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import TrainingPremiumGuard from "@/components/TrainingPremiumGuard";

export default function Macroeconomia() {
  const { t } = useTranslation();

  const modules = [
    {
      title: "Introdução à Macroeconomia",
      description: "Conceitos básicos e como a economia afeta os investimentos",
      duration: "45 min",
      level: "Iniciante",
      completed: false,
    },
    {
      title: "Política Monetária",
      description: "Taxa Selic, inflação e suas implicações nos investimentos",
      duration: "60 min",
      level: "Intermediário",
      completed: false,
    },
    {
      title: "Política Fiscal",
      description: "Gastos públicos, impostos e impacto na economia",
      duration: "50 min",
      level: "Intermediário",
      completed: false,
    },
    {
      title: "Indicadores Econômicos",
      description: "PIB, inflação, emprego e outros indicadores importantes",
      duration: "55 min",
      level: "Intermediário",
      completed: false,
    },
    {
      title: "Economia Internacional",
      description: "Câmbio, balança comercial e economia global",
      duration: "65 min",
      level: "Avançado",
      completed: false,
    },
    {
      title: "Ciclos Econômicos",
      description: "Como identificar e aproveitar diferentes fases da economia",
      duration: "70 min",
      level: "Avançado",
      completed: false,
    },
  ];

  const economicIndicators = [
    {
      name: "PIB",
      description: "Produto Interno Bruto",
      impact: "Crescimento econômico geral",
      frequency: "Trimestral",
    },
    {
      name: "IPCA",
      description: "Inflação oficial",
      impact: "Poder de compra e juros",
      frequency: "Mensal",
    },
    {
      name: "Taxa Selic",
      description: "Taxa básica de juros",
      impact: "Renda fixa e crédito",
      frequency: "A cada 45 dias",
    },
    {
      name: "Taxa de Desemprego",
      description: "Percentual de desocupados",
      impact: "Consumo e crescimento",
      frequency: "Mensal",
    },
    {
      name: "Balança Comercial",
      description: "Exportações - Importações",
      impact: "Câmbio e reservas",
      frequency: "Mensal",
    },
    {
      name: "Câmbio (USD/BRL)",
      description: "Valor do dólar em reais",
      impact: "Investimentos externos",
      frequency: "Diário",
    },
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
    <TrainingPremiumGuard trainingType="macroeconomia">
      <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              {t("macroeconomics")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6 Módulos</div>
            <p className="text-xs text-muted-foreground">
              Curso completo sobre economia
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
            <div className="text-2xl font-bold">5h 45min</div>
            <p className="text-xs text-muted-foreground">
              Tempo total estimado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Escopo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Global</div>
            <p className="text-xs text-muted-foreground">
              Economia nacional e internacional
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Importância
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Alta</div>
            <p className="text-xs text-muted-foreground">
              Base para decisões de investimento
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

      {/* Economic Indicators Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Principais Indicadores Econômicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Indicador</th>
                  <th className="text-left p-3">Descrição</th>
                  <th className="text-left p-3">Impacto nos Investimentos</th>
                  <th className="text-left p-3">Frequência</th>
                </tr>
              </thead>
              <tbody>
                {economicIndicators.map((indicator, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-semibold">{indicator.name}</td>
                    <td className="p-3">{indicator.description}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {indicator.impact}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{indicator.frequency}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Economic Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Cenários Econômicos e Estratégias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600">Cenário Otimista</h4>
              <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-950">
                <ul className="space-y-2 text-sm">
                  <li>• PIB crescendo acima de 3%</li>
                  <li>• Inflação controlada (2-4%)</li>
                  <li>• Taxa Selic em queda</li>
                  <li>• Desemprego em baixa</li>
                </ul>
                <p className="text-sm font-medium mt-3 text-green-700 dark:text-green-300">
                  Estratégia: Maior exposição a ações e crescimento
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-red-600">Cenário Pessimista</h4>
              <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950">
                <ul className="space-y-2 text-sm">
                  <li>• PIB em recessão</li>
                  <li>• Inflação descontrolada</li>
                  <li>• Taxa Selic muito alta</li>
                  <li>• Alto desemprego</li>
                </ul>
                <p className="text-sm font-medium mt-3 text-red-700 dark:text-red-300">
                  Estratégia: Foco em renda fixa e proteção
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tools and Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Ferramentas Úteis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Portal do IBGE</h4>
              <p className="text-sm text-muted-foreground">
                Dados oficiais sobre PIB, inflação e indicadores econômicos
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Site do Banco Central</h4>
              <p className="text-sm text-muted-foreground">
                Informações sobre política monetária e taxa Selic
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">
                Focus - Relatório de Mercado
              </h4>
              <p className="text-sm text-muted-foreground">
                Projeções de analistas para principais indicadores
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </TrainingPremiumGuard>
  );
}

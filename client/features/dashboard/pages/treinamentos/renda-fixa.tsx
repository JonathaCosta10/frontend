import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Calculator,
  TrendingUp,
  BookOpen,
  Play,
  Clock,
} from "lucide-react";
import { useTranslation } from '../../../../contexts/TranslationContext';
import TrainingPremiumGuard from "@/core/security/guards/TrainingPremiumGuard";

export default function RendaFixa() {
  const { t } = useTranslation();

  const modules = [
    {
      title: t("fixed_income_fundamentals"),
      description: t("fixed_income_fundamentals_desc"),
      duration: "40 min",
      level: t("beginner"),
      completed: false,
    },
    {
      title: t("treasury_direct"),
      description: t("treasury_direct_desc"),
      duration: "35 min",
      level: t("beginner"),
      completed: false,
    },
    {
      title: t("cdbs_lcis_lcas"),
      description: t("cdbs_lcis_lcas_desc"),
      duration: "45 min",
      level: t("intermediate"),
      completed: false,
    },
    {
      title: t("debentures_cris"),
      description: t("debentures_cris_desc"),
      duration: "50 min",
      level: t("advanced"),
      completed: false,
    },
    {
      title: t("diversification_strategies"),
      description: t("diversification_strategies_desc"),
      duration: "30 min",
      level: t("intermediate"),
      completed: false,
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
    <TrainingPremiumGuard trainingType="renda-fixa">
      <div className="space-y-3 md:space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              {t("fixed_income_training")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Módulos</div>
            <p className="text-xs text-muted-foreground">
              Curso completo de renda fixa
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
            <div className="text-2xl font-bold">3h 20min</div>
            <p className="text-xs text-muted-foreground">
              Tempo total estimado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Alta</div>
            <p className="text-xs text-muted-foreground">
              Investimentos mais seguros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Rentabilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8-15%</div>
            <p className="text-xs text-muted-foreground">Faixa típica ao ano</p>
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

      {/* Investment Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Investimentos em Renda Fixa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Investimento</th>
                  <th className="text-left p-2">Rentabilidade</th>
                  <th className="text-left p-2">Liquidez</th>
                  <th className="text-left p-2">Risco</th>
                  <th className="text-left p-2">Imposto</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Poupança</td>
                  <td className="p-2">70% da Selic</td>
                  <td className="p-2">Diária</td>
                  <td className="p-2 text-green-600">Muito Baixo</td>
                  <td className="p-2">Isento</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Tesouro Selic</td>
                  <td className="p-2">100% da Selic</td>
                  <td className="p-2">Diária</td>
                  <td className="p-2 text-green-600">Muito Baixo</td>
                  <td className="p-2">IR regressivo</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">CDB</td>
                  <td className="p-2">85-120% CDI</td>
                  <td className="p-2">No vencimento</td>
                  <td className="p-2 text-yellow-600">Baixo</td>
                  <td className="p-2">IR regressivo</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">LCI/LCA</td>
                  <td className="p-2">80-95% CDI</td>
                  <td className="p-2">No vencimento</td>
                  <td className="p-2 text-yellow-600">Baixo</td>
                  <td className="p-2">Isento</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    </TrainingPremiumGuard>
  );
}

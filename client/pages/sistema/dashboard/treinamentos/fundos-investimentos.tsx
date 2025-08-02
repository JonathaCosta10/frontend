import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
  Play,
  Clock,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

export default function FundosInvestimentos() {
  const { t } = useTranslation();

  const modules = [
    {
      title: t("introduction_investment_funds"),
      description: t("basic_concepts_fund_types"),
      duration: "45 min",
      level: t("beginner"),
      completed: false,
    },
    {
      title: t("real_estate_investment_funds"),
      description: t("how_fiis_work_choose_best"),
      duration: "60 min",
      level: t("intermediate"),
      completed: false,
    },
    {
      title: t("stock_funds"),
      description: t("stock_fund_strategies_analysis"),
      duration: "50 min",
      level: t("intermediate"),
      completed: false,
    },
    {
      title: t("multimarket_funds"),
      description: t("diversification_multimarket_funds"),
      duration: "40 min",
      level: t("advanced"),
      completed: false,
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case t("beginner"):
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case t("intermediate"):
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case t("advanced"):
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              {t("investment_funds")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 {t("training_modules")}</div>
            <p className="text-xs text-muted-foreground">
              {t("complete_fund_content")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {t("total_duration")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3h 15min</div>
            <p className="text-xs text-muted-foreground">
              {t("estimated_completion_time")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t("progress")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              0 de 4 {t("modules_completed")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Modules */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">{t("course_modules")}</h2>

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
                    {t("start")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>{t("complementary_resources")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{t("glossary_terms")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("main_terms_fund_market")}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{t("calculators")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("tools_simulate_investments")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

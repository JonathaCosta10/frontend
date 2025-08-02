import React from "react";
import { VariacaoEntrada } from "@/services/api/budget";
import UnifiedChart from "./UnifiedChart";
import { chartTransformers, chartConfigs } from "@/hooks/useChart";

interface VariacaoEntradaChartProps {
  mes: number;
  ano: number;
}

const VariacaoEntradaChart: React.FC<VariacaoEntradaChartProps> = ({ mes, ano }) => {
  const getMockData = async (): Promise<VariacaoEntrada[]> => {
    // Simplified to show only one total value per month
    const currentYear = new Date().getFullYear();
    const monthlyData: VariacaoEntrada[] = [];

    // Generate simplified data - one total value per month
    for (let month = 1; month <= 12; month++) {
      const baseValue = 5000; // Base monthly income
      const variation = (Math.random() - 0.5) * 2000; // Random variation
      const totalValue = Math.max(0, baseValue + variation);

      monthlyData.push({
        mes: month,
        ano: currentYear,
        valor_total: totalValue
      });
    }

    return monthlyData;
  };

  return (
    <UnifiedChart
      title="Variação de Entrada Mensal"
      apiCall={getMockData}
      dependencies={[mes, ano]}
      dataTransformer={chartTransformers.variacaoMensal}
      chartConfigGenerator={() => ({
        ...chartConfigs.lineChart("hsl(var(--success))"),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: 'currentColor',
              },
            },
            tooltip: {
              callbacks: {
                label: function (context: any) {
                  const valor = context.parsed.y;
                  return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: 'currentColor',
              },
              grid: {
                color: 'hsl(var(--border))',
              }
            },
            y: {
              ticks: {
                color: 'currentColor',
                callback: function (value: any) {
                  return `R$ ${value.toLocaleString('pt-BR')}`;
                },
              },
              grid: {
                color: 'hsl(var(--border))',
              }
            }
          }
        }
      })}
      emptyStateConfig={{
        title: "Nenhuma entrada cadastrada",
        description: "Cadastre suas entradas para visualizar a variação mensal",
        actions: [
          {
            label: "Cadastrar Entrada",
            href: "/dashboard/orcamento/entradas",
            variant: "default"
          }
        ]
      }}
    />
  );
};

export default VariacaoEntradaChart;

import React from "react";
import UnifiedChart from "./UnifiedChart";
import { chartConfigs } from "@/hooks/useChart";
import { useLocale } from "@/hooks/useLocale";

interface MetaMesAMesChartProps {
  mes: number;
  ano: number;
}

interface MetaCategoria {
  categoria: string;
  valor_meta: number;
  valor_gasto: number;
  percentual_utilizado: number;
}

const MetaMesAMesChart: React.FC<MetaMesAMesChartProps> = ({ mes, ano }) => {
  const { formatCurrency } = useLocale();
  const getMockData = async (): Promise<MetaCategoria[]> => {
    // Mock data para demonstração baseado nas categorias comuns de orçamento
    return [
      {
        categoria: "Alimentação",
        valor_meta: 800,
        valor_gasto: 720,
        percentual_utilizado: 90
      },
      {
        categoria: "Transporte",
        valor_meta: 400,
        valor_gasto: 380,
        percentual_utilizado: 95
      },
      {
        categoria: "Lazer",
        valor_meta: 300,
        valor_gasto: 250,
        percentual_utilizado: 83
      },
      {
        categoria: "Saúde",
        valor_meta: 250,
        valor_gasto: 180,
        percentual_utilizado: 72
      },
      {
        categoria: "Educação",
        valor_meta: 200,
        valor_gasto: 150,
        percentual_utilizado: 75
      },
      {
        categoria: "Casa",
        valor_meta: 1200,
        valor_gasto: 1100,
        percentual_utilizado: 92
      },
      {
        categoria: "Vestuário",
        valor_meta: 150,
        valor_gasto: 120,
        percentual_utilizado: 80
      },
      {
        categoria: "Diversos",
        valor_meta: 100,
        valor_gasto: 85,
        percentual_utilizado: 85
      }
    ];
  };

  const generateChartData = (data: MetaCategoria[]) => ({
    labels: data.map(meta => meta.categoria),
    datasets: [
      {
        label: "Meta Planejada",
        data: data.map(meta => meta.valor_meta),
        backgroundColor: "hsl(220, 91%, 75%)",
        borderColor: "hsl(220, 91%, 60%)",
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: "Valor Gasto",
        data: data.map(meta => meta.valor_gasto),
        backgroundColor: "hsl(348, 86%, 75%)",
        borderColor: "hsl(348, 86%, 60%)",
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  });

  return (
    <div className="space-y-4">
      <UnifiedChart
        title="Metas vs Gastos por Categoria"
        apiCall={getMockData}
        dependencies={[mes, ano]}
        dataTransformer={(data) => data}
        chartConfigGenerator={(data) => ({
          type: 'bar' as const,
          labels: data.map(meta => meta.categoria),
          datasets: [
            {
              label: "Meta Planejada",
              data: data.map(meta => meta.valor_meta),
              backgroundColor: "hsl(220, 91%, 75%)",
              borderColor: "hsl(220, 91%, 60%)",
              borderWidth: 2,
              borderRadius: 4,
            },
            {
              label: "Valor Gasto",
              data: data.map(meta => meta.valor_gasto),
              backgroundColor: "hsl(348, 86%, 75%)",
              borderColor: "hsl(348, 86%, 60%)",
              borderWidth: 2,
              borderRadius: 4,
            },
          ],
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
                    const categoria = data[context.dataIndex] as any as MetaCategoria;
                    const percentual = categoria ? categoria.percentual_utilizado : 0;

                    if (context.datasetIndex === 0) {
                      return `Meta: ${formatCurrency(valor)}`;
                    } else {
                      return `Gasto: ${formatCurrency(valor)} (${percentual}%)`;
                    }
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
                    return formatCurrency(value);
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
          title: "Nenhuma meta cadastrada",
          description: "Cadastre suas metas para acompanhar seus gastos por categoria",
          actions: [
            {
              label: "Cadastrar Meta",
              href: "/dashboard/orcamento/metas",
              variant: "default"
            }
          ]
        }}
      />
      
      {/* Category breakdown - This would need special handling in the future */}
      {/* For now, we'll show this as a separate section that needs data loading */}
    </div>
  );
};

export default MetaMesAMesChart;

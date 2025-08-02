import React from "react";
import { budgetApi } from "@/services/api/budget";
import UnifiedChart from "./UnifiedChart";
import { chartTransformers, chartConfigs } from "@/hooks/useChart";

interface DistribuicaoGastosChartProps {
  mes: number;
  ano: number;
}

const DistribuicaoGastosChart: React.FC<DistribuicaoGastosChartProps> = ({ mes, ano }) => {
  return (
    <UnifiedChart
      title="Distribuição de Gastos"
      apiCall={() => budgetApi.getDistribuicaoGastos(mes, ano)}
      dependencies={[mes, ano]}
      dataTransformer={chartTransformers.distribuicaoGastos}
      chartConfigGenerator={(data) => ({
        ...chartConfigs.pieChart(),
        options: {
          ...chartConfigs.pieChart().options,
          plugins: {
            ...chartConfigs.pieChart().options?.plugins,
            tooltip: {
              callbacks: {
                label: function (context: any) {
                  const valor = context.parsed;
                  const dataPoint = data[context.dataIndex];
                  const percentual = dataPoint?.percentual || 0;
                  return `${context.label}: R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentual.toFixed(1)}%)`;
                },
              },
            },
          },
        }
      })}
      emptyStateConfig={{
        title: "Nenhum gasto cadastrado",
        description: "Faça o cadastro dos seus gastos para visualizar a distribuição",
        actions: [
          {
            label: "Cadastrar Custos",
            href: "/dashboard/orcamento/custos",
            variant: "default"
          },
          {
            label: "Cadastrar Dívidas",
            href: "/dashboard/orcamento/dividas",
            variant: "outline"
          }
        ]
      }}
    />
  );
};

export default DistribuicaoGastosChart;

import React from 'react';
import { investmentsApi } from '@/services/api/investments';
import UnifiedChart from './UnifiedChart';
import { chartTransformers, chartConfigs } from '@/hooks/useChart';

const GraficoAlocacaoTipo = () => {
    return (
        <UnifiedChart
            title="Alocação por Tipo"
            apiCall={() => investmentsApi.getAlocacaoTipo()}
            dataTransformer={chartTransformers.alocacaoTipo}
            chartConfigGenerator={() => ({
                ...chartConfigs.pieChart(['#2196f3', '#f37e21', '#eaf321']),
                options: {
                    ...chartConfigs.pieChart().options,
                    plugins: {
                        ...chartConfigs.pieChart().options?.plugins,
                        tooltip: {
                            callbacks: {
                                label: (context: any) => {
                                    return `${context.label}: ${context.formattedValue}%`;
                                }
                            }
                        }
                    }
                }
            })}
            emptyStateConfig={{
                title: "Nenhum investimento cadastrado",
                description: "Cadastre seus investimentos para ver a distribuição por tipo",
                actions: [
                    {
                        label: "Cadastrar Investimento",
                        href: "/dashboard/investimentos/cadastro",
                        variant: "default"
                    }
                ]
            }}
        />
    );
};

export default GraficoAlocacaoTipo;

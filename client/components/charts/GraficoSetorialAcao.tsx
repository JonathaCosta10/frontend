import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { investmentsApi, SetorInfo } from '@/services/api/investments';

interface GraficoSetorialAcaoProps {
  tipoSelecionado?: string;
}

const GraficoSetorialAcao: React.FC<GraficoSetorialAcaoProps> = ({ tipoSelecionado = 'Acoes' }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const [setores, setSetores] = useState<SetorInfo[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await investmentsApi.getSetores(tipoSelecionado);
                const setoresData = data.setores || [];
                setSetores(setoresData); // armazena os dados para os tooltips

                const labels = setoresData.map(s => s.setor_atividade);
                const valores = setoresData.map(s => s.valor_total_setor);
                const cores = setoresData.map((_, i) =>
                    `hsl(${(i * 35) % 360}, 70%, 50%)`
                );

                // Destroi o gráfico anterior, se houver
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.destroy();
                }

                if (chartRef.current) {
                    const ctx = chartRef.current.getContext('2d');
                    if (ctx) {
                        chartInstanceRef.current = new Chart(ctx, {
                            type: 'pie',
                            data: {
                                labels,
                                datasets: [{
                                    data: valores,
                                    backgroundColor: cores,
                                    borderColor: '#fff',
                                    borderWidth: 2
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                const index = context.dataIndex;
                                                const setor = setoresData[index];

                                                const linhas: string[] = [];

                                                if (setor) {
                                                    linhas.push(setor.setor_atividade);

                                                    setor.acoes.forEach(acao => {
                                                        const valorFormatado = acao.valor_total.toLocaleString('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL',
                                                            minimumFractionDigits: 2
                                                        });

                                                        const percentual = setor.percentual_do_total.toFixed(2);
                                                        linhas.push(`${acao.ticker}: ${valorFormatado} (${percentual}%)`);
                                                    });
                                                }

                                                return linhas;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar dados da API:", error);
            }
        };

        loadData();

        // Cleanup function
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [tipoSelecionado]);

    return (
        <div className="w-full h-[300px]">
            <canvas ref={chartRef} />
        </div>
    );
};

export default GraficoSetorialAcao;

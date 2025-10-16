import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
} from "chart.js";
import { EyeOff } from "lucide-react";
import { investmentsApi } from '@/services/api/investments';
import { usePrivacy } from '@/contexts/PrivacyContext';
import dayjs from "dayjs";

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

interface GraficoDividendosFIIProps {
  mes?: string;
  ano?: string;
  tipoSelecionado?: string;
}

const GraficoDividendosFII: React.FC<GraficoDividendosFIIProps> = ({
  mes = "",
  ano = "",
  tipoSelecionado = "Fundos Imobiliários"
}) => {
  const { shouldHideCharts } = usePrivacy();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const dataReferencia =
      ano && mes ? `${ano}-${mes.padStart(2, "0")}-01` : dayjs().format("YYYY-MM-01");

    const fetchDividendos = async () => {
      try {
        setLoading(true);
        
        const data = await investmentsApi.getDividendosFII(tipoSelecionado, dataReferencia);

        // Ordenar valores_totais_por_mes por data crescente
        const valoresOrdenados = [...data.valores_totais_por_mes].sort((a, b) =>
          new Date(a.data_referencia).getTime() - new Date(b.data_referencia).getTime()
        );

        // Criar labels do mês abreviado, ex: Jan, Fev, Mar ...
        const labels = valoresOrdenados.map(item => {
          const dateObj = new Date(item.data_referencia);
          return dateObj.toLocaleString("default", { month: "short" }).replace('.', '');
        });

        // Dataset total
        const totalValores = valoresOrdenados.map(item => item.valor_total);

        const datasets = [
          {
            label: "Total",
            data: totalValores,
            backgroundColor: "hsl(var(--primary))",
          },
        ];

        // Mapear os FIIs ordenando pelo valor_hoje do mês selecionado (desc)
        const mesSelecionadoData = dataReferencia;

        const resumoOrdenado = [...data.resumo].sort((a, b) => {
          const aValor = a.dados.find(d => d.data_referencia === mesSelecionadoData)?.valor_hoje || 0;
          const bValor = b.dados.find(d => d.data_referencia === mesSelecionadoData)?.valor_hoje || 0;
          return bValor - aValor;
        });

        const colors = [
          "#3f51b5", "#f50057", "#009688", "#ff9800",
          "#9c27b0", "#2196f3", "#ff5722", "#4caf50"
        ];

        resumoOrdenado.forEach((item, idx) => {
          const mapDataValorHoje: Record<string, number> = {};
          item.dados.forEach(d => {
            mapDataValorHoje[d.data_referencia] = d.valor_hoje;
          });

          // Alinhar dados com labels (datas) ordenadas (valoresOrdenados)
          const dataValores = valoresOrdenados.map(v => mapDataValorHoje[v.data_referencia] || 0);

          datasets.push({
            label: item.ticker,
            data: dataValores,
            backgroundColor: colors[idx % colors.length],
          });
        });

        setChartData({
          labels,
          datasets,
        });

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados do gráfico:", error);
        setLoading(false);
      }
    };

    fetchDividendos();
  }, [mes, ano, tipoSelecionado]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Carregando dividendos...</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="text-center">
          <p className="text-muted-foreground">Nenhum dado para mostrar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      {shouldHideCharts() ? (
        <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center space-y-2">
            <EyeOff className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-gray-500 text-sm">Gráfico oculto</p>
          </div>
        </div>
      ) : (
        <Bar
          data={chartData}
          options={{
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
                  label: function (context) {
                    const label = context.dataset.label || "";
                    const value = context.parsed.y || 0;
                    return `${label}: ${shouldHideCharts() ? 'R$ ****' : value.toFixed(2)}`;
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
                    return shouldHideCharts() ? '****' : value;
                  },
                },
                grid: {
                  color: 'hsl(var(--border))',
                }
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default GraficoDividendosFII;

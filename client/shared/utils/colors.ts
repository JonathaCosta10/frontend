/**
 * Paleta de cores consistente para toda a aplicação
 * Estas cores são usadas para gráficos, elementos visuais e componentes UI
 */

// Paleta de cores principal
export const primaryColors = {
  primary: "#3B82F6", // Azul principal da marca
  secondary: "#10B981", // Verde para indicadores positivos
  accent: "#8B5CF6", // Roxo para elementos de destaque
  warning: "#F59E0B", // Amarelo para alertas
  danger: "#EF4444", // Vermelho para erros e indicadores negativos
  dark: "#1E293B", // Azul escuro para fundos e textos
  light: "#F8FAFC", // Cinza claro para fundos
  muted: "#94A3B8", // Cinza para textos secundários
};

// Tons da cor principal (Azul)
export const blueShades = {
  blue50: "#EFF6FF",
  blue100: "#DBEAFE",
  blue200: "#BFDBFE",
  blue300: "#93C5FD",
  blue400: "#60A5FA",
  blue500: "#3B82F6", // Corresponde ao primary
  blue600: "#2563EB",
  blue700: "#1D4ED8",
  blue800: "#1E40AF",
  blue900: "#1E3A8A",
};

// Tons da cor secundária (Verde)
export const greenShades = {
  green50: "#ECFDF5",
  green100: "#D1FAE5",
  green200: "#A7F3D0",
  green300: "#6EE7B7",
  green400: "#34D399",
  green500: "#10B981", // Corresponde ao secondary
  green600: "#059669",
  green700: "#047857",
  green800: "#065F46",
  green900: "#064E3B",
};

// Tons de cinza
export const grayShades = {
  gray50: "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray300: "#CBD5E1",
  gray400: "#94A3B8",
  gray500: "#64748B",
  gray600: "#475569",
  gray700: "#334155",
  gray800: "#1E293B",
  gray900: "#0F172A",
};

// Cores para gráficos de séries temporais (12 cores para meses ou categorias)
export const timeSeriesColors = [
  "#3B82F6", // Azul
  "#10B981", // Verde
  "#F59E0B", // Amarelo
  "#EF4444", // Vermelho
  "#8B5CF6", // Roxo
  "#EC4899", // Rosa
  "#06B6D4", // Ciano
  "#F97316", // Laranja
  "#14B8A6", // Turquesa
  "#6366F1", // Indigo
  "#64748B", // Cinza Azulado
  "#0EA5E9", // Azul claro
];

// Cores para gráficos de categorias/tipos (para uso em gráficos de pizza/donut)
export const categoryColors = {
  // Custos
  moradia: "#FF8A80",
  alimentacao: "#82B1FF",
  transporte: "#B9F6CA",
  lazer: "#FFFF8D",
  saude: "#84FFFF",
  educacao: "#B388FF",
  vestuario: "#FFD180",
  assinaturas: "#EA80FC",
  impostos: "#A7FFEB",
  outros: "#CCCCCC",

  // Dívidas
  cartao: "#FF6384",
  emprestimo: "#36A2EB",
  financiamento: "#FFCE56",
  pessoal: "#4BC0C0",
  outro: "#9966FF",

  // Entradas
  salario: "#66BB6A",
  freelance: "#26C6DA",
  rendimentos: "#FFA726",
  aluguel: "#7E57C2",
  dividendos: "#D4E157",
  outros_entrada: "#CCCCCC",

  // Investimentos
  acoes: "#EF5350",
  fiis: "#42A5F5",
  fundos: "#FFEE58",
  tesouro: "#66BB6A",
  poupanca: "#EC407A",
  cdb: "#AB47BC",
  debentures: "#8D6E63",
  cripto: "#FFA726",
  previdencia: "#78909C",
  exterior: "#29B6F6",
  outros_investimento: "#CCCCCC",
};

// Cores para gradientes
export const gradients = {
  blueGradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
  greenGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  purpleGradient: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
  orangeGradient: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
  redGradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
};

// Configuração padrão para gráficos
export const chartConfig = {
  // Opções padrão para tornar os gráficos consistentes
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        padding: 12,
        cornerRadius: 4,
        boxPadding: 4,
      },
    },
  },
  
  // Configuração compacta para economizar espaço
  compactOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 11,
        },
        padding: 8,
        cornerRadius: 4,
      },
    },
  }
};

// Função para obter cor por índice (útil para arrays de dados)
export const getColorByIndex = (index: number): string => {
  return timeSeriesColors[index % timeSeriesColors.length];
};

// Função para obter cores para gráficos com base no tipo
export const getChartColors = (
  count: number, 
  colorType: 'blue' | 'green' | 'mixed' = 'mixed'
): string[] => {
  if (colorType === 'blue') {
    // Gera tons de azul
    return Array.from({ length: count }, (_, i) => {
      const intensity = Math.floor(900 - (i / (count - 1 || 1)) * 800);
      const shade = Math.floor(intensity / 100) * 100;
      // @ts-ignore - Ignorando erro de tipagem para acesso dinâmico
      return blueShades[`blue${shade}`] || blueShades.blue500;
    });
  } 
  else if (colorType === 'green') {
    // Gera tons de verde
    return Array.from({ length: count }, (_, i) => {
      const intensity = Math.floor(900 - (i / (count - 1 || 1)) * 800);
      const shade = Math.floor(intensity / 100) * 100;
      // @ts-ignore - Ignorando erro de tipagem para acesso dinâmico
      return greenShades[`green${shade}`] || greenShades.green500;
    });
  }
  
  // Retorna cores misturadas do timeSeriesColors
  return Array.from({ length: count }, (_, i) => timeSeriesColors[i % timeSeriesColors.length]);
};

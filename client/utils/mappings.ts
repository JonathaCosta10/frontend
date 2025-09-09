/**
 * Central dictionary of field mappings and display values used across the application
 * Consolidating these mappings here makes it easier to maintain consistent terminology
 */

// Tipo de Dívida - Dicionário para página de dívidas
export const debtTypeMap: Record<string, string> = {
  "cartao": "Cartão de Crédito",
  "emprestimo": "Empréstimo",
  "financiamento": "Financiamento",
  "pessoal": "Dívida Pessoal",
  "outro": "Outro",
  // Novos tipos podem ser adicionados aqui
};

// Mapeamento de tipos de investimentos
// Removido e consolidado com a definição completa abaixo

// Tipos de Custos - Dicionário para página de custos
export const costTypeMap: Record<string, string> = {
  "moradia": "Moradia",
  "alimentacao": "Alimentação",
  "transporte": "Transporte",
  "lazer": "Lazer",
  "saude": "Saúde",
  "educacao": "Educação",
  "vestuario": "Vestuário",
  "assinaturas": "Assinaturas",
  "impostos": "Impostos",
  "outros": "Outros",
  // Novos tipos podem ser adicionados aqui
};

// Tipos de Entrada - Dicionário para página de entradas
export const incomeTypeMap: Record<string, string> = {
  "salario": "Salário",
  "freelance": "Freelance",
  "rendimentos": "Rendimentos",
  "aluguel": "Aluguel",
  "dividendos": "Dividendos",
  "outros": "Outros",
  // Novos tipos podem ser adicionados aqui
};

// Tipos de Investimentos - Dicionário para página de investimentos
export const investmentTypeMap: Record<string, string> = {
  "acoes": "Ações",
  "fiis": "Fundos Imobiliários",
  "fundos": "Fundos de Investimento",
  "tesouro": "Tesouro Direto",
  "poupanca": "Poupança",
  "cdb": "CDB/LC",
  "debentures": "Debêntures",
  "cripto": "Criptomoedas",
  "previdencia": "Previdência Privada",
  "exterior": "Investimentos Exterior",
  "outros": "Outros",
  // Novos tipos podem ser adicionados aqui
};

// Classes de Ativos - Dicionário para página de investimentos (alocação)
export const assetClassMap: Record<string, string> = {
  "renda fixa": "Renda Fixa",
  "renda variável": "Renda Variável",
  "fundos imobiliários": "Fundos Imobiliários",
  "criptomoedas": "Criptomoedas",
  "bdrs": "BDRs",
  "coes": "COEs",
  "ouro": "Ouro",
  "tesouro direto": "Tesouro Direto",
  "etfs": "ETFs",
  "outros": "Outros",
  // Novos tipos podem ser adicionados aqui
};

// Tipos de Ativos - Dicionário detalhado para página de investimentos
export const assetTypeMap: Record<string, string> = {
  // Variações de caixa para compatibilidade
  "acao": "Ação",
  "ACAO": "Ação",
  "Acoes": "Ação",
  "acoes": "Ações",
  // Fundos imobiliários
  "fii": "Fundo Imobiliário",
  "FII": "Fundos Imobiliários",
  "Fundos Imobiliários": "Fundos Imobiliários",
  // Renda fixa
  "RENDA_FIXA": "Renda Fixa",
  "Renda Fixa": "Renda Fixa",
  "titulo_tesouro": "Título do Tesouro",
  "TESOURO": "Tesouro Direto",
  "cdb": "CDB",
  "lci": "LCI",
  "lca": "LCA",
  "debenture": "Debênture",
  // Outros tipos de ativos
  "ETF": "ETF",
  "etf": "ETF",
  "BDR": "BDR",
  "bdr": "BDR",
  "fundo": "Fundo de Investimento",
  "CRYPTO": "Criptomoeda",
  "cripto": "Criptomoeda",
  "OUTROS": "Outros",
  "OTHER": "Outros",
  "poupanca": "Poupança",
  "outros": "Outros",
  "OTHER": "Outros",
  // Novos tipos podem ser adicionados aqui
};

// Status de Dívida - Dicionário para página de dívidas
export const debtStatusMap: Record<string, string> = {
  "aberto": "Em Aberto",
  "atrasado": "Atrasado",
  "quitado": "Quitado",
  "renegociado": "Renegociado",
  "parcelado": "Parcelado",
  // Novos status podem ser adicionados aqui
};

// Cores para gráficos de categorias - Usado em várias páginas
export const categoryColorMap: Record<string, string> = {
  // Cores para tipos de dívidas
  "cartao": "#FF6384",
  "emprestimo": "#36A2EB",
  "financiamento": "#FFCE56",
  "pessoal": "#4BC0C0",
  "outro": "#9966FF",
  
  // Cores para tipos de custos
  "moradia": "#FF8A80",
  "alimentacao": "#82B1FF",
  "transporte": "#B9F6CA",
  "lazer": "#FFFF8D",
  "saude": "#84FFFF",
  "educacao": "#B388FF",
  "vestuario": "#FFD180",
  "assinaturas": "#EA80FC",
  "impostos": "#A7FFEB",
  "outros": "#CCCCCC",
  
  // Cores para tipos de entradas
  "salario": "#66BB6A",
  "freelance": "#26C6DA",
  "rendimentos": "#FFA726",
  "aluguel": "#7E57C2",
  "dividendos": "#D4E157",
  "outros_entrada": "#CCCCCC",
  
  // Cores para tipos de investimentos
  "acoes": "#EF5350",
  "fiis": "#42A5F5",
  "fundos": "#FFEE58",
  "tesouro": "#66BB6A",
  "poupanca": "#EC407A",
  "cdb": "#AB47BC",
  "debentures": "#8D6E63",
  "cripto": "#FFA726",
  "previdencia": "#78909C",
  "exterior": "#29B6F6",
  "outros_investimento": "#CCCCCC",
};

// Formatos de moeda por idioma
export const currencyFormatMap: Record<string, { locale: string, currency: string }> = {
  "pt-BR": { locale: "pt-BR", currency: "BRL" },
  "en-US": { locale: "en-US", currency: "USD" },
  "es-ES": { locale: "es-ES", currency: "EUR" },
};

// Meses do ano em diferentes idiomas
export const monthsMap: Record<string, string[]> = {
  "pt-BR": [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ],
  "en-US": [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ],
  "es-ES": [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
};

// Formatos de data por idioma
export const dateFormatMap: Record<string, string> = {
  "pt-BR": "dd/MM/yyyy",
  "en-US": "MM/dd/yyyy",
  "es-ES": "dd/MM/yyyy"
};

// Função helper para formatar valores de moeda
export const formatCurrency = (
  value: number, 
  locale: string = "pt-BR"
): string => {
  const formatConfig = currencyFormatMap[locale] || currencyFormatMap["pt-BR"];
  
  return new Intl.NumberFormat(formatConfig.locale, {
    style: "currency",
    currency: formatConfig.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Função helper para formatar percentuais
export const formatPercentage = (
  value: number, 
  locale: string = "pt-BR",
  digits: number = 2
): string => {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value / 100);
};

// Função helper para obter cor de uma categoria
export const getCategoryColor = (
  category: string, 
  defaultColor: string = "#CCCCCC"
): string => {
  return categoryColorMap[category] || defaultColor;
};

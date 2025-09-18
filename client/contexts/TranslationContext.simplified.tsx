import React, { createContext, useContext, useState, useEffect } from "react";

interface TranslationContextType {
  language: string;
  currency: string;
  setLanguage: (lang: string) => void;
  setCurrency: (curr: string) => void;
  t: (key: string, variables?: Record<string, any>) => string;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  formatDate: (date: Date | string) => string;
  getCurrencySymbol: () => string;
  getAvailableLanguages: () => Array<{
    code: string;
    name: string;
    flag: string;
  }>;
  getAvailableCurrencies: () => Array<{
    code: string;
    name: string;
    symbol: string;
  }>;
}

const translations = {
  "pt-BR": {
    // A
    about_assessment: "Sobre esta avaliação:",
    about_me: "Sobre mim",
    accept_marketing_emails: "Marque se quiser receber e-mails informativos",
    achievements: "Conquistas",
    actions: "Ações",
    active: "Ativo",
    active_alerts: "Alertas ativos",
    active_community: "Comunidade Ativa",
    active_community_description:
      "Faça parte de uma comunidade de investidores que compartilham conhecimento",
    active_debts: "dívidas ativas",
    active_filter: "Filtro Ativo",
    active_goals: "Metas Ativas",
    active_status: "Ativo",
    active_users: "Usuários Ativos",
    add: "Adicionar",
    add_asset: "Adicionar Ativo",
    add_asset_to_wishlist: "Adicionar Ativo à Lista de Desejos",
    add_card: "Adicionar Cartão",
    add_card_button: "Adicionar Cartão",
    add_cryptocurrency: "Adicionar Criptomoeda",
    add_debts: "Adicionar Dívidas",
    add_expenses: "Adicionar Despesas",
    add_goals: "Adicionar Metas", 
    add_income: "Adicionar Entradas",
    add_to_current: "Adicionar ao Atual",
    add_value: "Adicionar Valor",
    add_extra_security_layer:
      "Adicione uma camada extra de segurança à sua conta",
    add_extra_security_layer_subtitle:
      "Adicione uma camada extra de segurança à sua conta",
    add_investment: "Adicionar Investimento",
    add_new_card: "Adicionar Novo Cartão",
    add_new_investment: "Adicionar Novo Investimento",
    added: "Adicionado",
    added_date: "Adicionado",
    adding: "Adicionando...",
    adjust_search_filters: "Tente ajustar os filtros de busca",
    advanced: "Avançado",
    advanced_charts: "Gráficos Avançados",
    advanced_charts_desc:
      "Visualize seus dados com gráficos interativos e relatórios personalizados.",
    advanced_charts_reports: "Gráficos avançados e relatórios",
    advanced_technical_analysis: "Análise técnica avançada",
    advanced_tools_login_required:
      "Para acessar as ferramentas avançadas de análise de mercado,",
    aggressive: "Agressivo",
    aggressive_allocation: "Renda Fixa: 10-30%, Renda Variável: 70-90%",
    aggressive_description:
      "Você aceita altos riscos em busca de retornos máximos e tem experiência com investimentos complexos.",
    aggressive_profile: "Agressivo",
    alert: "Alerta",
    all: "Todos",
    all_categories: "Todas as Categorias",
    all_sectors: "Todos",
    allocation: "Alocação",
    allocation_by_type: "Alocação por Tipo",
    already_client_or_want: "Já é nosso cliente ou quer ser?",
    already_have_account: "Já tem uma conta?",
    amount: "Valor",
    analyze: "Analisar",
    analyze_ticker: "Analisar ticker",
    analyzing: "Analisando...",
    and: "e",
    annual: "Anual",
    annual_interest: "Juros Anuais",
    annual_interest_rate: "Taxa de juros anual",
    annual_premium: "Premium Anual",
    annual_rate: "Taxa Anual (%)",
    annual_savings: "Economia anual",
    answer_questions_to_understand:
      "Responda algumas perguntas para entendermos melhor seu perfil",
    api_main: "API Principal",
    appearance: "Aparência",
    appearance_regionalization: "Aparência e Regionalização",
    apply: "Aplicar",
    appreciated: "Valorizadas",
    april: "Abril",
    are_you_sure_cancel: "Tem certeza que deseja cancelar?",
    ask_continue: "Deseja continuar?",
    asset: "Ativo",
    asset_code: "Código do Ativo",
    asset_code_placeholder: "Ex: PETR4, VALE3, HGLG11",
    asset_name: "Nome do Ativo",
    asset_name_placeholder: "Nome completo do ativo",
    asset_ranking: "Ranking de Ativos",
    assets: "Ativos",
    assets_in_list: "Ativos na lista",
    assets_vs_benchmarks_profitability: "Ativos vs Benchmarks de rentabilidade",
    at_maturity: "No vencimento",
    attachments_optional: "Anexos (opcional)",
    attention: "Atenção",
    attention_high_risk_investment: "Atenção: Investimento de Alto Risco",
    attention_needed: "Atenção Necessária",
    attention_negative_balance: "Atenção: Saldo Negativo",
    attention_warning: "Atenção",
    august: "Agosto",
    auth_context_loading: "Carregando contexto de autenticação...",
    authentication_failed: "Autenticação Falhou",
    authentication_needed: "Autenticação necessária",
    authentication_required: "Autenticação obrigatória",
    authentication_required_debt: "Autenticação obrigatória para dívidas",
    auto_renewal: "Renovação automática",
    auto_renewal_description: "Renova automaticamente sua assinatura",
    auto_renewal_disabled: "Renovação automática desativada",
    auto_renewal_disabled_desc: "Você receberá lembretes antes do vencimento",
    auto_renewal_enabled: "Renovação automática ativada",
    auto_renewal_enabled_desc: "Sua assinatura será renovada automaticamente",
    automatic_backup: "Backup automático",
    automatic_budget_renewal: "Renovação automática do orçamento",
    automatic_insights: "Insights Automáticos",
    automatically_adds_fixed_monthly_income:
      "Adiciona automaticamente renda fixa mensal",
    automatically_backup_data: "Faz backup automático dos dados",
    automatically_generates_monthly_reports:
      "Gera automaticamente relatórios mensais",
    automatically_renews_budget_categories:
      "Renova automaticamente as categorias do orçamento",
    automatically_renews_premium: "Renova automaticamente o premium",
    authy: "Authy",
    available_24_7: "24/7",
    average_discount: "Desconto Médio",
    average_per_source: "Média por Fonte",
    average_price: "Preço Médio",
    average_purchase_price: "Preço Médio de Compra",
    budget_domestic_description: "Gastos com habitação, água, luz, gás e telefone",
    register_new_entry: "Cadastrar Nova Entrada",
    repeat_last_entry_value: "Repetir Valor da Última Entrada",
    remaining_installments_placeholder: "Ex: 12",
    distribution_by_category: "Distribuição por Categoria",

    // B
    b3_integration: "Integração Portal Investidor",
    b3_integration_service: "Integração Portal Investidor",
    authorize_b3_data_integration: "Autorizar integração com Portal Investidor",
    allows_access_b3_data: "Permite acesso aos dados do Portal Investidor",
    back: "Voltar",
    back_button: "Voltar",
    back_to_dashboard: "Voltar ao Dashboard",
    back_to_login: "Voltar ao Login",
    back_to_market: "Voltar ao Mercado",
    back_to_profile: "Voltar ao Perfil",
    back_to_settings: "Voltar às Configurações",
    backup_codes_date: "Data:",
    backup_codes_description:
      "Guarde estes códigos de backup em local seguro. Você pode usá-los para acessar sua conta se perder acesso ao seu aplicativo autenticador:",
    backup_codes_important_note: "Importante:",
    backup_codes_important_note_file: "⚠️ IMPORTANTE:",
    backup_codes_keep_safe: "- Guarde estes códigos em local seguro",
    backup_codes_organizesee: "Códigos de Backup - Organizesee",
    backup_codes_single_use:
      "Cada código pode ser usado apenas uma vez. Guarde-os em local seguro e não compartilhe com ninguém.",
    backup_codes_single_use_note: "- Cada código pode ser usado apenas uma vez",
    backup_codes_use_if_lost:
      "- Use apenas se não conseguir acessar seu aplicativo autenticador",
    backup_codes_user: "Usuário:",
    balance: "Saldo",
    banking: "Bancos",
    basic_dashboard: "Dashboard básico",
    bdr: "BDR",
    become_premium: "Seja Premium",
    become_premium_upgrade: "Vire Premium",
    beginner: "Iniciante",
    best_cost_benefit: "Melhor Custo-Benefício",
    best_performance: "Melhor Performance",
    best_risk_return: "Melhor risco-retorno",
    beta: "Beta",
    biggest: "Maiores",
    biggest_drop: "Maior Queda",
    billing_date: "Data de cobrança:",
    billing_history: "Histórico de Cobrança",
    billing_history_tab: "Histórico",
    billing_information: "Informações de Cobrança",
    billing_payment: "Cobrança e Pagamento",
    birth_date: "Data de Nascimento",
    bond: "Renda Fixa",
    bonds: "Títulos",
    bonus: "Bônus",
    broker: "Corretora",
    broker_placeholder: "Ex: XP, Rico, Clear",
    budget: "Orçamento",
    budget_education: "Educação",
    budget_flag_description: "Descrição da flag de orçamento",
    budget_leisure: "Lazer",
    budget_management: "Gestão de Orçamento",
    budget_nav_debts: "Dívidas",
    budget_nav_expenses: "Custos",
    budget_nav_goals: "Metas",
    budget_nav_income: "Entradas",
    budget_nav_overview: "Visão Geral",
    budget_overview: "Visão Geral do Orçamento",
    budget_setup_instruction: "Para visualizar seus dados financeiros, você precisa configurar as informações do seu orçamento. Comece adicionando suas entradas, custos, dívidas e metas financeiras.",
    budget_setup_tip: "Dica: Após configurar seus dados de orçamento, você terá acesso completo às análises e relatórios financeiros.",
    business_hours: "Seg-Sex: 9h-18h",
    buy_vs_rent_comparison: "Comparação: Comprar vs Alugar",
    buying_property: "Comprando (Imóvel)",
    by_category: "Por Categoria",

    // Continue com todas as traduções em português...
    // (todas as demais keys mantendo apenas o português)
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    warning: "Aviso",
    info: "Informação",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Salvar",
    delete: "Excluir",
    edit: "Editar",
    close: "Fechar",
    
    // Mantenho todas as outras keys como placeholder por agora
    // Pode-se expandir conforme necessário
  }
};

const currencies = {
  "pt-BR": "BRL",
  "en-US": "USD",
  "es-ES": "EUR",
};

const defaultLanguage = "pt-BR";
const defaultCurrency = "BRL";

const TranslationContext = createContext<TranslationContextType>({
  language: defaultLanguage,
  currency: defaultCurrency,
  setLanguage: () => {},
  setCurrency: () => {},
  t: (key: string) => key,
  formatCurrency: (value: number) => value.toString(),
  formatNumber: (value: number) => value.toString(),
  formatDate: (date: Date | string) => date.toString(),
  getCurrencySymbol: () => "R$",
  getAvailableLanguages: () => [],
  getAvailableCurrencies: () => [],
});

const defaultContextValue: TranslationContextType = {
  language: defaultLanguage,
  currency: defaultCurrency,
  setLanguage: () => {},
  setCurrency: () => {},
  t: (key: string) => {
    console.warn(`Translation key not found: ${key}`);
    return key;
  },
  formatCurrency: (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  },
  formatNumber: (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  },
  formatDate: (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("pt-BR").format(dateObj);
  },
  getCurrencySymbol: () => "R$",
  getAvailableLanguages: () => [
    { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" }
  ],
  getAvailableCurrencies: () => [
    { code: "BRL", name: "Real Brasileiro", symbol: "R$" }
  ],
};

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState(defaultLanguage);
  const [currency, setCurrencyState] = useState(defaultCurrency);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    const savedCurrency = localStorage.getItem("currency");

    if (savedLanguage && savedLanguage === "pt-BR") {
      setLanguageState(savedLanguage);
    }

    if (savedCurrency && savedCurrency === "BRL") {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setLanguage = (lang: string) => {
    if (lang === "pt-BR") {
      setLanguageState(lang);
      localStorage.setItem("language", lang);
    }
  };

  const setCurrency = (curr: string) => {
    if (curr === "BRL") {
      setCurrencyState(curr);
      localStorage.setItem("currency", curr);
    }
  };

  const t = (key: string, variables?: Record<string, any>) => {
    const translation = translations[language as keyof typeof translations]?.[key] || key;

    if (variables) {
      return Object.keys(variables).reduce((str, variable) => {
        return str.replace(
          new RegExp(`{${variable}}`, "g"),
          variables[variable].toString(),
        );
      }, translation);
    }

    return translation;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language, {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat(language).format(value);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(language).format(dateObj);
  };

  const getCurrencySymbol = () => {
    return currency === "BRL" ? "R$" : "R$";
  };

  const getAvailableLanguages = () => [
    { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" }
  ];

  const getAvailableCurrencies = () => [
    { code: "BRL", name: "Real Brasileiro", symbol: "R$" }
  ];

  const value: TranslationContextType = {
    language,
    currency,
    setLanguage,
    setCurrency,
    t,
    formatCurrency,
    formatNumber,
    formatDate,
    getCurrencySymbol,
    getAvailableLanguages,
    getAvailableCurrencies,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(TranslationContext);

  if (!context) {
    console.warn(
      "useTranslation: Using default context. Make sure TranslationProvider is wrapping your app.",
    );
    return defaultContextValue;
  }

  return context;
};

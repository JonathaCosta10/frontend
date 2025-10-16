# Sistema de Tutoriais do Organizesee

## Visão Geral

O sistema de tutoriais foi projetado para guiar os usuários através da interface do Organizesee, orientando-os em diferentes seções da plataforma. Os tutoriais são segmentados por área funcional e são exibidos conforme as necessidades do usuário.

## Tipos de Tutoriais

1. **Geral (Visão Geral e Barra Lateral)** - `general`
   - Apresentação inicial da plataforma
   - Explicação da navegação pela barra lateral
   - Orienta o usuário para completar seu perfil

2. **Resumo Diário** - `dailyInfo`
   - Explicação dos indicadores financeiros principais
   - Como interpretar o dashboard principal
   - Acompanhamento de metas

3. **Gestão de Orçamento** - `budget`
   - Como cadastrar receitas
   - Organização de gastos por categoria
   - Configuração de metas financeiras

4. **Renda Variável (Investimentos)** - `variableIncome`
   - Como cadastrar o portfólio de investimentos
   - Análise de distribuição por setores
   - Estratégias de alocação

## Comportamento do Sistema

### Regras de Exibição

1. **Primeira Visita:**
   - Ao acessar o sistema pela primeira vez, o tutorial geral é mostrado
   - Após completar o tutorial geral, o usuário é direcionado para completar seu perfil

2. **Página de Orçamento:**
   - Quando o usuário acessa `/dashboard/orcamento`
   - O sistema verifica a API `/api/distribuicao_gastos` para determinar se o usuário tem dados de orçamento
   - Se `hist_data` mostrar que não há dados (`replicar_entradas: false, replicar_gastos: false, replicar_dividas: false, ultimo_registro_mes: null, ultimo_registro_ano: null`), o tutorial de orçamento é exibido
   - Se o usuário ainda não completou o tutorial geral, este é exibido primeiro

3. **Páginas Específicas:**
   - Resumo Diário (`/dashboard/info-diaria`): Tutorial específico é mostrado na primeira visita
   - Investimentos (`/dashboard/investimentos`): Tutorial específico é mostrado na primeira visita

### Transições entre Tutoriais

- Ao completar o tutorial geral na página de orçamento com dados vazios, o tutorial de orçamento é iniciado automaticamente
- Em outras páginas, ao completar o tutorial geral, o tutorial específico da página é exibido se disponível

## Implementação Técnica

O sistema de tutoriais é implementado através de dois hooks principais:

1. **useOnboarding.ts**
   - Gerencia o estado de conclusão dos tutoriais
   - Armazena no localStorage quais tutoriais foram completados

2. **useTutorialManager.ts**
   - Determina qual tutorial exibir com base no pathname e estado da API
   - Gerencia transições entre tutoriais
   - Detecta quando um tutorial deve ser forçado (ex: dados de orçamento vazios)

O componente `Onboarding.tsx` renderiza a interface do tutorial, incluindo os passos específicos para cada tipo de tutorial.

## Cenários Específicos

### Orçamento Vazio

Quando a API de distribuição de gastos retorna:
```json
{
  "hist_data": {
    "replicar_entradas": false,
    "replicar_gastos": false,
    "replicar_dividas": false,
    "ultimo_registro_mes": null,
    "ultimo_registro_ano": null
  }
}
```

O sistema iniciará obrigatoriamente o tutorial de orçamento, começando pelo tutorial geral (barra lateral) caso ainda não tenha sido concluído.

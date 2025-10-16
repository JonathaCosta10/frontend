# Correção: Página de Investimentos com Dados Vazios

## Problema

Quando não há registros de investimentos cadastrados, a página `/dashboard/investimentos` estava quebrando, em vez de mostrar uma mensagem orientando o usuário a cadastrar seus investimentos.

## Solução

Foi implementada uma solução similar à da página `/dashboard/orcamento`, que mostra uma orientação ao usuário quando não há dados cadastrados.

### Mudanças realizadas:

1. **Criação do componente `InvestmentsNoDataGuidance`**:
   - Componente criado no arquivo `client/components/NewUserGuidance.tsx`
   - Fornece instruções específicas para usuários sem investimentos cadastrados
   - Inclui links diretos para as principais ações (cadastro de investimentos, patrimônio, comparativos e ranking)

2. **Verificação de dados vazios na página de investimentos**:
   - Adicionada lógica para detectar se há investimentos cadastrados
   - Mostra o componente `InvestmentsNoDataGuidance` quando não há dados
   - Exibe o dashboard normal quando há dados disponíveis

3. **Melhoria no tratamento de erros**:
   - Implementado tratamento de erros mais robusto para evitar quebras na página
   - Separação das chamadas de API para evitar que um erro em uma chamada impeça o carregamento completo
   - Adicionados logs detalhados para facilitar o diagnóstico de problemas

### Como testar:

1. Acesse a página `/dashboard/investimentos` sem nenhum investimento cadastrado
   - Deve ser exibida a orientação para cadastrar novos investimentos, sem quebras na página

2. Cadastre alguns investimentos e retorne à página
   - O dashboard completo deve ser exibido com os dados dos investimentos

3. Force erros em chamadas de API (ex: desconectar a internet)
   - A página deve mostrar graciosamente a orientação em vez de quebrar

## Benefícios

- **Melhoria na experiência do usuário**: Em vez de uma página quebrada, os usuários recebem orientações claras
- **Redução de erros**: Tratamento adequado de casos onde não há dados disponíveis
- **Consistência visual**: Mantém o mesmo padrão da página de orçamento para um fluxo consistente na aplicação

## Implementação técnica

A verificação principal é feita logo após o carregamento dos dados:

```tsx
// Verificar se há investimentos cadastrados
const temInvestimentos = !loading && investimentos && investimentos.length > 0;
const temAlocacaoData = !loading && alocacaoData && alocacaoData.total_carteira > 0;

// Se não houver investimentos cadastrados, mostrar orientação
if (!temInvestimentos && !temAlocacaoData) {
  return <InvestmentsNoDataGuidance />;
}
```

O componente `InvestmentsNoDataGuidance` fornece orientações específicas sobre como começar a utilizar o módulo de investimentos, com links diretos para as principais funcionalidades.

# Correção do Loop Infinito de Renderização na Página de Orçamento

## Problema

A página de orçamento estava entrando em um ciclo infinito de renderizações e chamadas de API, gerando logs repetitivos no console e potencialmente afetando a performance da aplicação. Os logs mostravam chamadas contínuas às mesmas funções de verificação do botão de replicação.

## Análise

Identificamos dois problemas principais:

1. **Ciclo de dependência circular**: 
   - A função `shouldShowReplicateButton` no hook `useTutorialManager` atualiza o estado `buttonStateCache` a cada chamada
   - Essa atualização de estado provocava uma nova renderização
   - Na nova renderização, o componente chamava novamente a função `shouldShowReplicateButton`
   - Isso criava um loop infinito de renderizações

2. **Gerenciamento ineficiente do estado**:
   - O componente `BudgetLayout` estava calculando o estado do botão diretamente no corpo do componente
   - Cada cálculo iniciava um novo ciclo de renderização
   - O uso de `localStorage` dentro do cálculo também contribuía para a instabilidade

## Solução Implementada

1. **Melhoria na gestão de estado no BudgetLayout**:
   - Adicionamos dois estados locais controlados no componente: `shouldShowButton` e `buttonEnabled`
   - Movemos a lógica de verificação para dentro de um `useEffect` bem controlado
   - Implementamos uma função memorizada `checkShouldShowButton` que é executada uma única vez quando necessário
   - Adicionamos tratamento de erros para evitar loops causados por exceções

2. **Isolamento do cálculo**:
   - Limitamos a dependência do `useEffect` a apenas dados que realmente precisam disparar recálculos
   - Usamos `// eslint-disable-next-line` onde apropriado para evitar dependências desnecessárias
   - Adicionamos logs estratégicos para monitorar o ciclo de vida do componente

3. **Feedback visual aprimorado**:
   - Mantivemos o botão em estado desabilitado com animação de carregamento durante o período inicial
   - Implementamos ativação do botão após delay para garantir que dados estejam prontos
   - Adicionamos ID ao botão para facilitar depuração

4. **Redução de logs**:
   - Movemos logs de debug para um `useEffect` separado
   - Limitamos logs para execução apenas quando estados relevantes mudam

## Benefícios

1. **Performance melhorada**:
   - Eliminação do ciclo infinito de renderizações
   - Redução significativa do número de chamadas à API e operações de estado

2. **Estabilidade**:
   - Prevenção de travamentos causados por excesso de renderizações
   - Gestão adequada do ciclo de vida do componente

3. **Melhor experiência do usuário**:
   - Interface mais responsiva
   - Feedback visual apropriado do estado do botão

## Observações Adicionais

A solução mantém a funcionalidade original do botão de replicação enquanto resolve os problemas de performance. O botão ainda aparece quando há dados históricos disponíveis para replicação e o mês atual não tem dados próprios, mas agora sem causar loops de renderização.

# Correção do Loop Infinito no BudgetLayout

## Problema

O componente BudgetLayout estava causando um erro "Too many re-renders" (excesso de renderizações) devido a um problema com o estado do botão de replicação de dados. Esse erro ocorria porque a função `shouldShowReplicateButton` estava sendo chamada diretamente no corpo do componente durante cada renderização, criando um ciclo infinito.

## Solução Implementada

1. **Isolamento do cálculo de estado do botão**:
   - Adicionamos estados locais usando `useState` para controlar a visibilidade e ativação do botão
   - A função `shouldShowReplicateButton` agora só é chamada dentro de um `useEffect` controlado

2. **Controle de renderização com useEffect**:
   ```tsx
   useEffect(() => {
     if (dataFullyLoaded && !isLoadingData && shouldShowReplicateButton) {
       const shouldShow = shouldShowReplicateButton(mes, ano);
       setShouldShowButton(shouldShow);
       
       if (shouldShow) {
         setButtonEnabled(false);
         const timer = setTimeout(() => {
           setButtonEnabled(true);
         }, 5000);
         return () => clearTimeout(timer);
       }
     }
   }, [dataFullyLoaded, isLoadingData, shouldShowReplicateButton, mes, ano, lastSuccessfulLoad]);
   ```

3. **Feedback visual melhorado**:
   - O botão é mostrado inicialmente em estado desativado com um indicador de carregamento
   - Após 5 segundos, o botão é automaticamente ativado para interação
   - Estilos visuais diferentes para cada estado do botão

## Benefícios

1. **Eliminação do loop infinito de renderizações**:
   - O estado do botão agora é calculado de forma controlada dentro do `useEffect`
   - A atualização de estado só ocorre quando as dependências reais mudam

2. **Melhor experiência do usuário**:
   - Feedback visual imediato com o botão em estado de carregamento
   - Transição automática para o estado ativo após o tempo necessário

3. **Código mais robusto**:
   - Separação clara entre cálculo de estado e renderização
   - Prevenção de futuras recorrências do problema

Esta implementação resolve o problema enquanto mantém todas as funcionalidades originais do componente, melhorando ainda a experiência do usuário com um feedback visual mais claro durante o processo de carregamento.

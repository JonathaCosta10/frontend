# Detalhamento Técnico: Correção de Loops de Requisição e Token Refresh

## Visão Geral do Problema

A aplicação estava enfrentando dois problemas principais:

1. **Loops infinitos de requisições**:
   - O sistema continuava tentando fazer requisições mesmo após atingir o número máximo de tentativas
   - Eventos de refresh de token disparavam novas tentativas, criando um ciclo vicioso
   - As tentativas de recuperação após falhas geravam mais requisições

2. **Falhas no gerenciamento de estado**:
   - Flags conflitantes entre local state e localStorage
   - Falta de consistência entre contadores de retry em diferentes partes do código
   - Ausência de recuperação adequada do cache após falhas

## Análise das Causas Raiz

### 1. Problema de Limpeza de Flags

```typescript
// A flag retryAfterTokenRefresh era definida como true
setRetryAfterTokenRefresh(true);

// Mas em alguns casos, não era adequadamente limpa após o máximo de tentativas
if (currentRetries >= maxRetries) {
  // Código faltando: setRetryAfterTokenRefresh(false)
}
```

### 2. Falta de Detecção de Estados Inconsistentes

```typescript
// Verificava apenas hasCheckedBudgetData e isLoadingData, mas não o contador de retries
if (pathname === '/dashboard/orcamento' && !hasCheckedBudgetData && !isLoadingData) {
  checkBudgetData(currentYear);
}
```

### 3. Recuperação Inadequada de Cache

```typescript
// O código tentava usar o cache apenas no catch, mas não verificava adequadamente
// após atingir o número máximo de tentativas
try {
  response = await api.get(`/api/distribuicao_gastos?ano=${currentYear}`);
} catch (innerError) {
  data = DataCache.getBudgetData(currentYear);
  if (!data) {
    throw innerError;
  }
}
```

## Correções Detalhadas

### 1. Prevenção de Retries após Limite Máximo

Implementamos verificações de limite de tentativas em vários pontos:

```typescript
// No useEffect de retry após refresh de token
if (retryAfterTokenRefresh && pathname === '/dashboard/orcamento' && !isLoadingData) {
  const retryCountKey = 'errorRetryCount';
  const maxRetries = 3;
  const currentRetries = parseInt(localStorage.getItem(retryCountKey) || '0');
  
  if (currentRetries >= maxRetries) {
    console.log('⛔ [RETRY BLOCKED] Máximo de tentativas já atingido');
    setRetryAfterTokenRefresh(false);
    return;
  }
}
```

### 2. Detecção de Ciclos no useEffect Principal

```typescript
// Detectar ciclo de retentativas e evitar loops
const retryCount = parseInt(localStorage.getItem('errorRetryCount') || '0');
const maxRetries = 3;
if (retryCount >= maxRetries && pathname === '/dashboard/orcamento') {
  console.log('🛑 [CYCLE DETECTION] Possível loop detectado - evitando novas tentativas');
  setHasCheckedBudgetData(true);
  
  // Tentar usar dados de cache como último recurso
  const currentYear = localStorage.getItem('ano') || new Date().getFullYear().toString();
  const cachedData = DataCache.getBudgetData(currentYear);
  if (cachedData && !dataFullyLoaded) {
    // Usar cache como fallback
    setHistData(cachedData.hist_data || {});
    setMesesDisponiveis(cachedData.meses_disponveis || []);
    setDataFullyLoaded(true);
  }
  return;
}
```

### 3. Verificação de Dados Já Carregados

```typescript
// Verificar se dataFullyLoaded já foi estabelecido - evita retries desnecessários
if (dataFullyLoaded) {
  console.log('✅ [CUSTOM TOKEN REFRESH] Dados já carregados, ignorando retry');
  localStorage.removeItem('forceRetryAfterError');
  localStorage.setItem('errorRetryCount', '0');
  return false;
}
```

### 4. Melhoria na Recuperação de Cache em Situações de Erro

```typescript
if (currentRetries >= maxRetries) {
  // Tentar usar dados de cache
  const cachedData = DataCache.getBudgetData(currentYear);
  if (cachedData) {
    console.log('✅ [RETRY LIMIT] Usando dados de cache como fallback');
    // Processar dados do cache
    setHistData(cachedData.hist_data || {});
    setMesesDisponiveis(cachedData.meses_disponveis || []);
    setDataFullyLoaded(true);
    
    // Limpar flags para evitar novas tentativas
    localStorage.setItem(retryCountKey, '0');
    localStorage.removeItem('forceRetryAfterError');
    setRetryAfterTokenRefresh(false);
    setHasCheckedBudgetData(true);
    setIsLoadingData(false);
    
    return;
  }
}
```

### 5. Limpeza de Flags ao Mudar de Página

```typescript
if (pathname !== '/dashboard/orcamento' && dataFullyLoaded) {
  console.log('🔄 Saindo da página de orçamento - resetando dados');
  setDataFullyLoaded(false);
  setHasCheckedBudgetData(false);
  setButtonStateCache({}); // Limpar cache ao sair
  localStorage.setItem('errorRetryCount', '0'); // Reset contador ao sair da página
  localStorage.removeItem('forceRetryAfterError'); // Limpar flag ao sair da página
}
```

## Padrões de Design Adotados

1. **Circuit Breaker**: Interromper ciclos de requisição após determinado número de falhas
2. **Fallback Caching**: Usar cache como mecanismo de recuperação em caso de falhas
3. **Clean Exit**: Garantir limpeza adequada de estados ao sair de componentes
4. **State Reconciliation**: Garantir consistência entre localStorage e estados do React

## Fluxo de Execução Melhorado

1. Usuário acessa `/dashboard/orcamento`
2. Sistema tenta carregar dados
3. Se falhar, tenta novamente com limite máximo de tentativas
4. Após atingir o limite, usa dados em cache (se disponíveis)
5. Se não houver cache, mostra estado de erro ao usuário
6. Ao sair da página, todos os contadores e flags são resetados

## Estratégia de Recuperação

1. **Nível 1**: Retry imediato após token refresh
2. **Nível 2**: Retry com delay progressivo
3. **Nível 3**: Recuperação de cache local
4. **Nível 4**: Estado de erro com feedback ao usuário

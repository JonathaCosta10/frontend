# Relatório Técnico: Correção de Loops Infinitos em Refresh de Token

## Resumo Executivo

Esta documentação técnica detalha as modificações realizadas para resolver um problema crítico de desempenho na aplicação: loops infinitos de requisições causados por falhas no mecanismo de refresh de tokens e na estratégia de retry após erros. As alterações focaram em três componentes principais:

1. Sistema de controle de retentativas com limites rígidos
2. Mecanismo de timeout adaptativo para diferentes tipos de requisições
3. Aprimoramento do processamento de eventos de token refresh

## Diagnóstico do Problema

A análise dos logs de console revelou múltiplos problemas interconectados:

- **Loop de requisições**: Após um erro na API, o sistema tentava indefinidamente recarregar os dados
- **Timeout inadequado**: O tempo de espera era fixo e inadequado para operações críticas como refresh de token
- **Falta de limites**: Não havia limite para o número de tentativas consecutivas
- **Gestão de sinais**: Problemas com AbortSignal causavam erros "signal aborted" que não eram tratados corretamente
- **Eventos de refresh inconsistentes**: Os eventos de token refresh não eram sempre disparados corretamente

## Solução Técnica Detalhada

### 1. Controle de Retentativas (useTutorialManager.ts)

```typescript
// Sistema de limitação de retentativas para prevenir loops infinitos
const retryCountKey = 'errorRetryCount';
const maxRetries = 3;
const currentRetries = parseInt(localStorage.getItem(retryCountKey) || '0');

if (currentRetries >= maxRetries) {
  console.log('🛑 [RETRY LIMIT] Máximo de tentativas atingido:', {
    currentRetries,
    maxRetries,
    errorMessage: error.message
  });
  
  // Limpar flags para permitir nova tentativa após algum tempo
  localStorage.setItem(retryCountKey, '0');
  localStorage.removeItem('forceRetryAfterError');
  setRetryAfterTokenRefresh(false);
  
  // Marcar verificação como concluída para parar tentativas automáticas
  setHasCheckedBudgetData(true);
  setIsLoadingData(false);
  
  // Mostrar ao usuário que estamos tendo problemas
  setDataFullyLoaded(false); // Força o aplicativo a mostrar estado de erro
  
  return;
}
```

Este código implementa um sistema de contagem de retentativas armazenado no localStorage. Após atingir o limite configurado (3 tentativas), o sistema abandona as tentativas e limpa as flags para permitir novas tentativas apenas após um reset manual ou ao retornar à página.

### 2. Timeout Adaptativo (api.ts)

```typescript
// Gerenciamento de timeout adaptativo - mais tempo para requisições importantes
const timeoutDuration = isRefreshTokenRequest ? 30000 : 
                        endpoint.includes("/distribuicao_gastos") ? 25000 : 
                        endpoint.includes("/auth/") ? 20000 : 15000;

console.log(`⏱️ [REQUEST TIMEOUT] Configurando timeout para ${endpoint}:`, {
  duration: timeoutDuration,
  isRefresh: isRefreshTokenRequest,
  isAuth: includeAuth,
  endpoint
});
```

Esta melhoria configura tempos de timeout diferentes baseados no tipo de requisição:
- 30 segundos para refresh de token
- 25 segundos para carregamento de dados de orçamento
- 20 segundos para outras operações de autenticação
- 15 segundos para requisições gerais

### 3. Gerenciamento de Eventos de Refresh (api.ts)

```typescript
// CORREÇÃO CRÍTICA: Disparar eventos para notificar componentes do refresh
console.log("✅ Refresh do token bem-sucedido - emitindo eventos");

// Evento padrão
const tokenRefreshEvent = new CustomEvent('tokenRefreshed', { 
  detail: { 
    timestamp: new Date().toISOString(),
    success: true 
  } 
});
console.log("🚀 [TOKEN EVENT] Disparando evento tokenRefreshed:", tokenRefreshEvent.detail);
window.dispatchEvent(tokenRefreshEvent);

// Evento de autenticação
const authEvent = new CustomEvent('authTokenRefreshed', { 
  detail: { 
    timestamp: new Date().toISOString()
  } 
});
console.log("🚀 [TOKEN EVENT] Disparando evento authTokenRefreshed");
window.dispatchEvent(authEvent);

// Evento customizado para lógica de retry
if (window.handleTokenRefreshAndRetry && typeof window.handleTokenRefreshAndRetry === 'function') {
  console.log("🔄 [TOKEN EVENT] Chamando handler customizado");
  window.handleTokenRefreshAndRetry();
}
```

Este código garante que múltiplos eventos são disparados após um refresh de token bem-sucedido, permitindo que diferentes partes da aplicação reajam apropriadamente.

### 4. Gestão Robusta de Abort Controllers (api.ts)

```typescript
// Criando um novo AbortController para melhor gerenciamento de erros
const requestController = new AbortController();
const requestTimeout = setTimeout(() => {
  requestController.abort('timeout');
}, timeoutDuration);

// Sobrescrever o signal do config para usar o controller customizado
const requestConfig = {
  ...config,
  signal: requestController.signal
};

try {
  response = await fetch(normalizedUrl, requestConfig);
  clearTimeout(requestTimeout); // Limpar timeout se a resposta for recebida
  
  // ... resto do código ...
  
} catch (fetchError) {
  clearTimeout(requestTimeout);
  throw fetchError;
}
```

Esta implementação fornece um controle mais preciso sobre o timeout das requisições, assegurando que os timeouts são adequadamente limpos tanto em casos de sucesso quanto de erro.

## Benefícios das Mudanças

1. **Resiliência**: O sistema agora é resiliente a falhas temporárias de rede ou API
2. **Economia de recursos**: Redução significativa no número de requisições desnecessárias
3. **Experiência do usuário**: Melhor feedback ao usuário em caso de problemas persistentes
4. **Performance**: Menor sobrecarga no navegador devido à redução de requisições em loop
5. **Depuração**: Logs mais detalhados facilitam a identificação de problemas futuros

## Próximos Passos Recomendados

1. **Monitoramento**: Implementar um sistema de telemetria para rastrear erros e retries
2. **Melhorias na UI**: Adicionar feedback visual durante erros persistentes
3. **Estratégia de cache**: Aprimorar o sistema de cache para reduzir dependência de requisições constantes
4. **Testes automáticos**: Desenvolver testes que simulam falhas de rede para validar a robustez das correções

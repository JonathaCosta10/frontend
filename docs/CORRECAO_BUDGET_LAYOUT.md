# CORRECAO_BUDGET_LAYOUT.md

## Correção do Loop Infinito na Página de Orçamento

Este arquivo documenta as alterações realizadas para resolver o problema de chamadas API repetitivas e loops infinitos na página de orçamento, especificamente relacionados ao botão "Replicar Dados".

### Problemas Identificados

1. **Loop de renderização**: O componente BudgetLayout estava fazendo chamadas repetitivas à API sem necessidade devido a uma lógica de reenderização ineficiente.
2. **Botão de replicação em loop**: O botão de replicação estava sendo recalculado frequentemente, causando estados inconsistentes.
3. **Falta de cache eficiente**: A lógica de cache não estava considerando todos os fatores relevantes.
4. **Conflito entre tutorial e botão de replicação**: Ambos podiam aparecer ao mesmo tempo em alguns cenários.

### Correções Implementadas

#### 1. Otimização do hook useEffect

- Redução das dependências para evitar re-renderizações desnecessárias
- Adição de uma saída antecipada (early return) quando não há meses disponíveis
- Melhoria na lógica de cache para incluir o número de meses disponíveis na chave de cache

```typescript
// Chave de cache otimizada
const cacheKey = `btn-${mes}-${ano}-${mesesDisponiveis?.length || 0}-${lastSuccessfulLoad}`;
```

#### 2. Lógica simplificada para mostrar o botão de replicação

Implementamos uma lógica mais clara e direta para determinar quando o botão de replicação deve ser mostrado:

```typescript
// Verificar se o mês selecionado é atual ou futuro
const isCurrentOrFuture = (Number(ano) > Number(currentYear)) || 
                          (ano === currentYear && Number(mes) >= Number(currentMonth));

// Verificar se o mês selecionado NÃO tem dados
const monthHasNoData = !mesesDisponiveis.includes(mes);

// Verificar se existe pelo menos um mês anterior disponível para replicação
const hasAvailableSourceMonth = mesesDisponiveis.length > 0;

// Mostrar botão somente se todas as condições forem atendidas
const shouldShow = isCurrentOrFuture && monthHasNoData && hasAvailableSourceMonth && !!histData;
```

#### 3. Exclusividade entre tutorial e botão de replicação

Garantimos que o botão de replicação e o tutorial nunca apareçam simultaneamente:

```typescript
{shouldShowButton && buttonEnabled && !showSetupTutorial && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => {
      setShowReplicateModal(true);
    }}
    className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
    id="botao-replicar-dados"
  >
    <Copy className="h-4 w-4 mr-2" />
    {t("replicate_data")}
  </Button>
)}
```

#### 4. Redução de logs e operações de debug

Limitamos os logs apenas para quando o debug estiver explicitamente ativado:

```typescript
// Verificar se debug está habilitado (pode ser controlado via localStorage)
const isDebugEnabled = localStorage.getItem('debug_budget_layout') === 'true';
```

#### 5. Melhoria no componente de replicação

Adicionamos parâmetros explícitos para mês e ano de destino na replicação de dados:

```typescript
const response = await api.post('/api/orcamento/replica', {
  replicar_entradas: selectedOptions.entradas,
  replicar_gastos: selectedOptions.gastos,
  replicar_dividas: selectedOptions.dividas,
  mes_origem: histData.ultimo_registro_mes,
  ano_origem: histData.ultimo_registro_ano,
  mes_destino: targetMonth,
  ano_destino: targetYear
});
```

### Benefícios das Correções

1. **Redução de chamadas à API**: As chamadas agora são feitas apenas quando necessário
2. **Melhor experiência do usuário**: Botões e componentes aparecem de forma mais consistente
3. **Economia de recursos**: Menor carga no servidor e no navegador do usuário
4. **Maior clareza de código**: Lógica mais explícita e direta para mostrar componentes
5. **Cache eficiente**: Sistema de cache mais inteligente que considera todos os fatores relevantes

### Compatibilidade

Todas as alterações mantêm compatibilidade com a estrutura existente do projeto e respeitam o fluxo de dados já implementado. Não foram feitas mudanças significativas em como as APIs são tratadas.
